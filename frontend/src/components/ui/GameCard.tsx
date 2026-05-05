"use client";

import React, { useRef, useState, useEffect } from "react";
import { Download, Flag, PlayCircle, CalendarCheck, AlertCircle } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import * as htmlToImage from "html-to-image";

interface GameCardProps {
    game: {
        id: string;
        name: string;
        displayName: string;
        location?: string;
        frTime: string | null;
        srTime: string | null;
        trTime: string | null;
        hasRound3: boolean;
        status: "waiting" | "declared" | "partial" | "off" | "searching" | "failed" | "delayed";
        result: {
            round1: string | null;
            round2: string | null;
            round3: string | null;
        } | null;
    };
    customMessages?: {
        waiting?: string;
        off?: string;
    };
}

export const GameCard = ({ game, customMessages }: GameCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [todayDateStr, setTodayDateStr] = useState("");

    useEffect(() => {
        setTodayDateStr(new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date()));
    }, []);

    const round1 = game.result?.round1 || "XX";
    const round2 = game.result?.round2 || "XX";
    const round3 = game.result?.round3 || "XX";

    const downloadImage = async () => {
        if (!cardRef.current) return;
        setIsDownloading(true);
        try {
            // briefly hide the download button to not include it in the download
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
            link.download = `${game.displayName.replace(/\s+/g, '-')}-Result.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Failed to download image", err);
        } finally {
            setIsDownloading(false);
        }
    };

    // Determine Status Theme
    let themeClasses = "bg-white border-gray-100 shadow-xl shadow-gray-100/50 text-gray-900";
    let roundBoxClasses = "bg-gray-50/50 border-gray-100 text-gray-900";
    let labelClasses = "text-gray-400";
    let activeGlow = "";

    if (game.status === "declared") {
        themeClasses = "bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-900/50 shadow-2xl shadow-indigo-900/40 text-white";
        roundBoxClasses = "bg-white/5 border-white/10 text-white shadow-inner";
        labelClasses = "text-indigo-200/70";
        activeGlow = "absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400/20 via-transparent to-transparent opacity-60";
    } else if (game.status === "partial") {
        themeClasses = "bg-gradient-to-br from-white to-blue-50/30 border-blue-100 shadow-xl shadow-blue-100/50 text-gray-900";
        roundBoxClasses = "bg-white border-blue-50 text-gray-900 shadow-sm";
        labelClasses = "text-blue-400";
    } else if (game.status === "delayed") {
        themeClasses = "bg-gradient-to-br from-white to-amber-50/50 border-amber-200/60 shadow-xl shadow-amber-100/50 text-gray-900";
        roundBoxClasses = "bg-white/80 border-amber-100 text-gray-900 shadow-sm";
        labelClasses = "text-amber-500/80";
    } else if (game.status === "waiting") {
        themeClasses = "bg-white border-gray-100 shadow-xl shadow-gray-100/50 text-gray-900";
        roundBoxClasses = "bg-gray-50/50 border-gray-100 text-gray-900";
        labelClasses = "text-gray-400";
    } else if (game.status === "off") {
        themeClasses = "bg-slate-50 border-slate-200 shadow-none text-slate-400 grayscale opacity-90";
        roundBoxClasses = "bg-transparent border-slate-200 text-slate-400 border-dashed";
        labelClasses = "text-slate-400";
    }

    return (
        <div ref={cardRef} className={`relative flex flex-col h-full border hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden ${themeClasses} p-5 lg:p-6 rounded-2xl`}>
            {activeGlow && <div className={activeGlow} />}

            {/* Header: Name + Location + Download */}
            <div className="relative z-10 flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-xl lg:text-2xl font-black tracking-tight mb-1">{game.displayName}</h3>
                    {game.location && (
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${labelClasses}`}>
                            {game.location}
                        </p>
                    )}
                </div>
                {game.status !== "off" && (
                    <button
                        onClick={downloadImage}
                        disabled={isDownloading}
                        className={`download-btn flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${game.status === "declared" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                        title="Download Result Card"
                    >
                        <Download size={16} />
                    </button>
                )}
            </div>

            {/* Sunday Off Case */}
            {game.status === "off" ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                    <span className="text-4xl mb-4 opacity-50">😴</span>
                    <h4 className="text-lg font-bold text-slate-800 mb-2 tracking-tight">Market is Closed Today</h4>
                    <p className="text-xs text-slate-500 font-medium max-w-[200px] leading-relaxed">It's Sunday. Take some rest, analyze past numbers, and prepare for tomorrow's targets.</p>
                </div>
            ) : game.status === "delayed" ? (
                /* Delayed Case */
                <div className="flex-1 flex flex-col mb-6">
                    <div className="bg-amber-100/50 rounded-xl p-5 text-center border border-amber-200/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]" />
                        <span className="text-sm font-bold text-amber-700 tracking-tight relative z-10 flex items-center justify-center gap-2">
                            <AlertCircle size={16} />
                            AUTHORITY DELAY DETECTED
                        </span>
                        <p className="text-[10px] uppercase tracking-widest text-amber-600/80 mt-2 font-semibold relative z-10">We are polling the source. Stay here.</p>
                    </div>
                </div>
            ) : (
                /* Standard Results Map */
                <div className="relative z-10 mb-8 space-y-3 flex-1 flex flex-col justify-center">
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${roundBoxClasses}`}>
                        <span className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.15em] flex items-center gap-2 ${labelClasses}`}>
                            F/R
                            {round1 === "XX" && game.status !== "declared" && (
                                <span className="relative flex h-2 w-2" title="Waiting for Live Result">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            )}
                        </span>
                        <span className="text-3xl lg:text-4xl font-black tracking-tighter drop-shadow-sm">{round1}</span>
                    </div>
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${roundBoxClasses}`}>
                        <span className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.15em] flex items-center gap-2 ${labelClasses}`}>
                            S/R
                            {round2 === "XX" && game.status !== "declared" && (
                                <span className="relative flex h-2 w-2" title="Waiting for Live Result">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            )}
                        </span>
                        <span className="text-3xl lg:text-4xl font-black tracking-tighter drop-shadow-sm">{round2}</span>
                    </div>
                    {game.hasRound3 && (
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${roundBoxClasses}`}>
                            <span className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.15em] flex items-center gap-2 ${labelClasses}`}>
                                T/R
                                {round3 === "XX" && game.status !== "declared" && (
                                    <span className="relative flex h-2 w-2" title="Waiting for Live Result">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                )}
                            </span>
                            <span className="text-3xl lg:text-4xl font-black tracking-tighter drop-shadow-sm">{round3}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Footer Status & Brand Stamp (For Download) */}
            <div className="relative z-10 mt-auto pt-5 border-t border-current/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {(() => {
                        if (game.status === "declared") {
                            return (
                                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-indigo-300">
                                    <Flag size={14} className="fill-current" /> Game End
                                </span>
                            );
                        }

                        let hasStarted = false;
                        if (game.status === "partial" || game.status === "delayed") {
                            hasStarted = true;
                        } else if (game.status === "waiting" && game.frTime) {
                            try {
                                const [h, m] = game.frTime.split(":").map(Number);
                                const now = new Date();
                                const currentH = now.getHours();
                                const currentM = now.getMinutes();
                                const currentTotal = currentH * 60 + currentM;
                                const frTotal = h * 60 + m;
                                if (currentTotal >= frTotal - 30) {
                                    hasStarted = true;
                                }
                            } catch (e) { }
                        }

                        if (hasStarted) {
                            return (
                                <span className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest ${game.status === 'delayed' ? 'text-amber-500' : 'text-blue-500 animate-pulse'}`}>
                                    <PlayCircle size={14} /> Game Started
                                </span>
                            );
                        }

                        if (game.status === "off") {
                            return (
                                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <Flag size={14} /> Market Closed
                                </span>
                            );
                        }

                        return (
                            <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-400">
                                <CalendarCheck size={14} /> {todayDateStr || "Loading..."}
                            </span>
                        );
                    })()}
                </div>
                <div className="text-right">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${game.status === 'declared' ? 'text-indigo-200/50' : 'text-gray-300'}`}>Official Result</p>
                    <p className={`text-[11px] font-bold tracking-tight ${game.status === 'declared' ? 'text-indigo-100' : 'text-gray-400'}`}>teer.club</p>
                </div>
            </div>

            {/* View Live Result Action - Hidden from image download via relative/absolute overlap if needed, but handled by users naturally below card */}
            <div className="download-btn mt-5">
                <Button
                    variant="outline"
                    href={`/results/${game.name.toLowerCase()}/live`}
                    fullWidth
                    className={`text-[11px] font-bold uppercase tracking-widest py-3 rounded-lg border-current shadow-none ${game.status === 'declared' ? 'text-white border-white/20 hover:bg-white/10' : 'text-primary border-primary/20 hover:bg-primary/5'}`}
                >
                    View Live
                </Button>
            </div>
        </div>
    );
};
