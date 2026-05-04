/**
 * Cron Logger — Audit Trail for Cron Executions
 *
 * Logs every cron scrape execution to the CronLog table
 * and provides query functions for admin panel consumption.
 */

import prisma from "../prisma";
import { logger } from "../utils/logger";

export interface CronLogEntry {
    game: string;
    status: string;
    round1?: string | null;
    round2?: string | null;
    resultDate?: string | null;
    duration: number;
    error?: string | null;
    errorCategory?: string | null;
    details?: Record<string, unknown>;
}

/**
 * Write a cron execution log entry to the database.
 */
export async function writeCronLog(entry: CronLogEntry): Promise<void> {
    try {
        await prisma.cronLog.create({
            data: {
                game: entry.game,
                status: entry.status,
                round1: entry.round1 || null,
                round2: entry.round2 || null,
                resultDate: entry.resultDate || null,
                duration: entry.duration,
                error: entry.error || null,
                errorCategory: entry.errorCategory || null,
                details: entry.details ? JSON.stringify(entry.details) : null,
            },
        });

        const emoji =
            entry.status === "SUCCESS" ? "✅" :
                entry.status === "NO_NEW_DATA" ? "⏳" :
                    entry.status === "FAILED" ? "❌" :
                        entry.status === "SKIPPED_SUNDAY" ? "🛑" : "📋";

        logger.info(
            `[CronLog] ${emoji} ${entry.game} | ${entry.status} | ` +
            `FR: ${entry.round1 || "--"} | SR: ${entry.round2 || "--"} | ` +
            `${entry.duration}ms`
        );
    } catch (err: any) {
        // Never let logging failures crash the cron system
        logger.error("[CronLog] Failed to write log entry", err, { entry });
    }
}

/**
 * Get recent cron logs, optionally filtered by game and/or status.
 */
export async function getRecentCronLogs(options: {
    game?: string;
    status?: string;
    limit?: number;
    offset?: number;
} = {}): Promise<{ logs: any[]; total: number }> {
    const { game, status, limit = 50, offset = 0 } = options;

    const where: any = {};
    if (game) where.game = game;
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
        prisma.cronLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: Math.min(limit, 100),
            skip: offset,
        }),
        prisma.cronLog.count({ where }),
    ]);

    return { logs, total };
}

/**
 * Get the latest successful scrape for a game.
 */
export async function getLastSuccessfulScrape(game: string) {
    return prisma.cronLog.findFirst({
        where: {
            game,
            status: "SUCCESS",
        },
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Clean up old cron logs (keep last N days).
 */
export async function cleanupOldLogs(retainDays: number = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retainDays);

    const { count } = await prisma.cronLog.deleteMany({
        where: {
            createdAt: { lt: cutoff },
        },
    });

    if (count > 0) {
        logger.info(`[CronLog] Cleaned up ${count} old log entries (older than ${retainDays} days)`);
    }

    return count;
}
