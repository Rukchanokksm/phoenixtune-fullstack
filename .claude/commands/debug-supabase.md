# debug-supabase

Diagnose Supabase query failures, RLS errors, and auth issues.

## Arguments
`$ARGUMENTS` — e.g. "saves API returns 403" or "tune insert fails with RLS error"

## Diagnostic Steps

### 1. Identify the client
- Server Component / Route Handler → server client (`createClient` / `createAdminClient`)
- Client Component → browser client (`createBrowserClient`)
- **Common mistake**: browser client in a Server Component, or server client in `"use client"` file.

### 2. Auth state
```ts
const { data: { user }, error } = await supabase.auth.getUser()
console.log('[debug] user:', user?.id, 'error:', error?.message)
```
If `user` is null in a Server Component → session cookie not forwarded. Check `src/proxy.ts` (Next.js 16 — not `middleware.ts`). The proxy must call `supabase.auth.getUser()` on every request to refresh cookies.

### 3. RLS diagnosis
1. Read `supabase/migrations/` for the relevant RLS policy.
2. Verify `auth.uid()` matches expected user ID.
3. System writes → use `createAdminClient()`.
4. Check `USING` (SELECT/UPDATE/DELETE) vs `WITH CHECK` (INSERT/UPDATE) — missing `WITH CHECK` allows SELECT but blocks INSERT.

### 4. FK hint (ambiguous joins)
```ts
// Wrong — ambiguous
.select('user:user_profiles(id, username)')
// Correct
.select('user:user_profiles!tunes_user_id_fkey(id, username)')
```
List FK names: `SELECT conname FROM pg_constraint WHERE conrelid = 'tunes'::regclass AND contype = 'f';`

### 5. Joined relation typed as array
```ts
// Fix: normalise T | T[] from Supabase typegen
function normalizeTune(raw: T | T[] | null): T | null {
  if (!raw) return null
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}
```

### 6. Stripe webhook
- Needs raw body (not parsed JSON) — `export const dynamic = 'force-dynamic'` already set.
- Handler returns `200` even on switch-case errors (prevents Stripe retries) — check server logs.
- Uses service role key (`SUPABASE_SERVICE_ROLE_KEY`) — no user session in webhook context.

### 7. Env variable check
Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_*` keys.  
Debug endpoint: `GET /api/debug` — check auth state and env diagnostics.
