/**
 * Distributed Cron Scheduler (BullMQ)
 * 
 * Features:
 * - Cluster-Safe: Native Redis deduplication ensures jobs only run ONCE across the entire PM2 cluster.
 * - Master Admin Controls: Master Scraper job checks Admin Panel settings before triggering scrapes.
 * - Night Fallback & Predictions: Runs natively via Redis scheduling.
 */

import { logger } from "../utils/logger";
import { scrapeQueue } from "../queue/scrapeQueue";

let isInitialized = false;

// ─── Lifecycle ───────────────────────────────────────────────────────────────

export async function startAllCrons(): Promise<void> {
    if (isInitialized) {
        logger.info("[CRON] BullMQ Cron engine already initialized. Skipping.");
        return;
    }

    logger.info("[CRON] 🚀 Starting Distributed BullMQ Cron Engine...");

    try {
        // 1. Remove old repeatable jobs to prevent ghost duplicates
        const repeatableJobs = await scrapeQueue.getRepeatableJobs();
        for (const job of repeatableJobs) {
            await scrapeQueue.removeRepeatableByKey(job.key);
        }

        // 2. Register Master Polling Job: Runs every 2 minutes 24/7.
        // The worker logic checks the Admin Master Controls (Start/Stop & Window)
        await scrapeQueue.add("master-poll", {}, {
            repeat: { pattern: "*/2 * * * *" },
            jobId: "master-poll-job",
        });
        logger.info("[CRON] Registered Master Poll (*/2 * * * *)");

        // 3. Register Night Fallback Check (Runs at 9:15 PM IST every day -> 15:45 UTC)
        await scrapeQueue.add("night-fallback", {}, {
            repeat: { pattern: "45 15 * * *" },
            jobId: "night-fallback-job",
        });
        logger.info("[CRON] Registered Night Fallback Check (15:45 UTC)");

        // 4. Register Midnight Prediction Engine (12:00 AM IST -> 18:30 UTC)
        await scrapeQueue.add("daily-prediction", {}, {
            repeat: { pattern: "30 18 * * *" },
            jobId: "daily-prediction-job",
        });
        logger.info("[CRON] Registered Daily Prediction Engine (18:30 UTC)");

        // 5. Register Log Cleanup (Weekly on Sunday)
        await scrapeQueue.add("log-cleanup", {}, {
            repeat: { pattern: "0 0 * * 0" },
            jobId: "log-cleanup-job",
        });
        logger.info("[CRON] Registered Weekly Log Cleanup (0 0 * * 0)");

        // 6. Pre-Result Hype Triggers (Push Notification Arbitrage)
        // Shillong (FR at 3:45 PM IST) -> Push at 3:40 PM IST (10:10 UTC)
        await scrapeQueue.add("pre-result-hype", { gameName: "Shillong", round: "F/R" }, {
            repeat: { pattern: "10 10 * * 1-6" }, // Mon-Sat
            jobId: "hype-shillong-fr"
        });
        
        // Khanapara (FR at 4:10 PM IST) -> Push at 4:05 PM IST (10:35 UTC)
        await scrapeQueue.add("pre-result-hype", { gameName: "Khanapara", round: "F/R" }, {
            repeat: { pattern: "35 10 * * 1-6" }, // Mon-Sat
            jobId: "hype-khanapara-fr"
        });

        // Juwai (FR at 1:30 PM IST) -> Push at 1:25 PM IST (07:55 UTC)
        await scrapeQueue.add("pre-result-hype", { gameName: "Juwai", round: "F/R" }, {
            repeat: { pattern: "55 7 * * 1-6" }, // Mon-Sat
            jobId: "hype-juwai-fr"
        });
        logger.info("[CRON] Registered Pre-Result Hype Triggers");

        isInitialized = true;
        logger.info(`[CRON] ✅ Registered all distributed repeatable jobs. BullMQ engine is LIVE.`);
    } catch (error) {
        logger.error("[CRON] Failed to register BullMQ jobs", error);
    }
}

export function stopAllCrons(): void {
    // In BullMQ, repeatable jobs run via Redis. Stopping the node process stops execution.
    // We don't remove them here because they should persist across restarts.
    isInitialized = false;
    logger.info("[CronScheduler] 🛑 Engine detached.");
}

export async function getCronStatus() {
    const repeatableJobs = await scrapeQueue.getRepeatableJobs();
    return repeatableJobs.map(j => ({
        id: j.key,
        name: j.name,
        pattern: j.pattern,
        nextRun: j.next ? new Date(j.next).toISOString() : null
    }));
}

/**
 * Force restart (Re-register)
 */
export async function restartAllCrons(): Promise<void> {
    logger.info("[CRON] 🔄 Force-restarting (re-registering) all BullMQ cron jobs...");
    isInitialized = false;
    await startAllCrons();
}
