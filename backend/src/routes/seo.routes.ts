import { Router, Request, Response } from 'express';
import { SitemapService } from '../services/sitemap.service';
import { logger } from '../utils/logger';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

/**
 * POST /api/admin/seo/sitemap/generate
 * Manually trigger sitemap generation.
 */
router.post('/sitemap/generate', adminAuth, async (req: Request, res: Response) => {
    try {
        const metadata = await SitemapService.generate();
        if (!metadata) {
            return res.status(409).json({
                success: false,
                message: 'Sitemap generation is already in progress.'
            });
        }
        res.json({
            success: true,
            message: 'Sitemap generated successfully.',
            data: metadata
        });
    } catch (error: any) {
        logger.error('[SEO Routes] Manual generation failed', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/admin/seo/sitemap/status
 * Get the status of the last sitemap generation.
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
