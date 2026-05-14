# new-tune-feature

Build a complete end-to-end tune feature: API route(s) + Zustand state (if needed) + UI component(s).

## Arguments
`$ARGUMENTS` — e.g. "tune bookmarking for premium users" or "comment threading on tune detail"

## Steps

1. **Read types** — `src/types/index.ts` first. Key: `Tune`, `TuneFilters`, `UserProfile.isPremium`, `Comment`, `SavedTune`.

2. **Check schema** — read `supabase/migrations/` (latest first) before writing any queries.

3. **API route** — use `/new-api-route` skill. Check existing routes (`/api/tunes`, `/api/tunes/[id]`) before creating new ones. Premium endpoints: check `PREMIUM_ENABLED` flag + `user_profiles.is_premium` server-side.

4. **Zustand** — only if state must be shared across routes. Local state → `useState`. Tune store: `filters`, `calculatorInput/Result`, `calculatorUsageToday`. User store: `user`, `isPremium()`, `savedTuneIds`.

5. **Component** — use `/new-component` skill. Key pages:
   - Tune list: `src/app/(main)/tunes/page.tsx` + `TuneList` / `TuneCard`
   - Tune detail: `src/app/(main)/tunes/[tuneId]/page.tsx`
   - New tune: `src/app/(main)/tunes/new/page.tsx` + `TuneForm`
   - Game→Car→Tunes: `src/app/(main)/games/[gameSlug]/[brand]/[carId]/page.tsx`
   - Saved: `src/app/(main)/saved/page.tsx`

6. **Verify** — `npm run build`. No TypeScript errors.
