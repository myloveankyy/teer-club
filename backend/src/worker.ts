import dotenv from "dotenv";
dotenv.config();

import prisma from "./prisma";
import { logger } from "./utils/logger";
import { startScrapeWorker } from "./queue/scrapeQueue";
import { browserPool } from "./scrapers/browserPool";

async function start() {
  try {
    await prisma.$connect();
    logger.info("[Worker] Database connected");

    // Initialize the persistent browser pool immediately so it's ready for jobs
    await browserPool.init();

    // Start listening to the BullMQ queue
    startScrapeWorker();

    logger.info("[Worker] 🟢 Background Scrape Worker is running");
  } catch (error) {
    logger.error("[Worker] Failed to start worker", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  logger.info("[Worker] SIGINT received. Shutting down...");
  await browserPool.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("[Worker] SIGTERM received. Shutting down...");
  await browserPool.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on("unhandledRejection", (reason: any) => {
  logger.error(`[Worker FATAL] Unhandled Promise Rejection: ${reason?.message || reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`[Worker FATAL] Uncaught Exception: ${error.message}`);
});

start();
