import webpush from "web-push";
import prisma from "../prisma";
import { logger } from "../utils/logger";

const PUBLIC_API_URL = process.env.PUBLIC_URL || "https://teer.club";

export async function getOrGenerateVapid(): Promise<{ publicKey: string, privateKey: string }> {
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

    webpush.setVapidDetails(
        'mailto:admin@teer.club',
        settings.vapidPublicKey!,
        settings.vapidPrivateKey!
    );

    return { publicKey: settings.vapidPublicKey!, privateKey: settings.vapidPrivateKey! };
}

async function sendWithRetry(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string,
    maxRetries = 1
): Promise<void> {
    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            await webpush.sendNotification(subscription, payload);
            return;
        } catch (err: any) {
            lastError = err;
            if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
                throw err;
            }
            if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 2000));
            }
        }
    }
    throw lastError;
}

export async function sendBroadcastPush(title: string, body: string, url: string = "/"): Promise<{ delivered: number, failed: number }> {
    try {
        await getOrGenerateVapid();

        const subscribers = await prisma.pushSubscriber.findMany({
            where: { isActive: true }
        });

        if (subscribers.length === 0) return { delivered: 0, failed: 0 };

        const campaign = await prisma.pushCampaign.create({
            data: { title, body, url, audienceSize: subscribers.length }
        });

        let delivered = 0;
        let failed = 0;

        const pushPayload = JSON.stringify({
            title,
            body,
            url,
            campaignId: campaign.id,
            apiUrl: PUBLIC_API_URL
        });

        const promises = subscribers.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys as { p256dh: string, auth: string }
            };

            try {
                await sendWithRetry(pushSubscription, pushPayload, 1);
                delivered++;
                await prisma.pushDeliveryLog.create({
                    data: { campaignId: campaign.id, subscriberId: sub.id, status: "delivered", deliveredAt: new Date() }
                });
            } catch (err: any) {
                failed++;
                let errMsg = err.message || JSON.stringify(err);

                if (err.statusCode === 410 || err.statusCode === 404) {
                    await prisma.pushSubscriber.update({
                        where: { id: sub.id },
                        data: { isActive: false, status: "unsubscribed" }
                    });
                    errMsg = "Unsubscribed (410 Gone)";
                }

                await prisma.pushDeliveryLog.create({
                    data: { campaignId: campaign.id, subscriberId: sub.id, status: "failed", errorMessage: errMsg }
                });
            }
        });

        await Promise.all(promises);

        await prisma.pushCampaign.update({
            where: { id: campaign.id },
            data: { deliveredCount: delivered, failedCount: failed }
        });

        logger.info(`[PushService] Broadcast "${title}" sent — ${delivered} delivered, ${failed} failed.`);
        return { delivered, failed };
    } catch (error) {
        logger.error("[PushService] Failed to send broadcast push", error);
        return { delivered: 0, failed: 0 };
    }
}
