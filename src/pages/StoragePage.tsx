import { useState, useEffect, useCallback } from 'react';
import { getMyStorageItems, getSignedUrl, deleteStorageItem } from '../lib/storage';
import PageLoading from '../components/PageLoading';

interface StorageItem {
  id: string;
  storage_path: string;
  file_type: string;
  file_size: number | null;
  original_name: string | null;
  created_at: string;
}

export default function StoragePage() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<StorageItem | null>(null);
  const [previewItem, setPreviewItem] = useState<StorageItem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const minDelay = new Promise(r => setTimeout(r, 600));
    try {
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('요청 시간 초과')), 8000));
      const data = await Promise.race([getMyStorageItems(), timeout]) as StorageItem[];
      setItems(data);
      const urlMap: Record<string, string> = {};
      await Promise.all(
        data.map(async (item: StorageItem) => {
          try {
            urlMap[item.id] = await getSignedUrl(item.storage_path);
          } catch {}
        })
      );
      setSignedUrls(urlMap);
    } catch (err) {
      console.error('[StoragePage] load error:', err);
    } finally {
      await minDelay;
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    (window as any).reloadStoragePage = load;
    return () => { delete (window as any).reloadStoragePage; };
  }, [load]);

  const handleDeleteConfirm = async () => {
    if (!confirmItem) return;
    const item = confirmItem;
    setConfirmItem(null);
    setDeleting(item.id);
    try {
      await deleteStorageItem(item.id, item.storage_path);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } finally {
      setDeleting(null);
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });

  if (loading) return <PageLoading />;

  return (
    <>
    {previewItem && (() => {
      const url = signedUrls[previewItem.id];
      const isVideo = previewItem.file_type.startsWith('video/');
      return (
        <div
          className="image-modal-overlay"
          onClick={() => setPreviewItem(null)}
          style={{ justifyContent: 'center', alignItems: 'center' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', maxWidth: '90vw', maxHeight: '90vh', background: 'var(--surface-color)', borderRadius: 16, overflow: 'hidden' }}
          >
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ minWidth: 0, marginTop: 20, marginLeft: 20 }}>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{previewItem.original_name || previewItem.id}</p>
                <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>{formatSize(previewItem.file_size)} · {formatDate(previewItem.created_at)}</p>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                style={{ background: 'var(--input-bg)', border: 'none', borderRadius: '50%', width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <div style={{ background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {url ? (
                isVideo
                  ? <video src={url} style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} controls autoPlay loop playsInline />
                  : <img src={url} alt={previewItem.original_name || ''} style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} />
              ) : (
                <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3 }}>{isVideo ? 'videocam' : 'image'}</span>
                </div>
              )}
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {url && (
                <a href={url} download={previewItem.original_name || 'file'} style={{ background: 'var(--input-bg)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                  다운로드
                </a>
              )}
              <button
                onClick={() => { setPreviewItem(null); setConfirmItem(previewItem); }}
                style={{ background: 'rgba(229,57,53,0.12)', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500, color: 'var(--color-danger, #e53935)' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                삭제
              </button>
            </div>
          </div>
        </div>
      );
    })()}
    {confirmItem && (
      <div className="image-modal-overlay" onClick={() => setConfirmItem(null)} style={{ justifyContent: 'center' }}>
        <div className="image-modal-content" onClick={e => e.stopPropagation()} style={{ minWidth: 300, maxWidth: 400, width: '90%' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 16 }}>파일 삭제</p>
          <p style={{ margin: '0 0 24px', color: 'var(--text-secondary)', fontSize: 14 }}>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
              {confirmItem.original_name || confirmItem.id}
            </span>
            을(를) 삭제하시겠습니까?
          </p>
          <div className="rename-actions">
            <button onClick={() => setConfirmItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
              취소
            </button>
            <button className="primary-btn" onClick={handleDeleteConfirm} style={{ background: 'var(--color-danger, #e53935)', fontSize: 14 }}>
              삭제
            </button>
          </div>
        </div>
      </div>
    )}
    <div style={{ width: '100%', height: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>내 스토리지</h2>
        <span style={styles.count}>{items.length}개</span>
      </div>

      {items.length === 0 ? (
        <div style={styles.center}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3 }}>photo_library</span>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>생성된 콘텐츠가 없습니다.</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>이미지 또는 영상을 생성하면 자동으로 저장됩니다.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {items.map(item => {
            const url = signedUrls[item.id];
            const isVideo = item.file_type.startsWith('video/');
            return (
              <div
                key={item.id}
                style={{
                  ...styles.card,
                  transform: hoveredId === item.id ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredId === item.id ? '0 10px 20px rgba(0,0,0,0.1)' : 'none',
                  transition: 'transform 0.2s ease-out, box-shadow 0.2s ease-out',
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div style={{ ...styles.preview, cursor: 'pointer' }} onClick={() => setPreviewItem(item)}>
                  {url ? (
                    isVideo
                      ? <video src={url} style={styles.media} muted autoPlay loop playsInline />
                      : <img src={url} alt={item.original_name || ''} style={styles.media} />
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.3 }}>
                      {isVideo ? 'videocam' : 'image'}
                    </span>
                  )}
                </div>
                <div style={styles.info}>
                  <p style={styles.name} title={item.original_name || ''}>
                    {item.original_name || item.id.slice(0, 12)}
                  </p>
                  <p style={styles.meta}>{formatSize(item.file_size)} · {formatDate(item.created_at)}</p>
                </div>
                <div style={{
                  ...styles.actions,
                  opacity: hoveredId === item.id ? 1 : 0,
                  transition: 'opacity 0.15s ease-out',
                }}>
                  {url ? (
                    <a href={url} download={item.original_name || 'file'} style={styles.actionBtn}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>download</span>
                      <span>다운로드</span>
                    </a>
                  ) : (
                    <div style={{ ...styles.actionBtn, pointerEvents: 'none', opacity: 0.4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 15 }}>download</span>
                      <span>다운로드</span>
                    </div>
                  )}
                  <button
                    onClick={() => setConfirmItem(item)}
                    disabled={deleting === item.id}
                    style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
                    <span>삭제</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100%' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  title: { margin: 0, fontSize: 20, fontWeight: 600 },
  count: { fontSize: 13, color: 'var(--text-secondary)', background: 'var(--input-bg)', padding: '2px 8px', borderRadius: 12 },
  center: { width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, padding: '4px 4px 20px' },
  card: { background: 'var(--surface-color)', borderRadius: 12 },
  preview: { width: '100%', aspectRatio: '1', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '12px 12px 0 0' },
  media: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { padding: '10px 12px 4px' },
  name: { margin: 0, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta: { margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' },
  actions: { display: 'flex', gap: 6, padding: '8px 10px 10px' },
  actionBtn: { flex: 1, background: 'var(--input-bg, var(--bg-secondary))', border: 'none', borderRadius: 8, cursor: 'pointer', padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' },
  actionBtnDanger: { background: 'rgba(229,57,53,0.12)', color: 'var(--color-danger, #e53935)' },
};
