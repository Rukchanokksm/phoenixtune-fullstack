-- Guideline posts (admin-create-only)
CREATE TABLE guideline_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  cover_url     TEXT,
  body          TEXT NOT NULL DEFAULT '[]',
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts (admin-create-only)
CREATE TABLE blog_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  cover_url     TEXT,
  body          TEXT NOT NULL DEFAULT '[]',
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Comments on guideline posts
CREATE TABLE guideline_comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES guideline_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments on blog posts
CREATE TABLE blog_comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_guideline_posts_created ON guideline_posts(created_at DESC);
CREATE INDEX idx_guideline_comments_post ON guideline_comments(post_id);
CREATE INDEX idx_blog_posts_created      ON blog_posts(created_at DESC);
CREATE INDEX idx_blog_comments_post      ON blog_comments(post_id);

-- RLS
ALTER TABLE guideline_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE guideline_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments      ENABLE ROW LEVEL SECURITY;

-- Helper: check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Guideline policies (admin writes, public reads)
CREATE POLICY "guideline_posts_public_read"   ON guideline_posts FOR SELECT USING (true);
CREATE POLICY "guideline_posts_admin_insert"  ON guideline_posts FOR INSERT WITH CHECK (auth.uid() = user_id AND is_admin());
CREATE POLICY "guideline_posts_admin_update"  ON guideline_posts FOR UPDATE USING (is_admin());
CREATE POLICY "guideline_posts_admin_delete"  ON guideline_posts FOR DELETE USING (is_admin());

CREATE POLICY "guideline_comments_public_read"  ON guideline_comments FOR SELECT USING (true);
CREATE POLICY "guideline_comments_auth_insert"  ON guideline_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "guideline_comments_owner_delete" ON guideline_comments FOR DELETE USING (auth.uid() = user_id);

-- Blog policies (admin writes, public reads)
CREATE POLICY "blog_posts_public_read"   ON blog_posts FOR SELECT USING (true);
CREATE POLICY "blog_posts_admin_insert"  ON blog_posts FOR INSERT WITH CHECK (auth.uid() = user_id AND is_admin());
CREATE POLICY "blog_posts_admin_update"  ON blog_posts FOR UPDATE USING (is_admin());
CREATE POLICY "blog_posts_admin_delete"  ON blog_posts FOR DELETE USING (is_admin());

CREATE POLICY "blog_comments_public_read"  ON blog_comments FOR SELECT USING (true);
CREATE POLICY "blog_comments_auth_insert"  ON blog_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "blog_comments_owner_delete" ON blog_comments FOR DELETE USING (auth.uid() = user_id);

-- Triggers: bump updated_at and comment_count on comment insert/delete
CREATE OR REPLACE FUNCTION sync_guideline_post_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE guideline_posts
  SET updated_at    = NOW(),
      comment_count = comment_count + (CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END)
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_guideline_comment_change
  AFTER INSERT OR DELETE ON guideline_comments
  FOR EACH ROW EXECUTE FUNCTION sync_guideline_post_on_comment();

CREATE OR REPLACE FUNCTION sync_blog_post_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE blog_posts
  SET updated_at    = NOW(),
      comment_count = comment_count + (CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END)
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_blog_comment_change
  AFTER INSERT OR DELETE ON blog_comments
  FOR EACH ROW EXECUTE FUNCTION sync_blog_post_on_comment();
