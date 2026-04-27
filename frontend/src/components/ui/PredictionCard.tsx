"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "./Card";

interface PredictionCardProps {
    game: string;
    directNumbers: string[];
    houseNumbers: string[];
    endingNumbers: string[];
    dateSlug?: string;
}

export const PredictionCard = ({
    game,
    directNumbers,
    houseNumbers,
    endingNumbers,
    dateSlug
}: PredictionCardProps) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCounting, setIsCounting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);

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

    return (
        <Card className="p-0 overflow-hidden" hover={true}>
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-6">
                <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight leading-none mb-1.5">{game} Teer</h3>
                <p className="text-[10px] lg:text-[11px] font-bold text-gray-400 tracking-widest uppercase">Target Numbers</p>
            </div>

            <div className="p-6 space-y-6 bg-white">
                <div>
                    <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                        🎯 Direct Numbers
                    </h4>
                    <div className="flex flex-wrap gap-2.5 min-h-[48px]">
                        {dateSlug ? (
                            <Link
                                href={`/common-numbers/${dateSlug}`}
                                className="flex grow h-12 px-6 items-center justify-center rounded-2xl bg-primary text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 uppercase tracking-widest text-[11px] lg:text-xs whitespace-nowrap"
                                aria-label={`Unlock full ${game} report`}
                            >
                                <span aria-hidden="true" className="mr-2">🔒</span> Unlock Full {game} Report
                            </Link>
                        ) : isRevealed ? (
                            directNumbers.map((num, idx) => (
                                <div
                                    key={idx}
                                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-xl font-bold text-primary border border-primary/10 shadow-sm transition-all hover:scale-110 hover:shadow-primary/20"
                                >
                                    {num}
                                </div>
                            ))
                        ) : isCounting ? (
                            <div className="flex h-12 px-6 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-200" aria-live="polite">
                                <span className="text-xs lg:text-sm font-bold animate-pulse">Unlocking in {timeLeft}s...</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleReveal}
                                aria-label="Show direct numbers"
                                className="flex h-12 px-8 items-center justify-center rounded-2xl bg-gray-900 text-white border-none transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-gray-900/20"
                            >
                                <span className="text-sm font-bold flex items-center gap-2.5">
                                    <span aria-hidden="true">🔒</span> Show Direct Numbers
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                            🏠 House
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {houseNumbers.map((num, idx) => (
                                <div
                                    key={idx}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-700 border border-emerald-100"
                                >
                                    {num}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                            🔚 Ending
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {endingNumbers.map((num, idx) => (
                                <div
                                    key={idx}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg font-bold text-amber-700 border border-amber-100"
                                >
                                    {num}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
