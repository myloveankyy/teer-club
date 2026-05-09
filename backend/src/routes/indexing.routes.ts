import { Router } from 'express';
import prisma from '../prisma';
import { IndexingService } from '../services/indexing.service';
import { IndexingWorker } from '../workers/indexingWorker';

const router = Router();

// GET /api/indexing/stats - Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const quota = await IndexingService.getDailyQuotaUsage();

        const totalSubmitted = await prisma.indexingRequest.count();
        const successful = await prisma.indexingRequest.count({ where: { status: 'SUCCESS' } });
        const failed = await prisma.indexingRequest.count({ where: { status: 'FAILED' } });
        const pending = await prisma.indexingRequest.count({ where: { status: 'QUEUED' } });

        const lastSubmitted = await prisma.indexingRequest.findFirst({
            where: { status: 'SUCCESS' },
            orderBy: { processedAt: 'desc' }
        });

        res.json({
            success: true,
            data: {
                quota,
                stats: {
                    totalSubmitted,
                    successful,
                    failed,
                    pending
                },
                lastSubmitted
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/indexing/logs - Get paginated logs
router.get('/logs', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.indexingRequest.findMany({
                orderBy: { requestedAt: 'desc' },
                skip,
                take: limit,
                include: { page: { select: { title: true, type: true } } }
            }),
            prisma.indexingRequest.count()
        ]);

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/indexing/submit - Manually submit URL
router.post('/submit', async (req, res) => {
    try {
        const { url, type = 'URL_UPDATED', priority = false } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, error: "URL is required" });
        }

        // Find or create a shadow page record for tracking if not exists
        let pageRecord = await prisma.page.findUnique({ where: { url } });
        if (!pageRecord) {
             pageRecord = await prisma.page.findFirst({ where: { url: { endsWith: url.replace('https://teer.club', '') } } });
             if (!pageRecord) {
                 return res.status(404).json({ success: false, error: "URL not found in Page database. Cannot index unknown routes." });
             }
        }

        if (priority) {
            // Submit instantly bypassing queue
            const result = await IndexingService.submitUrl(url, type);
            
            await prisma.indexingRequest.create({
                data: {
                    url,
                    pageId: pageRecord.id,
                    method: 'MANUAL_PRIORITY',
                    status: 'SUCCESS',
                    processedAt: new Date()
                }
            });

            return res.json({ success: true, data: result });
        } else {
            // Queue it
            const queued = await IndexingService.queueUrl(url, pageRecord.id, 'MANUAL');
            // Trigger worker
            IndexingWorker.processQueue().catch(console.error);

            return res.json({ success: true, data: queued, message: "Queued successfully" });
        }

    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
