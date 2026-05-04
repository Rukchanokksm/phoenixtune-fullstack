'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { calculateTune, getTodayUsage, incrementUsage, DAILY_FREE_LIMIT } from '@/lib/calculator'
import { createClient } from '@/lib/supabase/client'
import type { CalculatorInput, Discipline, Drivetrain, PIClass, GameSlug } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────
const GAMES: { label: string; value: GameSlug; active: boolean }[] = [
  { label: 'Forza Horizon 5',   value: 'forza-horizon-5',    active: true },
  { label: 'Forza Horizon 6',   value: 'forza-horizon-6',    active: false },
  { label: 'The Crew Motorfest',value: 'the-crew-motorfest', active: true },
  { label: 'NFS Unbound',       value: 'nfs-unbound',        active: true },
]
const DRIVETRAINS: Drivetrain[] = ['FWD', 'RWD', 'AWD']
const PI_CLASSES: PIClass[]     = ['D', 'C', 'B', 'A', 'S1', 'S2', 'X']
const DISCIPLINES: { value: Discipline; label: string; emoji: string }[] = [
  { value: 'street',  label: 'Street',  emoji: '🏙' },
  { value: 'track',   label: 'Track',   emoji: '🏁' },
  { value: 'drift',   label: 'Drift',   emoji: '💨' },
  { value: 'rally',   label: 'Rally',   emoji: '🌲' },
  { value: 'offroad', label: 'Offroad', emoji: '🏔' },
  { value: 'drag',    label: 'Drag',    emoji: '⚡' },
]

// ─── Style helpers ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.07em',
  textTransform: 'uppercase', color: '#64748b', marginBottom: '6px',
}
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', padding: '9px 12px', color: '#e2e8f0', fontSize: '14px',
  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
}
const sectionTitle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: '#64748b', marginBottom: '10px', paddingBottom: '6px',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
}

// ─── Chip selector ────────────────────────────────────────────────────────────
function ChipGroup<T extends string>({
  options, value, onChange, color = '#d97706',
}: {
  options: { value: T; label: string; emoji?: string; disabled?: boolean }[]
  value: T; onChange: (v: T) => void; color?: string
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {options.map((o) => {
        const active = value === o.value
        return (
          <button key={o.value} type="button"
            disabled={o.disabled}
            onClick={() => !o.disabled && onChange(o.value)}
            style={{
              padding: '5px 12px', borderRadius: '7px', fontSize: '13px', fontWeight: 600,
              cursor: o.disabled ? 'not-allowed' : 'pointer',
              opacity: o.disabled ? 0.4 : 1,
              border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
              background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
              color: active ? color : '#94a3b8',
              transition: 'all 0.12s',
            }}>
            {o.emoji && <span style={{ marginRight: '4px' }}>{o.emoji}</span>}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Result row ───────────────────────────────────────────────────────────────
function ResultRow({ label, value, unit }: { label: string; value?: number; unit: string }) {
  if (value === undefined) return null
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'monospace' }}>
        {value > 0 ? value : value} {unit}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CalculatorPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isPremium, setIsPremium]   = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const [result, setResult]         = useState<ReturnType<typeof calculateTune> | null>(null)
  const [calculated, setCalculated] = useState(false)

  // Form state
  const [form, setForm] = useState<CalculatorInput>({
    gameId:     'forza-horizon-5',
    drivetrain: 'RWD',
    piClass:    'A',
    powerHp:    500,
    weightKg:   1400,
    discipline: 'track',
  })

  // Load auth + usage
  useEffect(() => {
    setUsageCount(getTodayUsage())
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('user_profiles').select('is_premium').eq('id', user.id).single()
      setIsPremium(!!data?.is_premium)
    })
  }, [])

  const isLimited   = !isPremium && usageCount >= DAILY_FREE_LIMIT
  const remaining   = Math.max(0, DAILY_FREE_LIMIT - usageCount)

  const handleCalculate = () => {
    if (isLimited) return
    const out = calculateTune(form)
    setResult(out)
    setCalculated(true)
    if (!isPremium) {
      incrementUsage()
      setUsageCount((c) => c + 1)
    }
  }

  const handleUpload = () => {
    if (!result) return
    const params = new URLSearchParams({
      gameId:     form.gameId,
      discipline: form.discipline,
      parameters: JSON.stringify(result),
    })
    router.push(`/tunes/new?${params.toString()}`)
  }

  const set = <K extends keyof CalculatorInput>(key: K, val: CalculatorInput[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  return (
    <div style={{ background: '#0d0f14', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 6px', color: '#f1f5f9' }}>
            Tune Calculator
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            กรอกข้อมูลรถ → รับค่า tune เริ่มต้นที่เหมาะสม
          </p>
        </div>

        {/* Usage badge (free user) */}
        {!isPremium && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', borderRadius: '8px', marginBottom: '28px',
            background: isLimited ? 'rgba(248,113,113,0.08)' : 'rgba(217,119,6,0.08)',
            border: `1px solid ${isLimited ? 'rgba(248,113,113,0.2)' : 'rgba(217,119,6,0.2)'}`,
            fontSize: '13px',
            color: isLimited ? '#f87171' : '#d97706',
          }}>
            {isLimited ? (
              <>⚠️ ใช้ครบ {DAILY_FREE_LIMIT} ครั้งแล้ววันนี้ —{' '}
                <button onClick={() => router.push('/premium')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fbbf24', fontWeight: 700, fontSize: '13px', padding: 0 }}>
                  อัปเกรด Premium
                </button>
                {' '}เพื่อใช้ไม่จำกัด
              </>
            ) : (
              <>⚡ Free: เหลือ {remaining}/{DAILY_FREE_LIMIT} ครั้งวันนี้</>
            )}
          </div>
        )}
        {isPremium && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px', marginBottom: '28px',
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
            fontSize: '13px', color: '#fbbf24', fontWeight: 600,
          }}>
            ⚡ PRO — ใช้ได้ไม่จำกัด
          </div>
        )}

        {/* Main layout: form left, result right */}
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* ── FORM ────────────────────────────────────────────────────────── */}
          <div style={{
            background: '#13151c', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            {/* Game */}
            <div>
              <label style={labelStyle}>Game</label>
              <ChipGroup
                options={GAMES.map((g) => ({ value: g.value, label: g.label, disabled: !g.active }))}
                value={form.gameId as GameSlug}
                onChange={(v) => set('gameId', v)}
              />
            </div>

            {/* Discipline */}
            <div>
              <label style={labelStyle}>Discipline</label>
              <ChipGroup
                options={DISCIPLINES}
                value={form.discipline}
                onChange={(v) => set('discipline', v)}
              />
            </div>

            {/* Drivetrain */}
            <div>
              <label style={labelStyle}>Drivetrain</label>
              <ChipGroup
                options={DRIVETRAINS.map((d) => ({ value: d, label: d }))}
                value={form.drivetrain}
                onChange={(v) => set('drivetrain', v)}
                color='#60a5fa'
              />
            </div>

            {/* PI Class */}
            <div>
              <label style={labelStyle}>PI Class</label>
              <ChipGroup
                options={PI_CLASSES.map((p) => ({ value: p, label: p }))}
                value={form.piClass}
                onChange={(v) => set('piClass', v)}
                color='#c084fc'
              />
            </div>

            {/* Power + Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Power (HP)</label>
                <input type="number" min={50} max={2000} step={10}
                  value={form.powerHp}
                  onChange={(e) => set('powerHp', Number(e.target.value))}
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(217,119,6,0.5)' }}
                  onBlur={(e)  => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Weight (kg)</label>
                <input type="number" min={500} max={3000} step={10}
                  value={form.weightKg}
                  onChange={(e) => set('weightKg', Number(e.target.value))}
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLElement).style.borderColor = 'rgba(217,119,6,0.5)' }}
                  onBlur={(e)  => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>

            {/* Power-to-weight hint */}
            <div style={{
              fontSize: '12px', color: '#475569', padding: '8px 10px',
              background: 'rgba(255,255,255,0.03)', borderRadius: '6px',
            }}>
              P/W ratio: <strong style={{ color: '#94a3b8' }}>
                {(form.powerHp / form.weightKg).toFixed(2)}
              </strong> hp/kg
            </div>

            {/* Calculate button */}
            <button
              onClick={handleCalculate}
              disabled={isLimited}
              style={{
                padding: '12px', borderRadius: '9px', fontWeight: 700, fontSize: '15px',
                cursor: isLimited ? 'not-allowed' : 'pointer',
                border: 'none', transition: 'background 0.15s',
                background: isLimited ? '#1e293b' : '#d97706',
                color: isLimited ? '#475569' : '#fff',
              }}>
              {isLimited ? '🔒 ต้อง Premium' : '🧮 คำนวณ Tune'}
            </button>
          </div>

          {/* ── RESULT ──────────────────────────────────────────────────────── */}
          {!calculated ? (
            <div style={{
              background: '#13151c', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '48px 24px', textAlign: 'center', color: '#475569',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏎</div>
              <p style={{ margin: 0, fontSize: '14px' }}>กรอกข้อมูลแล้วกด "คำนวณ Tune"</p>
            </div>
          ) : result ? (
            <div style={{
              background: '#13151c', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
            }}>
              {/* Result header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>
                    ผลการคำนวณ
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {form.discipline.toUpperCase()} · {form.drivetrain} · {form.piClass} · {form.powerHp}hp / {form.weightKg}kg
                  </div>
                </div>
                <button onClick={handleUpload}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    background: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)',
                    color: '#d97706', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(217,119,6,0.25)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(217,119,6,0.15)' }}
                >
                  Upload Tune นี้ →
                </button>
              </div>

              {/* ── Tires ── */}
              <div>
                <div style={sectionTitle}>🏎 Tires</div>
                <ResultRow label="Tire Pressure Front" value={result.tirePressureF} unit="PSI" />
                <ResultRow label="Tire Pressure Rear"  value={result.tirePressureR} unit="PSI" />
              </div>

              {/* ── Suspension ── */}
              <div>
                <div style={sectionTitle}>🔧 Suspension</div>
                <ResultRow label="Spring Rate Front" value={result.springRateF} unit="kgf/mm" />
                <ResultRow label="Spring Rate Rear"  value={result.springRateR} unit="kgf/mm" />
                <ResultRow label="Rebound Front"     value={result.reboundF}    unit="" />
                <ResultRow label="Rebound Rear"      value={result.reboundR}    unit="" />
                <ResultRow label="Bump Front"        value={result.bumpF}       unit="" />
                <ResultRow label="Bump Rear"         value={result.bumpR}       unit="" />
              </div>

              {/* ── Alignment ── */}
              <div>
                <div style={sectionTitle}>📐 Alignment</div>
                <ResultRow label="Camber Front" value={result.camberF} unit="°" />
                <ResultRow label="Camber Rear"  value={result.camberR} unit="°" />
                <ResultRow label="Toe Front"    value={result.toeF}    unit="°" />
                <ResultRow label="Toe Rear"     value={result.toeR}    unit="°" />
                <ResultRow label="ARB Front"    value={result.arbF}    unit="" />
                <ResultRow label="ARB Rear"     value={result.arbR}    unit="" />
              </div>

              {/* ── Differential ── */}
              <div>
                <div style={sectionTitle}>⚙️ Differential</div>
                <ResultRow label="Diff Accel" value={result.diffAccel} unit="%" />
                <ResultRow label="Diff Decel" value={result.diffDecel} unit="%" />
                {result.diffFront  !== undefined && <ResultRow label="Diff Front"  value={result.diffFront}  unit="%" />}
                {result.diffRear   !== undefined && <ResultRow label="Diff Rear"   value={result.diffRear}   unit="%" />}
                {result.diffCenter !== undefined && <ResultRow label="Diff Center" value={result.diffCenter} unit="%" />}
              </div>

              {/* ── Aero (if non-zero) ── */}
              {(result.aeroF || result.aeroR) ? (
                <div>
                  <div style={sectionTitle}>✈️ Aero</div>
                  <ResultRow label="Aero Front" value={result.aeroF} unit="" />
                  <ResultRow label="Aero Rear"  value={result.aeroR} unit="" />
                </div>
              ) : null}

              {/* ── Gearing ── */}
              <div>
                <div style={sectionTitle}>🔄 Gearing</div>
                <ResultRow label="Final Drive" value={result.finalDrive} unit="" />
              </div>

              {/* Disclaimer */}
              <p style={{ fontSize: '11px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                ⚠️ ค่าเหล่านี้เป็นจุดเริ่มต้น ควรปรับตาม feedback จากการขับจริง
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
