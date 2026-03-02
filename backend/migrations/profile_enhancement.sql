-- backend/migrations/profile_enhancement.sql

-- Add profile picture and bio to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Index for performance if needed (though unlikely for these fields)
-- But let's create a view or function to get multi-level connections more efficiently if possible.
