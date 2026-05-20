# FH6 Tune Calculator — Design Spec

**Date:** 2026-05-19
**Topic:** Migrate the Tune Lab "Calculate" feature from the FH5 engine to FH6 formulas.
**Source of truth:** User-provided "คู่มือ Tune รถใน Forza Horizon 6 ฉบับสมบูรณ์".

## Goal

Replace the FH5 baseline tune engine (`calculateFH5Tune`, v1.0) with an FH6 engine
(`calculateFH6Tune`, v2.0) whose per-discipline baselines and formulas follow the FH6 guide.
Output stays a starting-point tune; the user still fine-tunes in-game (existing `warningNote`).

## Scope

Three files only. No DB / route / store changes (`tuneStore`'s calculator fields are unused
by the page — it uses local React state).

1. `src/lib/calculator.ts` — the engine
2. `src/app/(main)/calculator/page.tsx` — the UI
3. `src/lib/i18n/messages.ts` — i18n keys (EN + TH; a missing TH key is a compile error)

## Input model changes (`CalcInput`)

- Remove `torqueNm`. Add `powerKw` (in-game FH6 power unit is **kW**).
- `Discipline` adds `"drag"` → six disciplines: `street | track | offroad | rally | drift | drag`.
- `balanceFront`, `drivetrain`, `weightKg` unchanged.

## Engine formulas (`calculator.ts`)

Rename `calculateFH5Tune` → `calculateFH6Tune`; header comment "Engine v2.0"; `version: "2.0"`.

### Tires

Baseline values authored in PSI per the guide, then converted to bar for display
(`bar = psi / 14.504`). Targets: road ~30 PSI, rally/offroad ~27 PSI, drift F 31 / R 38,
drag ~30 (rear lower for non-FWD launch). Clamp 1.0–3.8 bar.

### Alignment

- Camber front: street −1.8°, track −2.3°, rally −0.8°, offroad −0.5°, drift −4.0°, drag 0.0°;
  rear set ~1° less negative than front (drift rear −1.5°, drag 0.0°).
- **Toe = 0.0° for all disciplines** — guide flags the toe slider as buggy/unpredictable in
  Horizon; leave at zero.
- Caster: road 6.0–6.3°, rally/offroad 5.5°, drift 7.0°, drag 6.0°. FH6 is caster-sensitive
  above 6.0° ("snappy"); a `casterNote` is shown when caster ≥ 6.5°.

### Anti-Roll Bars

Discipline baseline + weight-distribution adjustment of **±0.5 per 1%** deviation from 50%
front (add to front, subtract from rear). Baselines: road ~30 F / 34 R, rally/offroad ~12,
drift F max (~55) / R min (~1), drag min both. Drivetrain spread (RWD/FWD/AWD) retained.
Clamp 1–65.

### Springs

Keep `weight × discipline-stiffness`, split front/rear by `balanceFront`. Torque bonus
removed (torque dropped); replaced by a modest `powerKw`-based driven-axle stiffening
(small, since absolute spring values are not meaningful in Forza — ratio/balance matter).
Ride height per discipline (drag = min front). Floor 10 N/mm.

### Damping

Keep the 2/3 rule (`bump ≈ 0.65 × rebound`) — guide-confirmed. Drag uses an inverted
profile: stiff front bump + stiff rear rebound, soft opposite corners. Clamp 1–20.

### Aero — **new structure**

`AeroResult` becomes `{ front, rear, balance }`. Front near max, rear lower so the FH6
**aero balance stat** lands in 0.40–0.50. Drift/drag/rally use minimal aero. UI shows
Front downforce, Rear downforce, and an Aero Balance row.

### Brakes

FH6 brake-balance slider is corrected (right = front). Baselines: road 52% F,
rally/offroad 60% F, drift 85% F, drag 55% F; plus the existing `balanceFront` lean.
Pressure baseline 100% (guide: start at 100%, reduce on lockup), drift ~90%.

### Differential

Per-discipline ranges from the guide: RWD road 55% accel / 20% decel; AWD road
50/15 with center 60% rear; FWD 50/15; drift 100/85; drag 100/0; rally/offroad per
guide offsets. Replace the torque accel bonus with a small `powerKw`-scaled bonus.

### Gear — **new output**

`GearResult { finalDrive }`. Convert kW → hp (`hp = kw / 0.7457`), then apply the guide
formula `finalDrive = 4.25 − (hp − 400) / 6 × 0.01`, clamped ~2.5–5.5. Drag shows an
extra note (`gearDragNote`: top gear far right, spread lower gears, tune 1st on the strip).

## UI changes (`page.tsx`)

- Header badge `FH5 · v1.0` → `FH6 · v2.0`.
- Torque (N·m) input → Power (kW) input; default ~300 kW, range 50–1200 kW.
- "T/W ratio" panel → power-to-weight `kW/t` (`powerKw / (weightKg / 1000)`).
- Discipline chips: add **Drag**.
- Gear card: replace the locked 🔒 placeholder with the computed Final Drive value
  (+ `gearDragNote` when discipline = drag).
- Aero card: render Front downforce, Rear downforce, and Aero Balance separately
  (currently shows one `pct` twice).
- Summary chip row: `⚡ {powerKw} kW` instead of N·m.

## i18n keys (`messages.ts`)

New keys, both EN and TH: `power`, `finalDrive`, `aeroBalance`, `casterNote`, `gearDragNote`.
The `gearDefault` / `gearNote` keys are superseded by the computed gear output;
`gearNote` is reused for the generic gearing hint, `gearDefault` removed if unused.

## Out of scope

`tuneStore` calculator fields, DB, other routes, in-game gear-ratio computation
(track-dependent — only final drive + a note are produced).
