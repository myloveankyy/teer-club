import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { logger } from "../utils/logger";
import { scrapeLiveResult } from "../scrapers/liveScraper";
import { smartUpsertResults } from "../services/smartUpsert";
import { writeCronLog } from "../cron/cronLogger";
import { evaluateMatchProofs } from "../services/predictionService";
import prisma from "../prisma";

// Redis connection
const redisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

const connection = new Redis(redisOptions);

export const scrapeQueue = new Queue("scrape-queue", { connection });

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

  const worker = new Worker("scrape-queue", async (job: Job<ScrapeJobData>) => {
    const { gameId, gameName, targetDate } = job.data;
    const tickStart = Date.now();

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
        const upsert = await smartUpsertResults(gameId, [{
          date: result.date,
          round1: result.round1,
          round2: result.round2,
          round3: result.round3,
          sourceMethod: "CRON_LIVE"
        }]);

        if (upsert.created || upsert.updated) {
          await evaluateMatchProofs(gameId, new Date(result.date), result.round1 || "", result.round2 || "");
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
    connection, 
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
