'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    BarChart3,
    ArrowRight,
    Star,
    Trophy,
    Users,
    ShieldCheck,
    Zap,
    Sparkles,
    Bookmark,
    Check,
    Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface CommonNumberRecord {
    id: number;
    game: string;
    target_date: string;
    house: string;
    ending: string;
    direct_numbers: string;
}

export function CommonNumbersCard({ initialRecords = [] }: { initialRecords?: CommonNumberRecord[] }) {
    const router = useRouter();
    const [records, setRecords] = useState<CommonNumberRecord[]>(initialRecords);
    const [loading, setLoading] = useState(initialRecords.length === 0);
    const [activeGame, setActiveGame] = useState('Shillong');
    const [savedIds, setSavedIds] = useState<number[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check auth
                const me = await api.get('/auth/me').catch(() => null);
                setIsLoggedIn(!!me?.data?.success);

                // Fetch today's numbers
                const res = await api.get('/common-numbers/today');
                if (res.data.success) {
                    setRecords(res.data.data);
                }

                // If logged in, fetch library to show saved state
                if (me?.data?.success) {
                    const libRes = await api.get('/common-numbers/library');
                    if (libRes.data.success) {
                        setSavedIds(libRes.data.data.map((r: any) => r.id));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch common numbers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSave = async (recordId: number) => {
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }
        try {
            const res = await api.post('/common-numbers/save', { common_number_id: recordId });
            if (res.data.success) {
                setSavedIds(prev => [...prev, recordId]);
            }
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const currentRecord = records.find(r => r.game === activeGame);
    const GAMES = ['Shillong', 'Khanapara', 'Juwai'];

    if (loading) {
        return (
            <div className="w-full bg-white/80 backdrop-blur-md rounded-[32px] border border-white shadow-sm overflow-hidden flex flex-col animate-pulse">
                <div className="p-6 border-b border-indigo-50/50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[14px] bg-slate-200" />
                        <div className="space-y-2">
                            <div className="w-32 h-4 bg-slate-200 rounded-md" />
                            <div className="w-24 h-3 bg-slate-200 rounded-md" />
                        </div>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map((group) => (
                        <div key={group} className="space-y-3">
                            <div className="w-32 h-3 bg-slate-200 rounded-md mb-2" />
                            <div className="flex gap-3 flex-wrap">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-[14px] bg-slate-200" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (records.length === 0) return null;

    return (
        <div className="w-full bg-slate-50/20 rounded-[32px] md:rounded-[48px] p-1.5 md:p-2.5 border border-slate-100 shadow-[0_15px_45px_rgba(0,0,0,0.02)] relative group transition-all duration-1000">
            {/* Ambient Aura Backgrounds */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-100/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-rose-100/5 blur-[80px] rounded-full -ml-24 -mb-24 pointer-events-none" />

            <div className="relative bg-white/90 backdrop-blur-2xl rounded-[28px] md:rounded-[42px] border border-white shadow-[0_5px_20px_rgba(0,0,0,0.01)] overflow-hidden">

                {/* Game Tabs & Save Button Header */}
                <div className="px-8 md:px-12 pt-10 md:pt-14 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex gap-2 p-1.5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        {GAMES.map(game => (
                            <button
                                key={game}
                                onClick={() => setActiveGame(game)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-xs font-bold transition-all",
                                    activeGame === game
                                        ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105"
                                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                                )}
                            >
                                {game}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Prediction</span>
                        </div>
                        {currentRecord && (
                            <button
                                onClick={() => handleSave(currentRecord.id)}
                                disabled={savedIds.includes(currentRecord.id)}
                                className={cn(
                                    "p-3 rounded-2xl transition-all active:scale-95 border",
                                    savedIds.includes(currentRecord.id)
                                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                        : "bg-white border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-600"
                                )}
                            >
                                {savedIds.includes(currentRecord.id) ? (
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase">Saved</span>
                                    </div>
                                ) : (
                                    <Bookmark className="w-4 h-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Data Content - Restored Old Style Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeGame}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="px-8 md:px-12 pt-10 md:pt-14 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16"
                    >
                        {currentRecord ? (
                            <>
                                {/* Left Column: Target Numbers (Mapping Direct Numbers here) */}
                                <div className="space-y-6 md:space-y-8">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Target Direct Numbers</h4>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">AI Probability</span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 md:gap-5">
                                        {currentRecord.direct_numbers.split(',').map((num, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ delay: i * 0.08 }}
                                                className="relative group/box"
                                            >
                                                <div className={cn(
                                                    "aspect-square rounded-2xl md:rounded-[24px] flex flex-col items-center justify-center gap-1.5 transition-all duration-500 relative overflow-hidden",
                                                    i === 0
                                                        ? "bg-indigo-600 text-white shadow-[0_15px_30px_rgba(79,70,229,0.2)] scale-105 z-10"
                                                        : "bg-slate-50/50 border border-slate-100 shadow-sm hover:shadow-lg hover:translate-y-[-2px] hover:bg-white hover:border-indigo-100/50"
                                                )}>
                                                    <div className={cn(
                                                        "absolute inset-0 bg-gradient-to-br transition-opacity duration-1000",
                                                        i === 0 ? "from-indigo-400 to-indigo-700 opacity-100" : "from-slate-50 to-white opacity-0 group-hover/box:opacity-100"
                                                    )} />
                                                    <span className={cn(
                                                        "text-2xl md:text-3xl font-bold tracking-tight relative z-10 leading-none",
                                                        i === 0 ? "text-white" : "text-slate-900"
                                                    )}>
                                                        {num.trim()}
                                                    </span>
                                                    <div className={cn(
                                                        "px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-wider relative z-10",
                                                        i === 0 ? "bg-white/20 text-white" : "bg-white text-slate-400 group-hover/box:bg-indigo-50 group-hover/box:text-indigo-600"
                                                    )}>
                                                        {i === 0 ? 'High Prob' : 'Strong'}
                                                    </div>
                                                </div>
                                                {i === 0 && (
                                                    <div className="absolute -top-2 -right-2 z-20">
                                                        <div className="bg-gradient-to-tr from-amber-400 to-yellow-300 p-1.5 rounded-lg shadow-lg border-2 border-white transform rotate-12">
                                                            <Trophy className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Column: House & Ending */}
                                <div className="space-y-6 md:space-y-8">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">House & Ending Digits</h4>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Master Picks</span>
                                    </div>

                                    <div className="grid grid-cols-4 gap-4 md:gap-5">
                                        {/* Merging House and Ending into the boxes */}
                                        {[...currentRecord.house.split(','), ...currentRecord.ending.split(',')].map((num, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                transition={{ delay: 0.3 + (i * 0.08) }}
                                                className="relative group/box"
                                            >
                                                <div className={cn(
                                                    "aspect-square rounded-2xl md:rounded-[24px] flex flex-col items-center justify-center gap-1.5 transition-all duration-500 relative overflow-hidden",
                                                    i < currentRecord.house.split(',').length
                                                        ? "bg-rose-600 text-white shadow-[0_15px_30px_rgba(244,63,94,0.2)] scale-105 z-10"
                                                        : "bg-slate-50/50 border border-slate-100 shadow-sm hover:shadow-lg hover:translate-y-[-2px] hover:bg-white hover:border-rose-100/50"
                                                )}>
                                                    <div className={cn(
                                                        "absolute inset-0 bg-gradient-to-br transition-opacity duration-1000",
                                                        i < currentRecord.house.split(',').length ? "from-rose-400 to-rose-700 opacity-100" : "from-slate-50 to-white opacity-0 group-hover/box:opacity-100"
                                                    )} />
                                                    <span className={cn(
                                                        "text-2xl md:text-3xl font-bold tracking-tight relative z-10 leading-none",
                                                        i < currentRecord.house.split(',').length ? "text-white" : "text-slate-900"
                                                    )}>
                                                        {num.trim()}
                                                    </span>
                                                    <div className={cn(
                                                        "px-2 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-wider relative z-10",
                                                        i < currentRecord.house.split(',').length ? "bg-white/20 text-white" : "bg-white text-slate-400 group-hover/box:bg-rose-50 group-hover/box:text-rose-600"
                                                    )}>
                                                        {i < currentRecord.house.split(',').length ? 'House' : 'Ending'}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <Zap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Awaiting AI Signal...</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Professional Footer - Restored Old Style */}
                <div className="bg-slate-50/40 backdrop-blur-xl p-8 md:p-10 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-white/50 text-slate-900">
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-4">
                            {[1, 5, 8, 3].map(i => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden transform transition-all hover:-translate-y-2 hover:scale-110 hover:z-10 cursor-pointer relative">
                                    <Image
                                        src={`https://i.pravatar.cc/100?u=${i}`}
                                        alt="Community Member"
                                        fill
                                        sizes="48px"
                                        className="object-cover saturate-[0.8] brightness-[1.05]"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 tracking-tight">Community Trust Factor</span>
                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1">AI 94.2% Probability Index</span>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/blog')}
                        className="relative group/btn overflow-hidden rounded-2xl shadow-xl shadow-indigo-100/50"
                    >
                        <div className="absolute inset-0 bg-slate-900 transition-transform duration-500 group-hover/btn:scale-105" />
                        <div className="relative px-8 py-4 flex items-center gap-3">
                            <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Strategy Library</span>
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-400 transition-transform duration-500 group-hover/btn:translate-x-1.5" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
