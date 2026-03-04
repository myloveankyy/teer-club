-- backend/migrations/auto_blog_enhancements.sql
-- Adds columns needed for the AI auto blog generator

ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS schema_markup TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS generation_theme VARCHAR(255);
