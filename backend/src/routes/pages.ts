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

// Get exact page by URL for SEO overrides or fallback to matching template
router.get("/by-url", async (req, res) => {
    try {
        const { url } = req.query;
        if (!url || typeof url !== "string") {
            return res.status(400).json({ success: false, error: "Missing url parameter" });
        }
        
        // 1. Exact Match
        const page = await prisma.page.findUnique({ where: { url } });
        if (page) {
            return res.json({ success: true, data: page });
        }

        // 2. Template Fallback (Regex / Route matching)
        const templates = await prisma.page.findMany({ where: { type: "TEMPLATE" } });
        
        for (const template of templates) {
            // Very simple express-like route matching
            // Convert template url (e.g., /results/:market or /number/:number) to regex
            const regexStr = "^" + template.url.replace(/:[a-zA-Z]+/g, "([^/]+)") + "$";
            const regex = new RegExp(regexStr);
            const match = url.match(regex);
            
            if (match) {
                // Extract param names from template url
                const paramNames = (template.url.match(/:[a-zA-Z]+/g) || []).map(p => p.slice(1));
                const params: Record<string, string> = {};
                paramNames.forEach((name, i) => {
                    params[name] = match[i + 1];
                });

                // Spin / Replace placeholders in template fields
                // Example spintax: {{market}}, {{number}}, {{date}}
                const spin = (text: string | null) => {
                    if (!text) return text;
                    let spun = text;
                    for (const [key, val] of Object.entries(params)) {
                        const search = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                        // uppercase first letter for display
                        const displayVal = val.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                        spun = spun.replace(search, displayVal);
                    }
                    return spun;
                };

                const spunPage = {
                    ...template,
                    id: "virtual-template-match",
                    url: url,
                    type: "VIRTUAL_TEMPLATE",
                    title: spin(template.title) || template.title,
                    meta_title: spin(template.meta_title) || template.meta_title,
                    meta_description: spin(template.meta_description) || template.meta_description,
                    content: spin(template.content) || template.content,
                };

                return res.json({ success: true, data: spunPage });
            }
        }

        return res.json({ success: true, data: null });
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

// Create a page manually (for blogs or templates)
router.post("/", async (req, res) => {
    try {
        let { title, slug, content, url, type, meta_title, meta_description } = req.body;

        // Prevent unique constraint violations
        const existing = await prisma.page.findFirst({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Date.now().toString().slice(-4)}`;
            if (type !== "TEMPLATE") {
               url = `/blogs/${slug}`;
            }
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
