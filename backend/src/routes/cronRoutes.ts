/**
 * Cron Admin Routes
 * 
 * Provides visibility into the automated data ingestion system.
 */

import { Router } from "express";
import { getCronStatus, triggerManualScrape, triggerAllLiveScrapes } from "../cron/cronScheduler";
import { getRecentCronLogs } from "../cron/cronLogger";
import { logger } from "../utils/logger";

const router = Router();

/**
 * GET /api/admin/cron/status
 * Returns current state of all registered cron jobs.
 */
router.get("/status", (req, res) => {
    try {
        const status = getCronStatus();
        res.json({
            success: true,
            data: status,
        });
    } catch (err: any) {
        logger.error("[CronRoutes] Failed to get status", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/admin/cron/logs
 * Returns paginated execution logs.
 */
router.get("/logs", async (req, res) => {
    try {
        const { game, status, page = "1", limit = "50" } = req.query;

        const take = Math.min(parseInt(limit as string) || 50, 100);
        const skip = (Math.max(parseInt(page as string) || 1, 1) - 1) * take;

        const result = await getRecentCronLogs({
            game: game as string,
            status: status as string,
            limit: take,
            offset: skip,
        });

        res.json({
            success: true,
            data: {
                logs: result.logs,
                pagination: {
                    total: result.total,
                    page: parseInt(page as string),
                    limit: take,
                    totalPages: Math.ceil(result.total / take),
                },
            },
        });
    } catch (err: any) {
        logger.error("[CronRoutes] Failed to get logs", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/admin/cron/trigger-all
 * Manually triggers a live scrape for all enabled games.
 */
router.post("/trigger-all", async (req, res) => {
    try {
        const result = await triggerAllLiveScrapes();
        res.json({
            success: true,
            message: "Global results fetch triggered",
            data: result
        });
    } catch (err: any) {
        logger.error("[CronRoutes] Global trigger failed", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/admin/cron/trigger/:game
 * Manually triggers a scrape for a specific game (supports ID or Name).
 */
router.post("/trigger/:game", async (req, res) => {
    const { game } = req.params;

    try {
        const result = await triggerManualScrape(game);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }

        res.json({
            success: true,
            message: `Manual scrape success for ${game}`,
            data: result.result,
        });
    } catch (err: any) {
        logger.error(`[CronRoutes] Manual trigger failed for ${game}`, err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
