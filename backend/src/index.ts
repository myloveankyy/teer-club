import dotenv from "dotenv";
dotenv.config();

import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import prisma from "./prisma";
import { logger } from "./utils/logger";
import { aggregatePages } from "./services/pageAggregator";
import { adminAuth } from "./middleware/adminAuth";

import gamesRouter from "./routes/games";
import resultsRouter from "./routes/results";
import adminRouter from "./routes/admin";
import pagesRouter from "./routes/pages";
import predictionsRouter from "./routes/predictions";
import settingsRouter from "./routes/settings";
import cronRouter from "./routes/cronRoutes";
import importRouter from "./routes/importRoutes";
import { seoJournalRouter } from "./routes/seoJournal";
import seoRoutes from "./routes/seo.routes";
import { aiRouter } from "./routes/ai";
import { analyticsRouter } from "./routes/analytics";
import { debugRouter } from "./routes/debug";
import { startAllCrons, stopAllCrons } from "./cron/cronScheduler";
import { SitemapService } from "./services/sitemap.service";


const app: Express = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// ─── CORS — restrict to known origins ────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://teer.club",
  "https://www.teer.club",
  "https://admin.teer.club",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

app.use(cors({
  origin: (origin, callback) => {
    // In development or if no origin (server-to-server), allow
    if (!origin || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    // Explicitly check allowed origins or subdomains
    const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".teer.club");

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser compatibility
}));

app.use(express.json());
app.use(compression());

// Serve Sitemap dynamically with proper headers and fallback
app.get("/sitemap.xml", (req: Request, res: Response) => {
  try {
    const xml = SitemapService.readXml();
    res.set("Content-Type", "application/xml");
    res.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
    res.status(200).send(xml);

    // If file was missing (empty sitemap returned), trigger background regeneration
    if (xml.includes("</urlset>") && !xml.includes("<url>")) {
      logger.info("[SITEMAP] Serving empty fallback, triggering background regeneration...");
      SitemapService.generate().catch((err) =>
        logger.error("[SITEMAP] Background regeneration failed", err)
      );
    }
  } catch (err) {
    logger.error("[SITEMAP] Failed to serve sitemap.xml", err);
    res.set("Content-Type", "application/xml");
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`);
  }
});

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later." }
});

app.use("/api", apiLimiter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/health", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (err: any) {
    logger.error("Health check failed", err);
    res.status(503).json({
      status: "error",
      database: "disconnected",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/games", gamesRouter);
app.use("/api/results", resultsRouter);
app.use("/api/admin", adminAuth, adminRouter);
app.use("/api/pages", pagesRouter);
app.use("/api/predictions", predictionsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/admin/cron", adminAuth, cronRouter);
app.use("/api/admin/import", adminAuth, importRouter);
app.use("/api/admin/journal", seoJournalRouter);
app.use("/api/admin/ai", adminAuth, aiRouter);
app.use("/api/admin/debug", debugRouter);
app.use("/api/admin/seo", seoRoutes);
app.use("/api/analytics", analyticsRouter);


// ─── Seed Default Data ───────────────────────────────────────────────────────
async function seedDefaultData() {
  logger.info("[Seed] Checking for default data...");

  // Seed default site settings
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
      await prisma.siteSettings.create({
        data: {
          id: "global",
          youtubeUrl: "https://youtube.com/@teerclub",
          youtubeEnabled: true,
          whatsappUrl: "https://wa.me/910000000000",
          whatsappEnabled: true,
          telegramUrl: "https://t.me/teerclub",
          telegramEnabled: true,
          bannerText: "Welcome to Teer Club - Best Predictions for Shillong & Khanapara!",
          bannerVisible: true,
          bannerColor: "#2563eb",
          resultAwaitedText: "Result Awaited",
          sundayOffText: "Sunday Off",
        },
      });
      logger.info("[Seed] Default site settings created");
    }
  } catch (error) {
    logger.error("[Seed] Failed to seed site settings", error);
  }

  // Seed default game if DB is empty
  try {
    const gameCount = await prisma.game.count();
    if (gameCount === 0) {
      await prisma.game.create({
        data: {
          id: "shillong-teer",
          name: "shillong-teer",
          displayName: "Shillong Teer",
          description: "Official Shillong Teer Results",
          location: "Meghalaya",
          startTime: "3:30 PM",
          closeTime: "5:00 PM",
          frTime: "4:00 PM",
          srTime: "4:50 PM",
          historySourceUrl: "https://www.assamteerresults.com/shillong-previous-result/",
          liveSourceUrl: "https://www.assamteerresults.com",
          hasRound3: false,
          isEnabled: true,
          isLiveScrapingEnabled: true
        }
      });
      logger.info("[Seed] Default game 'Shillong Teer' created");
    }
  } catch (error) {
    logger.error("[Seed] Failed to seed default game", error);
  }

  // Aggregate pages on startup
  try {
    await aggregatePages();
  } catch (e) {
    logger.error("[Seed] Failed to aggregate pages", e);
  }

  logger.info("[Seed] Default data seeding complete");
}

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, error: "Origin not allowed by CORS" });
  }
  logger.error("[Error] Unhandled route error", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ─── Startup ─────────────────────────────────────────────────────────────────
async function start() {
  try {
    await prisma.$connect();
    logger.info("[Database] Connected to PostgreSQL");

    await seedDefaultData();
    startAllCrons();

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`[Server] Running on http://localhost:${PORT}`);
      logger.info(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`[Server] Process PID: ${process.pid}`);
    });
  } catch (error) {
    logger.error("[Startup] Failed to start", error);
    process.exit(1);
  }
}

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  logger.info("[Shutdown] SIGINT received. Stopping server...");
  stopAllCrons();
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("[Shutdown] SIGTERM received. Graceful shutdown...");
  stopAllCrons();
  await prisma.$disconnect();
  process.exit(0);
});

// ─── Global Error Handlers (prevent silent crashes) ──────────────────────────
process.on("unhandledRejection", (reason: any) => {
  logger.error(`[FATAL] Unhandled Promise Rejection: ${reason?.message || reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`[FATAL] Uncaught Exception: ${error.message}`);
});

if (require.main === module) {
  start();
}

export default app;