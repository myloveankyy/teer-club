"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import { Game } from "@/lib/api";

export default function WidgetPage() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [primaryColor, setPrimaryColor] = useState<string>("#2563eb");
    const [market, setMarket] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("theme") === "dark") setTheme("dark");
        if (params.get("color")) setPrimaryColor(`#${params.get("color")}`);
        if (params.get("market")) setMarket(params.get("market"));
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ["todays-results", "widget"],
        queryFn: () => api.results.getToday(),
        refetchInterval: 60000, // Auto-refresh every minute
    });

    const games: Game[] = data?.data?.data?.games || [];

    // If a specific market is requested, filter it. Otherwise show all live/enabled ones.
    const displayGames = market
        ? games.filter((g) => g.name.toLowerCase() === market.toLowerCase())
        : games.filter((g) => g.isEnabled);

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: primaryColor }}></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
            <div className="flex-1 p-4 flex flex-col gap-4">
                {displayGames.map((game) => (
                    <div
                        key={game.id}
                        className={`rounded-xl border shadow-sm overflow-hidden flex flex-col ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                    >
                        <div
                            className="px-4 py-3 font-bold text-center text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {game.name} Teer
                        </div>
                        <div className="flex divide-x divide-gray-200 dark:divide-gray-700">
                            <div className="flex-1 p-4 flex flex-col items-center justify-center">
                                <span className={`text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>F/R (Morning)</span>
                                <span className="text-3xl font-black">{game.result_first_round || "XX"}</span>
                                <span className={`text-[10px] mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>{game.first_round_time}</span>
                            </div>
                            <div className="flex-1 p-4 flex flex-col items-center justify-center">
                                <span className={`text-xs font-semibold mb-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>S/R (Evening)</span>
                                <span className="text-3xl font-black">{game.result_second_round || "XX"}</span>
                                <span className={`text-[10px] mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>{game.second_round_time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* The vital Dofollow Backlink */}
            <a
                href="https://teer.club"
                target="_blank"
                rel="noopener"
                className={`py-2 text-center text-xs font-semibold hover:underline ${theme === "dark" ? "bg-gray-950 text-gray-400" : "bg-gray-100 text-gray-500"}`}
            >
                Powered by Teer.club
            </a>
        </div>
    );
}
