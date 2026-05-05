-- ตรวจสอบว่า columns ใหม่มีอยู่แล้วหรือยัง ถ้าไม่มีให้เพิ่ม
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'user', 'premium', 'tuner');
    ALTER TABLE user_profiles ADD COLUMN role user_role NOT NULL DEFAULT 'user';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='gender') THEN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'unspecified');
    ALTER TABLE user_profiles ADD COLUMN gender gender_type NOT NULL DEFAULT 'unspecified';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='country') THEN
    ALTER TABLE user_profiles ADD COLUMN country TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='active_title') THEN
    ALTER TABLE user_profiles ADD COLUMN active_title TEXT NOT NULL DEFAULT 'newcomer';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='titles_earned') THEN
    ALTER TABLE user_profiles ADD COLUMN titles_earned TEXT[] NOT NULL DEFAULT ARRAY['newcomer'];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='tune_share_count') THEN
    ALTER TABLE user_profiles ADD COLUMN tune_share_count INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='total_upvotes_received') THEN
    ALTER TABLE user_profiles ADD COLUMN total_upvotes_received INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- แก้ trigger ให้ robust — ไม่ fail แม้เกิด error
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _username TEXT;
BEGIN
  _username := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO user_profiles (
    id, username, avatar_url,
    role, active_title, titles_earned
  ) VALUES (
    NEW.id, _username,
    NEW.raw_user_meta_data->>'avatar_url',
    'user', 'newcomer', ARRAY['newcomer']
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log แต่ไม่ block การสร้าง user
  RAISE LOG 'handle_new_user error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
