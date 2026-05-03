import { Router } from "express";
import prisma from "../prisma";
import { z } from "zod";
import crypto from "crypto";
import { io } from "../index";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

// ─── Public Routes ─────────────────────────────────────────────────────────

// GET /api/comments
// Fetch approved comments
router.get("/", async (req, res) => {
  try {
    const { gameId, date, limit = "50" } = req.query;

    const where: any = { status: "APPROVED" };
    if (gameId) where.gameId = gameId as string;
    if (date) where.date = date as string;

    const take = Math.min(parseInt(limit as string) || 50, 100);

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
    });

    return res.json({ success: true, data: comments });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/comments
// Add a new comment
const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
  author: z.string().max(50, "Name is too long").optional(),
  gameId: z.string().optional(),
  date: z.string().optional(),
});

router.post("/", async (req, res) => {
  try {
    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "Invalid data", details: parsed.error.format() });
    }

    const { content, author, gameId, date } = parsed.data;

    const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown_ip";
    const ipAddress = Array.isArray(rawIp) ? rawIp[0] : rawIp;
    const hashedIp = crypto.createHash("sha256").update(ipAddress).digest("hex");

    // Rate Limiting: 1 message per 10 seconds per hashed IP
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const recentComment = await prisma.comment.findFirst({
      where: {
        ipAddress: hashedIp,
        createdAt: {
          gte: tenSecondsAgo,
        },
      },
    });

    if (recentComment) {
      return res.status(429).json({ success: false, error: "Please wait 10 seconds before posting another comment." });
    }

    // Anonymous Identity Generation
    const anonId = `User_${hashedIp.substring(0, 6)}`;
    let finalAuthor = author?.trim();
    
    if (finalAuthor) {
      // Prevent impersonation by appending the unique hash
      if (!finalAuthor.includes(anonId)) {
        finalAuthor = `${finalAuthor} (${anonId})`;
      }
    } else {
      finalAuthor = anonId;
    }

    // Simple spam detection (e.g., links)
    let status = "APPROVED";
    if (content.match(/http[s]?:\/\//i)) {
      status = "PENDING"; // Send to moderation if it has a link
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        author: finalAuthor,
        gameId,
        date,
        ipAddress: hashedIp,
        status,
      },
    });

    if (status === "APPROVED" && gameId) {
      io.to(`game_${gameId}`).emit("new_comment", comment);
    }

    return res.json({ success: true, data: comment });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Admin Routes ─────────────────────────────────────────────────────────

// GET /api/comments/admin
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const { status, page = "1", limit = "50" } = req.query;

    const where: any = {};
    if (status) where.status = status as string;

    const take = Math.min(parseInt(limit as string) || 50, 100);
    const skip = (Math.max(parseInt(page as string) || 1, 1) - 1) * take;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.comment.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        comments,
        pagination: {
          total,
          page: parseInt(page as string) || 1,
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/comments/admin/:id
router.put("/admin/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, content } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (content) updateData.content = content;

    const comment = await prisma.comment.update({
      where: { id },
      data: updateData,
    });

    return res.json({ success: true, data: comment });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/comments/admin/:id
router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.comment.delete({
      where: { id },
    });

    return res.json({ success: true, message: "Comment deleted" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
