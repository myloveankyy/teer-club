import { Router } from 'express';
import prisma from '../prisma';
import { logger } from '../utils/logger';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const totalResults = await prisma.result.count();
    const totalGames = await prisma.game.count({ where: { isEnabled: true } });
    const totalPredictions = await prisma.prediction.count();

    const games = await prisma.game.findMany({
      where: { isEnabled: true },
      include: {
        results: {
          orderBy: { date: 'desc' },
          take: 1,
          select: { date: true, round1: true, round2: true },
        },
      },
    });

    const gameStats = games.map((game) => ({
      id: game.id,
      name: game.name,
      displayName: game.displayName,
      latestResult: game.results[0] ? {
        date: game.results[0].date,
        round1: game.results[0].round1,
        round2: game.results[0].round2,
      } : null,
    }));

    res.json({
      success: true,
      data: {
        totalResults,
        totalGames,
        totalPredictions,
        games: gameStats,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// --- Admin Prediction Routes ---

router.get('/predictions', async (req, res) => {
  try {
    const { page = 1, limit = 50, gameId } = req.query;
    const take = Math.min(parseInt(limit as string) || 50, 100);
    const skip = (Math.max(parseInt(page as string) || 1, 1) - 1) * take;

    const where: any = {};
    if (gameId) where.gameId = gameId as string;

    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where,
        include: { game: { select: { id: true, name: true, displayName: true } } },
        orderBy: { date: 'desc' },
        take,
        skip,
      }),
      prisma.prediction.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        predictions,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});



import { generateDailyPredictions } from '../services/predictionService';

router.post('/predictions/generate', async (req, res) => {
  try {
    const { date, forceOverwrite } = req.body;
    logger.info(`[Admin] Prediction generation triggered | date: ${date || 'today'} | force: ${forceOverwrite || false}`);
    const count = await generateDailyPredictions(date, forceOverwrite);
    logger.info(`[Admin] Prediction generation complete | count: ${count}`);
    res.json({ success: true, message: `Generated ${count} predictions`, count });
  } catch (err: any) {
    logger.error(`[Admin] Prediction generation FAILED: ${err.message}`, err);
    res.status(500).json({ success: false, error: err.message, details: err.stack?.split('\n').slice(0, 3) });
  }
});

// ─── Backfill Routes ─────────────────────────────────────────────────────────

import { runBackfill } from '../scripts/backfillShillong';

router.post('/backfill/shillong', async (req, res) => {
  try {
    const result = await runBackfill(prisma);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Enhanced Results Endpoint (offset pagination + date filter) ─────────────

router.get('/results', async (req, res) => {
  try {
    const { page = '1', limit = '50', gameId, from, to } = req.query;

    const take = Math.min(parseInt(limit as string) || 50, 100);
    const skip = (Math.max(parseInt(page as string) || 1, 1) - 1) * take;

    const where: any = {};
    if (gameId) where.gameId = gameId as string;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from as string);
      if (to) where.date.lte = new Date(to as string);
    }

    const [results, total] = await Promise.all([
      prisma.result.findMany({
        where,
        include: { game: { select: { id: true, name: true, displayName: true } } },
        orderBy: { date: 'desc' },
        take,
        skip,
      }),
      prisma.result.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        results,
        pagination: {
          total,
          page: parseInt(page as string) || 1,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;