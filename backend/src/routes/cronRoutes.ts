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

/**
 * GET /api/admin/cron/live-status
 * Real-time scraper status per game from Redis (set by BullMQ worker).
 */
router.get("/live-status", async (req, res) => {
    try {
        const games = await prisma.game.findMany({
            where: { isEnabled: true },
            select: { id: true, name: true, displayName: true }
        });

        const { redis } = require("../utils/redis");
        const statuses = [];

        for (const game of games) {
            const raw = await redis.hgetall(`scrape:status:${game.id}`);
            statuses.push({
                gameId: game.id,
                gameName: game.name,
                displayName: game.displayName,
                state: raw.state || "IDLE",
                updatedAt: raw.updatedAt || null,
                fr: raw.fr || null,
                sr: raw.sr || null,
                error: raw.error || null,
                errorCategory: raw.errorCategory || null,
            });
        }

        res.json({ success: true, data: statuses });
    } catch (err: any) {
        logger.error("[CronRoutes] Live status failed", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/admin/cron/health
 * Composite health check: Database + Redis + BullMQ Queue.
 */
router.get("/health", async (req, res) => {
    const health: any = {
        database: { status: "unknown" },
        redis: { status: "unknown" },
        queue: { status: "unknown" },
        timestamp: new Date().toISOString(),
    };

    try {
        // DB health
        await prisma.$queryRaw`SELECT 1`;
        health.database = { status: "connected" };
    } catch (err: any) {
        health.database = { status: "disconnected", error: err.message };
    }

    try {
        // Redis health
        const { redis } = require("../utils/redis");
        await redis.ping();
        health.redis = { status: "connected" };
    } catch (err: any) {
        health.redis = { status: "disconnected", error: err.message };
    }

    try {
        // BullMQ queue health
        const { scrapeQueue } = require("../queue/scrapeQueue");
        const [waiting, active, completed, failed] = await Promise.all([
            scrapeQueue.getWaitingCount(),
            scrapeQueue.getActiveCount(),
            scrapeQueue.getCompletedCount(),
            scrapeQueue.getFailedCount(),
        ]);
        health.queue = { status: "connected", waiting, active, completed, failed };
    } catch (err: any) {
        health.queue = { status: "disconnected", error: err.message };
    }

    const allHealthy = health.database.status === "connected" &&
                       health.redis.status === "connected" &&
                       health.queue.status === "connected";

    res.status(allHealthy ? 200 : 503).json({
        success: allHealthy,
        data: health,
    });
});

/**
 * GET /api/admin/cron/failed-jobs
 * List all failed BullMQ jobs with error details.
 */
router.get("/failed-jobs", async (req, res) => {
    try {
        const { scrapeQueue } = require("../queue/scrapeQueue");
        const failedJobs = await scrapeQueue.getFailed(0, 50);

        const jobs = failedJobs.map((job: any) => ({
            id: job.id,
            name: job.name,
            data: job.data,
            failedReason: job.failedReason,
            attemptsMade: job.attemptsMade,
            timestamp: job.timestamp ? new Date(job.timestamp).toISOString() : null,
            finishedOn: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
        }));

        res.json({ success: true, data: { jobs, total: failedJobs.length } });
    } catch (err: any) {
        logger.error("[CronRoutes] Failed jobs fetch failed", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/admin/cron/retry/:jobId
 * Retry a specific failed BullMQ job.
 */
router.post("/retry/:jobId", async (req, res) => {
    try {
        const { scrapeQueue } = require("../queue/scrapeQueue");
        const job = await scrapeQueue.getJob(req.params.jobId);

        if (!job) {
            return res.status(404).json({ success: false, error: "Job not found" });
        }

        await job.retry();
        res.json({ success: true, message: `Job ${req.params.jobId} retried` });
    } catch (err: any) {
        logger.error(`[CronRoutes] Retry failed for ${req.params.jobId}`, err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/admin/cron/retry-all-failed
 * Retry all failed BullMQ jobs.
 */
router.post("/retry-all-failed", async (req, res) => {
    try {
        const { scrapeQueue } = require("../queue/scrapeQueue");
        const failedJobs = await scrapeQueue.getFailed(0, 100);
        
        let retriedCount = 0;
        for (const job of failedJobs) {
            try {
                await job.retry();
                retriedCount++;
            } catch (e) {
                // Some jobs may not be retryable
            }
        }

        res.json({
            success: true,
            message: `Retried ${retriedCount}/${failedJobs.length} failed jobs`,
            data: { retried: retriedCount, total: failedJobs.length }
        });
    } catch (err: any) {
        logger.error("[CronRoutes] Retry all failed", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/admin/cron/snapshots/:gameId
 * View stored HTML scrape snapshots for debugging.
 */
router.get("/snapshots/:gameId", async (req, res) => {
    try {
        const snapshots = await prisma.scrapeSnapshot.findMany({
            where: { gameId: req.params.gameId },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
                id: true,
                url: true,
                method: true,
                scrapeStatus: true,
                byteSize: true,
                createdAt: true,
                // Don't include rawHtml in list view — too heavy
            }
        });

        res.json({ success: true, data: snapshots });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * GET /api/admin/cron/snapshots/:gameId/:snapshotId
 * View a specific HTML snapshot (raw HTML for debugging).
 */
router.get("/snapshots/:gameId/:snapshotId", async (req, res) => {
    try {
        const snapshot = await prisma.scrapeSnapshot.findUnique({
            where: { id: req.params.snapshotId },
        });

        if (!snapshot || snapshot.gameId !== req.params.gameId) {
            return res.status(404).json({ success: false, error: "Snapshot not found" });
        }

        res.json({ success: true, data: snapshot });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;

