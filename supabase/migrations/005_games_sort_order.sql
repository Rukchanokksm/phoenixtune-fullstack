-- Fix games created_at so ORDER BY created_at DESC gives the right left-to-right order.
-- Desired: FH6 (newest/leftmost) → FH5 → The Crew Motorfest → NFS Unbound
UPDATE games SET created_at = NOW() + INTERVAL '3 seconds' WHERE slug = 'forza-horizon-6';
UPDATE games SET created_at = NOW() + INTERVAL '2 seconds' WHERE slug = 'forza-horizon-5';
UPDATE games SET created_at = NOW() + INTERVAL '1 second'  WHERE slug = 'the-crew-motorfest';
UPDATE games SET created_at = NOW()                         WHERE slug = 'nfs-unbound';
