/**
 * Shillong Teer Historical Results Backfill Script
 * 
 * Scrapes ALL historical results from MULTIPLE sources and upserts them
 * into the database. Fully idempotent — safe to re-run without duplicates.
 * 
 * Sources:
 *   1. teerresults.net  — table-based, Jan 2023+
 *   2. teertoday.in     — list-based, goes back to ~2022
 * 
 * Usage:
 *   npx tsx src/scripts/backfillShillong.ts
 *   
 * Can also be imported and invoked programmatically from the admin API:
 *   import { runBackfill } from './scripts/backfillShillong';
 *   const result = await runBackfill();
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { normalizeDate, normalizeRoundValue } from '../scrapers/validator';

const SOURCES = [
    { url: 'https://teerresults.net/shillong-teer-previous-result/', name: 'teerresults.net', type: 'table' as const },
    { url: 'https://teertoday.in/shillong-teer-previous-result/', name: 'teertoday.in', type: 'list' as const },
    { url: 'https://www.assamteerresults.com/shillong-previous-result/', name: 'assamteerresults.com', type: 'table' as const },
];

const GAME_NAME = 'shillong';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// ─── Month Context Parser ────────────────────────────────────────────────────
const MONTH_MAP: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4,
    may: 5, june: 6, july: 7, august: 8,
    september: 9, october: 10, november: 11, december: 12,
};

interface MonthContext {
    month: number;
    year: number;
}

function parseMonthHeading(text: string): MonthContext | null {
    const cleaned = text.replace(/\./g, '').trim().toLowerCase();
    const match = cleaned.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})$/);
    if (!match) return null;

    const month = MONTH_MAP[match[1]];
    const year = parseInt(match[2], 10);
    if (!month || !year) return null;

    return { month, year };
}

// ─── Date Normalization with Month Context ───────────────────────────────────
function normalizeDateWithContext(dateStr: string, context: MonthContext | null): string | null {
    const standard = normalizeDate(dateStr);
    if (standard) return standard;

    if (context) {
        const dayMatch = dateStr.trim().match(/^(\d{1,2})(?:st|nd|rd|th)?$/);
        if (dayMatch) {
            const day = parseInt(dayMatch[1], 10);
            if (day >= 1 && day <= 31) {
                return `${context.year}-${String(context.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
    }

    return null;
}

// ─── HTML Fetcher with Retry ─────────────────────────────────────────────────
async function fetchPage(url: string, sourceName: string): Promise<string> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`📡 [${sourceName}] Fetching (attempt ${attempt}/${MAX_RETRIES})...`);
            const response = await axios.get(url, {
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
                maxRedirects: 5,
            });

            const html = response.data;
            if (typeof html !== 'string' || html.length < 1000) {
                throw new Error(`Response too short: ${html?.length || 0} chars`);
            }

            console.log(`✅ [${sourceName}] Fetched ${html.length.toLocaleString()} chars`);
            return html;
        } catch (err: any) {
            console.error(`❌ [${sourceName}] Attempt ${attempt} failed: ${err.message}`);
            if (attempt < MAX_RETRIES) {
                const delay = RETRY_DELAY_MS * attempt;
                console.log(`⏳ Retrying in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
            } else {
                throw new Error(`[${sourceName}] Failed after ${MAX_RETRIES} attempts: ${err.message}`);
            }
        }
    }
    throw new Error('Unreachable');
}

// ─── Result Interface ────────────────────────────────────────────────────────
interface ExtractedResult {
    date: string;     // YYYY-MM-DD
    round1: string;   // 2-digit number or "XX"
    round2: string;   // 2-digit number or "XX"
}

// ─── Parser: Table-based (teerresults.net) ───────────────────────────────────
function extractFromTables(html: string): ExtractedResult[] {
    const $ = cheerio.load(html);
    const results: ExtractedResult[] = [];
    const seenDates = new Set<string>();
    let currentContext: MonthContext | null = null;

    const tableCount = $('table').length;
    console.log(`  🔍 Found ${tableCount} tables`);

    const contentArea = $('.entry-content, .post-content, article, .content, main, body').first();

    contentArea.find('h1, h2, h3, h4, h5, h6, table').each((_, el) => {
        const tagName = (el as cheerio.TagElement).tagName?.toLowerCase();

        if (tagName && tagName.match(/^h[1-6]$/)) {
            const headingText = $(el).text().trim();
            const ctx = parseMonthHeading(headingText);
            if (ctx) currentContext = ctx;
            return;
        }

        if (tagName === 'table') {
            $(el).find('tr').each((_, row) => {
                const cells = $(row).find('td');
                if (cells.length < 3) return;

                const dateText = $(cells[0]).text().trim();
                const r1Text = $(cells[1]).text().trim();
                const r2Text = $(cells[2]).text().trim();

                if (dateText.toLowerCase().includes('date') ||
                    r1Text.toLowerCase().includes('round') ||
                    r1Text.toLowerCase().includes('f/r') ||
                    r1Text.toLowerCase().includes('fr')) {
                    return;
                }

                const rowTextLower = `${dateText} ${r1Text} ${r2Text}`.toLowerCase();
                if (rowTextLower.includes('holiday') || rowTextLower.includes('sunday off')) return;

                const normalizedDate = normalizeDateWithContext(dateText, currentContext);
                if (!normalizedDate) return;
                if (seenDates.has(normalizedDate)) return;

                const round1 = normalizeRoundValue(r1Text) || 'XX';
                const round2 = normalizeRoundValue(r2Text) || 'XX';

                if (round1 === 'XX' && round2 === 'XX') return;

                seenDates.add(normalizedDate);
                results.push({ date: normalizedDate, round1, round2 });
            });
        }
    });

    return results;
}

// ─── Parser: List-based (teertoday.in) ───────────────────────────────────────
// The page uses <ul><li> structure where data appears in triplets:
//   li[0] = date (DD-MM-YYYY)
//   li[1] = FR value or SUN/OFF
//   li[2] = SR value or DAY/OFF
function extractFromList(html: string): ExtractedResult[] {
    const $ = cheerio.load(html);
    const results: ExtractedResult[] = [];
    const seenDates = new Set<string>();

    // Collect all text values from li elements in occurrence order
    const allValues: string[] = [];
    $('li').each((_, el) => {
        const text = $(el).text().trim();
        if (text) allValues.push(text);
    });

    console.log(`  🔍 Found ${allValues.length} list items`);

    // Also try extracting from div-based grid layouts
    // teertoday.in may use divs with specific classes
    const gridValues: string[] = [];
    $('.teer-result-item, .result-row, .result-cell, .steer_result_listing li, .steer-results li').each((_, el) => {
        const text = $(el).text().trim();
        if (text) gridValues.push(text);
    });

    // Use whichever has more data
    const values = gridValues.length > allValues.length ? gridValues : allValues;

    // Date pattern: DD-MM-YYYY or DD/MM/YYYY
    const datePattern = /^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/;

    // Walk through values looking for date-value-value triplets
    for (let i = 0; i < values.length; i++) {
        const val = values[i].trim();

        if (!datePattern.test(val)) continue;

        const normalizedDate = normalizeDate(val);
        if (!normalizedDate) continue;
        if (seenDates.has(normalizedDate)) continue;

        // Next two values should be FR and SR
        const r1Raw = (i + 1 < values.length) ? values[i + 1].trim() : '';
        const r2Raw = (i + 2 < values.length) ? values[i + 2].trim() : '';

        // Skip OFF/SUN/DAY/HOLIDAY entries
        const skip = ['sun', 'day', 'off', 'holiday', 'sunday', 'closed'];
        if (skip.includes(r1Raw.toLowerCase()) || skip.includes(r2Raw.toLowerCase())) {
            i += 2; // Skip past this triplet
            continue;
        }

        const round1 = normalizeRoundValue(r1Raw) || 'XX';
        const round2 = normalizeRoundValue(r2Raw) || 'XX';

        if (round1 === 'XX' && round2 === 'XX') {
            continue;
        }

        seenDates.add(normalizedDate);
        results.push({ date: normalizedDate, round1, round2 });
        i += 2; // Skip past this triplet
    }

    return results;
}

// ─── Merge Results from Multiple Sources ─────────────────────────────────────
function mergeResults(allResults: ExtractedResult[][]): ExtractedResult[] {
    const merged = new Map<string, ExtractedResult>();

    for (const results of allResults) {
        for (const result of results) {
            const existing = merged.get(result.date);
            if (!existing) {
                merged.set(result.date, result);
            } else {
                // Prefer real values over XX
                const r1 = (result.round1 !== 'XX') ? result.round1 : existing.round1;
                const r2 = (result.round2 !== 'XX') ? result.round2 : existing.round2;
                merged.set(result.date, { date: result.date, round1: r1, round2: r2 });
            }
        }
    }

    return Array.from(merged.values()).sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Database Upsert ─────────────────────────────────────────────────────────
export interface BackfillResult {
    success: boolean;
    inserted: number;
    updated: number;
    skipped: number;
    errors: number;
    errorDetails: string[];
    totalExtracted: number;
    duration: number;
    dateRange: { from: string; to: string } | null;
}

export async function runBackfill(prisma?: PrismaClient): Promise<BackfillResult> {
    const startTime = Date.now();
    const ownPrisma = !prisma;
    if (!prisma) {
        prisma = new PrismaClient();
        await prisma.$connect();
    }

    const stats = {
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        errorDetails: [] as string[],
    };

    try {
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`🎯 SHILLONG TEER HISTORICAL BACKFILL (MULTI-SOURCE)`);
        console.log(`${'═'.repeat(60)}\n`);

        // 1. Ensure game exists
        const game = await prisma.game.upsert({
            where: { name: GAME_NAME },
            update: {},
            create: {
                name: GAME_NAME,
                displayName: 'Shillong Teer',
                description: 'Shillong Teer archery-based lottery game',
                location: 'Shillong, Meghalaya',
                frTime: '15:30',
                srTime: '16:30',
                isEnabled: true,
            },
        });
        console.log(`✅ Game ready: ${game.displayName} (${game.id})\n`);

        // 2. Fetch and parse all sources
        const allSourceResults: ExtractedResult[][] = [];

        for (const source of SOURCES) {
            console.log(`${'─'.repeat(60)}`);
            console.log(`📥 Source: ${source.name} (${source.type})`);
            try {
                const html = await fetchPage(source.url, source.name);

                let results: ExtractedResult[];
                if (source.type === 'table') {
                    results = extractFromTables(html);
                } else {
                    results = extractFromList(html);
                }

                console.log(`  📊 Extracted: ${results.length} results`);
                if (results.length > 0) {
                    const dates = results.map(r => r.date).sort();
                    console.log(`  📅 Range: ${dates[0]} → ${dates[dates.length - 1]}`);
                }
                allSourceResults.push(results);
            } catch (err: any) {
                console.error(`  ❌ Source failed: ${err.message}`);
                // Continue with other sources
            }
        }

        // 3. Merge all sources
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`🔄 Merging results from ${allSourceResults.length} sources...`);
        const results = mergeResults(allSourceResults);
        console.log(`📊 Total unique results after merge: ${results.length}\n`);

        if (results.length === 0) {
            console.log('⚠️  No results extracted from any source.');
            return {
                success: false,
                inserted: 0, updated: 0, skipped: 0, errors: 0,
                errorDetails: ['No results could be extracted from any source'],
                totalExtracted: 0,
                duration: Date.now() - startTime,
                dateRange: null,
            };
        }

        const dates = results.map(r => r.date).sort();
        const dateRange = { from: dates[0], to: dates[dates.length - 1] };
        console.log(`📅 Combined date range: ${dateRange.from} → ${dateRange.to}`);
        console.log(`${'─'.repeat(60)}\n`);

        // 4. Upsert results in batches
        const BATCH_SIZE = 50;
        const totalBatches = Math.ceil(results.length / BATCH_SIZE);

        for (let i = 0; i < results.length; i += BATCH_SIZE) {
            const batch = results.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;

            for (const result of batch) {
                try {
                    const dateObj = new Date(result.date + 'T00:00:00Z');

                    const existing = await prisma.result.findUnique({
                        where: { gameId_date: { gameId: game.id, date: dateObj } },
                    });

                    if (existing) {
                        const existingHasR1 = existing.round1 && existing.round1 !== 'XX' && existing.round1 !== '--';
                        const existingHasR2 = existing.round2 && existing.round2 !== 'XX' && existing.round2 !== '--';
                        const newHasR1 = result.round1 !== 'XX';
                        const newHasR2 = result.round2 !== 'XX';

                        if ((!existingHasR1 && newHasR1) || (!existingHasR2 && newHasR2)) {
                            await prisma.result.update({
                                where: { gameId_date: { gameId: game.id, date: dateObj } },
                                data: {
                                    round1: newHasR1 ? result.round1 : existing.round1,
                                    round2: newHasR2 ? result.round2 : existing.round2,
                                    confidence: 'HIGH',
                                    verified: true,
                                },
                            });
                            stats.updated++;
                        } else {
                            stats.skipped++;
                        }
                    } else {
                        await prisma.result.create({
                            data: {
                                gameId: game.id,
                                date: dateObj,
                                round1: result.round1,
                                round2: result.round2,
                                round3: null,
                                confidence: 'HIGH',
                                verified: true,
                                sourceCount: 1,
                            },
                        });
                        stats.inserted++;
                    }
                } catch (err: any) {
                    if (err.code === 'P2002') {
                        stats.skipped++;
                    } else {
                        stats.errors++;
                        if (stats.errorDetails.length < 10) {
                            stats.errorDetails.push(`${result.date}: ${err.message}`);
                        }
                    }
                }
            }

            console.log(`  📦 Batch ${batchNum}/${totalBatches}: +${batch.length} processed (${stats.inserted} new, ${stats.updated} updated, ${stats.skipped} skipped)`);
        }

        // 5. Final Summary
        const duration = Date.now() - startTime;
        console.log(`\n${'═'.repeat(60)}`);
        console.log(`✅ BACKFILL COMPLETE`);
        console.log(`${'═'.repeat(60)}`);
        console.log(`  📊 Total extracted:  ${results.length}`);
        console.log(`  ✅ Inserted:         ${stats.inserted}`);
        console.log(`  🔄 Updated:          ${stats.updated}`);
        console.log(`  ⏭️  Skipped:          ${stats.skipped}`);
        console.log(`  ❌ Errors:           ${stats.errors}`);
        console.log(`  📅 Date range:       ${dateRange.from} → ${dateRange.to}`);
        console.log(`  ⏱️  Duration:         ${(duration / 1000).toFixed(1)}s`);
        console.log(`${'═'.repeat(60)}\n`);

        if (stats.errorDetails.length > 0) {
            console.log('Error details:');
            stats.errorDetails.forEach(e => console.log(`  ⚠️ ${e}`));
        }

        return {
            success: true,
            ...stats,
            totalExtracted: results.length,
            duration,
            dateRange,
        };

    } catch (err: any) {
        console.error(`\n💥 BACKFILL FAILED: ${err.message}`);
        return {
            success: false,
            ...stats,
            errorDetails: [...stats.errorDetails, err.message],
            totalExtracted: 0,
            duration: Date.now() - startTime,
            dateRange: null,
        };
    } finally {
        if (ownPrisma && prisma) {
            await prisma.$disconnect();
        }
    }
}

// ─── CLI Entry Point ─────────────────────────────────────────────────────────
if (require.main === module) {
    runBackfill().then(result => {
        process.exit(result.success ? 0 : 1);
    });
}
