"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { PageLayout } from "@/components/shared/PageLayout";
import { Badge } from "@/components/ui/Badge";

interface PreviousResultsPageProps {
    gameId: string;
}

const THREE_ROUND_GAMES = ["laitlyngkot"];

export function PreviousResultsPage({ gameId }: PreviousResultsPageProps) {
    const [page, setPage] = useState(1);
    const limit = 30;
    const hasRound3 = THREE_ROUND_GAMES.includes(gameId.toLowerCase());

    const { data: response, isLoading, error } = useQuery({
        queryKey: ["previous-results", gameId, page],
        queryFn: () => api.results.getHistory(gameId, { page, limit }),
        placeholderData: keepPreviousData,
    });

    const { data: predResponse } = useQuery({
        queryKey: ["predictions-archive", gameId, page],
        queryFn: () => api.predictions.getArchive(gameId, { page, limit }),
        placeholderData: keepPreviousData,
    });

    const predictionsByDate = new Map();
    if (predResponse?.data?.data?.predictions) {
        for (const p of predResponse.data.data.predictions) {
            predictionsByDate.set(p.date.split("T")[0], p);
        }
    }

    const data = response?.data?.data;
    const game = data?.game;
    const results = data?.results || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;
    const gameName = game?.displayName || gameId.charAt(0).toUpperCase() + gameId.slice(1);

    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push("...");
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
            if (page < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    if (error) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center p-12 rounded-2xl border border-red-100 bg-red-50/50 max-w-md">
                        <span className="text-4xl mb-4 block">⚠️</span>
                        <p className="text-red-600 font-black text-lg mb-1 uppercase tracking-tight">Sync Error</p>
                        <p className="text-gray-500 font-medium text-sm">Check your connection and try again.</p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <main className="flex-1">
                {/* ══════════════════ HERO ══════════════════ */}
                <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-40 -left-32 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
                    </div>

                    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30 mb-8">
                            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
                            <span>→</span>
                            <Link href="/results" className="hover:text-white/60 transition-colors">Results</Link>
                            <span>→</span>
                            <span className="text-indigo-300/70">{gameName} History</span>
                        </nav>

                        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-[1.05] mb-3">
                                    {gameName} <span className="text-indigo-300/80">Teer Previous Results</span>
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                        {pagination?.total?.toLocaleString() || "..."} Verified Results
                                    </span>
                                    {hasRound3 && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-300/70 uppercase tracking-widest">
                                            Special TR Active
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Link
                                href={`/live/${gameId}`}
                                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                </span>
                                Check Live Results
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ══════════════════ TRAFFIC GRID ══════════════════ */}
                <section className="bg-white border-b border-gray-100">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <Link href="/common-numbers" className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-xs font-bold text-gray-900 group-hover:text-indigo-700 transition-colors truncate">Common Numbers</span>
                                    <span className="block text-[10px] text-gray-400 font-medium">Today&apos;s predictions</span>
                                </div>
                            </Link>
                            <Link href={`/live/${gameId}`} className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-xs font-bold text-gray-900 group-hover:text-violet-700 transition-colors truncate">Live Results</span>
                                    <span className="block text-[10px] text-gray-400 font-medium">Real-time updates</span>
                                </div>
                            </Link>
                            <Link href="/teer-guide" className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">Teer Guide</span>
                                    <span className="block text-[10px] text-gray-400 font-medium">Learn how it works</span>
                                </div>
                            </Link>
                            <Link href="/dreams" className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-xs font-bold text-gray-900 group-hover:text-amber-700 transition-colors truncate">Dream Numbers</span>
                                    <span className="block text-[10px] text-gray-400 font-medium">Interpret your dreams</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ══════════════════ TABLE ══════════════════ */}
                <section className="bg-gray-50/50 py-10 md:py-16">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-900 text-white">
                                            <th className="px-5 md:px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date</th>
                                            <th className="px-5 md:px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">F/R</th>
                                            <th className="px-5 md:px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">S/R</th>
                                            {hasRound3 && (
                                                <th className="px-5 md:px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">T/R</th>
                                            )}
                                            <th className="px-5 md:px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Prediction</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoading ? (
                                            Array.from({ length: 10 }).map((_, i) => (
                                                <tr key={i} className={`animate-pulse ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                                                    <td className="px-5 md:px-6 py-5"><div className="h-4 bg-gray-100 rounded-lg w-28" /></td>
                                                    <td className="px-5 md:px-6 py-5"><div className="h-8 bg-gray-100 rounded-lg w-12 mx-auto" /></td>
                                                    <td className="px-5 md:px-6 py-5"><div className="h-8 bg-gray-100 rounded-lg w-12 mx-auto" /></td>
                                                    {hasRound3 && <td className="px-5 md:px-6 py-5"><div className="h-8 bg-gray-100 rounded-lg w-12 mx-auto" /></td>}
                                                    <td className="px-5 md:px-6 py-5"><div className="h-8 bg-gray-100 rounded-lg w-20 mx-auto" /></td>
                                                </tr>
                                            ))
                                        ) : results.length === 0 ? (
                                            <tr>
                                                <td colSpan={hasRound3 ? 5 : 4} className="px-6 py-20 text-center font-bold text-gray-300 uppercase tracking-widest">
                                                    No results found.
                                                </td>
                                            </tr>
                                        ) : (
                                            results.map((result: any, idx: number) => {
                                                const dStr = result.date.split("T")[0];
                                                const pred = predictionsByDate.get(dStr);
                                                const r1 = result.round1 || "XX";
                                                const r2 = result.round2 || "XX";
                                                const r3 = result.round3 || "XX";
                                                return (
                                                    <tr key={result.id} className={`border-b border-gray-100 last:border-b-0 transition-colors duration-200 hover:bg-indigo-50/40 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                                                        <td className="px-5 md:px-6 py-4">
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="text-sm font-bold text-gray-800 tracking-tight">
                                                                    {new Date(result.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                                                </span>
                                                                {idx === 0 && page === 1 && (
                                                                    <Badge variant="success" className="animate-pulse !text-[8px]">LATEST</Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 md:px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center justify-center min-w-[44px] px-3 py-1.5 rounded-lg text-sm font-black tracking-tight ${r1 !== "XX" ? "bg-indigo-100 text-indigo-700 shadow-sm" : "bg-gray-100 text-gray-300"}`}>
                                                                {r1}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 md:px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center justify-center min-w-[44px] px-3 py-1.5 rounded-lg text-sm font-black tracking-tight ${r2 !== "XX" ? "bg-violet-100 text-violet-700 shadow-sm" : "bg-gray-100 text-gray-300"}`}>
                                                                {r2}
                                                            </span>
                                                        </td>
                                                        {hasRound3 && (
                                                            <td className="px-5 md:px-6 py-4 text-center">
                                                                <span className={`inline-flex items-center justify-center min-w-[44px] px-3 py-1.5 rounded-lg text-sm font-black tracking-tight ${r3 !== "XX" ? "bg-amber-100 text-amber-700 shadow-sm" : "bg-gray-100 text-gray-300"}`}>
                                                                    {r3}
                                                                </span>
                                                            </td>
                                                        )}
                                                        <td className="px-5 md:px-6 py-4">
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                {pred ? (
                                                                    <>
                                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                                            {Array.isArray(pred.commonNumbers) ? pred.commonNumbers.slice(0, 2).join(", ") : ""}
                                                                        </span>
                                                                        {pred.directMatch ? (
                                                                            <Badge variant="success" className="!text-[8px]">Direct Match</Badge>
                                                                        ) : pred.houseMatch ? (
                                                                            <Badge variant="info" className="!text-[8px]">Prophetic Hit</Badge>
                                                                        ) : pred.endingMatch ? (
                                                                            <Badge variant="warning" className="!text-[8px]">Terminal Hit</Badge>
                                                                        ) : (
                                                                            <Badge variant="neutral" className="!text-[8px]">Deviation</Badge>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <span className="text-gray-200 text-[10px] font-bold uppercase tracking-widest">—</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {pagination && totalPages > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 md:px-6 py-5">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        ← Previous
                                    </button>
                                    <div className="hidden lg:flex items-center gap-1.5">
                                        {getPageNumbers().map((p, i) =>
                                            p === "..." ? (
                                                <span key={`e${i}`} className="px-2 text-xs font-black text-gray-300">...</span>
                                            ) : (
                                                <button
                                                    key={p}
                                                    onClick={() => setPage(p as number)}
                                                    className={`h-10 w-10 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${page === p
                                                        ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                                                        : "text-gray-400 hover:bg-white hover:text-indigo-600 hover:shadow-md"
                                                    }`}
                                                >
                                                    {p.toString().padStart(2, "0")}
                                                </button>
                                            )
                                        )}
                                    </div>
                                    {/* Mobile page indicator */}
                                    <span className="lg:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ══════════════════ SEO CONTENT BLOCK ══════════════════ */}
                <section className="bg-white py-16 md:py-20 border-t border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
                            About {gameName} Teer Previous Results
                        </h2>
                        <div className="grid gap-8 md:grid-cols-2 text-sm text-gray-500 leading-relaxed">
                            <div className="space-y-4">
                                <p>
                                    The <strong className="text-gray-900">{gameName} Teer Previous Result</strong> archive provides a complete, verified record of all First Round (FR) and Second Round (SR) numbers from official archery counters. This <strong className="text-gray-900">Teer Result List</strong> is updated daily and verified against multiple independent sources for 100% accuracy.
                                </p>
                                <p>
                                    Whether you are analyzing patterns in the <strong className="text-gray-900">{gameName} Teer Result History</strong> or looking for trends to inform your <Link href="/common-numbers" className="text-indigo-600 font-bold hover:underline">Teer Common Numbers</Link>, our archive is the most comprehensive and reliable data source available.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <p>
                                    Each <strong className="text-gray-900">Teer Counter Result</strong> in our database is cross-verified before publication. Our prediction system also tracks historical accuracy, providing transparency with every result entry. Check the prediction proof column to see how our daily forecasts performed against actual outcomes.
                                </p>
                                <p>
                                    For today&apos;s live numbers, visit the{" "}
                                    <Link href={`/live/${gameId}`} className="text-indigo-600 font-bold hover:underline">{gameName} Live Result</Link>{" "}
                                    page. For all games, see the{" "}
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
