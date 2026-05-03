import prisma from '../prisma';
import { logger } from '../utils/logger';
import { SitemapService } from './sitemap.service';

export interface ScoreReason {
    category: 'technical' | 'content' | 'linking' | 'performance';
    issue: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    fix: string;
}

export interface HealthScoreResult {
    seo_score: number;
    score_technical: number;
    score_content: number;
    score_linking: number;
    score_performance: number;
    score_reasons: ScoreReason[];
}

export class SeoHealthEngine {

    /**
     * Compute health score for a page using its crawled data.
     */
    static computeScore(page: {
        url: string;
        meta_title?: string | null;
        meta_description?: string | null;
        h1_count?: number | null;
        h2_count?: number | null;
        content_length?: number | null;
        word_count?: number | null;
        canonical_url?: string | null;
        robots_directive?: string | null;
        indexed?: boolean;
        performance_score?: number | null;
        click_depth?: number | null;
        status?: string;
    }, inlinksCount: number, outlinksCount: number, anchorTexts: string[], inSitemap: boolean, responseTimeMs: number, htmlSizeKb: number): HealthScoreResult {

        const reasons: ScoreReason[] = [];

        // ─── Technical SEO (0-100) ───
        let tech = 100;

        if (page.status !== 'ACTIVE') {
            tech -= 30;
            reasons.push({ category: 'technical', issue: 'Page is not active (may return errors)', impact: 'HIGH', fix: 'Check if the page loads correctly and set status to ACTIVE.' });
        }

        if (!page.canonical_url) {
            tech -= 20;
            reasons.push({ category: 'technical', issue: 'Missing canonical URL', impact: 'MEDIUM', fix: 'Add a <link rel="canonical"> tag to prevent duplicate content issues.' });
        }

        if (page.robots_directive && page.robots_directive.includes('noindex')) {
            tech -= 20;
            reasons.push({ category: 'technical', issue: 'Page is set to noindex', impact: 'HIGH', fix: 'Remove noindex directive if this page should appear in search results.' });
        }

        if (!inSitemap) {
            tech -= 15;
            reasons.push({ category: 'technical', issue: 'Not included in sitemap.xml', impact: 'MEDIUM', fix: 'Regenerate sitemap to include this URL.' });
        }

        if (!page.indexed) {
            tech -= 15;
            reasons.push({ category: 'technical', issue: 'Page marked as not indexed', impact: 'HIGH', fix: 'Toggle indexing to allow search engines to discover this page.' });
        }

        // ─── Content Quality (0-100) ───
        let content = 100;
        const wordCount = page.word_count || page.content_length || 0;

        if (wordCount < 100) {
            content -= 35;
            reasons.push({ category: 'content', issue: `Very thin content (${wordCount} words)`, impact: 'HIGH', fix: 'Add at least 300 words of unique, relevant content.' });
        } else if (wordCount < 300) {
            content -= 20;
            reasons.push({ category: 'content', issue: `Thin content (${wordCount} words)`, impact: 'MEDIUM', fix: 'Increase content to 500+ words for better ranking potential.' });
        }

        const h1 = page.h1_count || 0;
        if (h1 === 0) {
            content -= 20;
            reasons.push({ category: 'content', issue: 'Missing H1 heading', impact: 'HIGH', fix: 'Add exactly one H1 tag that describes the page topic.' });
        } else if (h1 > 1) {
            content -= 10;
            reasons.push({ category: 'content', issue: `Multiple H1 headings (${h1})`, impact: 'MEDIUM', fix: 'Use only one H1. Convert extras to H2 or H3.' });
        }

        if (!page.h2_count || page.h2_count === 0) {
            content -= 10;
            reasons.push({ category: 'content', issue: 'No H2 subheadings', impact: 'LOW', fix: 'Add H2 tags to structure content into scannable sections.' });
        }

        const titleLen = (page.meta_title || '').length;
        if (!page.meta_title || titleLen === 0) {
            content -= 20;
            reasons.push({ category: 'content', issue: 'Missing meta title', impact: 'HIGH', fix: 'Add a descriptive title tag (50-60 characters).' });
        } else if (titleLen < 30 || titleLen > 70) {
            content -= 10;
            reasons.push({ category: 'content', issue: `Meta title length suboptimal (${titleLen} chars)`, impact: 'MEDIUM', fix: 'Aim for 50-60 characters for best SERP display.' });
        }

        const descLen = (page.meta_description || '').length;
        if (!page.meta_description || descLen === 0) {
            content -= 20;
            reasons.push({ category: 'content', issue: 'Missing meta description', impact: 'HIGH', fix: 'Add a compelling description (140-160 characters) to improve CTR.' });
        } else if (descLen < 100 || descLen > 170) {
            content -= 5;
            reasons.push({ category: 'content', issue: `Meta description length suboptimal (${descLen} chars)`, impact: 'LOW', fix: 'Keep between 140-160 characters to avoid truncation.' });
        }

        // ─── Internal Linking (0-100) ───
        let linking = 100;

        if (inlinksCount === 0) {
            linking -= 40;
            reasons.push({ category: 'linking', issue: 'No inbound internal links (orphan page)', impact: 'HIGH', fix: 'Add links from at least 3 relevant pages to this page.' });
        } else if (inlinksCount < 3) {
            linking -= 20;
            reasons.push({ category: 'linking', issue: `Only ${inlinksCount} inbound link(s)`, impact: 'MEDIUM', fix: 'Increase internal links from related pages for better crawl equity.' });
        }

        if (outlinksCount === 0) {
            linking -= 25;
            reasons.push({ category: 'linking', issue: 'No outbound internal links', impact: 'MEDIUM', fix: 'Link to at least 2-3 related pages to pass link equity.' });
        } else if (outlinksCount < 2) {
            linking -= 10;
            reasons.push({ category: 'linking', issue: `Only ${outlinksCount} outbound link(s)`, impact: 'LOW', fix: 'Add more contextual links to related content.' });
        }

        const uniqueAnchors = new Set(anchorTexts.filter(a => a && a.trim())).size;
        if (inlinksCount > 2 && uniqueAnchors <= 1) {
            linking -= 15;
            reasons.push({ category: 'linking', issue: 'Low anchor text diversity', impact: 'LOW', fix: 'Use varied, descriptive anchor text for inbound links.' });
        }

        const depth = page.click_depth || 99;
        if (depth > 4) {
            linking -= 20;
            reasons.push({ category: 'linking', issue: `Deep click depth (${depth} clicks from homepage)`, impact: 'HIGH', fix: 'Add direct links from higher-level pages to reduce depth to ≤3.' });
        } else if (depth > 3) {
            linking -= 10;
            reasons.push({ category: 'linking', issue: `Click depth of ${depth}`, impact: 'MEDIUM', fix: 'Consider linking from navigation or hub pages.' });
        }

        // ─── Performance (0-100) ───
        let perf = 100;

        if (responseTimeMs > 3000) {
            perf -= 40;
            reasons.push({ category: 'performance', issue: `Slow response (${(responseTimeMs / 1000).toFixed(1)}s)`, impact: 'HIGH', fix: 'Optimize server response time. Check for heavy database queries or unoptimized assets.' });
        } else if (responseTimeMs > 2000) {
            perf -= 25;
            reasons.push({ category: 'performance', issue: `Response time ${(responseTimeMs / 1000).toFixed(1)}s`, impact: 'MEDIUM', fix: 'Consider caching or code splitting to improve load time.' });
        } else if (responseTimeMs > 1000) {
            perf -= 10;
            reasons.push({ category: 'performance', issue: `Response time ${(responseTimeMs / 1000).toFixed(1)}s`, impact: 'LOW', fix: 'Response is acceptable but could be faster with CDN caching.' });
        }

        if (htmlSizeKb > 300) {
            perf -= 30;
            reasons.push({ category: 'performance', issue: `Large HTML payload (${htmlSizeKb}KB)`, impact: 'MEDIUM', fix: 'Reduce inline scripts/styles. Consider lazy loading.' });
        } else if (htmlSizeKb > 200) {
            perf -= 15;
            reasons.push({ category: 'performance', issue: `HTML size ${htmlSizeKb}KB`, impact: 'LOW', fix: 'Optimize HTML output. Remove unnecessary whitespace.' });
        }

        // Clamp scores
        const scores = {
            score_technical: Math.max(0, Math.min(100, tech)),
            score_content: Math.max(0, Math.min(100, content)),
            score_linking: Math.max(0, Math.min(100, linking)),
            score_performance: Math.max(0, Math.min(100, perf)),
        };

        // Composite score (weighted average)
        const composite = Math.round(
            scores.score_technical * 0.25 +
            scores.score_content * 0.25 +
            scores.score_linking * 0.25 +
            scores.score_performance * 0.25
        );

        return {
            seo_score: Math.max(0, Math.min(100, composite)),
            ...scores,
            score_reasons: reasons,
        };
    }

    /**
     * Recompute and persist score for a single page by ID.
     */
    static async recomputeForPage(pageId: string): Promise<HealthScoreResult | null> {
        try {
            const page = await prisma.page.findUnique({
                where: { id: pageId },
                include: {
                    inlinks: { select: { anchorText: true } },
                    outlinks: true,
                }
            });
            if (!page) return null;

            const anchorTexts = page.inlinks.map((l: { anchorText: string | null }) => l.anchorText || '');
            const inlinksCount = page.inlinks.length;
            const outlinksCount = page.outlinks.length;

            // Check sitemap
            let inSitemap = false;
            try {
                const xml = SitemapService.readXml();
                inSitemap = xml.includes(page.url);
            } catch { /* no sitemap */ }

            const result = this.computeScore(
                page, inlinksCount, outlinksCount, anchorTexts, inSitemap,
                page.performance_score ? (100 - page.performance_score) * 30 : 500, // estimate
                0 // unknown HTML size
            );

            await prisma.page.update({
                where: { id: pageId },
                data: {
                    seo_score: result.seo_score,
                    score_technical: result.score_technical,
                    score_content: result.score_content,
                    score_linking: result.score_linking,
                    score_performance: result.score_performance,
                    score_reasons: result.score_reasons as any,
                    last_audit_at: new Date(),
                }
            });

            return result;
        } catch (error) {
            logger.error(`[SeoHealthEngine] Failed to recompute score for ${pageId}`, error);
            return null;
        }
    }
}
