const db = require('../db');

/**
 * Checks if any user saved a common number that matches the newly declared result.
 * If so, sends a congratulatory notification.
 * @param {string} date - Result date (YYYY-MM-DD)
 * @param {string} game - 'Shillong', 'Khanapara', 'Juwai'
 * @param {string} r1 - Round 1 result
 * @param {string} r2 - Round 2 result
 */
async function checkCommonNumberGreetings(date, game, r1, r2) {
    try {
        console.log(`Checking greetings for ${game} on ${date}. R1: ${r1}, R2: ${r2}`);

        // 1. Find the common_number record for this game and date
        const cnRes = await db.query(
            "SELECT id, direct_numbers FROM common_numbers WHERE game = $1 AND target_date = $2",
            [game, date]
        );

        if (cnRes.rows.length === 0) return;

        const commonNumberId = cnRes.rows[0].id;
        const directNumbers = cnRes.rows[0].direct_numbers.split(',').map(n => n.trim());

        // 2. Check if r1 or r2 is in directNumbers
        const isR1Match = directNumbers.includes(r1);
        const isR2Match = directNumbers.includes(r2);

        if (!isR1Match && !isR2Match) return;

        // 3. Find all users who saved this card
        const savedUsersRes = await db.query(
            "SELECT user_id FROM saved_common_numbers WHERE common_number_id = $1",
            [commonNumberId]
        );

        if (savedUsersRes.rows.length === 0) return;

        const roundMatch = isR1Match && isR2Match ? "both rounds" : (isR1Match ? "Round 1" : "Round 2");
        const matchNum = isR1Match && isR2Match ? `${r1} and ${r2}` : (isR1Match ? r1 : r2);

        // 4. Send notifications
        const notificationPromises = savedUsersRes.rows.map(u =>
            db.query(
                "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)",
                [
                    u.id,
                    "🎉 Big Win Greeting!",
                    `Congratulations! Your saved common number ${matchNum} for ${game} matched today's ${roundMatch} result. Great choice!`,
                    "SUCCESS"
                ]
            )
        );

        await Promise.all(notificationPromises);
        console.log(`Sent greetings to ${savedUsersRes.rows.length} users for ${game} match.`);

    } catch (error) {
        console.error("Error in Greetings Service:", error);
    }
}

module.exports = { checkCommonNumberGreetings };
