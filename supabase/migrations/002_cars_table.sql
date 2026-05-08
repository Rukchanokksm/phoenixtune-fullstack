-- ================================================================
-- Migration 002: Cars table
-- Phase 2 — replace hardcoded src/data/cars/fh5.ts with DB queries
-- ================================================================

CREATE TABLE IF NOT EXISTS cars (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_slug   text        NOT NULL,            -- 'forza-horizon-5' | 'forza-horizon-6' | ...
  brand       text        NOT NULL,            -- 'Lamborghini'
  brand_id    text        NOT NULL,            -- 'lamborghini'
  model       text        NOT NULL,            -- '2021 Lamborghini Countach LPI 800-4'
  model_id    text        NOT NULL,            -- '2021-lambo-countach-lpi'
  year        integer     NOT NULL,
  drivetrain  text,                            -- 'AWD' | 'RWD' | 'FWD'
  is_dlc      boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Unique model per game
CREATE UNIQUE INDEX IF NOT EXISTS cars_game_model_id ON cars (game_slug, model_id);

-- Query indexes
CREATE INDEX IF NOT EXISTS cars_game_brand   ON cars (game_slug, brand_id);
CREATE INDEX IF NOT EXISTS cars_game_year    ON cars (game_slug, year DESC);

-- Public read (same pattern as games table)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cars_public_read" ON cars FOR SELECT USING (true);

-- ----------------------------------------------------------------
-- How to migrate Phase 1 data:
--   Run the seed script: scripts/seed-cars-fh5.ts
--   npx tsx scripts/seed-cars-fh5.ts
-- ----------------------------------------------------------------
