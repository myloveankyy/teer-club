"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferralVisualizerProps {
    stats: {
        level1: number;
        level2: number;
        level3: number;
        level4: number;
        level5: number;
    } | any;
}

export function ReferralVisualizer({ stats }: ReferralVisualizerProps) {
    const levels = [
        { id: 1, label: "Direct", count: stats?.level1 || 0, color: "from-indigo-500 to-blue-600", icon: Users },
        { id: 2, label: "Tier 2", count: stats?.level2 || 0, color: "from-blue-500 to-cyan-500", icon: Users },
        { id: 3, label: "Tier 3", count: stats?.level3 || 0, color: "from-cyan-500 to-teal-500", icon: Users },
        { id: 4, label: "Tier 4", count: stats?.level4 || 0, color: "from-teal-500 to-emerald-500", icon: Users },
        { id: 5, label: "Tier 5", count: stats?.level5 || 0, color: "from-emerald-500 to-green-500", icon: Users },
    ];

    return (
        <div className="w-full py-8 overflow-hidden">
            <div className="flex flex-col items-center mb-12">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="w-20 h-20 rounded-[28px] bg-slate-900 flex items-center justify-center text-white border-4 border-white shadow-2xl relative z-20">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    {/* Pulsing rings around "You" */}
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping -z-10 scale-150" />
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-pulse -z-10 scale-[2]" />
                </motion.div>
                <div className="mt-4 text-center">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">Your Network Origin</span>
                </div>
            </div>

            {/* Tree Branches (Visual representation) */}
            <div className="relative flex justify-center items-start gap-4 md:gap-8 px-4 overflow-x-auto pb-10 no-scrollbar">
                {levels.map((lvl, i) => (
                    <motion.div
                        key={lvl.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex flex-col items-center min-w-[120px]"
                    >
                        {/* Connecting Line from prev level (conceptual) */}
                        <div className="relative mb-6">
                            <div className={cn(
                                "w-16 h-16 rounded-[24px] flex flex-col items-center justify-center text-white shadow-xl bg-gradient-to-br transition-transform hover:scale-110 cursor-pointer",
                                lvl.color
                            )}>
                                <span className="text-xl font-black">{lvl.count}</span>
                                <span className="text-[8px] font-bold uppercase tracking-tighter opacity-70">Active</span>
                            </div>

                            {/* Growth Indicator */}
                            {lvl.count > 0 && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-50">
                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                </div>
                            )}
                        </div>

                        <div className="text-center space-y-1">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{lvl.label}</h4>
                            <p className="text-[9px] font-bold text-slate-400">Level {lvl.id}</p>
                        </div>

                        {/* Connection to next */}
                        {i < levels.length - 1 && (
                            <div className="absolute top-1/2 left-full -translate-y-1/2 hidden md:block">
                                <ChevronRight className="w-4 h-4 text-slate-200" />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Potential Rewards Banner */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mx-4 mt-8 p-6 rounded-[32px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-black tracking-tight mb-1">Expand into Tier 2</h3>
                        <p className="text-white/70 text-xs font-medium">Every Tier 1 player who invites friends earns you ₹5/player automatically.</p>
                    </div>
                    <button className="px-6 py-3 bg-white text-indigo-600 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:shadow-white/20 transition-all active:scale-95 shrink-0">
                        View Comp Plan
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
