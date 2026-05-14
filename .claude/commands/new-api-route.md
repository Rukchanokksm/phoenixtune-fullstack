# new-api-route

Create a new Next.js App Router API route following project Supabase patterns.

## Arguments
`$ARGUMENTS` — e.g. "GET /api/forum/categories — list all forum categories"

## Steps

1. **File path** under `src/app/api/`: collection → `route.ts`, single item → `[id]/route.ts`.

2. **Supabase client**: `createClient()` (RLS) for user-facing data; `createAdminClient()` (bypass RLS) for system writes only.

3. **Dynamic params** (Next.js 15+):
   ```ts
   type Params = { params: Promise<{ id: string }> }
   export async function GET(req: NextRequest, { params }: Params) {
     const { id } = await params
   ```

4. **Auth** on every mutating route (see CLAUDE.md key patterns).

5. **Ownership** — verify `resource.user_id === user.id` before PATCH/DELETE. Return `403` (not `404`) for existing-but-wrong-owner.

6. **Error handling** — wrap handler in try/catch:
   ```ts
   } catch (err) {
     const e = err as { message?: string; code?: string }
     return NextResponse.json({ error: e?.message ?? 'Internal server error', code: e?.code }, { status: 500 })
   }
   ```

7. **Return shapes**:
   - List: `{ data: T[], total, page, perPage }`
   - Single: resource object
   - Created: resource + `status: 201`
   - Deleted: `{ deleted: id }`

8. **Filtering joined columns** — see CLAUDE.md Supabase limitation note.

`npm run build` after writing.
