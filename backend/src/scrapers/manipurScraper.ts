import * as cheerio from "cheerio";
import { logger } from "../utils/logger";
import { fetchWithFallback } from "./fetchService";
import { getISTNow } from "../config/gameSchedule";
import { ScrapeLiveResult } from "./liveScraper";
import { validateAndCleanResult } from "./validator";

function sanitizeAndExtractNumbers(text: string): { round1: string | null, round2: string | null } {
    // Replace all whitespaces with spaces and trim
    let cleanText = text.replace(/\s+/g, " ").trim();

    // Explicit protection against 0/0 and 00
    if (cleanText === "0/0" || cleanText === "0 0" || cleanText === "0-0" || cleanText === "00") {
        return { round1: null, round2: null };
    }

    // Extract exactly 2 digits if available
    const matches = cleanText.match(/\d{1,2}/g);
    if (!matches) {
        return { round1: null, round2: null };
    }

    let fr = matches[0] || null;
    let sr = matches[1] || null;

    // Protection rule: if it parsed out a literal "0", treat it as invalid
    if (fr === "0" || fr === "00") fr = null;
    if (sr === "0" || sr === "00") sr = null;

    return { round1: fr, round2: sr };
}

export async function scrapeManipurLive(game: { name: string; liveSourceUrl: string | null }, targetDate?: string): Promise<ScrapeLiveResult> {
    const startTime = Date.now();
    const { dateStr: todayIST } = getISTNow();
    const effectiveTargetDate = targetDate || todayIST;

    if (!game.liveSourceUrl) {
        return {
            success: false, status: "FAILED", date: null, round1: null, round2: null, round3: null,
            error: "No liveSourceUrl configured", duration: Date.now() - startTime
        };
    }

    const MAX_RETRIES = 2;
    let lastError = "";

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
        }

        try {
            // Force dynamic render (Playwright) if we fail on attempt 0
            const forceDynamic = attempt > 0;
            const fetchResult = await fetchWithFallback(game.liveSourceUrl, 30000, forceDynamic);

            if (!fetchResult.success) {
                lastError = "Failed to fetch HTML";
                continue;
            }

            const html = fetchResult.html;
            const $ = cheerio.load(html);

            let extractedText = "";
            let selectorUsed = "NONE";

            const selectors = [
                ".result-box", // Primary
                ".teer-result-card", // Fallback 1
                "table tr", // Fallback 2
                ".entry-content", // Fallback 3
                "[class*='manipur']", // Fallback 4
                ".content div" // Last resort
            ];

            for (const sel of selectors) {
                const nodes = $(sel);
                if (nodes.length > 0) {
                    nodes.each((_, el) => {
                        const txt = $(el).text().toLowerCase();
                        // Verify this node is related to manipur and has the date we want.
                        // Or if it's explicitly a Manipur result box.
                        if (txt.includes("manipur") || txt.includes("today") || selectors.indexOf(sel) < 2) {
                            // Combine texts to give us a good window
                            extractedText += " " + $(el).text();
                        }
                    });

                    if (extractedText.length > 10) {
                        selectorUsed = sel;
                        break;
                    }
                }
            }

            // Fallback to full body if specific selectors fail
            if (extractedText.length < 10) {
                extractedText = $("body").text();
                selectorUsed = "body";
            }

            const { round1, round2 } = sanitizeAndExtractNumbers(extractedText);

            // Detailed Debug Logging
            logger.info("[MANIPUR DEBUG] --- Manipur Scrape Report ---");
            logger.info(`[MANIPUR DEBUG] Game: Manipur`);
            logger.info(`[MANIPUR DEBUG] Raw Extracted Text snippet: "${extractedText.substring(0, 100).replace(/\s+/g, ' ')}..."`);
            logger.info(`[MANIPUR DEBUG] Parsed Result: FR: ${round1 || 'NULL'} | SR: ${round2 || 'NULL'}`);
            logger.info(`[MANIPUR DEBUG] Selector Used: ${selectorUsed}`);
            logger.info(`[MANIPUR DEBUG] Fallback Used: ${selectorUsed !== '.result-box' ? 'YES' : 'NO'}`);

            if (round1 || round2) {
                logger.info(`[MANIPUR DEBUG] Final Status: SUCCESS`);
                return {
                    success: true,
                    status: "SUCCESS",
                    date: effectiveTargetDate,
                    round1: round1,
                    round2: round2,
                    round3: null,
                    duration: Date.now() - startTime,
                    details: { method: forceDynamic ? "DYNAMIC" : "STATIC", score: 20 }
                };
            } else {
                logger.info(`[MANIPUR DEBUG] Final Status: FAILED (No valid numbers / default 0 detected)`);
                // If it's literally returning 0/0, it is NOT SCRAPED, we return NO_NEW_DATA
                if (attempt === MAX_RETRIES) {
                    return {
                        success: true,
                        status: "NO_NEW_DATA",
                        date: effectiveTargetDate,
                        round1: null,
                        round2: null,
                        round3: null,
                        duration: Date.now() - startTime,
                        details: { reason: "Parsed result evaluated to NULL/0" }
                    };
                }
            }

        } catch (err: any) {
            lastError = err.message;
            if (attempt === MAX_RETRIES) {
                logger.error(`[MANIPUR DEBUG] Final Status: ERROR - ${lastError}`);
            }
        }
    }

    return {
        success: false, status: "FAILED", date: null, round1: null, round2: null, round3: null,
        error: lastError, duration: Date.now() - startTime
    };
}
