import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TITLES } from '@/types'
import type { TitleId, Gender } from '@/types'

interface Props { params: Promise<{ username: string }> }

function DefaultAvatar({ gender }: { gender: Gender }) {
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

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, username, avatar_url, bio, gender, country, role, active_title, titles_earned, tune_share_count, total_upvotes_received, is_premium, created_at')
    .eq('username', username)
    .single()

  if (!profile) return (
    <div style={{ textAlign:'center', padding:'100px 24px', color:'#64748b' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>👤</div>
      <h2 style={{ color:'#e2e8f0' }}>ไม่พบ @{username}</h2>
      <Link href="/" style={{ color:'#facc15', textDecoration:'none' }}>← กลับหน้าแรก</Link>
    </div>
  )

  const activeTitle = TITLES[profile.active_title as TitleId] ?? TITLES.newcomer
  const earned = (profile.titles_earned as string[]).map(t => TITLES[t as TitleId]).filter(Boolean)
  const joinYear = new Date(profile.created_at).getFullYear()

  return (
    <div style={{ maxWidth:'800px', margin:'0 auto', padding:'40px 24px 80px' }}>

      {/* Profile Card */}
      <div style={{ background:'#111318', border:'1px solid #1e2130', borderRadius:'16px', padding:'32px', marginBottom:'24px', display:'flex', gap:'28px', alignItems:'flex-start', flexWrap:'wrap' }}>
        {/* Avatar */}
        <div style={{ width:'96px', height:'96px', borderRadius:'50%', overflow:'hidden', border:'3px solid #facc1544', flexShrink:0 }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <DefaultAvatar gender={(profile.gender as Gender) ?? 'unspecified'} />
          }
        </div>

        {/* Info */}
        <div style={{ flex:1, minWidth:'200px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'6px' }}>
            <h1 style={{ margin:0, color:'#e2e8f0', fontWeight:800, fontSize:'22px' }}>@{profile.username}</h1>
            {profile.is_premium && (
              <span style={{ background:'rgba(250,204,21,0.1)', color:'#facc15', padding:'2px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700 }}>PRO</span>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
            <span style={{ fontSize:'16px' }}>{activeTitle.icon}</span>
            <span style={{ color: activeTitle.color, fontSize:'13px', fontWeight:700 }}>{activeTitle.label}</span>
          </div>
          {profile.bio && <p style={{ color:'#94a3b8', fontSize:'14px', margin:'0 0 12px', lineHeight:1.6 }}>{profile.bio}</p>}
          <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
            {profile.country && <span style={{ color:'#475569', fontSize:'13px' }}>📍 {profile.country}</span>}
            <span style={{ color:'#475569', fontSize:'13px' }}>📅 เข้าร่วมปี {joinYear}</span>
            <span style={{ color:'#475569', fontSize:'13px', textTransform:'capitalize' }}>🎭 {profile.role}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'24px' }}>
        {[
          { label:'Tunes แชร์', value: profile.tune_share_count, icon:'🔧', color:'#60a5fa' },
          { label:'Upvotes รับ', value: profile.total_upvotes_received, icon:'▲', color:'#facc15' },
          { label:'ฉายาสะสม',  value: earned.length, icon:'🏅', color:'#c084fc' },
        ].map(s => (
          <div key={s.label} style={{ background:'#111318', border:'1px solid #1e2130', borderRadius:'10px', padding:'20px', textAlign:'center' }}>
            <div style={{ fontSize:'22px', marginBottom:'4px' }}>{s.icon}</div>
            <div style={{ fontSize:'24px', fontWeight:800, color: s.color, marginBottom:'4px' }}>{s.value}</div>
            <div style={{ fontSize:'12px', color:'#475569' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Titles earned */}
      <div style={{ background:'#111318', border:'1px solid #1e2130', borderRadius:'12px', padding:'24px', marginBottom:'24px' }}>
        <h2 style={{ margin:'0 0 16px', color:'#e2e8f0', fontWeight:700, fontSize:'16px' }}>🏅 ฉายาที่ได้รับ</h2>
        {earned.length === 0 ? (
          <p style={{ color:'#475569', fontSize:'14px', margin:0 }}>ยังไม่มีฉายา — เริ่มแชร์ tune แรกเลย!</p>
        ) : (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {earned.map((t, i) => (
              <span key={i} style={{ padding:'6px 14px', borderRadius:'20px', background:'rgba(255,255,255,0.04)', border:`1px solid ${t.color}44`, color: t.color, fontSize:'13px', fontWeight:600 }}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recent tunes placeholder */}
      <div style={{ background:'#111318', border:'1px solid #1e2130', borderRadius:'12px', padding:'24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
          <h2 style={{ margin:0, color:'#e2e8f0', fontWeight:700, fontSize:'16px' }}>🔧 Tunes ล่าสุด</h2>
          <Link href={`/tunes?user=${profile.username}`} style={{ color:'#facc15', fontSize:'13px', textDecoration:'none', fontWeight:600 }}>ดูทั้งหมด →</Link>
        </div>
        <p style={{ color:'#475569', fontSize:'14px', margin:0 }}>เชื่อมต่อ database เพื่อดู tune ของ @{profile.username}</p>
      </div>

    </div>
  )
}
