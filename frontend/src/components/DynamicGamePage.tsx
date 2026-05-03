"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Header } from "@/components/Header";
import { DarkHero, HeroBadge } from "@/components/layout/DarkHero";
import { TrafficGrid } from "@/components/layout/TrafficGrid";
import { GameLiveCard } from "@/components/GameLiveCard";
import { GamePreviousResults } from "@/components/GamePreviousResults";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { LiveDiscussion } from "@/components/LiveDiscussion";

const MoreByTeerClub = dynamic(() => import("@/components/MoreByTeerClub").then((mod) => mod.MoreByTeerClub));

interface DynamicGamePageProps {
    gameName: string;
    initialGame?: any;
    initialResults?: any;
}

export function DynamicGamePage({ gameName, initialGame, initialResults }: DynamicGamePageProps) {
    // Fetch Game Metadata
    const { data: gameResponse, isLoading: gameLoading, error: gameError } = useQuery({
        queryKey: ["game", gameName],
        queryFn: () => api.games.getById(gameName),
        initialData: initialGame ? { data: { success: true, data: initialGame } } as any : undefined,
    });

    // Fetch Results (Historical + Today)
    const { data: resultsResponse, isLoading: resultsLoading, error: resultsError } = useQuery({
        queryKey: ["results", gameName],
        queryFn: () => api.results.getDashboard({ gameId: gameResponse?.data?.data?.id, limit: 10 }),
        enabled: !!gameResponse?.data?.data?.id,
        initialData: initialResults ? { data: { success: true, data: { results: initialResults } } } as any : undefined,
        refetchInterval: 30 * 1000,
        refetchOnWindowFocus: true
    });

    if (gameLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-surface">
                <Header />
                <div className="flex-1 flex items-center justify-center p-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest animate-pulse">Checking Live Updates...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const game = gameResponse?.data?.data;
    if (!game || (gameError as any)?.response?.status === 404) {
        notFound();
    }

    if (resultsError) {
        return (
            <div className="flex min-h-screen flex-col bg-surface">
                <Header />
                <div className="flex-1 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md p-8 rounded-3xl border border-error/20 bg-error/5 shadow-xl shadow-error/5">
                        <span className="text-4xl mb-4 block">⚠️</span>
                        <h2 className="text-xl font-bold text-error-text mb-2">Connection Error</h2>
                        <p className="text-sm text-error-text/70 leading-relaxed mb-6">
                            We&apos;re currently unable to reach the results server. Please try again in a few moments.
                        </p>
                        <Button onClick={() => window.location.reload()} variant="primary" className="w-full">
                            RETRY
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    const results = resultsResponse?.data?.data?.results || [];
    const latestResult = results[0];

    // Determine Status
    let currentStatus: "result_declared" | "open" | "closed" | "coming_soon" = "open";

    // Check if the latest result is from "Today" (roughly)
    const isToday = latestResult && new Date(latestResult.date).toDateString() === new Date().toDateString();

    if (isToday && latestResult.round1 && latestResult.round1 !== "XX" && latestResult.round2 && latestResult.round2 !== "XX") {
        currentStatus = "result_declared";
    } else if (isToday && latestResult.round1 && latestResult.round1 !== "XX") {
        currentStatus = "open"; // Partial results = Live update
    }

    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <Header />
            <main className="flex-1">
                <DarkHero
                    breadcrumbs={[
                        { label: "Home", href: "/" },
                        { label: "Live Results", href: "/live" },
                        { label: `${game.displayName} Live` },
                    ]}
                    title={
                        <>
                            {game.displayName}{" "}
                            <span className="text-indigo-300/80">Teer Live Result</span>
                        </>
                    }
                    badges={
                        <HeroBadge>
                            {currentStatus === "result_declared" ? "✓ Result Declared" : "● Polling Live"}
                        </HeroBadge>
                    }
                    cta={{
                        label: "View Previous Results",
                        href: `/results/${game.name}/previous-results`,
                    }}
                />

                <TrafficGrid gameId={game.name} />

                <section className="px-4 py-12 sm:px-6 lg:px-8 bg-surface">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border/50 pb-6">
                            <div className="flex flex-col gap-1 text-center md:text-left">
                                <h2 className="text-h2 text-foreground uppercase tracking-tight">Today&apos;s Results</h2>
                                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">Live Teer Verification</p>
                            </div>
                            <Link
                                href="/results"
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                ALL TEER GAMES
                            </Link>
                        </div>

                        {resultsLoading ? (
                            <div className="h-64 flex flex-col items-center justify-center bg-surface-secondary/20 rounded-3xl border border-dashed border-border/50">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Polling Data...</p>
                            </div>
                        ) : (
                            <GameLiveCard
                                game={game.displayName}
                                location={game.location || "N/A"}
                                startTime={game.startTime || "N/A"}
                                frTime={game.frTime || "N/A"}
                                srTime={game.srTime || "N/A"}
                                closeTime={game.closeTime || "N/A"}
                                first={isToday ? (latestResult?.round1 || "--") : "--"}
                                second={isToday ? (latestResult?.round2 || "--") : "--"}
                                third={isToday ? (latestResult?.round3 || "--") : "--"}
                                trTime={game.trTime || "--"}
                                hasRound3={game.hasRound3 || false}
                                status={currentStatus}
                                lastUpdateMessage={`Official ${game.displayName} numbers confirmed.`}
                            />
                        )}
                        
                        {/* The Next Step Hook - Retention Loop */}
                        {currentStatus === "result_declared" && (
                            <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-center text-white shadow-xl shadow-blue-900/20 animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative z-10">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white mb-4">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                                        Next Action Required
                                    </span>
                                    <h3 className="text-xl md:text-2xl font-bold mb-3 tracking-tight">
                                        Result Declared. What's Tomorrow's Target?
                                    </h3>
                                    <p className="text-blue-100 mb-6 text-sm md:text-base max-w-2xl mx-auto">
                                        Don't leave yet! Our algorithm has already analyzed today's {game.displayName} result to predict tomorrow's highly accurate common numbers and house ending.
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        href={`/common-numbers/${game.name.toLowerCase()}`}
                                        className="!bg-white !text-blue-700 !border-white hover:!bg-blue-50 font-bold px-8 py-3 shadow-lg shadow-black/10 hover:-translate-y-1 transition-transform"
                                    >
                                        Verify Tomorrow's Target
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="px-4 py-8 sm:px-6 lg:px-8 bg-surface-secondary/20">
                    <div className="mx-auto max-w-7xl">
                        <LiveDiscussion gameId={game.id} />
                    </div>
                </section>

                <GamePreviousResults
                    game={game.displayName}
                    gameName={game.name}
                    hasRound3={game.hasRound3 || false}
                    results={results.map(r => ({
                        date: new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                        fr: r.round1 || "--",
                        sr: r.round2 || "--",
                        tr: r.round3 || "--"
                    }))}
                />

                <MoreByTeerClub />
            </main>
            <Footer />
        </div>
    );
}
