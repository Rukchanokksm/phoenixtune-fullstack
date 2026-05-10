import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TITLES } from '@/types'
import type { TitleId, Gender } from '@/types'
import { ProfileCard } from '@/components/profile/ProfileCard'

interface Props { params: Promise<{ username: string }> }

export default async function ProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, username, avatar_url, bio, gender, country, birthday, role, active_title, titles_earned, tune_share_count, total_upvotes_received, is_premium, created_at')
    .eq('username', username)
    .single()

  const isOwner = authUser?.id === profile?.id

  if (!profile) return (
    <div style={{ textAlign:'center', padding:'100px 24px', color:'#64748b' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>👤</div>
      <h2 style={{ color:'#e2e8f0' }}>ไม่พบ @{username}</h2>
      <Link href="/" style={{ color:'#facc15', textDecoration:'none' }}>← กลับหน้าแรก</Link>
    </div>
  )

  // Fetch all tunes for this user, newest first
  const { data: tunes } = await supabase
    .from('tunes')
    .select(`
      id, title, discipline, created_at, updated_at, upvotes, view_count,
      car:cars!tunes_car_id_fkey(make, model, pi_class),
      game:games!tunes_game_id_fkey(id, name, slug)
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  // Group by game
  type TuneRow = NonNullable<typeof tunes>[number]
  const byGame: Record<string, { gameName: string; gameSlug: string; tunes: TuneRow[] }> = {}
  for (const t of tunes ?? []) {
    const g = t.game as unknown as { id: string; name: string; slug: string } | null
    if (!g) continue
    if (!byGame[g.id]) byGame[g.id] = { gameName: g.name, gameSlug: g.slug, tunes: [] }
    byGame[g.id].tunes.push(t)
  }
  const gameGroups = Object.values(byGame)

  // Computed stats from real tune data
  const totalTunes   = tunes?.length ?? 0
  const totalUpvotes = tunes?.reduce((s, t) => s + (t.upvotes ?? 0), 0) ?? 0
  const totalViews   = tunes?.reduce((s, t) => s + (t.view_count ?? 0), 0) ?? 0

  const earned = (profile.titles_earned as string[]).map(t => TITLES[t as TitleId]).filter(Boolean)
  const joinYear = new Date(profile.created_at).getFullYear()

  return (
    <div style={{ maxWidth:'800px', margin:'0 auto', padding:'40px 24px 80px' }}>

      <ProfileCard
        isOwner={isOwner}
        profile={{
          id:        profile.id,
          username:  profile.username,
          avatarUrl: profile.avatar_url ?? null,
          bio:       profile.bio        ?? null,
          gender:    (profile.gender as Gender) ?? 'unspecified',
          country:   profile.country    ?? null,
          birthday:  profile.birthday   ?? null,
          role:      profile.role       ?? 'user',
          activeTitle: (profile.active_title as TitleId) ?? 'newcomer',
          joinYear,
        }}
      />

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'12px', marginBottom:'24px' }}>
        {[
          { label:'Tune ทั้งหมด', value: totalTunes,   icon:'🔧', color:'#60a5fa' },
          { label:'Upvotes รับ',  value: totalUpvotes, icon:'▲',  color:'#facc15' },
          { label:'ยอดวิวรวม',    value: totalViews,   icon:'👁', color:'#34d399' },
          { label:'ฉายาสะสม',    value: earned.length, icon:'🏅', color:'#c084fc' },
        ].map(s => (
          <div key={s.label} style={{ background:'#111318', border:'1px solid #1e2130', borderRadius:'10px', padding:'16px', textAlign:'center' }}>
            <div style={{ fontSize:'20px', marginBottom:'4px' }}>{s.icon}</div>
            <div style={{ fontSize:'22px', fontWeight:800, color: s.color, marginBottom:'4px' }}>{s.value.toLocaleString()}</div>
            <div style={{ fontSize:'11px', color:'#475569' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Per-game tune count */}
      {gameGroups.length > 0 && (
        <div style={{ background:'#111318', border:'1px solid #1e2130', borderRadius:'10px', padding:'16px 20px', marginBottom:'24px' }}>
          <div style={{ fontSize:'12px', color:'#475569', fontWeight:600, marginBottom:'10px' }}>Tune แยกตามเกม</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {gameGroups.map(g => (
              <div key={g.gameSlug} style={{ display:'flex', alignItems:'center', gap:'6px',
                padding:'5px 12px', borderRadius:'20px',
                background:'rgba(96,165,250,0.07)', border:'1px solid rgba(96,165,250,0.2)' }}>
                <span style={{ fontSize:'12px' }}>🎮</span>
                <span style={{ color:'#94a3b8', fontSize:'12px', fontWeight:600 }}>{g.gameName}</span>
                <span style={{ color:'#60a5fa', fontSize:'12px', fontWeight:800 }}>{g.tunes.length}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* All tunes grouped by game */}
      <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
        <h2 style={{ margin:0, color:'#e2e8f0', fontWeight:700, fontSize:'16px' }}>🔧 Tunes ทั้งหมดของ @{profile.username}</h2>

        {gameGroups.length === 0 && (
          <div style={{ background:'#111318', border:'1px solid #1e2130', borderRadius:'12px', padding:'32px', textAlign:'center' }}>
            <p style={{ color:'#475569', fontSize:'14px', margin:'0 0 12px' }}>ยังไม่มี tune ที่แชร์</p>
            <Link href="/tunes/new" style={{ color:'#facc15', fontSize:'13px', textDecoration:'none', fontWeight:600 }}>+ แชร์ tune แรก →</Link>
          </div>
        )}

        {gameGroups.map(group => (
          <div key={group.gameSlug} style={{ background:'#111318', border:'1px solid #1e2130', borderRadius:'12px', padding:'24px' }}>
            {/* Game header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontSize:'18px' }}>🎮</span>
                <span style={{ color:'#facc15', fontWeight:700, fontSize:'15px' }}>{group.gameName}</span>
                <span style={{ color:'#475569', fontSize:'12px' }}>({group.tunes.length} tune)</span>
              </div>
              <Link href={`/tunes?game=${group.gameSlug}&user=${profile.username}`}
                style={{ color:'#64748b', fontSize:'12px', textDecoration:'none' }}>
                ดูทั้งหมดในเกมนี้ →
              </Link>
            </div>

            {/* Tune list */}
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {group.tunes.map(tune => {
                const car = tune.car as unknown as { make: string; model: string; pi_class: string } | null
                const piColors: Record<string, string> = {
                  D:'#a3e635', C:'#facc15', B:'#fb923c', A:'#f87171', S1:'#c084fc', S2:'#818cf8', X:'#60a5fa'
                }
                const piColor = piColors[car?.pi_class ?? ''] ?? '#64748b'
                const disciplineColor: Record<string, string> = {
                  street:'#c084fc', track:'#60a5fa', drift:'#f472b6',
                  rally:'#fb923c', offroad:'#fbbf24', drag:'#f87171',
                }
                return (
                  <Link key={tune.id} href={`/tunes/${tune.id}`} style={{ textDecoration:'none' }}>
                    <div style={{
                      display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px',
                      borderRadius:'9px', background:'#0d0f14', border:'1px solid #1a1d24',
                      transition:'border-color 0.15s', cursor:'pointer',
                    }}>
                      {/* PI class badge */}
                      {car && (
                        <span style={{
                          fontSize:'11px', fontWeight:800, color: piColor,
                          background: piColor + '18', border:`1px solid ${piColor}44`,
                          padding:'2px 7px', borderRadius:'5px', flexShrink:0,
                        }}>{car.pi_class}</span>
                      )}

                      {/* Title + car */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ color:'#e2e8f0', fontWeight:600, fontSize:'14px',
                          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {tune.title}
                        </div>
                        {car && (
                          <div style={{ color:'#475569', fontSize:'12px', marginTop:'2px' }}>
                            {car.make} {car.model}
                          </div>
                        )}
                      </div>

                      {/* Discipline */}
                      <span style={{
                        fontSize:'11px', fontWeight:700, flexShrink:0,
                        color: disciplineColor[tune.discipline as string] ?? '#64748b',
                      }}>{tune.discipline}</span>

                      {/* Stats */}
                      <div style={{ display:'flex', gap:'10px', flexShrink:0 }}>
                        <span style={{ color:'#facc15', fontSize:'12px' }}>▲ {tune.upvotes}</span>
                        <span style={{ color:'#475569', fontSize:'12px' }}>👁 {tune.view_count}</span>
                      </div>

                      {/* Date */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', flexShrink:0, gap:'2px' }}>
                        <span style={{ color:'#374151', fontSize:'11px' }}>
                          {new Date(tune.created_at).toLocaleDateString('th-TH', { day:'numeric', month:'short', year:'2-digit' })}
                        </span>
                        {(tune as { updated_at?: string }).updated_at &&
                          new Date((tune as { updated_at?: string }).updated_at!).getTime() - new Date(tune.created_at).getTime() > 60_000 && (
                          <span style={{ fontSize:'10px', color:'#60a5fa', fontWeight:600 }}>edited</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
