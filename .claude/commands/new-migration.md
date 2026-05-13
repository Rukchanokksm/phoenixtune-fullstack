# new-migration

Create a new Supabase PostgreSQL migration file for this project.

## Arguments

`$ARGUMENTS` — describe the schema change, e.g. "add tags table and tune_tags join table"

## Steps

### 1. Read existing migrations first

Always read all files in `supabase/migrations/` before writing a new one:
- Understand the current schema, column names, constraints, and RLS policies
- Avoid duplicating indexes or policies that already exist
- Current migrations: 001_initial_schema, 002_user_extended, 003_fix_trigger, 004_cars_indexes, 005_games_sort_order, 006_forums

### 2. File naming

Name the file `NNN_short_description.sql` where `NNN` is the next sequential number (zero-padded to 3 digits). Place it in `supabase/migrations/`.

### 3. Schema conventions from this project

- **Primary keys**: `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
- **Timestamps**: `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`
- **Foreign keys**: reference `auth.users(id)` for user IDs; other tables by `UUID REFERENCES table(id) ON DELETE CASCADE`
- **JSONB for tune params**: `parameters JSONB NOT NULL DEFAULT '{}'`
- **Column names**: always `snake_case` in SQL (TypeScript interfaces use camelCase)
- **Enum types**: create with `CREATE TYPE type_name AS ENUM (...)` before tables that use them

### 4. Row Level Security (RLS) — required on every new table

Enable RLS and add at minimum these policies:
```sql
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Public read (if applicable)
CREATE POLICY "public_read" ON my_table FOR SELECT USING (true);

-- Owner write
CREATE POLICY "owner_insert" ON my_table FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update" ON my_table FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "owner_delete" ON my_table FOR DELETE USING (auth.uid() = user_id);
```

For admin-only tables, use:
```sql
CREATE POLICY "admin_all" ON my_table USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
```

### 5. Indexes

Add indexes on columns used in WHERE / ORDER BY / JOIN clauses:
```sql
CREATE INDEX IF NOT EXISTS idx_my_table_user_id ON my_table(user_id);
CREATE INDEX IF NOT EXISTS idx_my_table_created_at ON my_table(created_at DESC);
```

### 6. Trigger for updated_at (if table has updated_at)

```sql
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON my_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```
(The `update_updated_at_column` function is defined in 001_initial_schema.)

### 7. Update TypeScript types

After writing the SQL, check `src/types/index.ts`. If the new table introduces new TypeScript-visible data, add the interface there.

### 8. Apply locally

To apply the migration, run the Supabase CLI or use the project's migrate script:
```bash
node scripts/migrate.js
```
or push via Supabase dashboard / CLI.
