-- Activate Forza Horizon 6 and add 'R' (Race) class to pi_class_type enum
ALTER TYPE pi_class_type ADD VALUE IF NOT EXISTS 'R';

UPDATE games SET is_active = true WHERE slug = 'forza-horizon-6';
