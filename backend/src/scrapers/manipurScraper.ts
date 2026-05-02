/**
 * Manipur Teer — Isolated Live Scraper
 *
 * Why this exists:
 *   The Manipur source page renders placeholder text "0/0" (or two literal
 *   zeros) when results are not yet declared.  The generic extractor pipeline
 *   normalises "0" → "00" which passes validation (0-99), so the DB silently
 *   stores a false 00/00 result.
 *
 * This module:
 *   1. Re-uses the proven fetchWithFallback → extractFromDOM + extractWithRegex
 *      pipeline so we don't reinvent the wheel.
 *   2. Adds a Manipur-specific post-extraction guard that detects the 00/00
 *      placeholder pattern and rejects it.
 *   3. Emits rich [MANIPUR DEBUG] logs for admin visibility.
 *   4. Retries with escalation (static → Playwright) and back-off.
 *
 * Constraints:
 *   • Does NOT touch any other game's scraping path.
 *   • Called exclusively from liveScraper.ts when game.name === 'manipur'.
 */

import { logger } from "../utils/logger";
import { fetchWithFallback } from "./fetchService";
import { extractFromDOM, extractWithRegex } from "./extractorUtils";
import { deduplicateResults } from "./validator";
import { getISTNow } from "../config/gameSchedule";
import { ScrapeLiveResult } from "./liveScraper";

// ─── Manipur-Specific Guards ─────────────────────────────────────────────────

/**
 * Returns true if the scraped round values look like the well-known
 * Manipur placeholder pattern rather than real results.
 *
 * Known placeholder patterns on source sites:
 *   "0/0", "0 0", "0-0", two individual "0"s parsed as "00"/"00"
 *
 * IMPORTANT: A single "00" CAN be a legitimate result (last-two-digits = 00).
 * We only reject when BOTH rounds are "00" simultaneously — the probability
 * of a real 00/00 result is 1-in-10,000 and never seen in practice.
 */
function isManipurPlaceholder(round1: string | null, round2: string | null): boolean {
    if (!round1 && !round2) return true;

    const r1 = round1?.trim() ?? "";
    const r2 = round2?.trim() ?? "";

    // Both rounds are literal "00" → placeholder
    if (r1 === "00" && r2 === "00") return true;

    // Both rounds are "XX" (already marked unknown by validator) → no data
    if (r1 === "XX" && r2 === "XX") return true;

    return false;
}

/**
 * Check if raw HTML text contains the literal "0/0" placeholder string
 * in a context that looks like a result area (not a date or other number).
 */
function rawTextContainsPlaceholder(text: string): boolean {
    // Collapse whitespace for reliable matching
    const collapsed = text.replace(/\s+/g, " ").trim().toLowerCase();

    const placeholderPatterns = [
        /result[:\s]*0\s*\/\s*0/i,
        /fr[:\s]*0\s*[\/\-]\s*sr[:\s]*0/i,
        /round\s*1[:\s]*0\s*.*round\s*2[:\s]*0/i,
    ];

    return placeholderPatterns.some(p => p.test(collapsed));
}

// ─── Main Entry Point ────────────────────────────────────────────────────────

const MAX_RETRIES = 2;
const RETRY_DELAYS = [3000, 6000]; // escalating back-off

export async function scrapeManipurLive(
    game: { name: string; liveSourceUrl: string | null },
    targetDate?: string
): Promise<ScrapeLiveResult> {
    const startTime = Date.now();
    const { dateStr: todayIST } = getISTNow();
    const effectiveTargetDate = targetDate || todayIST;

    logger.info(`[MANIPUR DEBUG] ─── Scrape Start ───`);
    logger.info(`[MANIPUR DEBUG] Target Date: ${effectiveTargetDate}`);

    if (!game.liveSourceUrl) {
        logger.warn(`[MANIPUR DEBUG] ABORT — No liveSourceUrl configured`);
        return {
            success: false, status: "FAILED",
            date: null, round1: null, round2: null, round3: null,
            error: "No liveSourceUrl configured",
            duration: Date.now() - startTime,
        };
    }

    let lastError = "";

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            const delay = RETRY_DELAYS[attempt - 1] || 6000;
            logger.info(`[MANIPUR DEBUG] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        try {
            // Attempt 0: static fetch.  Attempt 1+: force Playwright.
            const forceDynamic = attempt > 0;

            logger.info(`[MANIPUR DEBUG] Attempt ${attempt + 1} | Method: ${forceDynamic ? "DYNAMIC (Playwright)" : "STATIC (Axios)"}`);

            const fetchResult = await fetchWithFallback(
                game.liveSourceUrl,
                30000,
                forceDynamic
            );

            if (!fetchResult.success || fetchResult.html.length < 200) {
                lastError = `Fetch failed (${fetchResult.error || "empty HTML"})`;
                logger.warn(`[MANIPUR DEBUG] Fetch failed: ${lastError}`);
                continue;
            }

            const html = fetchResult.html;

            // ── Step 1: Check raw HTML for literal placeholder ────────────
            if (rawTextContainsPlaceholder(html)) {
                logger.info(`[MANIPUR DEBUG] Raw HTML contains literal 0/0 placeholder text`);
                // Don't immediately fail — the DOM extractor might still find
                // valid data in a different section.  But log the warning.
            }

            // ── Step 2: Run existing proven extractors ────────────────────
            const domResults = extractFromDOM(html);
            const regexResults = extractWithRegex(html);
            const allResults = deduplicateResults([...domResults, ...regexResults]);

            logger.info(`[MANIPUR DEBUG] Extraction: DOM=${domResults.length} results, Regex=${regexResults.length} results, Merged=${allResults.length}`);

            // ── Step 3: Filter to target date ────────────────────────────
            const todayResults = allResults.filter(r => r.date === effectiveTargetDate);

            if (todayResults.length === 0) {
                logger.info(`[MANIPUR DEBUG] No results matching target date ${effectiveTargetDate}`);
                if (attempt < MAX_RETRIES) continue;

                return {
                    success: true, status: "NO_NEW_DATA",
                    date: effectiveTargetDate, round1: null, round2: null, round3: null,
                    duration: Date.now() - startTime,
                    details: { method: forceDynamic ? "DYNAMIC" : "STATIC", reason: "No date-matched results" },
                };
            }

            // Pick the highest-quality result for today
            const best = todayResults[0]; // already sorted by deduplicateResults (newest first)

            logger.info(`[MANIPUR DEBUG] Best candidate: FR=${best.round1} | SR=${best.round2} | R3=${best.round3}`);

            // ── Step 4: Manipur-specific placeholder guard ───────────────
            if (isManipurPlaceholder(best.round1, best.round2)) {
                logger.warn(`[MANIPUR DEBUG] ⚠️ PLACEHOLDER DETECTED — FR=${best.round1}, SR=${best.round2}`);
                logger.warn(`[MANIPUR DEBUG] Rejecting as NOT SCRAPED (would have saved false 00/00)`);

                if (attempt < MAX_RETRIES) {
                    logger.info(`[MANIPUR DEBUG] Will retry in case source updates soon...`);
                    continue;
                }

                return {
                    success: true, status: "NO_NEW_DATA",
                    date: effectiveTargetDate, round1: null, round2: null, round3: null,
                    duration: Date.now() - startTime,
                    details: {
                        method: forceDynamic ? "DYNAMIC" : "STATIC",
                        reason: "Placeholder 00/00 detected — result not yet declared",
                        rejectedValues: { round1: best.round1, round2: best.round2 },
                    },
                };
            }

            // ── Step 5: Valid result — return SUCCESS ─────────────────────
            logger.info(`[MANIPUR DEBUG] ✅ SUCCESS | FR=${best.round1} | SR=${best.round2}`);
            logger.info(`[MANIPUR DEBUG] ─── Scrape End (${Date.now() - startTime}ms) ───`);

            return {
                success: true, status: "SUCCESS",
                date: effectiveTargetDate,
                round1: best.round1,
                round2: best.round2,
                round3: null, // Manipur has no Round 3
                duration: Date.now() - startTime,
                details: { method: forceDynamic ? "DYNAMIC" : "STATIC", score: 20 },
            };

        } catch (err: any) {
            lastError = err.message;
            logger.error(`[MANIPUR DEBUG] Attempt ${attempt + 1} threw: ${lastError}`);
            if (attempt < MAX_RETRIES) continue;
        }
    }

    // All retries exhausted
    logger.error(`[MANIPUR DEBUG] ❌ ALL ATTEMPTS FAILED | Last Error: ${lastError}`);
    logger.info(`[MANIPUR DEBUG] ─── Scrape End (${Date.now() - startTime}ms) ───`);

    return {
        success: false, status: "FAILED",
        date: null, round1: null, round2: null, round3: null,
        error: lastError,
        duration: Date.now() - startTime,
    };
}
