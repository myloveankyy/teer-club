import { google } from 'googleapis';
import { logger } from '../utils/logger';
import prisma from '../prisma';

const SCOPES = ['https://www.googleapis.com/auth/indexing'];
const BASE_URL = 'https://teer.club';

export class IndexingService {
    private static jwtClient: any;

    private static authError: string | null = null;

    private static async getClient() {
        if (this.jwtClient) return this.jwtClient;

        const email = process.env.GOOGLE_CLIENT_EMAIL;
        let key = process.env.GOOGLE_PRIVATE_KEY;

        if (!email || !key) {
            this.authError = "Missing Google Indexing credentials (GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY).";
            logger.warn(`[IndexingService] ${this.authError}`);
            return null;
        }

        try {
            // Robust parsing: strip quotes if present, replace literal \n with real newlines
            key = key.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

            this.jwtClient = new google.auth.JWT(
                email,
                undefined,
                key,
                SCOPES
            );

            await this.jwtClient.authorize();
            logger.info("[IndexingService] Google Indexing API authenticated successfully.");
            this.authError = null;
            return this.jwtClient;
        } catch (error: any) {
            this.authError = error?.message || "Failed to authenticate Google Indexing API.";
            logger.error("[IndexingService] Failed to authenticate Google Indexing API:", error);
            this.jwtClient = null;
            return null;
        }
    }

    /**
     * Get remaining daily quota estimate (Calculated locally from logs).
     * Google doesn't expose a real-time quota endpoint, so we count
     * successful submissions made today.
     */
    static async getDailyQuotaUsage(): Promise<{ used: number; total: number; remaining: number }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const used = await prisma.indexingRequest.count({
            where: {
                processedAt: { gte: today },
                status: 'SUCCESS'
            }
        });

        const total = 200; // Standard Google Indexing API daily quota
        return { used, total, remaining: Math.max(0, total - used) };
    }

    /**
     * Submits a single URL to the Google Indexing API.
     * Type can be 'URL_UPDATED' or 'URL_DELETED'.
     */
    static async submitUrl(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
        const client = await this.getClient();
        if (!client) {
            throw new Error(`Indexing API not configured or authenticated: ${this.authError || "Unknown error"}`);
        }

        const indexing = google.indexing({ version: 'v3', auth: client });

        const response = await indexing.urlNotifications.publish({
            requestBody: { url, type },
        });

        return response.data;
    }

    /**
     * Resolve a Page record from a full URL.
     * Checks both full URL and path-only variants.
     */
    private static async resolvePageId(url: string): Promise<string | null> {
        // Try exact URL match first
        let page = await prisma.page.findUnique({ where: { url } });
        if (page) return page.id;

        // Try path-only match (strip domain)
        const pathOnly = url.replace(BASE_URL, '');
        if (pathOnly && pathOnly !== url) {
            page = await prisma.page.findUnique({ where: { url: pathOnly } });
            if (page) return page.id;
        }

        // Create shadow page record to ensure URL gets indexed
        try {
            const targetUrl = pathOnly || url;
            const slug = targetUrl.replace(/^\/+/, '').replace(/\//g, '-') || 'home';
            const newPage = await prisma.page.upsert({
                where: { url: targetUrl },
                update: {},
                create: {
                    url: targetUrl,
                    slug: slug,
                    title: `Auto-Discovered Page: ${targetUrl}`,
                    type: 'STATIC',
                    status: 'ACTIVE',
                    indexed: true
                }
            });
            return newPage.id;
        } catch (e) {
            logger.error(`[IndexingService] Failed to create shadow page record for ${url}:`, e);
            return null;
        }
    }

    /**
     * Adds a URL to the indexing queue.
     * Automatically resolves the Page record from the URL.
     * If no matching page exists in the DB, the URL is silently skipped.
     */
    static async queueUrl(url: string, _pageIdOrSource: string = "", method: string = "AUTO") {
        try {
            // Deduplicate: don't queue if already QUEUED or recently submitted
            const existing = await prisma.indexingRequest.findFirst({
                where: { url, status: { in: ['QUEUED', 'PROCESSING'] } }
            });
            if (existing) {
                logger.debug(`[IndexingService] URL already in queue: ${url}`);
                return existing;
            }

            // Also skip if this URL was successfully submitted in the last 24 hours
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentSuccess = await prisma.indexingRequest.findFirst({
                where: { url, status: 'SUCCESS', processedAt: { gte: oneDayAgo } }
            });
            if (recentSuccess) {
                logger.debug(`[IndexingService] URL was submitted <24h ago, skipping: ${url}`);
                return recentSuccess;
            }

            // Resolve the Page record
            const pageId = await this.resolvePageId(url);
            if (!pageId) {
                logger.debug(`[IndexingService] No matching Page record for ${url}, skipping queue.`);
                return null;
            }

            const request = await prisma.indexingRequest.create({
                data: { url, pageId, method, status: 'QUEUED' }
            });

            logger.info(`[IndexingService] Queued URL for indexing: ${url} (method=${method})`);
            return request;
        } catch (error) {
            logger.error(`[IndexingService] Error queuing URL ${url}:`, error);
            return null; // Don't throw — callers shouldn't crash if queuing fails
        }
    }
}
