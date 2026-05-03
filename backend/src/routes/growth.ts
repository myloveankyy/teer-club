import { Router, Request, Response } from "express";
import prisma from "../prisma";

const router = Router();

// Helper to determine risk/priority
const generateGuidance = async () => {
    const recommendations = [];

    // 1. Check for thin content
    const thinPagesCount = await prisma.page.count({
        where: { wordCount: { lt: 300 } }
    });
    if (thinPagesCount > 0) {
        recommendations.push({
            id: "thin-content",
            priority: "HIGH",
            title: `Fix thin content on ${thinPagesCount} pages`,
            description: "Pages with under 300 words struggle to rank. Enrich these pages with more content.",
            actionText: "View Pages",
            actionHref: "/pages?filter=thin",
            riskLevel: "Safe ✅",
            impact: "High Impact"
        });
    }

    // 2. Missing Meta Descriptions
    const missingMetaCount = await prisma.page.count({
        where: { metaDescription: null }
    });
    if (missingMetaCount > 0) {
        recommendations.push({
            id: "missing-meta",
            priority: "HIGH",
            title: `Add meta descriptions to ${missingMetaCount} pages`,
            description: "Missing meta descriptions reduce CTR in search results. Generate descriptions for these pages.",
            actionText: "Fix Missing Meta",
            actionHref: "/pages?filter=no-meta",
            riskLevel: "Safe ✅",
            impact: "High Impact"
        });
    }

    // 3. Pages awaiting indexing
    const waitingIndexCount = await prisma.page.count({
        where: { indexStatus: "DISCOVERED" }
    });
    if (waitingIndexCount > 0) {
        recommendations.push({
            id: "pending-index",
            priority: "MEDIUM",
            title: `Index ${waitingIndexCount} newly discovered pages`,
            description: "These pages are generated but not yet submitted via Indexing API.",
            actionText: "Push to Indexing Queue",
            actionHref: "/seo-dashboard",
            riskLevel: "Safe ✅",
            impact: "Medium Impact"
        });
    }

    // 4. Monthly Archive Pages Generation
    // We assume if no pages with slug starting with 'results/' and ending with a year exist, we should recommend it.
    // This is an algorithmic guess for the grey-hat recommendation.
    const hasArchives = await prisma.page.count({
        where: { slug: { contains: "results/" } }
    });
    
    if (hasArchives < 10) {
        recommendations.push({
            id: "create-archives",
            priority: "MEDIUM",
            title: "Create monthly archive pages",
            description: "Programmatically generate date-based result pages (e.g., Shillong Teer Result Jan 2026) to capture long-tail traffic.",
            actionText: "Generate Archives",
            actionHref: "/prediction-pages",
            riskLevel: "Low Risk ⚠️",
            impact: "High Impact"
        });
    }

    // 5. Internal Linking
    const lowLinksCount = await prisma.page.count({
        where: { internalLinks: { lt: 3 } }
    });
    if (lowLinksCount > 0) {
        recommendations.push({
            id: "internal-links",
            priority: "LOW",
            title: `Add internal links to ${lowLinksCount} pages`,
            description: "Pages with fewer than 3 internal links are considered weak. Build links from other related pages.",
            actionText: "View Pages",
            actionHref: "/pages?filter=low-links",
            riskLevel: "Safe ✅",
            impact: "Medium Impact"
        });
    }

    // 6. Submit Sitemap
    recommendations.push({
        id: "submit-sitemap",
        priority: "HIGH",
        title: "Submit sitemap to Google Search Console",
        description: "Ensure Google has the latest map of your programmatic pages.",
        actionText: "Copy Sitemap URL",
        actionHref: "#",
        riskLevel: "Safe ✅",
        impact: "High Impact"
    });

    return recommendations;
};

// GET /api/growth/dashboard
router.get("/dashboard", async (req: Request, res: Response) => {
    try {
        // Base Metrics
        const totalPages = await prisma.page.count();
        const indexedPages = await prisma.page.count({
            where: { indexStatus: "INDEXED" }
        });
        
        // Traffic Estimator Formula: Indexed Pages * Avg Search Volume (estimated) * CTR
        // Heuristic: Teer keywords have ~200k daily volume across long tail. Let's assume an indexed page captures 5 visits/day on average.
        const estimatedDailyTraffic = indexedPages * 5; 
        const estimatedMonthlyTraffic = estimatedDailyTraffic * 30;

        // Get growth velocity (simulated from timestamps if possible, but we'll use a snapshot here)
        const newPagesThisWeek = await prisma.page.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        });

        // Get latest SEO snapshot for trend
        const recentSnapshot = await prisma.crawlSnapshot.findFirst({
            orderBy: { crawledAt: "desc" }
        });

        res.json({
            success: true,
            data: {
                metrics: {
                    totalPages,
                    indexedPages,
                    estimatedDailyTraffic,
                    estimatedMonthlyTraffic,
                    newPagesThisWeek,
                    avgSeoScore: recentSnapshot?.avgScore || 0,
                }
            }
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/growth/recommendations
router.get("/recommendations", async (req: Request, res: Response) => {
    try {
        const recommendations = await generateGuidance();
        
        // Sort by Priority: HIGH > MEDIUM > LOW
        const priorityScore: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        recommendations.sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority]);

        res.json({
            success: true,
            data: recommendations
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
