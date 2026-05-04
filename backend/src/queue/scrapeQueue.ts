import { Queue, Worker, Job } from "bullmq";
import { redis } from "../utils/redis";
import { logger } from "../utils/logger";
import { scrapeLiveResult } from "../scrapers/liveScraper";
import { smartUpsertResults } from "../services/smartUpsert";
import { writeCronLog } from "../cron/cronLogger";
import { evaluateMatchProofs } from "../services/predictionService";
import { isNonWorkingDay } from "../config/holidays";
import { getISTNow, getScheduleByGame, parseTime } from "../config/gameSchedule";
import prisma from "../prisma";

const CACHE_KEY_TODAY = "cache:today";

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

// ─── Error Categorization ────────────────────────────────────────────────────
function categorizeError(error: string | undefined): string {
  if (!error) return "UNKNOWN";
  const e = error.toLowerCase();
  if (e.includes("econnreset") || e.includes("econnrefused") || e.includes("enotfound") || e.includes("network")) return "NETWORK";
  if (e.includes("timeout") || e.includes("etimedout") || e.includes("time")) return "TIMEOUT";
  if (e.includes("429") || e.includes("rate") || e.includes("too many")) return "RATE_LIMIT";
  if (e.includes("empty html") || e.includes("no html") || e.includes("empty response")) return "EMPTY_RESPONSE";
  if (e.includes("selector") || e.includes("not found") || e.includes("element")) return "SELECTOR";
  if (e.includes("parse") || e.includes("extract") || e.includes("no results")) return "PARSE_ERROR";
  return "UNKNOWN";
}

// ─── HTML Snapshot Storage ───────────────────────────────────────────────────
async function storeSnapshot(gameId: string, url: string, html: string, method: string, status: string) {
  try {
    const truncatedHtml = html.substring(0, 100_000);
    await prisma.scrapeSnapshot.create({
      data: {
        gameId,
        url,
        rawHtml: truncatedHtml,
        method,
        scrapeStatus: status,
        byteSize: html.length,
      }
    });
    // Cleanup: keep only last 20 snapshots per game
    const oldSnapshots = await prisma.scrapeSnapshot.findMany({
      where: { gameId },
      orderBy: { createdAt: "desc" },
      skip: 20,
      select: { id: true },
    });
    if (oldSnapshots.length > 0) {
      await prisma.scrapeSnapshot.deleteMany({
        where: { id: { in: oldSnapshots.map(s => s.id) } }
      });
    }
  } catch (err: any) {
    logger.error(`[Snapshot] Failed to store snapshot: ${err.message}`);
  }
}

// ─── Schedule-Aware Game Filtering ───────────────────────────────────────────
function shouldScrapeGame(gameName: string, nowMinutes: number, dateStr: string): { should: boolean; reason: string } {
  if (isNonWorkingDay(dateStr)) {
    return { should: false, reason: "non_working_day" };
  }

  const schedule = getScheduleByGame(gameName);
  if (!schedule) {
    return { should: true, reason: "no_schedule_defined" };
  }

  const frMinutes = parseTime(schedule.frResultTime);
  const srMinutes = parseTime(schedule.srResultTime);
  const trMinutes = schedule.trResultTime ? parseTime(schedule.trResultTime) : srMinutes;
  
  const monitorStart = frMinutes - schedule.monitorStartOffset;
  const monitorEnd = Math.max(srMinutes, trMinutes) + schedule.timeoutMinutes;

  if (nowMinutes < monitorStart) {
    return { should: false, reason: `too_early (starts at ${schedule.frResultTime} - ${schedule.monitorStartOffset}min)` };
  }
  if (nowMinutes > monitorEnd) {
    return { should: false, reason: `past_window (ended ${schedule.timeoutMinutes}min after SR)` };
  }

  return { should: true, reason: "within_monitor_window" };
}

// ─── Emit status for admin panel ─────────────────────────────────────────────
async function emitScrapeStatus(gameId: string, state: string, details?: any) {
  try {
    await redis.hset(`scrape:status:${gameId}`, {
      state,
      updatedAt: new Date().toISOString(),
      ...(details || {}),
    });
    await redis.expire(`scrape:status:${gameId}`, 86400);
  } catch (e) {
    // Non-critical
  }
}

// ─── Worker Initialization ───────────────────────────────────────────────────
export function startScrapeWorker() {
  logger.info("[Worker] 🚀 Starting BullMQ Scrape Worker...");

  const worker = new Worker("scrape-queue", async (job: Job<any>) => {
    const tickStart = Date.now();

    // ── Master Poll ──────────────────────────────────────────────────────
    if (job.name === "master-poll") {
      logger.info("[Worker] Executing Schedule-Aware Master Poll...");
      const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
      if (!settings) return;

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

      logger.info("[Worker] Master Scrape is ACTIVE. Filtering games by schedule...");
      const games = await prisma.game.findMany({ where: { isEnabled: true, isLiveScrapingEnabled: true } });
      
      let queuedCount = 0;
      let skippedCount = 0;

      for (const game of games) {
        const gameLower = game.name.toLowerCase();
        const scheduleCheck = shouldScrapeGame(gameLower, nowMinutes, todayIST);
        
        if (scheduleCheck.should) {
          // Skip games that already have complete results for today
          const todayDateObj = new Date(todayIST + "T00:00:00Z");
          const existingResult = await prisma.result.findUnique({
            where: { gameId_date: { gameId: game.id, date: todayDateObj } }
          });

          const hasFR = existingResult?.round1 && existingResult.round1 !== "XX" && existingResult.round1 !== "OFF";
          const hasSR = existingResult?.round2 && existingResult.round2 !== "XX" && existingResult.round2 !== "OFF";
          const hasTR = !game.hasRound3 || (existingResult?.round3 && existingResult.round3 !== "XX");

          if (hasFR && hasSR && hasTR) {
            logger.debug(`[Worker] Skipping ${game.name} — already complete (FR:${existingResult?.round1} SR:${existingResult?.round2})`);
            await emitScrapeStatus(game.id, "COMPLETE", { fr: existingResult?.round1, sr: existingResult?.round2 });
            skippedCount++;
            continue;
          }

          await addScrapeJob({ gameId: game.id, gameName: game.name });
          await emitScrapeStatus(game.id, "QUEUED");
          queuedCount++;
        } else {
          logger.debug(`[Worker] Skipping ${game.name}: ${scheduleCheck.reason}`);
          skippedCount++;
        }
      }

      logger.info(`[Worker] Master Poll: Queued ${queuedCount}, Skipped ${skippedCount} (schedule-aware)`);
      return { status: "queued", queued: queuedCount, skipped: skippedCount };
    }

    // ── Night Fallback ───────────────────────────────────────────────────
    if (job.name === "night-fallback") {
      logger.info("[Worker] Running night fallback check...");
      const { dateStr: todayIST } = getISTNow();
      const dateObj = new Date(todayIST + "T00:00:00Z");

      if (!isNonWorkingDay(todayIST)) {
        // Working day: retry games with partial results (FR exists, SR missing)
        const games = await prisma.game.findMany({ where: { isEnabled: true } });
        let partialCount = 0;
        for (const game of games) {
          const result = await prisma.result.findUnique({
            where: { gameId_date: { gameId: game.id, date: dateObj } }
          });
          const hasFR = result?.round1 && result.round1 !== "XX" && result.round1 !== "OFF";
          const hasSR = result?.round2 && result.round2 !== "XX" && result.round2 !== "OFF";
          
          if (hasFR && !hasSR) {
            await addScrapeJob({ gameId: game.id, gameName: game.name }, 5);
            partialCount++;
            logger.info(`[Worker] Night fallback: ${game.name} partial (FR:${result?.round1}, SR missing). Final scrape queued.`);
          }
        }
        return { status: "partial_retry", count: partialCount };
      }

      // Non-working day: mark all games without real data as OFF
      const games = await prisma.game.findMany({ where: { isEnabled: true } });
      let markedCount = 0;
      for (const game of games) {
        const result = await prisma.result.findUnique({
          where: { gameId_date: { gameId: game.id, date: dateObj } }
        });
        const hasRealData = result && (result.round1 && result.round1 !== "XX" && result.round1 !== "OFF");
        if (!hasRealData) {
          await prisma.result.upsert({
            where: { gameId_date: { gameId: game.id, date: dateObj } },
            update: { round1: "OFF", round2: "OFF", confidence: "HIGH" },
            create: { gameId: game.id, date: dateObj, round1: "OFF", round2: "OFF", confidence: "HIGH" }
          });
          logger.info(`[Worker] Marked ${game.name} as OFF for ${todayIST}`);
          markedCount++;
        }
      }
      await redis.del(CACHE_KEY_TODAY);
      return { status: "success", markedCount };
    }

    // ── Prediction Engine ────────────────────────────────────────────────
    if (job.name === "daily-prediction") {
      logger.info("[Worker] Running midnight prediction engine...");
      const { generateDailyPredictions } = require("../services/predictionService");
      await generateDailyPredictions();
      return { status: "success" };
    }

    // ── Log Cleanup ──────────────────────────────────────────────────────
    if (job.name === "log-cleanup") {
      logger.info("[Worker] Running weekly log cleanup...");
      const { cleanupOldLogs } = require("../cron/cronLogger");
      await cleanupOldLogs(14);
      
      // Also cleanup old snapshots (keep last 7 days)
      try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        const { count } = await prisma.scrapeSnapshot.deleteMany({
          where: { createdAt: { lt: cutoff } }
        });
        if (count > 0) logger.info(`[Worker] Cleaned up ${count} old scrape snapshots`);
      } catch (e) {}
      
      return { status: "success" };
    }

    // ── Pre-Result Hype Push ─────────────────────────────────────────────
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

    // ── SEO Crawl ────────────────────────────────────────────────────────
    if (job.name === "seo-nightly-crawl") {
      logger.info("[Worker] Running Nightly SEO Crawl...");
      const { InternalCrawler } = require("../services/internalCrawler");
      const result = await InternalCrawler.crawlAll();
      return { status: "success", result };
    }

    // ── Default: Scrape Job ──────────────────────────────────────────────
    const { gameId, gameName, targetDate } = job.data as ScrapeJobData;
    if (!gameId) {
       logger.warn(`[Worker] Unknown job name: ${job.name}`);
       return;
    }

    logger.info(`[Worker] Processing scrape job for ${gameName}`);
    await emitScrapeStatus(gameId, "SCRAPING_IN_PROGRESS");

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || !game.isLiveScrapingEnabled || !game.isEnabled) {
      logger.info(`[Worker] Skipping ${gameName} (disabled in DB)`);
      await emitScrapeStatus(gameId, "DISABLED");
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
          await redis.del(CACHE_KEY_TODAY);

          // Evaluate match proofs with composite FR+SR
          const finalFR = result.round1 || existing?.round1 || "";
          const finalSR = result.round2 || existing?.round2 || "";
          await evaluateMatchProofs(gameId, dateObj, finalFR, finalSR);
          
          await emitScrapeStatus(gameId, "SUCCESS", { fr: result.round1, sr: result.round2 });

          // Push Notification Triggers (deduped via Redis NX lock)
          if (isRound1New || isRound2New) {
            const pushRound = isRound2New ? 'sr' : 'fr';
            const pushLockKey = `push:lock:${gameName}:${result.date}:${pushRound}`;
            const lockAcquired = await redis.set(pushLockKey, "1", "EX", 300, "NX");
            
            if (lockAcquired) {
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
          logger.info(`[Worker] ✅ ${gameName} | SUCCESS | FR: ${result.round1} | SR: ${result.round2} | ${tickDuration}ms`);
        } else {
          await emitScrapeStatus(gameId, "NO_CHANGE");
          await writeCronLog({
            game: game.name,
            status: "NO_NEW_DATA",
            duration: result.duration,
            details: { reason: "Result unchanged from DB" }
          });
          logger.info(`[Worker] ${gameName} | NO_NEW_DATA | unchanged | ${tickDuration}ms`);
        }
      } else if (result.status === "FAILED") {
        const errorCat = categorizeError(result.error);
        await emitScrapeStatus(gameId, "FAILED", { error: result.error, errorCategory: errorCat });

        await writeCronLog({
          game: game.name,
          status: "FAILED",
          duration: result.duration,
          error: result.error,
          errorCategory: errorCat,
          details: result.details
        });
        logger.warn(`[Worker] ❌ ${gameName} | FAILED [${errorCat}] | ${result.error} | ${tickDuration}ms`);
        throw new Error(result.error); // Trigger BullMQ retry
      } else if (result.status === "STALE_DATA" || result.status === "NO_NEW_DATA") {
        await emitScrapeStatus(gameId, "WAITING_FOR_RESULT", { lastDate: result.date });
        await writeCronLog({
          game: game.name,
          status: result.status,
          duration: result.duration,
          resultDate: result.date,
          round1: result.round1,
          round2: result.round2,
          details: result.details
        });
        logger.info(`[Worker] ⏳ ${gameName} | ${result.status} | Date: ${result.date} | ${tickDuration}ms`);
      }

      return { status: result.status, duration: tickDuration };
    } catch (error: any) {
      await emitScrapeStatus(gameId, "RETRY_SCHEDULED", { error: error.message });
      logger.error(`[Worker] Error processing ${gameName}: ${error.message}`);
      throw error;
    }
  }, { 
    connection: redis, 
    concurrency: 1
  });

  worker.on("completed", (job) => {
    logger.info(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
  });

  return worker;
}
