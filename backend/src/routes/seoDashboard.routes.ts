import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { logger } from '../utils/logger';
import { adminAuth } from '../middleware/adminAuth';
import { InternalCrawler } from '../services/internalCrawler';
import { SeoHealthEngine } from '../services/seoHealthEngine';
import { SeoService } from '../services/seo.service';

const router = Router();

// All routes require admin auth
router.use(adminAuth);

/**
 * GET /overview — KPI summary
 */
router.get('/overview', async (_req: Request, res: Response) => {
    try {
        const [
            totalPages,
            indexedPages,
            notIndexedPages,
            totalLinks,
            avgScoreResult,
            scoreDistribution,
            recentSnapshots,
            topIssues,
        ] = await Promise.all([
            prisma.page.count({ where: { status: 'ACTIVE' } }),
            prisma.page.count({ where: { status: 'ACTIVE', indexed: true } }),
            prisma.page.count({ where: { status: 'ACTIVE', indexed: false } }),
            prisma.internalLink.count(),
            prisma.page.aggregate({ where: { status: 'ACTIVE' }, _avg: { seo_score: true } }),
            // Score distribution buckets
            Promise.all([
                prisma.page.count({ where: { status: 'ACTIVE', seo_score: { gte: 0, lt: 20 } } }),
                prisma.page.count({ where: { status: 'ACTIVE', seo_score: { gte: 20, lt: 40 } } }),
                prisma.page.count({ where: { status: 'ACTIVE', seo_score: { gte: 40, lt: 60 } } }),
                prisma.page.count({ where: { status: 'ACTIVE', seo_score: { gte: 60, lt: 80 } } }),
                prisma.page.count({ where: { status: 'ACTIVE', seo_score: { gte: 80, lte: 100 } } }),
            ]),
            prisma.crawlSnapshot.findMany({ orderBy: { crawledAt: 'desc' }, take: 10 }),
            // Top 5 lowest scoring pages
            prisma.page.findMany({
                where: { status: 'ACTIVE', seo_score: { lt: 60 } },
                orderBy: { seo_score: 'asc' },
                take: 10,
                select: { id: true, url: true, title: true, seo_score: true, score_reasons: true }
            }),
        ]);

        const pagesWithIssues = await prisma.page.count({
            where: { status: 'ACTIVE', seo_score: { lt: 60 } }
        });

        const thinPages = await prisma.page.count({
            where: { status: 'ACTIVE', word_count: { lt: 300 } }
        });

        res.json({
            success: true,
            data: {
                totalPages,
                indexedPages,
                notIndexedPages,
                totalLinks,
                avgScore: Math.round(avgScoreResult._avg.seo_score || 0),
                pagesWithIssues,
                thinPages,
                scoreDistribution: {
                    '0-19': scoreDistribution[0],
                    '20-39': scoreDistribution[1],
                    '40-59': scoreDistribution[2],
                    '60-79': scoreDistribution[3],
                    '80-100': scoreDistribution[4],
                },
                crawlHistory: recentSnapshots,
                topIssues,
                isCrawling: InternalCrawler.isCrawling(),
            }
        });
    } catch (error: any) {
        logger.error('[SEO Dashboard] Overview failed', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /pages — Paginated pages with scores
 */
router.get('/pages', async (req: Request, res: Response) => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 25);
        const sortBy = (req.query.sortBy as string) || 'seo_score';
        const sortDir = (req.query.sortDir as string) === 'desc' ? 'desc' : 'asc';
        const search = req.query.search as string;
        const minScore = parseInt(req.query.minScore as string) || undefined;
        const maxScore = parseInt(req.query.maxScore as string) || undefined;
        const templateGroup = req.query.templateGroup as string;
        const indexStatus = req.query.indexStatus as string;
        const hasIssues = req.query.hasIssues === 'true';

        const where: any = { status: 'ACTIVE' };

        if (search) {
            where.OR = [
                { url: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (minScore !== undefined) where.seo_score = { ...where.seo_score, gte: minScore };
        if (maxScore !== undefined) where.seo_score = { ...where.seo_score, lte: maxScore };
        if (templateGroup) where.template_group = templateGroup;
        if (indexStatus) where.index_status = indexStatus;
        if (hasIssues) where.seo_score = { lt: 60 };

        const allowedSortFields = ['seo_score', 'word_count', 'click_depth', 'content_length', 'last_crawl_at', 'title', 'views'];
        const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'seo_score';

        const [pages, total] = await Promise.all([
            prisma.page.findMany({
                where,
                orderBy: { [orderField]: sortDir },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    _count: { select: { inlinks: true, outlinks: true } }
                }
            }),
            prisma.page.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                pages,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            }
        });
    } catch (error: any) {
        logger.error('[SEO Dashboard] Pages list failed', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /page/:id — Full page detail
 */
router.get('/page/:id', async (req: Request, res: Response) => {
    try {
        const page = await prisma.page.findUnique({
            where: { id: req.params.id },
            include: {
                inlinks: {
                    include: { fromPage: { select: { id: true, title: true, url: true, seo_score: true } } },
                    take: 50
                },
                outlinks: {
                    include: { toPage: { select: { id: true, title: true, url: true, seo_score: true } } },
                    take: 50
                },
                indexingRequests: { orderBy: { requestedAt: 'desc' }, take: 10 }
            }
        });

        if (!page) return res.status(404).json({ success: false, error: 'Page not found' });

        res.json({ success: true, data: page });
    } catch (error: any) {
        logger.error('[SEO Dashboard] Page detail failed', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /link-graph — Internal link map (nodes + edges)
 */
router.get('/link-graph', async (_req: Request, res: Response) => {
    try {
        const pages = await prisma.page.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, url: true, title: true, seo_score: true, template_group: true }
        });

        const links = await prisma.internalLink.findMany({
            select: { fromPageId: true, toPageId: true, anchorText: true }
        });

        res.json({
            success: true,
            data: {
                nodes: pages.map(p => ({ id: p.id, url: p.url, title: p.title, score: p.seo_score, group: p.template_group })),
                edges: links.map(l => ({ source: l.fromPageId, target: l.toPageId, anchor: l.anchorText }))
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /templates — Programmatic SEO groups
 */
router.get('/templates', async (_req: Request, res: Response) => {
    try {
        const groups = await prisma.page.groupBy({
            by: ['template_group'],
            where: { status: 'ACTIVE', template_group: { not: null } },
            _count: true,
            _avg: { seo_score: true, word_count: true },
        });

        // For each group, get thin page count
        const enriched = await Promise.all(groups.map(async (g) => {
            const thinCount = await prisma.page.count({
                where: { template_group: g.template_group, word_count: { lt: 300 }, status: 'ACTIVE' }
            });
            const pages = await prisma.page.findMany({
                where: { template_group: g.template_group, status: 'ACTIVE' },
                select: { id: true, url: true, title: true, seo_score: true, word_count: true, meta_title: true, meta_description: true },
                orderBy: { seo_score: 'asc' },
                take: 50
            });
            return {
                template: g.template_group,
                count: g._count,
                avgScore: Math.round(g._avg.seo_score || 0),
                avgWordCount: Math.round(g._avg.word_count || 0),
                thinPages: thinCount,
                pages,
            };
        }));

        res.json({ success: true, data: enriched });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /bulk-update — Bulk meta/title updates by template
 */
router.post('/bulk-update', async (req: Request, res: Response) => {
    try {
        const { templateGroup, titlePattern, descriptionPattern } = req.body;
        if (!templateGroup) return res.status(400).json({ success: false, error: 'templateGroup required' });

        const pages = await prisma.page.findMany({
            where: { template_group: templateGroup, status: 'ACTIVE' },
            include: { inlinks: false, outlinks: false }
        });

        let updated = 0;
        for (const page of pages) {
            const data: any = {};

            if (titlePattern) {
                data.meta_title = titlePattern
                    .replace('{title}', page.title || '')
                    .replace('{url}', page.url || '')
                    .substring(0, 60);
            }
            if (descriptionPattern) {
                data.meta_description = descriptionPattern
                    .replace('{title}', page.title || '')
                    .replace('{url}', page.url || '')
                    .substring(0, 160);
            }

            if (Object.keys(data).length > 0) {
                data.last_audit_at = new Date();
                await prisma.page.update({ where: { id: page.id }, data });
                updated++;
            }
        }

        res.json({ success: true, data: { updated, total: pages.length } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /index-request — Queue indexing request
 */
router.post('/index-request', async (req: Request, res: Response) => {
    try {
        const { pageIds } = req.body;
        if (!pageIds || !Array.isArray(pageIds)) {
            return res.status(400).json({ success: false, error: 'pageIds array required' });
        }

        const pages = await prisma.page.findMany({
            where: { id: { in: pageIds } },
            select: { id: true, url: true }
        });

        const requests = await Promise.all(pages.map(page =>
            prisma.indexingRequest.create({
                data: { pageId: page.id, url: page.url, status: 'QUEUED', method: 'MANUAL' }
            })
        ));

        res.json({ success: true, data: { queued: requests.length } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /index-queue — Indexing queue status
 */
router.get('/index-queue', async (req: Request, res: Response) => {
    try {
        const status = req.query.status as string;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, parseInt(req.query.limit as string) || 25);

        const where: any = {};
        if (status) where.status = status;

        const [requests, total, statusCounts] = await Promise.all([
            prisma.indexingRequest.findMany({
                where,
                orderBy: { requestedAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { page: { select: { title: true, seo_score: true } } }
            }),
            prisma.indexingRequest.count({ where }),
            prisma.indexingRequest.groupBy({ by: ['status'], _count: true }),
        ]);

        res.json({
            success: true,
            data: {
                requests,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
                statusCounts: Object.fromEntries(statusCounts.map(s => [s.status, s._count])),
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /crawl — Trigger manual crawl
 */
router.post('/crawl', async (_req: Request, res: Response) => {
    try {
        if (InternalCrawler.isCrawling()) {
            return res.json({ success: false, error: 'Crawl already in progress' });
        }

        // Start crawl in background
        InternalCrawler.crawlAll().catch(err => {
            logger.error('[SEO Dashboard] Background crawl failed', err);
        });

        res.json({ success: true, message: 'Crawl started in background' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /fix/:id — One-click fix for a page
 */
router.post('/fix/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Use existing auto-fix engine
        const fixedPage = await SeoService.autoFixPage(id);

        // Recompute score after fix
        const score = await SeoHealthEngine.recomputeForPage(id);

        res.json({ success: true, data: { page: fixedPage, score } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /crawl-status — Check if crawl is running
 */
router.get('/crawl-status', (_req: Request, res: Response) => {
    res.json({ success: true, data: { isCrawling: InternalCrawler.isCrawling() } });
});

export default router;
