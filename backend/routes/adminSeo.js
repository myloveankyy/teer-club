const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/verifyAdmin');
const { triggerGoogleIndex } = require('../services/seoIndexer');

router.post('/index-url', verifyAdmin, async (req, res) => {
    try {
        const { url, type = 'URL_UPDATED' } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, message: 'URL is required' });
        }

        const data = await triggerGoogleIndex(url, type);

        if (data) {
            res.json({ success: true, data, message: `Successfully sent indexing request for ${url}` });
        } else {
            res.status(500).json({
                success: false,
                message: 'Service account key not found. Please add service-account.json to the backend root.'
            });
        }
    } catch (error) {
        console.error('Error submitting URL to Google Indexing API:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit URL for indexing',
            error: error.message
        });
    }
});

module.exports = router;
