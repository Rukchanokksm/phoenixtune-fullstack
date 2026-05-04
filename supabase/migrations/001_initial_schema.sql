-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- ENUM types
CREATE TYPE drivetrain_type AS ENUM ('FWD', 'RWD', 'AWD');
CREATE TYPE pi_class_type AS ENUM ('D', 'C', 'B', 'A', 'S1', 'S2', 'X');
CREATE TYPE discipline_type AS ENUM ('street', 'track', 'rally', 'offroad', 'drift', 'drag');

-- GAMES table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CARS table
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  pi_class pi_class_type NOT NULL,
  drivetrain drivetrain_type NOT NULL,
  weight_kg NUMERIC,
  power_hp INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USER PROFILES table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_premium BOOLEAN DEFAULT false,
  premium_until TIMESTAMPTZ,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TUNES table
CREATE TABLE tunes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  discipline discipline_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL DEFAULT '{}',
  share_code TEXT,
  game_version TEXT,
  is_featured BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMMENTS table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tune_id UUID REFERENCES tunes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAVES table (Premium feature)
CREATE TABLE saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  tune_id UUID REFERENCES tunes(id) ON DELETE CASCADE,
  folder_name TEXT DEFAULT 'Default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tune_id)
);

-- UPVOTES table
CREATE TABLE upvotes (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  tune_id UUID REFERENCES tunes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, tune_id)
);

-- INDEXES
CREATE INDEX idx_tunes_game_id ON tunes(game_id);
CREATE INDEX idx_tunes_discipline ON tunes(discipline);
CREATE INDEX idx_tunes_user_id ON tunes(user_id);
CREATE INDEX idx_tunes_upvotes ON tunes(upvotes DESC);
CREATE INDEX idx_tunes_created_at ON tunes(created_at DESC);
CREATE INDEX idx_cars_game_id ON cars(game_id);
CREATE INDEX idx_cars_pi_class ON cars(pi_class);
CREATE INDEX idx_tunes_search ON tunes USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_tunes_parameters ON tunes USING gin(parameters);

-- ROW LEVEL SECURITY
ALTER TABLE tunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: tunes
CREATE POLICY "tunes_public_read" ON tunes FOR SELECT USING (true);
CREATE POLICY "tunes_owner_insert" ON tunes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tunes_owner_update" ON tunes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tunes_owner_delete" ON tunes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: comments
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_auth_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_owner_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: saves (premium check ทำใน API layer)
CREATE POLICY "saves_owner_only" ON saves USING (auth.uid() = user_id);

-- RLS Policies: upvotes
CREATE POLICY "upvotes_public_read" ON upvotes FOR SELECT USING (true);
CREATE POLICY "upvotes_auth_write" ON upvotes USING (auth.uid() = user_id);

-- RLS Policies: profiles
CREATE POLICY "profiles_public_read" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "profiles_owner_update" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- FUNCTION: auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- FUNCTION: update upvote count
CREATE OR REPLACE FUNCTION update_tune_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tunes SET upvotes = upvotes + 1 WHERE id = NEW.tune_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tunes SET upvotes = upvotes - 1 WHERE id = OLD.tune_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_upvote_change
  AFTER INSERT OR DELETE ON upvotes
  FOR EACH ROW EXECUTE FUNCTION update_tune_upvotes();

-- SEED: Games
INSERT INTO games (name, slug, is_active) VALUES
  ('Forza Horizon 5', 'forza-horizon-5', true),
  ('Forza Horizon 6', 'forza-horizon-6', false),
  ('The Crew Motorfest', 'the-crew-motorfest', true),
  ('NFS Unbound', 'nfs-unbound', true);
