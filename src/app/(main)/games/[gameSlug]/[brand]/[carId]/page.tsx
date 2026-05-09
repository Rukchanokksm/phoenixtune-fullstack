'use client'

import { useState, useEffect, use, Fragment } from 'react'
import Link from 'next/link'
import { AdUnit } from '@/components/ads/AdUnit'

const GAME_META: Record<string, { name: string; accent: string }> = {
  'forza-horizon-5': { name: 'Forza Horizon 5', accent: '#60a5fa' },
  'forza-horizon-6': { name: 'Forza Horizon 6', accent: '#c084fc' },
  'nfs-unbound':     { name: 'NFS Unbound',     accent: '#f87171' },
}

const PI_COLOR: Record<string, string> = {
  D:'#a3e635', C:'#facc15', B:'#fb923c', A:'#f87171', S1:'#c084fc', X:'#60a5fa',
}

const DISCIPLINES = [
  { id: '',         label: 'ทั้งหมด' },
  { id: 'road',     label: '🏁 Road' },
  { id: 'dirt',     label: '🌲 Dirt' },
  { id: 'cross',    label: '⛰️ Cross Country' },
  { id: 'street',   label: '🌆 Street' },
  { id: 'drag',     label: '⚡ Drag' },
  { id: 'drift',    label: '💨 Drift' },
]

const PI_CLASSES = ['', 'D', 'C', 'B', 'A', 'S1', 'X']

type Tune = {
  id: string
  title: string
  description: string | null
  discipline: string
  upvotes: number
  view_count: number
  share_code: string | null
  created_at: string
  car: { id: string; make: string; model: string; year: number; pi_class: string; drivetrain: string } | null
  user: { username: string; avatar_url: string | null; is_premium: boolean } | null
}

type Car = { id: string; make: string; model: string; year: number; pi_class: string; drivetrain: string }

export default function CarTunesPage({ params }: { params: Promise<{ gameSlug: string; brand: string; carId: string }> }) {
  const { gameSlug, brand, carId } = use(params)
  const brandName = decodeURIComponent(brand)
  const meta = GAME_META[gameSlug] ?? { name: gameSlug, accent: '#64748b' }

  const [car, setCar] = useState<Car | null>(null)
  const [tunes, setTunes] = useState<Tune[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const [filterClass, setFilterClass]      = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest')

  // Fetch car info
  useEffect(() => {
    fetch(`/api/cars/${carId}`)
      .then(r => r.json())
      .then(data => setCar(data.car ?? null))
      .catch(() => {})
  }, [carId])

  // Fetch tunes
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      carId,
      sortBy,
      page: String(page),
      perPage: '20',
    })
    if (filterClass)      params.set('piClass', filterClass)
    if (filterDiscipline) params.set('discipline', filterDiscipline)

    fetch(`/api/tunes?${params}`)
      .then(r => r.json())
      .then(data => {
        setTunes(data.data ?? [])
        setTotal(data.total ?? 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [carId, filterClass, filterDiscipline, sortBy, page])

  // Reset page on filter change
  const handleFilter = (fn: () => void) => { fn(); setPage(1) }

  const perPage = 20
  const totalPages = Math.ceil(total / perPage)

  return (
    <div style={{ background: '#0d0f14', minHeight: '100vh', color: '#e2e8f0' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e2330', background: '#0f1117' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '12px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <Link href={`/games/${gameSlug}`} style={{ color: '#64748b', textDecoration: 'none' }}>{meta.name}</Link>
            <span>›</span>
            <Link href={`/games/${gameSlug}/${encodeURIComponent(brandName)}`} style={{ color: '#64748b', textDecoration: 'none' }}>{brandName}</Link>
            <span>›</span>
            <span style={{ color: meta.accent }}>{car ? `${car.year} ${car.model}` : '...'}</span>
          </div>

          {/* Car title */}
          {car && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#f1f5f9' }}>
                {car.year} {car.make} {car.model}
              </h1>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px',
                  background: (PI_COLOR[car.pi_class] ?? '#64748b') + '22',
                  color: PI_COLOR[car.pi_class] ?? '#64748b',
                  border: `1px solid ${(PI_COLOR[car.pi_class] ?? '#64748b')}44` }}>
                  {car.pi_class}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px',
                  background: '#1e2330', color: '#94a3b8', border: '1px solid #2a2f3f' }}>
                  {car.drivetrain}
                </span>
              </div>
              <span style={{ fontSize: '13px', color: '#475569', marginLeft: 'auto' }}>{total} tune{total !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>

        {/* Filter bar */}
        <div style={{ background: '#111318', border: '1px solid #1e2330', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>

          {/* Sort */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['newest', 'popular'] as const).map(s => (
              <button key={s} onClick={() => handleFilter(() => setSortBy(s))}
                style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', border: 'none',
                  background: sortBy === s ? meta.accent : '#1a1d24',
                  color: sortBy === s ? '#0d0f14' : '#94a3b8' }}>
                {s === 'newest' ? '🕐 ล่าสุด' : '🔥 ยอดนิยม'}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '24px', background: '#1e2330', flexShrink: 0 }} />

          {/* Class filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Class:</span>
            {PI_CLASSES.map(cls => (
              <button key={cls || 'all'} onClick={() => handleFilter(() => setFilterClass(cls))}
                style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer',
                  background: filterClass === cls ? (PI_COLOR[cls] ?? meta.accent) + '33' : '#1a1d24',
                  color: filterClass === cls ? (PI_COLOR[cls] ?? meta.accent) : '#64748b',
                  border: `1px solid ${filterClass === cls ? (PI_COLOR[cls] ?? meta.accent) + '66' : '#2a2f3f'}` }}>
                {cls || 'All'}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '24px', background: '#1e2330', flexShrink: 0 }} />

          {/* Discipline filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Type:</span>
            {DISCIPLINES.map(d => (
              <button key={d.id} onClick={() => handleFilter(() => setFilterDiscipline(d.id))}
                style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer',
                  background: filterDiscipline === d.id ? meta.accent + '22' : '#1a1d24',
                  color: filterDiscipline === d.id ? meta.accent : '#64748b',
                  border: `1px solid ${filterDiscipline === d.id ? meta.accent + '55' : '#2a2f3f'}` }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tunes list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '10px', background: '#13151c', border: '1px solid rgba(255,255,255,0.04)', opacity: 1 - i * 0.15 }}>
                <div style={{ height: '36px', width: '36px', borderRadius: '8px', background: '#1e2130', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '14px', borderRadius: '4px', background: '#1e2130', marginBottom: '6px', width: `${50 + (i % 3) * 15}%` }} />
                  <div style={{ height: '11px', borderRadius: '4px', background: '#161820', width: '35%' }} />
                </div>
                <div style={{ height: '11px', width: '60px', borderRadius: '4px', background: '#161820' }} />
                <div style={{ height: '11px', width: '40px', borderRadius: '4px', background: '#161820' }} />
              </div>
            ))}
          </div>
        ) : tunes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#475569' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
            <p style={{ fontSize: '16px', margin: '0 0 8px', color: '#64748b' }}>ยังไม่มี tune สำหรับรถคันนี้</p>
            <p style={{ fontSize: '13px', margin: '0 0 24px' }}>เป็นคนแรกที่แชร์ tune!</p>
            <Link href="/tunes/new" style={{ padding: '11px 24px', borderRadius: '10px', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              + แชร์ Tune แรก
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tunes.map((tune, i) => (<>
              {i > 0 && i % 6 === 0 && (
                <AdUnit key={`ad-${i}`} slot="car-detail-infeed" format="infeed" style={{ margin: '4px 0' }} />
              )}
              <Link key={tune.id} href={`/tunes/${tune.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#111318', border: '1px solid #1e2130', borderRadius: '12px', padding: '18px 22px',
                  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = meta.accent + '55'; el.style.background = '#13161f' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#1e2130'; el.style.background = '#111318' }}>

                  {/* Upvotes */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '44px',
                    padding: '8px', background: '#0d0f14', borderRadius: '8px', border: '1px solid #1e2330' }}>
                    <span style={{ fontSize: '16px' }}>▲</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#f1f5f9' }}>{tune.upvotes}</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>{tune.title}</div>
                    {tune.description && (
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '500px' }}>
                        {tune.description}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {tune.discipline && (
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '5px',
                          background: '#1e2330', color: '#94a3b8', border: '1px solid #2a2f3f' }}>
                          {tune.discipline}
                        </span>
                      )}
                      {tune.share_code && (
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569' }}>
                          📋 {tune.share_code}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#475569' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>{tune.user?.username ?? 'Unknown'}</span>
                    </div>
                    <div>{new Date(tune.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                    <div style={{ marginTop: '4px' }}>👁 {tune.view_count}</div>
                  </div>
                </div>
              </Link>
            </>))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                background: '#111318', border: '1px solid #1e2330', color: page === 1 ? '#2a2f3f' : '#94a3b8', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>
              ← ก่อนหน้า
            </button>
            <span style={{ padding: '8px 16px', fontSize: '13px', color: '#64748b' }}>
              {page} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                background: '#111318', border: '1px solid #1e2330', color: page === totalPages ? '#2a2f3f' : '#94a3b8', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>
              ถัดไป →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
