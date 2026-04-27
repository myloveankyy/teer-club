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

    state.isRunning = true;
    state.lastRun = new Date();

    try {
        const game = await prisma.game.findUnique({ where: { id: gameId } });
        if (!game || !game.isLiveScrapingEnabled || !game.isEnabled) {
            logger.info(`[CronScheduler] Disabling cron for ${state.gameName} (disabled in DB)`);
            state.activeTask?.stop();
            return;
        }

        const result = await scrapeLiveResult(game);

        // Update Game health in DB
        await prisma.game.update({
            where: { id: gameId },
            data: {
                lastLiveScrapeAt: state.lastRun,
                lastLiveScrapeStatus: result.status
            }
        });

        if (result.status === "SUCCESS" && result.date && (result.round1 || result.round2)) {
            const upsert = await smartUpsertResults(gameId, [{
                date: result.date,
                round1: result.round1,
                round2: result.round2,
                round3: result.round3,
                sourceMethod: "CRON_LIVE"
            }]);

            if (upsert.created || upsert.updated) {
                if (result.date) {
                    await evaluateMatchProofs(gameId, new Date(result.date), result.round1 || "", result.round2 || "");
                }
                await writeCronLog({
                    game: game.name,
                    status: "SUCCESS",
                    round1: result.round1,
                    round2: result.round2,
                    resultDate: result.date,
                    duration: result.duration,
                    details: { upsert }
                });
            } else {
                state.lastStatus = "NO_NEW_DATA";
            }
        } else if (result.status === "FAILED") {
            state.errorCount++;
            await writeCronLog({
                game: game.name,
                status: "FAILED",
                duration: result.duration,
                error: result.error,
                details: result.details
            });
        }

        state.lastStatus = result.status;
    } catch (err: any) {
        logger.error(`[CronScheduler] Error ticking ${state.gameName}`, err);
        state.lastStatus = "FAILED";
    } finally {
        state.isRunning = false;
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
    if (isInitialized) return;

    logger.info("[CronScheduler] 🚀 Starting Dynamic Cron Engine...");

    const games = await prisma.game.findMany({ where: { isEnabled: true, isLiveScrapingEnabled: true } });

    for (const game of games) {
        const jobKey = game.id;

        // Every 2 mins, but we'll use an internal IST window check to save resources
        const task = cron.schedule("*/2 * * * *", async () => {
            if (!game.isLiveScrapingEnabled) return;

            const { totalMinutes: now } = getISTNow();

            // Calculate active window from game times
            // Default window: 1:00 PM (780m) to 9:00 PM (1260m)
            const [frH, frM] = (game.frTime || "15:00").split(':').map(Number);
            const frTime = frH * 60 + frM;
            const startWindow = frTime - 30; // 30m before FR
            const endWindow = frTime + 300;  // 5h after FR (covers SR and TR)

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
    // 9:15 PM IST = 15:45 UTC
    cron.schedule("45 15 * * *", async () => {
        logger.info("[CronScheduler] Running night fallback check...");
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
                logger.info(`[CronScheduler] Marked ${game.name} as OFF for ${todayIST}`);
            }
        }
    }, { timezone: "UTC" });

    // ── Daily Prediction Engine: Runs at 12:00 AM IST ──
    // 12:00 AM IST = 18:30 UTC previous day, so it will trigger correctly at midnight IST.
    cron.schedule("30 18 * * *", async () => {
        logger.info("[CronScheduler] Running midnight prediction engine...");
        import("../services/predictionService").then(m => m.generateDailyPredictions());
    }, { timezone: "UTC" });

    // ── Log Cleanup: Weekly on Sunday ──
    cron.schedule("0 0 * * 0", async () => {
        await cleanupOldLogs(14); // Keep 14 days
    });

    isInitialized = true;
    logger.info(`[CronScheduler] ✅ Registered ${cronJobs.size} active polling jobs.`);
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
        isRunning: j.isRunning
    }));
}
