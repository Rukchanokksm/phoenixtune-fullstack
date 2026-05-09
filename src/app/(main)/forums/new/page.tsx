'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Game = { id: string; name: string; slug: string }

// ── image upload constants ──────────────────────────────────────
const MAX_IMAGES      = 5          // per post (will be role-based later)
const MAX_SIZE_BYTES  = 5 * 1024 * 1024   // 5 MB per file
const ALLOWED_TYPES   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const BUCKET          = 'forum-images'

type UploadedImage = { url: string; name: string; preview: string }

export default function NewForumPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultCategory = searchParams.get('category') ?? 'general'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [games,    setGames]    = useState<Game[]>([])
  const [title,    setTitle]    = useState('')
  const [body,     setBody]     = useState('')
  const [tag,      setTag]      = useState<'general' | 'report' | 'game' | 'announcement'>(
    defaultCategory === 'announcement' ? 'announcement'
    : defaultCategory === 'report'     ? 'report'
    : 'general'
  )
  const [gameId,      setGameId]      = useState('')
  const [images,      setImages]      = useState<UploadedImage[]>([])
  const [uploading,   setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [dragOver,    setDragOver]    = useState(false)

  useEffect(() => {
    fetch('/api/games').then(r => r.json()).then(d => setGames(d.games ?? [])).catch(() => {})
  }, [])

  const category = tag === 'game' ? 'general' : tag

  async function uploadFiles(files: FileList | File[]) {
    setUploadError('')
    const fileArr = Array.from(files)

    // Remaining slots
    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      setUploadError(`ใส่รูปได้สูงสุด ${MAX_IMAGES} รูปต่อ post`)
      return
    }

    const toUpload = fileArr.slice(0, remaining)
    if (fileArr.length > remaining) {
      setUploadError(`เลือกได้อีกแค่ ${remaining} รูป — ไฟล์ที่เกินถูกข้ามไป`)
    }

    const supabase = createClient()

    setUploading(true)
    const results: UploadedImage[] = []

    for (const file of toUpload) {
      // type check
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(`"${file.name}" ไม่รองรับ — ใช้ได้เฉพาะ JPG, PNG, WebP, GIF`)
        continue
      }
      // size check
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError(`"${file.name}" ใหญ่เกิน 5 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)`)
        continue
      }

      const ext  = file.name.split('.').pop()
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (upErr) {
        setUploadError(`อัปโหลด "${file.name}" ไม่สำเร็จ: ${upErr.message}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const preview = URL.createObjectURL(file)
      results.push({ url: publicUrl, name: file.name, preview })
    }

    setImages(prev => [...prev, ...results])
    setUploading(false)
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) uploadFiles(e.target.files)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
  }

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
          images:   images.map(i => i.url),
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

  const canAddMore = images.length < MAX_IMAGES

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

          {/* Game picker */}
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

          {/* Image upload */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <label style={labelStyle}>รูปภาพ</label>
              <span style={{ color: '#374151', fontSize: '11px' }}>
                {images.length}/{MAX_IMAGES} รูป · สูงสุด 5 MB ต่อไฟล์ · JPG, PNG, WebP, GIF
              </span>
            </div>

            {/* Preview grid */}
            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', background: '#0d0f14', border: '1px solid #1e2130' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.preview}
                      alt={img.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute', top: '4px', right: '4px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.7)', border: 'none',
                        color: '#e2e8f0', fontSize: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                      }}
                      title="ลบรูป"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            {canAddMore && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#6366f1' : '#1e2130'}`,
                  borderRadius: '8px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragOver ? 'rgba(99,102,241,0.04)' : 'transparent',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {uploading ? (
                  <span style={{ color: '#475569', fontSize: '13px' }}>กำลังอัปโหลด...</span>
                ) : (
                  <>
                    <div style={{ color: '#475569', fontSize: '13px' }}>
                      วางรูปที่นี่ หรือ <span style={{ color: '#6366f1', fontWeight: 600 }}>เลือกไฟล์</span>
                    </div>
                    <div style={{ color: '#374151', fontSize: '11px', marginTop: '4px' }}>
                      เพิ่มได้อีก {MAX_IMAGES - images.length} รูป
                    </div>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              multiple
              onChange={onFileInput}
              style={{ display: 'none' }}
            />

            {uploadError && (
              <div style={{ color: '#fbbf24', fontSize: '12px', marginTop: '6px' }}>
                {uploadError}
              </div>
            )}
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
              disabled={loading || uploading}
              style={{ padding: '10px 24px', borderRadius: '7px', background: loading ? '#3730a3' : '#6366f1',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                cursor: loading || uploading ? 'not-allowed' : 'pointer', border: 'none',
                opacity: uploading ? 0.6 : 1 }}
            >
              {loading ? 'กำลังบันทึก...' : 'สร้าง Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
