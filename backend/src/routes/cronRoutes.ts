/**
 * Cron Admin Routes
 * 
 * Provides visibility into the automated data ingestion system.
 */

import { Router } from "express";
import { getCronStatus, restartAllCrons } from "../cron/cronScheduler";
import { addScrapeJob } from "../queue/scrapeQueue";
import { getRecentCronLogs } from "../cron/cronLogger";
import prisma from "../prisma";
import { logger } from "../utils/logger";

const router = Router();

/**
 * GET /api/admin/cron/status
 * Returns current state of all registered cron jobs.
 */
router.get("/status", async (req, res) => {
    try {
        const games = await prisma.game.findMany({
            where: { isEnabled: true },
            select: {
                id: true,
                displayName: true,
                lastLiveScrapeStatus: true,
                lastLiveScrapeAt: true
            }
        });

        // Map to what cron/page.tsx expects
        const mappedGames = games.map(g => ({
            id: g.id,
            displayName: g.displayName,
            lastStatus: g.lastLiveScrapeStatus,
            lastRun: g.lastLiveScrapeAt ? g.lastLiveScrapeAt.toISOString() : null
        }));

        res.json({
            success: true,
            data: mappedGames,
        });
    } catch (err: any) {
        logger.error("[CronRoutes] Failed to get status", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/admin/cron/debug-status (Extended status for Real-Time Debug Panel)
router.get("/debug-status", async (req, res) => {
    try {
        const [cronJobs, games] = await Promise.all([
            getCronStatus(),
            prisma.game.findMany({
                where: { isEnabled: true },
                select: {
                    id: true, name: true, displayName: true,
                    lastLiveScrapeAt: true, lastLiveScrapeStatus: true,
                    isLiveScrapingEnabled: true
                }
            })
        ]);
        res.json({
            success: true,
            data: { crons: cronJobs, games },
        });
    } catch (err: any) {
        logger.error("[CronRoutes] Failed to get debug status", err);
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
        const games = await prisma.game.findMany({ where: { isEnabled: true, isLiveScrapingEnabled: true } });
        for (const game of games) {
            await addScrapeJob({ gameId: game.id, gameName: game.name }, 1); // priority 1
        }
        res.json({
            success: true,
            message: "Global results fetch queued in BullMQ",
            data: { queued: games.length }
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
    const { game: gameIdentifier } = req.params;

    try {
        const game = await prisma.game.findFirst({
            where: {
                OR: [
                    { id: gameIdentifier },
                    { name: gameIdentifier }
                ]
            }
        });

        if (!game) {
            return res.status(404).json({
                success: false,
                error: "Game not found"
            });
        }

        await addScrapeJob({ gameId: game.id, gameName: game.name }, 1); // priority 1

        res.json({
            success: true,
            message: `Manual scrape queued for ${game.name}`,
        });
    } catch (err: any) {
        logger.error(`[CronRoutes] Manual trigger failed for ${gameIdentifier}`, err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/admin/cron/restart
 * Force-restart all cron jobs (admin fail-safe).
 */
router.post("/restart", async (req, res) => {
    try {
        await restartAllCrons();
        const status = await getCronStatus();
        res.json({
            success: true,
            message: "All cron jobs restarted successfully",
            data: status,
        });
    } catch (err: any) {
        logger.error("[CronRoutes] Restart failed", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
