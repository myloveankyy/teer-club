import { Router } from "express";
import prisma from "../prisma";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        _count: { select: { results: true } },
      },
      orderBy: { name: "asc" },
    });
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=1800");
    return res.json({ success: true, data: games });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    const game = await prisma.game.findFirst({
      where: {
        OR: [
          { id: identifier },
          { name: { equals: identifier, mode: "insensitive" } }
        ]
      },
      include: { _count: { select: { results: true } } }
    });

    if (!game) {
      return res.status(404).json({ success: false, error: "Game not found" });
    }

    return res.json({ success: true, data: game });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

import { z } from "zod";

const createGameSchema = z.object({
  name: z.string().min(2),
  displayName: z.string().min(2),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().optional(),
  frTime: z.string().optional(),
  srTime: z.string().optional(),
  closeTime: z.string().optional(),
  historySourceUrl: z.string().url().optional().or(z.literal("")),
  liveSourceUrl: z.string().url().optional().or(z.literal("")),
  hasRound3: z.boolean().optional(),
});

const updateGameSchema = z.object({
  displayName: z.string().min(2).optional(),
  isEnabled: z.boolean().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().optional(),
  frTime: z.string().optional(),
  srTime: z.string().optional(),
  closeTime: z.string().optional(),
  historySourceUrl: z.string().url().optional().or(z.literal("")).nullable(),
  liveSourceUrl: z.string().url().optional().or(z.literal("")).nullable(),
  hasRound3: z.boolean().optional(),
});

router.post("/", adminAuth, async (req, res) => {
  try {
    const result = createGameSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: "Invalid input", details: result.error.format() });
    }

    const game = await prisma.game.create({
      data: result.data,
    });

    return res.json({ success: true, data: game });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = updateGameSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: "Invalid input", details: result.error.format() });
    }

    const game = await prisma.game.update({
      where: { id },
      data: result.data,
    });

    return res.json({ success: true, data: game });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Explicit transaction: since Prisma 'db push' often resists applying 
    // ON DELETE CASCADE to pre-existing live relations, we manually execute it.
    await prisma.$transaction([
      prisma.result.deleteMany({ where: { gameId: id } }),
      prisma.prediction.deleteMany({ where: { gameId: id } }),
      prisma.cronLog.deleteMany({ where: { game: id } }), // game string fallback
      prisma.game.delete({ where: { id } })
    ]);

    return res.json({ success: true, message: "Game and all relational references deleted safely" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
