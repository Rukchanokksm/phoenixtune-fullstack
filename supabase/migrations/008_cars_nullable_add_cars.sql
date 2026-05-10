-- Make pi_class and drivetrain optional (not all cars need full specs)
ALTER TABLE cars ALTER COLUMN pi_class  DROP NOT NULL;
ALTER TABLE cars ALTER COLUMN drivetrain DROP NOT NULL;

-- Add 4 FH5 cars (name + year only, no spec details)
INSERT INTO cars (game_id, make, model, year, pi_class, drivetrain)
SELECT
  g.id,
  v.make,
  v.model,
  v.year,
  NULL,
  NULL
FROM games g
CROSS JOIN (VALUES
  ('Infiniti',      'Q60 Concept',    2015),
  ('International', 'Scout 800A',     1970),
  ('Italdesign',    'DaVinci Concept',2019),
  ('Italdesign',    'Zerouno',        2018)
) AS v(make, model, year)
WHERE g.slug = 'forza-horizon-5'
  AND NOT EXISTS (
    SELECT 1 FROM cars c
    WHERE c.game_id = g.id
      AND c.make  = v.make
      AND c.model = v.model
      AND c.year  = v.year
  );
