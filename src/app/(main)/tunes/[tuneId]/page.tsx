'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { AdUnit } from '@/components/ads/AdUnit'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { timeAgo as timeAgoLocale } from '@/lib/i18n/timeAgo'

// Types
interface Comment {
  id: string
  body: string
  created_at: string
  user: { id: string; username: string; avatar_url?: string } | null
}

interface TuneDetail {
  id: string
  discipline: string
  title: string
  description?: string
  parameters: Record<string, number | string | null>
  upvotes: number
  view_count: number
  share_code?: string
  game_version?: string
  is_featured: boolean
  created_at: string
  updated_at: string
  isSaved: boolean
  hasUpvoted: boolean
  car: {
    id: string; make: string; model: string; year?: number
    pi_class: string; drivetrain: string; weight_kg?: number; power_hp?: number
  } | null
  game: { id: string; name: string; slug: string } | null
  user: { id: string; username: string; avatar_url?: string; is_premium: boolean } | null
  comments: Comment[]
}

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
  A: '#60a5fa', S1: '#c084fc', S2: '#f472b6', X: '#f87171',
}

const GAME_ACCENT: Record<string, string> = {
  'forza-horizon-5':    '#60a5fa',
  'forza-horizon-6':    '#c084fc',
  'the-crew-motorfest': '#fb923c',
  'nfs-unbound':        '#f87171',
}

type ParamField = { key: string; label: string; unit?: string }
type ParamSection = { title: string; emoji: string; color: string; fields: ParamField[] }

const BASE_SECTIONS: ParamSection[] = [
  {
    title: 'Tires', emoji: 'O', color: '#60a5fa',
    fields: [
      { key: 'tirePressureF', label: 'Pressure Front', unit: 'PSI' },
      { key: 'tirePressureR', label: 'Pressure Rear',  unit: 'PSI' },
    ],
  },
  {
    title: 'Suspension', emoji: 'S', color: '#fbbf24',
    fields: [
      { key: 'springRateF', label: 'Spring Rate Front', unit: 'kgf/mm' },
      { key: 'springRateR', label: 'Spring Rate Rear',  unit: 'kgf/mm' },
      { key: 'reboundF',    label: 'Rebound Front' },
      { key: 'reboundR',    label: 'Rebound Rear'  },
      { key: 'bumpF',       label: 'Bump Front'    },
      { key: 'bumpR',       label: 'Bump Rear'     },
    ],
  },
  {
    title: 'Alignment', emoji: 'A', color: '#4ade80',
    fields: [
      { key: 'camberF', label: 'Camber Front', unit: 'deg' },
      { key: 'camberR', label: 'Camber Rear',  unit: 'deg' },
      { key: 'toeF',    label: 'Toe Front',    unit: 'deg' },
      { key: 'toeR',    label: 'Toe Rear',     unit: 'deg' },
    ],
  },
  {
    title: 'ARB', emoji: 'R', color: '#fb923c',
    fields: [
      { key: 'arbF', label: 'ARB Front' },
      { key: 'arbR', label: 'ARB Rear'  },
    ],
  },
  {
    title: 'Aero & Drive', emoji: 'V', color: '#a78bfa',
    fields: [
      { key: 'aeroF',      label: 'Downforce Front' },
      { key: 'aeroR',      label: 'Downforce Rear'  },
      { key: 'finalDrive', label: 'Final Drive'     },
    ],
  },
]

function getDiffSection(drivetrain?: string | null, forEdit = false): ParamSection {
  const awd: ParamField[] = [
    { key: 'diffFAccel', label: 'Front Accel',    unit: '%' },
    { key: 'diffFDecel', label: 'Front Decel',    unit: '%' },
    { key: 'diffRAccel', label: 'Rear Accel',     unit: '%' },
    { key: 'diffRDecel', label: 'Rear Decel',     unit: '%' },
    { key: 'diffCenter', label: 'Center Balance', unit: '%' },
  ]
  const fwd: ParamField[] = [
    { key: 'diffFAccel', label: 'Front Accel', unit: '%' },
    { key: 'diffFDecel', label: 'Front Decel', unit: '%' },
  ]
  const rwd: ParamField[] = [
    { key: 'diffRAccel', label: 'Rear Accel', unit: '%' },
    { key: 'diffRDecel', label: 'Rear Decel', unit: '%' },
  ]
  // Legacy fields — included in display mode so old tunes still show values
  const legacy: ParamField[] = forEdit ? [] : [
    { key: 'diffAccel', label: 'Accel (legacy)', unit: '%' },
    { key: 'diffDecel', label: 'Decel (legacy)', unit: '%' },
  ]

  let fields: ParamField[]
  if (drivetrain === 'AWD') fields = [...awd, ...legacy]
  else if (drivetrain === 'FWD') fields = [...fwd, ...legacy]
  else fields = [...rwd, ...legacy]  // RWD or unknown

  return { title: 'Differential', emoji: 'D', color: '#f472b6', fields }
}

function getParamSections(drivetrain?: string | null, forEdit = false): ParamSection[] {
  const [tires, susp, align, arb, aero] = BASE_SECTIONS
  return [tires, susp, align, arb, getDiffSection(drivetrain, forEdit), aero]
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '10px', padding: '14px 18px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#475569', marginTop: '3px', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function ParamRow({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: '13px', color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 700, color, fontFamily: 'monospace' }}>
        {value}{unit ? <span style={{ fontSize: '11px', color: '#475569', marginLeft: '3px' }}>{unit}</span> : null}
      </span>
    </div>
  )
}

function Avatar({ username, size = 36 }: { username: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,#1e3a5f,#0f2040)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.36), color: '#60a5fa', fontWeight: 700, flexShrink: 0,
    }}>
      {username[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function wasEdited(created: string, updated: string) {
  return new Date(updated).getTime() - new Date(created).getTime() > 60_000
}

export default function TuneDetailPage({ params }: { params: Promise<{ tuneId: string }> }) {
  const { tuneId } = use(params)
  const { t, locale } = useLanguage()
  const d = t.tuneDetail

  const [tune, setTune]               = useState<TuneDetail | null>(null)
  const [loading, setLoading]         = useState(true)
  const [notFound, setNotFound]       = useState(false)
  const [upvoted, setUpvoted]         = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)
  const [upvoting, setUpvoting]       = useState(false)
  const [saved, setSaved]             = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [comments, setComments]       = useState<Comment[]>([])
  const [copied, setCopied]           = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isEditing, setIsEditing]     = useState(false)
  const [editForm, setEditForm]       = useState<{
    title: string; description: string; shareCode: string; gameVersion: string
    parameters: Record<string, string>
  }>({ title: '', description: '', shareCode: '', gameVersion: '', parameters: {} })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError]     = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null)
    })

    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/tunes/${tuneId}`)
        if (res.status === 404) { setNotFound(true); return }
        const data: TuneDetail = await res.json()
        setTune(data)
        setUpvoted(data.hasUpvoted)
        setUpvoteCount(data.upvotes)
        setSaved(data.isSaved)
        setComments(data.comments ?? [])
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tuneId])

  async function handleUpvote() {
    if (upvoting) return
    setUpvoting(true)
    const next = !upvoted
    setUpvoted(next)
    setUpvoteCount(c => c + (next ? 1 : -1))
    try {
      await fetch(`/api/tunes/${tuneId}/upvote`, { method: next ? 'POST' : 'DELETE' })
    } catch {
      setUpvoted(!next)
      setUpvoteCount(c => c + (next ? -1 : 1))
    } finally {
      setUpvoting(false)
    }
  }

  async function handleSave() {
    const next = !saved
    setSaved(next)
    try {
      await fetch('/api/saves', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tuneId }),
      })
    } catch {
      setSaved(!next)
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || submittingComment) return
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/tunes/${tuneId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentText.trim() }),
      })
      if (res.ok) {
        const newComment = await res.json()
        setComments(prev => [newComment, ...prev])
        setCommentText('')
      }
    } finally {
      setSubmittingComment(false)
    }
  }

  function copyShareCode() {
    if (tune?.share_code) {
      navigator.clipboard.writeText(tune.share_code).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  function openEdit() {
    if (!tune) return
    const params: Record<string, string> = {}
    for (const [k, v] of Object.entries(tune.parameters)) {
      if (v !== null && v !== undefined && v !== '') params[k] = String(v)
    }
    setEditForm({
      title:       tune.title,
      description: tune.description ?? '',
      shareCode:   tune.share_code  ?? '',
      gameVersion: tune.game_version ?? '',
      parameters:  params,
    })
    setEditError('')
    setIsEditing(true)
  }

  async function handleEdit() {
    if (!tune || editLoading) return
    if (!editForm.title.trim()) { setEditError(d.titleRequired); return }
    setEditLoading(true)
    setEditError('')
    try {
      const params: Record<string, number | null> = {}
      for (const [k, v] of Object.entries(editForm.parameters)) {
        params[k] = v.trim() !== '' ? Number(v) : null
      }
      const res = await fetch(`/api/tunes/${tuneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:        editForm.title.trim(),
          description:  editForm.description.trim() || null,
          shareCode:    editForm.shareCode.trim()   || null,
          gameVersion:  editForm.gameVersion.trim() || null,
          parameters:   params,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setEditError(d.error ?? d.errGeneric)
        return
      }
      const updated: TuneDetail = await res.json()
      setTune(prev => prev ? { ...prev, ...updated } : prev)
      setIsEditing(false)
    } catch {
      setEditError(d.errGeneric)
    } finally {
      setEditLoading(false)
    }
  }

  if (notFound) {
    return (
      <div style={{
        background: '#0d0f14', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{'🏎️'}</div>
          <h1 style={{ color: '#f1f5f9', marginBottom: '8px' }}>{d.notFoundTitle}</h1>
          <p style={{ color: '#475569', marginBottom: '20px' }}>{d.notFoundDesc}</p>
          <Link href="/tunes" style={{
            padding: '10px 24px', borderRadius: '9px', background: '#facc15',
            color: '#0d0f14', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
          }}>
            {d.backTunes}
          </Link>
        </div>
      </div>
    )
  }

  const accent = tune?.game ? GAME_ACCENT[tune.game.slug] ?? '#facc15' : '#facc15'
  const ds = tune ? (DISCIPLINE_STYLE[tune.discipline] ?? { bg: '#1e293b', color: '#94a3b8' }) : null

  return (
    <div style={{ background: '#0d0f14', minHeight: '100vh', color: '#e2e8f0' }}>

      {loading ? (
        <div style={{ height: '180px', background: '#13151c', borderBottom: '1px solid rgba(255,255,255,0.06)' }} />
      ) : tune && (
        <div style={{
          background: `linear-gradient(135deg, ${accent}18, #0d0f14)`,
          borderBottom: `1px solid ${accent}22`,
          padding: '36px 24px 32px',
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <Link href="/" style={{ color: '#334155', textDecoration: 'none' }}>{d.home}</Link>
              <span style={{ color: '#1e293b' }}>{'>'}</span>
              <Link href="/tunes" style={{ color: '#334155', textDecoration: 'none' }}>{d.breadTunes}</Link>
              <span style={{ color: '#1e293b' }}>{'>'}</span>
              <span style={{ color: accent }}>{tune.title}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {ds && (
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em',
                  textTransform: 'uppercase', background: ds.bg, color: ds.color,
                }}>
                  {tune.discipline}
                </span>
              )}
              {tune.car && (
                <span style={{
                  padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 800,
                  fontFamily: 'monospace', background: 'rgba(255,255,255,0.06)',
                  color: PI_COLORS[tune.car.pi_class] ?? '#94a3b8',
                }}>
                  {tune.car.pi_class}
                </span>
              )}
              {tune.is_featured && (
                <span style={{
                  padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                  background: 'rgba(250,204,21,0.15)', color: '#facc15', letterSpacing: '0.06em',
                }}>
                  {d.featured}
                </span>
              )}
              {tune.game && (
                <span style={{
                  padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                  background: accent + '20', color: accent,
                }}>
                  {tune.game.name}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, margin: '0 0 8px', color: '#f1f5f9' }}>
              {tune.title}
            </h1>

            {tune.description && (
              <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b', maxWidth: '600px', lineHeight: 1.6 }}>
                {tune.description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {tune.user && <Avatar username={tune.user.username} size={28} />}
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {d.by}{' '}
                <Link href={`/profile/${tune.user?.username}`} style={{ color: accent, textDecoration: 'none', fontWeight: 600 }}>
                  {tune.user?.username ?? t.tunes.unknown}
                </Link>
              </span>
              <span style={{ color: '#1e293b' }}>{'·'}</span>
              <span style={{ fontSize: '13px', color: '#334155' }}>{timeAgoLocale(tune.created_at, locale)}</span>
              {wasEdited(tune.created_at, tune.updated_at) && (
                <>
                  <span style={{ color: '#1e293b' }}>{'·'}</span>
                  <span style={{ fontSize: '12px', color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '2px 8px', borderRadius: '5px', fontWeight: 600 }}>
                    {t.tunes.edited} {timeAgoLocale(tune.updated_at, locale)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

        <div style={{ flex: '1', minWidth: '300px' }}>

          {!loading && tune && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button onClick={handleUpvote} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 20px', borderRadius: '9px', cursor: 'pointer',
                background: upvoted ? '#facc15' : 'rgba(250,204,21,0.08)',
                border: `1px solid ${upvoted ? '#facc15' : 'rgba(250,204,21,0.25)'}`,
                color: upvoted ? '#0d0f14' : '#facc15',
                fontSize: '14px', fontWeight: 700, transition: 'all 0.15s',
              }}>
                {upvoted ? '^' : '^'} {upvoteCount}
              </button>

              <button onClick={handleSave} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '10px 18px', borderRadius: '9px', cursor: 'pointer',
                background: saved ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${saved ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: saved ? '#4ade80' : '#94a3b8',
                fontSize: '14px', fontWeight: 600, transition: 'all 0.15s',
              }}>
                {saved ? d.saved : d.save}
              </button>

              {tune.share_code && (
                <button onClick={copyShareCode} style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '10px 18px', borderRadius: '9px', cursor: 'pointer',
                  background: copied ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${copied ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: copied ? '#60a5fa' : '#94a3b8',
                  fontSize: '14px', fontWeight: 600, transition: 'all 0.15s',
                  fontFamily: 'monospace',
                }}>
                  {copied ? d.copied : tune.share_code}
                </button>
              )}

              <div style={{ flex: 1 }} />

              {currentUserId === tune.user?.id && (
                <button onClick={isEditing ? () => setIsEditing(false) : openEdit} style={{
                  padding: '10px 18px', borderRadius: '9px', cursor: 'pointer',
                  background: isEditing ? 'rgba(248,113,113,0.08)' : 'rgba(250,204,21,0.08)',
                  border: `1px solid ${isEditing ? 'rgba(248,113,113,0.3)' : 'rgba(250,204,21,0.25)'}`,
                  color: isEditing ? '#f87171' : '#facc15',
                  fontSize: '14px', fontWeight: 600, transition: 'all 0.15s',
                }}>
                  {isEditing ? d.cancel : d.editTune}
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0' }}>
                <span style={{ fontSize: '13px', color: '#334155' }}>{tune.view_count} {d.views.toLowerCase()}</span>
              </div>
            </div>
          )}

          {!loading && tune?.car && (
            <div style={{
              background: '#13151c', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '20px 22px', marginBottom: '20px',
            }}>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '12px' }}>
                {d.car}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
                {tune.car.year && <span style={{ color: '#475569', fontWeight: 600 }}>{tune.car.year}{' '}</span>}
                {tune.car.make} {tune.car.model}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800,
                  background: 'rgba(255,255,255,0.06)', color: PI_COLORS[tune.car.pi_class] ?? '#94a3b8',
                  fontFamily: 'monospace',
                }}>
                  PI {tune.car.pi_class}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', color: '#64748b',
                }}>
                  {tune.car.drivetrain}
                </span>
                {tune.car.power_hp && (
                  <span style={{
                    padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    background: 'rgba(251,146,60,0.08)', color: '#fb923c',
                  }}>
                    {tune.car.power_hp} HP
                  </span>
                )}
                {tune.car.weight_kg && (
                  <span style={{
                    padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    background: 'rgba(255,255,255,0.04)', color: '#64748b',
                  }}>
                    {tune.car.weight_kg} kg
                  </span>
                )}
              </div>
            </div>
          )}

          {isEditing && tune && (
            <div style={{ background: '#13151c', border: '1px solid rgba(250,204,21,0.25)', borderRadius: '14px', padding: '22px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#facc15', letterSpacing: '0.06em', marginBottom: '16px' }}>{d.editTitle}</div>

              {editError && (
                <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '14px' }}>
                  {editError}
                </div>
              )}

              {/* Basic fields */}
              {[
                { label: d.titleField, key: 'title' as const, placeholder: d.titlePlaceholder },
                { label: d.descField, key: 'description' as const, placeholder: d.descPlaceholder },
                { label: d.shareCodeField, key: 'shareCode' as const, placeholder: d.shareCodePlaceholder },
                { label: d.gameVersionField, key: 'gameVersion' as const, placeholder: d.versionPlaceholder },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '5px' }}>{f.label}</label>
                  <input
                    value={editForm[f.key]}
                    onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '9px 12px', boxSizing: 'border-box', background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              ))}

              {/* Car info — read-only */}
              {tune.car && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{tune.car.year ? `${tune.car.year} ` : ''}{tune.car.make} {tune.car.model}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontFamily: 'monospace' }}>{tune.car.pi_class}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '5px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{tune.car.drivetrain}</span>
                  <span style={{ fontSize: '11px', color: '#334155' }}>{d.carReadOnly}</span>
                </div>
              )}

              {/* Parameters */}
              {getParamSections(tune.car?.drivetrain, true).map(section => (
                <div key={section.title} style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: section.color, letterSpacing: '0.07em', marginBottom: '8px' }}>{section.title.toUpperCase()}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {section.fields.map(f => (
                      <div key={f.key}>
                        <label style={{ display: 'block', fontSize: '11px', color: '#475569', marginBottom: '3px' }}>
                          {f.label}{f.unit ? ` (${f.unit})` : ''}
                        </label>
                        <input
                          type="number"
                          value={editForm.parameters[f.key] ?? ''}
                          onChange={e => setEditForm(p => ({ ...p, parameters: { ...p.parameters, [f.key]: e.target.value } }))}
                          style={{ width: '100%', padding: '7px 10px', boxSizing: 'border-box', background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '7px', color: section.color, fontSize: '13px', fontFamily: 'monospace', outline: 'none' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button onClick={handleEdit} disabled={editLoading} style={{ flex: 1, padding: '10px', borderRadius: '9px', border: 'none', background: editLoading ? '#334155' : '#facc15', color: '#0d0f14', fontWeight: 700, fontSize: '14px', cursor: editLoading ? 'not-allowed' : 'pointer' }}>
                  {editLoading ? d.saving : d.saveChanges}
                </button>
                <button onClick={() => setIsEditing(false)} style={{ padding: '10px 20px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontSize: '14px', cursor: 'pointer' }}>
                  {d.cancel}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[120, 200, 150, 100].map((h, i) => (
                <div key={i} style={{
                  background: '#13151c', borderRadius: '14px', height: h,
                  border: '1px solid rgba(255,255,255,0.04)',
                }} />
              ))}
            </div>
          ) : tune && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {getParamSections(tune.car?.drivetrain).map(section => {
                const filled = section.fields.filter(f => {
                  const v = tune.parameters[f.key]
                  return v !== null && v !== undefined && v !== ''
                })
                if (filled.length === 0) return null
                return (
                  <div key={section.title} style={{
                    background: '#13151c', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px', padding: '18px 20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: section.color }}>
                        {section.emoji}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>
                        {section.title}
                      </span>
                      <div style={{ flex: 1 }} />
                      <div style={{ width: '28px', height: '2px', background: section.color, borderRadius: '2px' }} />
                    </div>
                    {filled.map(f => {
                      const val = tune.parameters[f.key]
                      return (
                        <ParamRow
                          key={f.key}
                          label={f.label}
                          value={String(val)}
                          unit={f.unit}
                          color={section.color}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          <AdUnit slot="tune-detail-banner" format="horizontal" style={{ margin: '20px 0' }} />

          <div style={{
            background: '#13151c', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '20px 22px', marginTop: '0',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>
              {d.commentTitle} {comments.length > 0 && `(${comments.length})`}
            </div>

            <form onSubmit={handleComment} style={{ marginBottom: '20px' }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={d.commentPlaceholder}
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                  background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', color: '#f1f5f9', fontSize: '14px',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  style={{
                    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
                    background: commentText.trim() ? '#4ade80' : '#1e293b',
                    color: commentText.trim() ? '#0d0f14' : '#334155',
                    fontWeight: 700, fontSize: '13px', border: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {submittingComment ? d.posting : d.postComment}
                </button>
              </div>
            </form>

            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#334155', fontSize: '13px' }}>
                {d.noComments}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {comments.map(comment => (
                  <div key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                    <Avatar username={comment.user?.username ?? '?'} size={30} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
                          {comment.user?.username ?? t.tunes.unknown}
                        </span>
                        <span style={{ fontSize: '11px', color: '#334155' }}>
                          {timeAgoLocale(comment.created_at, locale)}
                        </span>
                      </div>
                      <div style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {comment.body}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ width: '240px', flexShrink: 0 }}>

          {!loading && tune && (
            <div style={{
              background: '#13151c', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '18px', marginBottom: '16px',
            }}>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 700,
                letterSpacing: '0.08em', marginBottom: '12px' }}>
                {d.stats}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <StatBox label={d.upvotes} value={upvoteCount} />
                <StatBox label={d.views} value={tune.view_count} />
                <StatBox label={d.comments} value={comments.length} />
                {tune.game_version && <StatBox label={d.version} value={tune.game_version} />}
              </div>
            </div>
          )}

          {!loading && tune?.share_code && (
            <div style={{
              background: 'linear-gradient(135deg,#0f1a2a,#0d0f14)',
              border: `1px solid ${accent}33`,
              borderRadius: '14px', padding: '18px', marginBottom: '16px',
            }}>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 700,
                letterSpacing: '0.08em', marginBottom: '10px' }}>
                {d.shareCode}
              </div>
              <div style={{
                fontSize: '20px', fontWeight: 900, color: accent,
                fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '10px',
              }}>
                {tune.share_code}
              </div>
              <button onClick={copyShareCode} style={{
                width: '100%', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                background: copied ? accent + '22' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${copied ? accent + '44' : 'rgba(255,255,255,0.08)'}`,
                color: copied ? accent : '#64748b', fontSize: '13px', fontWeight: 600,
                transition: 'all 0.15s',
              }}>
                {copied ? d.copied : d.copyCode}
              </button>
            </div>
          )}

          <div style={{
            background: '#13151c', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '18px',
          }}>
            <div style={{ fontSize: '12px', color: '#334155', fontWeight: 700,
              letterSpacing: '0.08em', marginBottom: '12px' }}>
              {d.links}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/tunes" style={{
                padding: '9px 14px', borderRadius: '8px', textDecoration: 'none',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#64748b', fontSize: '13px',
              }}>
                {d.browseTunes}
              </Link>
              <Link href="/tunes/new" style={{
                padding: '9px 14px', borderRadius: '8px', textDecoration: 'none',
                background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)',
                color: '#4ade80', fontSize: '13px',
              }}>
                {d.shareTune}
              </Link>
              <Link href="/calculator" style={{
                padding: '9px 14px', borderRadius: '8px', textDecoration: 'none',
                background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)',
                color: '#facc15', fontSize: '13px',
              }}>
                {d.tuneCalc}
              </Link>
              {tune?.game && (
                <Link href={`/games/${tune.game.slug}`} style={{
                  padding: '9px 14px', borderRadius: '8px', textDecoration: 'none',
                  background: accent + '08', border: `1px solid ${accent}20`,
                  color: accent, fontSize: '13px',
                }}>
                  {tune.game.name.replace('Forza Horizon', 'FH').replace('Need for Speed', 'NFS')}
                </Link>
              )}
            </div>
          </div>

          <AdUnit slot="tune-detail-sidebar" format="rectangle" style={{ marginTop: '16px' }} />

        </div>
      </div>
    </div>
  )
}
