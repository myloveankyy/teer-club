/**
 * Generic Live Result Scraper
 * 
 * Orchestrates fetching and parsing of today's results for any given game.
 */

import axios from "axios";
import { logger } from "../utils/logger";
import { getISTNow } from "../config/gameSchedule";
import { extractFromDOM, extractWithRegex } from "./extractorUtils";
import { scrapeManipurLive } from "./manipurScraper";

const REQUEST_TIMEOUT = 45_000;

export interface ScrapeLiveResult {
    success: boolean;
    status: "SUCCESS" | "NO_NEW_DATA" | "FAILED" | "STALE_DATA";
    date: string | null;
    round1: string | null;
    round2: string | null;
    round3: string | null;
    error?: string;
    duration: number;
    details?: Record<string, any>;
}

const BACKUP_SOURCES: Record<string, string[]> = {
    "shillong": [
        "https://teerbhutan.com/shillong-teer-result/",
        "https://teercommonnumber.com/shillong-teer-result/"
    ],
    "khanapara": [
        "https://khanapara.com/",
        "https://teercommonnumber.com/khanapara-teer-result/"
    ],
    "juwai": [
        "https://teerbhutan.com/juwai-teer-result/"
    ]
};

function scoreResult(res: any): number {
    let score = 0;
    [res.round1, res.round2, res.round3].forEach(val => {
        if (!val || val === "XX" || val === "--") return;
        if (/^\d{1,3}$/.test(val)) score += 10;
        else if (val.toUpperCase() === 'XX') score += 1;
    });
    return score;
}

export async function scrapeLiveResult(game: { name: string; liveSourceUrl: string | null }, targetDate?: string): Promise<ScrapeLiveResult> {
    const startTime = Date.now();
    const { dateStr: todayIST } = getISTNow();
    const effectiveTargetDate = targetDate || todayIST;

    if (game.name.toLowerCase() === 'manipur') {
        return await scrapeManipurLive(game, targetDate);
    }

    if (!game.liveSourceUrl) {
        logger.warn(`[SCRAPER] [${effectiveTargetDate}] Game: ${game.name} | Status: FAILED | Reason: No liveSourceUrl configured`);
        return {
            success: false, status: "FAILED", date: null, round1: null, round2: null, round3: null,
            error: "No liveSourceUrl configured", duration: Date.now() - startTime
        };
    }

    // Build source array: primary + backups
    const sources = [game.liveSourceUrl];
    const gameKey = game.name.toLowerCase();
    if (BACKUP_SOURCES[gameKey]) {
        for (const backup of BACKUP_SOURCES[gameKey]) {
            if (!sources.includes(backup)) sources.push(backup);
        }
    }

    let lastError = "All sources failed";
    let bestResultAcrossSources: any = null;

    logger.info(`[SCRAPER] [${effectiveTargetDate}] Starting multi-source scrape for ${game.name} using ${sources.length} sources.`);

    for (let i = 0; i < sources.length; i++) {
        const url = sources[i];
        logger.info(`[SCRAPER] [${effectiveTargetDate}] Source ${i + 1}/${sources.length}: Fetching ${url}`);

        try {
            // Lazy load fetchService to ensure browser pool is only required when needed
            const { fetchWithFallback } = await import("./fetchService");
            const fetchRes = await fetchWithFallback(url, REQUEST_TIMEOUT);
            const methodUsed = fetchRes.method || "UNKNOWN";

            if (!fetchRes.success || !fetchRes.html) {
                logger.warn(`[SCRAPER] [${effectiveTargetDate}] [ERROR] Source failed or returned empty HTML: ${url}`);
                lastError = fetchRes.error || "Empty HTML";
                continue; // Try next source
            }

            const parse = (h: string) => {
                const dom = extractFromDOM(h, { gameName: game.name });
                const reg = extractWithRegex(h);
                return [...dom, ...reg];
            };

            const results = parse(fetchRes.html);
            
            if (results.length === 0) {
                logger.warn(`[SCRAPER] [${effectiveTargetDate}] Source ${url} yielded no parseable results.`);
                continue;
            }

            // Evaluate if we found the target date
            const targetMatches = results.filter(r => r.date === effectiveTargetDate);
            if (targetMatches.length > 0) {
                targetMatches.sort((a, b) => scoreResult(b) - scoreResult(a));
                const best = targetMatches[0];
                
                // If it has at least some real data (score > 0), accept it immediately
                if (scoreResult(best) > 0) {
                    logger.info(`[SCRAPER] [${effectiveTargetDate}] SUCCESS from ${url} | FR: ${best.round1} | SR: ${best.round2} | Method: ${methodUsed}`);
                    return {
                        success: true, status: "SUCCESS", date: effectiveTargetDate, 
                        round1: best.round1, round2: best.round2, round3: best.round3,
                        duration: Date.now() - startTime, details: { source: url, method: methodUsed, score: scoreResult(best) }
                    };
                }
            }

            // Keep track of the best overall result in case no source hits the exact target date
            const bestOverall = [...results].sort((a, b) => scoreResult(b) - scoreResult(a))[0];
            if (!bestResultAcrossSources || scoreResult(bestOverall) > scoreResult(bestResultAcrossSources)) {
                bestResultAcrossSources = bestOverall;
                bestResultAcrossSources._methodUsed = methodUsed;
                bestResultAcrossSources._source = url;
            }

        } catch (err: any) {
            logger.error(`[SCRAPER] [ERROR] Source ${url} failed with exception: ${err.message}`);
            lastError = err.message;
        }
    }

    // If we get here, no source had the *exact* target date with valid data.
    if (bestResultAcrossSources) {
        // If the best result we found matches our target date (but had score=0, meaning maybe only "XX" was found)
        if (bestResultAcrossSources.date === effectiveTargetDate) {
            logger.info(`[SCRAPER] [${effectiveTargetDate}] NO_NEW_DATA | Data exists but no valid FR/SR yet. Retrying on next poll.`);
            return {
                success: true, status: "NO_NEW_DATA", date: effectiveTargetDate, 
                round1: null, round2: null, round3: null,
                duration: Date.now() - startTime, details: { reason: "Empty XX rounds found" }
            };
        }

        // Stale Data
        logger.info(`[SCRAPER] [${effectiveTargetDate}] STALE_DATA | Best found date: ${bestResultAcrossSources.date} from ${bestResultAcrossSources._source}`);
        return {
            success: true, status: "STALE_DATA", date: bestResultAcrossSources.date, 
            round1: bestResultAcrossSources.round1, round2: bestResultAcrossSources.round2, round3: bestResultAcrossSources.round3,
            duration: Date.now() - startTime, details: { source: bestResultAcrossSources._source, method: bestResultAcrossSources._methodUsed, reason: `Found ${bestResultAcrossSources.date}` }
        };
    }

    logger.error(`[SCRAPER] [${effectiveTargetDate}] FAILED | Exhausted all sources. Last error: ${lastError}`);
    return {
        success: false, status: "FAILED", date: null, round1: null, round2: null, round3: null,
        error: lastError, duration: Date.now() - startTime
    };
}
