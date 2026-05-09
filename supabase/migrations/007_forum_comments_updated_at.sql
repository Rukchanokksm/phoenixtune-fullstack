-- Add updated_at column to forum_comments for edit-tracking
ALTER TABLE forum_comments
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;
