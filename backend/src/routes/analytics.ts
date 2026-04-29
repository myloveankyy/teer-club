import { Router } from "express";
import prisma from "../prisma";
import { logger } from "../utils/logger";
import { adminAuth } from "../middleware/adminAuth";

export const analyticsRouter = Router();

// Endpoint: POST /api/analytics/track
analyticsRouter.post("/track", async (req, res) => {
    try {
        const { url, pathname } = req.body;
        if (!pathname) {
            return res.status(400).json({ success: false, error: "Pathname is required for tracking" });
        }

        // We find the Page object linked to the pathname
        // Depending on routing structure, Prisma query varies
        const page = await prisma.page.findFirst({
            where: {
                OR: [
                    { url: pathname },         // exact match "/blogs/demo"
                    { slug: pathname.split('/').pop() } // partial mapping
                ]
            }
        });

        if (page) {
            await prisma.page.update({
                where: { id: page.id },
                data: { views: { increment: 1 } }
            });
        }

        res.json({ success: true });
    } catch (error) {
        // Fail gracefully to not bottleneck tracking
        logger.error("[Analytics Track] Error recording hit", error);
        res.status(500).json({ success: false, error: "Tracking failed" });
    }
});

// Endpoint: GET /api/analytics/admin/top-pages
analyticsRouter.get("/admin/top-pages", adminAuth, async (req, res) => {
    try {
        const topPages = await prisma.page.findMany({
            orderBy: { views: "desc" },
            take: 20,
            select: {
                id: true,
                title: true,
                url: true,
                type: true,
                views: true,
                seo_score: true
            }
        });
        res.json({ success: true, data: topPages });
    } catch (error) {
        logger.error("[Analytics GET] Error", error);
        res.status(500).json({ success: false, error: "Failed to fetch analytics" });
    }
});
