"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api, { TodayGameResult } from "@/lib/api";
import { Container, Section, Grid } from "@/components/ui/Grid";
import { GameCard } from "@/components/ui/GameCard";
import { Button } from "@/components/ui/Button";
import { useSiteSettings } from "@/hooks/useSiteSettings";

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
function CardSkeleton() {
    return (
        <div className="animate-pulse rounded-theme border border-border bg-surface p-5 shadow-sm">
            <div className="mb-4 flex justify-between">
                <div className="h-6 w-32 rounded bg-surface-secondary" />
                <div className="h-5 w-20 rounded-full bg-surface-secondary" />
            </div>
            <div className="mb-4 h-12 rounded-xl bg-surface-secondary/50" />
            <div className="mb-4 flex gap-2">
                <div className="flex-1 h-20 rounded-xl bg-surface-secondary" />
                <div className="flex-1 h-20 rounded-xl bg-surface-secondary" />
            </div>
            <div className="flex gap-2">
                <div className="flex-1 h-10 rounded-lg bg-surface-secondary" />
                <div className="flex-1 h-10 rounded-lg bg-surface-secondary" />
            </div>
        </div>
    );
}

/* ─── Props ──────────────────────────────────────────────────────────── */
interface TodaysResultsProps {
    /** Server-fetched initial data for SSR — ensures crawlers see real content */
    initialGames?: TodayGameResult[];
    initialDate?: string;
}

/* ─── Main Section ──────────────────────────────────────────────────────── */
export function TodaysResults({ initialGames, initialDate }: TodaysResultsProps) {
    const { settings } = useSiteSettings();
    const [today, setToday] = useState("");
    useEffect(() => {
        setToday(new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }));
    }, []);
    const { data, isLoading, error } = useQuery({
        queryKey: ["todays-results"],
        queryFn: () => api.results.getToday(),
        refetchInterval: 15 * 1000,
        // Use initialData to hydrate React Query so SSR content is shown immediately
        ...(initialGames ? {
            initialData: {
                data: {
                    success: true,
                    data: {
                        date: initialDate || new Date().toISOString().split("T")[0],
                        games: initialGames,
                    },
                },
            } as any,
        } : {}),
    });

    const games: TodayGameResult[] = data?.data?.data?.games || [];
    const declaredCount = games.filter((g) => g.status === "declared").length;
    const enabledGames = games.filter((g) => g.isEnabled);

    // If we have initialData, we never show the loading skeleton on SSR
    const showSkeleton = isLoading && !initialGames;

    return (
        <Section id="todays-results" background="gray" className="!py-20">
            <Container>
                {/* Section Header */}
                <div className="mb-12 flex flex-col items-center text-center">
                    <div className="mb-6">
                        <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
                            Live Teer Updates
                        </span>
                    </div>
                    <h2 className="mb-4 text-h1 text-gray-900">
                        Teer Result Today
                    </h2>
                    <p className="text-body text-gray-500" suppressHydrationWarning>{today}</p>
                    {!showSkeleton && (
                        <div className="mt-8 flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                <span>{enabledGames.length} Games Live Today</span>
                            </div>
                            <span className="text-gray-200">|</span>
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>{declaredCount} Official Results</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cards Grid */}
                {error ? (
                    <div className="rounded-3xl border border-red-100 bg-white p-20 text-center shadow-xl shadow-red-50">
                        <span className="text-5xl mb-4 block" role="img" aria-label="Warning">⚠️</span>
                        <p className="text-red-600 font-black text-xl mb-1">Results Unavailable</p>
                        <p className="text-gray-400 font-medium">Connecting to the live feed... Please refresh if results don&apos;t appear.</p>
                    </div>
                ) : showSkeleton ? (
                    <Grid cols={3}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </Grid>
                ) : enabledGames.length === 0 ? (
                    <div className="rounded-3xl border border-gray-100 bg-white p-20 text-center shadow-xl">
                        <p className="text-gray-500 font-bold text-xl">No games scheduled for today.</p>
                    </div>
                ) : (
                    <Grid cols={3}>
                        {enabledGames.map((game) => (
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

                {/* View All Link */}
                <div className="mt-16 text-center">
                    <Button variant="primary" href="/common-numbers" className="!px-10 !py-4 text-base shadow-xl shadow-primary/20 hover:-translate-y-1 transition-transform">
                        Get Tomorrow&apos;s Common Numbers
                        <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5-5 5M6 12h12" />
                        </svg>
                    </Button>
                </div>
            </Container>
        </Section>
    );
}
