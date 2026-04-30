import { Router, Request, Response } from 'express';
import { ValidationService } from '../services/validation.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/admin/validation/check
 * Trigger the Auto-Check validation engine for today's results.
 */
router.post('/check', async (req: Request, res: Response) => {
    try {
        const reports = await ValidationService.validateTodayResults();
        return res.json({ success: true, data: reports });
    } catch (error: any) {
        logger.error('[Validation Routes] Failed to run auto-check', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/admin/validation/logs
 * Retrieve history of all auto-check interactions.
 */
router.get('/logs', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const data = await ValidationService.getLogs(page, limit);
        return res.json({ success: true, data });
    } catch (error: any) {
        logger.error('[Validation Routes] Failed to fetch logs', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
