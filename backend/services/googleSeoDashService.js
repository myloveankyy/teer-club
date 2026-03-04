const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const KEY_PATH = path.join(__dirname, '..', 'service-account.json');

async function getAuthClient() {
    if (!fs.existsSync(KEY_PATH)) {
        throw new Error('service-account.json not found');
    }
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_PATH,
        scopes: [
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/analytics.readonly'
        ],
    });
    return await auth.getClient();
}

async function getGscData(siteUrl, days = 30) {
    try {
        const authClient = await getAuthClient();
        const searchconsole = google.searchconsole({ version: 'v1', auth: authClient });

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const endStr = endDate.toISOString().split('T')[0];
        const startStr = startDate.toISOString().split('T')[0];

        const response = await searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: startStr,
                endDate: endStr,
                dimensions: ['query'],
                rowLimit: 10, // top 10 keywords
            }
        });

        // Also get overall stats
        const overallResponse = await searchconsole.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: startStr,
                endDate: endStr,
                dimensions: ['date'],
            }
        });

        let totalClicks = 0;
        let totalImpressions = 0;
        let avgPosition = 0;

        if (overallResponse.data.rows) {
            totalClicks = overallResponse.data.rows.reduce((sum, r) => sum + r.clicks, 0);
            totalImpressions = overallResponse.data.rows.reduce((sum, r) => sum + r.impressions, 0);
            const totalPosition = overallResponse.data.rows.reduce((sum, r) => sum + (r.position * r.impressions), 0);
            if (totalImpressions > 0) {
                avgPosition = (totalPosition / totalImpressions).toFixed(2);
            }
        }

        return {
            success: true,
            topQueries: response.data.rows || [],
            totals: {
                clicks: totalClicks,
                impressions: totalImpressions,
                avgPosition
            }
        };

    } catch (e) {
        console.error('[GSC Error]', e.message);
        return { success: false, error: e.message, fallback: true };
    }
}

async function getGa4Data(propertyId, days = 7) {
    try {
        if (!propertyId) throw new Error('GA4_PROPERTY_ID is missing');
        const authClient = await getAuthClient();
        const analyticsdata = google.analyticsdata({ version: 'v1beta', auth: authClient });

        // Get realtime active users
        let activeUsers = 0;
        try {
            const rtResponse = await analyticsdata.properties.runRealtimeReport({
                property: `properties/${propertyId}`,
                requestBody: {
                    metrics: [{ name: 'activeUsers' }]
                }
            });
            if (rtResponse.data.rows && rtResponse.data.rows.length > 0) {
                activeUsers = parseInt(rtResponse.data.rows[0].metricValues[0].value, 10);
            }
        } catch (rtErr) {
            console.warn('[GA4 Realtime warning]', rtErr.message);
        }

        return {
            success: true,
            activeUsers
        };
    } catch (e) {
        console.error('[GA4 Error]', e.message);
        return { success: false, error: e.message, fallback: true };
    }
}

module.exports = {
    getGscData,
    getGa4Data
};
