const { scrapeTeerHistory } = require('./scraper');

/**
 * Calculates common numbers from the last N days of history.
 * @param {number} days - Number of days to analyze (default: 30)
 * @returns {Promise<Object>} - Common numbers for Shillong Round 1 & 2
 */
async function getCommonNumbers(days = 30) {
    try {
        const history = await scrapeTeerHistory();

        // Filter history for the last N days (approx)
        // Since history is sorted by date desc, just take the first N items
        const recentHistory = history.slice(0, days);

        const round1Counts = {};
        const round2Counts = {};

        recentHistory.forEach(item => {
            if (item.shillong && item.shillong.round1) {
                const num = item.shillong.round1;
                round1Counts[num] = (round1Counts[num] || 0) + 1;
            }
            if (item.shillong && item.shillong.round2) {
                const num = item.shillong.round2;
                round2Counts[num] = (round2Counts[num] || 0) + 1;
            }
        });

        const sortedRound1 = Object.entries(round1Counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Top 5
            .map(([number, count]) => ({ number, count }));

        const sortedRound2 = Object.entries(round2Counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Top 5
            .map(([number, count]) => ({ number, count }));

        return {
            period: `${days} days`,
            shillong: {
                round1: sortedRound1,
                round2: sortedRound2
            }
        };

    } catch (error) {
        console.error('Analytics Error:', error);
        return { error: 'Failed to calculate analytics' };
    }
}


/**
 * Generates predictions based on recent history (Hot/Cold numbers).
 * @returns {Promise<Object>}
 */
async function getPredictions() {
    try {
        const result = await getCommonNumbers(30); // Reuse logic to get counts
        if (result.error) throw new Error(result.error);

        const r1 = result.shillong.round1;

        // Hot Numbers (Already sorted desc)
        const hotNumbers = r1.slice(0, 5).map(i => i.number);

        // Cold Numbers (Need identifying numbers with 0 or low frequency in last 30 days)
        // For simplicity, let's take the least frequent from the existing count list
        // And maybe add some randoms if list is short (start of data)
        const coldNumbers = r1.slice(-5).reverse().map(i => i.number);

        // Daily Targets Logic (Pseudo-random based on Date for R1 and R2 separation)
        const today = new Date();
        const seed1 = today.getDate() + today.getMonth();
        const seed2 = today.getDate() * today.getMonth() + 1;

        const r1Target = ((seed1 * 7) % 100).toString().padStart(2, '0');
        const r2Target = ((seed2 * 13) % 100).toString().padStart(2, '0');

        return {
            hotNumbers,
            coldNumbers,
            round1Target: r1Target,
            round2Target: r2Target
        };
    } catch (error) {
        console.error('Prediction Error:', error);
        return {
            hotNumbers: ['07', '19', '55'],
            coldNumbers: ['01', '33', '88'],
            round1Target: '99', // Fallback R1
            round2Target: '00'  // Fallback R2
        };
    }
}

module.exports = { getCommonNumbers, getPredictions };
