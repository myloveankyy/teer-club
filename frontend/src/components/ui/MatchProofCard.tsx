"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Download, Target, Trophy, Flame, CheckCircle2, XCircle, Clock } from "lucide-react";
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
    reportUrl?: string;
}

// ─── Confetti Particle Component ─────────────────────────────────────────────
function ConfettiParticles({ active }: { active: boolean }) {
    if (!active) return null;

    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const particles = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.6}s`,
        duration: `${1.2 + Math.random() * 1}s`,
        size: `${4 + Math.random() * 4}px`,
        rotation: `${Math.random() * 360}deg`,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20" aria-hidden="true">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute animate-confetti-fall"
                    style={{
                        left: p.left,
                        top: '-8px',
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                        transform: `rotate(${p.rotation})`,
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes confetti-fall {
                    0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
                    50% { opacity: 1; }
                    100% { transform: translateY(280px) rotate(720deg) scale(0.3); opacity: 0; }
                }
                .animate-confetti-fall {
                    animation-name: confetti-fall;
                    animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    animation-fill-mode: forwards;
                    animation-iteration-count: 1;
                }
            `}</style>
        </div>
    );
}

// ─── Status State Machine ────────────────────────────────────────────────────
type MatchStatus = 'jackpot' | 'house_win' | 'ending_win' | 'multi_win' | 'missed' | 'pending';

function getMatchStatus(isPending: boolean, matchDetails?: MatchProofCardProps['matchDetails']): MatchStatus {
    if (isPending) return 'pending';
    if (!matchDetails) return 'missed';
    
    const { direct, house, ending } = matchDetails;
    if (direct) return 'jackpot';
    
    const wins = [house, ending].filter(Boolean).length;
    if (wins >= 2) return 'multi_win';
    if (house) return 'house_win';
    if (ending) return 'ending_win';
    return 'missed';
}

const STATUS_CONFIG: Record<MatchStatus, {
    label: string;
    icon: React.ReactNode;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    glowClass: string;
    headerBg: string;
}> = {
    jackpot: {
        label: '🔥 JACKPOT HIT',
        icon: <Flame size={14} className="text-amber-500" />,
        badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        badgeText: 'text-white',
        borderColor: 'border-amber-300',
        glowClass: 'shadow-lg shadow-amber-200/60 ring-2 ring-amber-400/30',
        headerBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    },
    multi_win: {
        label: '✅ DOUBLE WIN',
        icon: <Trophy size={14} className="text-emerald-500" />,
        badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        badgeText: 'text-white',
        borderColor: 'border-emerald-300',
        glowClass: 'shadow-lg shadow-emerald-200/50 ring-2 ring-emerald-400/20',
        headerBg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    },
    house_win: {
        label: '✅ HOUSE WIN',
        icon: <CheckCircle2 size={14} className="text-emerald-500" />,
        badgeBg: 'bg-emerald-500',
        badgeText: 'text-white',
        borderColor: 'border-emerald-200',
        glowClass: 'shadow-md shadow-emerald-100/50',
        headerBg: 'bg-emerald-50/50',
    },
    ending_win: {
        label: '✅ ENDING WIN',
        icon: <CheckCircle2 size={14} className="text-blue-500" />,
        badgeBg: 'bg-blue-500',
        badgeText: 'text-white',
        borderColor: 'border-blue-200',
        glowClass: 'shadow-md shadow-blue-100/50',
        headerBg: 'bg-blue-50/50',
    },
    missed: {
        label: '✖ MISSED',
        icon: <XCircle size={14} className="text-red-400" />,
        badgeBg: 'bg-red-50',
        badgeText: 'text-red-500',
        borderColor: 'border-red-100',
        glowClass: '',
        headerBg: 'bg-white',
    },
    pending: {
        label: '⏳ PENDING',
        icon: <Clock size={14} className="text-gray-400" />,
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-500',
        borderColor: 'border-gray-100',
        glowClass: '',
        headerBg: 'bg-white',
    },
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const MatchProofCard = ({ date, game, numbers, result, matchDetails, reportUrl }: MatchProofCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const isPending = result === "PENDING" || result === "--" || !result;
    const status = getMatchStatus(isPending, matchDetails);
    const config = STATUS_CONFIG[status];

    // Trigger confetti animation on jackpot/multi_win
    useEffect(() => {
        if (status === 'jackpot' || status === 'multi_win') {
            const timer = setTimeout(() => setShowConfetti(true), 300);
            const cleanup = setTimeout(() => setShowConfetti(false), 3000);
            return () => { clearTimeout(timer); clearTimeout(cleanup); };
        }
    }, [status]);

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

    return (
        <div
            ref={cardRef}
            className={`relative flex flex-col border transition-all duration-500 overflow-hidden bg-white ${config.borderColor} ${config.glowClass} p-6 rounded-2xl`}
        >
            {/* Confetti for Jackpot / Multi-Win */}
            <ConfettiParticles active={showConfetti} />

            {/* Header */}
            <div className={`relative z-10 -mx-6 -mt-6 px-6 pt-5 pb-4 mb-5 ${config.headerBg}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg lg:text-xl font-bold tracking-tight text-gray-900 mb-1">{game} Teer</h3>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                            {date}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-black tracking-widest rounded-lg ${config.badgeBg} ${config.badgeText}`}>
                            {config.icon}
                            {config.label}
                        </span>
                        <button
                            onClick={downloadImage}
                            disabled={isDownloading}
                            className="download-btn flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 bg-white/80 hover:bg-white text-gray-400 hover:text-gray-600 border border-gray-100"
                            title="Download Proof Card"
                        >
                            <Download size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Match Detail Badges */}
            {!isPending && (
                <div className="relative z-10 flex flex-wrap gap-3 mb-5">
                    {matchDetails?.direct && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-black uppercase tracking-widest text-amber-600">
                            <Flame size={12} /> Direct Number Hit
                        </span>
                    )}
                    {matchDetails?.house && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                            <CheckCircle2 size={12} /> House Match
                        </span>
                    )}
                    {matchDetails?.ending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-600">
                            <CheckCircle2 size={12} /> Ending Match
                        </span>
                    )}
                    {status === 'missed' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 border border-red-100 text-[10px] font-black uppercase tracking-widest text-red-400">
                            <XCircle size={12} /> No Match
                        </span>
                    )}
                </div>
            )}

            {/* Results Display */}
            <div className="relative z-10 flex items-center justify-between border-t border-gray-100 pt-5 mt-auto">
                <div className="flex-1">
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] mb-3 text-gray-400">Predicted</p>
                    <div className="flex flex-wrap gap-2">
                        {isPending ? (
                            <span className="flex h-10 px-4 items-center justify-center rounded-xl text-[10px] uppercase tracking-widest border border-dashed border-gray-200 text-gray-400 font-bold animate-pulse">
                                Awaiting Results
                            </span>
                        ) : (
                            numbers.slice(0, 5).map((num, idx) => {
                                const isMatched = result.includes(num);
                                return (
                                    <span
                                        key={idx}
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-black transition-all duration-500 ${isMatched
                                                ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-200 scale-110 z-10 ring-2 ring-emerald-300/50"
                                                : "border border-gray-100 bg-gray-50 text-gray-400"
                                            }`}
                                    >
                                        {num}
                                    </span>
                                )
                            })
                        )}
                    </div>
                </div>

                <div className="pl-6 border-l border-gray-100">
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] mb-3 text-gray-400 text-right">Result</p>
                    <div className="flex items-center justify-center">
                        {isPending ? (
                            <span className="text-3xl font-black tracking-tighter text-gray-300 animate-pulse">XX</span>
                        ) : (
                            <span className={`text-3xl lg:text-4xl font-black tracking-tighter ${
                                status === 'jackpot' ? 'text-amber-500' :
                                status === 'missed' ? 'text-red-400' : 'text-gray-900'
                            }`}>
                                {result}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Brand */}
            <div className="relative z-10 mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-300">
                    <Target size={14} />
                    <span>verified by teer.club</span>
                </div>
                <div className="text-right">
                    {reportUrl ? (
                        <Link href={reportUrl} className="text-[10px] uppercase font-black tracking-widest text-blue-500 hover:text-blue-600 transition-colors">
                            View Proof Details →
                        </Link>
                    ) : (
                        <p className="text-[11px] font-bold tracking-tight text-gray-200">teer.club</p>
                    )}
                </div>
            </div>
        </div>
    );
};
