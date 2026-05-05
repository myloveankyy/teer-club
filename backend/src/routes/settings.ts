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
                    masterScrapeStartTime: "15:00",
                    masterScrapeEndTime: "19:00",
                    isMasterScrapeActive: false,
                    faviconUrl: null,
                    appleTouchIconUrl: null,
                    isAdsEnabled: false,
                    googleAdsenseClientId: null,
                    headerAdUnit: null,
                    inFeedAdUnit: null,
                    stickyFooterAdUnit: null,
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

import { z } from "zod";

const settingsSchema = z.object({
    youtubeUrl: z.string().nullable().optional(),
    youtubeEnabled: z.boolean().optional(),
    whatsappUrl: z.string().nullable().optional(),
    whatsappEnabled: z.boolean().optional(),
    telegramUrl: z.string().nullable().optional(),
    telegramEnabled: z.boolean().optional(),
    bannerText: z.string().nullable().optional(),
    bannerVisible: z.boolean().optional(),
    bannerColor: z.string().nullable().optional(),
    resultAwaitedText: z.string().nullable().optional(),
    sundayOffText: z.string().nullable().optional(),
    primaryColor: z.string().nullable().optional(),
    accentColor: z.string().nullable().optional(),
    backgroundColor: z.string().nullable().optional(),
    textColor: z.string().nullable().optional(),
    cardStyle: z.string().nullable().optional(),
    borderRadius: z.string().nullable().optional(),
    playLiveUrl: z.string().nullable().optional(),
    playLiveEnabled: z.boolean().optional(),
    masterScrapeStartTime: z.string().nullable().optional(),
    masterScrapeEndTime: z.string().nullable().optional(),
    isMasterScrapeActive: z.boolean().optional(),
    faviconUrl: z.string().nullable().optional(),
    appleTouchIconUrl: z.string().nullable().optional(),
    isAdsEnabled: z.boolean().optional(),
    googleAdsenseClientId: z.string().nullable().optional(),
    headerAdUnit: z.string().nullable().optional(),
    inFeedAdUnit: z.string().nullable().optional(),
    stickyFooterAdUnit: z.string().nullable().optional(),
});

// Update site settings (admin only)
router.post("/", adminAuth, async (req: Request, res: Response) => {
    try {
        const parseResult = settingsSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ success: false, error: "Invalid input data", details: parseResult.error.format() });
        }
        
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
            masterScrapeStartTime,
            masterScrapeEndTime,
            isMasterScrapeActive,
            faviconUrl,
            appleTouchIconUrl,
            isAdsEnabled,
            googleAdsenseClientId,
            headerAdUnit,
            inFeedAdUnit,
            stickyFooterAdUnit,
        } = parseResult.data;

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
                masterScrapeStartTime,
                masterScrapeEndTime,
                isMasterScrapeActive,
                faviconUrl,
                appleTouchIconUrl,
                isAdsEnabled,
                googleAdsenseClientId,
                headerAdUnit,
                inFeedAdUnit,
                stickyFooterAdUnit,
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
                masterScrapeStartTime,
                masterScrapeEndTime,
                isMasterScrapeActive,
                faviconUrl,
                appleTouchIconUrl,
                isAdsEnabled,
                googleAdsenseClientId,
                headerAdUnit,
                inFeedAdUnit,
                stickyFooterAdUnit,
            },
        });

        res.json({ success: true, data: settings });
    } catch (error) {
        logger.error("Failed to update site settings", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;
