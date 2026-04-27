export interface TeerResult {
  date: string;
  round1: string | null;
  round2: string | null;
  round3: string | null;
  game?: string;
  sourceMethod?: string;
}

export interface ParseResult {
  results: TeerResult[];
  method: "API" | "AI" | "DOM";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  rawCount: number;
  validCount: number;
  errors: string[];
  logs: string[];
  aiCost?: number;
  aiTokensUsed?: number;
  crawlStats?: CrawlStats;
}

export interface ScrapeConfig {
  url: string;
  gameId: string;
  gameName?: string;
  useAI: boolean;
  timeout: number;

  maxPagesLimit: number;
  chunkSize: number;
  stopOnNoNewData: boolean;
  maxConsecutiveEmpty: number;
  detectApiEndpoints: boolean;
  retryCount: number;
  deep?: boolean;
  cacheEnabled?: boolean;

  // New Fields
  renderType?: "STATIC" | "DYNAMIC";
  selectors?: {
    fr?: string;
    sr?: string;
    tr?: string;
    date?: string;
    container?: string;
  };
}

export interface FetchResult {
  html: string;
  text: string;
  method: "STATIC" | "DYNAMIC" | "API";
  success: boolean;
  error?: string;
}

export interface AIServiceResponse {
  success: boolean;
  results: TeerResult[];
  cost: number;
  tokensUsed: number;
  error?: string;
}

export interface DeepCrawlResult {
  cleanedAiSnippet: string;
  pageUrl: string;
  resultsCount: number;
  extractedResults: TeerResult[];
}

export interface CrawlStats {
  totalPages: number;
  totalResults: number;
  pagesFailed: number;
  duration: number;
  stopReason: string;
}

export interface ChunkResult {
  chunkIndex: number;
  results: TeerResult[];
  success: boolean;
  error?: string;
}

export interface ApiEndpoint {
  url: string;
  method: string;
  isJson: boolean;
  tested: boolean;
  working: boolean;
}

export interface PaginationLink {
  url: string;
  pageNumber?: number;
  isNextButton: boolean;
}

export interface SourceWithAI {
  id: string;
  gameId: string;
  url: string;
  type: string;
  isActive: boolean;
  useAI: boolean;
  lastScrapedAt: string | null;
  lastParseMethod?: string;
  createdAt: string;
  updatedAt: string;
}
