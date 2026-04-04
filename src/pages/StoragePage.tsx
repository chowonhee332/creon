import { useState, useEffect, useCallback } from 'react';
import { getMyStorageItems, getSignedUrl, deleteStorageItem } from '../lib/storage';

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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('요청 시간 초과')), 8000));
      const data = await Promise.race([getMyStorageItems(), timeout]) as StorageItem[];
      setItems(data);
      // signed URL 일괄 조회
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
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    (window as any).reloadStoragePage = load;
    return () => { delete (window as any).reloadStoragePage; };
  }, [load]);

  const handleDelete = async (item: StorageItem) => {
    if (!confirm(`"${item.original_name || item.id}" 을 삭제하시겠습니까?`)) return;
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

  if (loading) return (
    <div style={styles.center}>
      <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.4 }}>hourglass_empty</span>
      <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>불러오는 중...</p>
    </div>
  );

  return (
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
              <div key={item.id} style={styles.card}>
                <div style={styles.preview}>
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
                <div style={styles.actions}>
                  {url && (
                    <a href={url} download={item.original_name || 'file'} style={styles.iconBtn} title="다운로드">
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deleting === item.id}
                    style={{ ...styles.iconBtn, color: '#e53935' }}
                    title="삭제"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  title: { margin: 0, fontSize: 20, fontWeight: 600 },
  count: { fontSize: 13, color: 'var(--text-secondary)', background: 'var(--input-bg)', padding: '2px 8px', borderRadius: 12 },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 4 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  card: { background: 'var(--card-bg, var(--input-bg))', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-color)' },
  preview: { width: '100%', aspectRatio: '1', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  media: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { padding: '10px 12px 4px' },
  name: { margin: 0, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  meta: { margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 4, padding: '4px 8px 8px' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none' },
};
