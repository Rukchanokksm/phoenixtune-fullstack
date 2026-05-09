import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { AdUnit } from '@/components/ads/AdUnit'

const POST_SELECT = `
  id, title, category, upvotes, comment_count, created_at, updated_at,
  game:games!forum_posts_game_id_fkey(name, slug),
  user:user_profiles!forum_posts_user_id_fkey(username)
`

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'เมื่อกี้'
  if (m < 60) return `${m} นาทีที่แล้ว`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} วันที่แล้ว`
  return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
}

type Post = {
  id: string; title: string; category: string; upvotes: number; comment_count: number
  created_at: string; updated_at: string
  game: { name: string; slug: string } | null
  user: { username: string } | null
}

function PostRow({ post }: { post: Post }) {
  return (
    <Link href={`/forums/${post.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '13px 20px', borderTop: '1px solid #1a1d24',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {post.title}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '3px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', fontSize: '12px' }}>@{post.user?.username ?? '—'}</span>
            {post.game && (
              <span style={{ color: '#60a5fa', fontSize: '11px', background: 'rgba(96,165,250,0.08)',
                padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                {post.game.name}
              </span>
            )}
            <span style={{ color: '#374151', fontSize: '11px' }}>{timeAgo(post.updated_at)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexShrink: 0 }}>
          <span style={{ color: '#475569', fontSize: '12px' }}>{post.comment_count} ความคิดเห็น</span>
          <span style={{ color: '#64748b', fontSize: '12px' }}>▲ {post.upvotes}</span>
        </div>
      </div>
    </Link>
  )
}

function SegmentCard({ title, sub, href, adminLink, children }: {
  title: string; sub: string; href: string; adminLink?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid #1a1d24' }}>
        <div>
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '15px' }}>{title}</span>
          <span style={{ color: '#475569', fontSize: '12px', marginLeft: '10px' }}>{sub}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {adminLink}
          <Link href={href} style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none' }}>ดูทั้งหมด</Link>
        </div>
      </div>
      {children}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: '32px 20px', color: '#374151', fontSize: '13px', textAlign: 'center' }}>
      {text}
    </div>
  )
}

export default async function ForumsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase.from('user_profiles').select('role').eq('id', user.id).single()
    : { data: null }
  const isAdmin = (profile as { role?: string } | null)?.role === 'admin'

  const [
    { data: announcements },
    { data: generalPosts },
    { data: reportPosts },
  ] = await Promise.all([
    supabase.from('forum_posts').select(POST_SELECT)
      .eq('category', 'announcement').order('created_at', { ascending: false }).limit(10),
    supabase.from('forum_posts').select(POST_SELECT)
      .eq('category', 'general').order('updated_at', { ascending: false }).limit(5),
    supabase.from('forum_posts').select(POST_SELECT)
      .eq('category', 'report').order('updated_at', { ascending: false }).limit(5),
  ])

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px', color: '#e2e8f0' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800 }}>Forums</h1>
          <p style={{ margin: 0, color: '#475569', fontSize: '13px' }}>พื้นที่พูดคุยสำหรับชุมชน PeonixTune</p>
        </div>
        {user && (
          <Link href="/forums/new" style={{
            padding: '10px 22px', borderRadius: '8px', background: '#6366f1',
            color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none',
          }}>
            สร้าง Post
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Segment 1: Announcements (admin-only posts) */}
        <SegmentCard
          title="ประกาศ"
          sub="ข้อมูลสำคัญจากทีมงาน"
          href="/forums/announcements"
          adminLink={isAdmin ? (
            <Link href="/forums/new?category=announcement"
              style={{ color: '#6366f1', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>
              + เพิ่มประกาศ
            </Link>
          ) : undefined}
        >
          {!announcements?.length
            ? <EmptyState text="ยังไม่มีประกาศ" />
            : (announcements as unknown as Post[]).map(p => <PostRow key={p.id} post={p} />)
          }
        </SegmentCard>

        <AdUnit slot="forums-hub-banner" format="horizontal" />

        {/* Segment 2: General Discussion */}
        <SegmentCard title="พูดคุยทั่วไป" sub="5 กระทู้ล่าสุด" href="/forums/general">
          {!generalPosts?.length
            ? <EmptyState text="ยังไม่มีกระทู้ — เป็นคนแรกที่เริ่มพูดคุย" />
            : (generalPosts as unknown as Post[]).map(p => <PostRow key={p.id} post={p} />)
          }
        </SegmentCard>

        {/* Segment 3: Problems & Reports */}
        <SegmentCard
          title="ปัญหาและรายงาน"
          sub="bug, ปัญหาการใช้งาน, รายงานเนื้อหาไม่เหมาะสม"
          href="/forums/reports"
        >
          {!reportPosts?.length
            ? <EmptyState text="ไม่มีรายงานที่ค้างอยู่" />
            : (reportPosts as unknown as Post[]).map(p => <PostRow key={p.id} post={p} />)
          }
        </SegmentCard>

      </div>
    </div>
  )
}
