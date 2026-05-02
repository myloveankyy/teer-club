import { Router } from "express";
import prisma from "../prisma";
import { getISTNow, GAME_SCHEDULES } from "../config/gameSchedule";
import { logger } from "../utils/logger";
import { z } from "zod";
import { redis } from "../utils/redis";

const router = Router();

const CACHE_TTL_SEC = 5; // 5 seconds cache
const CACHE_KEY = "cache:today";

// ─── Helper: Get today's IST date as a UTC midnight Date ─────────────────────
function getTodayISTDate(): { dateObj: Date; dateStr: string } {
  const { dateStr } = getISTNow();
  return { dateObj: new Date(dateStr + "T00:00:00Z"), dateStr };
}

// ─── GET /today — Returns ONLY today's results (IST-aware) ──────────────────
router.get("/today", async (req, res) => {
  try {
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      res.setHeader("Cache-Control", "public, max-age=15, stale-while-revalidate=30");
      return res.json({ success: true, data: JSON.parse(cachedData), cached: true });
    }

    const { dateObj: todayDate, dateStr: todayStr } = getTodayISTDate();

    // Get all enabled games with their schedule metadata
    const games = await prisma.game.findMany({
      where: { isEnabled: true },
      orderBy: { name: "asc" },
    });

    // Fetch today's results for all games in one query
    const todayResults = await prisma.result.findMany({
      where: { date: todayDate },
      include: { game: { select: { id: true, name: true, displayName: true } } },
    });

    // Build result map by gameId
    const resultByGame: Record<string, any> = {};
    for (const r of todayResults) {
      resultByGame[r.gameId] = r;
    }

    const jobByGame: Record<string, any> = {};

    // Fetch today's predictions to show match proofs
    const todayPredictions = await prisma.prediction.findMany({
      where: { date: todayDate },
    });

    const predictionByGame: Record<string, any> = {};
    for (const p of todayPredictions) {
      predictionByGame[p.gameId] = p;
    }

    // Check if today is Sunday (IST) using the UTC representation of midnight IST
    const isSundayOff = todayDate.getUTCDay() === 0;

    // Build response with game schedule info
    const { totalMinutes: nowMinutes } = getISTNow();

    const gamesWithResults = games.map((game) => {
      const result = resultByGame[game.id] || null;
      const job = jobByGame[game.id] || null;
      const prediction = predictionByGame[game.id] || null;
      const schedule = GAME_SCHEDULES.find((s) => s.game === game.name);

      const hasRound1 = result?.round1 && result.round1 !== "XX" && result.round1 !== "--" && result.round1.trim() !== "";
      const hasRound2 = result?.round2 && result.round2 !== "XX" && result.round2 !== "--" && result.round2.trim() !== "";
      const hasRound3Val = result?.round3 && result.round3 !== "XX" && result.round3 !== "--" && result.round3.trim() !== "";

      let status: "waiting" | "declared" | "partial" | "off" | "searching" | "failed" | "delayed" = "waiting";

      if (isSundayOff) {
        status = "off";
      } else if (game.hasRound3 || schedule?.hasRound3) {
        if (hasRound1 && hasRound2 && hasRound3Val) status = "declared";
        else if (hasRound1) status = "partial";
        else if (job?.status === 'SEARCHING') status = "searching";
        else if (job?.status === 'FAILED') status = "failed";
      } else {
        if (hasRound1 && hasRound2) status = "declared";
        else if (hasRound1) status = "partial";
      }

      // Compute isDelayed: past result time but no result yet
      let isDelayed = false;
      const [frH, frM] = schedule?.frResultTime.split(':').map(Number) || [16, 0];
      const frMinutes = frH * 60 + frM + 10; // 10min grace

      if (status !== "declared" && status !== "off" && !isSundayOff) {
        if (nowMinutes > frMinutes) isDelayed = true;
      }

      // Create a trust-building message
      let message = "";
      if (status === 'off') message = "🛑 Sunday Off – No game today";
      else if (status === 'declared') message = "✅ Official results confirmed.";
      else if (status === 'partial') message = "⏳ Partial results found. Waiting for next round.";
      else if (isDelayed) message = "⚠️ Result is delayed today. We are continuously checking and will update as soon as available.";
      else if (status === 'searching' || status === 'waiting') message = "⏳ Result is awaited. Official results are usually declared shortly.";
      else if (status === 'failed') message = "⚠️ Sources are slow today. We are still attempting to fetch latest data.";

      return {
        id: game.id,
        name: game.name,
        displayName: game.displayName,
        location: game.location,
        frTime: schedule?.frResultTime || game.frTime || null,
        srTime: schedule?.srResultTime || game.srTime || null,
        trTime: schedule?.trResultTime || null,
        hasRound3: game.hasRound3 || schedule?.hasRound3 || false,
        startTime: game.startTime || null,
        closeTime: game.closeTime || null,
        isEnabled: game.isEnabled,
        isSundayOff,
        isDelayed,
        message,
        delayNote: schedule?.delayNote || null,
        result: result
          ? {
            id: result.id,
            date: result.date,
            round1: result.round1,
            round2: result.round2,
            round3: result.round3 || null,
            confidence: result.confidence,
            verified: result.verified,
          }
          : null,
        status,
        prediction: prediction ? {
          house: prediction.house,
          ending: prediction.ending,
          directNumber: prediction.directNumber,
          commonNumbers: prediction.commonNumbers,
          houseMatch: prediction.houseMatch,
          endingMatch: prediction.endingMatch,
          directMatch: prediction.directMatch,
        } : null,
      };
    });


    const responseData = {
      date: todayStr,
      games: gamesWithResults,
    };

    // Store in Redis with TTL
    await redis.setex(CACHE_KEY, CACHE_TTL_SEC, JSON.stringify(responseData));

    res.setHeader("Cache-Control", "public, max-age=15, stale-while-revalidate=30");
    return res.json({
      success: true,
      data: responseData,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /dashboard — Paginated results (all dates) ─────────────────────────
router.get("/dashboard", async (req, res) => {
  try {
    const { gameId, from, to, cursor, limit = 50 } = req.query;

    const where: any = {};
    if (gameId) where.gameId = gameId as string;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from as string);
      if (to) where.date.lte = new Date(to as string);
    }

    const take = Math.min(parseInt(limit as string) || 50, 100);
    const results = await prisma.result.findMany({
      where,
      include: { game: { select: { id: true, name: true, displayName: true } } },
      orderBy: { date: "desc" },
      take: take + 1,
      cursor: cursor ? { id: cursor as string } : undefined,
      skip: cursor ? 1 : 0,
    });

    let nextCursor: string | null = null;
    if (results.length > take) {
      const nextItem = results.pop();
      nextCursor = nextItem?.id || null;
    }

    const byGame: Record<string, any[]> = {};
    for (const r of results) {
      if (!byGame[r.gameId]) byGame[r.gameId] = [];
      byGame[r.gameId].push(r);
    }

    const games = await prisma.game.findMany({
      include: { _count: { select: { results: true } } },
    });

    res.setHeader("Cache-Control", "public, max-age=15, stale-while-revalidate=30");
    return res.json({
      success: true,
      data: {
        results,
        byGame,
        games,
        nextCursor,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const { gameId, from, to } = req.query;

    const where: any = {};
    if (gameId) where.gameId = gameId as string;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from as string);
      if (to) where.date.lte = new Date(to as string);
    }

    const [total, byConfidence, gamesCount] = await Promise.all([
      prisma.result.count({ where }),
      prisma.result.groupBy({
        by: ["confidence"],
        where,
        _count: true,
      }),
      prisma.game.count(),
    ]);

    const confidenceMap: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    byConfidence.forEach((c) => {
      if (c.confidence) confidenceMap[c.confidence] = c._count;
    });

    return res.json({
      success: true,
      data: {
        total,
        games: gamesCount,
        byConfidence: confidenceMap,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:gameIdentifier/history", async (req, res) => {
  try {
    const { gameIdentifier } = req.params;
    const sanitizedIdentifier = gameIdentifier.replace(/ teer$/i, "").trim();

    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { id: gameIdentifier },
          { name: { equals: gameIdentifier, mode: "insensitive" } },
          { name: { equals: sanitizedIdentifier, mode: "insensitive" } },
          { displayName: { equals: gameIdentifier, mode: "insensitive" } },
          { displayName: { equals: sanitizedIdentifier, mode: "insensitive" } }
        ]
      }
    });

    logger.debug(`[History API] Lookup ${gameIdentifier} -> Result: ${game?.name || "Not Found"}`);

    if (!game) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }

    const historySchema = z.object({
      page: z.string().optional().transform(v => parseInt(v || "1") || 1),
      limit: z.string().optional().transform(v => Math.min(parseInt(v || "30") || 30, 100)),
      from: z.string().optional().refine(v => !v || !isNaN(Date.parse(v)), "Invalid 'from' date"),
      to: z.string().optional().refine(v => !v || !isNaN(Date.parse(v)), "Invalid 'to' date"),
    });

    const queryResult = historySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ success: false, error: "Invalid query parameters", details: queryResult.error.format() });
    }

    const { page, limit: take, from: fromStr, to: toStr } = queryResult.data;

    const where: any = { gameId: game.id };
    if (fromStr || toStr) {
      where.date = {};
      if (fromStr) where.date.gte = new Date(fromStr);
      if (toStr) where.date.lte = new Date(toStr);
    }

    const skip = (page - 1) * take;
    logger.debug(`[History API] Fetching rows: skip=${skip}, take=${take}`);

    const [results, total] = await Promise.all([
      prisma.result.findMany({
        where,
        orderBy: { date: "desc" },
        take,
        skip,
      }),
      prisma.result.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        game,
        results,
        pagination: {
          total,
          page,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (err: any) {
    logger.error(`[History API] Critical Error:`, err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:gameId/:date", async (req, res) => {
  try {
    const { gameId, date } = req.params;

    if (isNaN(Date.parse(date))) {
      return res.status(400).json({ success: false, error: "Invalid date format" });
    }

    const dateObj = new Date(date);

    const result = await prisma.result.findUnique({
      where: { gameId_date: { gameId, date: dateObj } },
      include: { game: true },
    });

    if (!result) {
      return res.status(404).json({ success: false, error: "Result not found" });
    }

    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /number/:number — Number frequency and history ─────────────────────
router.get("/number/:number", async (req, res) => {
  try {
    const { number } = req.params;
    
    // Ensure the number is 2 digits for exact match (e.g., "05", "45")
    const paddedNumber = number.padStart(2, '0');

    // Find all results where round1 or round2 equals the number
    const results = await prisma.result.findMany({
      where: {
        OR: [
          { round1: paddedNumber },
          { round2: paddedNumber },
          { round3: paddedNumber }
        ]
      },
      include: {
        game: { select: { id: true, name: true, displayName: true } }
      },
      orderBy: {
        date: 'desc'
      },
      take: 100 // limit to recent 100 hits
    });

    const stats = {
      totalHits: results.length,
      round1Hits: results.filter(r => r.round1 === paddedNumber).length,
      round2Hits: results.filter(r => r.round2 === paddedNumber).length,
      round3Hits: results.filter(r => r.round3 === paddedNumber).length,
      lastHit: results.length > 0 ? results[0].date : null,
      lastGame: results.length > 0 ? results[0].game.displayName : null,
    };

    return res.json({
      success: true,
      data: {
        number: paddedNumber,
        stats,
        history: results
      }
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
// Triggering backend reload to fix Prisma deadlock
