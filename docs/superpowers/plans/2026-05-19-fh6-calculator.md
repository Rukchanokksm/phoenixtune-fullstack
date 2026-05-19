# FH6 Tune Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the FH5 tune-calculator engine with an FH6 engine whose baselines and formulas follow the user's FH6 tuning guide.

**Architecture:** Three files change. `calculator.ts` is a pure-function engine; `page.tsx` is its only consumer; `messages.ts` holds i18n. The engine type changes (`torqueNm`→`powerKw`, new `Discipline` member, new `AeroResult`/`GearResult` shapes) break `page.tsx`'s type-check, so the engine and the page are updated in the **same task / same commit** to keep `npm run build` green at every commit.

**Tech Stack:** Next.js 16, TypeScript, React. No test runner is configured (`CLAUDE.md`); verification is `npm run build`, which runs the production build + full type-check.

---

## File Structure

- `src/lib/calculator.ts` — engine, full rewrite (pure functions, one responsibility: input → tune result)
- `src/lib/i18n/messages.ts` — i18n keys (EN + TH; a missing TH key is a compile error)
- `src/app/(main)/calculator/page.tsx` — UI; consumes the engine

---

## Task 1: i18n keys (messages.ts)

Adds/renames calc i18n keys. Standalone — `npm run build` stays green after this task.

**Files:**
- Modify: `src/lib/i18n/messages.ts` — union type (line ~234, ~243), EN `calc` object (line ~781), TH `calc` object (line ~1341)

- [ ] **Step 1: Update the `calc` union type**

In `messages.ts`, in the `calc: Record<...>` union (starts line ~224), change `"torque"` to `"power"`, change `"gearDefault"` to `"gearDragNote"`, and add `"casterNote"`. Find:

```ts
        | "torque"
```
Replace with:
```ts
        | "power"
```

Find:
```ts
        | "gearDefault"
        | "gearNote"
```
Replace with:
```ts
        | "gearDragNote"
        | "gearNote"
        | "casterNote"
```

- [ ] **Step 2: Update the EN `calc` object**

In the EN `calc` object (line ~781), find:
```ts
            torque: "Torque",
```
Replace with:
```ts
            power: "Power",
```

Find:
```ts
            gearDefault: "Use Default",
            gearNote:
                "Gear ratios depend on individual car mods. Use the default then adjust Final Drive per track.",
```
Replace with:
```ts
            gearDragNote:
                "Drag: put top gear at the far right, spread the lower gears evenly, then tune 1st gear on the drag strip.",
            gearNote:
                "Final Drive is calculated from power. Gear ratios still depend on car mods — fine-tune so top gear hits redline at the end of the longest straight.",
            casterNote:
                "FH6 is sensitive to caster above 6.0° — the car may feel snappy on turn-in.",
```

- [ ] **Step 3: Update the TH `calc` object**

In the TH `calc` object (line ~1341), find:
```ts
            torque: "แรงบิด",
```
Replace with:
```ts
            power: "กำลังเครื่อง",
```

Find:
```ts
            gearDefault: "ใช้ค่า Default",
            gearNote:
                "ค่า Gear Ratio ขึ้นอยู่กับของแต่งเฉพาะรถแต่ละคัน แนะนำให้ใช้ค่า Default แล้วปรับ Final Drive ตามสนาม",
```
Replace with:
```ts
            gearDragNote:
                "Drag: ดัน top gear ไปขวาสุด ไล่ gear ล่างให้กระจายเท่าๆ กัน แล้วจูน 1st gear บน drag strip",
            gearNote:
                "Final Drive คำนวณจากกำลังเครื่อง ส่วน Gear Ratio ยังขึ้นกับของแต่งของรถ — ปรับให้ top gear แตะ redline พอดีที่ปลายทางตรงที่ยาวที่สุด",
            casterNote:
                "FH6 ไวต่อ caster ที่เกิน 6.0° — รถอาจรู้สึก snappy ตอน turn-in",
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: build succeeds, no type errors. (`page.tsx` still uses `C.torque`/`C.gearDefault` — so build will FAIL here with errors about `torque` and `gearDefault` no longer existing on the calc type.)

> **Note:** Because `page.tsx` references the renamed keys, the build will not be green until Task 3. This is expected. Do **not** commit Task 1 alone. Task 1, 2, and 3 share one commit (Task 3, Step 11).

---

## Task 2: Engine rewrite (calculator.ts)

Full rewrite of the FH6 engine. After this task the build still fails (page.tsx not yet updated) — that is expected; commit happens in Task 3.

**Files:**
- Modify: `src/lib/calculator.ts` — full file replacement

- [ ] **Step 1: Replace the entire contents of `src/lib/calculator.ts`**

```ts
// ─── FH6 Auto Tune Calculator — Engine v2.0 ──────────────────────────────────

export type Drivetrain = "AWD" | "FWD" | "RWD"
export type Discipline =
    | "street"
    | "track"
    | "offroad"
    | "rally"
    | "drift"
    | "drag"

export interface CalcInput {
    balanceFront: number // % 0–100 (front weight share)
    drivetrain: Drivetrain
    discipline: Discipline
    weightKg: number
    powerKw: number // in-game FH6 power unit is kW
}

export interface TireResult {
    pressureF: number // bar
    pressureR: number // bar
}
export interface AlignmentResult {
    camberF: number
    camberR: number
    toeF: number
    toeR: number
    caster: number
}
export interface ArbResult {
    front: number
    rear: number
}
export interface SpringResult {
    rateF: number
    rateR: number
    rideHeightPct: number
}
export interface DampingResult {
    reboundF: number
    reboundR: number
    bumpF: number
    bumpR: number
}
export interface AeroResult {
    front: number // % of slider max
    rear: number // % of slider max
    balance: number // FH6 aero balance stat, target 0.40–0.50
}
export interface BrakeResult {
    biasFront: number
    pressure: number
}
export interface DiffResult {
    frontAccel?: number
    frontDecel?: number
    rearAccel?: number
    rearDecel?: number
    center?: number
}
export interface GearResult {
    finalDrive: number
}

export interface TuneResult {
    tires: TireResult
    alignment: AlignmentResult
    arb: ArbResult
    springs: SpringResult
    damping: DampingResult
    aero: AeroResult
    brakes: BrakeResult
    diff: DiffResult
    gear: GearResult
    version: string
}

const clamp = (v: number, mn: number, mx: number) =>
    Math.max(mn, Math.min(mx, v))
const r1 = (n: number) => Math.round(n * 10) / 10
const r2 = (n: number) => Math.round(n * 100) / 100

// ── TIRES ─────────────────────────────────────────────────────────────────────
// Guide authors pressures in PSI; the UI displays bar (psi / 14.504).
function calcTires({ drivetrain, discipline }: CalcInput): TireResult {
    const PSI_TO_BAR = 1 / 14.504
    // [front PSI, rear PSI]
    const PSI: Record<Discipline, [number, number]> = {
        street: [30, 30],
        track: [31, 31],
        rally: [27, 27],
        offroad: [27, 27],
        drift: [31, 38], // high rear pressure to break grip
        drag: [30, 30],
    }
    const [pf, pr] = PSI[discipline]
    // Drag: lower rear pressure on driven-rear cars helps the launch squat.
    const rearPsi = discipline === "drag" && drivetrain !== "FWD" ? 22 : pr
    return {
        pressureF: r1(clamp(pf * PSI_TO_BAR, 1.0, 3.8)),
        pressureR: r1(clamp(rearPsi * PSI_TO_BAR, 1.0, 3.8)),
    }
}

// ── ALIGNMENT ─────────────────────────────────────────────────────────────────
// Toe stays 0 everywhere — the toe slider is buggy/unpredictable in Horizon.
function calcAlignment({ discipline }: CalcInput): AlignmentResult {
    const CAMBER: Record<Discipline, [number, number]> = {
        street: [-1.8, -1.0],
        track: [-2.3, -1.5],
        rally: [-0.8, -0.6],
        offroad: [-0.5, -0.3],
        drift: [-4.0, -1.5],
        drag: [0.0, 0.0],
    }
    const CASTER: Record<Discipline, number> = {
        street: 6.0,
        track: 6.3,
        rally: 5.5,
        offroad: 5.5,
        drift: 7.0,
        drag: 6.0,
    }
    const [camberF, camberR] = CAMBER[discipline]
    return { camberF, camberR, toeF: 0, toeR: 0, caster: CASTER[discipline] }
}

// ── ANTIROLL BARS ─────────────────────────────────────────────────────────────
// Discipline baseline + ±0.5 per 1% weight-distribution deviation from 50% front.
function calcArb({
    drivetrain,
    discipline,
    balanceFront,
}: CalcInput): ArbResult {
    if (discipline === "drift") return { front: 55, rear: 2 }
    if (discipline === "drag") return { front: 2, rear: 2 }
    // [front, rear] mid-class baseline
    const BASE: Record<Discipline, [number, number]> = {
        street: [26, 28],
        track: [32, 34],
        rally: [12, 12],
        offroad: [11, 11],
        drift: [55, 2], // unused (early return above)
        drag: [2, 2], // unused (early return above)
    }
    let [front, rear] = BASE[discipline]
    // Drivetrain spread
    if (drivetrain === "RWD") {
        front += 4
        rear -= 2
    } else if (drivetrain === "FWD") {
        front -= 2
        rear += 4
    }
    // Weight-distribution adjustment
    const dev = balanceFront - 50
    front += dev * 0.5
    rear -= dev * 0.5
    return { front: r1(clamp(front, 1, 65)), rear: r1(clamp(rear, 1, 65)) }
}

// ── SPRINGS ───────────────────────────────────────────────────────────────────
function calcSprings({
    weightKg,
    balanceFront,
    discipline,
    drivetrain,
    powerKw,
}: CalcInput): SpringResult {
    const STIFF: Record<Discipline, number> = {
        street: 1.0,
        track: 1.5,
        rally: 0.7,
        offroad: 0.5,
        drift: 1.1,
        drag: 0.8,
    }
    const RIDE: Record<Discipline, number> = {
        street: 20,
        track: 0,
        rally: 60,
        offroad: 100,
        drift: 0,
        drag: 0,
    }
    const base = (weightKg / 8) * STIFF[discipline]
    let rateF = base * (balanceFront / 50)
    let rateR = base * ((100 - balanceFront) / 50)
    // Power-driven axle stiffening (kW). Modest — absolute spring values are
    // not meaningful in Forza; ratio/balance matter.
    const pwBonus = Math.min((powerKw / 1100) * 28, 28)
    if (drivetrain === "RWD") rateR += pwBonus
    if (drivetrain === "AWD") {
        rateR += pwBonus * 0.5
        rateF += pwBonus * 0.3
    }
    // Drift: stiff front, soft rear. Drag: firm front, soft rear (squat).
    if (discipline === "drift") {
        rateF *= 1.25
        rateR *= 0.7
    } else if (discipline === "drag") {
        rateF *= 1.2
        rateR *= 0.6
    }
    return {
        rateF: r1(Math.max(10, rateF)),
        rateR: r1(Math.max(10, rateR)),
        rideHeightPct: RIDE[discipline],
    }
}

// ── DAMPING ───────────────────────────────────────────────────────────────────
// Bump ≈ 2/3 of rebound. Drag uses an inverted profile.
function calcDamping(
    sp: SpringResult,
    { discipline }: CalcInput,
): DampingResult {
    const RB_MULT: Record<Discipline, number> = {
        street: 1.0,
        track: 1.1,
        rally: 0.75,
        offroad: 0.65,
        drift: 0.9,
        drag: 0.9,
    }
    const m = RB_MULT[discipline]
    const rF = r1(clamp(sp.rateF * 0.055 * m, 1, 20))
    const rR = r1(clamp(sp.rateR * 0.055 * m, 1, 20))
    if (discipline === "drag") {
        // Stiff front bump + stiff rear rebound, soft opposite corners.
        return {
            reboundF: r1(clamp(rF * 0.45, 1, 20)),
            reboundR: r1(clamp(rR * 0.95, 1, 20)),
            bumpF: r1(clamp(rF * 0.95, 1, 20)),
            bumpR: r1(clamp(rR * 0.45, 1, 20)),
        }
    }
    return {
        reboundF: rF,
        reboundR: rR,
        bumpF: r1(clamp(rF * 0.65, 1, 20)),
        bumpR: r1(clamp(rR * 0.65, 1, 20)),
    }
}

// ── AERO ──────────────────────────────────────────────────────────────────────
// FH6 aero balance stat = rear share of downforce; target 0.40–0.50.
function calcAero({ discipline }: CalcInput): AeroResult {
    const AERO: Record<Discipline, [number, number]> = {
        street: [80, 62],
        track: [100, 78],
        rally: [30, 22],
        offroad: [25, 18],
        drift: [100, 0],
        drag: [0, 0],
    }
    const [front, rear] = AERO[discipline]
    const total = front + rear
    const balance = total > 0 ? r2(rear / total) : 0
    return { front, rear, balance }
}

// ── BRAKES ────────────────────────────────────────────────────────────────────
// FH6 brake-balance slider is corrected (right = front).
function calcBrakes({ balanceFront, discipline }: CalcInput): BrakeResult {
    const BIAS: Record<Discipline, number> = {
        street: 52,
        track: 53,
        rally: 60,
        offroad: 60,
        drift: 85,
        drag: 55,
    }
    const biasFront = r1(
        clamp(BIAS[discipline] + (balanceFront - 50) * 0.25, 40, 100),
    )
    const PRESSURE: Record<Discipline, number> = {
        street: 100,
        track: 100,
        rally: 95,
        offroad: 90,
        drift: 90,
        drag: 100,
    }
    return { biasFront, pressure: PRESSURE[discipline] }
}

// ── DIFFERENTIAL ──────────────────────────────────────────────────────────────
function calcDiff({ drivetrain, discipline, powerKw }: CalcInput): DiffResult {
    type DB = { fA: number; fD: number; rA: number; rD: number; ctr: number }
    const D: Record<Discipline, DB> = {
        street: { fA: 45, fD: 15, rA: 50, rD: 18, ctr: 55 },
        track: { fA: 48, fD: 18, rA: 55, rD: 20, ctr: 60 },
        offroad: { fA: 70, fD: 25, rA: 78, rD: 25, ctr: 65 },
        rally: { fA: 60, fD: 20, rA: 70, rD: 22, ctr: 60 },
        drift: { fA: 20, fD: 15, rA: 100, rD: 85, ctr: 85 },
        drag: { fA: 100, fD: 0, rA: 100, rD: 0, ctr: 70 },
    }
    const d = D[discipline]
    const pwB = Math.min((powerKw / 1100) * 12, 12)
    const rA = Math.min(100, Math.round(d.rA + pwB))
    const fA = Math.min(100, Math.round(d.fA + pwB * 0.5))
    switch (drivetrain) {
        case "RWD":
            return { rearAccel: rA, rearDecel: d.rD }
        case "FWD":
            return { frontAccel: fA, frontDecel: d.fD }
        case "AWD":
            return {
                frontAccel: fA,
                frontDecel: d.fD,
                rearAccel: rA,
                rearDecel: d.rD,
                center: d.ctr,
            }
    }
}

// ── GEAR ──────────────────────────────────────────────────────────────────────
// Guide formula: final drive 4.25 at 400 hp, −0.01 per 6 hp. Input is kW.
function calcGear({ powerKw }: CalcInput): GearResult {
    const hp = powerKw / 0.7457
    const finalDrive = clamp(4.25 - ((hp - 400) / 6) * 0.01, 2.5, 5.5)
    return { finalDrive: r2(finalDrive) }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export function calculateFH6Tune(input: CalcInput): TuneResult {
    const springs = calcSprings(input)
    return {
        tires: calcTires(input),
        alignment: calcAlignment(input),
        arb: calcArb(input),
        springs,
        damping: calcDamping(springs, input),
        aero: calcAero(input),
        brakes: calcBrakes(input),
        diff: calcDiff(input),
        gear: calcGear(input),
        version: "2.0",
    }
}
```

- [ ] **Step 2: Sanity-check the math (read, do not run)**

Confirm by inspection: at `powerKw: 300` → `hp ≈ 402` → `finalDrive ≈ 4.25`. At `powerKw: 447` → `hp ≈ 599` → `finalDrive ≈ 3.92` (matches the guide's ~3.91 at 600 hp). `track` aero balance = `78 / 178 ≈ 0.44` (inside 0.40–0.50). No commit yet — proceed to Task 3.

---

## Task 3: UI update (page.tsx)

Updates the calculator page to the new engine. After this task the build is green; commit at the end.

**Files:**
- Modify: `src/app/(main)/calculator/page.tsx`

- [ ] **Step 1: Update the engine import**

Find:
```ts
import { calculateFH5Tune } from "@/lib/calculator"
```
Replace with:
```ts
import { calculateFH6Tune } from "@/lib/calculator"
```

- [ ] **Step 2: Update the form state**

Find:
```ts
    const [form, setForm] = useState<CalcInput>({
        balanceFront: 50,
        drivetrain: "RWD",
        discipline: "track",
        weightKg: 1400,
        torqueNm: 600,
    })
```
Replace with:
```ts
    const [form, setForm] = useState<CalcInput>({
        balanceFront: 50,
        drivetrain: "RWD",
        discipline: "track",
        weightKg: 1400,
        powerKw: 300,
    })
```

- [ ] **Step 3: Update the calculate handler**

Find:
```ts
        setResult(calculateFH5Tune(form))
```
Replace with:
```ts
        setResult(calculateFH6Tune(form))
```

- [ ] **Step 4: Add the Drag discipline chip**

Find:
```ts
    const DISCIPLINE: { value: Discipline; label: string; color: string }[] = [
        { value: "street", label: "Street", color: "#c084fc" },
        { value: "track", label: "Track", color: "#60a5fa" },
        { value: "offroad", label: "Offroad", color: "#4ade80" },
        { value: "rally", label: "Rally", color: "#fb923c" },
        { value: "drift", label: "Drift", color: "#facc15" },
    ]
```
Replace with:
```ts
    const DISCIPLINE: { value: Discipline; label: string; color: string }[] = [
        { value: "street", label: "Street", color: "#c084fc" },
        { value: "track", label: "Track", color: "#60a5fa" },
        { value: "offroad", label: "Offroad", color: "#4ade80" },
        { value: "rally", label: "Rally", color: "#fb923c" },
        { value: "drift", label: "Drift", color: "#facc15" },
        { value: "drag", label: "Drag", color: "#f87171" },
    ]
```

- [ ] **Step 5: Update the header badge**

Find:
```ts
                            FH5 · v1.0
```
Replace with:
```ts
                            FH6 · v2.0
```

- [ ] **Step 6: Replace the Torque input with a Power (kW) input**

Find:
```ts
                            <div>
                                <label style={labelSt}>{C.torque}</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type="number"
                                        min={50}
                                        max={2000}
                                        step={10}
                                        value={form.torqueNm}
                                        onChange={(e) =>
                                            set(
                                                "torqueNm",
                                                Number(e.target.value),
                                            )
                                        }
                                        style={numInput}
                                    />
                                    <span
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            fontSize: "11px",
                                            color: "#475569",
                                        }}
                                    >
                                        N·m
                                    </span>
                                </div>
                            </div>
```
Replace with:
```ts
                            <div>
                                <label style={labelSt}>{C.power}</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type="number"
                                        min={50}
                                        max={1200}
                                        step={10}
                                        value={form.powerKw}
                                        onChange={(e) =>
                                            set(
                                                "powerKw",
                                                Number(e.target.value),
                                            )
                                        }
                                        style={numInput}
                                    />
                                    <span
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            fontSize: "11px",
                                            color: "#475569",
                                        }}
                                    >
                                        kW
                                    </span>
                                </div>
                            </div>
```

- [ ] **Step 7: Update the power-to-weight panel**

Find:
```ts
                            T/W ratio:{" "}
                            <span
                                style={{
                                    color: "#94a3b8",
                                    fontFamily: "monospace",
                                }}
                            >
                                {(form.torqueNm / form.weightKg).toFixed(2)}
                            </span>{" "}
                            N·m/kg
```
Replace with:
```ts
                            Power/Weight:{" "}
                            <span
                                style={{
                                    color: "#94a3b8",
                                    fontFamily: "monospace",
                                }}
                            >
                                {(
                                    form.powerKw /
                                    (form.weightKg / 1000)
                                ).toFixed(1)}
                            </span>{" "}
                            kW/t
```

- [ ] **Step 8: Update the summary chip row**

Find:
```ts
                                <span>⚡ {form.torqueNm} N·m</span>
```
Replace with:
```ts
                                <span>⚡ {form.powerKw} kW</span>
```

- [ ] **Step 9: Replace the locked Gear card body with computed Final Drive**

Find:
```ts
                                    <SectionTitle icon="🔄" title="Gear" />
                                    <div
                                        style={{
                                            padding: "12px",
                                            background:
                                                "rgba(255,255,255,0.03)",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontSize: "24px",
                                                marginBottom: "6px",
                                            }}
                                        >
                                            🔒
                                        </div>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "13px",
                                                color: "#94a3b8",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {C.gearDefault}
                                        </p>
                                        <p
                                            style={{
                                                margin: "6px 0 0",
                                                fontSize: "12px",
                                                color: "#475569",
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {C.gearNote}
                                        </p>
                                    </div>
```
Replace with:
```ts
                                    <SectionTitle icon="🔄" title="Gear" />
                                    <Row
                                        label="Final Drive"
                                        value={result.gear.finalDrive.toFixed(
                                            2,
                                        )}
                                    />
                                    <p
                                        style={{
                                            margin: "10px 0 0",
                                            fontSize: "11px",
                                            color: "#475569",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {form.discipline === "drag"
                                            ? C.gearDragNote
                                            : C.gearNote}
                                    </p>
```

- [ ] **Step 10: Update the Aero card — separate Front/Rear + Aero Balance**

Find:
```ts
                                    <SectionTitle
                                        icon="✈️"
                                        title="Aero — Downforce"
                                    />
                                    <BarRow
                                        label="Front Downforce"
                                        value={result.aero.pct}
                                        min={0}
                                        max={100}
                                        unit="%"
                                        color="#f472b6"
                                    />
                                    <BarRow
                                        label="Rear Downforce"
                                        value={result.aero.pct}
                                        min={0}
                                        max={100}
                                        unit="%"
                                        color="#f472b6"
                                    />
                                    {result.aero.pct === 0 && (
                                        <p
                                            style={{
                                                margin: "8px 0 0",
                                                fontSize: "11px",
                                                color: "#475569",
                                            }}
                                        >
                                            {C.driftNote}
                                        </p>
                                    )}
```
Replace with:
```ts
                                    <SectionTitle
                                        icon="✈️"
                                        title="Aero — Downforce"
                                    />
                                    <BarRow
                                        label="Front Downforce"
                                        value={result.aero.front}
                                        min={0}
                                        max={100}
                                        unit="%"
                                        color="#f472b6"
                                    />
                                    <BarRow
                                        label="Rear Downforce"
                                        value={result.aero.rear}
                                        min={0}
                                        max={100}
                                        unit="%"
                                        color="#f472b6"
                                    />
                                    <Row
                                        label="Aero Balance"
                                        value={result.aero.balance.toFixed(2)}
                                    />
                                    {result.aero.front === 0 && (
                                        <p
                                            style={{
                                                margin: "8px 0 0",
                                                fontSize: "11px",
                                                color: "#475569",
                                            }}
                                        >
                                            {C.driftNote}
                                        </p>
                                    )}
```

- [ ] **Step 11: Add the caster note to the Alignment card**

Find:
```ts
                                    <Row
                                        label="Front Caster"
                                        value={result.alignment.caster}
                                        unit="°"
                                    />
                                </div>
```
Replace with:
```ts
                                    <Row
                                        label="Front Caster"
                                        value={result.alignment.caster}
                                        unit="°"
                                    />
                                    {result.alignment.caster >= 6.5 && (
                                        <p
                                            style={{
                                                margin: "10px 0 0",
                                                fontSize: "11px",
                                                color: "#475569",
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {C.casterNote}
                                        </p>
                                    )}
                                </div>
```

> **Note:** This `</div>` closes the Alignment card. Verify the match is the one immediately after the Front Caster `Row` (the Alignment card body), not another card. The Front Caster `Row` is unique in the file, so the find block is unambiguous.

- [ ] **Step 12: Verify the build passes**

Run: `npm run build`
Expected: build succeeds with no type errors. If errors mention `torqueNm`, `calculateFH5Tune`, `aero.pct`, `gearDefault`, or `torque`, a replacement above was missed — fix it.

- [ ] **Step 13: Manual smoke check**

Run: `npm run dev`, open `http://localhost:3000/calculator` (sign in if prompted). Set Drivetrain RWD, Discipline Track, Weight 1400, Power 300, press Calculate. Confirm: Gear card shows a Final Drive value (~4.25), Aero card shows distinct Front/Rear plus an Aero Balance value (~0.44), all Toe values are 0, the badge reads `FH6 · v2.0`. Switch Discipline to Drag and confirm the Drag chip works and the gear note changes.

- [ ] **Step 14: Commit (covers Tasks 1–3)**

```bash
git add src/lib/calculator.ts src/app/(main)/calculator/page.tsx src/lib/i18n/messages.ts
git commit -m "feat: migrate tune calculator to FH6 engine v2.0"
```

---

## Self-Review

- **Spec coverage:** Tires (T2.S1 calcTires), Alignment incl. toe=0 + caster note (T2.S1 calcAlignment, T3.S11), ARB (calcArb), Springs (calcSprings), Damping incl. drag profile (calcDamping), Aero front/rear/balance (calcAero, T3.S10), Brakes (calcBrakes), Differential (calcDiff), Gear final-drive from kW (calcGear, T3.S9), input model `powerKw`+`drag` (T2.S1, T3.S2/S4), UI badge/input/summary (T3.S5–S8), i18n EN+TH (T1). All spec sections mapped.
- **Placeholder scan:** No TBD/TODO; every code step contains full code.
- **Type consistency:** `CalcInput.powerKw`, `Discipline` with `"drag"`, `AeroResult {front,rear,balance}`, `GearResult {finalDrive}`, `TuneResult.gear`, exported `calculateFH6Tune` — all used consistently across `calculator.ts` and `page.tsx`. i18n keys `power`, `gearDragNote`, `casterNote`, `gearNote` defined in T1 and consumed in T3.
