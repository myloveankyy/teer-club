"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

export function ResultsList() {
  const [selectedGame, setSelectedGame] = useState("All");

  const { data, isLoading, error } = useQuery({
    queryKey: ["all-historical-results"],
    queryFn: () => api.results.getDashboard({ limit: 100 }),
    refetchInterval: 60 * 1000,
  });

  const { groupedResults, gamesList } = useMemo(() => {
    if (!data?.data?.data) return { groupedResults: {}, gamesList: ["All"] };
    const { results, games } = data.data.data;
    const gameMap = new Map(games.map((g) => [g.id, g]));
    const uniqueGames = new Set(games.filter((g) => g.isEnabled).map((g) => g.displayName || g.name));

    const groups: Record<string, { game: any; results: any[] }> = {};
    for (const g of games.filter((g) => g.isEnabled)) {
      const name = g.displayName || g.name;
      groups[name] = { game: g, results: [] };
    }
    for (const r of results) {
      const g = gameMap.get(r.gameId);
      if (!g?.isEnabled) continue;
      const name = g.displayName || g.name;
      if (groups[name]) groups[name].results.push(r);
    }

    return {
      groupedResults: groups,
      gamesList: ["All", ...Array.from(uniqueGames)],
    };
  }, [data]);

  const filteredGroups = useMemo(() => {
    if (selectedGame === "All") return groupedResults;
    return Object.fromEntries(
      Object.entries(groupedResults).filter(([name]) => name === selectedGame)
    );
  }, [groupedResults, selectedGame]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-3xl border border-dashed border-border/50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p className="text-foreground/40 font-bold text-[10px] uppercase tracking-widest animate-pulse">Checking for latest results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-16 text-center border-error/20 bg-error/5 shadow-sm">
        <span className="text-4xl mb-4 block">⚠️</span>
        <h3 className="text-error-text font-bold text-lg mb-1 tracking-tight">Connection Lost</h3>
        <p className="text-error-text/60 text-sm">Could not connect to the server. Please check your internet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-12">
      {/* Game Filter Pills */}
      <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
        {gamesList.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedGame(m)}
            className={`rounded-2xl px-6 py-2.5 text-[12px] lg:text-[13px] font-bold uppercase tracking-widest transition-all duration-300 border ${selectedGame === m
              ? "bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200"
              : "bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600 hover:bg-gray-50"
              }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Results by Game */}
      {Object.entries(filteredGroups).map(([market, { game, results }]) => (
        <div key={market}>
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border/50 pb-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-h3 text-foreground uppercase tracking-tight">{market}</h3>
              <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.1em]">{results.length} Previous Results</span>
            </div>
            <Button
              variant="ghost"
              href={`/results/${(game?.name || "unknown").toLowerCase()}/live`}
              className="text-[10px] font-bold border border-border/20 hover:bg-surface-secondary"
            >
              VIEW HISTORY →
            </Button>
          </div>

          <Card className="overflow-hidden !p-0 !rounded-2xl border-border bg-surface shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-5 text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Archived Date</th>
                    <th className="px-6 py-5 text-center text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest text-gray-400">First Round</th>
                    <th className="px-6 py-5 text-center text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Second Round</th>
                    {game?.hasRound3 && (
                      <th className="px-6 py-5 text-center text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest text-blue-600">Special TR</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.slice(0, 5).map((r: any, idx: number) => (
                    <tr key={r.id} className="group hover:bg-surface-secondary/20 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-foreground">
                            {new Date(r.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {idx === 0 && (
                            <Badge variant="success" className="!px-1.5 !py-0.5 text-[9px]">LATEST</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[48px] h-9 px-3 rounded-xl text-sm font-black transition-all border ${(!r.round1 || r.round1 === '--') ? 'bg-gray-50/50 text-gray-300 border-gray-100 border-dashed' : (r.round1 === 'OFF' ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white text-gray-900 border-gray-200 shadow-sm')}`}>
                          {(!r.round1 || r.round1 === '--') ? 'XX' : r.round1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center min-w-[48px] h-9 px-3 rounded-xl text-sm font-black transition-all border ${(!r.round2 || r.round2 === '--') ? 'bg-gray-50/50 text-gray-300 border-gray-100 border-dashed' : (r.round2 === 'OFF' ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white text-gray-900 border-gray-200 shadow-sm')}`}>
                          {(!r.round2 || r.round2 === '--') ? 'XX' : r.round2}
                        </span>
                      </td>
                      {game?.hasRound3 && (
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center justify-center min-w-[48px] h-9 px-3 rounded-xl text-sm font-black transition-all border ${(!r.round3 || r.round3 === '--') ? 'bg-purple-50/50 text-purple-300 border-purple-100 border-dashed' : (r.round3 === 'OFF' ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm')}`}>
                            {(!r.round3 || r.round3 === '--') ? 'XX' : r.round3}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {results.length === 0 && (
              <div>
                <h2 className="text-h2 text-foreground tracking-tight font-bold">Latest Results</h2>
                <p className="mt-1 text-xs font-semibold text-foreground/40 tracking-normal">Showing results for all games today</p>
              </div>
            )}
          </Card>
        </div>
      ))}

      {Object.keys(filteredGroups).length === 0 && (
        <Card className="p-20 text-center border-dashed border-border/50 bg-surface-secondary/20 rounded-3xl">
          <p className="text-foreground/30 font-bold text-[10px] uppercase tracking-widest leading-loose">
            Connecting...<br />
            No results available for this area yet.
          </p>
        </Card>
      )}
    </div>
  );
}
