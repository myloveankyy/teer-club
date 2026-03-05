const express = require('express');
const router = express.Router();
const { generateAndSaveTeerImage } = require('../services/imageService');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

router.post('/generate-share-image', async (req, res) => {
    try {
        const { region, round, result, date } = req.body;

        if (!region || !result || !date) {
            return res.status(400).json({ success: false, error: 'region, result, and date are required.' });
        }

        const imageUrl = await generateAndSaveTeerImage(region, round, result, date);

        if (imageUrl) {
            res.json({
                success: true,
                imageBase64: imageUrl // We keep the key name for frontend compatibility, but it's a URL now
            });
        } else {
            throw new Error("Failed to generate or retrieve image");
        }

    } catch (error) {
        console.error('Error generating image:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to generate share image. Please try again later.',
            details: error.message
        });
    }
});

module.exports = router;
