import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { TuneFilters } from '@/types'

// ─── Default filters ──────────────────────────────────────────────────────────
const DEFAULT_FILTERS: TuneFilters = {
  sortBy:  'newest',
  page:    1,
  perPage: 20,
}

// ─── Store interface ──────────────────────────────────────────────────────────
interface TuneStore {
  filters: TuneFilters
  setFilters: (filters: Partial<TuneFilters>) => void
  resetFilters: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useTuneStore = create<TuneStore>()(
  devtools(
    (set) => ({
      filters: { ...DEFAULT_FILTERS },

      setFilters: (partial) =>
        set(
          (state) => ({ filters: { ...state.filters, ...partial, page: 1 } }),
          false,
          'setFilters'
        ),

      resetFilters: () =>
        set({ filters: { ...DEFAULT_FILTERS } }, false, 'resetFilters'),
    }),
    { name: 'TuneStore' }
  )
)

// ─── Selectors (for granular subscriptions) ───────────────────────────────────
export const selectFilters = (s: TuneStore) => s.filters
