# debug-supabase

Diagnose and fix Supabase query failures, RLS permission errors, and auth issues in this project.

## Arguments

`$ARGUMENTS` — describe the symptom, e.g. "saves API returns 403" or "tune insert fails with new RLS error"

## Diagnostic Checklist

### 1. Identify which Supabase client is in use

- `src/lib/supabase/server.ts` → `createClient()` (respects RLS, uses session cookies) or `createAdminClient()` (service role, bypasses RLS)
- `src/lib/supabase/client.ts` → browser client (`createBrowserClient`), uses anon key + RLS

**Common mistake**: using the browser client in a Server Component, or using the server client in a `"use client"` file.

### 2. Auth state verification

Check that the session is actually present server-side:
```ts
const { data: { user }, error } = await supabase.auth.getUser()
console.log('[debug] user:', user?.id, 'error:', error?.message)
```
If `user` is null inside a Server Component, the session cookie was not forwarded — check `src/lib/supabase/middleware.ts` is updating the cookie on each request.

### 3. RLS policy diagnosis

When a query returns empty results or permission errors unexpectedly:

1. Read the migration files in `supabase/migrations/` to find the relevant RLS policy.
2. Test whether `auth.uid()` equals the expected user ID.
3. If writing as a system action (e.g. creating a user_profiles row on registration), switch to `createAdminClient()` for that specific write.
4. Check if a policy uses `USING` (affects SELECT/UPDATE/DELETE) vs `WITH CHECK` (affects INSERT/UPDATE) — missing `WITH CHECK` allows SELECT but blocks INSERT.

### 4. FK hint for ambiguous joins

Supabase requires explicit FK hints when a table has multiple foreign keys to the same target table:
```ts
// Wrong — ambiguous if tunes has multiple user_id-like columns
.select('user:user_profiles(id, username)')

// Correct — explicit FK name
.select('user:user_profiles!tunes_user_id_fkey(id, username)')
```
Run `SELECT conname FROM pg_constraint WHERE conrelid = 'tunes'::regclass AND contype = 'f';` in Supabase SQL editor to list FK names.

### 5. Filtering on joined columns

Supabase PostgREST does **not** support `.eq('cars.pi_class', value)` on a joined relation.
**Fix**: resolve the filter through a separate query first, then use `.in()`:
```ts
const { data: cars } = await supabase.from('cars').select('id').eq('pi_class', piClass)
const ids = cars?.map(c => c.id) ?? []
query = query.in('car_id', ids)
```

### 6. Stripe webhook errors

The webhook at `src/app/api/webhooks/stripe/route.ts`:
- Requires the raw request body (not parsed JSON) for signature verification — `export const dynamic = 'force-dynamic'` is already set.
- After verification, errors inside the switch handler still return `200` to prevent Stripe retries — check server logs instead of HTTP status.
- The `createClient()` inside the webhook uses the service role because there's no user session — confirm `SUPABASE_SERVICE_ROLE_KEY` is set in env.

### 7. Environment variables

Required variables (check `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY       ← server-only, never expose to client
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PREMIUM_PRICE_ID
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL
```
`NEXT_PUBLIC_` variables are embedded at build time and visible in the browser. Never put `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_` variable.

### 8. Debug endpoint

`src/app/api/debug/route.ts` exists — check what it returns for current auth state and environment diagnostics. Use it as a quick sanity check during development.
