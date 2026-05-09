"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { MatchProofCard } from "@/components/ui/MatchProofCard";
import { Section, Container } from "@/components/ui/Grid";
import { Button } from "@/components/ui/Button";

interface StatProps {
    label: string;
    value: string | number;
    subtext?: string;
    color?: "indigo" | "emerald" | "amber" | "blue" | "rose";
}

const StatBox = ({ label, value, subtext, color = "indigo" }: StatProps) => {
    const colorStyles = {
        indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
        emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
        amber: "bg-amber-50 border-amber-100 text-amber-700",
        blue: "bg-blue-50 border-blue-100 text-blue-700",
        rose: "bg-rose-50 border-rose-100 text-rose-700",
    };

    return (
        <div className={`p-4 rounded-2xl border ${colorStyles[color]} flex flex-col justify-center items-center text-center shadow-sm`}>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{label}</span>
            <span className="text-3xl font-black tracking-tighter leading-none mb-1">{value}</span>
            {subtext && <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{subtext}</span>}
        </div>
    );
};

export const JackpotDashboard = () => {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading, isError } = useQuery({
        queryKey: ["predictions", "history", page, limit],
        queryFn: async () => {
            const res = await api.predictions.getHistory({ page, limit });
            if (!res.data.success) throw new Error("Failed to fetch");
            return res.data.data;
        },
    });

    // Calculate aggregated stats from currently loaded data (or we could fetch this separately from backend)
    // For now, we'll calculate based on the first page of history if it's large enough, or just show the history list
    const history = data?.history || [];
    const pagination = data?.pagination;

    // Derived stats from current view
    const totalPredictions = history.length;
    const directHits = history.filter((p: any) => p.directMatch).length;
    const houseHits = history.filter((p: any) => p.houseMatch).length;
    const endingHits = history.filter((p: any) => p.endingMatch).length;
    const multiHits = history.filter((p: any) => (p.houseMatch && p.endingMatch) || p.directMatch).length;

    // Accuracy percentage
    const hitRate = totalPredictions > 0 
        ? Math.round(((directHits + houseHits + endingHits) / totalPredictions) * 100) 
        : 0;

    return (
        <div className="flex flex-col gap-8 lg:gap-12 w-full">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                <StatBox label="Overall Accuracy" value={`${hitRate}%`} subtext="Hit Rate" color="emerald" />
                <StatBox label="Direct Jackpots" value={directHits} subtext="Exact Matches" color="amber" />
                <StatBox label="House Hits" value={houseHits} subtext="First Digit" color="indigo" />
                <StatBox label="Ending Hits" value={endingHits} subtext="Last Digit" color="blue" />
            </div>

            {/* Proof History Grid */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Verified Match Proofs</h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                        Page {page} of {pagination?.totalPages || 1}
                    </span>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-[200px] rounded-2xl bg-gray-100 animate-pulse border border-gray-200" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-10 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="text-rose-500 font-bold">Failed to load match history.</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-bold">No match proofs found.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                            {history.map((p: any) => {
                                const gameName = (p.game?.displayName || p.gameId).replace(/Teer|teer/g, "").trim();
                                const gameSlug = (p.game?.name || p.gameId).toLowerCase();
                                const dateStr = p.date || p.createdAt;
                                const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "";
                                
                                return (
                                    <MatchProofCard
                                        key={p.id}
                                        date={formattedDate}
                                        game={gameName}
                                        numbers={[p.directNumber, ...p.commonNumbers.slice(0, 4)]}
                                        result={p.actualResult || "PENDING"}
                                        compact={true}
                                        matchDetails={{
                                            house: p.houseMatch,
                                            ending: p.endingMatch,
                                            direct: p.directMatch
                                        }}
                                        reportUrl={`/match-proofs/${gameSlug}/${dateStr.split('T')[0]}`}
                                    />
                                );
                            })}
                        </div>
                        
                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-3 mt-6">
                                <Button 
                                    variant="secondary" 
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="!px-6 py-2"
                                >
                                    Previous
                                </Button>
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                                    Page {page} of {pagination.totalPages}
                                </span>
                                <Button 
                                    variant="secondary" 
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    className="!px-6 py-2"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
