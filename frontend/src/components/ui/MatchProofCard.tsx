"use client";

import React, { useRef, useState } from "react";
import { Download, Target } from "lucide-react";
import { Card } from "./Card";
import * as htmlToImage from "html-to-image";

interface MatchProofCardProps {
    date: string;
    game: string;
    numbers: string[];
    result: string;
    matchDetails?: {
        house?: boolean;
        ending?: boolean;
        direct?: boolean;
    };
}

export const MatchProofCard = ({ date, game, numbers, result, matchDetails }: MatchProofCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadImage = async () => {
        if (!cardRef.current) return;
        setIsDownloading(true);
        try {
            const btn = cardRef.current.querySelector(".download-btn") as HTMLElement;
            if (btn) btn.style.display = "none";

            const dataUrl = await htmlToImage.toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
                style: { transform: "scale(1)", transformOrigin: "top left" }
            });

            if (btn) btn.style.display = "flex";

            const link = document.createElement('a');
            link.download = `${game.replace(/\s+/g, '-')}-MatchProof-${date.replace(/\s+/g, '-')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Failed to download image", err);
        } finally {
            setIsDownloading(false);
        }
    };

    const isPending = result === "PENDING" || result === "--";
    const hasHit = matchDetails?.direct || matchDetails?.house || matchDetails?.ending;

    // Thematic configurations identical to GameCard's epic design logic
    let themeClasses = "bg-white border-gray-100 shadow-xl shadow-gray-100/50 text-gray-900";
    let activeGlow = "";
    let labelClasses = "text-gray-400";
    let predBoxBaseClasses = "bg-gray-50 border-gray-100 text-gray-500 font-bold";

    if (hasHit) {
        // High-trust psychological win theme
        themeClasses = "bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-900/50 shadow-2xl shadow-indigo-900/40 text-white";
        activeGlow = "absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/30 via-transparent to-transparent opacity-80";
        labelClasses = "text-indigo-200/70";
        predBoxBaseClasses = "bg-white/5 border-white/10 text-white/50";
    }

    return (
        <div ref={cardRef} className={`relative flex flex-col border hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden ${themeClasses} p-5 lg:p-6 rounded-2xl`}>
            {activeGlow && <div className={activeGlow} />}

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg lg:text-xl font-black tracking-tight mb-1">{game} Teer</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${labelClasses}`}>
                        {date}
                    </p>
                </div>

                <button
                    onClick={downloadImage}
                    disabled={isDownloading}
                    className={`download-btn flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${hasHit ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                    title="Download Proof Card"
                >
                    <Download size={16} />
                </button>
            </div>

            {/* Badges */}
            <div className="relative z-10 flex flex-wrap gap-2 mb-6">
                {matchDetails?.direct && <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-black tracking-widest rounded-md animate-pulse">🎯 Direct Hit</span>}
                {matchDetails?.house && <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] uppercase font-black tracking-widest rounded-md">🏠 House Match</span>}
                {matchDetails?.ending && <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] uppercase font-black tracking-widest rounded-md">🏁 Ending Match</span>}
                {!hasHit && !isPending && <span className="px-3 py-1 bg-gray-500/10 border border-gray-500/20 text-gray-500 text-[10px] uppercase font-black tracking-widest rounded-md">Missed</span>}
            </div>

            {/* Results Display */}
            <div className="relative z-10 flex items-center justify-between border-t border-current/10 pt-6 mt-auto">
                <div className="flex-1">
                    <p className={`text-[9px] uppercase font-black tracking-[0.2em] mb-3 ${labelClasses}`}>Expert Predictions</p>
                    <div className="flex flex-wrap gap-2">
                        {isPending ? (
                            <span className={`flex h-10 px-4 items-center justify-center rounded-xl text-[10px] uppercase tracking-widest border ${predBoxBaseClasses}`}>
                                Awaiting Results
                            </span>
                        ) : (
                            numbers.slice(0, 4).map((num, idx) => {
                                const isMatched = result.includes(num); // Simple exact match logic proxy 
                                return (
                                    <span
                                        key={idx}
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-black transition-all ${isMatched
                                                ? "bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/40 scale-110 z-10"
                                                : `border ${predBoxBaseClasses}`
                                            }`}
                                    >
                                        {num}
                                    </span>
                                )
                            })
                        )}
                    </div>
                </div>

                <div className="pl-6 border-l border-current/10">
                    <p className={`text-[9px] uppercase font-black tracking-[0.2em] mb-3 ${labelClasses} text-right`}>Declared</p>
                    <div className="flex items-center justify-center">
                        <span className={`text-4xl font-black tracking-tighter ${hasHit ? 'text-white drop-shadow-md' : 'text-gray-900'}`}>{isPending ? 'XX' : result}</span>
                    </div>
                </div>
            </div>

            {/* Footer Brand Verification */}
            <div className="relative z-10 mt-6 pt-5 border-t border-current/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                    <Target size={14} className={hasHit ? "text-indigo-400" : "text-gray-400"} />
                    <span className={hasHit ? "text-indigo-300" : "text-gray-500"}>Proof of Accuracy</span>
                </div>
                <div className="text-right">
                    <p className={`text-[11px] font-bold tracking-tight ${hasHit ? 'text-white/40' : 'text-gray-300'}`}>teer.club</p>
                </div>
            </div>
        </div>
    );
};
