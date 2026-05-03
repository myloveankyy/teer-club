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

    // Thematic configurations: Minimal Juwai Style
    let themeClasses = "bg-white border-gray-100 shadow-sm text-gray-900";
    let labelClasses = "text-gray-400";
    let predBoxBaseClasses = "bg-gray-50 border-gray-100 text-gray-400 font-bold";

    return (
        <div ref={cardRef} className={`relative flex flex-col border transition-all duration-300 overflow-hidden ${themeClasses} p-6 rounded-2xl`}>
            {/* Header */}
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg lg:text-xl font-bold tracking-tight mb-1">{game} Teer Proof</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${labelClasses}`}>
                        {date}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                   {hasHit ? (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] uppercase font-black tracking-widest rounded-lg border border-emerald-100 flex items-center gap-1.5">
                            ✔ Match
                        </span>
                    ) : !isPending && (
                        <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-widest rounded-lg border border-gray-100 flex items-center gap-1.5">
                            ✖ Not Match
                        </span>
                    )}
                    <button
                        onClick={downloadImage}
                        disabled={isDownloading}
                        className={`download-btn flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 bg-gray-50 hover:bg-gray-100 text-gray-400`}
                        title="Download Proof Card"
                    >
                        <Download size={16} />
                    </button>
                </div>
            </div>

            {/* Badges - Simplified */}
            <div className="relative z-10 flex flex-wrap gap-4 mb-6">
                {matchDetails?.direct && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">• Direct Hit</span>}
                {matchDetails?.house && <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">• House Match</span>}
                {matchDetails?.ending && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">• Ending Match</span>}
            </div>

            {/* Results Display */}
            <div className="relative z-10 flex items-center justify-between border-t border-gray-50 pt-6 mt-auto">
                <div className="flex-1">
                    <p className={`text-[9px] uppercase font-black tracking-[0.2em] mb-4 ${labelClasses}`}>Targets</p>
                    <div className="flex flex-wrap gap-2">
                        {isPending ? (
                            <span className={`flex h-10 px-4 items-center justify-center rounded-xl text-[10px] uppercase tracking-widest border border-dashed ${predBoxBaseClasses}`}>
                                Awaiting Results
                            </span>
                        ) : (
                            numbers.slice(0, 4).map((num, idx) => {
                                const isMatched = result.includes(num); 
                                return (
                                    <span
                                        key={idx}
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-black transition-all ${isMatched
                                                ? "bg-emerald-500 text-white border-emerald-400 shadow-md scale-110 z-10"
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

                <div className="pl-6 border-l border-gray-50">
                    <p className={`text-[9px] uppercase font-black tracking-[0.2em] mb-4 ${labelClasses} text-right`}>Result</p>
                    <div className="flex items-center justify-center">
                        <span className={`text-4xl font-black tracking-tighter text-gray-900`}>{isPending ? 'XX' : result}</span>
                    </div>
                </div>
            </div>

            {/* Footer Brand Verification */}
            <div className="relative z-10 mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300">
                    <Target size={14} />
                    <span>teer.club verification</span>
                </div>
                <div className="text-right">
                    <p className="text-[11px] font-bold tracking-tight text-gray-200">teer.club</p>
                </div>
            </div>
        </div>
    );
};
