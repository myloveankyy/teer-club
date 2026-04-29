import { Router } from "express";
import prisma from "../prisma";
import { aggregatePages } from "../services/pageAggregator";
import { AuditEngine } from "../services/auditEngine";

const router = Router();

import { z } from "zod";
import { logger } from "../utils/logger";

const querySchema = z.object({
    page: z.string().optional().transform(v => parseInt(v || "1", 10) || 1),
    limit: z.string().optional().transform(v => parseInt(v || "50", 10) || 50),
    search: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    source: z.string().optional(),
    minScore: z.string().optional().transform(v => parseInt(v || "0", 10)),
    indexStatus: z.string().optional(),
});

const updateSchema = z.object({
    status: z.string().optional(),
    meta_title: z.string().nullable().optional(),
    meta_description: z.string().nullable().optional(),
    indexed: z.boolean().optional(),
    index_status: z.string().optional(),
});

// Get exact page by URL for SEO overrides
router.get("/by-url", async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || typeof url !== "string") {
            return res.status(400).json({ success: false, error: "Missing url parameter" });
        }
        const page = await prisma.page.findUnique({ where: { url } });
        return res.json({ success: true, data: page });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Get all pages with search, filters, and pagination
router.get("/", async (req, res) => {
    try {
        const queryResult = querySchema.safeParse(req.query);
        if (!queryResult.success) {
            return res.status(400).json({ success: false, error: "Invalid query parameters" });
        }
        const { page: pageNum, limit: limitNum, search, status, type, source } = queryResult.data;

        const where: any = {};
        if (search) {
            where.OR = [
                { url: { contains: search, mode: "insensitive" } },
                { title: { contains: search, mode: "insensitive" } },
            ];
        }
        if (status) where.status = status;
        if (type) where.type = type;
        if (source) where.source = source;
        if (queryResult.data.minScore) where.seo_score = { gte: queryResult.data.minScore };
        if (queryResult.data.indexStatus) where.index_status = queryResult.data.indexStatus;

        const [total, pages] = await Promise.all([
            prisma.page.count({ where }),
            prisma.page.findMany({
                where,
                orderBy: { seo_score: "asc" }, // Show problematic pages first by default? or last_updated? 
                // Let's use last_updated for now as per sync requirement, or just url for stability.
                // orderBy: { url: "asc" }, 
                take: limitNum,
                skip: (pageNum - 1) * limitNum,
            }),
        ]);

        return res.json({
            success: true,
            data: {
                pages,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    } catch (error: any) {
        logger.error("[Pages API GET] Error", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Create a page manually (for blogs)
router.post("/", async (req, res) => {
    try {
        let { title, slug, content, url, type, meta_title, meta_description } = req.body;

        // Prevent unique constraint violations
        const existing = await prisma.page.findFirst({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
            url = `/blogs/${slug}`;
        }

        const page = await prisma.page.create({
            data: {
                title,
                slug,
                url: url || `/blogs/${slug}`,
                type: type || "BLOG",
                status: "ACTIVE",
                content,
                meta_title,
                meta_description,
                source: "MANUAL",
            }
        });


        return res.json({ success: true, data: page });
    } catch (error: any) {
        logger.error("[Pages API POST] Error", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Update a page
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = updateSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ success: false, error: "Invalid input", details: result.error.format() });
        }

        const updated = await prisma.page.update({
            where: { id },
            data: result.data,
        });

        return res.json({ success: true, data: updated });
    } catch (error: any) {
        logger.error("[Pages API PUT] Error", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Manually trigger audit for a page
router.post("/:id/audit", async (req, res) => {
    try {
        const { id } = req.params;
        const report = await AuditEngine.auditPage(id);
        if (!report) {
            return res.status(404).json({ success: false, error: "Page not found" });
        }
        return res.json({ success: true, data: report });
    } catch (error: any) {
        logger.error("[Pages API AUDIT] Error", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Sync pages manually
router.post("/sync", async (req, res) => {
    try {
        await aggregatePages();
        return res.json({ success: true, message: "Pages synchronized successfully." });
    } catch (error: any) {
        logger.error("[Pages API SYNC] Error", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
