'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

type Period = 'week' | 'month' | 'all'
const DC: Record<string, { bg: string; color: string }> = {
  drift:   { bg: '#2a0f1a', color: '#f472b6' },
  track:   { bg: '#0f1a2a', color: '#60a5fa' },
  street:  { bg: '#1a0f2a', color: '#c084fc' },
  rally:   { bg: '#2a1f0f', color: '#facc15' },
  offroad: { bg: '#2a2010', color: '#fbbf24' },
  drag:    { bg: '#2a1010', color: '#f87171' },
}
interface Tune {
  id: string; title: string; discipline: string; upvotes: number
  car?: { make: string; model: string; pi_class: string } | null
  user?: { username: string } | null
}

export function TopTunesClient({ gameSlug }: { gameSlug: string }) {
  const { t } = useLanguage()
  const [period, setPeriod] = useState<Period>('week')
  const [tunes, setTunes] = useState<Tune[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/tunes?gameSlug=${gameSlug}&sortBy=popular&perPage=10`)
      .then(r => r.json())
      .then(d => { setTunes(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [gameSlug, period])

  const tabs: { key: Period; label: string }[] = [
    { key: 'week',  label: t.game.periodWeek  },
    { key: 'month', label: t.game.periodMonth },
    { key: 'all',   label: t.game.periodAll   },
  ]

  return (
    <div>
      <div style={{ display:'flex', gap:'8px', marginBottom:'24px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setPeriod(t.key)} style={{
            padding:'8px 22px', borderRadius:'8px', border:'none', cursor:'pointer',
            fontWeight:600, fontSize:'14px', transition:'all 0.2s',
            background: period === t.key ? '#facc15' : '#161923',
            color:      period === t.key ? '#0d0f14' : '#64748b',
            boxShadow:  period === t.key ? '0 0 14px rgba(250,204,21,0.3)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'56px', color:'#475569' }}>{t.game.topLoading}</div>
      ) : tunes.length === 0 ? (
        <div style={{ textAlign:'center', padding:'56px', color:'#475569' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>🏁</div>
          {t.game.topEmpty}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {tunes.map((tune, i) => {
            const dc = DC[tune.discipline] ?? { bg:'#1a1d26', color:'#94a3b8' }
            const rankColor = i === 0 ? '#facc15' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#334155'
            return (
              <Link key={tune.id} href={`/tunes/${tune.id}`} style={{ textDecoration:'none' }}>
                <div style={{
                  display:'grid', gridTemplateColumns:'44px 1fr 110px 70px 64px',
                  alignItems:'center', gap:'12px', padding:'14px 18px',
                  background:'#111318', borderRadius:'10px',
                  border:'1px solid #1e2130', cursor:'pointer',
                  transition:'border-color 0.2s, background 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='#facc15'; (e.currentTarget as HTMLElement).style.background='#13161f' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='#1e2130'; (e.currentTarget as HTMLElement).style.background='#111318' }}
                >
                  <span style={{ fontSize: i<3?'20px':'14px', fontWeight:800, color:rankColor, textAlign:'center' }}>
                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                  </span>
                  <div>
                    <div style={{ fontWeight:600, color:'#e2e8f0', fontSize:'14px', marginBottom:'3px' }}>{tune.title}</div>
                    <div style={{ fontSize:'12px', color:'#475569' }}>
                      {tune.car ? `${tune.car.make} ${tune.car.model}` : '—'} · @{tune.user?.username ?? 'anon'}
                    </div>
                  </div>
                  <span style={{ padding:'4px 10px', borderRadius:'6px', background:dc.bg, color:dc.color, fontSize:'11px', fontWeight:700, textAlign:'center', textTransform:'uppercase' }}>
                    {tune.discipline}
                  </span>
                  <span style={{ fontSize:'13px', fontWeight:700, color:'#64748b', textAlign:'center' }}>
                    {tune.car?.pi_class ?? '—'}
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:'4px', color:'#facc15', fontWeight:800, fontSize:'14px', justifyContent:'flex-end' }}>
                    ▲ {tune.upvotes}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
