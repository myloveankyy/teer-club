import axios from "axios";
import * as cheerio from "cheerio";
import { ApiEndpoint } from "../types/scraper";

const API_PATTERNS = [
  /\/api\//i,
  /\/v\d+\//i,
  /\/ajax\//i,
  /\/json\//i,
  /\/data\//i,
  /\/results\//i,
  /\?.*format=json/i,
  /\?.*type=json/i,
  /\.json$/i,
  /\/wp-json\//i,
];

const COMMON_API_PATHS = [
  "/api/results",
  "/api/results/all",
  "/api/v1/results",
  "/api/v2/results",
  "/ajax/results",
  "/data/results",
  "/json/results",
  "/api/teer",
  "/api/teer/results",
];

export function isApiUrl(url: string): boolean {
  return API_PATTERNS.some(pattern => pattern.test(url));
}

function isJsonResponse(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function detectApiUrlsFromHtml(html: string, baseUrl: string): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];
  const seen = new Set<string>();

  const $ = cheerio.load(html);

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && isApiUrl(href)) {
      try {
        let fullUrl = href.startsWith("http") ? href : new URL(href, baseUrl).href;
        if (!seen.has(fullUrl)) {
          seen.add(fullUrl);
          endpoints.push({
            url: fullUrl,
            method: "GET",
            isJson: true,
            tested: false,
            working: false,
          });
        }
      } catch { }
    }
  });

  $("script").each((_, el) => {
    const scriptContent = $(el).html() || "";
    const urlMatches = scriptContent.match(/(["']?)((?:https?:)?\/(?:api|v\d+|ajax|data|results)[^"'\s]+)\1/gi);
    if (urlMatches) {
      for (const match of urlMatches) {
        const urlMatch = match.match(/(https?:)?(\/[^"'\s]+)/);
        if (urlMatch) {
          let fullUrl = urlMatch[1] ? urlMatch[1] + urlMatch[2] : new URL(urlMatch[2], baseUrl).href;
          if (!seen.has(fullUrl)) {
            seen.add(fullUrl);
            endpoints.push({
              url: fullUrl,
              method: "GET",
              isJson: true,
              tested: false,
              working: false,
            });
          }
        }
      }
    }
  });

  $("[data-api], [data-url], [data-src]").each((_, el) => {
    const apiUrl = $(el).attr("data-api") || $(el).attr("data-url") || $(el).attr("data-src");
    if (apiUrl) {
      try {
        let fullUrl = apiUrl.startsWith("http") ? apiUrl : new URL(apiUrl, baseUrl).href;
        if (!seen.has(fullUrl)) {
          seen.add(fullUrl);
          endpoints.push({
            url: fullUrl,
            method: "GET",
            isJson: true,
            tested: false,
            working: false,
          });
        }
      } catch { }
    }
  });

  for (const path of COMMON_API_PATHS) {
    let fullUrl = path.startsWith("http") ? path : new URL(path, baseUrl).href;
    if (!seen.has(fullUrl)) {
      seen.add(fullUrl);
      endpoints.push({
        url: fullUrl,
        method: "GET",
        isJson: true,
        tested: false,
        working: false,
      });
    }
  }

  return endpoints;
}

async function testApiEndpoint(url: string, timeout: number = 5000): Promise<boolean> {
  try {
    const response = await axios.get(url, {
      timeout,
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      validateStatus: (status) => status < 500,
    });

    const contentType = response.headers["content-type"] || "";
    const isJson = contentType.includes("json") || isJsonResponse(typeof response.data === "string" ? response.data : JSON.stringify(response.data));

    return isJson && response.status === 200;
  } catch {
    return false;
  }
}

export async function detectAndTestApiEndpoints(
  html: string,
  baseUrl: string,
  timeout: number = 5000,
  maxTests: number = 5
): Promise<ApiEndpoint[]> {
  const candidates = detectApiUrlsFromHtml(html, baseUrl);

  if (candidates.length === 0) {
    return [];
  }

  const results: ApiEndpoint[] = [];
  let tested = 0;

  for (const endpoint of candidates) {
    if (tested >= maxTests) break;

    const working = await testApiEndpoint(endpoint.url, timeout);
    endpoint.tested = true;
    endpoint.working = working;

    if (working) {
      results.push(endpoint);
      tested++;
    }
  }

  return results;
}

export async function getApiResults(url: string, timeout: number = 10000): Promise<any | null> {
  try {
    const response = await axios.get(url, {
      timeout,
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (response.data) {
      return response.data;
    }
    return null;
  } catch (err: any) {
    console.error(`[ApiDetector] Failed to fetch ${url}:`, err.message);
    return null;
  }
}

export function extractTeerResultsFromApi(data: any, gameName?: string): any[] {
  const results: any[] = [];

  const arrayData = Array.isArray(data) ? data : data.results || data.data || data.items || data.records || [];

  for (const item of arrayData) {
    if (!item || typeof item !== "object") continue;

    const date = item.date || item.Date || item.result_date || item.date_;
    const round1 = item.round1 || item.fr || item.first_round || item.R1 || item.first || item.firstRound;
    const round2 = item.round2 || item.sr || item.second_round || item.R2 || item.second || item.secondRound;

    if (date) {
      results.push({
        date,
        round1: round1?.toString() || null,
        round2: round2?.toString() || null,
        game: gameName,
      });
    }
  }

  return results;
}
