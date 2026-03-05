const fs = require('fs');
const path = require('path');
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const SHARES_DIR = path.join(__dirname, '../public/shares');

// Ensure the directory exists
if (!fs.existsSync(SHARES_DIR)) {
    fs.mkdirSync(SHARES_DIR, { recursive: true });
}

/**
 * Generates an image for the given Teer result using Gemini Imagen 3
 * @param {string} region e.g. 'shillong', 'khanapara', 'juwai'
 * @param {number} round 1 or 2
 * @param {string} result The winning number or '--'
 * @param {string} date YYYY-MM-DD
 * @returns {Promise<string>} The filename or URL path to the generated image
 */
async function generateAndSaveTeerImage(region, round, result, date) {
    if (!region || !result || result === '--' || !date) {
        return null;
    }

    const filename = `${date}-${region}-r${round}.png`;
    const filepath = path.join(SHARES_DIR, filename);

    // If it already exists, do not regenerate
    if (fs.existsSync(filepath)) {
        console.log(`[ImageGen] Image already exists for ${region} R${round} on ${date}. Returning cached version.`);
        return `/shares/${filename}`;
    }

    const cultureDesc = {
        shillong: "the misty Khasi Hills of Meghalaya",
        khanapara: "the lush green outskirts of Guwahati, Ri-Bhoi",
        juwai: "the serene Jaintia Hills of Meghalaya"
    };

    const location = region.charAt(0).toUpperCase() + region.slice(1);
    const desc = cultureDesc[region] || "the beautiful hills of Northeast India";

    const prompt = `A highly realistic, cinematic photo of a traditional Teer result blackboard in ${desc}. 
    The blackboard is made of dark, weathered wood and has authentic white chalk writing. 
    At the top, it clearly says "TEER.CLUB" in stylized chalk letters. 
    Below that, it says "${location.toUpperCase()} TEER". 
    There is a result section that says "DATE: ${date}" and "ROUND: ${round === 1 ? 'FIRST' : 'SECOND'}".
    The winning number "${result}" is written large and bold in chalk.
    At the bottom, there is a clear promotional text overlay that reads "Refer & Earn on Teer.Club".
    A traditional leather quiver filled with bamboo arrows is leaning against the wooden frame of the blackboard. 
    The background is a soft-focus, misty village landscape with tropical greenery. 
    The image has a nostalgic, heritage feel with moody lighting. 4k resolution, hyper-realistic.`;

    console.log(`[ImageGen] Triggering Gemini for ${location} R${round} - Result: ${result} - ${date}`);

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${GEMINI_API_KEY}`,
            {
                requests: [{ prompt, aspectRatio: "1:1" }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const predictions = response.data.predictions;

        if (predictions && predictions.length > 0 && predictions[0].bytesBase64Encoded) {
            const buffer = Buffer.from(predictions[0].bytesBase64Encoded, 'base64');
            fs.writeFileSync(filepath, buffer);
            console.log(`[ImageGen] Successfully saved ${filename}`);
            return `/shares/${filename}`;
        } else {
            console.error('[ImageGen] Unexpected response structure:', JSON.stringify(response.data));
            return null;
        }

    } catch (error) {
        console.error('[ImageGen] Error generating image:', error.response?.data?.error?.message || error.message);
        return null;
    }
}

/**
 * Generates a consolidated image for all Teer results of the day
 */
async function generateConsolidatedTeerImage(resultsObj, date) {
    if (!resultsObj || !date) return null;

    const filename = `consolidated-${date}.png`;
    const filepath = path.join(SHARES_DIR, filename);

    const { round1, round2, khanapara_r1, khanapara_r2, juwai_r1, juwai_r2 } = resultsObj;

    // Format date for display
    const displayDate = new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const prompt = `A hyper-realistic, minimalist, and "sexily styled" industrial-grade Teer results dashboard. 
    The centerpiece is an ultra-modern, dark matte wooden board with sharp (not rounded) edges, featuring a high-contrast white chalk design.
    The header "TEER" is in massive, sharp, elegant serif typography.
    Below it, "OFFICIAL RESULT LOG: ${displayDate}" in technical, small-caps handwriting.
    The results are presented in a clean, industrial-style grid:
    
    [ SHILLONG ]  FR: ${round1 || '??'}  |  SR: ${round2 || '??'}
    [ KHANAPARA ] FR: ${khanapara_r1 || '??'}  |  SR: ${khanapara_r2 || '??'}
    [ JUWAI ]     FR: ${juwai_r1 || '??'}  |  SR: ${juwai_r2 || '??'}
    
    The board is littered with "micro-information": small chalk-drawn arrow symbols, verification checkmarks, and a technical-looking "DATA-SYNC" indicator.
    A single, premium leather quiver with high-detail bamboo arrows is positioned beside the board.
    The background is a cinematic, soft-bokeh shot of the misty Khasi hills at dawn, with a cool, moody atmospheric lighting.
    The footer has a sharp, minimalist logo: "TEER.CLUB - PREMIUM ANALYTICS".
    Hyper-realistic 8k, cinematic depth of field, authentic wood texture, professional photography, industrial minimalism.`;



    console.log(`[ImageGen] Triggering Consolidated Gemini Image for ${date}`);

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${GEMINI_API_KEY}`,
            {
                requests: [{ prompt, aspectRatio: "1:1" }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const predictions = response.data.predictions;

        if (predictions && predictions.length > 0 && predictions[0].bytesBase64Encoded) {
            const buffer = Buffer.from(predictions[0].bytesBase64Encoded, 'base64');
            fs.writeFileSync(filepath, buffer);
            console.log(`[ImageGen] Successfully saved ${filename}`);
            return `/shares/${filename}`;
        }
        return null;
    } catch (error) {
        console.error('[ImageGen] Error generating consolidated image:', error.response?.data?.error?.message || error.message);
        return null;
    }
}

/**
 * Triggers background generation for all results of a given day
 * Used silently in the background when admin scrapes or edits results
 */
async function triggerDailyImageGeneration(date, resultsObj) {
    if (!resultsObj) return;

    console.log(`[ImageGen] Starting background generation task for ${date}`);

    // resultsObj structure: { round1, round2, khanapara_r1, khanapara_r2, juwai_r1, juwai_r2 }
    const tasks = [
        { region: 'shillong', round: 1, val: resultsObj.round1 },
        { region: 'shillong', round: 2, val: resultsObj.round2 },
        { region: 'khanapara', round: 1, val: resultsObj.khanapara_r1 },
        { region: 'khanapara', round: 2, val: resultsObj.khanapara_r2 },
        { region: 'juwai', round: 1, val: resultsObj.juwai_r1 },
        { region: 'juwai', round: 2, val: resultsObj.juwai_r2 },
    ];

    // Generate individual images (existing logic)
    for (const task of tasks) {
        if (task.val && task.val !== '--' && task.val !== 'XX' && task.val !== '??') {
            await generateAndSaveTeerImage(task.region, task.round, task.val, date).catch(err => console.error(err));
        }
    }

    // NEW: Generate the consolidated image for all 6 games
    await generateConsolidatedTeerImage(resultsObj, date).catch(err => console.error(err));

    console.log(`[ImageGen] Background generation task for ${date} complete.`);
}

module.exports = {
    generateAndSaveTeerImage,
    generateConsolidatedTeerImage,
    triggerDailyImageGeneration
};

