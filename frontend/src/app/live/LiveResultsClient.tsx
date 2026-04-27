"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api, { TodayGameResult } from "@/lib/api";
import { Grid } from "@/components/ui/Grid";
import { GameCard } from "@/components/ui/GameCard";
import { Button } from "@/components/ui/Button";
import { SiteSettings } from "@/hooks/useSiteSettings";

interface LiveResultsClientProps {
    initialData: any;
    settings: SiteSettings | undefined;
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function LiveCardSkeleton() {
    return (
        <div className="animate-pulse rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-6">
                <div className="h-5 w-32 rounded bg-gray-100 mb-2"></div>
                <div className="h-3 w-20 rounded bg-gray-50"></div>
            </div>
            <div className="space-y-3 mb-6">
                <div className="h-14 w-full rounded-2xl bg-gray-50"></div>
                <div className="h-14 w-full rounded-2xl bg-gray-50"></div>
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center">
                    <div className="h-3 w-12 rounded bg-gray-50"></div>
                    <div className="h-6 w-20 rounded-full bg-gray-100"></div>
                </div>
                <div className="h-12 w-full rounded-xl bg-gray-100"></div>
            </div>
        </div>
    );
}

export function LiveResultsClient({ initialData, settings }: LiveResultsClientProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data, isLoading, error, dataUpdatedAt } = useQuery({
        queryKey: ["live-results"],
        queryFn: async () => {
            const res = await api.results.getToday();
            return res.data;
        },
        refetchInterval: 10 * 1000,
        staleTime: 5000,
        initialData: initialData
    });

    const games = data?.data?.games || [];

    // Hydration-safe synchronization indicator
    const [lastSync, setLastSync] = useState<string | null>(null);

    useEffect(() => {
        if (dataUpdatedAt) {
            setLastSync(new Date(dataUpdatedAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }));
        }
    }, [dataUpdatedAt]);

    if (error) {
        return (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-red-50 shadow-2xl shadow-red-50/50">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 text-red-500 mb-6 mx-auto">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Update Interrupted</h3>
                <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">Unable to reach the live results hub. Please check your connection.</p>
                <Button variant="primary" className="mt-8 rounded-xl px-8" onClick={() => window.location.reload()}>Refresh Live Results</Button>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Sync Status - Client-only render to avoid hydration mismatch */}
            {mounted && lastSync && (
                <div className="flex items-center justify-center md:justify-start">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[10px] font-bold text-emerald-600 uppercase tracking-widest rounded-full border border-emerald-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Last Updated: {lastSync}
                    </div>
                </div>
            )}

            <div aria-live="polite" aria-busy={isLoading}>
                {isLoading && !data ? (
                    <Grid cols={4}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <LiveCardSkeleton key={i} />
                        ))}
                    </Grid>
                ) : games.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.05),transparent)] opacity-100" />
                        <div className="relative">
                            <div className="text-5xl mb-6 grayscale opacity-40">⏳</div>
                            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight mb-2">Standing By</h3>
                            <p className="text-sm text-gray-500 font-medium">Waiting for the first official result pulse of the day.</p>
                        </div>
                    </div>
                ) : (
                    <Grid cols={4}>
                        {games.filter((g: TodayGameResult) => g.isEnabled).map((game: TodayGameResult) => (
                            <GameCard
                                key={game.id}
                                game={game}
                                customMessages={{
                                    waiting: settings?.resultAwaitedText,
                                    off: settings?.sundayOffText
                                }}
                            />
                        ))}
                    </Grid>
                )}
            </div>
        </div>
    );
}
