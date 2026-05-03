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
            const publicDir = path.join(process.cwd(), 'public');
            if (!fs.existsSync(publicDir)) {
                fs.mkdirSync(publicDir, { recursive: true });
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

            // Update logs in metadata after final log entry
            metadata.logs = logs;
            fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata));

            logger.info(`[SITEMAP] Upload complete. URLs: ${newUrls.length} | New: +${added.length} | Removed: -${removed.length}`);
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
     * dream SEO pages, and number analytics pages.
     */
    static async generate(prisma: any): Promise<SitemapMetadata> {
        const logs: SitemapLogEntry[] = [];
        const log = (level: SitemapLogEntry['level'], message: string) => {
            logs.push({ level, message, timestamp: new Date().toISOString() });
            logger.info(`[SITEMAP] [${level}] ${message}`);
        };

        log('INFO', 'Auto-generating sitemap...');

        const today = new Date().toISOString().split('T')[0];

        // Static pages
        const staticPages = [
            '/', '/live', '/results', '/common-numbers', '/dreams',
            '/about', '/disclaimer', '/privacy-policy', '/how-to-use',
            '/tools/widget',
        ];

        const urls: string[] = staticPages.map(p => `${BASE_URL}${p}`);
        log('INFO', `Added ${staticPages.length} static pages`);

        // Game pages (live + history)
        try {
            const games = await prisma.game.findMany({ where: { isEnabled: true } });
            for (const game of games) {
                const name = game.name.toLowerCase();
                urls.push(`${BASE_URL}/results/${name}/live`);
                urls.push(`${BASE_URL}/results/${name}/history`);
            }
            log('INFO', `Added ${games.length * 2} game pages`);
        } catch (err) {
            log('WARN', 'Failed to fetch games for sitemap');
        }

        // Dream SEO pages
        try {
            const dreams = await prisma.dreamNumber.findMany({ select: { slug: true } });
            for (const dream of dreams) {
                urls.push(`${BASE_URL}/dreams/${dream.slug}`);
            }
            log('INFO', `Added ${dreams.length} dream SEO pages`);
        } catch (err) {
            log('WARN', 'Failed to fetch dreams for sitemap');
        }

        // Number analytics pages (00-99)
        for (let i = 0; i < 100; i++) {
            const num = String(i).padStart(2, '0');
            urls.push(`${BASE_URL}/number/${num}`);
        }
        log('INFO', 'Added 100 number analytics pages');

        // Build XML
        const urlEntries = urls.map(url => {
            const priority = url === BASE_URL + '/' ? '1.0' :
                url.includes('/live') ? '0.9' :
                url.includes('/dreams/') ? '0.7' :
                url.includes('/number/') ? '0.6' : '0.8';
            const changefreq = url.includes('/live') ? 'hourly' :
                url.includes('/number/') || url.includes('/dreams/') ? 'weekly' : 'daily';
            return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
        });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join('\n')}\n</urlset>`;

        log('SUCCESS', `Generated sitemap with ${urls.length} URLs`);

        // Save via existing upload mechanism
        return await this.upload(xml);
    }
}
