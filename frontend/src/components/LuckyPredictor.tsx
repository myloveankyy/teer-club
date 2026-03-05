"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, TrendingUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export function LuckyPredictor() {
    const [luckyPredictor, setLuckyPredictor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/marketing/lucky-predictor')
            .then(res => {
                setLuckyPredictor(res.data);
            })
            .catch(err => console.error("Failed to fetch lucky predictor", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="mb-8 p-12 rounded-[32px] bg-slate-100 animate-pulse border border-slate-200" />
    );

    if (!luckyPredictor) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-[32px] bg-slate-900 text-white relative overflow-hidden group border border-slate-800 shadow-2xl"
        >
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown className="w-32 h-32 text-indigo-500 rotate-12" />
            </div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -ml-32 -mb-32" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg border border-white/10">
                        <Trophy className="w-5 h-5 text-indigo-100" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 leading-none mb-1">Hall of Fame</h4>
                        <p className="text-sm font-bold tracking-tight">Daily Lucky Predictor</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-xl">
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-black text-xl italic uppercase">
                                {luckyPredictor.name.substring(0, 2)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight mb-1">{luckyPredictor.name} <span className="text-indigo-500">👑</span></h3>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Hit Target {luckyPredictor.prediction} in {luckyPredictor.game}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Payout</p>
                            <p className="text-2xl font-black text-emerald-400 leading-none">{luckyPredictor.won}</p>
                        </div>
                        <Link href="/predictions">
                            <button className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5 group/btn">
                                <ArrowUpRight className="w-5 h-5 text-indigo-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
