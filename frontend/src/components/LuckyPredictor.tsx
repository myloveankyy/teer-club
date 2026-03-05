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
            <div className="absolute top-0 right-0 p-8 opacity-[0.15] group-hover:opacity-30 transition-opacity">
                <Crown className="w-32 h-32 text-indigo-400 rotate-12 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
            </div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-600/30 to-purple-600/20 rounded-full blur-[80px] -ml-40 -mb-40 animate-pulse" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-white/20">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 leading-none mb-1.5 drop-shadow-sm">Top Predictor 👑</h4>
                        <p className="text-base font-black tracking-tight text-white/90">Aaj ka Super Hit Player</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 p-0.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 group-hover:scale-105 transition-transform duration-500">
                            <div className="w-full h-full rounded-[26px] bg-slate-900 flex items-center justify-center font-black text-2xl italic uppercase text-white shadow-inner">
                                {luckyPredictor.name.substring(0, 2)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter mb-1.5 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{luckyPredictor.name}</h3>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 w-fit">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Target {luckyPredictor.prediction} Hit in {luckyPredictor.game}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Total Payout</p>
                            <p className="text-3xl font-black text-emerald-400 leading-none drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{luckyPredictor.won}</p>
                        </div>
                        <Link href="/predictions">
                            <button className="w-14 h-14 rounded-3xl bg-white text-indigo-900 hover:bg-indigo-50 flex items-center justify-center transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-90 group/btn">
                                <ArrowUpRight className="w-6 h-6 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
