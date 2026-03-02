const express = require('express');
const router = express.Router();
const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCl253SC0rBsg_-1J7m0Rdni7mVNJgq8_0';

router.post('/generate-share-image', async (req, res) => {
    try {
        const { region, round, result, date } = req.body;

        if (!region || !result || !date) {
            return res.status(400).json({ success: false, error: 'region, result, and date are required.' });
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
        A traditional leather quiver filled with bamboo arrows is leaning against the wooden frame of the blackboard. 
        The background is a soft-focus, misty village landscape with tropical greenery. 
        The image has a nostalgic, heritage feel with moody lighting. 4k resolution, hyper-realistic.`;

        console.log(`[ImageGen] Generating for ${location} R${round} - Result: ${result}`);

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${GEMINI_API_KEY}`,
            {
                requests: [{ prompt, aspectRatio: "1:1" }]
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        // Imagen 3 REST API returns `predictions[].bytesBase64Encoded`
        const predictions = response.data.predictions;

        if (predictions && predictions.length > 0 && predictions[0].bytesBase64Encoded) {
            res.json({
                success: true,
                imageBase64: `data:image/png;base64,${predictions[0].bytesBase64Encoded}`
            });
        } else {
            console.error('[ImageGen] Unexpected response structure:', JSON.stringify(response.data));
            throw new Error("No image bytes in response from Imagen 3");
        }

    } catch (error) {
        console.error('Error generating image:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to generate share image. Please try again later.',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

module.exports = router;
