'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Gender } from '@/types'

// ── Country list ──────────────────────────────────────────────────────────────
const COUNTRIES = [
  'ไทย','ญี่ปุ่น','เกาหลีใต้','จีน','สิงคโปร์','มาเลเซีย','อินโดนีเซีย',
  'ฟิลิปปินส์','เวียดนาม','อินเดีย','สหรัฐอเมริกา','สหราชอาณาจักร',
  'แคนาดา','ออสเตรเลีย','เยอรมนี','ฝรั่งเศส','อิตาลี','สเปน',
  'เนเธอร์แลนด์','สวีเดน','นอร์เวย์','เดนมาร์ก','ฟินแลนด์','สวิตเซอร์แลนด์',
  'บราซิล','เม็กซิโก','อาร์เจนตินา','แอฟริกาใต้','รัสเซีย','นิวซีแลนด์','อื่นๆ',
]

// ── Password strength ─────────────────────────────────────────────────────────
function calcStrength(pw: string): { level: 0|1|2; label: string; color: string; score: number } {
  if (!pw) return { level: 0, label: '', color: '', score: 0 }
  // ── Scoring ──────────────────────────────────────────────────────────────
  let score = 0
  if (pw.length >= 8)               score += 1  // ความยาวขั้นต่ำ
  if (pw.length >= 12)              score += 1  // ความยาวดี
  if (pw.length >= 16)              score += 1  // ความยาวดีมาก
  if (/[a-z]/.test(pw))            score += 1  // มีตัวพิมพ์เล็ก
  if (/[A-Z]/.test(pw))            score += 1  // มีตัวพิมพ์ใหญ่
  if (/\d/.test(pw))               score += 1  // มีตัวเลข
  if (/[^a-zA-Z0-9]/.test(pw))     score += 2  // มีสัญลักษณ์พิเศษ (เพิ่ม 2)
  // ── หักคะแนน ──────────────────────────────────────────────────────────
  if (/^[0-9]+$/.test(pw))         score -= 3  // ตัวเลขล้วน
  if (/^[a-zA-Z]+$/.test(pw))      score -= 1  // ตัวอักษรล้วน (ไม่มีตัวเลข/สัญลักษณ์)
  if (/(..)\1{2,}/.test(pw))       score -= 1  // มีรูปแบบซ้ำ เช่น abcabcabc
  score = Math.max(0, score)
  // ── แปลงเป็น level ────────────────────────────────────────────────────
  if (score <= 2) return { level: 0, label: 'คาดเดาง่าย', color: '#f87171', score }
  if (score <= 4) return { level: 1, label: 'ปานกลาง',    color: '#facc15', score }
  return           { level: 2, label: 'คาดเดายาก', color: '#4ade80', score }
}

// ── Default SVG Avatars ───────────────────────────────────────────────────────
function AvatarPreview({ src, gender }: { src: string | null; gender: Gender }) {
  if (src) return <img src={src} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
  if (gender === 'male') return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
      <rect width="80" height="80" fill="#1e3a5f"/>
      <circle cx="40" cy="28" r="14" fill="#60a5fa"/>
      <path d="M10 72 Q10 50 40 50 Q70 50 70 72" fill="#60a5fa"/>
    </svg>
  )
  if (gender === 'female') return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
      <rect width="80" height="80" fill="#3a1a2f"/>
      <circle cx="40" cy="28" r="14" fill="#f472b6"/>
      <path d="M10 72 Q10 48 40 48 Q70 48 70 72" fill="#f472b6"/>
      <path d="M28 42 Q40 56 52 42" fill="none" stroke="#f472b6" strokeWidth="3"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%' }}>
      <rect x="0" y="0" width="40" height="80" fill="#1e3a5f"/>
      <rect x="40" y="0" width="40" height="80" fill="#3a1a2f"/>
      <circle cx="40" cy="28" r="14" fill="#94a3b8"/>
      <path d="M10 72 Q10 50 40 50 Q70 50 70 72" fill="#94a3b8"/>
    </svg>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    username: '', email: '', password: '',
    gender: 'unspecified' as Gender, country: '',
  })
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [errors,        setErrors]        = useState<Record<string, string>>({})
  const [loading,       setLoading]       = useState(false)
  const [serverError,   setServerError]   = useState('')
  const [showPassword,  setShowPassword]  = useState(false)

  const strength = calcStrength(form.password)

  function setField<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setErrors(e => ({ ...e, avatar: 'ขนาดไฟล์ต้องไม่เกิน 2MB' })); return }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = ev => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.username.trim())                             e.username = 'กรุณากรอก username'
    if (form.username.length < 3)                          e.username = 'username ต้องมีอย่างน้อย 3 ตัวอักษร'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))  e.email    = 'รูปแบบ email ไม่ถูกต้อง'
    if (form.password.length < 8)                          e.password = 'password ต้องมีอย่างน้อย 8 ตัวอักษร'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true); setServerError('')
    try {
      // 1. Sign up
      const { data, error } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { preferred_username: form.username } },
      })
      if (error) throw error
      const userId = data.user?.id
      if (!userId) throw new Error('ไม่ได้รับ user id')

      // 2. Upload avatar (optional)
      let avatarUrl: string | undefined
      if (avatarFile) {
        const ext  = avatarFile.name.split('.').pop()
        const path = `${userId}/avatar.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
        if (!upErr) {
          const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
          avatarUrl = pub.publicUrl
        }
      }

      // 3. UPSERT profile ผ่าน API route (service role — bypass RLS)
      const profileRes = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username:  form.username,
          gender:    form.gender,
          country:   form.country || null,
          avatarUrl: avatarUrl ?? null,
        }),
      })
      if (!profileRes.ok) {
        const d = await profileRes.json()
        throw new Error(d.error ?? 'บันทึกข้อมูลไม่สำเร็จ')
      }

      router.push('/?registered=1')
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'10px 14px', borderRadius:'8px', fontSize:'14px',
    background:'#0d1117', border:'1px solid #1e2130', color:'#e2e8f0',
    outline:'none', boxSizing:'border-box',
  }
  const label: React.CSSProperties = { display:'block', marginBottom:'6px', fontSize:'13px', fontWeight:600, color:'#94a3b8' }
  const err:   React.CSSProperties = { color:'#f87171', fontSize:'12px', marginTop:'4px' }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 16px' }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontSize:'36px', marginBottom:'8px' }}>🏁</div>
          <h1 style={{ fontSize:'24px', fontWeight:800, color:'#e2e8f0', margin:'0 0 6px' }}>
            สมัคร <span style={{ color:'#facc15' }}>PeonixTune</span>
          </h1>
          <p style={{ color:'#475569', fontSize:'14px', margin:0 }}>เข้าร่วมชุมชน tuner และแชร์ setup ของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>

          {/* Avatar */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width:'90px', height:'90px', borderRadius:'50%', overflow:'hidden', border:'2px dashed #facc1566', cursor:'pointer', flexShrink:0 }}
            >
              <AvatarPreview src={avatarPreview} gender={form.gender} />
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} style={{ background:'none', border:'1px solid #1e2130', color:'#94a3b8', padding:'6px 14px', borderRadius:'6px', fontSize:'12px', cursor:'pointer' }}>
              อัปโหลดรูปโปรไฟล์
            </button>
            {errors.avatar && <span style={err}>{errors.avatar}</span>}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display:'none' }} />
          </div>

          {/* Username */}
          <div>
            <label style={label}>Username <span style={{ color:'#f87171' }}>*</span></label>
            <input style={{ ...inp, borderColor: errors.username ? '#f87171' : '#1e2130' }}
              placeholder="เช่น peonix_fh5" value={form.username}
              onChange={e => setField('username', e.target.value)} />
            {errors.username && <p style={err}>{errors.username}</p>}
            <p style={{ color:'#475569', fontSize:'11px', margin:'4px 0 0' }}>ชื่อนี้จะแสดงในหน้า tune ของคุณ</p>
          </div>

          {/* Email */}
          <div>
            <label style={label}>Email <span style={{ color:'#f87171' }}>*</span></label>
            <input style={{ ...inp, borderColor: errors.email ? '#f87171' : '#1e2130' }}
              type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setField('email', e.target.value)} />
            {errors.email && <p style={err}>{errors.email}</p>}
          </div>

          {/* Password + strength bar */}
          <div>
            <label style={label}>Password <span style={{ color:'#f87171' }}>*</span></label>
            <div style={{ position:'relative' }}>
              <input style={{ ...inp, borderColor: errors.password ? '#f87171' : '#1e2130', paddingRight:'42px' }}
                type={showPassword ? 'text' : 'password'}
                placeholder="อย่างน้อย 8 ตัวอักษร" value={form.password}
                onChange={e => setField('password', e.target.value)} />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'#64748b',
                  fontSize:'16px', padding:'2px', lineHeight:1 }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <p style={err}>{errors.password}</p>}
            {form.password && (
              <div style={{ marginTop:'8px' }}>
                <div style={{ display:'flex', gap:'4px', marginBottom:'6px' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ flex:1, height:'4px', borderRadius:'2px',
                      background: i <= strength.level ? strength.color : '#1e2130',
                      transition:'background 0.3s' }} />
                  ))}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'11px', color: strength.color, fontWeight:700 }}>{strength.label}</span>
                  <span style={{ fontSize:'10px', color:'#334155' }}>
                    {strength.level === 0 && 'เพิ่มตัวเลข/สัญลักษณ์และความยาว'}
                    {strength.level === 1 && 'เพิ่มสัญลักษณ์พิเศษ หรือความยาว 12+'}
                    {strength.level === 2 && '✓ รหัสผ่านแข็งแกร่ง'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Gender */}
          <div>
            <label style={label}>เพศ</label>
            <div style={{ display:'flex', gap:'8px' }}>
              {([['male','ชาย','💙'],['female','หญิง','🩷'],['unspecified','ไม่ระบุ','🤍']] as const).map(([val, text, icon]) => (
                <button key={val} type="button" onClick={() => setField('gender', val)}
                  style={{ flex:1, padding:'9px 4px', borderRadius:'8px', border:`1px solid ${form.gender === val ? '#facc15' : '#1e2130'}`, background: form.gender === val ? 'rgba(250,204,21,0.08)' : '#0d1117', color: form.gender === val ? '#facc15' : '#64748b', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
                  {icon} {text}
                </button>
              ))}
            </div>
          </div>

          {/* Country */}
          <div>
            <label style={label}>ประเทศ</label>
            <select style={{ ...inp, cursor:'pointer' }} value={form.country} onChange={e => setField('country', e.target.value)}>
              <option value="">— ไม่ระบุ —</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>



          {/* Server error */}
          {serverError && (
            <div style={{ padding:'12px', background:'rgba(248,113,113,0.1)', border:'1px solid #f87171', borderRadius:'8px', color:'#f87171', fontSize:'13px' }}>
              {serverError}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{ padding:'12px', borderRadius:'9px', border:'none', background: loading ? '#64748b' : '#facc15', color:'#0d0f14', fontWeight:800, fontSize:'15px', cursor: loading ? 'not-allowed' : 'pointer', transition:'background 0.2s' }}>
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก →'}
          </button>

          <p style={{ textAlign:'center', color:'#475569', fontSize:'13px', margin:0 }}>
            มีบัญชีแล้ว? <Link href="/login" style={{ color:'#facc15', textDecoration:'none', fontWeight:600 }}>เข้าสู่ระบบ</Link>
          </p>

        </form>
      </div>
    </div>
  )
}
