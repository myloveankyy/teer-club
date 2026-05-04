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

const REQUEST_TIMEOUT = 60_000;
const MAX_LIVE_RETRIES = 2;
const RETRY_DELAYS = [2000, 4000];
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
];

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

async function fetchHtmlStatic(url: string): Promise<string | null> {
    const ua = USER_AGENTS[0];
    try {
        const res = await axios.get(url, {
            timeout: 10000,
            headers: { "User-Agent": ua },
            validateStatus: s => s < 400
        });
        if (res.data && typeof res.data === 'string' && res.data.length > 500) return res.data;
    } catch (e: any) {
        logger.debug(`[LiveScraper] Static fetch failed for ${url}: ${e.message}`);
    }
    return null;
}

async function fetchHtmlDynamic(url: string): Promise<string> {
    // Use the shared fetchDynamic from fetchService which uses the persistent browserPool
    // instead of launching a new Chromium instance every time (prevents OOM crashes)
    const { fetchDynamic } = await import("./fetchService");
    const result = await fetchDynamic(url, REQUEST_TIMEOUT);
    return result.html || "";
}

function scoreResult(res: any): number {
    let score = 0;
    [res.round1, res.round2, res.round3].forEach(val => {
        if (!val || val === "XX" || val === "--") return;
        if (/^\d{1,3}$/.test(val)) score += 10;
        else if (val.toUpperCase() === 'XX') score += 1;
    });
    return score;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function scrapeLiveResult(game: { name: string; liveSourceUrl: string | null }, targetDate?: string): Promise<ScrapeLiveResult> {
    const startTime = Date.now();
    const { dateStr: todayIST } = getISTNow();
    const effectiveTargetDate = targetDate || todayIST;

    if (game.name.toLowerCase() === 'manipur') {
        return await scrapeManipurLive(game, targetDate);
    }

    if (!game.liveSourceUrl) {
        logger.warn(`[SCRAPER] Game: ${game.name} | Status: FAILED | Reason: No liveSourceUrl configured`);
        return {
            success: false, status: "FAILED", date: null, round1: null, round2: null, round3: null,
            error: "No liveSourceUrl configured", duration: Date.now() - startTime
        };
    }

    let lastError = "";

    for (let attempt = 0; attempt <= MAX_LIVE_RETRIES; attempt++) {
        try {
            if (attempt > 0) {
                const delay = RETRY_DELAYS[attempt - 1] || 4000;
                logger.info(`[SCRAPER] Game: ${game.name} | Retry ${attempt}/${MAX_LIVE_RETRIES} after ${delay}ms`);
                await sleep(delay);
            }

            let html = await fetchHtmlStatic(game.liveSourceUrl);
            let methodUsed = "STATIC";

            const parse = (h: string) => {
                const dom = extractFromDOM(h);
                const reg = extractWithRegex(h);
                return [...dom, ...reg];
            };

            let results = html ? parse(html) : [];
            const hasTargetData = results.some(r => r.date === effectiveTargetDate && scoreResult(r) > 5);

            // If static failed or returned no real data for target, try DYNAMIC
            if (!html || !hasTargetData) {
                logger.debug(`[SCRAPER] Game: ${game.name} | Escalating to Playwright (static: ${html ? html.length : 0} bytes, targetData: ${hasTargetData})`);
                html = await fetchHtmlDynamic(game.liveSourceUrl);
                results = parse(html);
                methodUsed = "DYNAMIC";
            }

            if (results.length === 0) {
                if (attempt < MAX_LIVE_RETRIES) continue; // Retry
                logger.info(`[SCRAPER] Game: ${game.name} | Status: NO_NEW_DATA | Method: ${methodUsed}`);
                return {
                    success: true, status: "NO_NEW_DATA", date: effectiveTargetDate, round1: null, round2: null, round3: null,
                    duration: Date.now() - startTime, details: { method: methodUsed, reason: "No results found" }
                };
            }

            const targetMatches = results.filter(r => r.date === effectiveTargetDate);
            if (targetMatches.length > 0) {
                targetMatches.sort((a, b) => scoreResult(b) - scoreResult(a));
                const best = targetMatches[0];
                logger.info(`[SCRAPER] Game: ${game.name} | Status: SUCCESS | FR: ${best.round1} | SR: ${best.round2} | Method: ${methodUsed} | Date: ${effectiveTargetDate}`);
                return {
                    success: true, status: "SUCCESS", date: effectiveTargetDate, round1: best.round1, round2: best.round2, round3: best.round3,
                    duration: Date.now() - startTime, details: { method: methodUsed, score: scoreResult(best) }
                };
            }

            const bestOverall = [...results].sort((a, b) => scoreResult(b) - scoreResult(a))[0];
            if (!bestOverall.date || (targetDate && bestOverall.date === targetDate) || (!targetDate && bestOverall.date === todayIST)) {
                logger.info(`[SCRAPER] Game: ${game.name} | Status: SUCCESS (undated/matched) | FR: ${bestOverall.round1} | SR: ${bestOverall.round2}`);
                return {
                    success: true, status: "SUCCESS", date: effectiveTargetDate, round1: bestOverall.round1, round2: bestOverall.round2, round3: bestOverall.round3,
                    duration: Date.now() - startTime, details: { method: methodUsed, score: scoreResult(bestOverall) }
                };
            }

            logger.info(`[SCRAPER] Game: ${game.name} | Status: STALE_DATA | Found date: ${bestOverall.date} (expected: ${effectiveTargetDate})`);
            return {
                success: true, status: "STALE_DATA", date: bestOverall.date, round1: bestOverall.round1, round2: bestOverall.round2, round3: bestOverall.round3,
                duration: Date.now() - startTime, details: { method: methodUsed, reason: `Found ${bestOverall.date}` }
            };

        } catch (err: any) {
            lastError = err.message;
            logger.warn(`[SCRAPER] Game: ${game.name} | Attempt ${attempt + 1} error: ${err.message}`);
            if (attempt < MAX_LIVE_RETRIES) continue;
        }
    }

    logger.error(`[SCRAPER] Game: ${game.name} | Status: FAILED | Reason: ${lastError} | Attempts: ${MAX_LIVE_RETRIES + 1}`);
    return {
        success: false, status: "FAILED", date: null, round1: null, round2: null, round3: null,
        error: lastError, duration: Date.now() - startTime
    };
}
