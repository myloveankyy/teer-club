import prisma from "../prisma";
import { logger } from "../utils/logger";
import axios from "axios";
import * as cheerio from "cheerio";

export interface AuditReport {
    seo_score: number;
    h1_count: number;
    h2_count: number;
    content_length: number;
    internal_links: number;
    performance_score: number;
    issues: string[];
    suggestions: string[];
    meta_title: string | null;
    meta_description: string | null;
}

export class AuditEngine {
    private static FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://teer.club";

    /**
     * Audits a specific page by its ID
     */
    static async auditPage(pageId: string): Promise<AuditReport | null> {
        try {
            const page = await prisma.page.findUnique({ where: { id: pageId } });
            if (!page) return null;

            logger.info(`[AuditEngine] Starting audit for: ${page.url}`);

            const fullUrl = `${this.FRONTEND_URL}${page.url}`;
            const startTime = Date.now();

            let html = "";
            try {
                const response = await axios.get(fullUrl, { timeout: 10000 });
                html = response.data;
            } catch (err: any) {
                logger.error(`[AuditEngine] Failed to fetch page content: ${fullUrl}`, err.message);
                // If fetch fails, we return a basic report with 0 score
                return this.generateErrorReport("Failed to reach page endpoint for auditing.");
            }

            const fetchDuration = Date.now() - startTime;
            const report = this.analyzeHtml(html, page.title);

            // Add performance score based on fetch duration (simplistic)
            report.performance_score = Math.max(0, 100 - Math.floor(fetchDuration / 50));

            // Update page record
            await prisma.page.update({
                where: { id: pageId },
                data: {
                    seo_score: report.seo_score,
                    h1_count: report.h1_count,
                    h2_count: report.h2_count,
                    content_length: report.content_length,
                    internal_links: report.internal_links,
                    performance_score: report.performance_score,
                    audit_results: report as any,
                    last_audit_at: new Date(),
                    last_updated: new Date()
                }
            });

            logger.info(`[AuditEngine] Audit complete for ${page.url}. Score: ${report.seo_score}`);
            return report;
        } catch (error) {
            logger.error(`[AuditEngine] Critical error during audit of ${pageId}`, error);
            return null;
        }
    }

    private static analyzeHtml(html: string, expectedTitle: string): AuditReport {
        const $ = cheerio.load(html);
        const issues: string[] = [];
        const suggestions: string[] = [];
        let score = 100;

        // 1. Meta Title
        const metaTitle = $('title').text() || $('meta[property="og:title"]').attr('content') || null;
        if (!metaTitle) {
            score -= 20;
            issues.push("Missing Meta Title");
            suggestions.push("Add a descriptive <title> tag for better search visibility.");
        } else if (metaTitle.length < 30 || metaTitle.length > 70) {
            score -= 10;
            issues.push(`Sub-optimal Title Length (${metaTitle.length} chars)`);
            suggestions.push("Titles should be between 50-60 characters for best display in SERPs.");
        }

        // 2. Meta Description
        const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || null;
        if (!metaDesc) {
            score -= 20;
            issues.push("Missing Meta Description");
            suggestions.push("A meta description is critical for improving click-through rate from Google.");
        } else if (metaDesc.length < 100 || metaDesc.length > 165) {
            score -= 5;
            issues.push(`Sub-optimal Description Length (${metaDesc?.length || 0} chars)`);
            suggestions.push("Keep descriptions between 140-160 characters to avoid truncation.");
        }

        // 3. Headings
        const h1s = $('h1');
        const h2s = $('h2');
        if (h1s.length === 0) {
            score -= 15;
            issues.push("Missing H1 Heading");
            suggestions.push("Every page must have exactly one H1 tag defining the primary topic.");
        } else if (h1s.length > 1) {
            score -= 10;
            issues.push(`Multiple H1 Headings Found (${h1s.length})`);
            suggestions.push("Use only one H1 tag. Use H2-H6 for sub-sections.");
        }

        if (h2s.length === 0) {
            score -= 10;
            issues.push("No H2 Headings found");
            suggestions.push("Use H2 tags to structure your content and improve readability/SEO.");
        }

        // 4. Content Analysis
        const bodyText = $('body').text();
        const words = bodyText.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        if (wordCount < 300) {
            score -= 15;
            issues.push(`Thin Content (${wordCount} words)`);
            suggestions.push("Increase content length to at least 300-500 words for better ranking.");
        }

        // 5. Internal Links
        const internalLinks = $('a[href^="/"], a[href^="' + this.FRONTEND_URL + '"]').length;
        if (internalLinks < 2) {
            score -= 10;
            issues.push("Poor Internal Linking");
            suggestions.push("Link to other relevant parts of your site to help crawlers and users.");
        }

        return {
            seo_score: Math.max(0, score),
            h1_count: h1s.length,
            h2_count: h2s.length,
            content_length: wordCount,
            internal_links: internalLinks,
            performance_score: 90, // Placeholder, updated in caller
            issues,
            suggestions,
            meta_title: metaTitle,
            meta_description: metaDesc
        };
    }

    private static generateErrorReport(message: string): AuditReport {
        return {
            seo_score: 0,
            h1_count: 0,
            h2_count: 0,
            content_length: 0,
            internal_links: 0,
            performance_score: 0,
            issues: [message],
            suggestions: ["Ensure the frontend server is running and the page is accessible."],
            meta_title: null,
            meta_description: null
        };
    }
}
