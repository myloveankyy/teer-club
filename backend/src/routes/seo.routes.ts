import { Router, Request, Response } from 'express';
import { SitemapService } from '../services/sitemap.service';
import { logger } from '../utils/logger';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

/**
 * POST /api/admin/seo/sitemap/upload
 * Upload a sitemap.xml file (raw XML in request body).
 */
router.post('/sitemap/upload', adminAuth, async (req: Request, res: Response) => {
    try {
        const { xml } = req.body;

        if (!xml || typeof xml !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid "xml" field. Send { "xml": "<xml content>" }'
            });
        }

        if (xml.length > 10 * 1024 * 1024) {
            return res.status(413).json({
                success: false,
                error: 'Sitemap too large. Maximum size is 10 MB.'
            });
        }

        const metadata = await SitemapService.upload(xml);
        res.json({
            success: true,
            message: 'Sitemap uploaded and deployed successfully.',
            data: metadata
        });
    } catch (error: any) {
        logger.error('[SEO Routes] Sitemap upload failed', error);
        res.status(500).json({
            success: false,
            error: error.message,
            logs: error.logs || null
        });
    }
});

/**
 * GET /api/admin/seo/sitemap/status
 * Get the status of the last sitemap upload.
 */
router.get('/sitemap/status', adminAuth, (req: Request, res: Response) => {
    try {
        const status = SitemapService.getStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error: any) {
        logger.error('[SEO Routes] Failed to get status', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
