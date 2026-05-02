"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";
import { Button } from "@/components/ui/Button";
import api, { Game, TeerResult } from "@/lib/api";

interface SiblingGame { name: string; displayName: string; location?: string; }
interface GamePageClientProps {
    game: Game;
    gameSlug: string;
    todayResult: any | null;
    initialHistory: TeerResult[];
    siblingGames: SiblingGame[];
}

const sanitize = (val: string | null): string => {
    if (!val || val === "0" || val.trim() === "") return "XX";
    return val;
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export function GamePageClient({ game, gameSlug, todayResult: initialTodayResult, initialHistory, siblingGames }: GamePageClientProps) {
    const { data: liveData } = useQuery({
        queryKey: ["live-results"],
        queryFn: async () => { const res = await api.results.getToday(); return res.data; },
        refetchInterval: 30 * 1000,
        staleTime: 10000,
    });

    const liveGames = liveData?.data?.games || [];
    const currentGame = liveGames.find((g: any) => g.name.toLowerCase() === gameSlug.toLowerCase()) || initialTodayResult;

    const fr = sanitize(currentGame?.result?.round1 || null);
    const sr = sanitize(currentGame?.result?.round2 || null);
    const tr = sanitize(currentGame?.result?.round3 || null);

    const isDeclared = currentGame?.status === "declared";
    const isPartial = currentGame?.status === "partial" || currentGame?.status === "searching" || currentGame?.status === "delayed";
    const isOff = currentGame?.status === "off";

    // Previous results with lazy loading
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
                const nr = res.data.data.results;
                setHistoryResults((prev) => [...prev, ...nr]);
                setHistoryPage(nextPage);
                if (nr.length < 10) setHasMore(false);
            } else setHasMore(false);
        } catch { setHasMore(false); }
        finally { setLoadingMore(false); }
    }, [gameSlug, historyPage, hasMore, loadingMore]);

    return (
        <PageLayout>
            <main className="flex-1">
                {/* ══════════════════ HERO ══════════════════ */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
                    {/* Ambient glow effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-3xl" />
                        <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-500/5 rounded-full blur-3xl" />
                        {/* Grid pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
                        {/* Top badges */}
                        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                                </span>
                                {isDeclared ? "Result Declared" : isPartial ? "Live Now" : isOff ? "Market Closed" : "Awaiting Result"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {game.location || "North East India"}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-center mb-6">
                            <span className="block text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05]">
                                {game.displayName}
                            </span>
                            <span className="block text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-indigo-300/80 mt-1">
                                Teer Result Today
                            </span>
                        </h1>
                        <p className="text-center text-sm md:text-base text-white/40 font-medium max-w-xl mx-auto mb-14 leading-relaxed">
                            {game.description || `Verified live-feed and historical archives for ${game.displayName}. Lightning-fast FR & SR updates from official counters.`}
                        </p>

                        {/* ═══ LIVE RESULT BOARD ═══ */}
                        <div className="max-w-3xl mx-auto">
                            <div className={`relative rounded-3xl border overflow-hidden backdrop-blur-xl transition-all duration-700 ${isDeclared ? "bg-white/[0.07] border-indigo-400/20 shadow-2xl shadow-indigo-500/20" : "bg-white/[0.04] border-white/10 shadow-2xl shadow-black/20"}`}>
                                {/* Shimmer top border */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

                                {/* Card header */}
                                <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 flex items-center justify-between border-b border-white/5">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300/60 mb-1">Official Winning Numbers</p>
                                        <p className="text-[11px] font-bold text-white/30">
                                            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">teer.club</span>
                                    </div>
                                </div>

                                {/* Result numbers */}
                                <div className={`px-6 md:px-8 py-8 md:py-10 grid gap-4 md:gap-6 ${game.hasRound3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2"}`}>
                                    {/* FR */}
                                    <div className={`group relative flex flex-col items-center justify-center rounded-2xl p-6 md:p-8 border transition-all duration-500 ${fr !== "XX" ? "bg-gradient-to-b from-indigo-500/10 to-indigo-600/5 border-indigo-400/20 hover:border-indigo-400/40 hover:shadow-lg hover:shadow-indigo-500/10" : "bg-white/[0.02] border-white/5 border-dashed"}`}>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300/50 mb-4">
                                            FR · {game.frTime || "—"}
                                        </span>
                                        <span className={`text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter transition-all duration-500 ${fr !== "XX" ? "text-white drop-shadow-[0_0_30px_rgba(129,140,248,0.3)]" : "text-white/10"}`}>
                                            {fr}
                                        </span>
                                    </div>

                                    {/* SR */}
                                    <div className={`group relative flex flex-col items-center justify-center rounded-2xl p-6 md:p-8 border transition-all duration-500 ${sr !== "XX" ? "bg-gradient-to-b from-violet-500/10 to-violet-600/5 border-violet-400/20 hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/10" : "bg-white/[0.02] border-white/5 border-dashed"}`}>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300/50 mb-4">
                                            SR · {game.srTime || "—"}
                                        </span>
                                        <span className={`text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter transition-all duration-500 ${sr !== "XX" ? "text-white drop-shadow-[0_0_30px_rgba(167,139,250,0.3)]" : "text-white/10"}`}>
                                            {sr}
                                        </span>
                                    </div>

                                    {/* TR */}
                                    {game.hasRound3 && (
                                        <div className={`col-span-2 md:col-span-1 group relative flex flex-col items-center justify-center rounded-2xl p-6 md:p-8 border transition-all duration-500 ${tr !== "XX" ? "bg-gradient-to-b from-amber-500/10 to-amber-600/5 border-amber-400/20" : "bg-white/[0.02] border-white/5 border-dashed"}`}>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300/50 mb-4">
                                                TR · {game.trTime || "Special"}
                                            </span>
                                            <span className={`text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter ${tr !== "XX" ? "text-white" : "text-white/10"}`}>
                                                {tr}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Card footer */}
                                <div className="px-6 md:px-8 py-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            Verified Source
                                        </span>
                                        <span className="hidden md:inline text-[10px] font-bold text-white/15 uppercase tracking-widest">
                                            Auto-refresh: 30s
                                        </span>
                                    </div>
                                    <Link href="/live" className="text-[10px] font-bold text-indigo-300/60 hover:text-indigo-300 uppercase tracking-widest transition-colors">
                                        ← All Games
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                </section>

                {/* ══════════════════ PREVIOUS RESULTS TABLE ══════════════════ */}
                <section className="bg-white py-16 md:py-24">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Section header */}
                        <div className="mb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-8 border-b border-gray-100">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Historical Archive
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                    {game.displayName} <span className="text-indigo-600">Previous Results</span>
                                </h2>
                                <p className="mt-2 text-sm text-gray-400 font-medium">Verified results from official counters</p>
                            </div>
                            <Button variant="ghost" href={`/${game.name.toLowerCase()}/previous-results`} className="text-[10px] font-bold border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all !rounded-xl">
                                VIEW FULL ARCHIVE →
                            </Button>
                        </div>

                        {/* ═══ THE TABLE ═══ */}
                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            {/* Table head */}
                            <div className={`grid ${game.hasRound3 ? "grid-cols-4" : "grid-cols-3"} bg-gray-900 text-white`}>
                                <div className="px-5 md:px-6 py-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date</span>
                                </div>
                                <div className="px-5 md:px-6 py-4 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">F/R</span>
                                </div>
                                <div className="px-5 md:px-6 py-4 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">S/R</span>
                                </div>
                                {game.hasRound3 && (
                                    <div className="px-5 md:px-6 py-4 text-center">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">T/R</span>
                                    </div>
                                )}
                            </div>

                            {/* Table body */}
                            <div>
                                {historyResults.length === 0 ? (
                                    <div className="px-6 py-20 text-center bg-gray-50">
                                        <p className="text-sm font-medium text-gray-400">No results found yet.</p>
                                    </div>
                                ) : (
                                    historyResults.map((result, idx) => (
                                        <div
                                            key={result.id || idx}
                                            className={`grid ${game.hasRound3 ? "grid-cols-4" : "grid-cols-3"} items-center border-b border-gray-100 last:border-b-0 transition-colors duration-200 hover:bg-indigo-50/40 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                                        >
                                            <div className="px-5 md:px-6 py-4">
                                                <span className="text-sm font-bold text-gray-800 tracking-tight">{formatDate(result.date)}</span>
                                            </div>
                                            <div className="px-5 md:px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center min-w-[44px] px-3 py-1.5 rounded-lg text-sm font-black tracking-tight transition-all ${sanitize(result.round1) !== "XX" ? "bg-indigo-100 text-indigo-700 shadow-sm" : "bg-gray-100 text-gray-300"}`}>
                                                    {sanitize(result.round1)}
                                                </span>
                                            </div>
                                            <div className="px-5 md:px-6 py-4 text-center">
                                                <span className={`inline-flex items-center justify-center min-w-[44px] px-3 py-1.5 rounded-lg text-sm font-black tracking-tight transition-all ${sanitize(result.round2) !== "XX" ? "bg-violet-100 text-violet-700 shadow-sm" : "bg-gray-100 text-gray-300"}`}>
                                                    {sanitize(result.round2)}
                                                </span>
                                            </div>
                                            {game.hasRound3 && (
                                                <div className="px-5 md:px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center min-w-[44px] px-3 py-1.5 rounded-lg text-sm font-black tracking-tight ${sanitize(result.round3) !== "XX" ? "bg-amber-100 text-amber-700 shadow-sm" : "bg-gray-100 text-gray-300"}`}>
                                                        {sanitize(result.round3)}
                                                    </span>
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
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-gray-900/20 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingMore ? (
                                        <>
                                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            Load More Results
                                            <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Verified feed note */}
                        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <p className="text-xs font-medium text-emerald-800/70 leading-relaxed">
                                    All results are verified against <strong className="text-emerald-900">3 independent sources</strong> and updated within 60 seconds of official publication.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════ OTHER LIVE GAMES ══════════════════ */}
                {siblingGames.length > 0 && (
                    <section className="bg-gray-50 py-16 md:py-20 border-y border-gray-100">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2">
                                    Explore More <span className="text-indigo-600">Live Games</span>
                                </h2>
                                <p className="text-sm text-gray-400 font-medium">Check results for other teer markets</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                                {siblingGames.map((sg) => (
                                    <Link
                                        key={sg.name}
                                        href={`/live/${sg.name.toLowerCase()}`}
                                        className="group relative flex flex-col items-center p-5 md:p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/0 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="relative z-10">
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors text-center">
                                                {sg.displayName}
                                            </h3>
                                            {sg.location && (
                                                <p className="mt-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{sg.location}</p>
                                            )}
                                            <div className="mt-3 flex justify-center">
                                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                                    View Live →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ══════════════════ SEO CONTENT ══════════════════ */}
                <section className="bg-white py-16 md:py-24 border-t border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
                            {game.displayName} Teer Result Today
                        </h2>
                        <div className="grid gap-8 md:grid-cols-2 text-sm text-gray-500 leading-relaxed">
                            <div className="space-y-4">
                                <p>
                                    The <strong className="text-gray-900">{game.displayName} Teer Result Today</strong> is one of the most searched teer results in the North East India region. Updated in real-time, our platform provides verified First Round (FR) and Second Round (SR) results directly from official archery counters.
                                </p>
                                <p>
                                    Check the <strong className="text-gray-900">Live Teer Result</strong> above for today&apos;s official numbers. Results are verified against multiple independent sources before publication.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <p>
                                    Looking for <strong className="text-gray-900">Teer Common Numbers</strong>? Visit our{" "}
                                    <Link href="/common-numbers" className="text-indigo-600 font-bold hover:underline">Common Numbers</Link>{" "}
                                    page for daily predictions based on historical data analysis.
                                </p>
                                <p>
                                    For a complete archive, visit the{" "}
                                    <Link href="/results" className="text-indigo-600 font-bold hover:underline">Results Archive</Link>.{" "}
                                    Official results provided for educational purposes. View our{" "}
                                    <Link href="/disclaimer" className="text-indigo-600 hover:underline">Disclaimer</Link>.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PageLayout>
    );
}
