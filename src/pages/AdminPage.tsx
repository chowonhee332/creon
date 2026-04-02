import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  role: string;
  is_blocked: boolean;
  created_at: string;
}

interface UsageStat {
  date: string;
  count: number;
}

interface UserStat {
  email: string;
  count: number;
}

type Tab = 'overview' | 'users' | 'content';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('overview');

  // Overview
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dailyStats, setDailyStats] = useState<UsageStat[]>([]);
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [typeStats, setTypeStats] = useState<{ type: string; count: number }[]>([]);

  // Users
  const [users, setUsers] = useState<Profile[]>([]);
  const [blockingId, setBlockingId] = useState<string | null>(null);

  // Content
  const [allContent, setAllContent] = useState<any[]>([]);
  const [contentUrls, setContentUrls] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setIsAdmin(data?.role === 'admin');
    })();
  }, []);

  const loadOverview = useCallback(async () => {
    // 총 생성 건수
    const { count: genCount } = await supabase.from('generations').select('*', { count: 'exact', head: true });
    setTotalGenerations(genCount ?? 0);

    // 총 사용자 수
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    setTotalUsers(userCount ?? 0);

    // 최근 14일 일별 생성 건수
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: genData } = await supabase
      .from('generations')
      .select('created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    const dayMap: Record<string, number> = {};
    (genData ?? []).forEach(g => {
      const day = g.created_at.slice(0, 10);
      dayMap[day] = (dayMap[day] ?? 0) + 1;
    });
    setDailyStats(Object.entries(dayMap).map(([date, count]) => ({ date, count })));

    // 사용자별 생성 건수 Top 10
    const { data: allGen } = await supabase.from('generations').select('user_id');
    const { data: profileList } = await supabase.from('profiles').select('id, email');
    const profileMap: Record<string, string> = {};
    (profileList ?? []).forEach((p: any) => { profileMap[p.id] = p.email; });
    const emailMap: Record<string, number> = {};
    (allGen ?? []).forEach((g: any) => {
      const email = profileMap[g.user_id] || g.user_id;
      emailMap[email] = (emailMap[email] ?? 0) + 1;
    });
    const sorted = Object.entries(emailMap)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    setUserStats(sorted);

    // 타입별 통계
    const { data: typeData } = await supabase
      .from('generations')
      .select('type');
    const typeMap: Record<string, number> = {};
    (typeData ?? []).forEach((g: any) => { typeMap[g.type] = (typeMap[g.type] ?? 0) + 1; });
    setTypeStats(Object.entries(typeMap).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count));
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data ?? []);
  }, []);

  const loadContent = useCallback(async () => {
    const { data } = await supabase
      .from('storage_items')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false })
      .limit(50);
    setAllContent(data ?? []);

    const urlMap: Record<string, string> = {};
    await Promise.all(
      (data ?? []).map(async (item: any) => {
        try {
          const { data: signed } = await supabase.storage
            .from('generations')
            .createSignedUrl(item.storage_path, 3600);
          if (signed) urlMap[item.id] = signed.signedUrl;
        } catch {}
      })
    );
    setContentUrls(urlMap);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    Promise.all([loadOverview(), loadUsers(), loadContent()]).finally(() => setLoading(false));
  }, [isAdmin, loadOverview, loadUsers, loadContent]);

  const toggleBlock = async (user: Profile) => {
    setBlockingId(user.id);
    try {
      const newVal = !user.is_blocked;
      await supabase.from('profiles').update({ is_blocked: newVal }).eq('id', user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_blocked: newVal } : u));
    } finally {
      setBlockingId(null);
    }
  };

  const setAdminRole = async (user: Profile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`${user.email}을 ${newRole === 'admin' ? '관리자' : '일반 사용자'}로 변경하시겠습니까?`)) return;
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
  };

  const maxDaily = Math.max(...dailyStats.map(d => d.count), 1);

  if (isAdmin === null || loading) return (
    <div style={styles.center}>
      <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.4 }}>hourglass_empty</span>
      <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>불러오는 중...</p>
    </div>
  );

  if (!isAdmin) return (
    <div style={styles.center}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.3 }}>lock</span>
      <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>접근 권한이 없습니다.</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>관리자 계정으로 로그인하세요.</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>어드민 대시보드</h2>
      </div>

      {/* 탭 */}
      <div style={styles.tabs}>
        {(['overview', 'users', 'content'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {{ overview: '개요', users: '사용자', content: '콘텐츠' }[t]}
          </button>
        ))}
      </div>

      {/* 개요 탭 */}
      {tab === 'overview' && (
        <div>
          {/* 요약 카드 */}
          <div style={styles.statRow}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>총 생성 건수</p>
              <p style={styles.statValue}>{totalGenerations.toLocaleString()}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>총 사용자</p>
              <p style={styles.statValue}>{totalUsers.toLocaleString()}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>금일 생성</p>
              <p style={styles.statValue}>
                {dailyStats.find(d => d.date === new Date().toISOString().slice(0, 10))?.count ?? 0}
              </p>
            </div>
          </div>

          {/* 일별 차트 */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>최근 14일 생성 건수</h3>
            <div style={styles.chart}>
              {dailyStats.length === 0
                ? <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>데이터 없음</p>
                : dailyStats.map(d => (
                  <div key={d.date} style={styles.barWrap}>
                    <div style={{ ...styles.bar, height: `${(d.count / maxDaily) * 80}px` }} title={`${d.date}: ${d.count}건`} />
                    <span style={styles.barLabel}>{d.date.slice(5)}</span>
                    <span style={styles.barCount}>{d.count}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* 타입별 통계 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>타입별 생성 건수</h3>
              <table style={styles.table}>
                <tbody>
                  {typeStats.map(t => (
                    <tr key={t.type}>
                      <td style={styles.td}>{t.type}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>{t.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>사용자별 생성 건수 Top 10</h3>
              <table style={styles.table}>
                <tbody>
                  {userStats.map(u => (
                    <tr key={u.email}>
                      <td style={{ ...styles.td, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>{u.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 사용자 탭 */}
      {tab === 'users' && (
        <div style={styles.section}>
          <table style={{ ...styles.table, width: '100%' }}>
            <thead>
              <tr>
                <th style={styles.th}>이메일</th>
                <th style={styles.th}>역할</th>
                <th style={styles.th}>가입일</th>
                <th style={styles.th}>상태</th>
                <th style={styles.th}>관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={u.is_blocked ? { opacity: 0.5 } : {}}>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: u.role === 'admin' ? '#1565c0' : 'var(--input-bg)' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(u.created_at).toLocaleDateString('ko-KR')}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: u.is_blocked ? '#c62828' : '#2e7d32', color: 'white' }}>
                      {u.is_blocked ? '차단됨' : '정상'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => toggleBlock(u)}
                        disabled={blockingId === u.id}
                        style={styles.actionBtn}
                      >
                        {u.is_blocked ? '차단 해제' : '차단'}
                      </button>
                      <button onClick={() => setAdminRole(u)} style={styles.actionBtn}>
                        {u.role === 'admin' ? '권한 취소' : '관리자 지정'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 콘텐츠 탭 */}
      {tab === 'content' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>최근 50건</p>
          <div style={styles.contentGrid}>
            {allContent.map((item: any) => {
              const url = contentUrls[item.id];
              const isVideo = item.file_type?.startsWith('video/');
              return (
                <div key={item.id} style={styles.contentCard}>
                  <div style={styles.contentPreview}>
                    {url
                      ? isVideo
                        ? <video src={url} style={styles.media} muted autoPlay loop playsInline />
                        : <img src={url} alt="" style={styles.media} />
                      : <span className="material-symbols-outlined" style={{ fontSize: 32, opacity: 0.3 }}>{isVideo ? 'videocam' : 'image'}</span>
                    }
                  </div>
                  <div style={{ padding: '8px 10px' }}>
                    <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.profiles?.email || '-'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-secondary)' }}>
                      {new Date(item.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px', maxWidth: 1200, margin: '0 auto' },
  header: { marginBottom: 24 },
  title: { margin: 0, fontSize: 20, fontWeight: 600 },
  tabs: { display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border-color)' },
  tab: { padding: '10px 20px', fontSize: 14, fontWeight: 400, background: 'none', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text-secondary)', cursor: 'pointer' },
  tabActive: { fontWeight: 600, borderBottomColor: 'var(--accent-color, #2962FF)', color: 'var(--accent-color, #2962FF)' },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 },
  statCard: { background: 'var(--input-bg)', borderRadius: 12, padding: '20px 24px', border: '1px solid var(--border-color)' },
  statLabel: { margin: 0, fontSize: 13, color: 'var(--text-secondary)' },
  statValue: { margin: '8px 0 0', fontSize: 28, fontWeight: 700 },
  section: { background: 'var(--input-bg)', borderRadius: 12, padding: '20px 24px', border: '1px solid var(--border-color)' },
  sectionTitle: { margin: '0 0 16px', fontSize: 14, fontWeight: 600 },
  chart: { display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 },
  barWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 },
  bar: { width: '100%', background: 'var(--accent-color, #2962FF)', borderRadius: '4px 4px 0 0', minHeight: 2, transition: 'height 0.3s' },
  barLabel: { fontSize: 10, color: 'var(--text-secondary)', writingMode: 'vertical-rl', textOrientation: 'mixed' },
  barCount: { fontSize: 10, color: 'var(--text-secondary)' },
  table: { borderCollapse: 'collapse', width: '100%' },
  th: { padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' },
  td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--border-color)' },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 500, color: 'var(--text-primary)' },
  actionBtn: { padding: '4px 10px', fontSize: 12, background: 'none', border: '1px solid var(--border-color)', borderRadius: 6, cursor: 'pointer', color: 'var(--text-primary)' },
  contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 },
  contentCard: { background: 'var(--input-bg)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border-color)' },
  contentPreview: { width: '100%', aspectRatio: '1', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  media: { width: '100%', height: '100%', objectFit: 'cover' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 4 },
};
