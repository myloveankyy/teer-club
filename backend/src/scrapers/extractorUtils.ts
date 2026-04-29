import * as cheerio from "cheerio";
import { TeerResult } from "../types/scraper";
import { normalizeDate, normalizeRoundValue, validateAndCleanResult, deduplicateResults } from "./validator";
import { regexExtract } from "./regexExtractor";
import { logger } from "../utils/logger";

// ─── HTML Cleaner for AI ─────────────────────────────────────────────────────
export function cleanHtmlForAI(html: string): string {
    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, nav, header, footer, aside, .ad, .advertisement, .sidebar, .nav, .menu, .comments, .cookie, [aria-hidden='true']").remove();
    $("[style*='display:none'], [style*='display: none'], [hidden]").remove();

    // Inject structural ASCII table markers so AI understands tabular grids
    $("tr, p, div, li, br, h1, h2, h3, h4, h5, h6").append("\n");
    $("td, th").append(" | ");

    let text = $("body").text() || "";
    // Squash multiple spaces while preserving vertical linebreaks securely
    text = text.replace(/[ \t]+/g, " ");
    text = text.replace(/\n\s*\n/g, "\n");

    return text.trim();
}

// ─── DOM Extraction ──────────────────────────────────────────────────────────
export function extractFromDOM(html: string, config?: { selectors?: any, gameName?: string }): TeerResult[] {
    const results: TeerResult[] = [];
    const seenDates = new Set<string>();
    const $ = cheerio.load(html);

    logger.debug(`[SCRAPER][DOM] HTML Length: ${html.length} | Table count: ${$("table").length} | Game: ${config?.gameName || "unknown"}`);

    // If custom selectors are provided, try them first
    if (config?.selectors && (config.selectors.fr || config.selectors.sr)) {
        const { fr, sr, tr, date, container } = config.selectors;

        // Strategy 1: Targeted Containers
        if (container) {
            $(container).each((_, el) => {
                const dateText = date ? $(el).find(date).text().trim() : "";
                const r1Text = fr ? $(el).find(fr).text().trim() : "";
                const r2Text = sr ? $(el).find(sr).text().trim() : "";
                const r3Text = tr ? $(el).find(tr).text().trim() : null;

                if (r1Text || r2Text) {
                    const normalizedDate = normalizeDate(dateText);
                    const finalDate = normalizedDate || (date ? null : new Date().toISOString().split('T')[0]);

                    if (finalDate) {
                        const res = validateAndCleanResult({
                            date: finalDate,
                            round1: normalizeRoundValue(r1Text),
                            round2: normalizeRoundValue(r2Text),
                            round3: r3Text ? normalizeRoundValue(r3Text) : null,
                            sourceMethod: "DOM_TARGETED"
                        });
                        if (res) results.push(res);
                    }
                }
            });
        }

        // Strategy 2: Direct Selectors (Global)
        if (results.length === 0) {
            const dateText = date ? $(date).first().text().trim() : "";
            const r1Text = fr ? $(fr).first().text().trim() : "";
            const r2Text = sr ? $(sr).first().text().trim() : "";
            const r3Text = tr ? $(tr).first().text().trim() : null;

            if (r1Text || r2Text) {
                const normalizedDate = normalizeDate(dateText);

                // CRITICAL: If date selector was provided but failed, don't just default to today 
                // because it might be pick up "Yesterday" results or footer text.
                // Only default to today if NO date selector was requested.
                const finalDate = normalizedDate || (date ? null : new Date().toISOString().split('T')[0]);

                if (finalDate) {
                    const res = validateAndCleanResult({
                        date: finalDate,
                        round1: normalizeRoundValue(r1Text),
                        round2: normalizeRoundValue(r2Text),
                        round3: r3Text ? normalizeRoundValue(r3Text) : null,
                        sourceMethod: "DOM_DIRECT"
                    });
                    if (res) results.push(res);
                }
            }
        }

        if (results.length > 0) {
            logger.debug(`[SCRAPER][DOM] Targeted selector extraction found ${results.length} results`);
            return deduplicateResults(results);
        }
    }

    // Fallback: Generic Table/Grid Extraction
    const tableSelectors = [
        "#table-data tr",
        "[id*='table'] tr",
        "table tbody tr",
        "table tr",
        "table > tbody > tr",
        ".results-table tr",
        ".teer-results tr",
        "[class*='result'] table tr",
        "div.table tr",
        ".data-table tr",
        "[class*='result'] tr",
        "[id*='result'] tr",
        ".entry-content table tr",
        ".wp-block-table tr",
        ".table-responsive tr",
        ".table-data tr",
    ];

    for (const selector of tableSelectors) {
        $(selector).each((_: number, el: any) => {
            const cells = $(el).find("td, th");
            if (cells.length < 3) return;

            // Strict Section Exclusion: IGNORE Night / Evening / Second Session
            const rowText = $(el).text().toLowerCase();
            const tableText = $(el).closest("table").text().toLowerCase();
            const prevHeading = $(el).closest("table").prevAll("h1, h2, h3, h4, h5, h6").first().text().toLowerCase();

            const isNightResult =
                (rowText.includes("night") && !rowText.includes("day")) ||
                (rowText.includes("evening") && !rowText.includes("day")) ||
                (prevHeading.includes("night") || prevHeading.includes("evening")) ||
                (tableText.includes("night") && tableText.includes("result") && !tableText.includes("day"));

            if (isNightResult) return;

            const dateText = $(cells[0]).text().trim();
            let col1 = $(cells[1]).text().trim();
            let col2 = $(cells[2]).text().trim();
            let col3 = cells.length >= 4 ? $(cells[3]).text().trim() : "";
            let col4 = cells.length >= 5 ? $(cells[4]).text().trim() : "";

            let round1Text: string = col1;
            let round2Text: string = col2;
            let round3Text: string = col3;

            // Handle regional sites (e.g. Bhutan) that inject a "CITY" column as cells[1]
            const isCityColumn = /^(bhutan|shillong|khanapara|juwai|meghalaya)$/i.test(col1.replace(/[^a-z]/ig, ''));
            if (isCityColumn) {
                round1Text = col2;
                round2Text = col3;
                round3Text = col4;
            }

            round1Text = round1Text.replace(/^(day|session|teer|result|today)\s*[:|]\s*/i, "").trim();

            if (round1Text.includes('-') && round1Text.length >= 5) {
                const parts = round1Text.split('-').map(p => p.trim());
                if (parts.length >= 2) {
                    round1Text = parts[0];
                    round2Text = parts[1];
                    if (parts.length >= 3) round3Text = parts[2];
                }
            }

            if (!dateText || dateText.length < 6) return;

            const normalizedDate = normalizeDate(dateText);
            if (!normalizedDate || seenDates.has(normalizedDate)) return;
            seenDates.add(normalizedDate);

            const result = validateAndCleanResult({
                date: normalizedDate,
                round1: normalizeRoundValue(round1Text),
                round2: normalizeRoundValue(round2Text),
                round3: round3Text ? normalizeRoundValue(round3Text) : null,
                sourceMethod: "DOM_GENERIC"
            });
            if (result) results.push(result);
        });
    }

    // ─── Fallback: Div/Card-Based Extraction (for sites like teerbhutan.com) ────
    if (results.length === 0) {
        // Strategy: Look for div-based result cards with date + number patterns
        const cardSelectors = [
            ".result-card", ".result-box", ".result-item",
            "[class*='result']", "[class*='card']",
            ".entry-content div", ".content div",
            ".wp-block-group", ".elementor-widget-container",
        ];

        for (const selector of cardSelectors) {
            $(selector).each((_: number, el: any) => {
                const text = $(el).text().trim();
                if (text.length < 10 || text.length > 1000) return;

                // Try to find a date in the text
                const dateMatch = text.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
                if (!dateMatch) return;

                const normalizedDate = normalizeDate(dateMatch[0]);
                if (!normalizedDate) return;

                // Find 2-digit numbers that could be FR/SR values
                const remainingText = text.replace(dateMatch[0], "");
                const nums = remainingText.match(/\b(\d{2})\b/g);
                if (!nums || nums.length < 1) return;

                // Filter out numbers that are likely part of dates/years
                const validNums = nums.filter(n => {
                    const num = parseInt(n);
                    return num >= 0 && num <= 99;
                });

                if (validNums.length >= 1) {
                    const result = validateAndCleanResult({
                        date: normalizedDate,
                        round1: normalizeRoundValue(validNums[0]),
                        round2: validNums.length > 1 ? normalizeRoundValue(validNums[1]) : null,
                        round3: validNums.length > 2 ? normalizeRoundValue(validNums[2]) : null,
                        sourceMethod: "DOM_CARD"
                    });
                    if (result) results.push(result);
                }
            });

            if (results.length > 0) break;
        }

        if (results.length > 0) {
            logger.debug(`[SCRAPER][DOM] Card/div extraction found ${results.length} results`);
        }
    }

    return deduplicateResults(results);
}

// ─── Regex Processing ────────────────────────────────────────────────────────
export function extractWithRegex(html: string): TeerResult[] {
    const text = cleanHtmlForAI(html);
    return regexExtract(text);
}
