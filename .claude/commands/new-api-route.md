# new-api-route

Create a new Next.js App Router API route for this project following the established Supabase patterns.

## Arguments

`$ARGUMENTS` — describe what the route does, e.g. "GET /api/forum/categories — list all forum categories"

## Steps

1. **Determine the file path** under `src/app/api/` matching the URL shape.
   - Collection: `src/app/api/<resource>/route.ts`
   - Single item: `src/app/api/<resource>/[id]/route.ts`

2. **Choose the Supabase client** (never mix them in the same handler):
   - `createClient()` from `@/lib/supabase/server` — standard RLS-respecting queries (use for all user-facing data)
   - `createAdminClient()` from `@/lib/supabase/server` — bypasses RLS (only for system-level writes like upsert-or-create flows)

3. **Auth pattern** — required on every mutating route (POST, PATCH, DELETE):
   ```ts
   const { data: { user }, error: authError } = await supabase.auth.getUser()
   if (authError || !user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
   }
   ```

4. **Ownership check** — verify `resource.user_id === user.id` before allowing PATCH/DELETE.
   Return `403 Forbidden` (not 404) when the resource exists but belongs to another user.

5. **Error handling** — wrap the entire handler body in try/catch.
   Cast errors as `{ message?: string; code?: string; details?: string }` before returning:
   ```ts
   } catch (err) {
     const pgErr = err as { message?: string; code?: string; details?: string }
     const message = pgErr?.message ?? (err instanceof Error ? err.message : 'Internal server error')
     return NextResponse.json({ error: message, code: pgErr?.code }, { status: 500 })
   }
   ```

6. **Filtering with joined columns** — Supabase does NOT support `.eq('relation.column', value)`.
   Resolve through a separate cars/games query first, then use `.in('car_id', matchedIds)`.
   See `src/app/api/tunes/route.ts` for the piClass/drivetrain pattern.

7. **Dynamic params** — always await params (Next.js 15+):
   ```ts
   type Params = { params: Promise<{ id: string }> }
   export async function GET(req: NextRequest, { params }: Params) {
     const { id } = await params
   ```

8. **Return shapes**:
   - List: `{ data: T[], total: number, page: number, perPage: number }`
   - Single: the resource object directly
   - Created: resource with `status: 201`
   - Deleted: `{ deleted: id }`

9. **Domain types** — all TypeScript types live in `src/types/index.ts`. Use them; do not redeclare.

After writing the file, run `npm run build` to check for type errors.
