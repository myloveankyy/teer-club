/**
 * Generic Live Result Scraper
 * 
 * Orchestrates fetching and parsing of today's results for any given game.
 */

import axios from "axios";
import { logger } from "../utils/logger";
import { getISTNow } from "../config/gameSchedule";
import { extractFromDOM, extractWithRegex } from "./extractorUtils";

const REQUEST_TIMEOUT = 45_000;
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
    const ua = USER_AGENTS[0];
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ userAgent: ua });
    try {
        await page.goto(url, { waitUntil: "networkidle", timeout: REQUEST_TIMEOUT });
        await page.waitForTimeout(5000);
        return await page.content();
    } finally {
        await browser.close();
    }
}

function scoreResult(res: any): number {
    let score = 0;
    [res.round1, res.round2, res.round3].forEach(val => {
        if (!val) return;
        if (/^\d{1,3}$/.test(val)) score += 10;
        else if (val.toUpperCase() === 'XX') score += 1;
    });
    return score;
}

export async function scrapeLiveResult(game: { name: string; liveSourceUrl: string | null }): Promise<ScrapeLiveResult> {
    const startTime = Date.now();
    const { dateStr: todayIST } = getISTNow();

    if (!game.liveSourceUrl) {
        return {
            success: false, status: "FAILED", date: null, round1: null, round2: null, round3: null,
            error: "No liveSourceUrl configured", duration: Date.now() - startTime
        };
    }

    try {
        let html = await fetchHtmlStatic(game.liveSourceUrl);
        let methodUsed = "STATIC";

        const parse = (h: string) => {
            const dom = extractFromDOM(h);
            const reg = extractWithRegex(h);
            return [...dom, ...reg];
        };

        let results = html ? parse(html) : [];
        const hasTodayData = results.some(r => r.date === todayIST && scoreResult(r) > 5);

        // If static failed or returned no real data for today, try DYNAMIC
        if (!html || !hasTodayData) {
            logger.debug(`[LiveScraper] Escalating to Dynamic for ${game.name}`);
            html = await fetchHtmlDynamic(game.liveSourceUrl);
            results = parse(html);
            methodUsed = "DYNAMIC";
        }

        if (results.length === 0) {
            return {
                success: true, status: "NO_NEW_DATA", date: todayIST, round1: null, round2: null, round3: null,
                duration: Date.now() - startTime, details: { method: methodUsed, reason: "No results found" }
            };
        }

        const todayMatches = results.filter(r => r.date === todayIST);
        if (todayMatches.length > 0) {
            todayMatches.sort((a, b) => scoreResult(b) - scoreResult(a));
            const best = todayMatches[0];
            return {
                success: true, status: "SUCCESS", date: todayIST, round1: best.round1, round2: best.round2, round3: best.round3,
                duration: Date.now() - startTime, details: { method: methodUsed, score: scoreResult(best) }
            };
        }

        const bestOverall = [...results].sort((a, b) => scoreResult(b) - scoreResult(a))[0];
        if (!bestOverall.date || bestOverall.date === todayIST) {
            return {
                success: true, status: "SUCCESS", date: todayIST, round1: bestOverall.round1, round2: bestOverall.round2, round3: bestOverall.round3,
                duration: Date.now() - startTime, details: { method: methodUsed, score: scoreResult(bestOverall) }
            };
        }

        return {
            success: true, status: "STALE_DATA", date: bestOverall.date, round1: bestOverall.round1, round2: bestOverall.round2, round3: bestOverall.round3,
            duration: Date.now() - startTime, details: { method: methodUsed, reason: `Found ${bestOverall.date}` }
        };

    } catch (err: any) {
        return {
            success: false, status: "FAILED", date: null, round1: null, round2: null, round3: null,
            error: err.message, duration: Date.now() - startTime
        };
    }
}
