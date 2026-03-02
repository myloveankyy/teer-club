const db = require('../db');

/**
 * Sends a notification to all active users.
 */
async function sendGlobalNotification(title, message, type = 'system') {
    try {
        console.log(`[NotificationService] Sending global notification: ${title}`);

        // Fetch all users
        const users = await db.query("SELECT id FROM users");

        if (users.rows.length === 0) return;

        // Insert notification for each user
        const values = users.rows.map(u => `('${u.id}', '${title}', '${message}', '${type}')`).join(',');

        await db.query(`
            INSERT INTO notifications (user_id, title, message, type)
            VALUES ${values}
        `);

    } catch (err) {
        console.error("[NotificationService] Error sending global notification:", err);
    }
}

/**
 * Sends a notification to a specific user.
 */
async function sendUserNotification(userId, title, message, type = 'personal') {
    try {
        await db.query(`
            INSERT INTO notifications (user_id, title, message, type)
            VALUES ($1, $2, $3, $4)
        `, [userId, title, message, type]);
    } catch (err) {
        console.error("[NotificationService] Error sending user notification:", err);
    }
}

module.exports = {
    sendGlobalNotification,
    sendUserNotification
};
