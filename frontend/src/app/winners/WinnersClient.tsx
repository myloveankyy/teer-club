'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Award,
    TrendingUp,
    ChevronLeft,
    Star,
    Search,
    Filter,
    ArrowUpRight,
    Zap,
    Target,
    Crown,
    Medal
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { PredictionWinnerCard } from '@/components/PredictionWinnerCard';

interface Winner {
    id: number;
    name: string;
    game: string;
    round: number;
    predicted_number: string;
    bet_amount: number | string;
    reward_amount: number | string;
    target_date: string;
    created_at: string;
}

export default function WinnersClient() {
    const router = useRouter();
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGame, setSelectedGame] = useState('All');

    useEffect(() => {
        const fetchWinners = async () => {
            try {
                const res = await api.get('/marketing/frontend/dummy-winners');
                if (Array.isArray(res.data)) {
                    setWinners(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch winners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWinners();
    }, []);

    const filteredWinners = useMemo(() => {
        return winners.filter(w => {
            const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                w.predicted_number.includes(searchQuery);
            const matchesGame = selectedGame === 'All' || w.game === selectedGame;
            return matchesSearch && matchesGame;
        });
    }, [winners, searchQuery, selectedGame]);

    const stats = useMemo(() => {
        if (!winners.length) return { totalWins: 0, highestPay: 0, topGame: '--' };

        const highestPay = Math.max(...winners.map(w => Number(w.reward_amount)));

        const gameCounts: Record<string, number> = {};
        winners.forEach(w => {
            gameCounts[w.game] = (gameCounts[w.game] || 0) + 1;
        });
        const topGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0][0];

        return { totalWins: winners.length, highestPay, topGame };
    }, [winners]);

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-16 h-16 border-4 border-slate-100 border-t-amber-500 rounded-full mb-6"
            />
            <h2 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tighter">Victory Vault</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Archiving global wins...</p>
        </div>
    );

    const gameTabs = ['All', 'Shillong', 'Khanapara', 'Juwai'];

    return (
        <main className="min-h-screen bg-slate-50 text-[#1D1D1F] pb-32 font-sans selection:bg-amber-500/20 relative overflow-x-hidden">

            {/* LAS Cinematic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <img
                    src="/teer-history-bg.png"
                    className="w-full h-full object-cover brightness-[0.98] opacity-[0.05] saturate-[0.8] scale-110 blur-xl"
                    alt="Background Structure"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 via-white/80 to-slate-50/50" />
            </div>

            <div className="relative z-10 px-4 md:px-8 max-w-[1000px] mx-auto pt-8">

                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-slate-400 hover:text-amber-600 transition-colors group"
                    >
                        <ChevronLeft className="w-7 h-7 -ml-2.5" />
                        <span className="text-[17px] font-medium tracking-tight">Back</span>
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-white/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Victory Records Live</span>
                    </div>
                </div>

                {/* Hero Panel */}
                <div className="mb-10 rounded-[40px] overflow-hidden bg-white border border-slate-200/60 shadow-md group relative flex flex-col md:flex-row items-stretch min-h-[220px]">
                    <div className="relative w-full md:w-[32%] h-48 md:h-auto overflow-hidden shrink-0 bg-slate-900">
                        <img
                            src="/teer-history-bg.png"
                            alt="Winners Hub"
                            className="w-full h-full object-cover opacity-60 brightness-[0.8] transition-transform duration-[20s] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className="relative"
                            >
                                <Award className="w-20 h-20 text-amber-400 drop-shadow-2xl" />
                                <Crown className="w-8 h-8 text-amber-300 absolute -top-4 -right-2 rotate-12" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="p-8 md:p-10 flex-1 flex flex-col justify-center relative z-10">
                        <div className="flex items-center gap-2.5 mb-4 px-1">
                            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-lg">
                                <Trophy className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Global Winner Archive</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-amber-500 transition-all duration-700">
                            The Hall of Champions. <br />
                            <span className="text-slate-400 group-hover:text-slate-500 transition-colors">Every hit recorded.</span>
                        </h1>
                        <p className="text-[12px] text-slate-400 font-medium leading-relaxed max-w-lg mb-8 px-1">
                            A definitive record of the Teer community&apos;s most accurate predictions. This ledger archives every bullseye hit across our ecosystem in real-time.
                        </p>

                        <div className="relative group/search max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/search:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search champion or hit number..."
                                className="w-full h-12 pl-11 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/10 focus:border-amber-400/50 transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-center min-h-[150px]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100/50">
                                    <Medal className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Victories</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{stats.totalWins.toLocaleString()}</span>
                                <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">Hits</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-center min-h-[150px]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Highest Reward</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[18px] font-bold text-slate-400 tracking-tighter">₹</span>
                                <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{stats.highestPay.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex bg-slate-900 rounded-[28px] p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden flex-col justify-center min-h-[150px]">
                        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-fuchsia-400 border border-white/10 shadow-inner">
                                    <Crown className="w-5 h-5 fill-fuchsia-400" />
                                </div>
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Leader Game</span>
                            </div>
                            <div className="text-3xl font-black tracking-tight leading-none mb-1 uppercase">{stats.topGame}</div>
                            <p className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">Highest Success Frequency</p>
                        </div>
                    </div>
                </div>

                {/* Game Tabs */}
                <div className="sticky top-[20px] z-40 mb-12 flex justify-center">
                    <div className="bg-white/70 backdrop-blur-3xl rounded-full p-1.5 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex items-center gap-1.5 min-w-fit">
                        {gameTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedGame(tab)}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 flex items-center gap-2",
                                    selectedGame === tab
                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                {tab === 'All' && <Filter className="w-3.5 h-3.5" />}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Winners Feed */}
                {filteredWinners.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-1">
                        <AnimatePresence mode="popLayout">
                            {filteredWinners.map((winner, idx) => (
                                <PredictionWinnerCard
                                    key={winner.id}
                                    winner={{
                                        ...winner,
                                        bet_amount: Number(winner.bet_amount),
                                        reward_amount: Number(winner.reward_amount)
                                    }}
                                    delay={idx * 0.03}
                                    layout="horizontal"
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6 shrink-0 border-4 border-white shadow-sm">
                            <Trophy className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No championships archived.</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">Try adjusting your filters to find global victory records.</p>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-20 p-12 rounded-[56px] bg-white border border-slate-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.02)] relative overflow-hidden text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.05),transparent_70%)]" />
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-inner border border-amber-100/50">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Become a Champion Predictor.</h2>
                        <p className="text-slate-400 font-medium mb-10 leading-relaxed max-w-lg mx-auto">
                            Our Winners Archive is real-time. Make your prediction today and secure your permanent spot in the Teer Club Hall of Fame.
                        </p>
                        <button
                            onClick={() => router.push('/predictions')}
                            className="h-14 px-10 bg-slate-900 text-white text-[13px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500 transition-all shadow-xl shadow-slate-900/10 hover:shadow-amber-500/30 flex items-center gap-3 mx-auto active:scale-95 group"
                        >
                            Start Predicting <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
        >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    )
}
