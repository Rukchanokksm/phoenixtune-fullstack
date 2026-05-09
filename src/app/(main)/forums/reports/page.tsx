'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type Post = {
  id: string; title: string; upvotes: number; comment_count: number
  updated_at: string; game: { name: string; slug: string } | null
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

export default function ReportsForumPage() {
  const [posts,    setPosts]    = useState<Post[]>([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(true)

  const PER_PAGE = 20

  const fetchPosts = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/forum/posts?category=report&sortBy=latest&page=${p}&perPage=${PER_PAGE}`)
      const data = await res.json()
      setPosts(data.data ?? [])
      setTotal(data.total ?? 0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts(page) }, [page, fetchPosts])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px', color: '#e2e8f0' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <Link href="/forums" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Forums</Link>
        <span style={{ color: '#334155' }}>›</span>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>ปัญหาและรายงาน</h1>
        <div style={{ marginLeft: 'auto' }}>
          <Link href="/forums/new?category=report" style={{ padding: '8px 16px', borderRadius: '7px', background: '#6366f1',
            color: '#fff', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
            รายงานปัญหา
          </Link>
        </div>
      </div>

      <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #1a1d24', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            รายงาน
          </span>
          <span style={{ color: '#374151', fontSize: '12px' }}>{total.toLocaleString()} กระทู้</span>
        </div>

        {loading ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#374151', fontSize: '13px' }}>
            กำลังโหลด...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#374151', fontSize: '13px' }}>
            ไม่มีรายงานที่ค้างอยู่
          </div>
        ) : (
          posts.map(p => <PostRow key={p.id} post={p} />)
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #1e2130',
              background: '#111318', color: page === 1 ? '#374151' : '#94a3b8', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
            ก่อนหน้า
          </button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const p = page <= 4 ? i + 1 : page - 3 + i
            if (p < 1 || p > totalPages) return null
            return (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: '7px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                  border: '1px solid #1e2130',
                  background: page === p ? '#6366f1' : '#111318',
                  color: page === p ? '#fff' : '#94a3b8' }}>
                {p}
              </button>
            )
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #1e2130',
              background: '#111318', color: page === totalPages ? '#374151' : '#94a3b8', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}>
            ถัดไป
          </button>
        </div>
      )}
    </div>
  )
}
