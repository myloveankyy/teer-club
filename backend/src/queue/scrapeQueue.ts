import { Queue, Worker, Job } from "bullmq";
import { redis } from "../utils/redis";
import { logger } from "../utils/logger";
import { scrapeLiveResult } from "../scrapers/liveScraper";
import { smartUpsertResults } from "../services/smartUpsert";
import { writeCronLog } from "../cron/cronLogger";
import { evaluateMatchProofs } from "../services/predictionService";
import prisma from "../prisma";

export const scrapeQueue = new Queue("scrape-queue", { connection: redis });

export interface ScrapeJobData {
  gameId: string;
  gameName: string;
  targetDate?: string;
}

export async function addScrapeJob(data: ScrapeJobData, priority: number = 10) {
  logger.info(`[Queue] Adding scrape job for ${data.gameName}`);
  return scrapeQueue.add(`scrape-${data.gameId}`, data, {
    priority,
    removeOnComplete: true,
    removeOnFail: false,
    attempts: 2,
    backoff: { type: "exponential", delay: 2000 }
  });
}

// ─── Worker Initialization ───────────────────────────────────────────────────
export function startScrapeWorker() {
  logger.info("[Worker] 🚀 Starting BullMQ Scrape Worker...");

  const worker = new Worker("scrape-queue", async (job: Job<any>) => {
    const tickStart = Date.now();

    if (job.name === "master-poll") {
      logger.info("[Worker] Executing Master Poll check...");
      const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
      if (!settings) return;

      const { getISTNow } = require("../config/gameSchedule");
      const { totalMinutes: nowMinutes, dateStr: todayIST } = getISTNow();
      
      let shouldScrape = false;
      if (settings.isMasterScrapeActive) {
        shouldScrape = true;
      } else if (settings.masterScrapeStartTime && settings.masterScrapeEndTime) {
        const [startH, startM] = settings.masterScrapeStartTime.split(':').map(Number);
        const [endH, endM] = settings.masterScrapeEndTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
          shouldScrape = true;
        }
      }

      if (!shouldScrape) {
        logger.debug("[Worker] Outside Master Scrape window, skipping.");
        return { skipped: true, reason: "outside_window" };
      }

      logger.info("[Worker] Master Scrape is ACTIVE. Queuing enabled games...");
      const games = await prisma.game.findMany({ where: { isEnabled: true, isLiveScrapingEnabled: true } });
      for (const game of games) {
        await addScrapeJob({ gameId: game.id, gameName: game.name });
      }
      return { status: "queued", count: games.length };
    }

    if (job.name === "night-fallback") {
      logger.info("[Worker] Running night fallback check...");
      const { getISTNow } = require("../config/gameSchedule");
      const { dateStr: todayIST } = getISTNow();
      const dateObj = new Date(todayIST + "T00:00:00Z");

      const games = await prisma.game.findMany({ where: { isEnabled: true } });
      let markedCount = 0;
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
          logger.info(`[Worker] Marked ${game.name} as OFF for ${todayIST}`);
          markedCount++;
        }
      }
      return { status: "success", markedCount };
    }

    if (job.name === "daily-prediction") {
      logger.info("[Worker] Running midnight prediction engine...");
      const { generateDailyPredictions } = require("../services/predictionService");
      await generateDailyPredictions();
      return { status: "success" };
    }

    if (job.name === "log-cleanup") {
      logger.info("[Worker] Running weekly log cleanup...");
      const { cleanupOldLogs } = require("../cron/cronLogger");
      await cleanupOldLogs(14);
      return { status: "success" };
    }

    if (job.name === "pre-result-hype") {
      const { gameName, round } = job.data;
      logger.info(`[Worker] Running Pre-Result Hype for ${gameName}...`);
      const { sendBroadcastPush } = require("../services/pushService");
      
      await sendBroadcastPush(
        `${gameName} Teer Incoming! ⏳`,
        `Results will be announced in 5 minutes! Open the app now to watch live.`,
        `/results/${gameName.toLowerCase()}/live`
      );
      return { status: "success" };
    }

    // Default Scrape Job handling
    const { gameId, gameName, targetDate } = job.data as ScrapeJobData;
    if (!gameId) {
       logger.warn(`[Worker] Unknown job name: ${job.name}`);
       return;
    }

    logger.info(`[Worker] Processing scrape job for ${gameName}`);

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || !game.isLiveScrapingEnabled || !game.isEnabled) {
      logger.info(`[Worker] Skipping ${gameName} (disabled in DB)`);
      return { skipped: true };
    }

    try {
      const result = await scrapeLiveResult(game, targetDate);
      const tickDuration = Date.now() - tickStart;

      // Update Game health in DB
      await prisma.game.update({
        where: { id: gameId },
        data: {
          lastLiveScrapeAt: new Date(),
          lastLiveScrapeStatus: result.status
        }
      });

      if (result.status === "SUCCESS" && result.date && (result.round1 || result.round2)) {
        // Fetch existing result before upserting to know if this is actually NEW data
        const dateObj = new Date(result.date);
        const existing = await prisma.result.findUnique({
          where: { gameId_date: { gameId, date: dateObj } }
        });

        const isRound1New = result.round1 && result.round1 !== "XX" && (!existing?.round1 || existing.round1 === "XX");
        const isRound2New = result.round2 && result.round2 !== "XX" && (!existing?.round2 || existing.round2 === "XX");

        const upsert = await smartUpsertResults(gameId, [{
          date: result.date,
          round1: result.round1,
          round2: result.round2,
          round3: result.round3,
          sourceMethod: "CRON_LIVE"
        }]);

        if (upsert.created || upsert.updated) {
          await evaluateMatchProofs(gameId, new Date(result.date), result.round1 || "", result.round2 || "");
          
          // 🔥 Push Notification Arbitrage: Instant Result Out Triggers 🔥
          if (isRound1New || isRound2New) {
            const { sendBroadcastPush } = require("../services/pushService");
            const roundText = isRound2New 
                ? `F/R: ${result.round1 || existing?.round1 || 'XX'} | S/R: ${result.round2}`
                : `F/R: ${result.round1} | S/R: XX`;
            
            await sendBroadcastPush(
              `${gameName} Teer is OUT! 🎯`,
              `${roundText}. Tap here to view the live result!`,
              `/results/${gameName.toLowerCase()}/live`
            );
            logger.info(`[Push Trigger] Sent instant push for ${gameName}: ${roundText}`);
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
          logger.info(`[Worker] Completed: ${gameName} | SUCCESS | FR: ${result.round1} | SR: ${result.round2} | ${tickDuration}ms`);
        } else {
          logger.debug(`[Worker] Completed: ${gameName} | NO_NEW_DATA | ${tickDuration}ms`);
        }
      } else if (result.status === "FAILED") {
        await writeCronLog({
          game: game.name,
          status: "FAILED",
          duration: result.duration,
          error: result.error,
          details: result.details
        });
        logger.warn(`[Worker] Completed: ${gameName} | FAILED | ${result.error} | ${tickDuration}ms`);
        throw new Error(result.error); // Trigger retry
      }

      return { status: result.status, duration: tickDuration };
    } catch (error: any) {
      logger.error(`[Worker] Error processing ${gameName}: ${error.message}`);
      throw error;
    }
  }, { 
    connection: redis, 
    concurrency: 1 // STRICT CONCURRENCY = 1 to prevent OOM
  });

  worker.on("completed", (job) => {
    logger.info(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
  });

  return worker;
}
