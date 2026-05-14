# update-calculator

Update the FH5 auto-tune calculator engine or calculator UI.

## Arguments
`$ARGUMENTS` — e.g. "add drag discipline support" or "fix ARB values for FWD cars"

## Files

| File | Purpose |
|---|---|
| `src/lib/calculator.ts` | Core engine — pure functions, no framework deps |
| `src/app/(main)/calculator/page.tsx` | Calculator page UI |
| `src/components/tune/TuneParameters.tsx` | Displays calculated parameters |
| `src/stores/tuneStore.ts` | `calculatorInput`, `calculatorResult`, `calculatorUsageToday` |
| `src/types/index.ts` | `CalculatorInput`, `TuneParameters` interfaces |

## Engine Architecture

Pure functions in `calculator.ts`, each computing one subsystem:

| Function | Key inputs | Output type |
|---|---|---|
| `calcTires` | `drivetrain`, `discipline` | `TireResult` |
| `calcAlignment` | `discipline` | `AlignmentResult` |
| `calcArb` | `drivetrain`, `discipline`, `balanceFront` | `ArbResult` |
| `calcSprings` | `weightKg`, `balanceFront`, `discipline`, `drivetrain`, `torqueNm` | `SpringResult` |
| `calcDamping` | `SpringResult`, `discipline` | `DampingResult` |
| `calcAero` | `discipline` | `AeroResult` |
| `calcBrakes` | `balanceFront`, `discipline` | `BrakeResult` |
| `calcDiff` | `drivetrain`, `discipline`, `torqueNm` | `DiffResult` |

`calculateFH5Tune(input: CalcInput): TuneResult` composes all of these.

`CalcInput`: `{ balanceFront: number, drivetrain: "AWD"|"FWD"|"RWD", discipline: "street"|"track"|"offroad"|"rally"|"drift", weightKg: number, torqueNm: number }`

Note: calculator `Discipline` does not include `"drag"` yet (the `types/index.ts` `Discipline` does).

## Adding a Discipline

1. Add to `Discipline` type in `calculator.ts`.
2. Add to every `Record<Discipline, ...>` lookup table — missing entry = TypeScript error.
3. Bump `version` in `TuneResult` (currently `"1.0"`).

## Math helpers
`clamp(value, min, max)`, `r1(value)` (round to 1 decimal) — use for all output values.  
Torque bonus cap: `Math.min((torqueNm / 2000) * X, X)`.

## Zustand integration
```ts
const input = useTuneStore(selectCalcInput)
setCalculatorInput({ drivetrain: 'AWD' })    // merge partial
setCalculatorResult(calculateFH5Tune(input))
incrementCalculatorUsage()                    // rate limit
```

Rate limit: `calculatorUsageToday` — enforce soft limit for non-premium in UI.

`npm run build` — calculator is pure TS, changes take effect immediately client-side.
