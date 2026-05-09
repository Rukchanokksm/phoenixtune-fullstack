import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const POST_SELECT = `
  id, title, upvotes, comment_count, created_at, updated_at,
  user:user_profiles!forum_posts_user_id_fkey(username)
`

type Post = {
  id: string; title: string; upvotes: number; comment_count: number
  created_at: string; updated_at: string
  user: { username: string } | null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'เมื่อกี้'
  if (m < 60) return `${m} นาทีที่แล้ว`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`
  const d = Math.floor(h / 24)
  return d < 30 ? `${d} วันที่แล้ว`
    : new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default async function AnnouncementsPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('forum_posts')
    .select(POST_SELECT)
    .eq('category', 'announcement')
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('user_profiles').select('role').eq('id', user.id).single()
    : { data: null }
  const isAdmin = (profile as { role?: string } | null)?.role === 'admin'

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px', color: '#e2e8f0' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <Link href="/forums" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Forums</Link>
        <span style={{ color: '#334155' }}>›</span>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>ประกาศ</h1>
        {isAdmin && (
          <div style={{ marginLeft: 'auto' }}>
            <Link href="/forums/new?category=announcement" style={{ padding: '8px 16px', borderRadius: '7px', background: '#6366f1',
              color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              เพิ่มประกาศ
            </Link>
          </div>
        )}
      </div>

      <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #1a1d24' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ประกาศทั้งหมด
          </span>
        </div>

        {!posts?.length ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#374151', fontSize: '13px' }}>
            ยังไม่มีประกาศ
          </div>
        ) : (
          (posts as unknown as Post[]).map(p => (
            <Link key={p.id} href={`/forums/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '13px 20px', borderTop: '1px solid #1a1d24' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 500,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.title}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '3px', alignItems: 'center' }}>
                    <span style={{ color: '#475569', fontSize: '12px' }}>@{p.user?.username ?? '—'}</span>
                    <span style={{ color: '#374151', fontSize: '11px' }}>{timeAgo(p.created_at)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
                  <span style={{ color: '#475569', fontSize: '12px' }}>{p.comment_count} ความคิดเห็น</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
