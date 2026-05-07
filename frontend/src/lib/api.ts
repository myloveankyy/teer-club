import axios from "axios";
import { env } from "./env";

// On the server (SSR), prefer the internal URL (localhost) for speed & reliability.
// On the client (browser), always use the public URL.
const isServer = typeof window === "undefined";
let INTERNAL_API_URL: string | undefined = undefined;
if (isServer && typeof process !== "undefined" && process.env) {
    INTERNAL_API_URL = process.env.INTERNAL_API_URL;
}
const API_BASE_URL = INTERNAL_API_URL || env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // SSR calls use a short timeout to avoid blocking the render pipeline.
    // Client-side calls can afford a longer timeout.
    timeout: isServer ? 5000 : 10000,
});

// Resiliency: Retry mechanisms and clear API error mapping
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config as any;
        if (!config || config._isRetryAttempt === undefined) {
            if (config) config._isRetryAttempt = 0;
        }

        // On the server (SSR), only retry ONCE with a short delay to avoid blocking rendering.
        // On the client, retry up to 3 times with exponential backoff.
        const maxRetries = isServer ? 1 : 3;

        if (config && config._isRetryAttempt < maxRetries && (!error.response || error.response.status >= 500)) {
            config._isRetryAttempt += 1;
            const delay = isServer ? 500 : Math.pow(2, config._isRetryAttempt) * 1000;
            const delayRetry = new Promise((resolve) => setTimeout(resolve, delay));
            await delayRetry;
            return apiClient(config);
        }

        // Ensure clear API responses
        const structuredError = new Error(
            error.response?.data?.error || error.message || "An unexpected error occurred during API communication"
        );
        (structuredError as any).status = error.response?.status;
        (structuredError as any).originalBody = error.response?.data;
        return Promise.reject(structuredError);
    }
);

export interface Game {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    location?: string;
    startTime?: string;
    frTime?: string;
    srTime?: string;
    trTime?: string;
    closeTime?: string;
    hasRound3?: boolean;
    isEnabled: boolean;
}

export interface TeerResult {
    id: string;
    gameId: string;
    date: string;
    round1: string | null;
    round2: string | null;
    round3: string | null;
    confidence: string;
    verified: boolean;
    game?: Partial<Game>;
}

export interface TodayGameResult {
    id: string;
    name: string;
    displayName: string;
    location?: string;
    frTime: string | null;
    srTime: string | null;
    trTime: string | null;
    hasRound3: boolean;
    startTime: string | null;
    closeTime: string | null;
    isEnabled: boolean;
    isDelayed: boolean;
    delayNote: string | null;
    result: {
        id: string;
        date: string;
        round1: string | null;
        round2: string | null;
        round3: string | null;
        confidence: string;
        verified: boolean;
    } | null;
    status: "waiting" | "declared" | "partial" | "off" | "searching" | "failed" | "delayed";
    prediction: {
        house: string;
        ending: string;
        directNumber: string;
        commonNumbers: string[];
        houseMatch: boolean;
        endingMatch: boolean;
        directMatch: boolean;
    } | null;
}

export const api = {
    games: {
        getAll: () => apiClient.get<{ success: boolean; data: Game[] }>("/games"),
        getById: (id: string) => apiClient.get<{ success: boolean; data: Game }>(`/games/${id}`),
    },
    results: {
        getToday: () =>
            apiClient.get<{ success: boolean; data: { date: string; games: TodayGameResult[] } }>("/results/today"),
        getByGameAndDate: (gameId: string, date: string) =>
            apiClient.get<{ success: boolean; data: any }>(`/results/${gameId}/${date}`),
        getDashboard: (params?: { gameId?: string; limit?: number; from?: string; to?: string }) =>
            apiClient.get<{ success: boolean; data: { results: TeerResult[]; games: Game[]; byGame: Record<string, TeerResult[]> } }>("/results/dashboard", { params }),
        getLatest: () => apiClient.get<{ success: boolean; data: { results: TeerResult[] } }>("/results/dashboard", { params: { limit: 20 } }),
        getHistory: (gameIdentifier: string, params?: { page?: number; limit?: number; from?: string; to?: string }) => {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.append("page", params.page.toString());
            if (params?.limit) searchParams.append("limit", params.limit.toString());
            if (params?.from) searchParams.append("from", params.from);
            if (params?.to) searchParams.append("to", params.to);
            const query = searchParams.toString();
            return apiClient.get<{
                success: boolean;
                data: {
                    game: Game;
                    results: TeerResult[];
                    pagination: { total: number; page: number; limit: number; totalPages: number };
                };
            }>(`/results/${gameIdentifier}/history${query ? `?${query}` : ""}`);
        },
        getNumberStats: (number: string) =>
            apiClient.get<{ success: boolean; data: { number: string; stats: any; history: any[] } }>(`/results/number/${number}`),
    },
    predictions: {
        getArchive: (gameIdentifier: string, params?: { page?: number; limit?: number }) => {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.append("page", params.page.toString());
            if (params?.limit) searchParams.append("limit", params.limit.toString());
            const query = searchParams.toString();
            return apiClient.get<{
                success: boolean;
                data: {
                    game: Game;
                    predictions: any[];
                    pagination: { total: number; page: number; limit: number; totalPages: number };
                };
            }>(`/predictions/${gameIdentifier}${query ? `?${query}` : ""}`);
        },
        getTodayAll: () =>
            apiClient.get<{ success: boolean; data: { date: string; predictions: any[] } }>("/predictions/today/all"),
        getHistory: (params?: { page?: number; limit?: number }) =>
            apiClient.get<{ success: boolean; data: { history: any[]; pagination: any } }>("/predictions/history", { params }),
        getByDate: (date: string) =>
            apiClient.get<{ success: boolean; data: { date: string; predictions: any[] } }>(`/predictions/by-date/${date}`),
        getToday: (gameIdentifier: string) =>
            apiClient.get<{ success: boolean; data: any }>(`/predictions/${gameIdentifier}/today`),
    },
    pages: {
        getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
            const searchParams = new URLSearchParams();
            if (params?.page) searchParams.append("page", params.page.toString());
            if (params?.limit) searchParams.append("limit", params.limit.toString());
            if (params?.search) searchParams.append("search", params.search);
            if (params?.status) searchParams.append("status", params.status);
            if (params?.type) searchParams.append("type", params.type);
            const query = searchParams.toString();
            return apiClient.get<{ success: boolean; data: { pages: any[]; pagination: any } }>(`/pages${query ? `?${query}` : ""}`);
        },
        getByUrl: (url: string) => apiClient.get<{ success: boolean; data: any }>(`/pages/by-url`, { params: { url } })
    },
    settings: {
        get: () => apiClient.get<{ success: boolean; data: any }>("/settings"),
        seo: {
            get: () => apiClient.get<{ success: boolean; data: any }>("/settings/seo"),
        },
        notifications: {
            get: () => apiClient.get<{ success: boolean; data: any }>("/settings/notifications"),
            getVapid: () => apiClient.get<{ success: boolean; data: { publicKey: string } }>("/settings/notifications/vapid-key"),
            subscribe: (data: any) => apiClient.post("/settings/notifications/subscribe", data)
        }
    },
    comments: {
        getAll: (params?: { gameId?: string; date?: string; limit?: number }) => {
            const searchParams = new URLSearchParams();
            if (params?.gameId) searchParams.append("gameId", params.gameId);
            if (params?.date) searchParams.append("date", params.date);
            if (params?.limit) searchParams.append("limit", params.limit.toString());
            const query = searchParams.toString();
            return apiClient.get<{ success: boolean; data: any }>(`/comments${query ? `?${query}` : ""}`);
        },
        create: (data: { content: string; author?: string; gameId?: string; date?: string }) => 
            apiClient.post<{ success: boolean; data: any; error?: string }>("/comments", data)
    },
    dreams: {
        getAll: () => apiClient.get<{ success: boolean; data: any[] }>("/dreams"),
        getBySlug: (slug: string) => apiClient.get<{ success: boolean; data: any }>(`/dreams/${slug}`),
        create: (data: any) => apiClient.post<{ success: boolean; data: any; error?: string }>("/dreams", data),
        update: (id: string, data: any) => apiClient.put<{ success: boolean; data: any; error?: string }>(`/dreams/${id}`, data),
        delete: (id: string) => apiClient.delete<{ success: boolean; error?: string }>(`/dreams/${id}`),
        migrate: (data: { dreams: any[] }) => apiClient.post<{ success: boolean; data: any; error?: string }>("/dreams/migrate", data)
    }
};

export default api;
