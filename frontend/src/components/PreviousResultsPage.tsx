"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container } from "@/components/ui/Grid";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PreviousResultsPageProps {
    gameId: string;
}

// Games that have 3 rounds — config-driven
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
            const dStr = p.date.split("T")[0];
            predictionsByDate.set(dStr, p);
        }
    }

    if (error) {
        return (
            <PageLayout>
                <Section background="white">
                    <Container>
                        <Card className="p-20 text-center border-red-50">
                            <span className="text-5xl mb-4 block">⚠️</span>
                            <p className="text-red-500 font-black text-xl mb-1 uppercase tracking-tight">Sync Error</p>
                            <p className="text-gray-400 font-medium tracking-tight">Check your connection and try again.</p>
                        </Card>
                    </Container>
                </Section>
            </PageLayout>
        );
    }

    const data = response?.data?.data;
    const game = data?.game;
    const results = data?.results || [];
    const pagination = data?.pagination;
    const totalPages = pagination?.totalPages || 1;

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

    const colCount = hasRound3 ? 5 : 4;

    return (
        <PageLayout>
            <Section background="gray" className="!py-16 border-b border-gray-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
                <Container>
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex flex-col gap-4">
                            <Link href="/results" className="inline-flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                                ← All Results
                            </Link>
                            <div className="flex flex-col gap-1">
                                <h1 className="text-4xl font-black text-[#111827] uppercase tracking-tighter leading-none">
                                    {game?.displayName || gameId.charAt(0).toUpperCase() + gameId.slice(1)} <span className="text-blue-600">History</span>
                                </h1>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {pagination?.total?.toLocaleString() || "..."} Verified Results
                                    {hasRound3 && " • Special TR Active"}
                                </p>
                            </div>
                        </div>
                        <Button
                            href={`/results/${gameId}/live`}
                            variant="primary"
                            className="!px-8 shadow-xl shadow-blue-100"
                        >
                            Check Live Results
                        </Button>
                    </div>
                </Container>
            </Section>

            <Section background="white">
                <Container>
                    <Card className="!p-0 !rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-100/30 border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#111827]">Date</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-[#111827]">Round 1</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-[#111827]">Round 2</th>
                                        {hasRound3 && (
                                            <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-blue-600">Special Round</th>
                                        )}
                                        <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-indigo-600">Prediction Proof</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {isLoading ? (
                                        Array.from({ length: 10 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded-lg w-32" /></td>
                                                <td className="px-8 py-6"><div className="h-10 bg-gray-100 rounded-xl w-14 mx-auto" /></td>
                                                <td className="px-8 py-6"><div className="h-10 bg-gray-100 rounded-xl w-14 mx-auto" /></td>
                                                {hasRound3 && <td className="px-8 py-6"><div className="h-10 bg-gray-100 rounded-xl w-14 mx-auto" /></td>}
                                                <td className="px-8 py-6"><div className="h-10 bg-indigo-50/50 rounded-xl w-24 mx-auto" /></td>
                                            </tr>
                                        ))
                                    ) : results.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center font-black text-gray-300 uppercase tracking-widest">
                                                No results found.
                                            </td>
                                        </tr>
                                    ) : (
                                        results.map((result: any, idx: number) => {
                                            const dStr = result.date.split("T")[0];
                                            const pred = predictionsByDate.get(dStr);
                                            return (
                                                <tr key={result.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-black text-[#111827]">
                                                                {new Date(result.date).toLocaleDateString("en-GB", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                })}
                                                            </span>
                                                            {idx === 0 && page === 1 && (
                                                                <Badge variant="success" className="animate-pulse">LATEST</Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <Badge variant="info" className="w-14 h-10 justify-center text-lg">{result.round1 || "--"}</Badge>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <Badge variant="info" className="w-14 h-10 justify-center text-lg">{result.round2 || "--"}</Badge>
                                                    </td>
                                                    {hasRound3 && (
                                                        <td className="px-8 py-5 text-center">
                                                            <Badge variant="warning" className="w-14 h-10 justify-center text-lg">{result.round3 || "--"}</Badge>
                                                        </td>
                                                    )}
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col items-center gap-2">
                                                            {pred ? (
                                                                <>
                                                                    <span className="text-[10px] font-black text-indigo-900/40 uppercase tracking-tighter">
                                                                        {Array.isArray(pred.commonNumbers) ? pred.commonNumbers.slice(0, 2).join(", ") : ""}
                                                                    </span>
                                                                    {pred.directMatch ? (
                                                                        <Badge variant="success" className="text-[8px]">Direct Match</Badge>
                                                                    ) : pred.houseMatch ? (
                                                                        <Badge variant="info" className="text-[8px]">Prophetic Hit</Badge>
                                                                    ) : pred.endingMatch ? (
                                                                        <Badge variant="warning" className="text-[8px]">Terminal Hit</Badge>
                                                                    ) : (
                                                                        <Badge variant="neutral" className="text-[8px]">Deviation</Badge>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="text-gray-200 text-[10px] font-black uppercase tracking-widest">No Log</span>
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
                            <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/50 px-8 py-6">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ← Previous
                                </button>
                                <div className="hidden lg:flex items-center gap-2">
                                    {getPageNumbers().map((p, i) =>
                                        p === "..." ? (
                                            <span key={`e${i}`} className="px-2 text-xs font-black text-gray-300">...</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p as number)}
                                                className={`h-10 w-10 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${page === p
                                                    ? "bg-[#111827] text-white shadow-xl shadow-gray-200"
                                                    : "text-gray-400 hover:bg-white hover:text-blue-600 hover:shadow-lg"
                                                    }`}
                                            >
                                                {p.toString().padStart(2, '0')}
                                            </button>
                                        )
                                    )}
                                </div>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </Card>
                </Container>
            </Section>
        </PageLayout>
    );
}
