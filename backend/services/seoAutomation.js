const axios = require('axios');
const { triggerGoogleIndex } = require('./seoIndexer');

async function publishSeoHooks(date) {
    try {
        console.log(`[SEO Automation] Triggering post-publish hooks for date: ${date}`);
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teer.club';
        const regions = ['shillong', 'khanapara', 'juwai'];

        // Convert YYYY-MM-DD to DD-Month-YYYY for proper slugs
        const d = new Date(date);
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const slugDate = `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;

        // 1. Google Indexing API Pings
        for (const region of regions) {
            const resultUrl = `${baseUrl}/${region}-teer-result-${slugDate}`;
            const predictionUrl = `${baseUrl}/${region}-teer-prediction-today`;
            const commonUrl = `${baseUrl}/${region}-teer-common-number-today`;

            // Fire and forget, don't block the main thread
            triggerGoogleIndex(resultUrl, 'URL_UPDATED').catch(console.error);
            triggerGoogleIndex(predictionUrl, 'URL_UPDATED').catch(console.error);
            triggerGoogleIndex(commonUrl, 'URL_UPDATED').catch(console.error);
        }

        // 2. Telegram Push Notification (If configured)
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (botToken && chatId) {
            const message = `🚀 *Live Teer Results Updated!*\n\n📅 Date: ${d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}\n\nCheck the latest verified numbers right now on Teer Club:\n👉 ${baseUrl}\n\n#TeerResult #ShillongTeer`;

            await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            }).catch(err => console.error('[Telegram] Failed to push message:', err.message));
        }

    } catch (e) {
        console.error('[SEO Automation] Hook failed to execute fully:', e);
    }
}

module.exports = {
    publishSeoHooks
};
