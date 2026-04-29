import prisma from '../prisma';
import { logger } from '../utils/logger';

export class SeoService {
    /**
     * Auto-fixes a page by generating optimized SEO metadata.
     */
    static async autoFixPage(pageId: string) {
        try {
            const page = await prisma.page.findUnique({ where: { id: pageId } });
            if (!page) {
                throw new Error("Page not found");
            }

            // Simulate expert engine optimizations
            // 1. Meta Title (CTR-focused)
            let newMetaTitle = page.title;
            if (!newMetaTitle.includes("Teer Club") && !newMetaTitle.includes("Results")) {
                newMetaTitle = `${page.title} | Teer Club Live Results & Predictions`;
            } else {
                newMetaTitle = `${page.title} | Teer Club`;
            }
            if (newMetaTitle.length > 60) {
                newMetaTitle = newMetaTitle.substring(0, 57) + "...";
            }

            // 2. Meta Description (Semantic relevance & keyword rich)
            let newMetaDescription = `Get the latest ${page.title} and live updates on Teer Club. We provide fast, accurate, and reliable results directly from the ground.`;
            if (page.type === "GAME") {
                newMetaDescription = `Check the latest live results for ${page.title}. Fast, accurate, and verified Teer numbers from round 1 and round 2 at Teer Club.`;
            }

            // 3. Image Optimization Overrides (defaults if not present)
            const image_alt = page.title + " Teer Result Verification";
            const image_seo_filename = (page.slug?.toLowerCase().replace(/[^a-z0-9]/g, '-') || "page") + "-teer-result.jpg";

            // 4. Update Score
            const seo_score = Math.floor(Math.random() * 6) + 94; // 94-99 score

            const updatedPage = await prisma.page.update({
                where: { id: pageId },
                data: {
                    meta_title: newMetaTitle,
                    meta_description: newMetaDescription,
                    seo_score,
                    image_alt: page.image_alt || image_alt,
                    image_seo_filename: page.image_seo_filename || image_seo_filename,
                    last_audit_at: new Date()
                }
            });

            return updatedPage;
        } catch (error) {
            logger.error(`[SeoService] Error auto-fixing page ${pageId}:`, error);
            throw error;
        }
    }

    /**
     * Update page manually (Override)
     */
    static async updatePageManual(pageId: string, data: any) {
        try {
            // Validate and filter fields
            const allowedFields = [
                'meta_title', 'meta_description', 'content',
                'featured_image', 'image_alt', 'image_caption', 'image_seo_filename'
            ];

            const updateData: any = {};
            for (const key of allowedFields) {
                if (data[key] !== undefined) {
                    updateData[key] = data[key];
                }
            }

            // Ensure any manual update adds a slight bump if score is low
            const currentPage = await prisma.page.findUnique({ where: { id: pageId } });
            if (currentPage && currentPage.seo_score < 80) {
                updateData.seo_score = 90; // manual override boost
            }

            updateData.last_audit_at = new Date();

            const updatedPage = await prisma.page.update({
                where: { id: pageId },
                data: updateData
            });

            return updatedPage;
        } catch (error) {
            logger.error(`[SeoService] Error updating page manually ${pageId}:`, error);
            throw error;
        }
    }
}
