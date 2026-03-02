'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WinnerProps {
    winner: {
        name: string;
        game: string;
        round: number;
        predicted_number: string;
        bet_amount: number | string;
        reward_amount: number | string;
    };
    delay?: number;
    layout?: 'square' | 'horizontal';
}

export function PredictionWinnerCard({ winner, delay = 0, layout = 'square' }: WinnerProps) {
    const isHorizontal = layout === 'horizontal';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={cn(
                "h-auto p-4 md:p-5 rounded-[24px] bg-white border border-slate-200 shadow-sm group cursor-pointer transition-all active:scale-[0.98]",
                isHorizontal ? "w-full md:w-[240px] hover:border-amber-400" : "w-[240px] shrink-0 snap-center hover:border-indigo-400"
            )}
        >
            {/* Horizontal Layout (Mobile Only - Forced by Winners Page) */}
            {isHorizontal && (
                <div className="flex md:hidden items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 select-none">
                            {winner.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-slate-900 font-bold text-[14px] truncate leading-tight">{winner.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-slate-400 text-[9px] font-black uppercase tracking-wider truncate">
                                    {winner.game}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-slate-900 font-bold text-[11px]">Hit {winner.predicted_number}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">YIELDED</span>
                        <span className="text-emerald-500 font-black text-lg tracking-tighter">
                            ₹{Number(winner.reward_amount).toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            )}

            {/* Square Layout (Standard view, or Desktop fallback for horizontal) */}
            <div className={cn("flex-col gap-4", isHorizontal ? "hidden md:flex" : "flex")}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shadow-inner">
                        {winner.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-slate-900 font-bold text-[13px] tracking-tight truncate">{winner.name}</span>
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider truncate">
                            {winner.game} • {winner.round === 1 ? 'FR' : 'SR'}
                        </span>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-20">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Success Target</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">
                        {winner.predicted_number}
                    </span>
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">STAKED</span>
                        <span className="text-slate-600 font-black text-[11px] leading-none tracking-tight">₹{winner.bet_amount}</span>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest leading-none">YIELDED</span>
                        </div>
                        <span className="text-emerald-500 font-black text-xl leading-none tracking-tighter drop-shadow-sm">
                            ₹{Number(winner.reward_amount).toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
