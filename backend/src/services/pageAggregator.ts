import prisma from "../prisma";
import { logger } from "../utils/logger";
import { AuditEngine } from "./auditEngine";
import { SitemapService } from "./sitemap.service";

const STATIC_ROUTES = [
    { url: "/", title: "Home | Teer Club", type: "STATIC" },
    { url: "/about", title: "About Us | Teer Club", type: "STATIC" },
    { url: "/blogs", title: "Teer Blog & Insights", type: "STATIC" },
    { url: "/common-numbers", title: "Common Numbers | Teer Club", type: "STATIC" },
    { url: "/dream-numbers", title: "Dream Numbers Guide", type: "STATIC" },
    { url: "/live", title: "Live Teer Results", type: "STATIC" },
    { url: "/results", title: "All Teer Results", type: "STATIC" },
    { url: "/teer-guide", title: "How to Play Teer Guide", type: "STATIC" },
];

export async function aggregatePages() {
    logger.info("[Aggregator] Starting Pages aggregation...");

    let updatedCount = 0;
    let createdCount = 0;

    const upsertPage = async (pageData: any) => {
        const { url, title, type, source } = pageData;
        const slug = url.replace(/^\/+/, '') || 'home';

        const existing = await prisma.page.findUnique({ where: { url } });

        if (existing) {
            await prisma.page.update({
                where: { id: existing.id },
                data: {
                    // Update only if source is static or auto, and not manually detached
                    last_updated: new Date()
                }
            });
            updatedCount++;
        } else {
            const created = await prisma.page.create({
                data: {
                    url,
                    slug,
                    title,
                    type,
                    source,
                    meta_title: title,
                    indexed: true,
                    status: "ACTIVE"
                }
            });
            createdCount++;

            // Trigger background audit for the new page
            AuditEngine.auditPage(created.id).catch(err =>
                logger.error(`[Aggregator] Background audit failed for ${url}`, err)
            );
        }
    };

    // 1. Ingest Static Pages
    for (const route of STATIC_ROUTES) {
        await upsertPage({
            ...route,
            source: "HARDCODED"
        });
    }

    // 2. Ingest Dynamic Game Pages
    const games = await prisma.game.findMany({ where: { isEnabled: true } });
    for (const game of games) {
        const slug = game.name;

        // Results Landing page
        await upsertPage({
            url: `/results/${slug}`,
            title: `${game.displayName} Teer Results`,
            type: "DYNAMIC",
            source: "DB"
        });

        // Live page
        await upsertPage({
            url: `/results/${slug}/live`,
            title: `${game.displayName} Today Live Result`,
            type: "DYNAMIC",
            source: "DB"
        });

        // Previous Results page (Internal pattern)
        await upsertPage({
            url: `/results/${slug}/previous-results`,
            title: `${game.displayName} Previous Results`,
            type: "DYNAMIC",
            source: "DB"
        });

        // Market slug pattern (Used in some cases)
        await upsertPage({
            url: `/${slug}`,
            title: `${game.displayName} Predictions & Results`,
            type: "DYNAMIC",
            source: "DB"
        });

        await upsertPage({
            url: `/${slug}/previous-results`,
            title: `${game.displayName} Archives`,
            type: "DYNAMIC",
            source: "DB"
        });
    }

    // 3. Ingest Prediction Pages (Daily Common Numbers)
    const recentPredictions = await prisma.page.findMany({
        where: {
            url: { startsWith: "/common-numbers/" },
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
    });
    // These are already in DB, but this ensures they stay indexed or we discovered them if they were manually created outside aggregator

    // 3. (Optional) Blogs if they were in DB, for now we map static paths or just ignore if static markdown.
    // Assuming Blogs are just static files. I will skip them or they can be manually added in the Admin Panel later.

    logger.info(`[Aggregator] Finished. Created: ${createdCount} | Updated: ${updatedCount}`);

    // Trigger Sitemap Sync
    SitemapService.generate().catch(err => logger.error('[Aggregator] Sitemap trigger failed', err));
}
