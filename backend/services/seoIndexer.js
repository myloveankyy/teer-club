const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const KEY_PATH = path.join(__dirname, '..', 'service-account.json');

async function triggerGoogleIndex(url, type = 'URL_UPDATED') {
    if (!url) {
        throw new Error('URL is required for indexing');
    }

    if (!fs.existsSync(KEY_PATH)) {
        console.warn('[SEO] service-account.json not found. Skipping Google Indexing API call.');
        return null;
    }

    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_PATH,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });

        const authClient = await auth.getClient();

        const indexing = google.indexing({
            version: 'v3',
            auth: authClient,
        });

        const response = await indexing.urlNotifications.publish({
            requestBody: {
                url: url,
                type: type,
            },
        });

        console.log(`[SEO] Successfully sent index request for ${url}`);
        return response.data;
    } catch (error) {
        console.error('[SEO] Error submitting URL to Google Indexing API:', error.message);
        throw error;
    }
}

module.exports = {
    triggerGoogleIndex
};
