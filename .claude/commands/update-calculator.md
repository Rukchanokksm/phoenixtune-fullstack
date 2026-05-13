# update-calculator

Update the FH5 auto-tune calculator engine or the calculator page UI.

## Arguments

`$ARGUMENTS` — describe the change, e.g. "add drag discipline support" or "fix ARB values for FWD cars"

## Files Involved

| File | Purpose |
|---|---|
| `src/lib/calculator.ts` | Core calculation engine — pure functions, no framework deps |
| `src/app/(main)/calculator/page.tsx` | Calculator page UI |
| `src/components/tune/TuneParameters.tsx` | Displays calculated tune parameters |
| `src/stores/tuneStore.ts` | `calculatorInput`, `calculatorResult`, `calculatorUsageToday` |
| `src/types/index.ts` | `CalculatorInput` and `TuneParameters` interfaces |

## Calculator Engine Architecture (`src/lib/calculator.ts`)

The engine is composed of pure functions, each computing one subsystem:

| Function | Inputs used | Output type |
|---|---|---|
| `calcTires` | `drivetrain`, `discipline` | `TireResult` |
| `calcAlignment` | `discipline` | `AlignmentResult` |
| `calcArb` | `drivetrain`, `discipline`, `balanceFront` | `ArbResult` |
| `calcSprings` | `weightKg`, `balanceFront`, `discipline`, `drivetrain`, `torqueNm` | `SpringResult` |
| `calcDamping` | `SpringResult`, `discipline` | `DampingResult` |
| `calcAero` | `discipline` | `AeroResult` |
| `calcBrakes` | `balanceFront`, `discipline` | `BrakeResult` |
| `calcDiff` | `drivetrain`, `discipline`, `torqueNm` | `DiffResult` |

The main export `calculateFH5Tune(input: CalcInput): TuneResult` calls all of these and composes the result.

**`CalcInput` fields:**
```ts
{
  balanceFront: number  // front weight % 0–100
  drivetrain: "AWD" | "FWD" | "RWD"
  discipline: "street" | "track" | "offroad" | "rally" | "drift"
  weightKg: number
  torqueNm: number
}
```

Note: the calculator's `Discipline` type does **not** include `"drag"` yet — the `TuneParameters` type in `src/types/index.ts` uses a broader `Discipline` that includes `"drag"`.

## How to Add a New Discipline

1. Add the discipline string to the `Discipline` type in `src/lib/calculator.ts`.
2. Add an entry to every `Record<Discipline, ...>` lookup table in each `calc*` function — missing entries will cause a TypeScript error.
3. Update the `CalcInput` interface JSDoc if needed.
4. Bump `version` in the returned `TuneResult` (currently `"1.0"`).

## Tuning the Physics Values

- All lookup tables use tuning presets per discipline. Values are based on racing game meta — changes should have a rationale.
- `clamp(value, min, max)` and `r1(value)` (round to 1 decimal) are the only math helpers — use them for all output values.
- Torque-based bonuses use `Math.min((torqueNm / 2000) * X, X)` to cap at a maximum contribution.

## Zustand Store Integration

The calculator page reads/writes through `useTuneStore`:
```ts
const input = useTuneStore(selectCalcInput)
const result = useTuneStore(selectCalcResult)
const usage = useTuneStore(selectCalcUsage)

setCalculatorInput({ drivetrain: 'AWD' })   // merge partial input
setCalculatorResult(calculateFH5Tune(input)) // store result
incrementCalculatorUsage()                   // rate limit tracking
```

## Rate Limiting

`calculatorUsageToday` tracks daily usage in the Zustand store. The UI should enforce a soft limit for non-premium users (check `useUserStore(s => s.isPremium())`).

## After Making Changes

Run `npm run build` to verify TypeScript is clean. The calculator is pure TypeScript — no API calls needed, so changes take effect immediately on the client.
