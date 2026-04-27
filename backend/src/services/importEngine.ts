/**
 * Import Engine — Reusable Orchestrator for Game Data Import
 *
 * Wraps the existing hybridEngine in deep-crawl mode and pipes
 * results through smartUpsertBatch for idempotent storage.
 * Accepts a progress callback for real-time SSE streaming.
 */

import prisma from "../prisma";
import { scrapeWithHybrid } from "../scrapers/hybridEngine";
import { smartUpsertBatch } from "./smartUpsert";
import { logger } from "../utils/logger";
import { ScrapeConfig, ParseResult } from "../types/scraper";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ImportProgress {
    phase: "FETCHING" | "PROCESSING" | "SAVING" | "COMPLETE" | "ERROR";
    message: string;
    percentage: number;
    details?: Record<string, unknown>;
}

export interface ImportResult {
    success: boolean;
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
    duration: number;
    method?: string;
    confidence?: string;
}

export type ProgressCallback = (progress: ImportProgress) => void;

// ─── Main Import Function ────────────────────────────────────────────────────

export async function runImport(
    gameId: string,
    sourceUrl: string,
    onProgress: ProgressCallback,
    force: boolean = false
): Promise<ImportResult> {
    const startTime = Date.now();

    try {
        // 1. Validate game exists
        const game = await prisma.game.findUnique({ where: { id: gameId } });
        if (!game) {
            throw new Error(`Game not found: ${gameId}`);
        }

        logger.info(`[ImportEngine] Starting import for ${game.displayName} from ${sourceUrl}`);

        // 2. FETCHING phase — Scrape using hybridEngine in deep mode
        onProgress({
            phase: "FETCHING",
            message: `Fetching data from ${new URL(sourceUrl).hostname}…`,
            percentage: 5,
        });

        const scrapeConfig: ScrapeConfig = {
            url: sourceUrl,
            gameId: game.id,
            gameName: game.name,
            useAI: true,
            timeout: 60000,
            maxPagesLimit: 500,
            chunkSize: 120000,
            stopOnNoNewData: true,
            maxConsecutiveEmpty: 3,
            detectApiEndpoints: true,
            retryCount: 3,
            deep: true,                // CRITICAL: deep mode fetches all historical pages
            cacheEnabled: false,       // Always fetch fresh for imports
        };

        const parseResult: ParseResult = await scrapeWithHybrid(scrapeConfig);

        if (parseResult.results.length === 0) {
            onProgress({
                phase: "ERROR",
                message: "No results found on the source page. The page structure may have changed.",
                percentage: 100,
                details: {
                    logs: parseResult.logs.slice(-5),
                    errors: parseResult.errors,
                },
            });

            return {
                success: false,
                total: 0,
                created: 0,
                updated: 0,
                skipped: 0,
                errors: parseResult.errors.length > 0
                    ? parseResult.errors
                    : ["No results could be extracted from the source URL"],
                duration: Date.now() - startTime,
                method: parseResult.method,
                confidence: parseResult.confidence,
            };
        }

        // 3. PROCESSING phase
        onProgress({
            phase: "PROCESSING",
            message: `Found ${parseResult.results.length} results. Processing entries…`,
            percentage: 40,
            details: {
                method: parseResult.method,
                confidence: parseResult.confidence,
                rawCount: parseResult.rawCount,
            },
        });

        logger.info(`[ImportEngine] Extracted ${parseResult.results.length} results via ${parseResult.method}`);

        // 4. SAVING phase — Upsert in batches
        onProgress({
            phase: "SAVING",
            message: `Saving ${parseResult.results.length} records to database…`,
            percentage: 60,
        });

        const upsertResult = await smartUpsertBatch(game.id, parseResult.results, 50, force);

        // 5. COMPLETE
        const duration = Date.now() - startTime;
        const summary: ImportResult = {
            success: true,
            total: parseResult.results.length,
            created: upsertResult.created,
            updated: upsertResult.updated,
            skipped: upsertResult.skipped,
            errors: upsertResult.errors,
            duration,
            method: parseResult.method,
            confidence: parseResult.confidence,
        };

        onProgress({
            phase: "COMPLETE",
            message: `Import complete! ${upsertResult.created} new, ${upsertResult.updated} updated, ${upsertResult.skipped} skipped.`,
            percentage: 100,
            details: summary as unknown as Record<string, unknown>,
        });

        logger.info(`[ImportEngine] Import complete for ${game.displayName}`, summary);

        return summary;
    } catch (err: any) {
        const duration = Date.now() - startTime;

        logger.error(`[ImportEngine] Import failed for game ${gameId}`, err);

        onProgress({
            phase: "ERROR",
            message: err.message || "Import failed due to an unexpected error.",
            percentage: 100,
        });

        return {
            success: false,
            total: 0,
            created: 0,
            updated: 0,
            skipped: 0,
            errors: [err.message],
            duration,
        };
    }
}
