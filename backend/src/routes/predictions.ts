import { Router } from "express";
import prisma from "../prisma";
import { getISTNow } from "../config/gameSchedule";

const router = Router();

// GET /api/predictions/today/all -> Gets all predictions generated for today
router.get("/today/all", async (req, res) => {
    try {
        let todayStr = getISTNow().dateStr;
        let targetDateObj = new Date(todayStr + "T00:00:00Z");

        if (targetDateObj.getUTCDay() === 0) {
            targetDateObj.setUTCDate(targetDateObj.getUTCDate() + 1);
            todayStr = targetDateObj.toISOString().split("T")[0];
        }

        const predictions = await prisma.prediction.findMany({
            where: { date: targetDateObj, status: "PUBLISHED" },
            include: { game: { select: { name: true, displayName: true } } }
        });

        return res.json({ success: true, data: { date: todayStr, predictions } });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/predictions/history -> Gets list of dates with predictions
router.get("/history", async (req, res) => {
    try {
        const result = paginationSchema.safeParse(req.query);
        if (!result.success) return res.status(400).json({ success: false, error: "Invalid pagination" });
        const { page, limit: take } = result.data;
        const skip = (page - 1) * take;

        // Get distinct dates from predictions
        const dates = await prisma.prediction.groupBy({
            by: ['date'],
            orderBy: { date: 'desc' },
            take,
            skip,
            where: { status: "PUBLISHED" }
        });

        const totalCount = await prisma.prediction.groupBy({
            by: ['date'],
            where: { status: "PUBLISHED" }
        });

        // For each date, get a small summary (number of wins)
        const history = await Promise.all(dates.map(async (d) => {
            const stats = await prisma.prediction.aggregate({
                where: { date: d.date, status: "PUBLISHED" },
                _count: { id: true }
            });

            const winCount = await prisma.prediction.count({
                where: { date: d.date, status: "PUBLISHED", OR: [{ houseMatch: true }, { endingMatch: true }, { directMatch: true }] }
            });

            return {
                date: d.date.toISOString().split('T')[0],
                totalPredictions: stats._count.id,
                winCount
            };
        }));

        return res.json({
            success: true,
            data: {
                history,
                pagination: {
                    total: totalCount.length,
                    page,
                    limit: take,
                    totalPages: Math.ceil(totalCount.length / take)
                }
            }
        });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/predictions/by-date/:date -> Gets predictions for a specific date
router.get("/by-date/:date", async (req, res) => {
    try {
        const { date } = req.params;
        const targetDateObj = new Date(date + "T00:00:00Z");

        if (isNaN(targetDateObj.getTime())) {
            return res.status(400).json({ success: false, error: "Invalid date format" });
        }

        const predictions = await prisma.prediction.findMany({
            where: { date: targetDateObj, status: "PUBLISHED" },
            include: {
                game: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        results: {
                            where: { date: targetDateObj },
                            take: 1
                        }
                    }
                }
            }
        });

        return res.json({ success: true, data: { date, predictions } });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/predictions/:gameIdentifier -> Gets all predictions for a game
// ... rest of the generic routes

import { z } from "zod";

const paginationSchema = z.object({
    page: z.string().optional().transform(v => parseInt(v || "1") || 1),
    limit: z.string().optional().transform(v => Math.min(parseInt(v || "30") || 30, 100)),
});

// GET /api/predictions/:gameIdentifier -> Gets all predictions for a game
router.get("/:gameIdentifier", async (req, res) => {
    try {
        const { gameIdentifier } = req.params;
        const result = paginationSchema.safeParse(req.query);

        if (!result.success) {
            return res.status(400).json({ success: false, error: "Invalid pagination parameters" });
        }

        const { page, limit: take } = result.data;

        const game = await prisma.game.findFirst({
            where: {
                OR: [
                    { id: gameIdentifier },
                    { name: { equals: gameIdentifier, mode: "insensitive" } },
                    { displayName: { equals: gameIdentifier, mode: "insensitive" } }
                ]
            }
        });

        if (!game) {
            return res.status(404).json({ success: false, error: "Game not found" });
        }

        const skip = (page - 1) * take;

        const [predictions, total] = await Promise.all([
            prisma.prediction.findMany({
                where: { gameId: game.id, status: "PUBLISHED" },
                orderBy: { date: "desc" },
                take,
                skip,
            }),
            prisma.prediction.count({ where: { gameId: game.id, status: "PUBLISHED" } }),
        ]);

        return res.json({
            success: true,
            data: {
                game,
                predictions,
                pagination: {
                    total,
                    page,
                    limit: take,
                    totalPages: Math.ceil(total / take),
                },
            },
        });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/predictions/:gameIdentifier/today -> Gets today's prediction for a game
router.get("/:gameIdentifier/today", async (req, res) => {
    try {
        const { gameIdentifier } = req.params;
        let todayStr = getISTNow().dateStr;
        let targetDateObj = new Date(todayStr + "T00:00:00Z");

        if (targetDateObj.getUTCDay() === 0) {
            targetDateObj.setUTCDate(targetDateObj.getUTCDate() + 1);
        }

        const game = await prisma.game.findFirst({
            where: {
                OR: [
                    { id: gameIdentifier },
                    { name: { equals: gameIdentifier, mode: "insensitive" } },
                    { displayName: { equals: gameIdentifier, mode: "insensitive" } }
                ]
            }
        });

        if (!game) {
            return res.status(404).json({ success: false, error: "Game not found" });
        }

        const prediction = await prisma.prediction.findUnique({
            where: { gameId_date: { gameId: game.id, date: targetDateObj } },
            include: { game: { select: { name: true, displayName: true } } }
        });

        if (!prediction) {
            return res.status(404).json({ success: false, error: "No prediction available for today" });
        }

        return res.json({ success: true, data: prediction });

    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
