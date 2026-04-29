/* eslint-disable @typescript-eslint/no-explicit-any */
const getApiKey = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("apiKey") || process.env.NEXT_PUBLIC_API_KEY || "";
  }
  return process.env.NEXT_PUBLIC_API_KEY || "";
};

const DEFAULT_API_URL = "http://localhost:3001/api";

const getApiUrl = (): string => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  }

  try {
    const saved = localStorage.getItem("adminSettings");
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings?.apiUrl) {
        const url = settings.apiUrl.trim();
        return url.endsWith("/api") ? url : `${url}/api`;
      }
    }
  } catch (e) {
    console.error("Failed to parse settings:", e);
  }

  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
};

async function fetchAPI<T>(endpoint: string, options?: RequestInit, maxRetries = 2): Promise<T> {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();
  const fullUrl = `${apiUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (apiKey) {
    headers["X-API-Key"] = apiKey;
    headers["X-Admin-Key"] = apiKey;
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10s timeout

      const response = await fetch(fullUrl, {
        ...options,
        headers,
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status >= 500 && attempt < maxRetries) {
          await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
          continue;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      if ((error.name === "TypeError" || error.name === "AbortError") && attempt < maxRetries) {
        await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
        continue;
      }
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        console.error(`[API Error] ${endpoint}: Unable to connect to server at ${apiUrl}`);
        throw new Error(`Unable to connect to server. Please check if the backend is running at ${apiUrl}`);
      }
      if (error.name === "AbortError") {
        throw new Error(`Request to ${endpoint} timed out after 10000ms`);
      }
      console.error(`[API Error] ${endpoint}:`, error);
      throw error;
    }
  }
  throw new Error("Failed after retries");
}

export interface Game {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  location?: string;
  startTime?: string;
  frTime?: string;
  srTime?: string;
  closeTime?: string;
  historySourceUrl?: string;
  liveSourceUrl?: string;
  isLiveScrapingEnabled: boolean;
  lastLiveScrapeAt?: string;
  lastLiveScrapeStatus?: string;
  hasRound3?: boolean;
  isEnabled: boolean;
  _count?: { results: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface Result {
  id: string;
  gameId: string;
  date: string;
  round1: string | null;
  round2: string | null;
  round3?: string | null;
  confidence: string;
  createdAt?: string;
  updatedAt?: string;
  game?: { id: string; name: string; displayName: string };
}

export const api = {
  games: {
    getAll: () => fetchAPI<{ success: boolean; data: Game[] }>("/games"),
    create: (data: Partial<Game>) =>
      fetchAPI<{ success: boolean; data: Game }>("/games", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Game>) =>
      fetchAPI<{ success: boolean; data: Game }>(`/games/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetchAPI<{ success: boolean; message: string }>(`/games/${id}`, { method: "DELETE" }),
  },

  results: {
    getDashboard: (params?: { gameId?: string; from?: string; to?: string; cursor?: string; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.gameId) searchParams.append("gameId", params.gameId);
      if (params?.from) searchParams.append("from", params.from);
      if (params?.to) searchParams.append("to", params.to);
      if (params?.cursor) searchParams.append("cursor", params.cursor);
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      const query = searchParams.toString();
      return fetchAPI<{ success: boolean; data: DashboardData }>(`/results/dashboard${query ? `?${query}` : ""}`);
    },
    getStats: (params?: { gameId?: string; from?: string; to?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.gameId) searchParams.append("gameId", params.gameId);
      if (params?.from) searchParams.append("from", params.from);
      if (params?.to) searchParams.append("to", params.to);
      const query = searchParams.toString();
      return fetchAPI<{ success: boolean; data: ResultsStats }>(`/results/stats${query ? `?${query}` : ""}`);
    },
    getByGameAndDate: (gameId: string, date: string) =>
      fetchAPI<{ success: boolean; data: Result }>(`/results/${gameId}/${date}`),
  },

  pages: {
    getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string; source?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.search) searchParams.append("search", params.search);
      if (params?.status) searchParams.append("status", params.status);
      if (params?.type) searchParams.append("type", params.type);
      if (params?.source) searchParams.append("source", params.source);
      const query = searchParams.toString();
      return fetchAPI<{ success: boolean; data: { pages: Page[]; pagination: any } }>(`/pages${query ? `?${query}` : ""}`);
    },
    create: (data: any) => fetchAPI<{ success: boolean; data: Page }>("/pages", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Page>) =>
      fetchAPI<{ success: boolean; data: Page }>(`/pages/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    sync: () => fetchAPI<{ success: boolean; message: string }>("/pages/sync", { method: "POST" }),
    audit: (id: string) => fetchAPI<{ success: boolean; data: any }>(`/pages/${id}/audit`, { method: "POST" }),
  },
  settings: {
    get: () => fetchAPI<{ success: boolean; data: any }>("/settings"),
    update: (data: any) => fetchAPI<{ success: boolean; data: any }>("/settings", { method: "POST", body: JSON.stringify(data) }),
  },
  predictions: {
    getAll: (params?: { gameId?: string; date?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.gameId) searchParams.append("gameId", params.gameId);
      if (params?.date) searchParams.append("date", params.date);
      const query = searchParams.toString();
      return fetchAPI<{ success: boolean; data: any[] }>(`/predictions${query ? `?${query}` : ""}`);
    },
    create: (data: any) => fetchAPI<{ success: boolean; data: any }>("/predictions", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<{ success: boolean; data: any }>(`/predictions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI<{ success: boolean; message: string }>(`/predictions/${id}`, { method: "DELETE" }),
  },

  admin: {
    triggerBackfill: (game: string) =>
      fetchAPI<{ success: boolean; data: BackfillResult }>(`/admin/backfill/${game}`, { method: "POST" }),
    getResults: (params?: { page?: number; limit?: number; gameId?: string; from?: string; to?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.gameId) searchParams.append("gameId", params.gameId);
      if (params?.from) searchParams.append("from", params.from);
      if (params?.to) searchParams.append("to", params.to);
      const query = searchParams.toString();
      return fetchAPI<{ success: boolean; data: AdminResultsData }>(`/admin/results${query ? `?${query}` : ""}`);
    },
    debug: {
      triggerResults: () => fetchAPI<{ success: boolean; data: any[] }>("/admin/debug/results", { method: "POST" })
    }
  },

  cron: {
    getStatus: () => fetchAPI<{ success: boolean; data: any[] }>("/admin/cron/status"),
    getLogs: (params?: { game?: string; status?: string; page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.game) searchParams.append("game", params.game);
      if (params?.status) searchParams.append("status", params.status);
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      const query = searchParams.toString();
      return fetchAPI<{ success: boolean; data: { logs: any[]; pagination: any } }>(`/admin/cron/logs${query ? `?${query}` : ""}`);
    },
    trigger: (game: string) => fetchAPI<{ success: boolean; message: string }>(`/admin/cron/trigger/${game}`, { method: "POST" }),
    triggerAll: () => fetchAPI<{ success: boolean; message: string }>("/admin/cron/trigger-all", { method: "POST" }),
  },

  journal: {
    profiles: {
      getAll: () => fetchAPI<{ success: boolean; data: any[] }>("/admin/journal/profiles"),
      create: (data: { name: string; role?: string; avatar?: string }) => fetchAPI<{ success: boolean; data: any }>("/admin/journal/profiles", { method: "POST", body: JSON.stringify(data) }),
    },
    notes: {
      getAll: (params?: { profileId?: string; page?: number; limit?: number }) => {
        const searchParams = new URLSearchParams();
        if (params?.profileId) searchParams.append("profileId", params.profileId);
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit) searchParams.append("limit", params.limit.toString());
        const query = searchParams.toString();
        return fetchAPI<{ success: boolean; data: { notes: any[]; total: number; page: number; pages: number } }>(`/admin/journal/notes${query ? `?${query}` : ""}`);
      },
      create: (data: { profileId: string; title: string; content: string }) =>
        fetchAPI<{ success: boolean; data: any }>("/admin/journal/notes", { method: "POST", body: JSON.stringify(data) }),
      update: (id: string, data: { title: string; content: string }) =>
        fetchAPI<{ success: boolean; data: any }>(`/admin/journal/notes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: string) =>
        fetchAPI<{ success: boolean; message: string }>(`/admin/journal/notes/${id}`, { method: "DELETE" }),
    }
  },

  ai: {
    generateBlog: (topic: string) => fetchAPI<{ success: boolean; data: any }>("/admin/ai/generate-blog", { method: "POST", body: JSON.stringify({ topic }) }),
  },

  analytics: {
    getTopPages: () => fetchAPI<{ success: boolean; data: any[] }>("/analytics/admin/top-pages")
  },
  debug: {
    triggerResults: () => fetchAPI<{ success: boolean; data: any[] }>("/admin/debug/results", { method: "POST" })
  },
  seo: {
    sitemap: {
      upload: (xml: string) => fetchAPI<{ success: boolean; data: any }>("/admin/seo/sitemap/upload", { method: "POST", body: JSON.stringify({ xml }) }),
      getStatus: () => fetchAPI<{ success: boolean; data: any }>("/admin/seo/sitemap/status"),
    }
  }
};



export interface DashboardData {
  results: Result[];
  byGame: Record<string, Result[]>;
  games: Game[];
  nextCursor: string | null;
}

export interface ResultsStats {
  total: number;
  games: number;
  byConfidence: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}


export interface Page {
  id: string;
  title: string;
  slug: string;
  url: string;
  type: string;
  status: string;
  source: string;
  meta_title: string | null;
  meta_description: string | null;
  indexed: boolean;
  views: number;
  likes: number;
  last_updated: string;
  seo_score: number;
  last_audit_at?: string | null;
  audit_results?: any | null;
  index_status: string;
  h1_count?: number | null;
  h2_count?: number | null;
  content_length?: number | null;
  internal_links?: number | null;
  performance_score?: number | null;
  createdAt: string;
}

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

export interface AdminResultsData {
  results: Result[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default api;
