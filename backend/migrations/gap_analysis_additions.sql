-- Migration: gap_analysis_additions.sql
-- Adds columns and tables required for frontend features not yet in DB

-- T6: metadata column on notifications (for VictoryCard data)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata TEXT;

-- T11: image_key and category on groups (used by frontend groups page)
ALTER TABLE groups ADD COLUMN IF NOT EXISTS image_key VARCHAR(50);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Community';

-- T1: likes counter on user_bets (denormalized, updated by trigger/API)
ALTER TABLE user_bets ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;

-- T1: Normalized bet likes table for deduplication per user
CREATE TABLE IF NOT EXISTS bet_likes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    bet_id INT REFERENCES user_bets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, bet_id)
);

-- T7: Deposit requests table (user initiates, admin approves)
CREATE TABLE IF NOT EXISTS deposit_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    utr_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING',
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- T8: Add admin_note column to withdrawal_requests if missing
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS admin_note TEXT;
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
