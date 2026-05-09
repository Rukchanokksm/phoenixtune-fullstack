'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AdUnit } from '@/components/ads/AdUnit'

// Types
interface TuneRow {
  id: string
  discipline: string
  title: string
  description?: string
  upvotes: number
  view_count: number
  share_code?: string
  created_at: string
  car: { id: string; make: string; model: string; pi_class: string; drivetrain: string } | null
  game: { id: string; name: string; slug: string } | null
  user: { id: string; username: string; avatar_url?: string; is_premium: boolean } | null
}

const DISCIPLINES = [
  { id: '',        label: 'All'     },
  { id: 'street',  label: 'Street'  },
  { id: 'track',   label: 'Track'   },
  { id: 'drift',   label: 'Drift'   },
  { id: 'rally',   label: 'Rally'   },
  { id: 'offroad', label: 'Offroad' },
  { id: 'drag',    label: 'Drag'    },
]

const PI_CLASSES = [
  { id: '',   label: 'All PI' },
  { id: 'D',  label: 'D' },
  { id: 'C',  label: 'C' },
  { id: 'B',  label: 'B' },
  { id: 'A',  label: 'A' },
  { id: 'S1', label: 'S1' },
  { id: 'S2', label: 'S2' },
  { id: 'X',  label: 'X'  },
]

const DRIVETRAINS = [
  { id: '',    label: 'All Drive' },
  { id: 'AWD', label: 'AWD' },
  { id: 'RWD', label: 'RWD' },
  { id: 'FWD', label: 'FWD' },
]

const SORT_OPTIONS = [
  { id: 'newest',   label: 'Newest'  },
  { id: 'popular',  label: 'Popular' },
  { id: 'trending', label: 'Trending'},
]

const DISCIPLINE_STYLE: Record<string, { bg: string; color: string }> = {
  drift:   { bg: '#2a0f1a', color: '#f472b6' },
  track:   { bg: '#0f1a2a', color: '#60a5fa' },
  street:  { bg: '#0f2a1a', color: '#4ade80' },
  rally:   { bg: '#2a1f0f', color: '#fb923c' },
  offroad: { bg: '#2a2010', color: '#fbbf24' },
  drag:    { bg: '#2a1010', color: '#f87171' },
}

const PI_COLORS: Record<string, string> = {
  D: '#94a3b8', C: '#fbbf24', B: '#4ade80',
  A: '#60a5fa', S1: '#c084fc', S2: '#f472b6', X: '#f87171',
}

const GAME_ACCENT: Record<string, string> = {
  'forza-horizon-5':    '#60a5fa',
  'forza-horizon-6':    '#c084fc',
  'the-crew-motorfest': '#fb923c',
  'nfs-unbound':        '#f87171',
}

function DisciplineBadge({ d }: { d: string }) {
  const s = DISCIPLINE_STYLE[d] ?? { bg: '#1e293b', color: '#94a3b8' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: '5px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em',
      textTransform: 'uppercase', background: s.bg, color: s.color,
    }}>
      {d}
    </span>
  )
}

function PIBadge({ pi }: { pi: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '1px 7px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 800, fontFamily: 'monospace',
      background: 'rgba(255,255,255,0.06)', color: PI_COLORS[pi] ?? '#94a3b8',
    }}>
      {pi}
    </span>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
      background: active ? '#facc15' : 'rgba(255,255,255,0.04)',
      color: active ? '#0d0f14' : '#94a3b8',
      border: active ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.08)',
      fontSize: '13px', fontWeight: active ? 700 : 500,
      transition: 'all 0.15s', whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  )
}

function TuneCardRow({ tune }: { tune: TuneRow }) {
  const [hovered, setHovered] = useState(false)
  const accent = tune.game ? GAME_ACCENT[tune.game.slug] ?? '#facc15' : '#facc15'
  const shortGameName = (name: string) =>
    name.replace('Forza Horizon', 'FH').replace('Need for Speed', 'NFS').replace('The Crew Motorfest', 'TCM')

  return (
    <Link href={`/tunes/${tune.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#13151c',
          border: `1px solid ${hovered ? accent + '55' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '12px', padding: '18px 20px', display: 'grid',
          gridTemplateColumns: '90px 1fr 130px 80px', gap: '16px',
          alignItems: 'center', transition: 'border-color 0.15s',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <DisciplineBadge d={tune.discipline} />
          {tune.car && <PIBadge pi={tune.car.pi_class} />}
        </div>

        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px', lineHeight: 1.3 }}>
            {tune.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {tune.car && (
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {tune.car.make} {tune.car.model}
                <span style={{ marginLeft: '6px', color: '#334155', fontSize: '11px' }}>
                  {' · '}{tune.car.drivetrain}
                </span>
              </span>
            )}
            {tune.game && (
              <span style={{
                fontSize: '11px', padding: '1px 7px', borderRadius: '4px',
                background: accent + '18', color: accent, fontWeight: 600,
              }}>
                {shortGameName(tune.game.name)}
              </span>
            )}
          </div>
          {tune.description && (
            <div style={{
              marginTop: '6px', fontSize: '12px', color: '#475569',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              maxWidth: '500px',
            }}>
              {tune.description}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#1e3a5f,#0f2040)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', color: '#60a5fa', fontWeight: 700, flexShrink: 0,
          }}>
            {tune.user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', lineHeight: 1.2 }}>
              {tune.user?.username ?? 'Unknown'}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#f1f5f9' }}>
            <span style={{ color: '#facc15', marginRight: '3px' }}>^</span>
            {tune.upvotes}
          </div>
          <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>
            {tune.view_count} views
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function TunesPage() {
  const [tunes, setTunes]             = useState<TuneRow[]>([])
  const [total, setTotal]             = useState(0)
  const [loading, setLoading]         = useState(true)
  const [page, setPage]               = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch]           = useState('')
  const [discipline, setDiscipline]   = useState('')
  const [piClass, setPiClass]         = useState('')
  const [drivetrain, setDrivetrain]   = useState('')
  const [sortBy, setSortBy]           = useState('newest')

  const perPage = 20

  const fetchTunes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), perPage: String(perPage), sortBy })
    if (search)     params.set('search', search)
    if (discipline) params.set('discipline', discipline)
    if (piClass)    params.set('piClass', piClass)
    if (drivetrain) params.set('drivetrain', drivetrain)
    try {
      const res  = await fetch(`/api/tunes?${params}`)
      const json = await res.json()
      setTunes(json.data ?? [])
      setTotal(json.total ?? 0)
    } catch {
      setTunes([])
    } finally {
      setLoading(false)
    }
  }, [page, search, discipline, piClass, drivetrain, sortBy])

  useEffect(() => { fetchTunes() }, [fetchTunes])
  useEffect(() => { setPage(1) }, [search, discipline, piClass, drivetrain, sortBy])

  const totalPages = Math.ceil(total / perPage)

  function resetFilters() {
    setSearch(''); setSearchInput('')
    setDiscipline(''); setPiClass(''); setDrivetrain('')
  }

  return (
    <div style={{ background: '#0d0f14', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px 28px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#f1f5f9' }}>Browse Tunes</h1>
            {!loading && total > 0 && (
              <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                {total.toLocaleString()} tunes
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
            {'Search tunes from the community'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
              onBlur={() => setSearch(searchInput)}
              placeholder="Search tunes..."
              style={{
                width: '100%', padding: '10px 14px',
                background: '#13151c', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {SORT_OPTIONS.map(s => (
              <FilterChip key={s.id} label={s.label} active={sortBy === s.id} onClick={() => setSortBy(s.id)} />
            ))}
          </div>
        </div>

        <div style={{
          background: '#13151c', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px', padding: '16px 18px',
          display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px',
        }}>
          {[
            { label: 'STYLE',    opts: DISCIPLINES, val: discipline, set: setDiscipline },
            { label: 'PI CLASS', opts: PI_CLASSES,  val: piClass,    set: setPiClass    },
            { label: 'DRIVE',    opts: DRIVETRAINS, val: drivetrain, set: setDrivetrain },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#334155', fontWeight: 700,
                letterSpacing: '0.08em', width: '64px', flexShrink: 0 }}>
                {row.label}
              </span>
              {row.opts.map(o => (
                <FilterChip key={o.id} label={o.label} active={row.val === o.id}
                  onClick={() => row.set(o.id)} />
              ))}
            </div>
          ))}
        </div>

        <div style={{
          background: 'linear-gradient(135deg,#0f2a1a,#0d0f14)',
          border: '1px solid rgba(74,222,128,0.15)', borderRadius: '12px',
          padding: '14px 20px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', flexWrap: 'wrap', marginBottom: '24px',
        }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            <span style={{ fontWeight: 700, color: '#f1f5f9' }}>Have a great tune? </span>
            Share it with the community
          </span>
          <Link href="/tunes/new" style={{
            padding: '8px 18px', borderRadius: '8px', background: '#4ade80',
            color: '#0d0f14', fontWeight: 700, fontSize: '13px', textDecoration: 'none',
          }}>
            + Share Tune
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                background: '#13151c', borderRadius: '12px', height: '78px',
                opacity: 1 - i * 0.1, border: '1px solid rgba(255,255,255,0.04)',
              }} />
            ))}
          </div>
        ) : tunes.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '72px 24px',
            background: '#13151c', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>{'🏎️'}</div>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 8px', fontWeight: 700 }}>No tunes found</h3>
            <p style={{ color: '#475569', margin: '0 0 20px', fontSize: '14px' }}>
              Try changing filters or{' '}
              <button onClick={resetFilters} style={{
                background: 'none', border: 'none', color: '#facc15',
                cursor: 'pointer', fontSize: '14px', textDecoration: 'underline', padding: 0,
              }}>
                reset all
              </button>
            </p>
            <Link href="/tunes/new" style={{
              padding: '10px 24px', borderRadius: '9px', background: '#4ade80',
              color: '#0d0f14', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
            }}>
              + Be the first to share a tune
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tunes.map((tune, i) => (
              <>
                <TuneCardRow key={tune.id} tune={tune} />
                {(i + 1) % 8 === 0 && i < tunes.length - 1 && (
                  <AdUnit key={`ad-${i}`} slot="tune-list-infeed" format="infeed" style={{ margin: '4px 0' }} />
                )}
              </>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '32px', alignItems: 'center' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                cursor: page > 1 ? 'pointer' : 'not-allowed',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: page > 1 ? '#94a3b8' : '#334155', fontSize: '13px',
              }}
            >
              {'<- Prev'}
            </button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1
                : page <= 4        ? i + 1
                : page >= totalPages - 3 ? totalPages - 6 + i
                : page - 3 + i
              return (
                <button key={p} onClick={() => setPage(p)} style={{
                  padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                  background: page === p ? '#facc15' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${page === p ? '#facc15' : 'rgba(255,255,255,0.08)'}`,
                  color: page === p ? '#0d0f14' : '#94a3b8',
                  fontSize: '13px', fontWeight: page === p ? 700 : 400,
                }}>
                  {p}
                </button>
              )
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '8px 16px', borderRadius: '8px',
                cursor: page < totalPages ? 'pointer' : 'not-allowed',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: page < totalPages ? '#94a3b8' : '#334155', fontSize: '13px',
              }}
            >
              {'Next ->'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
