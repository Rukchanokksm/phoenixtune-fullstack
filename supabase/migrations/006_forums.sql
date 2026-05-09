-- Forum posts
CREATE TYPE forum_category AS ENUM ('announcement', 'general', 'report');

CREATE TABLE forum_posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  game_id      UUID REFERENCES games(id) ON DELETE SET NULL,
  category     forum_category NOT NULL DEFAULT 'general',
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  upvotes      INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Forum comments
CREATE TABLE forum_comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_forum_posts_category   ON forum_posts(category);
CREATE INDEX idx_forum_posts_updated    ON forum_posts(updated_at DESC);
CREATE INDEX idx_forum_posts_upvotes    ON forum_posts(upvotes DESC);
CREATE INDEX idx_forum_comments_post    ON forum_comments(post_id);

-- RLS
ALTER TABLE forum_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "forum_posts_public_read"  ON forum_posts FOR SELECT USING (true);
CREATE POLICY "forum_posts_auth_insert"  ON forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_posts_owner_update" ON forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "forum_posts_owner_delete" ON forum_posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "forum_comments_public_read"  ON forum_comments FOR SELECT USING (true);
CREATE POLICY "forum_comments_auth_insert"  ON forum_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_comments_owner_delete" ON forum_comments FOR DELETE USING (auth.uid() = user_id);

-- Trigger: bump updated_at and comment_count on comment insert/delete
CREATE OR REPLACE FUNCTION sync_forum_post_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_posts
  SET updated_at    = NOW(),
      comment_count = comment_count + (CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END)
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_forum_comment_change
  AFTER INSERT OR DELETE ON forum_comments
  FOR EACH ROW EXECUTE FUNCTION sync_forum_post_on_comment();
