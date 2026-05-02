"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";
import { GameHero } from "@/components/GameHero";
import { GameLiveCard } from "@/components/GameLiveCard";
import { Section, Container } from "@/components/ui/Grid";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import api, { Game, TeerResult } from "@/lib/api";

interface SiblingGame {
    name: string;
    displayName: string;
    location?: string;
}

interface GamePageClientProps {
    game: Game;
    gameSlug: string;
    todayResult: any | null;
    initialHistory: TeerResult[];
    siblingGames: SiblingGame[];
}

export function GamePageClient({
    game,
    gameSlug,
    todayResult: initialTodayResult,
    initialHistory,
    siblingGames,
}: GamePageClientProps) {
    // ─── Real-time Polling for Today's Result ────────────────────────────────
    const { data: liveData } = useQuery({
        queryKey: ["live-results"],
        queryFn: async () => {
            const res = await api.results.getToday();
            return res.data;
        },
        refetchInterval: 30 * 1000,
        staleTime: 10000,
    });

    // Extract this game's live result from the polled data
    const liveGames = liveData?.data?.games || [];
    const currentGame = liveGames.find(
        (g: any) => g.name.toLowerCase() === gameSlug.toLowerCase()
    ) || initialTodayResult;

    // Derive result values
    const round1 = currentGame?.result?.round1 || null;
    const round2 = currentGame?.result?.round2 || null;
    const round3 = currentGame?.result?.round3 || null;

    // Sanitize invalid values (0, empty string, "0") → show XX
    const sanitize = (val: string | null): string => {
        if (!val || val === "0" || val.trim() === "") return "XX";
        return val;
    };

    const fr = sanitize(round1);
    const sr = sanitize(round2);
    const tr = sanitize(round3);

    // Determine display status
    let currentStatus: "result_declared" | "open" | "closed" | "coming_soon" = "coming_soon";
    if (currentGame?.status === "declared") {
        currentStatus = "result_declared";
    } else if (currentGame?.status === "partial" || currentGame?.status === "searching" || currentGame?.status === "delayed") {
        currentStatus = "open";
    } else if (currentGame?.status === "off") {
        currentStatus = "closed";
    } else if (currentGame?.status === "waiting") {
        currentStatus = "coming_soon";
    }

    // ─── Lazy-Loaded Previous Results ────────────────────────────────────────
    const [historyResults, setHistoryResults] = useState<TeerResult[]>(initialHistory);
    const [historyPage, setHistoryPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialHistory.length >= 10);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = historyPage + 1;
            const res = await api.results.getHistory(gameSlug, { page: nextPage, limit: 10 });
            if (res.data?.success && res.data.data?.results) {
                const newResults = res.data.data.results;
                setHistoryResults((prev) => [...prev, ...newResults]);
                setHistoryPage(nextPage);
                if (newResults.length < 10) {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch {
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    }, [gameSlug, historyPage, hasMore, loadingMore]);

    // ─── Format helpers ──────────────────────────────────────────────────────
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <PageLayout>
            <main className="flex-1 bg-surface">
                {/* Section 1: Hero */}
                <GameHero
                    game={game.displayName}
                    location={game.location || "North East India"}
                    description={
                        game.description ||
                        `Verified live-feed and historical archives for ${game.displayName}. Get lightning-fast updates on round 1 and round 2 results.`
                    }
                    status={currentStatus === "result_declared" ? "Verified" : "Live"}
                    lastUpdated={
                        currentGame
                            ? new Date().toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })
                            : undefined
                    }
                />

                {/* Section 2: Live Result Board */}
                <section className="px-4 py-12 sm:px-6 lg:px-8 bg-surface">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border/50 pb-6">
                            <div className="flex flex-col gap-1 text-center md:text-left">
                                <h2 className="text-h2 text-foreground uppercase tracking-tight">
                                    Today&apos;s Results
                                </h2>
                                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
                                    Live Teer Verification
                                </p>
                            </div>
                            <Link
                                href="/live"
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                ALL TEER GAMES
                            </Link>
                        </div>

                        <GameLiveCard
                            game={game.displayName}
                            location={game.location || "N/A"}
                            startTime={game.startTime || "N/A"}
                            frTime={game.frTime || "N/A"}
                            srTime={game.srTime || "N/A"}
                            closeTime={game.closeTime || "N/A"}
                            first={fr}
                            second={sr}
                            third={tr}
                            trTime={game.trTime || "--"}
                            hasRound3={game.hasRound3 || false}
                            status={currentStatus}
                            lastUpdateMessage={`Official ${game.displayName} numbers confirmed.`}
                        />
                    </div>
                </section>

                {/* Section 3: Previous Results */}
                <Section background="white" className="!py-16">
                    <Container>
                        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/50 pb-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-h2 text-foreground uppercase tracking-tight">
                                    {game.displayName} Previous Results
                                </h2>
                                <p className="mt-2 text-sm font-medium text-foreground/40 uppercase tracking-widest">
                                    Verified historical results
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                href={`/${game.name.toLowerCase()}/previous-results`}
                                className="text-[10px] font-bold border border-border/50 hover:bg-surface-secondary"
                            >
                                VIEW ALL HISTORY →
                            </Button>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-border/50 bg-surface shadow-sm">
                            {/* Table Header */}
                            <div className={`grid ${game.hasRound3 ? "grid-cols-3 md:grid-cols-4" : "grid-cols-3"} bg-surface-secondary/50 px-6 py-4 border-b border-border/50`}>
                                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                                    Date
                                </span>
                                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest text-center">
                                    First Round
                                </span>
                                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest text-center">
                                    Second Round
                                </span>
                                {game.hasRound3 && (
                                    <span className="hidden md:block text-[10px] font-bold text-foreground/40 uppercase tracking-widest text-center">
                                        Special TR
                                    </span>
                                )}
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-border/50">
                                {historyResults.length === 0 ? (
                                    <div className="px-6 py-20 text-center">
                                        <p className="text-sm font-medium text-foreground/40">
                                            No results found for this game yet.
                                        </p>
                                    </div>
                                ) : (
                                    historyResults.map((result, idx) => (
                                        <div
                                            key={result.id || idx}
                                            className={`grid ${game.hasRound3 ? "grid-cols-3 md:grid-cols-4" : "grid-cols-3"} px-6 py-4 hover:bg-surface-secondary/20 transition-colors items-center`}
                                        >
                                            <span className="text-sm font-bold text-foreground">
                                                {formatDate(result.date)}
                                            </span>
                                            <div className="flex justify-center">
                                                <Badge variant="info" className="min-w-[40px] justify-center font-black !py-1">
                                                    {sanitize(result.round1)}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-center">
                                                <Badge variant="info" className="min-w-[40px] justify-center font-black !py-1">
                                                    {sanitize(result.round2)}
                                                </Badge>
                                            </div>
                                            {game.hasRound3 && (
                                                <div className="hidden md:flex justify-center">
                                                    <Badge variant="warning" className="min-w-[40px] justify-center font-black !py-1">
                                                        {sanitize(result.round3)}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Load More */}
                        {hasMore && (
                            <div className="mt-8 flex justify-center">
                                <Button
                                    variant="outline"
                                    onClick={loadMore}
                                    className="text-[11px] font-bold uppercase tracking-widest px-10 py-3 rounded-xl border-border hover:bg-surface-secondary transition-all"
                                >
                                    {loadingMore ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                            Loading...
                                        </span>
                                    ) : (
                                        "Load More Results"
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Info Banner */}
                        <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                            <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-xs font-medium text-foreground/70 leading-relaxed">
                                        Results are updated automatically within 60 seconds of official publication.
                                        Historical data is verified against 3 independent sources for 100% accuracy.
                                    </p>
                                </div>
                                <Badge variant="success" className="text-[10px]">VERIFIED FEED</Badge>
                            </div>
                        </div>
                    </Container>
                </Section>

                {/* Section 4: Other Live Games (Internal Linking) */}
                {siblingGames.length > 0 && (
                    <Section background="gray" className="!py-16 border-y border-gray-100">
                        <Container>
                            <div className="mb-10 text-center">
                                <h2 className="text-h2 text-foreground uppercase tracking-tight mb-2">
                                    Other Live Games
                                </h2>
                                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
                                    Explore more teer games
                                </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {siblingGames.map((sg) => (
                                    <Link
                                        key={sg.name}
                                        href={`/live/${sg.name.toLowerCase()}`}
                                        className="group flex flex-col items-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight group-hover:text-primary transition-colors">
                                            {sg.displayName}
                                        </h3>
                                        {sg.location && (
                                            <p className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                {sg.location}
                                            </p>
                                        )}
                                        <span className="mt-3 text-[10px] font-bold text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                            View Live →
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </Container>
                    </Section>
                )}

                {/* Section 5: SEO Content Block */}
                <Section background="white" className="!py-20 border-t border-border/50">
                    <Container>
                        <div className="mx-auto max-w-4xl">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
                                {game.displayName} Teer Result Today
                            </h2>
                            <div className="grid gap-8 md:grid-cols-2 text-sm text-gray-600 leading-relaxed">
                                <div className="space-y-4">
                                    <p>
                                        The <strong className="text-gray-900 font-bold">{game.displayName} Teer Result Today</strong> is
                                        one of the most searched teer results in the North East India region. Updated in real-time,
                                        our platform provides verified First Round (FR) and Second Round (SR) results directly from
                                        official archery counters.
                                    </p>
                                    <p>
                                        Check the <strong className="text-gray-900 font-bold">Live Teer Result</strong> above for
                                        today&apos;s official numbers. Results are typically declared after each round of archery and
                                        verified against multiple independent sources before publication.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <p>
                                        Looking for <strong className="text-gray-900 font-bold">Teer Common Numbers</strong>? Visit
                                        our{" "}
                                        <Link href="/common-numbers" className="text-primary font-bold hover:underline">
                                            Common Numbers
                                        </Link>{" "}
                                        page for daily predictions based on historical data analysis and proven mathematical models.
                                    </p>
                                    <p>
                                        For a complete archive of previous {game.displayName} results, check the history section above
                                        or visit the{" "}
                                        <Link href="/results" className="text-primary font-bold hover:underline">
                                            Results Archive
                                        </Link>{" "}
                                        page. Our database maintains complete records verified for accuracy.
                                    </p>
                                    <p className="text-sm pt-4 border-t border-gray-100">
                                        Official results provided for educational and analytic purposes. View our{" "}
                                        <Link href="/disclaimer" className="text-primary hover:underline">
                                            Disclaimer
                                        </Link>{" "}
                                        for more information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Container>
                </Section>
            </main>
        </PageLayout>
    );
}
