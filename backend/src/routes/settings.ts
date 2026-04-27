import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { adminAuth } from "../middleware/adminAuth";
import { logger } from "../utils/logger";

const router = Router();

// Get site settings (public)
router.get("/", async (req: Request, res: Response) => {
    try {
        let settings = await prisma.siteSettings.findUnique({
            where: { id: "global" },
        });

        if (!settings) {
            // Return default settings if not found
            return res.json({
                success: true,
                data: {
                    id: "global",
                    youtubeUrl: null,
                    youtubeEnabled: false,
                    whatsappUrl: null,
                    whatsappEnabled: false,
                    telegramUrl: null,
                    telegramEnabled: false,
                    bannerText: null,
                    bannerVisible: false,
                    bannerColor: "#2563eb",
                    resultAwaitedText: "Result Awaited",
                    sundayOffText: "Sunday Off",
                    primaryColor: "#2563eb",
                    accentColor: "#22c55e",
                    backgroundColor: "#ffffff",
                    textColor: "#111827",
                    cardStyle: "soft",
                    borderRadius: "lg",
                    playLiveUrl: null,
                    playLiveEnabled: false,
                },
            });
        }

        res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
        res.json({ success: true, data: settings });
    } catch (error) {
        logger.error("Failed to fetch site settings", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Update site settings (admin only)
router.post("/", adminAuth, async (req: Request, res: Response) => {
    try {
        const {
            youtubeUrl,
            youtubeEnabled,
            whatsappUrl,
            whatsappEnabled,
            telegramUrl,
            telegramEnabled,
            bannerText,
            bannerVisible,
            bannerColor,
            resultAwaitedText,
            sundayOffText,
            primaryColor,
            accentColor,
            backgroundColor,
            textColor,
            cardStyle,
            borderRadius,
            playLiveUrl,
            playLiveEnabled,
        } = req.body;

        const settings = await prisma.siteSettings.upsert({
            where: { id: "global" },
            update: {
                youtubeUrl,
                youtubeEnabled,
                whatsappUrl,
                whatsappEnabled,
                telegramUrl,
                telegramEnabled,
                bannerText,
                bannerVisible,
                bannerColor,
                resultAwaitedText,
                sundayOffText,
                primaryColor,
                accentColor,
                backgroundColor,
                textColor,
                cardStyle,
                borderRadius,
                playLiveUrl,
                playLiveEnabled,
            },
            create: {
                id: "global",
                youtubeUrl,
                youtubeEnabled,
                whatsappUrl,
                whatsappEnabled,
                telegramUrl,
                telegramEnabled,
                bannerText,
                bannerVisible,
                bannerColor,
                resultAwaitedText,
                sundayOffText,
                primaryColor,
                accentColor,
                backgroundColor,
                textColor,
                cardStyle,
                borderRadius,
                playLiveUrl,
                playLiveEnabled,
            },
        });

        res.json({ success: true, data: settings });
    } catch (error) {
        logger.error("Failed to update site settings", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;
