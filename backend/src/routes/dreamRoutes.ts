import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { adminAuth } from "../middleware/adminAuth";
import { logger } from "../utils/logger";

const router = Router();

// 1. Get all dreams (Public - for index pages and sitemaps)
router.get("/", async (req: Request, res: Response) => {
    try {
        const dreams = await prisma.dreamNumber.findMany({
            orderBy: { dream: "asc" }
        });
        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
        res.json({ success: true, data: dreams });
    } catch (error) {
        logger.error("Failed to fetch dreams", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// 2. Get specific dream by slug (Public)
router.get("/:slug", async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const dream = await prisma.dreamNumber.findUnique({
            where: { slug }
        });

        if (!dream) {
            return res.status(404).json({ success: false, error: "Dream not found" });
        }

        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
        res.json({ success: true, data: dream });
    } catch (error) {
        logger.error(`Failed to fetch dream ${req.params.slug}`, error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// 3. Create a new dream (Admin)
router.post("/", adminAuth, async (req: Request, res: Response) => {
    try {
        const { dream, slug, numbers, seoTitle, seoDesc, keywords, bodyText } = req.body;
        
        if (!dream || !slug || !numbers) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
        }

        const newDream = await prisma.dreamNumber.create({
            data: {
                dream: dream.toLowerCase(),
                slug: slug.toLowerCase(),
                numbers,
                seoTitle,
                seoDesc,
                keywords,
                bodyText
            }
        });

        res.json({ success: true, data: newDream });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ success: false, error: "Dream or slug already exists" });
        }
        logger.error("Failed to create dream", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// 4. Update an existing dream (Admin)
router.put("/:id", adminAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { dream, slug, numbers, seoTitle, seoDesc, keywords, bodyText } = req.body;

        const updatedDream = await prisma.dreamNumber.update({
            where: { id },
            data: {
                dream: dream?.toLowerCase(),
                slug: slug?.toLowerCase(),
                numbers,
                seoTitle,
                seoDesc,
                keywords,
                bodyText
            }
        });

        res.json({ success: true, data: updatedDream });
    } catch (error) {
        logger.error(`Failed to update dream ${req.params.id}`, error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// 5. Delete a dream (Admin)
router.delete("/:id", adminAuth, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.dreamNumber.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        logger.error(`Failed to delete dream ${req.params.id}`, error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

// 6. Bulk Migrate existing hardcoded dreams to DB (Admin Utility)
router.post("/migrate", adminAuth, async (req: Request, res: Response) => {
    try {
        const { dreams } = req.body; // Array of { dream: "snake", numbers: ["12", "45"] }
        
        if (!Array.isArray(dreams)) {
            return res.status(400).json({ success: false, error: "Invalid payload format" });
        }

        let createdCount = 0;
        let skippedCount = 0;

        for (const item of dreams) {
            const slug = `${item.dream.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-dream-teer-number`;
            const numbersStr = Array.isArray(item.numbers) ? item.numbers.join(", ") : item.numbers;

            try {
                const defaultTitle = `What does dreaming of a ${item.dream} mean in Teer? Target Numbers`;
                const defaultDesc = `Dreamt of a ${item.dream}? Find the official Shillong and Khanapara Teer target numbers associated with this dream.`;
                const defaultKeywords = `${item.dream} dream meaning teer, ${item.dream} teer number, shillong teer dream numbers`;

                await prisma.dreamNumber.upsert({
                    where: { dream: item.dream.toLowerCase() },
                    update: {}, // Don't overwrite existing
                    create: {
                        dream: item.dream.toLowerCase(),
                        slug,
                        numbers: numbersStr,
                        seoTitle: defaultTitle,
                        seoDesc: defaultDesc,
                        keywords: defaultKeywords,
                        bodyText: `If you dreamed about a **${item.dream}**, the traditional Teer numbers associated with this dream are **${numbersStr}**. Many players use these numbers for today's Shillong or Khanapara Teer target.`
                    }
                });
                createdCount++;
            } catch (err) {
                skippedCount++;
            }
        }

        res.json({ success: true, data: { createdCount, skippedCount } });
    } catch (error) {
        logger.error("Failed bulk migration", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

export default router;
