import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { adminAuth } from "../middleware/adminAuth";
import { logger } from "../utils/logger";
import webpush from "web-push";

const router = Router();

// Backend API URL for service worker click tracking callbacks
const PUBLIC_API_URL = process.env.PUBLIC_URL || "https://teer.club";

// Ensure VAPID keys exist
async function getOrGenerateVapid(): Promise<{ publicKey: string, privateKey: string }> {
    let settings = await prisma.notificationSettings.findUnique({ where: { id: "global" } });
    if (!settings) {
        settings = await prisma.notificationSettings.create({
            data: { id: "global", a2hsEnabled: true, pushEnabled: false }
        });
    }

    if (!settings.vapidPublicKey || !settings.vapidPrivateKey) {
        const vapidKeys = webpush.generateVAPIDKeys();
        settings = await prisma.notificationSettings.update({
            where: { id: "global" },
            data: {
                vapidPublicKey: vapidKeys.publicKey,
                vapidPrivateKey: vapidKeys.privateKey
            }
        });
        logger.info("Generated and saved new VAPID keys for Web Push");
    }

    // Set web-push details
    webpush.setVapidDetails(
        'mailto:admin@teer.club',
        settings.vapidPublicKey!,
        settings.vapidPrivateKey!
    );

    return { publicKey: settings.vapidPublicKey!, privateKey: settings.vapidPrivateKey! };
}

// Retry helper for push delivery
async function sendWithRetry(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string,
    maxRetries = 1
): Promise<void> {
    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            await webpush.sendNotification(subscription, payload);
            return; // Success
        } catch (err: any) {
            lastError = err;
            // Don't retry on client-side errors (4xx) — subscription is invalid
            if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
                throw err;
            }
            // Wait before retry on transient errors
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 2000));
                logger.warn(`[Push] Retrying delivery (attempt ${attempt + 2})`);
            }
        }
    }
    throw lastError;
}

// 1. Get Settings (Public)
router.get("/", async (req: Request, res: Response) => {
    try {
        let settings = await prisma.notificationSettings.findUnique({ where: { id: "global" } });
        if (!settings) {
            settings = await prisma.notificationSettings.create({
                data: { id: "global", a2hsEnabled: true, pushEnabled: false }
            });
        }
        // Never send private key to frontend
        const publicSettings = {
            id: settings.id,
            a2hsEnabled: settings.a2hsEnabled,
            pushEnabled: settings.pushEnabled
        };
        res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
        res.json({ success: true, data: publicSettings });
    } catch (error) {
        logger.error("Failed to fetch Notification settings", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// 2. Get VAPID Public Key (Public)
router.get("/vapid-key", async (req: Request, res: Response) => {
    try {
        const { publicKey } = await getOrGenerateVapid();
        res.json({ success: true, data: { publicKey } });
    } catch (error) {
        logger.error("Failed to fetch VAPID key", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// 3. Update Settings (Admin Only)
router.post("/", adminAuth, async (req: Request, res: Response) => {
    try {
        const { a2hsEnabled, pushEnabled } = req.body;
        const settings = await prisma.notificationSettings.upsert({
            where: { id: "global" },
            update: { a2hsEnabled, pushEnabled },
            create: { a2hsEnabled, pushEnabled, id: "global" },
        });
        res.json({ success: true, data: { id: settings.id, a2hsEnabled: settings.a2hsEnabled, pushEnabled: settings.pushEnabled } });
    } catch (error) {
        logger.error("Failed to update settings", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// 4. Subscribe (Public) - Enhanced Telemetry
router.post("/subscribe", async (req: Request, res: Response) => {
    try {
        const { endpoint, keys, deviceType, browser, os } = req.body;
        if (!endpoint || !keys) {
            return res.status(400).json({ success: false, error: "Invalid subscription payload" });
        }

        const sub = await prisma.pushSubscriber.upsert({
            where: { endpoint },
            update: { isActive: true, keys, deviceType, browser, os, status: "active", lastActive: new Date() },
            create: { endpoint, keys, deviceType, browser, os, isActive: true, status: "active" },
        });

        logger.info(`[Push] New subscriber registered: ${sub.id} (${deviceType || 'unknown'} / ${browser || 'unknown'} / ${os || 'unknown'})`);
        res.json({ success: true, data: sub });
    } catch (error) {
        logger.error("Failed to save push subscription", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// 5. Track Click (Public) - Critical Industry Standard
router.post("/click", async (req: Request, res: Response) => {
    try {
        const { endpoint, campaignId } = req.body;
        logger.info(`[Push Click] Received — campaignId=${campaignId}, endpoint=${endpoint ? endpoint.slice(0, 50) + '...' : 'MISSING'}`);

        if (!endpoint || !campaignId) {
            logger.warn(`[Push Click] Rejected — missing endpoint or campaignId`);
            return res.status(400).json({ success: false, error: "Missing endpoint or campaignId" });
        }

        const subscriber = await prisma.pushSubscriber.findUnique({ where: { endpoint } });
        if (!subscriber) {
            logger.warn(`[Push Click] Subscriber not found for endpoint`);
            return res.json({ success: true, tracked: false, reason: "subscriber_not_found" });
        }

        // Update last active
        await prisma.pushSubscriber.update({
            where: { id: subscriber.id },
            data: { lastActive: new Date() }
        });

        // Try to find matching delivery log and mark as clicked
        const log = await prisma.pushDeliveryLog.findFirst({
            where: { subscriberId: subscriber.id, campaignId: campaignId }
        });

        if (!log) {
            logger.warn(`[Push Click] No delivery log found for subscriber=${subscriber.id} campaign=${campaignId}`);
            return res.json({ success: true, tracked: false, reason: "no_delivery_log" });
        }

        if (log.clicked) {
            logger.info(`[Push Click] Already tracked — subscriber=${subscriber.id} campaign=${campaignId}`);
            return res.json({ success: true, tracked: true, reason: "already_tracked" });
        }

        await prisma.pushDeliveryLog.update({
            where: { id: log.id },
            data: { clicked: true, clickedAt: new Date() }
        });

        await prisma.pushCampaign.update({
            where: { id: campaignId },
            data: { clickCount: { increment: 1 } }
        });

        logger.info(`[Push Click] ✅ SUCCESS — campaign=${campaignId} subscriber=${subscriber.id}`);
        res.json({ success: true, tracked: true });
    } catch (error) {
        logger.error("[Push Click] Error tracking click", error);
        res.status(500).json({ success: false });
    }
});

// 6. Send Broadcast Push (Admin Only) - Reliability Layer with Retry
router.post("/send-push", adminAuth, async (req: Request, res: Response) => {
    try {
        const { title, body, url } = req.body;
        if (!title || !body) return res.status(400).json({ success: false, error: "Missing payload details" });

        // Ensure keys are locked and loaded
        await getOrGenerateVapid();

        const subscribers = await prisma.pushSubscriber.findMany({
            where: { isActive: true }
        });

        if (subscribers.length === 0) {
            return res.json({ success: true, data: { message: "No active subscribers", audienceSize: 0, deliveredCount: 0, failedCount: 0 } });
        }

        // Create Campaign Log
        const campaign = await prisma.pushCampaign.create({
            data: { title, body, url, audienceSize: subscribers.length }
        });

        let delivered = 0;
        let failed = 0;

        const pushPayload = JSON.stringify({
            title,
            body,
            url: url || "/",
            campaignId: campaign.id,
            apiUrl: PUBLIC_API_URL  // Critical: enables click tracking in service worker
        });

        const promises = subscribers.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys as { p256dh: string, auth: string }
            };

            try {
                // Retry up to 1 time on transient failures
                await sendWithRetry(pushSubscription, pushPayload, 1);
                delivered++;

                // Log Success
                await prisma.pushDeliveryLog.create({
                    data: {
                        campaignId: campaign.id,
                        subscriberId: sub.id,
                        status: "delivered",
                        deliveredAt: new Date()
                    }
                });
            } catch (err: any) {
                failed++;
                let errMsg = err.message || JSON.stringify(err);

                // If 410 Gone / 404 Not Found, subscriber has revoked access. Clean up!
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await prisma.pushSubscriber.update({
                        where: { id: sub.id },
                        data: { isActive: false, status: "unsubscribed" }
                    });
                    errMsg = "Unsubscribed (410 Gone)";
                    logger.info(`[Push] Auto-removed invalid subscriber ${sub.id} (${err.statusCode})`);
                }

                // Log Failed
                await prisma.pushDeliveryLog.create({
                    data: {
                        campaignId: campaign.id,
                        subscriberId: sub.id,
                        status: "failed",
                        errorMessage: errMsg
                    }
                });
            }
        });

        await Promise.all(promises);

        // Finalize Campaign Metrics
        const finalizedCampaign = await prisma.pushCampaign.update({
            where: { id: campaign.id },
            data: { deliveredCount: delivered, failedCount: failed }
        });

        logger.info(`[Push] Campaign "${title}" sent — ${delivered} delivered, ${failed} failed out of ${subscribers.length}`);
        res.json({ success: true, data: finalizedCampaign });
    } catch (error) {
        logger.error("Failed to send broadcast push", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// 7. Get Subscribers Table (Admin)
router.get("/subscribers", adminAuth, async (req: Request, res: Response) => {
    try {
        const subscribers = await prisma.pushSubscriber.findMany({
            orderBy: { createdAt: "desc" },
            take: 200,
            select: {
                id: true,
                endpoint: true,
                deviceType: true,
                browser: true,
                os: true,
                isActive: true,
                status: true,
                lastActive: true,
                createdAt: true,
            }
        });
        const totalActive = await prisma.pushSubscriber.count({ where: { isActive: true } });
        const totalInactive = await prisma.pushSubscriber.count({ where: { isActive: false } });
        res.json({ success: true, data: { subscribers, totalActive, totalInactive, total: totalActive + totalInactive } });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// 8. Get Campaigns Table (Admin)
router.get("/campaigns", adminAuth, async (req: Request, res: Response) => {
    try {
        const campaigns = await prisma.pushCampaign.findMany({
            orderBy: { sentAt: "desc" },
            take: 50
        });
        res.json({ success: true, data: { campaigns } });
    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// 9. Get Campaign Detail Logs (Admin) — per-subscriber delivery breakdown
router.get("/campaigns/:id/logs", adminAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const campaign = await prisma.pushCampaign.findUnique({ where: { id } });
        if (!campaign) {
            return res.status(404).json({ success: false, error: "Campaign not found" });
        }

        const logs = await prisma.pushDeliveryLog.findMany({
            where: { campaignId: id },
            orderBy: { createdAt: "desc" },
            include: {
                subscriber: {
                    select: {
                        id: true,
                        deviceType: true,
                        browser: true,
                        os: true,
                        status: true,
                    }
                }
            }
        });

        res.json({ success: true, data: { campaign, logs } });
    } catch (error) {
        logger.error("Failed to fetch campaign logs", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;
