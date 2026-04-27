import axios from "axios";
import { env } from "./env";

const API_BASE_URL = env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

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
    settings: {
        get: () => apiClient.get<{ success: boolean; data: any }>("/settings"),
    }
};

export default api;

