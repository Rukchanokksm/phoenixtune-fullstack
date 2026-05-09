'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { AdUnit } from '@/components/ads/AdUnit'

type Post = {
  id: string; title: string; body: string; category: string
  upvotes: number; comment_count: number; created_at: string; updated_at: string
  game: { id: string; name: string; slug: string } | null
  user: { id: string; username: string } | null
}
type Comment = {
  id: string; body: string; created_at: string
  user: { id: string; username: string } | null
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

export default function ForumPostPage() {
  const { postId } = useParams<{ postId: string }>()
  const router = useRouter()

  const [post,     setPost]     = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [me,       setMe]       = useState<{ id: string } | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  const fetchPost = useCallback(async () => {
    const res = await fetch(`/api/forum/posts/${postId}`)
    if (!res.ok) { setLoading(false); return }
    const data = await res.json()
    setPost(data)
    setLoading(false)
  }, [postId])

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/forum/comments?postId=${postId}`)
    if (res.ok) {
      const data = await res.json()
      setComments(data.data ?? [])
    }
  }, [postId])

  useEffect(() => {
    fetchPost()
    fetchComments()
    // Get current user
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => setMe(d?.user ?? null)).catch(() => {})
  }, [fetchPost, fetchComments])

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!newComment.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, body: newComment.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'เกิดข้อผิดพลาด'); return }
      setNewComment('')
      await fetchComments()
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteComment(id: string) {
    await fetch(`/api/forum/comments?id=${id}`, { method: 'DELETE' })
    setComments(prev => prev.filter(c => c.id !== id))
  }

  async function deletePost() {
    if (!confirm('ลบ post นี้?')) return
    const res = await fetch(`/api/forum/posts/${postId}`, { method: 'DELETE' })
    if (res.ok) router.push('/forums')
  }

  const categoryLabel: Record<string, string> = {
    general: 'ทั่วไป', report: 'รายงาน', announcement: 'ประกาศ',
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', padding: '24px 28px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ height: '18px', width: '50px', borderRadius: '4px', background: '#1e2130' }} />
            <div style={{ height: '18px', width: '80px', borderRadius: '4px', background: '#161820' }} />
          </div>
          <div style={{ height: '22px', borderRadius: '5px', background: '#1e2130', marginBottom: '8px', width: '75%' }} />
          <div style={{ height: '22px', borderRadius: '5px', background: '#1a1d24', marginBottom: '20px', width: '50%' }} />
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ height: '13px', width: '80px', borderRadius: '4px', background: '#161820' }} />
            <div style={{ height: '13px', width: '60px', borderRadius: '4px', background: '#161820' }} />
          </div>
          {[100, 90, 95, 70].map((w, i) => (
            <div key={i} style={{ height: '14px', borderRadius: '4px', background: '#161820', marginBottom: '10px', width: `${w}%` }} />
          ))}
        </div>
        <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 24px', borderBottom: '1px solid #1a1d24' }}>
            <div style={{ height: '12px', width: '100px', borderRadius: '4px', background: '#1e2130' }} />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ padding: '16px 24px', borderBottom: '1px solid #0d0f14', opacity: 1 - i * 0.25 }}>
              <div style={{ height: '13px', width: '100px', borderRadius: '4px', background: '#1e2130', marginBottom: '8px' }} />
              <div style={{ height: '14px', borderRadius: '4px', background: '#161820', marginBottom: '6px', width: '85%' }} />
              <div style={{ height: '14px', borderRadius: '4px', background: '#161820', width: '60%' }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: '#374151' }}>
        ไม่พบ post นี้
      </div>
    )
  }

  const isOwner = me && post.user?.id === me.id

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px 80px', color: '#e2e8f0' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Link href="/forums" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Forums</Link>
        <span style={{ color: '#334155' }}>›</span>
        <Link
          href={post.category === 'report' ? '/forums/reports' : post.category === 'announcement' ? '/forums/announcements' : '/forums/general'}
          style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}
        >
          {categoryLabel[post.category] ?? post.category}
        </Link>
      </div>

      {/* Post */}
      <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '24px 28px' }}>

          {/* Tags row */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, background: '#1a1d24', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {categoryLabel[post.category] ?? post.category}
            </span>
            {post.game && (
              <span style={{ color: '#60a5fa', fontSize: '11px', background: 'rgba(96,165,250,0.08)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                {post.game.name}
              </span>
            )}
          </div>

          <h1 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 800, lineHeight: 1.3, color: '#f1f5f9' }}>
            {post.title}
          </h1>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            {post.user ? (
              <Link href={`/profile/${post.user.username}`} style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>
                @{post.user.username}
              </Link>
            ) : (
              <span style={{ color: '#475569', fontSize: '13px' }}>—</span>
            )}
            <span style={{ color: '#1e2130' }}>·</span>
            <span style={{ color: '#374151', fontSize: '12px' }}>{timeAgo(post.created_at)}</span>
            <span style={{ color: '#1e2130' }}>·</span>
            <span style={{ color: '#374151', fontSize: '12px' }}>▲ {post.upvotes}</span>
          </div>

          <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.75', whiteSpace: 'pre-wrap' }}>
            {post.body}
          </div>
        </div>

        {isOwner && (
          <div style={{ padding: '12px 28px', borderTop: '1px solid #1a1d24', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={deletePost}
              style={{ padding: '6px 14px', borderRadius: '6px', background: 'transparent', border: '1px solid #3b1a1a', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}
            >
              ลบ post
            </button>
          </div>
        )}
      </div>

      <AdUnit slot="forum-post-banner" format="horizontal" style={{ margin: '0 0 20px' }} />

      {/* Comments */}
      <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #1a1d24' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ความคิดเห็น ({comments.length})
          </span>
        </div>

        {comments.length === 0 ? (
          <div style={{ padding: '32px 24px', color: '#374151', fontSize: '13px', textAlign: 'center' }}>
            ยังไม่มีความคิดเห็น — เป็นคนแรก
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{ padding: '16px 24px', borderBottom: '1px solid #0d0f14', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  {c.user ? (
                    <Link href={`/profile/${c.user.username}`} style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                      @{c.user.username}
                    </Link>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 600 }}>—</span>
                  )}
                  <span style={{ color: '#374151', fontSize: '11px' }}>{timeAgo(c.created_at)}</span>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>
                  {c.body}
                </div>
              </div>
              {me && c.user?.id === me.id && (
                <button
                  onClick={() => deleteComment(c.id)}
                  style={{ flexShrink: 0, background: 'transparent', border: 'none', color: '#374151', fontSize: '12px', cursor: 'pointer', padding: '2px 6px' }}
                  title="ลบ"
                >
                  ลบ
                </button>
              )}
            </div>
          ))
        )}

        {/* Add comment */}
        {me ? (
          <form onSubmit={submitComment} style={{ padding: '16px 24px', borderTop: '1px solid #1a1d24', display: 'flex', gap: '10px' }}>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="เขียนความคิดเห็น..."
              rows={3}
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: '#0d0f14',
                border: '1px solid #1e2130', color: '#e2e8f0', fontSize: '13px',
                outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                style={{ padding: '10px 18px', borderRadius: '7px', background: '#6366f1',
                  color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', border: 'none',
                  opacity: submitting || !newComment.trim() ? 0.5 : 1 }}
              >
                ส่ง
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #1a1d24', color: '#475569', fontSize: '13px', textAlign: 'center' }}>
            <Link href="/login" style={{ color: '#6366f1', textDecoration: 'none' }}>เข้าสู่ระบบ</Link>{' '}
            เพื่อแสดงความคิดเห็น
          </div>
        )}

        {error && (
          <div style={{ padding: '8px 24px', color: '#f87171', fontSize: '13px' }}>{error}</div>
        )}
      </div>
    </div>
  )
}
