import { create } from 'xmlbuilder2';
import prisma from '../prisma';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

const BASE_URL = 'https://teer.club';
const SITEMAP_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');
const METADATA_PATH = path.join(process.cwd(), 'public', 'sitemap-metadata.json');

export interface SitemapMetadata {
    lastUpdated: string;
    totalUrls: number;
    durationMs: number;
}

export class SitemapService {
    private static isGenerating = false;

    /**
     * Generate sitemap.xml from all indexable pages, games, and results.
     */
    static async generate(): Promise<SitemapMetadata | null> {
        if (this.isGenerating) {
            logger.info('[SITEMAP] Already generating, skipping...');
            return null;
        }

        const startTime = Date.now();
        this.isGenerating = true;
        logger.info('[SITEMAP] Starting generation...');

        try {
            // Ensure public directory exists
            const publicDir = path.join(process.cwd(), 'public');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
            }

            const root = create({ version: '1.0', encoding: 'UTF-8' })
                .ele('urlset', { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' });

            let urlCount = 0;
            const processedUrls = new Set<string>();

            // 1. Static & Dynamic Pages from 'Page' model
            const pages = await prisma.page.findMany({
                where: { status: 'ACTIVE', indexed: true }
            });

            for (const page of pages) {
                // Clean URL: trim parts to remove internal spaces like '/results/Khanapara /live'
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

            // 2. Game Landing Pages (Ensure all enabled games are included)
            const games = await prisma.game.findMany({ where: { isEnabled: true } });

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

            // 3. Dynamic Result Pages (/results/[game]/[date])
            // To prevent sitemap from becoming too large, we include results from the last 90 days.
            // A production-grade sitemap usually has a limit (e.g. 50k URLs).
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const results = await prisma.result.findMany({
                where: {
                    date: { gte: ninetyDaysAgo }
                },
                include: { game: true },
                orderBy: { date: 'desc' }
            });

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

            // Finalize XML
            const xml = root.end({ prettyPrint: true });
            fs.writeFileSync(SITEMAP_PATH, xml);

            const durationMs = Date.now() - startTime;
            const metadata: SitemapMetadata = {
                lastUpdated: new Date().toISOString(),
                totalUrls: urlCount,
                durationMs
            };

            fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata));

            logger.info(`[SITEMAP] Generated successfully. URLs: ${urlCount} | Duration: ${durationMs}ms`);
            return metadata;

        } catch (error) {
            logger.error('[SITEMAP] Generation failed', error);
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    private static addUrl(root: any, url: string, lastmod: Date, changefreq: string, priority: string) {
        // Ensure URL starts with / and doesn't have double slashes
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
}
