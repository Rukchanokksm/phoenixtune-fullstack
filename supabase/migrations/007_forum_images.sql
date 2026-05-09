-- Add images array to forum_posts
ALTER TABLE forum_posts ADD COLUMN images TEXT[] NOT NULL DEFAULT '{}';

-- ─────────────────────────────────────────────────────────────────
-- Storage: run these steps manually in Supabase Dashboard
-- ─────────────────────────────────────────────────────────────────
-- 1. Storage → New bucket → name: "forum-images", Public: ON
-- 2. Run the policies below in SQL editor:

-- INSERT policy: authenticated users only
-- CREATE POLICY "forum_images_auth_upload"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'forum-images' AND auth.role() = 'authenticated');

-- SELECT policy: public read
-- CREATE POLICY "forum_images_public_read"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'forum-images');

-- DELETE policy: owner only (auth.uid()::text = owner_id)
-- CREATE POLICY "forum_images_owner_delete"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'forum-images' AND owner_id = auth.uid()::text);
