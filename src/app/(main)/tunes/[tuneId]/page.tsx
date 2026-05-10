'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { AdUnit } from '@/components/ads/AdUnit'

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

const PARAM_SECTIONS: Array<{
  title: string; emoji: string; color: string
  fields: Array<{ key: string; label: string; unit?: string }>
}> = [
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
    title: 'Differential', emoji: 'D', color: '#f472b6',
    fields: [
      { key: 'diffAccel',  label: 'Accel',  unit: '%' },
      { key: 'diffDecel',  label: 'Decel',  unit: '%' },
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hrs   = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 2)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs  < 24) return `${hrs}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TuneDetailPage({ params }: { params: Promise<{ tuneId: string }> }) {
  const { tuneId } = use(params)

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

  useEffect(() => {
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

  if (notFound) {
    return (
      <div style={{
        background: '#0d0f14', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>{'🏎️'}</div>
          <h1 style={{ color: '#f1f5f9', marginBottom: '8px' }}>Tune not found</h1>
          <p style={{ color: '#475569', marginBottom: '20px' }}>It may have been deleted or the URL is invalid.</p>
          <Link href="/tunes" style={{
            padding: '10px 24px', borderRadius: '9px', background: '#facc15',
            color: '#0d0f14', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
          }}>
            {'<- Browse Tunes'}
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
              <Link href="/" style={{ color: '#334155', textDecoration: 'none' }}>Home</Link>
              <span style={{ color: '#1e293b' }}>{'>'}</span>
              <Link href="/tunes" style={{ color: '#334155', textDecoration: 'none' }}>Tunes</Link>
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
                  FEATURED
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {tune.user && <Avatar username={tune.user.username} size={28} />}
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                {'by '}
                <Link href={`/profile/${tune.user?.username}`} style={{ color: accent, textDecoration: 'none', fontWeight: 600 }}>
                  {tune.user?.username ?? 'Unknown'}
                </Link>
              </span>
              <span style={{ color: '#1e293b' }}>{'·'}</span>
              <span style={{ fontSize: '13px', color: '#334155' }}>{timeAgo(tune.created_at)}</span>
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
                {saved ? 'Saved' : 'Save'}
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
                  {copied ? 'Copied!' : tune.share_code}
                </button>
              )}

              <div style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0' }}>
                <span style={{ fontSize: '13px', color: '#334155' }}>{tune.view_count} views</span>
              </div>
            </div>
          )}

          {!loading && tune?.car && (
            <div style={{
              background: '#13151c', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '20px 22px', marginBottom: '20px',
            }}>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '12px' }}>
                CAR
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
              {PARAM_SECTIONS.map(section => {
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
              Comments {comments.length > 0 && `(${comments.length})`}
            </div>

            <form onSubmit={handleComment} style={{ marginBottom: '20px' }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Leave a comment or feedback..."
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
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>

            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#334155', fontSize: '13px' }}>
                No comments yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {comments.map(comment => (
                  <div key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                    <Avatar username={comment.user?.username ?? '?'} size={30} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
                          {comment.user?.username ?? 'Unknown'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#334155' }}>
                          {timeAgo(comment.created_at)}
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
                STATS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <StatBox label="Upvotes" value={upvoteCount} />
                <StatBox label="Views" value={tune.view_count} />
                <StatBox label="Comments" value={comments.length} />
                {tune.game_version && <StatBox label="Version" value={tune.game_version} />}
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
                SHARE CODE
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
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          )}

          <div style={{
            background: '#13151c', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '14px', padding: '18px',
          }}>
            <div style={{ fontSize: '12px', color: '#334155', fontWeight: 700,
              letterSpacing: '0.08em', marginBottom: '12px' }}>
              LINKS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/tunes" style={{
                padding: '9px 14px', borderRadius: '8px', textDecoration: 'none',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#64748b', fontSize: '13px',
              }}>
                Browse Tunes
              </Link>
              <Link href="/tunes/new" style={{
                padding: '9px 14px', borderRadius: '8px', textDecoration: 'none',
                background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)',
                color: '#4ade80', fontSize: '13px',
              }}>
                + Share Your Tune
              </Link>
              <Link href="/calculator" style={{
                padding: '9px 14px', borderRadius: '8px', textDecoration: 'none',
                background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)',
                color: '#facc15', fontSize: '13px',
              }}>
                Tune Calculator
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
