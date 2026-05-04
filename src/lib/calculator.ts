import type { CalculatorInput, TuneParameters, Discipline, Drivetrain, PIClass } from '@/types'

// ─── Base values per discipline ───────────────────────────────────────────────
const BASE: Record<Discipline, {
  camberF: number; camberR: number
  toeF: number; toeR: number
  arbF: number; arbR: number
  diffAccel: number; diffDecel: number
  springMultiplier: number
  tirePressure: number
  reboundMult: number; bumpMult: number
  aeroF: number; aeroR: number
}> = {
  street: {
    camberF: -1.5, camberR: -1.0, toeF: 0.0, toeR: 0.1,
    arbF: 3, arbR: 3, diffAccel: 45, diffDecel: 30,
    springMultiplier: 0.60, tirePressure: 30,
    reboundMult: 0.60, bumpMult: 0.40,
    aeroF: 0, aeroR: 0,
  },
  track: {
    camberF: -2.0, camberR: -1.5, toeF: 0.0, toeR: 0.2,
    arbF: 5, arbR: 4, diffAccel: 55, diffDecel: 35,
    springMultiplier: 0.80, tirePressure: 28,
    reboundMult: 0.65, bumpMult: 0.45,
    aeroF: 150, aeroR: 200,
  },
  drift: {
    camberF: -3.5, camberR: -2.5, toeF: 0.2, toeR: -0.2,
    arbF: 2, arbR: 7, diffAccel: 85, diffDecel: 20,
    springMultiplier: 0.50, tirePressure: 32,
    reboundMult: 0.55, bumpMult: 0.35,
    aeroF: 0, aeroR: 100,
  },
  rally: {
    camberF: -1.0, camberR: -0.8, toeF: 0.1, toeR: 0.2,
    arbF: 2, arbR: 2, diffAccel: 60, diffDecel: 40,
    springMultiplier: 0.65, tirePressure: 26,
    reboundMult: 0.70, bumpMult: 0.50,
    aeroF: 0, aeroR: 0,
  },
  offroad: {
    camberF: -0.5, camberR: -0.3, toeF: 0.0, toeR: 0.1,
    arbF: 1, arbR: 1, diffAccel: 65, diffDecel: 45,
    springMultiplier: 0.55, tirePressure: 22,
    reboundMult: 0.75, bumpMult: 0.55,
    aeroF: 0, aeroR: 0,
  },
  drag: {
    camberF: 0.0, camberR: 0.0, toeF: 0.0, toeR: 0.0,
    arbF: 1, arbR: 8, diffAccel: 100, diffDecel: 15,
    springMultiplier: 1.00, tirePressure: 36,
    reboundMult: 0.50, bumpMult: 0.35,
    aeroF: 0, aeroR: 300,
  },
}

// ─── PI class scale factors ───────────────────────────────────────────────────
const PI_SPRING_SCALE: Record<PIClass, number> = {
  D: 0.70, C: 0.80, B: 0.90, A: 1.00, S1: 1.15, S2: 1.30, X: 1.50,
}
const PI_PRESSURE_OFFSET: Record<PIClass, number> = {
  D: -3, C: -2, B: -1, A: 0, S1: 1, S2: 2, X: 3,
}
const PI_CAMBER_EXTRA: Record<PIClass, number> = {
  D: 0.2, C: 0.1, B: 0.0, A: 0.0, S1: -0.1, S2: -0.2, X: -0.3,
}

// ─── Helper: round to 1 decimal ──────────────────────────────────────────────
const r1 = (n: number) => Math.round(n * 10) / 10

// ─── Main calculation function ────────────────────────────────────────────────
export function calculateTune(input: CalculatorInput): TuneParameters & {
  diffFront?: number; diffRear?: number; diffCenter?: number
} {
  const { discipline, drivetrain, piClass, powerHp, weightKg } = input
  const base = BASE[discipline]

  // ── Power-to-weight ratio influence ─────────────────────────────────────
  const pwr       = powerHp / weightKg                 // typically 0.1–1.5
  const pwrFactor = Math.min(1.5, Math.max(0.5, pwr))  // clamp

  // ── Spring rate ──────────────────────────────────────────────────────────
  const springBase = weightKg * base.springMultiplier * PI_SPRING_SCALE[piClass]
  // Front slightly stiffer than rear for most disciplines (except drag)
  const springF = r1(springBase * (discipline === 'drag' ? 0.90 : 1.05))
  const springR = r1(springBase * (discipline === 'drag' ? 1.10 : 0.95))

  // ── Rebound & Bump (derived from spring rate) ────────────────────────────
  const reboundF = r1(springF * base.reboundMult)
  const reboundR = r1(springR * base.reboundMult)
  const bumpF    = r1(springF * base.bumpMult)
  const bumpR    = r1(springR * base.bumpMult)

  // ── Tire pressure ────────────────────────────────────────────────────────
  const pressureBase = base.tirePressure + PI_PRESSURE_OFFSET[piClass]
  // Higher PWR → slightly higher pressure for stability
  const pressureAdj = r1(pressureBase + (pwrFactor - 1) * 1.5)
  const tirePressureF = Math.max(18, Math.min(45, pressureAdj))
  const tirePressureR = Math.max(18, Math.min(45, pressureAdj + (discipline === 'drag' ? 2 : 0)))

  // ── Camber ───────────────────────────────────────────────────────────────
  const camberExtra = PI_CAMBER_EXTRA[piClass]
  let camberF = r1(base.camberF + camberExtra)
  let camberR = r1(base.camberR + camberExtra * 0.7)

  // ── Drivetrain adjustments ───────────────────────────────────────────────
  let diffFront: number | undefined
  let diffRear:  number | undefined
  let diffCenter: number | undefined

  switch (drivetrain as Drivetrain) {
    case 'FWD':
      // More front camber, softer front spring (less weight over driven wheels)
      camberF = r1(camberF - 0.3)
      diffFront = base.diffAccel
      break

    case 'RWD':
      // Rear-biased: slightly more rear spring stiffness
      diffRear = base.diffAccel
      // Drift: even more aggressive rear diff
      if (discipline === 'drift') diffRear = Math.min(100, base.diffAccel + 10)
      break

    case 'AWD':
      // Split diff: front bias for street/rally, rear bias for track/drift
      diffFront  = discipline === 'drag' ? 50 : Math.max(20, base.diffAccel - 20)
      diffRear   = base.diffAccel
      diffCenter = discipline === 'drag' ? 60 : 50
      break
  }

  // ── Final drive — higher PWR = shorter gearing (lower final drive ratio) ──
  const finalDrive = r1(4.2 - pwrFactor * 0.8)

  // ── ARB ──────────────────────────────────────────────────────────────────
  // Higher PI / more power → slightly stiffer ARB
  const arbScale = 1 + (PI_SPRING_SCALE[piClass] - 1) * 0.3
  const arbF = r1(Math.min(10, base.arbF * arbScale))
  const arbR = r1(Math.min(10, base.arbR * arbScale))

  return {
    // Tires
    tirePressureF: r1(tirePressureF),
    tirePressureR: r1(tirePressureR),
    // Suspension
    springRateF: springF,
    springRateR: springR,
    reboundF,
    reboundR,
    bumpF,
    bumpR,
    // Alignment
    camberF,
    camberR,
    toeF: base.toeF,
    toeR: base.toeR,
    // ARB
    arbF,
    arbR,
    // Differential
    diffAccel:  base.diffAccel,
    diffDecel:  base.diffDecel,
    ...(diffFront  !== undefined && { diffFront }),
    ...(diffRear   !== undefined && { diffRear }),
    ...(diffCenter !== undefined && { diffCenter }),
    // Aero
    aeroF: base.aeroF,
    aeroR: base.aeroR,
    // Gearing
    finalDrive,
  }
}

// ─── Usage limit helpers (for page to use with localStorage) ──────────────────
export const DAILY_FREE_LIMIT = 3
export const STORAGE_KEY = 'rth_calc_usage'

export function getTodayUsage(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw) as { date: string; count: number }
    const today = new Date().toISOString().slice(0, 10)
    return date === today ? count : 0
  } catch {
    return 0
  }
}

export function incrementUsage(): void {
  if (typeof window === 'undefined') return
  const today = new Date().toISOString().slice(0, 10)
  const current = getTodayUsage()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: current + 1 }))
}
