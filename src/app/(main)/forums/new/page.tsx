'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Game = { id: string; name: string; slug: string }

export default function NewForumPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultCategory = searchParams.get('category') ?? 'general'

  const [games,    setGames]    = useState<Game[]>([])
  const [title,    setTitle]    = useState('')
  const [body,     setBody]     = useState('')
  const [tag,      setTag]      = useState<'general' | 'report' | 'game' | 'announcement'>(
    defaultCategory === 'announcement' ? 'announcement'
    : defaultCategory === 'report'     ? 'report'
    : 'general'
  )
  const [gameId,   setGameId]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    fetch('/api/games').then(r => r.json()).then(d => setGames(d.games ?? [])).catch(() => {})
  }, [])

  const category = tag === 'game' ? 'general' : tag

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('กรุณาใส่หัวข้อ'); return }
    if (!body.trim())  { setError('กรุณาใส่เนื้อหา'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:    title.trim(),
          body:     body.trim(),
          category,
          gameId:   tag === 'game' ? gameId || null : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'เกิดข้อผิดพลาด'); return }
      router.push(`/forums/${data.id}`)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    background: '#0d0f14', border: '1px solid #1e2130',
    color: '#e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', color: '#94a3b8', fontSize: '12px',
    fontWeight: 600, marginBottom: '6px', letterSpacing: '0.04em',
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px 80px', color: '#e2e8f0' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <Link href="/forums" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none' }}>Forums</Link>
        <span style={{ color: '#334155' }}>›</span>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>สร้าง Post</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Tag */}
          <div>
            <label style={labelStyle}>หมวดหมู่</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {([
                { value: 'general',      label: 'ทั่วไป' },
                { value: 'game',         label: 'เกม' },
                { value: 'report',       label: 'รายงาน / ปัญหา' },
                ...(tag === 'announcement' ? [{ value: 'announcement' as const, label: 'ประกาศ' }] : []),
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTag(opt.value)}
                  style={{
                    padding: '7px 16px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer',
                    border: '1px solid',
                    borderColor: tag === opt.value ? '#6366f1' : '#1e2130',
                    background:  tag === opt.value ? 'rgba(99,102,241,0.12)' : '#0d0f14',
                    color:       tag === opt.value ? '#818cf8' : '#64748b',
                    fontWeight:  tag === opt.value ? 700 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Game picker (when tag = 'game') */}
          {tag === 'game' && (
            <div>
              <label style={labelStyle}>เกม</label>
              <select
                value={gameId}
                onChange={e => setGameId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">เลือกเกม (ไม่บังคับ)</option>
                {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={labelStyle}>หัวข้อ</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="หัวข้อของ post..."
              maxLength={200}
              style={inputStyle}
            />
          </div>

          {/* Body */}
          <div>
            <label style={labelStyle}>เนื้อหา</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="เขียนเนื้อหาที่นี่..."
              rows={10}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', fontFamily: 'inherit' }}
            />
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: '13px', padding: '10px 14px', background: 'rgba(248,113,113,0.08)', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Link href="/forums" style={{ padding: '10px 20px', borderRadius: '7px', background: '#1a1d24', color: '#64748b', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '10px 24px', borderRadius: '7px', background: loading ? '#3730a3' : '#6366f1',
                color: '#fff', fontSize: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}
            >
              {loading ? 'กำลังบันทึก...' : 'สร้าง Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
