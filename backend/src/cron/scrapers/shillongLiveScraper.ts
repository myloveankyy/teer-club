/**
 * Shillong Teer Live Result Scraper
 *
 * Dedicated, lightweight scraper for https://shillongteerground.com/
 * Extracts today's FR and SR results using Cheerio DOM parsing.
 *
 * Design:
 * - Static fetch first (fast), falls back to dynamic (Playwright) if needed
 * - Validates extracted date matches today's IST date
 * - Returns structured result for the cron scheduler to upsert
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "../../utils/logger";
import { getISTNow, getTodayIST } from "../../config/gameSchedule";
import { normalizeRoundValue } from "../../scrapers/validator";

const SOURCE_URL = "https://shillongteerground.com/";
const REQUEST_TIMEOUT = 20_000;

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
];

export interface ShillongScrapeResult {
    success: boolean;
    status: "SUCCESS" | "NO_NEW_DATA" | "FAILED" | "STALE_DATA";
    date: string | null;       // YYYY-MM-DD
    round1: string | null;
    round2: string | null;
    error?: string;
    duration: number;          // ms
    details?: Record<string, unknown>;
}

// ─── Static Fetch ────────────────────────────────────────────────────────────

async function fetchPageHTML(): Promise<string> {
    const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    // Attempt 1: Static fetch with axios
    try {
        const response = await axios.get(SOURCE_URL, {
            timeout: REQUEST_TIMEOUT,
            headers: {
                "User-Agent": ua,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Cache-Control": "no-cache",
            },
            maxRedirects: 5,
            validateStatus: (status: number) => status < 400,
        });

        if (response.data && typeof response.data === "string" && response.data.length > 500) {
            logger.debug("[ShillongScraper] Static fetch succeeded", {
                length: response.data.length,
            });
            return response.data;
        }
    } catch (err: any) {
        logger.warn("[ShillongScraper] Static fetch failed, trying dynamic", {
            error: err.message,
        });
    }

    // Attempt 2: Dynamic fetch with Playwright
    try {
        const { chromium } = await import("playwright");
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({
            userAgent: ua,
        });

        await page.goto(SOURCE_URL, {
            waitUntil: "domcontentloaded",
            timeout: REQUEST_TIMEOUT,
        });

        // Wait for content to render
        await page.waitForTimeout(3000);

        const html = await page.content();
        await browser.close();

        logger.debug("[ShillongScraper] Dynamic fetch succeeded", {
            length: html.length,
        });
        return html;
    } catch (err: any) {
        throw new Error(`All fetch methods failed. Last error: ${err.message}`);
    }
}

// ─── Parse Results from HTML ─────────────────────────────────────────────────

interface ParsedResult {
    date: string | null;
    round1: string | null;
    round2: string | null;
}

function parseShillongPage(html: string): ParsedResult {
    const $ = cheerio.load(html);

    let extractedDate: string | null = null;
    let round1: string | null = null;
    let round2: string | null = null;

    // ─── Strategy 1: Look for common result page patterns ──────────────────
    // Many teer result sites use a prominent date heading + result display

    // Try to find the date from headings, strong tags, or paragraphs
    const datePatterns = [
        /(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/,
        /(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/,
        /(\d{1,2})\s*(?:st|nd|rd|th)?\s*(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*,?\s*(\d{4})/i,
        /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*(\d{1,2})\s*(?:st|nd|rd|th)?\s*,?\s*(\d{4})/i,
    ];

    const MONTH_MAP: Record<string, string> = {
        jan: "01", january: "01", feb: "02", february: "02",
        mar: "03", march: "03", apr: "04", april: "04",
        may: "05", jun: "06", june: "06", jul: "07", july: "07",
        aug: "08", august: "08", sep: "09", sept: "09", september: "09",
        oct: "10", october: "10", nov: "11", november: "11",
        dec: "12", december: "12",
    };

    // Scan prominent elements for a date
    const dateSearchElements = [
        "h1", "h2", "h3", "h4", ".date", "[class*='date']",
        "p", "strong", "b", "span", "div",
    ];

    for (const selector of dateSearchElements) {
        if (extractedDate) break;
        $(selector).each((_, el) => {
            if (extractedDate) return;
            const text = $(el).text().trim();
            if (!text || text.length > 200) return;

            for (const pattern of datePatterns) {
                const match = text.match(pattern);
                if (!match) continue;

                // Parse the date based on which pattern matched
                let y: string, m: string, d: string;

                if (/^\d{4}/.test(match[1])) {
                    // YYYY-MM-DD
                    y = match[1];
                    m = match[2].padStart(2, "0");
                    d = match[3].padStart(2, "0");
                } else if (/[a-zA-Z]/.test(match[2] || "")) {
                    // DD Month YYYY
                    d = match[1].padStart(2, "0");
                    m = MONTH_MAP[match[2].toLowerCase().substring(0, 3)] || "";
                    y = match[3];
                } else if (/[a-zA-Z]/.test(match[1] || "")) {
                    // Month DD, YYYY
                    m = MONTH_MAP[match[1].toLowerCase().substring(0, 3)] || "";
                    d = match[2].padStart(2, "0");
                    y = match[3];
                } else {
                    // DD-MM-YYYY
                    d = match[1].padStart(2, "0");
                    m = match[2].padStart(2, "0");
                    y = match[3];
                }

                if (y && m && d && parseInt(y) >= 2014 && parseInt(y) <= 2030) {
                    extractedDate = `${y}-${m}-${d}`;
                    break;
                }
            }
        });
    }

    // ─── Strategy 2: Find FR / SR numbers ──────────────────────────────────
    // Look for patterns like "F/R: 42", "First Round: 42", "SR: 78", etc.

    const frPatterns = [
        /(?:F\s*[/\\]\s*R|First\s*Round|FR|1st\s*Round)\s*[:=\-–]?\s*(\d{1,2})\b/i,
        /(?:First\s*Round\s*(?:Result|Number)?)\s*[:=\-–]?\s*(\d{1,2})\b/i,
    ];

    const srPatterns = [
        /(?:S\s*[/\\]\s*R|Second\s*Round|SR|2nd\s*Round)\s*[:=\-–]?\s*(\d{1,2})\b/i,
        /(?:Second\s*Round\s*(?:Result|Number)?)\s*[:=\-–]?\s*(\d{1,2})\b/i,
    ];

    // Get the full body text for regex searching
    const bodyText = $("body").text();

    // Try labeled patterns first
    for (const pattern of frPatterns) {
        const match = bodyText.match(pattern);
        if (match) {
            round1 = match[1].padStart(2, "0");
            break;
        }
    }

    for (const pattern of srPatterns) {
        const match = bodyText.match(pattern);
        if (match) {
            round2 = match[1].padStart(2, "0");
            break;
        }
    }

    // ─── Strategy 3: Table-based extraction ────────────────────────────────
    // Fallback: look for table rows with date + two numbers
    if (!round1 && !round2) {
        $("table tr, table tbody tr").each((_, el) => {
            if (round1 && round2) return;
            const cells = $(el).find("td, th");
            if (cells.length < 3) return;

            const cellTexts = cells.map((_, c) => $(c).text().trim()).get();

            // Check if first cell has a date-like pattern
            const firstCell = cellTexts[0] || "";
            const hasDate = datePatterns.some(p => p.test(firstCell));

            if (hasDate) {
                // Extract 2-digit numbers from subsequent cells
                const r1 = cellTexts[1]?.match(/\b(\d{2})\b/);
                const r2 = cellTexts[2]?.match(/\b(\d{2})\b/);

                if (r1) round1 = r1[1];
                if (r2) round2 = r2[1];

                // Also extract date if we haven't found one yet
                if (!extractedDate) {
                    for (const pattern of datePatterns) {
                        const match = firstCell.match(pattern);
                        if (match) {
                            let y: string, m: string, d: string;
                            if (/^\d{4}/.test(match[1])) {
                                y = match[1];
                                m = match[2].padStart(2, "0");
                                d = match[3].padStart(2, "0");
                            } else {
                                d = match[1].padStart(2, "0");
                                m = match[2].padStart(2, "0");
                                y = match[3];
                            }
                            if (y && m && d) {
                                extractedDate = `${y}-${m}-${d}`;
                                break;
                            }
                        }
                    }
                }
            }
        });
    }

    // ─── Strategy 4: Broad 2-digit number scan near "result" keywords ─────
    if (!round1 && !round2) {
        const resultSection = bodyText.match(
            /(?:result|shillong\s*teer)[\s\S]{0,300}?(\d{2})\D+(\d{2})/i
        );
        if (resultSection) {
            const num1 = parseInt(resultSection[1]);
            const num2 = parseInt(resultSection[2]);
            if (num1 >= 0 && num1 <= 99) round1 = resultSection[1];
            if (num2 >= 0 && num2 <= 99) round2 = resultSection[2];
        }
    }

    // Normalize round values through the existing validator
    round1 = normalizeRoundValue(round1);
    round2 = normalizeRoundValue(round2);

    logger.debug("[ShillongScraper] Parse result", {
        extractedDate,
        round1,
        round2,
        bodyTextLength: bodyText.length,
    });

    return { date: extractedDate, round1, round2 };
}

// ─── Main Scrape Function ────────────────────────────────────────────────────

export async function scrapeShillongLive(): Promise<ShillongScrapeResult> {
    const startTime = Date.now();
    const { dateStr: todayIST } = getISTNow();

    try {
        // Fetch the page HTML
        const html = await fetchPageHTML();

        // Parse results
        const parsed = parseShillongPage(html);
        const duration = Date.now() - startTime;

        // No data found at all
        if (!parsed.round1 && !parsed.round2) {
            return {
                success: true,
                status: "NO_NEW_DATA",
                date: parsed.date,
                round1: null,
                round2: null,
                duration,
                details: {
                    reason: "No round numbers found on page",
                    htmlLength: html.length,
                },
            };
        }

        // Check if extracted date matches today
        if (parsed.date && parsed.date !== todayIST) {
            return {
                success: true,
                status: "STALE_DATA",
                date: parsed.date,
                round1: parsed.round1,
                round2: parsed.round2,
                duration,
                details: {
                    reason: `Page shows ${parsed.date}, expected ${todayIST}`,
                    todayIST,
                },
            };
        }

        // If no date was extracted, we still trust the numbers if the page
        // typically shows current day data and we're in the result window
        const resultDate = parsed.date || todayIST;

        return {
            success: true,
            status: "SUCCESS",
            date: resultDate,
            round1: parsed.round1,
            round2: parsed.round2,
            duration,
            details: {
                dateExplicit: !!parsed.date,
                htmlLength: html.length,
            },
        };
    } catch (err: any) {
        const duration = Date.now() - startTime;
        logger.error("[ShillongScraper] Scrape failed", err);

        return {
            success: false,
            status: "FAILED",
            date: null,
            round1: null,
            round2: null,
            error: err.message,
            duration,
        };
    }
}
