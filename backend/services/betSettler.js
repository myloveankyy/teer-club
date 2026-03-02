const db = require('../db');
const { v4: uuidv4 } = require('uuid');

/**
 * Automates the settlement of user bets against official scraped results.
 */
async function settlePendingBets() {
    console.log('[Auto-Settler] Starting batch settlement of pending bets...');
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        // 1. Get today's official results
        const todayStr = new Date().toISOString().split('T')[0];
        const resultRes = await client.query('SELECT * FROM results WHERE date = $1', [todayStr]);

        if (resultRes.rows.length === 0) {
            console.log('[Auto-Settler] No official results found for today. Skipping.');
            await client.query('ROLLBACK');
            return;
        }

        const official = resultRes.rows[0];

        // 2. Fetch all PENDING bets for today
        const pendingBetsRes = await client.query(`
            SELECT id, user_id, game_type, round, number, amount 
            FROM user_bets 
            WHERE status = 'PENDING' AND DATE(created_at) = $1
            FOR UPDATE
        `, [todayStr]);

        const pendingBets = pendingBetsRes.rows;

        if (pendingBets.length === 0) {
            console.log('[Auto-Settler] No pending bets found. Skipping.');
            await client.query('ROLLBACK');
            return;
        }

        // 3. Fetch Admin Multiplier Rates
        const settingsRes = await client.query("SELECT value FROM settings WHERE key = 'calculator_rates'");
        let rates = {
            shillongRate: 80,
            khanaparaRate: 80,
            juwaiRate: 80,
        };

        if (settingsRes.rows.length > 0) {
            const adminRates = settingsRes.rows[0].value;
            if (adminRates.shillongRate) rates.shillongRate = adminRates.shillongRate;
            if (adminRates.khanaparaRate) rates.khanaparaRate = adminRates.khanaparaRate;
            if (adminRates.juwaiRate) rates.juwaiRate = adminRates.juwaiRate;
        }

        let settledCount = 0;

        // 4. Process each pending bet
        for (const bet of pendingBets) {
            const { id, user_id, game_type, round, number, amount } = bet;

            // Determine if the official record exists for this game & round
            let gameDataField = null;
            let currentMultiplier = 80;

            if (game_type === 'Shillong FR' || game_type === 'Shillong SR') {
                gameDataField = round === 'FR' ? official.round1 : official.round2;
                currentMultiplier = rates.shillongRate;
            } else if (game_type === 'Khanapara FR' || game_type === 'Khanapara SR') {
                gameDataField = round === 'FR' ? official.khanapara_r1 : official.khanapara_r2;
                currentMultiplier = rates.khanaparaRate;
            } else if (game_type === 'Juwai FR' || game_type === 'Juwai SR') {
                gameDataField = round === 'FR' ? official.juwai_r1 : official.juwai_r2;
                currentMultiplier = rates.juwaiRate;
            }

            // If the official result for this specific round is not out yet, skip it.
            if (!gameDataField || gameDataField === 'xx' || gameDataField === 'XX' || gameDataField === '-' || gameDataField === '*') {
                continue;
            }

            // Settle Bet
            if (gameDataField === number) {
                // WON !
                const winnings = parseFloat(amount) * currentMultiplier;
                const trxId = `WIN-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

                // Mark bet as WON
                await client.query("UPDATE user_bets SET status = 'WON' WHERE id = $1", [id]);

                // Update Wallet
                await client.query("UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2", [winnings, user_id]);

                // Log Transaction
                await client.query(`
                    INSERT INTO transactions (user_id, amount, type, status, description)
                    VALUES ($1, $2, $3, $4, $5)
                `, [user_id, winnings, 'BET_WON', 'COMPLETED', `Won ${game_type} ${round} prediction (TRX: ${trxId})`]);

                // Emit User Notification with metadata for VictoryCard
                const notifMeta = JSON.stringify({
                    number,
                    game_type,
                    round,
                    amount: parseFloat(amount),
                    win_amount: winnings
                });
                await client.query(`
                    INSERT INTO notifications (user_id, type, title, message, metadata)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT DO NOTHING
                `, [user_id, 'BET_WON', 'Winning Prediction! 🎉', `Your ${game_type} ${round} prediction (${number}) was correct! ₹${winnings.toFixed(2)} has been added to your wallet.`, notifMeta]);

            } else {
                // LOST
                await client.query("UPDATE user_bets SET status = 'LOST' WHERE id = $1", [id]);
            }

            settledCount++;
        }

        await client.query('COMMIT');
        console.log(`[Auto-Settler] Successfully settled ${settledCount} bets.`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Auto-Settler] Error during settlement:', err);
    } finally {
        client.release();
    }
}

module.exports = { settlePendingBets };
