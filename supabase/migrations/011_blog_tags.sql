ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING gin(tags);
