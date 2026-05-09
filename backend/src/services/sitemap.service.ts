import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { logger } from '../utils/logger';
import { IndexingService } from './indexing.service';
import { IndexingWorker } from '../workers/indexingWorker';

const BASE_URL = 'https://teer.club';
// Write to frontend/public since nextjs serves from there
const FRONTEND_PUBLIC = path.join(process.cwd(), '..', 'frontend', 'public');
const SITEMAP_PATH = path.join(FRONTEND_PUBLIC, 'sitemap.xml');
const METADATA_PATH = path.join(FRONTEND_PUBLIC, 'sitemap-metadata.json');

export interface SitemapLogEntry {
    level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN';
    message: string;
    timestamp: string;
}

export interface SitemapDiff {
    added: string[];
    removed: string[];
    unchanged: number;
}

export interface SitemapMetadata {
    lastUpdated: string;
    totalUrls: number;
    previousUrlCount: number;
    newUrlsAdded: number;
    removedUrlsCount: number;
    fileSize: number;
    diff: SitemapDiff;
    logs: SitemapLogEntry[];
    urls: string[];
}

const EMPTY_SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;

export class SitemapService {
    private static isUploading = false;

    /**
     * Pings Google to notify them of a sitemap update.
     */
    static async pingGoogle(): Promise<void> {
        try {
            const sitemapUrl = `${BASE_URL}/sitemap.xml`;
            const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
            await axios.get(pingUrl, { timeout: 5000 });
            logger.info(`[SITEMAP] Successfully pinged Google with new sitemap: ${sitemapUrl}`);
        } catch (error: any) {
            logger.error(`[SITEMAP] Failed to ping Google: ${error.message}`);
        }
    }

    /**
     * Upload and deploy a sitemap.xml from external content.
     * Validates XML, extracts URLs, computes diff, saves to disk.
     */
    static async upload(xmlContent: string): Promise<SitemapMetadata> {
        if (this.isUploading) {
            throw new Error('A sitemap upload is already in progress.');
        }

        this.isUploading = true;
        const logs: SitemapLogEntry[] = [];
        const startTime = Date.now();

        const log = (level: SitemapLogEntry['level'], message: string) => {
            logs.push({ level, message, timestamp: new Date().toISOString() });
            logger.info(`[SITEMAP] [${level}] ${message}`);
        };

        try {
            log('INFO', 'Upload started — validating XML...');

            // ── Validate XML structure ──
            const trimmed = xmlContent.trim();
            if (!trimmed.startsWith('<?xml')) {
                throw new Error('Invalid XML: missing <?xml declaration');
            }
            if (!trimmed.includes('<urlset')) {
                throw new Error('Invalid XML: missing <urlset> root element');
            }
            if (!trimmed.includes('</urlset>')) {
                throw new Error('Invalid XML: missing closing </urlset> tag');
            }

            log('SUCCESS', 'XML structure validated');

            // ── Extract URLs from uploaded content ──
            const newUrls = this.extractUrls(trimmed);
            log('INFO', `Extracted ${newUrls.length} URLs from uploaded sitemap`);

            if (newUrls.length === 0) {
                log('WARN', 'Uploaded sitemap contains 0 URLs — proceeding anyway');
            }

            // ── Load previous URLs for diff ──
            const previousUrls = this.getPreviousUrls();
            const previousUrlCount = previousUrls.size;
            log('INFO', `Previous sitemap had ${previousUrlCount} URLs`);

            // ── Compute diff ──
            const newUrlSet = new Set(newUrls);
            const added = newUrls.filter(u => !previousUrls.has(u));
            const removed = [...previousUrls].filter(u => !newUrlSet.has(u));
            const unchanged = newUrls.length - added.length;

            if (added.length > 0) {
                log('INFO', `+${added.length} new URLs added`);
                // Log first 10 new URLs for visibility
                added.slice(0, 10).forEach(u => log('INFO', `  + ${u}`));
                if (added.length > 10) {
                    log('INFO', `  ... and ${added.length - 10} more`);
                }
            }

            if (removed.length > 0) {
                log('WARN', `${removed.length} URLs removed`);
                removed.slice(0, 10).forEach(u => log('WARN', `  - ${u}`));
                if (removed.length > 10) {
                    log('WARN', `  ... and ${removed.length - 10} more`);
                }
            }

            if (added.length === 0 && removed.length === 0 && previousUrlCount > 0) {
                log('INFO', 'No changes detected — sitemap is identical to previous version');
            }

            // ── Ensure public directory exists ──
            if (!fs.existsSync(FRONTEND_PUBLIC)) {
                fs.mkdirSync(FRONTEND_PUBLIC, { recursive: true });
            }

            // ── Write sitemap to disk ──
            fs.writeFileSync(SITEMAP_PATH, trimmed, 'utf-8');
            const fileSize = Buffer.byteLength(trimmed, 'utf-8');
            log('SUCCESS', `Sitemap saved (${(fileSize / 1024).toFixed(1)} KB)`);

            // ── Save metadata ──
            const durationMs = Date.now() - startTime;
            const diff: SitemapDiff = { added, removed, unchanged };

            const metadata: SitemapMetadata = {
                lastUpdated: new Date().toISOString(),
                totalUrls: newUrls.length,
                previousUrlCount,
                newUrlsAdded: added.length,
                removedUrlsCount: removed.length,
                fileSize,
                diff,
                logs,
                urls: newUrls,
            };

            fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata));

            log('SUCCESS', `Upload complete — ${newUrls.length} URLs deployed in ${durationMs}ms`);

            fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata));

            logger.info(`[SITEMAP] Upload complete. URLs: ${newUrls.length} | New: +${added.length} | Removed: -${removed.length}`);
            
            // Ping Google asynchronously to accelerate indexing
            this.pingGoogle().catch(err => logger.error('[SITEMAP] Ping failed on upload', err));
            
            return metadata;

        } catch (error: any) {
            log('ERROR', `Upload failed: ${error.message}`);
            throw { message: error.message, logs };
        } finally {
            this.isUploading = false;
        }
    }

    /**
     * Extract all <loc> URLs from sitemap XML using regex.
     */
    private static extractUrls(xml: string): string[] {
        const locRegex = /<loc>\s*(.*?)\s*<\/loc>/gi;
        const urls: string[] = [];
        let match;
        while ((match = locRegex.exec(xml)) !== null) {
            const url = match[1].trim();
            if (url && !urls.includes(url)) {
                urls.push(url);
            }
        }
        return urls;
    }

    /**
     * Read the current sitemap XML from disk.
     */
    static readXml(filename: string = 'sitemap.xml'): string {
        const filePath = path.join(FRONTEND_PUBLIC, filename);
        if (fs.existsSync(filePath)) {
            try {
                return fs.readFileSync(filePath, 'utf-8');
            } catch (err) {
                logger.error(`[SITEMAP] Failed to read ${filename}`, err);
            }
        }
        return EMPTY_SITEMAP_XML;
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
     * Load previous URL set from metadata for diff tracking.
     */
    private static getPreviousUrls(): Set<string> {
        const status = this.getStatus();
        if (status?.urls) {
            return new Set(status.urls);
        }
        return new Set();
    }

    /**
     * Auto-generate a sitemap by combining static pages, game pages,
     * dream SEO pages, and number analytics pages. Generates a sitemap index.
     */
    static async generate(prisma: any): Promise<SitemapMetadata> {
        const logs: SitemapLogEntry[] = [];
        const log = (level: SitemapLogEntry['level'], message: string) => {
            logs.push({ level, message, timestamp: new Date().toISOString() });
            logger.info(`[SITEMAP] [${level}] ${message}`);
        };

        log('INFO', 'Auto-generating sitemap indexes...');

        const today = new Date().toISOString().split('T')[0];

        // 1. Static Sitemap
        const staticPages = [
            '/', '/live', '/results', '/common-numbers', '/dreams',
            '/about', '/disclaimer', '/privacy-policy', '/how-to-use',
            '/tools/widget',
        ];
        const staticUrls = staticPages.map(p => `${BASE_URL}${p}`);
        log('INFO', `Generated ${staticPages.length} static pages`);

        // 2. Results & Dreams Sitemap
        const resultsUrls: string[] = [];
        try {
            const games = await prisma.game.findMany({ where: { isEnabled: true } });
            for (const game of games) {
                const name = game.name.toLowerCase();
                resultsUrls.push(`${BASE_URL}/results/${name}`);
                resultsUrls.push(`${BASE_URL}/results/${name}/live`);
            }
        } catch (err) {}

        try {
            const dreams = await prisma.dreamNumber.findMany({ select: { slug: true } });
            for (const dream of dreams) {
                resultsUrls.push(`${BASE_URL}/dreams/${dream.slug}`);
            }
        } catch (err) {}

        // Plus any VIRTUAL templates / Pages created in admin panel
        try {
            const dynamicPages = await prisma.page.findMany({ where: { status: "ACTIVE", type: { not: "TEMPLATE" } } });
            for (const dp of dynamicPages) {
                if (dp.url.startsWith('/')) {
                   resultsUrls.push(`${BASE_URL}${dp.url}`);
                }
            }
        } catch (err) {}
        log('INFO', `Generated ${resultsUrls.length} results/dynamic pages`);

        // 3. Numbers Sitemap (00-99)
        const numbersUrls: string[] = [];
        for (let i = 0; i < 100; i++) {
            const num = String(i).padStart(2, '0');
            numbersUrls.push(`${BASE_URL}/number/${num}`);
        }
        log('INFO', 'Generated 100 number analytics pages');

        // XML-escape special characters in URLs to prevent parser errors
        const escapeXml = (str: string): string => {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

        // Helper to format XML
        const createXml = (urls: string[]) => {
            const urlEntries = urls.map(url => {
                const safeUrl = escapeXml(url);
                const priority = url === BASE_URL + '/' ? '1.0' :
                    url.includes('/live') ? '0.9' :
                    url.includes('/dreams/') ? '0.7' :
                    url.includes('/number/') ? '0.6' : '0.8';
                const changefreq = url.includes('/live') ? 'hourly' :
                    url.includes('/number/') || url.includes('/dreams/') ? 'weekly' : 'daily';
                return `  <url>\n    <loc>${safeUrl}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
            });
            return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>`;
        };

        if (!fs.existsSync(FRONTEND_PUBLIC)) fs.mkdirSync(FRONTEND_PUBLIC, { recursive: true });

        // Write sub-sitemaps
        fs.writeFileSync(path.join(FRONTEND_PUBLIC, 'sitemap-static.xml'), createXml(staticUrls));
        fs.writeFileSync(path.join(FRONTEND_PUBLIC, 'sitemap-results.xml'), createXml(resultsUrls));
        fs.writeFileSync(path.join(FRONTEND_PUBLIC, 'sitemap-numbers.xml'), createXml(numbersUrls));

        // Create Sitemap Index
        const sitemaps = ['sitemap-static.xml', 'sitemap-results.xml', 'sitemap-numbers.xml'];
        const indexEntries = sitemaps.map(sm => `  <sitemap>\n    <loc>${BASE_URL}/${sm}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`);
        const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexEntries.join('\n')}\n</sitemapindex>`;
        
        fs.writeFileSync(SITEMAP_PATH, indexXml);
        
        const allUrls = [...staticUrls, ...resultsUrls, ...numbersUrls];
        log('SUCCESS', `Generated sitemap index with ${allUrls.length} total URLs`);

        // We can optionally use the upload logic to log the diff
        // But since we wrote directly, let's just return metadata for the full flattened list
        const previousUrls = this.getPreviousUrls();
        const newUrlSet = new Set(allUrls);
        const added = allUrls.filter(u => !previousUrls.has(u));
        const removed = [...previousUrls].filter(u => !newUrlSet.has(u));

        const metadata: SitemapMetadata = {
            lastUpdated: new Date().toISOString(),
            totalUrls: allUrls.length,
            previousUrlCount: previousUrls.size,
            newUrlsAdded: added.length,
            removedUrlsCount: removed.length,
            fileSize: Buffer.byteLength(indexXml, 'utf-8'),
            diff: { added, removed, unchanged: allUrls.length - added.length },
            logs,
            urls: allUrls,
        };
        fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata));

        // Ping Google asynchronously to accelerate indexing (Legacy ping)
        this.pingGoogle().catch(err => logger.error('[SITEMAP] Ping failed on generate', err));

        // NEW: Queue newly discovered URLs into the robust Google Indexing API system
        if (added.length > 0) {
            log('INFO', `Queuing ${added.length} new URLs for the Google Indexing API...`);
            // We only queue up to 50 URLs at a time from sitemap to prevent queue flooding
            const toQueue = added.slice(0, 50);
            for (const newUrl of toQueue) {
                try {
                    // Try to find a matching page ID. If none, pass an empty string (the worker/routes handle shadow records)
                    await IndexingService.queueUrl(newUrl, "SITEMAP_AUTO", "AUTO");
                } catch (e) {
                    logger.error(`[SITEMAP] Failed to queue ${newUrl} for Indexing API:`, e);
                }
            }
            // Trigger the worker to start processing
            IndexingWorker.processQueue().catch(e => logger.error('[SITEMAP] Failed to trigger indexing worker:', e));
        }

        return metadata;
    }
}
