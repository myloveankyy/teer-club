const db = require('../db');

/**
 * Process referral rewards for a new user registration.
 * Level 1: Rs. 25
 * Level 2: Rs. 5
 * Level 3: Rs. 2
 * Level 4: Rs. 2
 * Level 5: Rs. 1
 * New User: Rs. 25
 * 
 * @param {number} newUserId - The ID of the newly registered user
 * @param {number} referrerId - The ID of the direct referrer
 */
async function processReferralRewards(newUserId, referrerId) {
    if (!referrerId) return;

    try {
        console.log(`[Referral] Processing referral for new user ${newUserId} referred by ${referrerId}`);

        // 1. Give New User Sign-up Bonus (Rs. 25)
        await db.query(`
            UPDATE users SET wallet_balance = wallet_balance + 25.00 WHERE id = $1
        `, [newUserId]);

        await db.query(`
            INSERT INTO transactions (user_id, amount, type, status, description)
            VALUES ($1, 25.00, 'REFERRAL_BONUS', 'COMPLETED', 'Sign-up bonus via referral')
        `, [newUserId]);

        // 2. Process Multi-Level Rewards
        const rewards = [25.00, 5.00, 2.00, 2.00, 1.00];
        let currentReferrerId = referrerId;

        for (let level = 0; level < rewards.length; level++) {
            if (!currentReferrerId) break;

            const rewardAmount = rewards[level];
            const levelNum = level + 1;

            // Update Referrer Balance
            await db.query(`
                UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2
            `, [rewardAmount, currentReferrerId]);

            // Log Transaction
            await db.query(`
                INSERT INTO transactions (user_id, amount, type, status, description)
                VALUES ($1, $2, 'REFERRAL_EARNING', 'COMPLETED', $3)
            `, [
                currentReferrerId,
                rewardAmount,
                `Level ${levelNum} referral reward from user ID ${newUserId}`
            ]);

            // Notify Referrer
            await db.query(`
                INSERT INTO notifications (user_id, type, title, message)
                VALUES ($1, 'REFERRAL', 'New Referral Earning!', $2)
            `, [
                currentReferrerId,
                `You earned Rs. ${rewardAmount} from a Level ${levelNum} referral!`
            ]);

            // Move up the tree
            const referrerRes = await db.query('SELECT referred_by_id FROM users WHERE id = $1', [currentReferrerId]);
            currentReferrerId = referrerRes.rows[0]?.referred_by_id || null;
        }

        console.log(`[Referral] Completed rewards processing for user ${newUserId}`);
    } catch (err) {
        console.error('[Referral] Error processing rewards:', err);
    }
}

module.exports = { processReferralRewards };
