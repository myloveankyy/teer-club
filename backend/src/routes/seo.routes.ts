import { Router, Request, Response } from 'express';
import { SitemapService } from '../services/sitemap.service';
import { SeoService } from '../services/seo.service';
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

/**
 * POST /api/admin/seo/sitemap/generate
 * Auto-generate sitemap from database (dreams, numbers, games, static pages).
 */
router.post('/sitemap/generate', adminAuth, async (req: Request, res: Response) => {
    try {
        const prisma = (await import('../prisma')).default;
        const metadata = await SitemapService.generate(prisma);
        res.json({
            success: true,
            message: `Sitemap auto-generated with ${metadata.totalUrls} URLs.`,
            data: metadata
        });
    } catch (error: any) {
        logger.error('[SEO Routes] Sitemap generation failed', error);
        res.status(500).json({
            success: false,
            error: error.message,
            logs: error.logs || null
        });
    }
});

/**
 * POST /api/admin/seo/auto-fix
 * One-click auto optimize SEO metadata.
 */
router.post('/auto-fix', adminAuth, async (req: Request, res: Response) => {
    try {
        const { pageId } = req.body;
        if (!pageId) {
            return res.status(400).json({ success: false, error: 'Missing pageId' });
        }
        const result = await SeoService.autoFixPage(pageId);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/admin/seo/page/:id
 * Manual override for SEO metadata and image control.
 */
router.put('/page/:id', adminAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await SeoService.updatePageManual(id, req.body);
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
