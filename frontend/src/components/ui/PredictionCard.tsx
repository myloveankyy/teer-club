"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "./Card";

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
        <Card className="p-0 overflow-hidden border-gray-100 shadow-sm" hover={true}>
            <div className="bg-white px-6 py-5 border-b border-gray-50">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight leading-none mb-1">{game} Today Target</h3>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Calculated Prediction</p>
            </div>

            <div className="p-6 space-y-8 bg-white">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Direct Numbers
                        </h4>
                        {!reportUrl && !isRevealed && !isCounting && (
                            <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                Locked
                            </span>
                        )}
                    </div>
                    
                    <div className="min-h-[60px]">
                        {reportUrl ? (
                            <Link
                                href={reportUrl}
                                className="flex w-full h-14 items-center justify-center rounded-xl bg-gray-900 text-white font-bold transition-all hover:bg-gray-800 shadow-xl shadow-gray-200 uppercase tracking-widest text-xs"
                                aria-label={`Unlock full ${game} report`}
                            >
                                Unlock Full Report
                            </Link>
                        ) : isRevealed ? (
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                {directNumbers.map((num, idx) => (
                                    <div
                                        key={idx}
                                        className="flex h-14 items-center justify-center rounded-xl bg-white border border-gray-100 text-2xl font-black text-gray-900 shadow-sm transition-all hover:border-primary/30"
                                    >
                                        {num}
                                    </div>
                                ))}
                            </div>
                        ) : isCounting ? (
                            <div className="flex h-14 w-full items-center justify-center rounded-xl bg-gray-50 text-gray-500 border border-gray-100 border-dashed">
                                <span className="text-sm font-bold animate-pulse uppercase tracking-widest">Unlocking in {timeLeft}s...</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleReveal}
                                className="flex h-14 w-full items-center justify-center rounded-xl bg-gray-900 text-white font-bold transition-all hover:bg-gray-800 shadow-xl shadow-gray-200 uppercase tracking-widest text-xs"
                            >
                                Show Target Numbers
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                    <div>
                        <h4 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">House</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {houseNumbers.map((num, idx) => (
                                <div
                                    key={idx}
                                    className="flex h-12 items-center justify-center rounded-xl bg-gray-50 text-xl font-black text-gray-900 border border-gray-100"
                                >
                                    {num}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Ending</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {endingNumbers.map((num, idx) => (
                                <div
                                    key={idx}
                                    className="flex h-12 items-center justify-center rounded-xl bg-gray-50 text-xl font-black text-gray-900 border border-gray-100"
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
