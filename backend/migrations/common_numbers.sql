-- Common Numbers Table
CREATE TABLE IF NOT EXISTS common_numbers (
    id SERIAL PRIMARY KEY,
    game VARCHAR(50) NOT NULL, -- 'Shillong', 'Khanapara', 'Juwai'
    target_date DATE NOT NULL,
    house VARCHAR(20), -- e.g., "4, 7"
    ending VARCHAR(20), -- e.g., "1, 9"
    direct_numbers TEXT, -- e.g., "41, 49, 71, 79"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game, target_date)
);

-- Saved Common Numbers Table
CREATE TABLE IF NOT EXISTS saved_common_numbers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    common_number_id INTEGER REFERENCES common_numbers(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, common_number_id)
);

-- Add Index for performance
CREATE INDEX IF NOT EXISTS idx_common_numbers_date ON common_numbers(target_date);
