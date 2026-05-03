import prisma from '../prisma';
import { logger } from '../utils/logger';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { SeoHealthEngine } from './seoHealthEngine';
import { SitemapService } from './sitemap.service';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://teer.club';
const MAX_CONCURRENT = 2;
const DELAY_MS = 250;

interface CrawledPage {
    url: string;
    statusCode: number;
    responseTimeMs: number;
    htmlSizeKb: number;
    metaTitle: string | null;
    metaDescription: string | null;
    canonical: string | null;
    robots: string | null;
    h1Count: number;
    h2Count: number;
    wordCount: number;
    internalLinks: { href: string; anchor: string; context: string }[];
}

export class InternalCrawler {
    private static crawling = false;

    static isCrawling() { return this.crawling; }

    /**
     * Crawl all registered pages, build link graph, compute scores.
     */
    static async crawlAll(): Promise<{ totalPages: number; duration: number }> {
        if (this.crawling) {
            logger.warn('[Crawler] Already crawling, skipping...');
            return { totalPages: 0, duration: 0 };
        }

        this.crawling = true;
        const startTime = Date.now();
        logger.info('[Crawler] Starting full site crawl...');

        try {
            // 1. Get all pages from DB
            const pages = await prisma.page.findMany({
                where: { status: 'ACTIVE' },
                select: { id: true, url: true, title: true }
            });

            if (pages.length === 0) {
                logger.warn('[Crawler] No pages to crawl');
                return { totalPages: 0, duration: Date.now() - startTime };
            }

            // Read sitemap once
            let sitemapXml = '';
            try { sitemapXml = SitemapService.readXml(); } catch { /* no sitemap */ }

            // 2. Crawl each page
            const crawledPages: Map<string, CrawledPage> = new Map();
            const batches = this.chunk(pages, MAX_CONCURRENT);

            for (const batch of batches) {
                await Promise.all(batch.map(async (page) => {
                    const result = await this.crawlSinglePage(page.url);
                    if (result) crawledPages.set(page.url, result);
                }));
                await this.delay(DELAY_MS);
            }

            // 3. Clear old internal links
            await prisma.internalLink.deleteMany({});

            // 4. Build link graph
            const urlToPageId = new Map<string, string>();
            for (const p of pages) urlToPageId.set(p.url, p.id);

            for (const [sourceUrl, crawled] of crawledPages) {
                const fromId = urlToPageId.get(sourceUrl);
                if (!fromId) continue;

                for (const link of crawled.internalLinks) {
                    const toId = urlToPageId.get(link.href);
                    if (!toId || toId === fromId) continue;

                    try {
                        await prisma.internalLink.upsert({
                            where: {
                                fromPageId_toPageId_anchorText: {
                                    fromPageId: fromId,
                                    toPageId: toId,
                                    anchorText: (link.anchor || '').substring(0, 200),
                                }
                            },
                            create: {
                                fromPageId: fromId,
                                toPageId: toId,
                                anchorText: (link.anchor || '').substring(0, 200),
                                context: link.context,
                            },
                            update: { crawledAt: new Date(), context: link.context }
                        });
                    } catch {
                        // Skip duplicate constraint errors
                    }
                }
            }

            // 5. Compute click depths via BFS from homepage
            const homePage = pages.find(p => p.url === '/');
            const depths = new Map<string, number>();
            if (homePage) {
                const allLinks = await prisma.internalLink.findMany({
                    select: { fromPageId: true, toPageId: true }
                });

                const adjacency = new Map<string, string[]>();
                for (const link of allLinks) {
                    if (!adjacency.has(link.fromPageId)) adjacency.set(link.fromPageId, []);
                    adjacency.get(link.fromPageId)!.push(link.toPageId);
                }

                const queue = [homePage.id];
                depths.set(homePage.id, 0);

                while (queue.length > 0) {
                    const current = queue.shift()!;
                    const currentDepth = depths.get(current)!;
                    for (const neighbor of (adjacency.get(current) || [])) {
                        if (!depths.has(neighbor)) {
                            depths.set(neighbor, currentDepth + 1);
                            queue.push(neighbor);
                        }
                    }
                }
            }

            // 6. Update pages with crawl data + compute scores
            let pagesWithIssues = 0;
            let thinPages = 0;
            let totalScore = 0;

            for (const page of pages) {
                const crawled = crawledPages.get(page.url);
                const depth = depths.get(page.id) ?? null;

                // Get link counts
                const inlinksCount = await prisma.internalLink.count({ where: { toPageId: page.id } });
                const outlinksCount = await prisma.internalLink.count({ where: { fromPageId: page.id } });
                const anchors = await prisma.internalLink.findMany({
                    where: { toPageId: page.id },
                    select: { anchorText: true }
                });

                const inSitemap = sitemapXml.includes(page.url);

                if (crawled) {
                    const pageData = {
                        url: page.url,
                        meta_title: crawled.metaTitle,
                        meta_description: crawled.metaDescription,
                        h1_count: crawled.h1Count,
                        h2_count: crawled.h2Count,
                        content_length: crawled.wordCount,
                        word_count: crawled.wordCount,
                        canonical_url: crawled.canonical,
                        robots_directive: crawled.robots,
                        indexed: true,
                        performance_score: null,
                        click_depth: depth,
                        status: crawled.statusCode === 200 ? 'ACTIVE' : 'ERROR',
                    };

                    const score = SeoHealthEngine.computeScore(
                        pageData,
                        inlinksCount,
                        outlinksCount,
                        anchors.map((a: { anchorText: string | null }) => a.anchorText || ''),
                        inSitemap,
                        crawled.responseTimeMs,
                        crawled.htmlSizeKb
                    );

                    if (score.score_reasons.length > 0) pagesWithIssues++;
                    if (crawled.wordCount < 300) thinPages++;
                    totalScore += score.seo_score;

                    // Detect template group
                    const templateGroup = this.detectTemplateGroup(page.url);

                    await prisma.page.update({
                        where: { id: page.id },
                        data: {
                            h1_count: crawled.h1Count,
                            h2_count: crawled.h2Count,
                            content_length: crawled.wordCount,
                            word_count: crawled.wordCount,
                            internal_links: outlinksCount,
                            performance_score: Math.max(0, 100 - Math.floor(crawled.responseTimeMs / 30)),
                            canonical_url: crawled.canonical,
                            robots_directive: crawled.robots,
                            meta_title: crawled.metaTitle || undefined,
                            meta_description: crawled.metaDescription || undefined,
                            click_depth: depth,
                            template_group: templateGroup,
                            last_crawl_at: new Date(),
                            seo_score: score.seo_score,
                            score_technical: score.score_technical,
                            score_content: score.score_content,
                            score_linking: score.score_linking,
                            score_performance: score.score_performance,
                            score_reasons: score.score_reasons as any,
                            last_audit_at: new Date(),
                        }
                    });
                } else {
                    // Page couldn't be reached
                    await prisma.page.update({
                        where: { id: page.id },
                        data: {
                            click_depth: depth,
                            seo_score: 0,
                            score_technical: 0,
                            score_content: 0,
                            score_linking: 0,
                            score_performance: 0,
                            score_reasons: [{ category: 'technical', issue: 'Page unreachable during crawl', impact: 'HIGH', fix: 'Check if the page URL is correct and the server is responding.' }] as any,
                            last_crawl_at: new Date(),
                            last_audit_at: new Date(),
                        }
                    });
                    pagesWithIssues++;
                }
            }

            // 7. Store crawl snapshot
            const totalLinks = await prisma.internalLink.count();
            const notIndexed = await prisma.page.count({ where: { indexed: false } });
            const duration = Date.now() - startTime;

            await prisma.crawlSnapshot.create({
                data: {
                    totalPages: pages.length,
                    avgScore: pages.length > 0 ? totalScore / pages.length : 0,
                    pagesWithIssues,
                    thinPages,
                    notIndexed,
                    totalLinks,
                    crawlDuration: duration,
                }
            });

            logger.info(`[Crawler] Crawl complete. ${pages.length} pages, ${totalLinks} links, ${duration}ms`);
            return { totalPages: pages.length, duration };

        } catch (error) {
            logger.error('[Crawler] Crawl failed', error);
            throw error;
        } finally {
            this.crawling = false;
        }
    }

    /**
     * Crawl a single page and extract SEO data.
     */
    private static async crawlSinglePage(url: string): Promise<CrawledPage | null> {
        const fullUrl = url.startsWith('http') ? url : `${FRONTEND_URL}${url}`;
        const start = Date.now();

        try {
            const response = await axios.get(fullUrl, {
                timeout: 15000,
                headers: { 'User-Agent': 'TeerClub-SEO-Crawler/1.0' },
                maxRedirects: 3,
                validateStatus: () => true,
            });

            const responseTimeMs = Date.now() - start;
            const html = typeof response.data === 'string' ? response.data : '';
            const htmlSizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);

            const $ = cheerio.load(html);

            // Extract meta data
            const metaTitle = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || null;
            const metaDescription = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || null;
            const canonical = $('link[rel="canonical"]').attr('href') || null;
            const robotsMeta = $('meta[name="robots"]').attr('content') || null;

            // Headings
            const h1Count = $('h1').length;
            const h2Count = $('h2').length;

            // Word count
            const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
            const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;

            // Internal links
            const internalLinks: { href: string; anchor: string; context: string }[] = [];
            $('a[href]').each((_, el) => {
                const href = $(el).attr('href') || '';
                if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

                // Only internal links
                const isInternal = href.startsWith('/') || href.includes('teer.club');
                if (!isInternal) return;

                let normalizedHref = href;
                if (href.startsWith('http')) {
                    try {
                        const u = new URL(href);
                        normalizedHref = u.pathname;
                    } catch { return; }
                }

                // Remove trailing slash (except root)
                if (normalizedHref !== '/' && normalizedHref.endsWith('/')) {
                    normalizedHref = normalizedHref.slice(0, -1);
                }

                const anchor = $(el).text().trim().substring(0, 200);

                // Detect context
                let context = 'content';
                const parent = $(el).closest('nav, header, footer, aside');
                if (parent.length > 0) {
                    const tag = parent.prop('tagName')?.toLowerCase();
                    if (tag === 'nav' || tag === 'header') context = 'nav';
                    else if (tag === 'footer') context = 'footer';
                    else if (tag === 'aside') context = 'sidebar';
                }

                internalLinks.push({ href: normalizedHref, anchor, context });
            });

            return {
                url,
                statusCode: response.status,
                responseTimeMs,
                htmlSizeKb,
                metaTitle,
                metaDescription,
                canonical,
                robots: robotsMeta,
                h1Count,
                h2Count,
                wordCount,
                internalLinks,
            };
        } catch (error: any) {
            logger.error(`[Crawler] Failed to crawl ${url}: ${error.message}`);
            return null;
        }
    }

    private static detectTemplateGroup(url: string): string | null {
        if (url === '/') return 'homepage';
        if (url.match(/^\/results\/[^/]+\/live$/)) return 'results/{game}/live';
        if (url.match(/^\/results\/[^/]+\/previous-results$/)) return 'results/{game}/previous-results';
        if (url.match(/^\/results\/[^/]+$/)) return 'results/{game}';
        if (url.match(/^\/dream-numbers\/[^/]+$/)) return 'dream-numbers/{slug}';
        if (url.match(/^\/[^/]+\/previous-results$/)) return '{game}/previous-results';
        if (url.match(/^\/common-numbers\/.+$/)) return 'common-numbers/{date}';
        if (url.match(/^\/blogs\/.+$/)) return 'blogs/{slug}';
        // Simple game slug pages
        const staticPaths = ['/', '/about', '/blogs', '/common-numbers', '/dream-numbers', '/live', '/results', '/teer-guide'];
        if (staticPaths.includes(url)) return 'static';
        if (url.match(/^\/[^/]+$/) && !staticPaths.includes(url)) return '{game}';
        return 'other';
    }

    private static chunk<T>(arr: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            result.push(arr.slice(i, i + size));
        }
        return result;
    }

    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
