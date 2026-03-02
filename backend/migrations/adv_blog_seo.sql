-- backend/migrations/adv_blog_seo.sql

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS focus_keyword VARCHAR(255);
