/**
 * Import Routes — SSE-based data import endpoint
 *
 * Streams real-time progress events to the admin panel
 * via Server-Sent Events during a data import.
 */

import { Router, Request, Response } from "express";
import prisma from "../prisma";
import { runImport, ImportProgress } from "../services/importEngine";
import { logger } from "../utils/logger";

const router = Router();

// Track active imports to prevent duplicate triggers
const activeImports = new Set<string>();

/**
 * GET /api/admin/import/:gameId
 *
 * SSE endpoint that initiates an import and streams progress.
 * Query params:
 *   - url (optional): Override the game's historySourceUrl
 */
router.get("/:gameId", async (req: Request, res: Response) => {
    const { gameId } = req.params;
    const overrideUrl = req.query.url as string | undefined;
    const force = req.query.force === 'true';

    // Prevent duplicate imports for the same game
    if (activeImports.has(gameId)) {
        res.status(409).json({
            success: false,
            error: "An import is already in progress for this game.",
        });
        return;
    }

    let heartbeat: ReturnType<typeof setInterval> | null = null;
    try {
        // Resolve the game and source URL
        const game = await prisma.game.findUnique({ where: { id: gameId } });
        if (!game) {
            res.status(404).json({ success: false, error: "Game not found" });
            return;
        }

        const sourceUrl = overrideUrl || game.historySourceUrl;
        if (!sourceUrl) {
            res.status(400).json({
                success: false,
                error: "No history source URL configured for this game. Please set one in game settings.",
            });
            return;
        }

        // Set up SSE headers + Explicit CORS to bypass proxy interference
        const origin = req.headers.origin as string || "https://admin.teer.club";
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
            "Access-Control-Allow-Credentials": "true",
        });

        // Helper to send SSE events
        const sendEvent = (event: string, data: unknown) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        // Mark as active
        activeImports.add(gameId);

        // Send initial event
        sendEvent("status", {
            phase: "STARTING",
            message: `Starting import for ${game.displayName}…`,
            percentage: 0,
        });

        // Handle client disconnect
        let aborted = false;
        heartbeat = setInterval(() => {
            if (!aborted) {
                try { res.write(": heartbeat\n\n"); } catch { /* connection closed */ }
            }
        }, 15000);

        req.on("close", () => {
            aborted = true;
            if (heartbeat) clearInterval(heartbeat);
            activeImports.delete(gameId);
            logger.info(`[ImportRoute] Client disconnected during import of ${game.displayName}`);
        });

        // Run the import with progress streaming
        const result = await runImport(gameId, sourceUrl, (progress: ImportProgress) => {
            if (aborted) return;
            sendEvent("progress", progress);
        }, force);

        // Send final result
        clearInterval(heartbeat);
        if (!aborted) {
            sendEvent("result", result);
            res.end();
        }

        activeImports.delete(gameId);
    } catch (err: any) {
        if (heartbeat) clearInterval(heartbeat);
        activeImports.delete(gameId);
        logger.error(`[ImportRoute] Import failed for ${gameId}`, err);

        // Try to send error via SSE if connection is still open
        try {
            const errorData = { phase: "ERROR", message: err.message, percentage: 100 };
            res.write(`event: error\ndata: ${JSON.stringify(errorData)}\n\n`);
            res.end();
        } catch {
            // Connection already closed, nothing to do
        }
    }
});

export default router;
