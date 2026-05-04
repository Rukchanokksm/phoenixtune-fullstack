import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { TuneFilters, CalculatorInput, TuneParameters } from '@/types'

// ─── Default filters ──────────────────────────────────────────────────────────
const DEFAULT_FILTERS: TuneFilters = {
  sortBy:  'newest',
  page:    1,
  perPage: 20,
}

// ─── Store interface ──────────────────────────────────────────────────────────
interface TuneStore {
  // ── Filter state ──────────────────────────────────────────────────────────
  filters: TuneFilters
  setFilters: (filters: Partial<TuneFilters>) => void
  resetFilters: () => void

  // ── Calculator state ──────────────────────────────────────────────────────
  calculatorInput: Partial<CalculatorInput>
  setCalculatorInput: (input: Partial<CalculatorInput>) => void

  calculatorResult: TuneParameters | null
  setCalculatorResult: (result: TuneParameters | null) => void

  calculatorUsageToday: number
  setCalculatorUsageToday: (count: number) => void
  incrementCalculatorUsage: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useTuneStore = create<TuneStore>()(
  devtools(
    (set, get) => ({
      // ── Filters ─────────────────────────────────────────────────────────
      filters: { ...DEFAULT_FILTERS },

      setFilters: (partial) =>
        set(
          (state) => ({ filters: { ...state.filters, ...partial, page: 1 } }),
          false,
          'setFilters'
        ),

      resetFilters: () =>
        set({ filters: { ...DEFAULT_FILTERS } }, false, 'resetFilters'),

      // ── Calculator ───────────────────────────────────────────────────────
      calculatorInput: {},

      setCalculatorInput: (input) =>
        set(
          (state) => ({ calculatorInput: { ...state.calculatorInput, ...input } }),
          false,
          'setCalculatorInput'
        ),

      calculatorResult: null,

      setCalculatorResult: (result) =>
        set({ calculatorResult: result }, false, 'setCalculatorResult'),

      calculatorUsageToday: 0,

      setCalculatorUsageToday: (count) =>
        set({ calculatorUsageToday: count }, false, 'setCalculatorUsageToday'),

      incrementCalculatorUsage: () =>
        set(
          (state) => ({ calculatorUsageToday: state.calculatorUsageToday + 1 }),
          false,
          'incrementCalculatorUsage'
        ),
    }),
    { name: 'TuneStore' }
  )
)

// ─── Selectors (for granular subscriptions) ───────────────────────────────────
export const selectFilters       = (s: TuneStore) => s.filters
export const selectCalcInput     = (s: TuneStore) => s.calculatorInput
export const selectCalcResult    = (s: TuneStore) => s.calculatorResult
export const selectCalcUsage     = (s: TuneStore) => s.calculatorUsageToday
