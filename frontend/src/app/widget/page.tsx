"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { TodayGameResult } from "@/lib/api";

export default function WidgetPage() {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [primaryColor, setPrimaryColor] = useState<string>("#3b82f6");
    const [market, setMarket] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("theme") === "light") setTheme("light"); // Default is dark now
        if (params.get("color")) setPrimaryColor(`#${params.get("color")}`);
        if (params.get("market")) setMarket(params.get("market"));
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ["todays-results", "widget"],
        queryFn: () => api.results.getToday(),
        refetchInterval: 60000, // Auto-refresh every minute
    });

    const games: TodayGameResult[] = data?.data?.data?.games || [];

    // If a specific market is requested, filter it. Otherwise show all live/enabled ones.
    const displayGames = market
        ? games.filter((g) => g.name.toLowerCase() === market.toLowerCase())
        : games.filter((g) => g.isEnabled);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
            </div>
        );
    }

    return (
        <div 
            className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden`}
        >
            {/* Realistic Cinematic Background Image */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/widget-bg.png')" }}
            ></div>

            {/* Glassmorphism Overlays */}
            <div className={`absolute inset-0 z-10 ${theme === 'dark' ? 'bg-black/60' : 'bg-white/40'} backdrop-blur-xl`}></div>
            <div className={`absolute inset-0 z-10 bg-gradient-to-b ${theme === 'dark' ? 'from-black/80 via-black/40 to-black/90' : 'from-white/80 via-white/40 to-white/90'}`}></div>

            {/* Main Content */}
            <div className={`relative z-20 flex-1 p-4 flex flex-col gap-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {displayGames.map((game) => (
                    <div
                        key={game.id}
                        className={`rounded-2xl border overflow-hidden flex flex-col backdrop-blur-md ${theme === "dark" ? "bg-white/5 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" : "bg-black/5 border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"}`}
                    >
                        <div className="px-5 py-3 flex items-center justify-between border-b border-white/10 bg-black/20">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></div>
                                <span className="font-bold text-sm tracking-widest uppercase">{game.name} Teer</span>
                            </div>
                            <span className={`text-[10px] font-medium tracking-wider uppercase opacity-60`}>OFFICIAL</span>
                        </div>
                        <div className="flex divide-x divide-white/10">
                            <div className="flex-1 p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className={`text-[10px] font-bold mb-2 tracking-widest uppercase opacity-60`}>F/R (Morning)</span>
                                <span className="text-4xl sm:text-5xl font-light tracking-tighter" style={{ textShadow: theme === 'dark' ? '0 2px 10px rgba(0,0,0,0.5)' : 'none' }}>
                                    {game.result?.round1 || "XX"}
                                </span>
                                <span className={`text-[9px] mt-2 font-mono tracking-widest opacity-40`}>{game.frTime}</span>
                            </div>
                            <div className="flex-1 p-5 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className={`text-[10px] font-bold mb-2 tracking-widest uppercase opacity-60`}>S/R (Evening)</span>
                                <span className="text-4xl sm:text-5xl font-light tracking-tighter" style={{ textShadow: theme === 'dark' ? '0 2px 10px rgba(0,0,0,0.5)' : 'none' }}>
                                    {game.result?.round2 || "XX"}
                                </span>
                                <span className={`text-[9px] mt-2 font-mono tracking-widest opacity-40`}>{game.srTime}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* The vital Dofollow Backlink - Styled professionally */}
            <a
                href="https://teer.club"
                target="_blank"
                rel="noopener"
                className={`relative z-20 py-2.5 px-4 text-center text-[10px] font-bold tracking-widest uppercase hover:opacity-100 transition-opacity border-t ${theme === "dark" ? "bg-black/50 text-white/50 border-white/10 hover:text-white" : "bg-white/50 text-black/50 border-black/10 hover:text-black"}`}
                style={{ textDecoration: 'none' }}
            >
                Powered by Teer.club
            </a>
        </div>
    );
}
