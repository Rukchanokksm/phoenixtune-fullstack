-- ENUMS ใหม่
CREATE TYPE user_role    AS ENUM ('admin', 'user', 'premium', 'tuner');
CREATE TYPE gender_type  AS ENUM ('male', 'female', 'unspecified');

-- เพิ่ม columns ใน user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS role                  user_role   NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS gender                gender_type NOT NULL DEFAULT 'unspecified',
  ADD COLUMN IF NOT EXISTS country               TEXT,
  ADD COLUMN IF NOT EXISTS active_title          TEXT        NOT NULL DEFAULT 'newcomer',
  ADD COLUMN IF NOT EXISTS titles_earned         TEXT[]      NOT NULL DEFAULT ARRAY['newcomer'],
  ADD COLUMN IF NOT EXISTS tune_share_count      INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_upvotes_received INTEGER    NOT NULL DEFAULT 0;

-- Supabase Storage bucket สำหรับ avatar (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- อัปเดต trigger ให้ใส่ field ใหม่
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, avatar_url, role, active_title, titles_earned)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'user', 'newcomer', ARRAY['newcomer']
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
