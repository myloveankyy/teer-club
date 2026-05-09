import cron from 'node-cron';
import prisma from '../prisma';
import { logger } from '../utils/logger';
import { IndexingService } from '../services/indexing.service';

/**
 * Background worker to process the Google Indexing queue safely.
 * Runs every 5 minutes to avoid rate limiting and respects the 200/day quota.
 */
export class IndexingWorker {
    private static isProcessing = false;

    static init() {
        // Run every 5 minutes
        cron.schedule('*/5 * * * *', async () => {
            await this.processQueue();
        });
        logger.info("[IndexingWorker] Initialized (Running every 5 minutes)");
    }

    static async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            // Check quota first
            const quota = await IndexingService.getDailyQuotaUsage();
            if (quota.remaining <= 0) {
                logger.warn("[IndexingWorker] Daily quota (200) exhausted. Pausing queue until tomorrow.");
                this.isProcessing = false;
                return;
            }

            // Fetch up to 10 queued items (to process in batches)
            const queuedRequests = await prisma.indexingRequest.findMany({
                where: { status: 'QUEUED' },
                orderBy: { requestedAt: 'asc' },
                take: Math.min(10, quota.remaining)
            });

            if (queuedRequests.length === 0) {
                this.isProcessing = false;
                return;
            }

            logger.info(`[IndexingWorker] Processing ${queuedRequests.length} queued URLs...`);

            for (const req of queuedRequests) {
                try {
                    // Update status to PROCESSING
                    await prisma.indexingRequest.update({
                        where: { id: req.id },
                        data: { status: 'PROCESSING' }
                    });

                    // Submit to Google
                    await IndexingService.submitUrl(req.url, 'URL_UPDATED');

                    // Mark SUCCESS
                    await prisma.indexingRequest.update({
                        where: { id: req.id },
                        data: {
                            status: 'SUCCESS',
                            processedAt: new Date(),
                            error: null
                        }
                    });

                    // Wait 1 second between requests to prevent API spam triggers
                    await new Promise(resolve => setTimeout(resolve, 1000));

                } catch (error: any) {
                    logger.error(`[IndexingWorker] Failed to process URL ${req.url}:`, error.message);
                    
                    // Mark FAILED
                    await prisma.indexingRequest.update({
                        where: { id: req.id },
                        data: {
                            status: 'FAILED',
                            processedAt: new Date(),
                            error: error.message || 'Unknown error'
                        }
                    });
                }
            }

        } catch (error) {
            logger.error("[IndexingWorker] Error in queue processing:", error);
        } finally {
            this.isProcessing = false;
        }
    }
}
