# new-migration

Create a new Supabase PostgreSQL migration file.

## Arguments
`$ARGUMENTS` — e.g. "add tags table and tune_tags join table"

## Steps

1. **Read existing migrations first** — `supabase/migrations/` (all files). Know current schema, existing indexes and policies before writing. Current: 001_initial_schema, 002_user_extended, 003_fix_trigger, 004_cars_indexes, 005_games_sort_order, 006_forums.

2. **File name** — `NNN_short_description.sql` (next sequential number, zero-padded to 3 digits).

3. **Schema conventions**:
   - PK: `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
   - Timestamps: `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`
   - User FK: `REFERENCES auth.users(id)` — other tables: `REFERENCES table(id) ON DELETE CASCADE`
   - Columns: `snake_case`; enums: `CREATE TYPE` before the table

4. **RLS — required on every new table**:
   ```sql
   ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "public_read" ON my_table FOR SELECT USING (true);
   CREATE POLICY "owner_insert" ON my_table FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "owner_update" ON my_table FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "owner_delete" ON my_table FOR DELETE USING (auth.uid() = user_id);
   ```

5. **Indexes** on WHERE/ORDER BY/JOIN columns:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_my_table_user_id ON my_table(user_id);
   CREATE INDEX IF NOT EXISTS idx_my_table_created_at ON my_table(created_at DESC);
   ```

6. **`updated_at` trigger** (if table has `updated_at`):
   ```sql
   CREATE TRIGGER set_updated_at BEFORE UPDATE ON my_table
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```
   (`update_updated_at_column` defined in 001_initial_schema.)

7. **TypeScript types** — update `src/types/index.ts` if new table is TS-visible.

8. **Apply**: `node scripts/migrate.js` or Supabase dashboard/CLI.
