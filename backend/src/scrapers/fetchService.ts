import axios from "axios";
import * as cheerio from "cheerio";
import { FetchResult } from "../types/scraper";
import { logger } from "../utils/logger";

// ─── Dynamic Rendering Domain Registry ──────────────────────────────────────
// Sites that are 100% JS-rendered and MUST use Playwright (static HTML is empty/minimal)
const DYNAMIC_RENDER_DOMAINS = [
  "shillongteercalculator.in",
  "teerbhutan.com",
  "teerbhutan.co",
  "teercommonnumber.com",
];

/**
 * Check if a URL's domain requires forced dynamic (Playwright) rendering.
 */
export function isDynamicRenderRequired(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return DYNAMIC_RENDER_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

const PROXIES = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(",").map(p => p.trim()) : [];

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

// ─────────────────────────────────────────────────────────────────────────────

const SSL_BYPASS_DOMAINS = [
  "teercommonnumber.com",
  "meghalayateer.com",
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
];

function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function shouldBypassSSL(url: string): boolean {
  return SSL_BYPASS_DOMAINS.some(domain => url.includes(domain));
}

function getHttpsAgent() {
  return new (require("https").Agent)({
    rejectUnauthorized: false,
  }) as any;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomProxy(): string | undefined {
  if (PROXIES.length === 0) return undefined;
  return PROXIES[Math.floor(Math.random() * PROXIES.length)];
}

// ─── Static Fetch (Axios/HTTP) ───────────────────────────────────────────────
export async function fetchStatic(url: string, timeout: number = 15000): Promise<FetchResult> {
  let lastError = "";

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const isSSLBypass = shouldBypassSSL(url);
      const requestConfig: any = {
        timeout: Math.max(timeout, 20000),
        headers: {
          "User-Agent": getRandomUA(),
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Cache-Control": "no-cache",
        },
        maxRedirects: 5,
        validateStatus: (status: number) => status < 500,
      };

      if (isSSLBypass) {
        requestConfig.httpsAgent = getHttpsAgent();
        requestConfig.httpAgent = getHttpsAgent();
      }

      const proxy = getRandomProxy();
      if (proxy) {
        try {
          const proxyUrl = new URL(proxy);
          requestConfig.proxy = {
            protocol: proxyUrl.protocol.replace(":", ""),
            host: proxyUrl.hostname,
            port: parseInt(proxyUrl.port),
          };
          if (proxyUrl.username) {
            requestConfig.proxy.auth = {
              username: proxyUrl.username,
              password: proxyUrl.password,
            };
          }
          logger.debug("Using proxy for static fetch", { proxy: proxyUrl.hostname });
        } catch (e) {
          logger.warn("Invalid proxy URL in PROXY_LIST", { proxy });
        }
      }

      const response = await axios.get(url, requestConfig);
      let html = "";
      let text = "";

      if (typeof response.data === "object") {
        html = JSON.stringify(response.data);
        text = html;
      } else {
        html = response.data;
        const $ = cheerio.load(html);
        text = $("body").text().replace(/\s+/g, " ").trim();
      }

      logger.info(`Static fetch ✅: ${url} (${html.length} bytes)`, { attempt: attempt + 1 });
      return { html, text, method: "STATIC", success: true };
    } catch (err: any) {
      lastError = err.message || "Unknown error";

      const isRetryable =
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT" ||
        err.code === "ENOTFOUND" ||
        err.code === "ERR_TLS_CERT_ALTNAME_INVALID" ||
        err.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
        err.code === "SELF_SIGNED_CERT_IN_CHAIN" ||
        err.code === "ECONNREFUSED" ||
        (err.response?.status === 525) ||
        (err.response?.status === 500) ||
        (err.response?.status === 403) ||
        (err.response?.status === 429);

      if (isRetryable && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[MAX_RETRIES - 1];
        logger.warn(`Static fetch retry ${attempt + 1}/${MAX_RETRIES}`, { url, error: lastError });
        await sleep(delay);
      } else if (!isRetryable) {
        break;
      }
    }
  }

  logger.error(`Static fetch failed: ${url}`, { error: lastError });
  return { html: "", text: "", method: "STATIC", success: false, error: lastError };
}

// ─── Dynamic Fetch (Playwright) ──────────────────────────────────────────────
export async function fetchDynamic(url: string, timeout: number = 30000): Promise<FetchResult> {
  const { chromium } = require("playwright");
  let browser;
  try {
    logger.info(`Dynamic fetch 🎭: ${url}`);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: getRandomUA(),
    });
    const page = await context.newPage();

    // Set extra headers to look like a browser
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    await page.goto(url, { waitUntil: "networkidle", timeout: Math.max(timeout, 30000) });

    // Wait a bit extra for dynamic animations/JS
    await sleep(2000);

    const html = await page.content();
    // @ts-expect-error — Playwright evaluate runs in browser context where document.body.innerText exists
    const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());

    await browser.close();
    logger.info(`Dynamic fetch ✅: ${url} (${html.length} bytes)`);
    return { html, text, method: "DYNAMIC", success: true };
  } catch (err: any) {
    if (browser) await browser.close();
    logger.error(`Dynamic fetch failed: ${url}`, { error: err.message });
    return { html: "", text: "", method: "DYNAMIC", success: false, error: err.message };
  }
}

// ─── Fetch with Full Fallback Chain ──────────────────────────────────────────
export async function fetchWithFallback(
  url: string,
  timeout: number = 20000,
  forceDynamic: boolean = false
): Promise<FetchResult> {
  // Auto-detect if domain requires forced dynamic rendering
  const domainRequiresDynamic = isDynamicRenderRequired(url);
  const shouldForceDynamic = forceDynamic || domainRequiresDynamic;

  logger.info(`[SCRAPER] Fetch chain: ${url} | forceDynamic: ${shouldForceDynamic}${domainRequiresDynamic ? " (domain registry)" : ""}`);

  if (shouldForceDynamic) {
    logger.info(`[SCRAPER] Bypassing static fetch — using Playwright for ${url}`);
    const dynamicResult = await fetchDynamic(url, Math.max(timeout, 45000));
    if (dynamicResult.success) return dynamicResult;

    // If dynamic also failed, try static as last resort
    logger.warn(`[SCRAPER] Dynamic fetch failed for forced-dynamic URL, trying static fallback: ${url}`);
    const staticFallback = await fetchStatic(url, Math.max(timeout, 20000));
    if (staticFallback.success && staticFallback.html.length > 500) return staticFallback;

    return dynamicResult; // Return the dynamic error
  }

  const staticResult = await fetchStatic(url, Math.max(timeout, 20000));

  if (staticResult.success && staticResult.html.length > 500) {
    const $ = cheerio.load(staticResult.html);
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const hasTable = $("table").length > 0;
    const hasResultElements = $("[class*='result'], [id*='result'], [class*='teer']").length > 0;
    const hasDataRows = $("tr td, tr th").length > 10;

    // Detect JS-rendered placeholder content
    const hasLoadingPlaceholder = /loading\s*(results|data)?\s*\.{0,3}/i.test(bodyText);
    const bodyTooShort = bodyText.length < 800;

    if (hasLoadingPlaceholder || bodyTooShort) {
      logger.warn(`[SCRAPER] Static HTML appears JS-rendered (bodyText: ${bodyText.length} chars, loading: ${hasLoadingPlaceholder}). Escalating to Playwright: ${url}`);
    } else if (hasTable || hasResultElements || hasDataRows) {
      logger.info(`[SCRAPER] Static fetch sufficient for ${url} (tables: ${$("table").length}, rows: $("tr").length)`);
      return staticResult;
    }
  }

  logger.warn(`[SCRAPER] Static fetch insufficient, trying Playwright for ${url}`);
  const dynamicResult = await fetchDynamic(url, Math.max(timeout, 45000));

  if (dynamicResult.success) return dynamicResult;

  // Return whatever we got (even partial static content)
  if (staticResult.success && staticResult.html.length > 0) {
    logger.warn(`[SCRAPER] Returning partial static content for ${url} as Playwright also failed`);
    return staticResult;
  }

  logger.error(`[SCRAPER] ALL fetch strategies FAILED for: ${url}`);
  return {
    html: "",
    text: "",
    method: "STATIC",
    success: false,
    error: dynamicResult.error || staticResult.error || "All fetch methods failed",
  };
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────
export function extractTextFromHTML(html: string, maxLength: number = 80000): string {
  const $ = cheerio.load(html);

  // Remove noise
  $("script, style, noscript, iframe, nav, header, footer, aside, .ad, .advertisement, .sidebar, .cookie-banner, [aria-hidden='true']").remove();
  $("[style*='display:none'], [style*='display: none'], [hidden]").remove();

  let text = $("body").text() || $("html").text();
  text = text.replace(/\s+/g, " ").trim();

  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
  }

  return text;
}
