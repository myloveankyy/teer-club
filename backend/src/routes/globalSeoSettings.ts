import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { adminAuth } from "../middleware/adminAuth";
import { logger } from "../utils/logger";

const router = Router();

// Get Domain SEO settings (public since frontend needs it for head injection)
router.get("/", async (req: Request, res: Response) => {
    try {
        let settings = await prisma.domainSeoSettings.findUnique({
            where: { id: "global" },
        });

        if (!settings) {
            return res.json({
                success: true,
                data: {
                    id: "global",
                    defaultMetaTitle: null,
                    metaDescription: null,
                    defaultKeywords: null,
                    canonicalUrlRule: "AUTO",
                    indexEnabled: true,
                    followEnabled: true,
                    structuredDataJson: null,
                },
            });
        }

        res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
        res.json({ success: true, data: settings });
    } catch (error) {
        logger.error("Failed to fetch Domain SEO settings", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Update Domain SEO settings (admin only)
router.post("/", adminAuth, async (req: Request, res: Response) => {
    try {
        const {
            defaultMetaTitle,
            metaDescription,
            defaultKeywords,
            canonicalUrlRule,
            indexEnabled,
            followEnabled,
            structuredDataJson,
        } = req.body;

        const settings = await prisma.domainSeoSettings.upsert({
            where: { id: "global" },
            update: {
                defaultMetaTitle,
                metaDescription,
                defaultKeywords,
                canonicalUrlRule,
                indexEnabled,
                followEnabled,
                structuredDataJson,
            },
            create: {
                id: "global",
                defaultMetaTitle,
                metaDescription,
                defaultKeywords,
                canonicalUrlRule,
                indexEnabled,
                followEnabled,
                structuredDataJson,
            },
        });

        res.json({ success: true, data: settings });
    } catch (error) {
        logger.error("Failed to update Domain SEO settings", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;
