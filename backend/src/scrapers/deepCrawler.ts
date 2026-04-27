import * as cheerio from "cheerio";
import { ScrapeConfig, DeepCrawlResult, CrawlStats, PaginationLink } from "../types/scraper";
import { fetchWithFallback } from "./fetchService";
import { cleanHtmlForAI, extractFromDOM, extractWithRegex } from "./extractorUtils";
import { deduplicateResults } from "./validator";

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isPaginationLink(href: string): boolean {
  if (!href) return false;

  const patterns = [
    /[\?&]page[=\/]?\d+/i,
    /[\?&]p[=\/]?\d+/i,
    /[\?&]paging[=\/]?\d+/i,
    /\/\d+\/$/,
    /\/page\/\d+/i,
    /\/p\/\d+/i,
    /\.html?\/\d+/i,
    /\/results\/\d+/i,
    /_page=\d+/i,
    /previous-result/i,
    /archive/i,
    /history/i,
    /shillong-teer-.*?-\d{4}/i, // Matches /shillong-teer-january-2024
    /(?:january|february|march|april|may|june|july|august|september|october|november|december)/i, // Matches month links
    /\d{4}\/\d{2}/i, // Matches year/month links
    /\/\d{4}\/$/, // Matches year links
  ];

  return patterns.some(pattern => pattern.test(href));
}

function extractPageNumber(href: string): number | undefined {
  const matches = href.match(/(\d+)(?:\.html?$|\/$|\?|&)/);
  if (matches) {
    const num = parseInt(matches[1], 10);
    return num > 0 && num < 10000 ? num : undefined;
  }
  return undefined;
}

function normalizeUrlForCrawl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = ""; // Strip fragment
    return u.toString();
  } catch {
    return url.split("#")[0];
  }
}

function buildFullUrl(href: string, baseUrl: string): string {
  try {
    let target = href;
    if (href.startsWith("//")) target = "https:" + href;
    else if (!href.startsWith("http")) target = new URL(href, baseUrl).href;

    return normalizeUrlForCrawl(target);
  } catch {
    return normalizeUrlForCrawl(href);
  }
}

function isNextButton(text: string, el: cheerio.Element): boolean {
  const txt = text.toLowerCase().trim();
  return txt === "next" || txt === "next >" || txt === "»" || txt === "›" ||
    txt.includes("next") || txt === ">" || txt === ">>";
}

function discoverPagination($: cheerio.Root, baseUrl: string): PaginationLink[] {
  const links: PaginationLink[] = [];
  const seen = new Set<string>();

  const selectors = [
    "a.pagination a",
    ".pagination a",
    "nav.pagination a",
    "ul.pagination a",
    "[class*='pagination'] a",
    ".page-links a",
    ".pager a",
    ".pages a",
    ". pagination a",
    ".paging a",
    "a[rel='next']",
    "a.next",
    ".next a",
    "a:contains('Next')",
    "a:contains('»')",
  ];

  for (const selector of selectors) {
    try {
      $(selector).each((_, el) => {
        const href = $(el).attr("href");
        const text = $(el).text();

        if (href && !seen.has(href)) {
          if (isPaginationLink(href) || isNextButton(text, el)) {
            const fullUrl = buildFullUrl(href, baseUrl);

            // INDUSTRY GRADE: Domain Whitelisting
            // Prevent crawler from jumping to whatsapp, telegram, or other domains
            try {
              const currentDomain = new URL(baseUrl).hostname;
              const linkDomain = new URL(fullUrl).hostname;
              if (currentDomain !== linkDomain) return;
            } catch { return; }

            const pageNum = extractPageNumber(href);

            links.push({
              url: fullUrl,
              pageNumber: pageNum,
              isNextButton: isNextButton(text, el),
            });
            seen.add(href);
          }
        }
      });
    } catch { }
  }

  if (links.length === 0) {
    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && isPaginationLink(href) && !seen.has(href)) {
        const fullUrl = buildFullUrl(href, baseUrl);

        try {
          const currentDomain = new URL(baseUrl).hostname;
          const linkDomain = new URL(fullUrl).hostname;
          if (currentDomain !== linkDomain) return;
        } catch { return; }

        links.push({
          url: fullUrl,
          pageNumber: extractPageNumber(href),
          isNextButton: false,
        });
        seen.add(href);
      }
    });
  }

  return links.sort((a, b) => {
    if (a.pageNumber && b.pageNumber) return a.pageNumber - b.pageNumber;
    return 0;
  });
}

function extractResultsFromHtml(html: string): number {
  const $ = cheerio.load(html);
  let count = 0;

  $("table tbody tr, table tr").each((_, el) => {
    const cells = $(el).find("td");
    if (cells.length >= 3) count++;
  });

  if (count === 0) {
    $("tr").each((_, el) => {
      const cells = $(el).find("td, th");
      if (cells.length >= 3) count++;
    });
  }

  return count;
}

function shouldStop(
  visitedCount: number,
  maxPagesLimit: number,
  consecutiveEmpty: number,
  maxConsecutiveEmpty: number,
  currentPageResults: number,
  previousResultsCount: number
): { stop: boolean; reason: string } {
  if (visitedCount > maxPagesLimit) {
    return { stop: true, reason: `Reached max pages limit (${maxPagesLimit})` };
  }

  if (consecutiveEmpty >= maxConsecutiveEmpty && maxConsecutiveEmpty > 0 && visitedCount > 1) {
    return { stop: true, reason: `No new data for ${maxConsecutiveEmpty} consecutive pages` };
  }

  if (currentPageResults === 0 && previousResultsCount === 0 && visitedCount > 1) {
    return { stop: true, reason: "Page has no extractable results" };
  }

  return { stop: false, reason: "" };
}

export async function crawlAllPages(
  config: ScrapeConfig,
  logs: string[]
): Promise<{ results: DeepCrawlResult[]; stats: CrawlStats }> {
  const startTime = Date.now();
  const results: DeepCrawlResult[] = [];
  const visitedUrls = new Set<string>();

  const maxPagesLimit = config.maxPagesLimit || 500;
  const maxConsecutiveEmpty = config.maxConsecutiveEmpty || 3;
  const retryCount = config.retryCount || 2;
  const timeout = config.timeout || 60000;

  let queue: string[] = [config.url];
  let consecutiveEmpty = 0;
  let previousResultsCount = 0;
  let stopReason = "Completed";

  logs.push(`🚀 Starting deep crawl (Incremental) for: ${config.url}`);

  while (queue.length > 0) {
    const currentUrl = queue.shift()!;

    if (visitedUrls.has(currentUrl)) continue;
    visitedUrls.add(currentUrl);

    const stopCheck = shouldStop(
      visitedUrls.size,
      maxPagesLimit,
      consecutiveEmpty,
      maxConsecutiveEmpty,
      0,
      previousResultsCount
    );

    if (stopCheck.stop) {
      stopReason = stopCheck.reason;
      break;
    }

    logs.push(`📄 [${visitedUrls.size}/${maxPagesLimit}] Fetching: ${currentUrl}`);

    let fetchResult;
    let attempt = 0;
    let success = false;

    while (attempt < retryCount && !success) {
      attempt++;
      fetchResult = await fetchWithFallback(
        currentUrl,
        Math.max(timeout, 30000),
        config.renderType === "DYNAMIC"
      );

      if (fetchResult.success && fetchResult.html.length > 100) {
        success = true;
      } else {
        if (attempt < retryCount) {
          await sleep(1000 * attempt);
        }
      }
    }

    if (!success || !fetchResult?.success) {
      logs.push(`❌ Failed to fetch: ${currentUrl}`);
      continue;
    }

    // ─── Incremental Extraction ──────────────────────────────────────────────
    const rawHtml = fetchResult.html;

    // 1. Extract results immediately (to discard HTML soon)
    const domResults = extractFromDOM(rawHtml, { selectors: config.selectors, gameName: config.gameName });
    const regexResults = extractWithRegex(rawHtml);
    const pageResults = deduplicateResults([...domResults, ...regexResults]);

    // 2. Clean for AI immediately
    const aiSnippet = cleanHtmlForAI(rawHtml);

    if (pageResults.length === 0) {
      consecutiveEmpty++;
    } else {
      consecutiveEmpty = 0;
    }

    previousResultsCount = pageResults.length;

    results.push({
      cleanedAiSnippet: aiSnippet,
      pageUrl: currentUrl,
      resultsCount: pageResults.length,
      extractedResults: pageResults,
    });

    // 3. Clear heavy strings from memory
    (fetchResult as any).html = null;
    (fetchResult as any).text = null;

    logs.push(`✅ Page ${visitedUrls.size}: ${pageResults.length} rows extracted (total size: ${results.length})`);

    if (pageResults.length > 0 && visitedUrls.size < maxPagesLimit) {
      try {
        const $ = cheerio.load(rawHtml);
        const paginationLinks = discoverPagination($, currentUrl);

        for (const link of paginationLinks) {
          if (!visitedUrls.has(link.url) && !queue.includes(link.url)) {
            queue.push(link.url);
          }
        }
      } catch (err: any) {
        logs.push(`⚠️ Pagination error: ${err.message}`);
      }
    }
  }

  const duration = Date.now() - startTime;
  const totalResults = results.reduce((sum, r) => sum + r.resultsCount, 0);

  logs.push(`🏁 Deep crawl complete: ${visitedUrls.size} pages in ${duration}ms`);

  return {
    results,
    stats: {
      totalPages: visitedUrls.size,
      totalResults,
      pagesFailed: 0,
      duration,
      stopReason,
    },
  };
}

export async function crawlSinglePage(
  url: string,
  timeout: number,
  config?: { selectors?: any, gameName?: string }
): Promise<DeepCrawlResult | null> {
  const result = await fetchWithFallback(url, timeout);

  if (!result.success) {
    return null;
  }

  const html = result.html;
  const domResults = extractFromDOM(html, config);
  const regexResults = extractWithRegex(html);
  const pageResults = deduplicateResults([...domResults, ...regexResults]);
  const aiSnippet = cleanHtmlForAI(html);

  return {
    cleanedAiSnippet: aiSnippet,
    pageUrl: url,
    resultsCount: pageResults.length,
    extractedResults: pageResults,
  };
}
