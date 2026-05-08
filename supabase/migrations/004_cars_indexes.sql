-- ================================================================
-- Migration 002: Cars table — indexes & RLS
-- The cars table was created in 001_initial_schema.sql with columns:
--   id, game_id (UUID FK), make, model, year, pi_class, drivetrain,
--   weight_kg, power_hp, created_at
-- This migration adds useful indexes + RLS for public read.
-- ================================================================

-- Unique constraint: same car model per game (prevent duplicate rows)
CREATE UNIQUE INDEX IF NOT EXISTS cars_game_make_model_year
  ON cars (game_id, make, model, year);

-- Query speed: look up cars by game
CREATE INDEX IF NOT EXISTS cars_game_id_idx    ON cars (game_id);

-- Query speed: filter by pi_class / drivetrain
CREATE INDEX IF NOT EXISTS cars_pi_class_idx   ON cars (pi_class);
CREATE INDEX IF NOT EXISTS cars_drivetrain_idx ON cars (drivetrain);

-- RLS: public read
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cars' AND policyname = 'cars_public_read'
  ) THEN
    CREATE POLICY "cars_public_read" ON cars FOR SELECT USING (true);
  END IF;
END $$;
