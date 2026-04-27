import { ParseResult, ScrapeConfig, TeerResult } from "../types/scraper";
import { deduplicateResults, validateAndCleanResult } from "./validator";
import { fetchWithFallback } from "./fetchService";
import { processChunks, parseWithAIWithRetry, chunkText } from "./aiParser";
import { crawlAllPages } from "./deepCrawler";
import { detectAndTestApiEndpoints, getApiResults, extractTeerResultsFromApi, isApiUrl } from "./apiDetector";
import { getISTNow } from "../config/gameSchedule";

// ─── API Detection ───────────────────────────────────────────────────────────
async function tryApiDetection(
  config: ScrapeConfig,
  logs: string[]
): Promise<TeerResult[] | null> {
  // If the initial URL itself looks like an API URL, try it directly
  if (isApiUrl(config.url)) {
    logs.push(`🎯 Initial URL looks like an API: ${config.url}`);
    const apiData = await getApiResults(config.url, config.timeout);
    if (apiData) {
      const rawResults = extractTeerResultsFromApi(apiData, config.gameName);
      const results: TeerResult[] = [];
      for (const r of rawResults) { if (r) results.push(r); }
      if (results.length > 0) {
        logs.push(`📊 Extracted ${results.length} results from direct API`);
        return results;
      }
    }
  }

  if (!config.detectApiEndpoints) return null;

  logs.push(`🔍 Scanning for hidden API endpoints...`);

  const fetchResult = await fetchWithFallback(config.url, config.timeout);
  if (!fetchResult.success) return null;

  const endpoints = await detectAndTestApiEndpoints(
    fetchResult.html,
    config.url,
    8000,
    8
  );

  if (endpoints.length === 0) {
    logs.push(`❌ No working API endpoints found`);
    return null;
  }

  const bestEndpoint = endpoints[0];
  logs.push(`✅ Found working API: ${bestEndpoint.url}`);

  const apiData = await getApiResults(bestEndpoint.url, config.timeout);
  if (!apiData) return null;

  const rawResults = extractTeerResultsFromApi(apiData, config.gameName);
  const results: TeerResult[] = [];

  for (const r of rawResults) {
    if (r) {
      const cleaned = validateAndCleanResult(r);
      if (cleaned) results.push(cleaned);
    }
  }

  logs.push(`📊 API extracted ${results.length} results`);
  return results.length > 0 ? results : null;
}

// ─── AI Processing (Snippets-based) ──────────────────────────────────────────
async function processWithAI(
  snippets: string[],
  config: ScrapeConfig,
  logs: string[]
): Promise<{ results: TeerResult[]; cost: number; tokens: number }> {
  // JOIN SNIPPETS INSTEAD OF HTML
  const combinedText = snippets.join("\n\n---\n\n");

  if (combinedText.length < 50) {
    logs.push(`⚠️ Combined text too short for AI (${combinedText.length} chars)`);
    return { results: [], cost: 0, tokens: 0 };
  }

  logs.push(`🧠 AI Processing: ${combinedText.length} chars (optimized snippets)`);

  const chunks = chunkText(combinedText, config.chunkSize || 15000);
  logs.push(`📦 Split into ${chunks.length} chunks`);

  const chunkResults = await processChunks(
    chunks,
    `Game: ${config.gameName || "Unknown Teer"}`,
    (current, total) => {
      logs.push(`🤖 AI: chunk ${current}/${total}`);
    }
  );

  if (chunkResults.success && chunkResults.results.length > 0) {
    logs.push(`✅ AI extracted ${chunkResults.results.length} results (cost: $${chunkResults.cost.toFixed(6)})`);
    return { results: chunkResults.results, cost: chunkResults.cost, tokens: chunkResults.tokensUsed };
  }

  // Fallback: single-shot smaller extraction
  logs.push(`⚠️ Chunk processing failed, trying single-shot extraction...`);
  const singleResult = await parseWithAIWithRetry(
    combinedText.substring(0, 120000),
    `Game: ${config.gameName || "Unknown Teer"}`
  );

  if (singleResult.success) {
    logs.push(`✅ Single-shot AI extracted ${singleResult.results.length} results`);
    return { results: singleResult.results, cost: singleResult.cost, tokens: singleResult.tokensUsed };
  }

  return { results: [], cost: singleResult.cost, tokens: singleResult.tokensUsed };
}

// ─── Main Hybrid Engine ─────────────────────────────────────────────────────
export async function scrapeWithHybrid(config: ScrapeConfig): Promise<ParseResult> {
  const logs: string[] = [];
  const allErrors: string[] = [];

  logs.push(`🚀 Hybrid Scrape Optimization Active: ${config.url}`);

  let results: TeerResult[] = [];
  let method: "API" | "AI" | "DOM" = "DOM";
  let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  let aiCost = 0;
  let aiTokens = 0;

  // 1. API Detection
  const apiResults = await tryApiDetection(config, logs);
  if (apiResults && apiResults.length > 0) {
    if (config.deep && apiResults.length < 50) {
      logs.push(`⚠️ API only returned ${apiResults.length} results, but a deep crawl is requested. Bypassing API to fetch full history via DOM...`);
    } else {
      results = apiResults;
      method = "API";
      confidence = "HIGH";
      logs.push(`🎯 SUCCESS via API: ${results.length} results`);
    }
  }
  if (results.length === 0) {
    // 2. Fetch Pages (Deep crawl - now returns pre-extracted results)
    logs.push(`📄 Starting deep crawl...`);

    // Exception: Laitlyngkot requires absolute full depth even if there are sparse localized gaps
    const forceExhaustive = config.gameName?.toLowerCase().includes("laitlyngkot");

    const crawlResult = await crawlAllPages(
      {
        ...config,
        maxPagesLimit: config.maxPagesLimit || 500,
        maxConsecutiveEmpty: forceExhaustive ? Math.max(10, config.maxConsecutiveEmpty || 3) : config.maxConsecutiveEmpty || 3,
        retryCount: config.retryCount || 3,
        stopOnNoNewData: forceExhaustive ? false : config.stopOnNoNewData,
        // PASS THROUGH THE FORCE DYNAMIC FLAG
        cacheEnabled: config.renderType === "DYNAMIC" ? false : config.cacheEnabled
      },
      logs
    );

    if (crawlResult.results.length === 0) {
      logs.push(`❌ No data retrieved from pages`);
      return {
        results: [],
        method: "DOM",
        confidence: "LOW",
        rawCount: 0,
        validCount: 0,
        errors: ["No pages could be fetched"],
        logs,
        crawlStats: crawlResult.stats,
      };
    }

    // AGGREGATE PRE-EXTRACTED RESULTS (DOM/Regex)
    const incrementalResults: TeerResult[] = [];
    const snippets: string[] = [];

    for (const page of crawlResult.results) {
      if (page.extractedResults) {
        incrementalResults.push(...page.extractedResults);
      }
      if (page.cleanedAiSnippet) {
        snippets.push(page.cleanedAiSnippet);
      }
    }

    // 3. Try Incremental (DOM/Regex) extraction first for Deep Crawls to save memory/tokens
    results = deduplicateResults(incrementalResults);
    if (results.length > 0) {
      method = "DOM";
      confidence = results.length > 10 ? "MEDIUM" : "LOW";
      logs.push(`🎯 Success via Incremental (DOM/Regex): ${results.length} results`);

      // If we have enough data and it's a deep crawl, we might skip AI to save resources
      if (config.deep && results.length > 50) {
        logs.push(`⏭️ Skipping AI for deep crawl as DOM extraction was highly successful`);
      } else if (config.useAI) {
        // Still try AI to augment data if needed
        const aiResult = await processWithAI(snippets, config, logs);
        if (aiResult.results.length > 0) {
          const combined = deduplicateResults([...results, ...aiResult.results]);
          if (combined.length > results.length) {
            logs.push(`🧠 AI augmented data: +${combined.length - results.length} results`);
            results = combined;
            method = "AI"; // Attribute to AI if it added value
          }
          aiCost = aiResult.cost;
          aiTokens = aiResult.tokens;
        }
      }
    } else if (config.useAI) {
      // 4. AI Extraction (if DOM failed)
      const aiResult = await processWithAI(snippets, config, logs);
      aiCost = aiResult.cost;
      aiTokens = aiResult.tokens;

      if (aiResult.results.length > 0) {
        results = aiResult.results;
        method = "AI";
        confidence = "HIGH";
        logs.push(`🎯 SUCCESS via AI: ${results.length} results`);
      }
    }

    // 5. Final Fallback: Force AI on snippets if everything else failed
    if (results.length === 0 && !config.useAI && snippets.length > 0) {
      logs.push(`🧠 Forcing AI fallback on snippets...`);
      const forceAI = await processWithAI(snippets, { ...config, useAI: true }, logs);
      aiCost += forceAI.cost;
      aiTokens += forceAI.tokens;

      if (forceAI.results.length > 0) {
        results = forceAI.results;
        method = "AI";
        confidence = "MEDIUM";
        logs.push(`🎯 SUCCESS via forced AI: ${results.length} results`);
      }
    }
  }
  if (results.length === 0) {
    logs.push(`❌ ALL extraction strategies exhausted — no results found`);
    return {
      results: [],
      method,
      confidence: "LOW",
      rawCount: 0,
      validCount: 0,
      errors: ["All extraction methods failed"],
      logs,
      aiCost,
      aiTokensUsed: aiTokens,
    };
  }

  results = deduplicateResults(results);

  if (!config.deep) {
    const todayStr = getISTNow().dateStr;
    const initialCount = results.length;
    results = results.filter(r => r.date === todayStr);

    if (initialCount > results.length) {
      logs.push(`📅 Live Mode Constraint: Filtered out ${initialCount - results.length} historical dates. Kept strictly (${todayStr}).`);
    }
  }
  logs.push(`🏁 Scrape complete: ${results.length} unique results via ${method} (${confidence})`);

  return {
    results,
    method,
    confidence,
    rawCount: results.length,
    validCount: results.length,
    errors: allErrors.slice(0, 5),
    logs,
    aiCost,
    aiTokensUsed: aiTokens,
  };
}

export async function scrapeSingle(
  url: string,
  config: Partial<ScrapeConfig> = {}
): Promise<ParseResult> {
  return scrapeWithHybrid({
    url,
    gameId: config.gameId || "",
    gameName: config.gameName,
    useAI: config.useAI !== false,
    timeout: config.timeout || 60000,
    maxPagesLimit: config.maxPagesLimit || 500,
    chunkSize: config.chunkSize || 120000,
    stopOnNoNewData: config.stopOnNoNewData !== false,
    maxConsecutiveEmpty: config.maxConsecutiveEmpty || 3,
    detectApiEndpoints: config.detectApiEndpoints !== false,
    retryCount: config.retryCount || 3,
  });
}
