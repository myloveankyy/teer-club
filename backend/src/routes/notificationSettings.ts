import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { adminAuth } from "../middleware/adminAuth";
import { logger } from "../utils/logger";

const router = Router();

// Get Notification settings (public to check if A2HS/Push is enabled for users)
router.get("/", async (req: Request, res: Response) => {
    try {
        let settings = await prisma.notificationSettings.findUnique({
            where: { id: "global" },
        });

        if (!settings) {
            return res.json({
                success: true,
                data: {
                    id: "global",
                    a2hsEnabled: true,
                    pushEnabled: false,
                },
            });
        }

        res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
        res.json({ success: true, data: settings });
    } catch (error) {
        logger.error("Failed to fetch Notification settings", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Update Notification settings (admin only)
router.post("/", adminAuth, async (req: Request, res: Response) => {
    try {
        const { a2hsEnabled, pushEnabled } = req.body;

        const settings = await prisma.notificationSettings.upsert({
            where: { id: "global" },
            update: { a2hsEnabled, pushEnabled },
            create: { a2hsEnabled, pushEnabled, id: "global" },
        });

        res.json({ success: true, data: settings });
    } catch (error) {
        logger.error("Failed to update Notification settings", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Get total subscribers (admin only)
router.get("/subscribers", adminAuth, async (req: Request, res: Response) => {
    try {
        const { deviceType } = req.query;
        let whereCondition: any = { isActive: true };
        if (deviceType) {
            whereCondition.deviceType = deviceType;
        }

        const count = await prisma.pushSubscriber.count({ where: whereCondition });
        res.json({ success: true, data: { count } });
    } catch (error) {
        logger.error("Failed to fetch subscribers count", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// User subscription endpoint (public)
router.post("/subscribe", async (req: Request, res: Response) => {
    try {
        const { endpoint, keys, deviceType, browser } = req.body;

        if (!endpoint || !keys) {
            return res.status(400).json({ success: false, error: "Invalid subscription data" });
        }

        const sub = await prisma.pushSubscriber.upsert({
            where: { endpoint },
            update: { isActive: true, keys, deviceType, browser },
            create: { endpoint, keys, deviceType, browser, isActive: true },
        });

        res.json({ success: true, data: sub });
    } catch (error) {
        logger.error("Failed to save push subscription", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

export default router;
