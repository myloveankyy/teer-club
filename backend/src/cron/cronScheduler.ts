/**
 * Dynamic Cron Scheduler — Production-Grade Result Polling
 * 
 * Features:
 * - Fully Database Driven: Automatically schedules jobs for all enabled games.
 * - Health Monitoring: Tracks last run, status, and duration for each job.
 * - Adaptive Polling: Focuses resources during expected result windows.
 * - Fault Tolerant: Individual job failures don't affect other games.
 * - Fallback Protection: Automatically marks missing results as "OFF" after 9 PM IST.
 */

import cron from "node-cron";
import prisma from "../prisma";
import { logger } from "../utils/logger";
import { getISTNow } from "../config/gameSchedule";
import { scrapeLiveResult } from "../scrapers/liveScraper";
import { smartUpsertResults } from "../services/smartUpsert";
import { writeCronLog, cleanupOldLogs } from "./cronLogger";
import { evaluateMatchProofs } from "../services/predictionService";
import { addScrapeJob } from "../queue/scrapeQueue";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CronJobState {
    gameId: string;
    gameName: string;
    displayName: string;
    description: string;
    activeTask: cron.ScheduledTask | null;
    lastRun: Date | null;
    lastStatus: string | null;
    isRunning: boolean;
    errorCount: number;
}

// ─── State ───────────────────────────────────────────────────────────────────

const cronJobs: Map<string, CronJobState> = new Map();
let isInitialized = false;

// ─── Tick Handler ────────────────────────────────────────────────────────────

async function handleGameTick(gameId: string): Promise<void> {
    const state = cronJobs.get(gameId);
    if (!state || state.isRunning) return;

    try {
        const game = await prisma.game.findUnique({ where: { id: gameId } });
        if (!game || !game.isLiveScrapingEnabled || !game.isEnabled) {
            logger.info(`[CRON] Disabling cron for ${state.gameName} (disabled in DB)`);
            state.activeTask?.stop();
            return;
        }

        logger.info(`[CRON] Tick started: ${state.gameName}. Pushing to BullMQ...`);
        
        // Push the scrape job to the background worker queue
        await addScrapeJob({
            gameId: game.id,
            gameName: game.name,
        });

        // Optimistically update lastRun
        state.lastRun = new Date();
        state.lastStatus = "QUEUED";
    } catch (err: any) {
        logger.error(`[CRON] Error queuing ${state.gameName}: ${err.message}`);
        state.lastStatus = "QUEUE_FAILED";
        state.errorCount++;
    }
}

// ─── Manual Trigger ──────────────────────────────────────────────────────────

export async function triggerManualScrape(gameIdentifier: string): Promise<{ success: boolean; error?: string; result?: any }> {
    const game = await prisma.game.findFirst({
        where: {
            OR: [
                { id: gameIdentifier },
                { name: gameIdentifier }
            ]
        }
    });

    if (!game) return { success: false, error: "Game not found" };

    const result = await scrapeLiveResult(game);

    if (result.success && (result.round1 || result.round2)) {
        await smartUpsertResults(game.id, [{
            date: result.date!,
            round1: result.round1,
            round2: result.round2,
            round3: result.round3,
            sourceMethod: "MANUAL_LIVE"
        }]);
    }

    // Log the manual attempt
    await writeCronLog({
        game: game.name,
        status: result.status,
        round1: result.round1,
        round2: result.round2,
        resultDate: result.date,
        duration: result.duration,
        details: { trigger: "MANUAL", ...result.details }
    });

    return { success: true, result };
}

export async function triggerAllLiveScrapes() {
    const games = await prisma.game.findMany({ where: { isEnabled: true, isLiveScrapingEnabled: true } });
    const results = await Promise.all(games.map(game => handleGameTick(game.id)));
    return { results };
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────

export async function startAllCrons(): Promise<void> {
    if (isInitialized) {
        logger.info("[CRON] Cron engine already initialized. Skipping.");
        return;
    }

    logger.info("[CRON] 🚀 Starting Dynamic Cron Engine...");

    const games = await prisma.game.findMany({ where: { isEnabled: true, isLiveScrapingEnabled: true } });

    for (const game of games) {
        const jobKey = game.id;

        // Calculate time window for logging
        const [frH, frM] = (game.frTime || "15:00").split(':').map(Number);
        const frTime = frH * 60 + frM;
        const startWindow = frTime - 30;
        const endWindow = frTime + 300;
        const startH = Math.floor(startWindow / 60);
        const startM = startWindow % 60;
        const endH = Math.floor(endWindow / 60);
        const endM = endWindow % 60;

        logger.info(`[CRON] Registering: ${game.displayName} | Window: ${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')} IST | Poll: every 2min`);

        // Every 2 mins, with IST window check
        const task = cron.schedule("*/2 * * * *", async () => {
            if (!game.isLiveScrapingEnabled) return;

            const { totalMinutes: now } = getISTNow();

            if (now >= startWindow && now <= endWindow) {
                await handleGameTick(game.id);
            }
        });

        cronJobs.set(jobKey, {
            gameId: game.id,
            gameName: game.name,
            displayName: game.displayName,
            description: `Live polling for ${game.displayName}`,
            activeTask: task,
            lastRun: null,
            lastStatus: null,
            isRunning: false,
            errorCount: 0
        });
    }

    // ── Fallback "OFF" Job: Runs at 9:15 PM IST every day ──
    cron.schedule("45 15 * * *", async () => {
        logger.info("[CRON] Running night fallback check...");
        const { dateStr: todayIST } = getISTNow();
        const dateObj = new Date(todayIST + "T00:00:00Z");

        const games = await prisma.game.findMany({ where: { isEnabled: true } });
        for (const game of games) {
            const result = await prisma.result.findUnique({
                where: { gameId_date: { gameId: game.id, date: dateObj } }
            });

            if (!result || (!result.round1 && !result.round2)) {
                await prisma.result.upsert({
                    where: { gameId_date: { gameId: game.id, date: dateObj } },
                    update: { round1: "OFF", round2: "OFF", confidence: "HIGH" },
                    create: { gameId: game.id, date: dateObj, round1: "OFF", round2: "OFF", confidence: "HIGH" }
                });
                logger.info(`[CRON] Marked ${game.name} as OFF for ${todayIST}`);
            }
        }
    }, { timezone: "UTC" });

    // ── Daily Prediction Engine: 12:00 AM IST = 18:30 UTC ──
    cron.schedule("30 18 * * *", async () => {
        logger.info("[CRON] Running midnight prediction engine...");
        import("../services/predictionService").then(m => m.generateDailyPredictions());
    }, { timezone: "UTC" });

    // ── Log Cleanup: Weekly on Sunday ──
    cron.schedule("0 0 * * 0", async () => {
        await cleanupOldLogs(14);
    });

    // ── Stall Recovery Heartbeat: Every 30 min, check if crons are healthy ──
    cron.schedule("*/30 * * * *", async () => {
        const { totalMinutes: now } = getISTNow();
        // Only check during active hours (10 AM to 10 PM IST)
        if (now < 600 || now > 1320) return;

        const stalled = Array.from(cronJobs.values()).filter(j => {
            if (!j.lastRun) return false;
            const minutesSinceRun = (Date.now() - j.lastRun.getTime()) / 60000;
            return minutesSinceRun > 15 && j.errorCount > 5;
        });

        if (stalled.length > 0) {
            logger.warn(`[CRON] Stall detected for ${stalled.length} games. Resetting error counts.`);
            stalled.forEach(j => { j.errorCount = 0; });
        }
    });

    isInitialized = true;
    logger.info(`[CRON] ✅ Registered ${cronJobs.size} active polling jobs. Cron engine is LIVE.`);
}

export function stopAllCrons(): void {
    cronJobs.forEach(job => job.activeTask?.stop());
    cronJobs.clear();
    isInitialized = false;
    logger.info("[CronScheduler] 🛑 All crons stopped.");
}

export function getCronStatus() {
    return Array.from(cronJobs.values()).map(j => ({
        id: j.gameId,
        game: j.gameName,
        displayName: j.displayName,
        lastRun: j.lastRun,
        lastStatus: j.lastStatus,
        isRunning: j.isRunning,
        errorCount: j.errorCount,
        isInitialized,
    }));
}

/**
 * Force restart all cron jobs (admin fail-safe).
 */
export async function restartAllCrons(): Promise<void> {
    logger.info("[CRON] 🔄 Force-restarting all cron jobs...");
    stopAllCrons();
    await startAllCrons();
}
