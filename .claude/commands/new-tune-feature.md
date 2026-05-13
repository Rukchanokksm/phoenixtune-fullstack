# new-tune-feature

Build a complete end-to-end tune-related feature: API route(s) + Zustand state (if needed) + UI component(s).

## Arguments

`$ARGUMENTS` — describe the feature, e.g. "tune bookmarking for premium users" or "comment threading on tune detail page"

## Checklist — work through this in order

### 1. Understand the domain types

Read `src/types/index.ts` first. Key interfaces:
- `Tune` — the core entity; `parameters: TuneParameters` is stored as JSONB
- `TuneFilters` — query params for the list endpoint
- `UserProfile` — check `isPremium` / `premiumUntil` for gated features
- `Comment`, `SavedTune` — secondary tune entities

### 2. Check the database schema

Read `supabase/migrations/` (latest file first) to understand the current table structure, column names, and existing RLS policies before writing any queries. Supabase column names use `snake_case`; TypeScript interfaces use `camelCase`.

### 3. Plan the API surface

- **Read** → `GET /api/tunes` (list) or `GET /api/tunes/[id]` (single) — check if existing routes cover it before creating new ones.
- **Write** → follow the `new-api-route` skill for creating new route files.
- **Premium gate** → check `user_profiles.is_premium` server-side; never trust the client alone.

### 4. Supabase query patterns

**Standard user query** (respects RLS):
```ts
const supabase = await createClient()  // src/lib/supabase/server
```

**System writes that bypass RLS** (car upsert, profile creation):
```ts
const admin = createAdminClient()  // src/lib/supabase/server
```

**Joining relations**:
```ts
.select(`
  id, title, upvotes,
  car:cars(id, make, model, pi_class, drivetrain),
  game:games(id, name, slug),
  user:user_profiles!tunes_user_id_fkey(id, username, avatar_url)
`)
```
Note the explicit FK hint `!tunes_user_id_fkey` — required for disambiguating user_id foreign keys.

### 5. Zustand store (only if global state is needed)

`src/stores/tuneStore.ts` manages:
- `filters` / `setFilters` / `resetFilters` — filter state for the tunes feed
- `calculatorInput` / `calculatorResult` — calculator form state
- `calculatorUsageToday` / `incrementCalculatorUsage` — rate limiting

`src/stores/userStore.ts` manages:
- `user` / `setUser` — authenticated user profile
- `isPremium()` — computed from `isPremium` + `premiumUntil` expiry
- `savedTuneIds` / `toggleSavedTune` / `isTuneSaved` — saved tune bookmarks

Add new state to the relevant store only if it must be shared across routes. Co-locate local state with the component using `useState`.

### 6. UI integration

- **Tune list page**: `src/app/(main)/tunes/page.tsx` + `TuneList` / `TuneCard` components
- **Tune detail page**: `src/app/(main)/tunes/[tuneId]/page.tsx`
- **New tune page**: `src/app/(main)/tunes/new/page.tsx` + `TuneForm` component
- **Game → Car → Tunes flow**: `src/app/(main)/games/[gameSlug]/[brand]/[carId]/page.tsx`
- **Saved tunes**: `src/app/(main)/saved/page.tsx`

### 7. Premium feature gate

Server-side (API route):
```ts
const { data: profile } = await supabase.from('user_profiles').select('is_premium, premium_until').eq('id', user.id).single()
const isPremium = profile?.is_premium && (!profile.premium_until || new Date(profile.premium_until) > new Date())
if (!isPremium) return NextResponse.json({ error: 'Premium required' }, { status: 403 })
```

Client-side (component):
```ts
const isPremium = useUserStore((s) => s.isPremium())
```

### 8. Verify

After writing all files, run `npm run build` and confirm no TypeScript errors.
