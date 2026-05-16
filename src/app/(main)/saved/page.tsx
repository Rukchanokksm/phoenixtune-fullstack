'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PREMIUM_ENABLED } from '@/lib/premium'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { timeAgo as timeAgoLocale } from '@/lib/i18n/timeAgo'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TuneData {
  id: string
  title: string
  discipline: string
  upvotes: number
  view_count: number
  created_at: string
  updated_at?: string
  car:  { make: string; model: string; pi_class: string | null } | null
  game: { name: string; slug: string } | null
  user: { username: string; avatar_url?: string } | null
}

interface SavedTune {
  id: string
  folder_name: string
  created_at: string
  // Supabase may return single object or array depending on PostgREST version
  tune: TuneData | TuneData[] | null
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DISCIPLINE_STYLE: Record<string, { bg: string; color: string }> = {
  drift:   { bg: '#2a0f1a', color: '#f472b6' },
  track:   { bg: '#0f1a2a', color: '#60a5fa' },
  street:  { bg: '#1a0f2a', color: '#c084fc' },
  rally:   { bg: '#2a1f0f', color: '#fb923c' },
  offroad: { bg: '#2a2010', color: '#fbbf24' },
  drag:    { bg: '#2a1010', color: '#f87171' },
}

const PI_COLORS: Record<string, string> = {
  D: '#94a3b8', C: '#fbbf24', B: '#4ade80',
  A: '#60a5fa', S1: '#c084fc', S2: '#f472b6', X: '#f87171', R: '#e879f9',
}

const GAME_ACCENT: Record<string, string> = {
  'forza-horizon-5':    '#60a5fa',
  'forza-horizon-6':    '#c084fc',
  'the-crew-motorfest': '#fb923c',
  'nfs-unbound':        '#f87171',
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// Normalize tune — Supabase may return single object or array
function normalizeTune(raw: TuneData | TuneData[] | null): TuneData | null {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
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

function shortGameName(name: string) {
  return name
    .replace('Forza Horizon', 'FH')
    .replace('Need for Speed', 'NFS')
    .replace('The Crew Motorfest', 'TCM')
}

// ─── Tune Card Row ────────────────────────────────────────────────────────────

function SavedTuneCard({
  item,
  onUnsave,
  unsaving,
}: {
  item: SavedTune
  onUnsave: (tuneId: string) => void
  unsaving: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const { t, locale } = useLanguage()
  const S = t.saved
  const tune = normalizeTune(item.tune)
  if (!tune) return null

  const accent = tune.game ? GAME_ACCENT[tune.game.slug] ?? '#facc15' : '#facc15'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#13151c',
        border: `1px solid ${hovered ? accent + '55' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '12px', padding: '18px 20px',
        display: 'grid', gridTemplateColumns: '90px 1fr 130px 80px 90px',
        gap: '16px', alignItems: 'center', transition: 'border-color 0.15s',
      }}
    >
      {/* Discipline + PI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <DisciplineBadge d={tune.discipline} />
        {tune.car?.pi_class && <PIBadge pi={tune.car.pi_class} />}
      </div>

      {/* Title + car info */}
      <div>
        <Link href={`/tunes/${tune.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px', lineHeight: 1.3 }}>
            {tune.title}
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {tune.car && (
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {tune.car.make} {tune.car.model}
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
      </div>

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#1e3a5f,#0f2040)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', color: '#60a5fa', fontWeight: 700, flexShrink: 0,
        }}>
          {tune.user?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', lineHeight: 1.2 }}>
          {tune.user?.username ?? t.tunes.unknown}
        </div>
      </div>

      {/* Stats */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '17px', fontWeight: 800, color: '#f1f5f9' }}>
          <span style={{ color: '#facc15', marginRight: '3px' }}>^</span>
          {tune.upvotes}
        </div>
        <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>
          {tune.view_count} {S.views}
        </div>
        <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>
          {S.savedLabel} {timeAgoLocale(item.created_at, locale)}
        </div>
        {tune.updated_at && new Date(tune.updated_at).getTime() - new Date(tune.created_at).getTime() > 60_000 && (
          <div style={{ fontSize: '10px', color: '#60a5fa', marginTop: '2px', fontWeight: 600 }}>
            {S.edited}
          </div>
        )}
      </div>

      {/* Unsave button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onUnsave(tune.id)}
          disabled={unsaving}
          title="Remove from saved"
          style={{
            padding: '7px 12px', borderRadius: '8px', cursor: unsaving ? 'not-allowed' : 'pointer',
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
            color: unsaving ? '#334155' : '#f87171', fontSize: '12px', fontWeight: 600,
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
        >
          {unsaving ? '...' : S.unsave}
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function ComingSoonPlaceholder() {
  const { t } = useLanguage()
  const S = t.saved
  return (
    <div style={{ background: '#0d0f14', minHeight: '100vh', color: '#e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: '480px', textAlign: 'center' }}>
        <div style={{ fontSize: '54px', marginBottom: '18px' }}>🔖</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 10px', color: '#f1f5f9' }}>
          {S.comingSoon}
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
          {S.comingDesc}
        </p>
        <Link href="/tunes" style={{
          display: 'inline-block', padding: '10px 22px', borderRadius: '9px',
          background: '#facc15', color: '#0d0f14', fontWeight: 700, fontSize: '14px',
          textDecoration: 'none',
        }}>
          {S.browseTunesCta}
        </Link>
      </div>
    </div>
  )
}

export default function SavedPage() {
  const { t } = useLanguage()
  const S = t.saved

  const [items, setItems]       = useState<SavedTune[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [unsaving, setUnsaving] = useState<string | null>(null)
  const [error, setError]       = useState('')

  // ── Premium hold: render placeholder while the feature is gated off ──────
  if (!PREMIUM_ENABLED) return <ComingSoonPlaceholder />

  const perPage = 20

  const fetchSaved = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), perPage: String(perPage) })
      const res  = await fetch(`/api/saves?${params}`)
      if (res.status === 401) {
        setError(S.loginError)
        return
      }
      const json = await res.json()
      setItems(json.data ?? [])
      setTotal(json.total ?? 0)
    } catch {
      setError(S.loadError)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  async function handleUnsave(tuneId: string) {
    setUnsaving(tuneId)
    try {
      const res = await fetch(`/api/saves?tuneId=${tuneId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to unsave')
      setItems(prev => prev.filter(item => normalizeTune(item.tune)?.id !== tuneId))
      setTotal(prev => prev - 1)
    } catch {
      // silently fail — keep item in list
    } finally {
      setUnsaving(null)
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div style={{ background: '#0d0f14', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px 28px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 900, color: '#f1f5f9' }}>
              {S.title}
            </h1>
            {!loading && total > 0 && (
              <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                {total.toLocaleString()} {S.savedCount}
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
            {S.subtitle}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px' }}>

        {/* Error state */}
        {error && (
          <div style={{
            padding: '16px 20px', borderRadius: '10px', marginBottom: '24px',
            background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
            color: '#f87171', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                background: '#13151c', borderRadius: '12px', height: '78px',
                opacity: 1 - i * 0.12, border: '1px solid rgba(255,255,255,0.04)',
              }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '72px 24px',
            background: '#13151c', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '44px', marginBottom: '14px' }}>🔖</div>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 8px', fontWeight: 700 }}>{S.empty}</h3>
            <p style={{ color: '#475569', margin: '0 0 24px', fontSize: '14px' }}>
              {S.emptyDesc}
            </p>
            <Link href="/tunes" style={{
              padding: '10px 24px', borderRadius: '9px', background: '#facc15',
              color: '#0d0f14', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
            }}>
              {S.browseTunes}
            </Link>
          </div>
        )}

        {/* Tune list */}
        {!loading && items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map(item => (
              <SavedTuneCard
                key={item.id}
                item={item}
                onUnsave={handleUnsave}
                unsaving={unsaving === normalizeTune(item.tune)?.id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
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
              {S.prevPage}
            </button>
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1
                : page <= 4             ? i + 1
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
              {S.nextPage}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
