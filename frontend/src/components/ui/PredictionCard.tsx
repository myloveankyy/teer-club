"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface PredictionCardProps {
    game: string;
    directNumbers: string[];
    houseNumbers: string[];
    endingNumbers: string[];
    reportUrl?: string;
}

export const PredictionCard = ({
    game,
    directNumbers,
    houseNumbers,
    endingNumbers,
    reportUrl
}: PredictionCardProps & { reportUrl?: string }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCounting, setIsCounting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isCounting && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (isCounting && timeLeft === 0) {
            setIsCounting(false);
            setIsRevealed(true);
        }
        return () => clearTimeout(timer);
    }, [isCounting, timeLeft]);

    const handleReveal = () => {
        setIsCounting(true);
    };

    const progressPercent = isCounting ? ((5 - timeLeft) / 5) * 100 : 0;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-200/80">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-white">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-900 text-white text-[10px] font-black shadow-sm">
                        🎯
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 tracking-tight leading-none">{game} Target</h3>
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Calculated Prediction</p>
                    </div>
                </div>
                {!reportUrl && !isRevealed && !isCounting && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                        <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        Locked
                    </span>
                )}
                {isRevealed && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Live
                    </span>
                )}
            </div>

            {/* Direct Numbers Section */}
            <div className="px-4 pt-3 pb-2">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                    Direct Numbers
                </h4>

                <div className="min-h-[42px]">
                    {reportUrl ? (
                        <Link
                            href={reportUrl}
                            className="flex w-full h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold transition-all hover:from-gray-800 hover:to-gray-700 shadow-md shadow-gray-200 uppercase tracking-widest text-[10px] active:scale-[0.98]"
                            aria-label={`Unlock full ${game} report`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Unlock Full Report
                        </Link>
                    ) : isRevealed ? (
                        <div className="grid grid-cols-5 gap-1.5">
                            <AnimatePresence>
                                {directNumbers.map((num, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ scale: 0.5, opacity: 0, y: 8 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08, type: "spring", stiffness: 400, damping: 20 }}
                                        className={`flex h-10 items-center justify-center rounded-xl text-base font-black transition-all ${
                                            idx === 0
                                                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-300/30 scale-105"
                                                : "bg-gray-50 text-gray-900 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                                        }`}
                                    >
                                        {num}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : isCounting ? (
                        <div className="relative flex h-10 w-full items-center justify-center rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
                            {/* Progress bar */}
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/15 transition-all duration-1000 ease-linear"
                                style={{ width: `${progressPercent}%` }}
                            />
                            {/* Shimmer overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
                            <span className="relative text-xs font-bold text-gray-500 uppercase tracking-widest">
                                Revealing in {timeLeft}s
                            </span>
                        </div>
                    ) : (
                        <button
                            onClick={handleReveal}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold transition-all hover:from-gray-800 hover:to-gray-700 active:scale-[0.98] shadow-md shadow-gray-200 uppercase tracking-widest text-[10px]"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Reveal Target Numbers
                        </button>
                    )}
                </div>
            </div>

            {/* House & Ending */}
            <div className="grid grid-cols-2 gap-0 border-t border-gray-50">
                <div className="px-4 py-3 border-r border-gray-50">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">House</h4>
                    <div className="flex gap-1.5">
                        {houseNumbers.map((num, idx) => (
                            <div
                                key={idx}
                                className="flex h-9 w-full items-center justify-center rounded-lg bg-gray-50 text-sm font-black text-gray-900 border border-gray-100"
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-4 py-3">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Ending</h4>
                    <div className="flex gap-1.5">
                        {endingNumbers.map((num, idx) => (
                            <div
                                key={idx}
                                className="flex h-9 w-full items-center justify-center rounded-lg bg-gray-50 text-sm font-black text-gray-900 border border-gray-100"
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
