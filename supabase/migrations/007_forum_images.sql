-- Add images array to forum_posts
ALTER TABLE forum_posts ADD COLUMN images TEXT[] NOT NULL DEFAULT '{}';

-- ─────────────────────────────────────────────────────────────────
-- Storage setup — run these steps manually in Supabase Dashboard
-- ─────────────────────────────────────────────────────────────────
-- Step 1: Storage → New bucket
--   Name:   forum-images
--   Public: ON  (so image URLs are publicly accessible)
--
-- Step 2: SQL Editor → run the policies below

-- Authenticated users may upload ONLY to the temps/ folder.
-- The server (service role / admin client) moves files to posts/{id}/ —
-- the service role bypasses RLS so no separate INSERT policy is needed for posts/.
CREATE POLICY "forum_images_temps_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'forum-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'temps'
  );

-- Public read for all files in the bucket
CREATE POLICY "forum_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'forum-images');

-- Users can delete their own temp files (identified by uid prefix in the filename)
CREATE POLICY "forum_images_owner_delete_temps"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'forum-images'
    AND (storage.foldername(name))[1] = 'temps'
    AND owner_id = auth.uid()::text
  );
