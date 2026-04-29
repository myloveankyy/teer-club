import { create } from 'xmlbuilder2';
import prisma from '../prisma';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const BASE_URL = 'https://teer.club';
const SITEMAP_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');
const METADATA_PATH = path.join(process.cwd(), 'public', 'sitemap-metadata.json');

export interface SitemapLogEntry {
    level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN';
    message: string;
    timestamp: string;
}

export interface SitemapMetadata {
    lastUpdated: string;
    totalUrls: number;
    previousUrlCount: number;
    newUrlsAdded: number;
    removedUrlsCount: number;
    durationMs: number;
    logs: SitemapLogEntry[];
    urls: string[];
}

const EMPTY_SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;

export class SitemapService {
    private static isGenerating = false;

    /**
     * Generate sitemap.xml from all indexable pages, games, and results.
     * Tracks incremental changes vs previous generation.
     */
    static async generate(): Promise<SitemapMetadata | null> {
        if (this.isGenerating) {
            logger.info('[SITEMAP] Already generating, skipping...');
            return null;
        }

        const startTime = Date.now();
        this.isGenerating = true;
        const logs: SitemapLogEntry[] = [];

        const log = (level: SitemapLogEntry['level'], message: string) => {
            logs.push({ level, message, timestamp: new Date().toISOString() });
            if (level === 'ERROR') {
                logger.error(`[SITEMAP] ${message}`);
            } else {
                logger.info(`[SITEMAP] ${message}`);
            }
        };

        log('INFO', 'Generation started');

        try {
            // Ensure public directory exists
            const publicDir = path.join(process.cwd(), 'public');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }

            // Load previous URL list for diff tracking
            const previousUrls = this.getPreviousUrls();
            const previousUrlCount = previousUrls.size;
            log('INFO', `Previous sitemap had ${previousUrlCount} URLs`);

            const root = create({ version: '1.0', encoding: 'UTF-8' })
                .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

            let urlCount = 0;
            const processedUrls = new Set<string>();

            // 1. Static & Dynamic Pages from 'Page' model
            const pages = await prisma.page.findMany({
                where: { status: 'ACTIVE', indexed: true }
            });
            log('INFO', `Fetched ${pages.length} active pages from database`);

            for (const page of pages) {
                const url = page.url.split('/').map(p => p.trim()).join('/');
                if (processedUrls.has(url)) continue;

                const priority = page.type === 'STATIC' && url === '/' ? '1.0' :
                    page.type === 'BLOG' ? '0.7' : '0.8';
                const freq = url === '/' ? 'daily' :
                    page.type === 'BLOG' ? 'weekly' : 'daily';

                this.addUrl(root, url, page.last_updated, freq, priority);
                processedUrls.add(url);
                urlCount++;
            }

            // 2. Game Landing Pages
            const games = await prisma.game.findMany({ where: { isEnabled: true } });
            log('INFO', `Fetched ${games.length} active games`);

            for (const game of games) {
                const gameName = game.name.trim();
                const liveUrl = `/results/${gameName}/live`;
                const resultsUrl = `/results/${gameName}`;

                if (!processedUrls.has(liveUrl)) {
                    this.addUrl(root, liveUrl, game.updatedAt, 'hourly', '0.9');
                    processedUrls.add(liveUrl);
                    urlCount++;
                }
                if (!processedUrls.has(resultsUrl)) {
                    this.addUrl(root, resultsUrl, game.updatedAt, 'daily', '0.8');
                    processedUrls.add(resultsUrl);
                    urlCount++;
                }
            }

            // 3. Dynamic Result Pages (/results/[game]/[date]) — last 90 days
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const results = await prisma.result.findMany({
                where: {
                    date: { gte: ninetyDaysAgo }
                },
                include: { game: true },
                orderBy: { date: 'desc' }
            });
            log('INFO', `Fetched ${results.length} results from last 90 days`);

            for (const result of results) {
                const gameName = result.game.name.trim();
                const dateStr = result.date.toISOString().split('T')[0];
                const url = `/results/${gameName}/${dateStr}`;

                if (!processedUrls.has(url)) {
                    this.addUrl(root, url, result.updatedAt, 'daily', '0.8');
                    processedUrls.add(url);
                    urlCount++;
                }
            }

            // Compute incremental diff
            const newUrlsAdded = [...processedUrls].filter(u => !previousUrls.has(u)).length;
            const removedUrlsCount = [...previousUrls].filter(u => !processedUrls.has(u)).length;

            if (newUrlsAdded > 0) {
                log('INFO', `+${newUrlsAdded} new pages added`);
            }
            if (removedUrlsCount > 0) {
                log('WARN', `${removedUrlsCount} pages removed`);
            }

            // Finalize XML
            const xml = root.end({ prettyPrint: true });
            fs.writeFileSync(SITEMAP_PATH, xml);

            const durationMs = Date.now() - startTime;
            log('SUCCESS', `Sitemap updated — ${urlCount} URLs in ${durationMs}ms`);

            const metadata: SitemapMetadata = {
                lastUpdated: new Date().toISOString(),
                totalUrls: urlCount,
                previousUrlCount,
                newUrlsAdded,
                removedUrlsCount,
                durationMs,
                logs,
                urls: [...processedUrls],
            };

            fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata));

            logger.info(`[SITEMAP] Generated successfully. URLs: ${urlCount} | New: +${newUrlsAdded} | Removed: -${removedUrlsCount} | Duration: ${durationMs}ms`);
            return metadata;

        } catch (error: any) {
            log('ERROR', `Generation failed: ${error.message}`);
            logger.error('[SITEMAP] Generation failed', error);

            // Return logs even on failure so admin UI can display them
            const durationMs = Date.now() - startTime;
            const failedMetadata: SitemapMetadata = {
                lastUpdated: new Date().toISOString(),
                totalUrls: 0,
                previousUrlCount: 0,
                newUrlsAdded: 0,
                removedUrlsCount: 0,
                durationMs,
                logs,
                urls: [],
            };
            throw { message: error.message, metadata: failedMetadata };
        } finally {
            this.isGenerating = false;
        }
    }

    private static addUrl(root: any, url: string, lastmod: Date, changefreq: string, priority: string) {
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        const loc = `${BASE_URL}${cleanUrl}`;

        const node = root.ele('url');
        node.ele('loc').txt(loc);
        node.ele('lastmod').txt(lastmod.toISOString().split('T')[0]);
        node.ele('changefreq').txt(changefreq);
        node.ele('priority').txt(priority);
    }

    /**
     * Get the latest sitemap metadata.
     */
    static getStatus(): SitemapMetadata | null {
        if (fs.existsSync(METADATA_PATH)) {
            try {
                return JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8'));
            } catch (err) {
                return null;
            }
        }
        return null;
    }

    /**
     * Read the current sitemap XML from disk.
     * Returns empty sitemap XML if file doesn't exist.
     */
    static readXml(): string {
        if (fs.existsSync(SITEMAP_PATH)) {
            try {
                return fs.readFileSync(SITEMAP_PATH, 'utf-8');
            } catch (err) {
                logger.error('[SITEMAP] Failed to read sitemap.xml', err);
            }
        }
        return EMPTY_SITEMAP_XML;
    }

    /**
     * Load previous URL set from metadata for diff tracking.
     */
    private static getPreviousUrls(): Set<string> {
        const status = this.getStatus();
        if (status?.urls) {
            return new Set(status.urls);
        }
        return new Set();
    }
}
