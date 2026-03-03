'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Bell, Menu, Trophy, Info, BookOpen, Map, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { BentoSkeleton } from '@/components/Skeleton';

// Dynamic imports for performance (Industry Grade)
const LiveTicker = dynamic(() => import('@/components/LiveTicker').then(mod => mod.LiveTicker), {
    loading: () => <div className="h-[280px] w-full bg-slate-100 animate-pulse rounded-3xl" />
});
const CommonNumbersCard = dynamic(() => import('@/components/CommonNumbersCard').then(mod => mod.CommonNumbersCard), {
    loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-3xl" />
});
const PredictionWinnerCard = dynamic(() => import('@/components/PredictionWinnerCard').then(mod => mod.PredictionWinnerCard), {
    ssr: false
});
const PredictionFeed = dynamic(() => import('@/components/PredictionFeed').then(mod => mod.PredictionFeed), {
    loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-3xl" />
});
const VictoryCardModal = dynamic(() => import('@/components/VictoryCard').then(mod => mod.VictoryCardModal));

interface HomeClientProps {
    initialWinners?: any[];
    initialLatestResults?: any;
    initialCommonNumbers?: any[];
}

export default function HomeClient({ initialWinners = [], initialLatestResults, initialCommonNumbers }: HomeClientProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const winnersScrollRef = useRef<HTMLDivElement>(null);
    const [activeRegion, setActiveRegion] = useState<'shillong' | 'khanapara' | 'juwai'>('shillong');
    const [dummyWinners, setDummyWinners] = useState<any[]>(initialWinners);

    // Viral Growth Engine: Mocking the win trigger
    const [showVictoryModal, setShowVictoryModal] = useState(false);
    const [victoryType, setVictoryType] = useState<'win' | 'almost'>('win');
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        api.get('/auth/me')
            .then(res => setIsAuth(res.data.success))
            .catch(() => setIsAuth(false));
    }, []);

    useEffect(() => {
        if (initialWinners.length === 0) {
            async function fetchWinners() {
                try {
                    const res = await fetch('/api/marketing/frontend/dummy-winners');
                    if (res.ok) {
                        const data = await res.json();
                        setDummyWinners(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch dummy winners:', error);
                }
            }
            fetchWinners();
        }
    }, [initialWinners]);

    const REGIONS = [
        { id: 'shillong', label: 'Shillong' },
        { id: 'khanapara', label: 'Khanapara' },
        { id: 'juwai', label: 'Juwai' }
    ] as const;

    return (
        <main className="min-h-screen bg-[#F0F2F5] text-slate-800 pb-32 relative selection:bg-indigo-500/20 selection:text-indigo-900 overflow-x-hidden font-sans">

            {/* JSON-LD Structured Data - WebSite Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "Teer Club",
                        "url": "https://teer.club",
                        "description": "Live Shillong Teer, Khanapara Teer, and Juwai Teer results with AI predictions and community insights.",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": {
                                "@type": "EntryPoint",
                                "urlTemplate": "https://teer.club/dreams?q={search_term_string}"
                            },
                            "query-input": "required name=search_term_string"
                        },
                        "sameAs": [
                            "https://teer.club"
                        ]
                    })
                }}
            />
            {/* JSON-LD - Organization Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Teer Club",
                        "url": "https://teer.club",
                        "logo": "https://teer.club/favicon.ico",
                        "description": "India's #1 Teer analytics platform for Shillong, Khanapara, and Juwai Teer results and predictions."
                    })
                }}
            />

            <div className="relative z-10 pt-4 md:pt-6 px-4 md:px-8 max-w-[1600px] mx-auto">
                <div className="mb-8 mt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Shillong Teer Result Today</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time FR &amp; SR Numbers — Updated Daily</p>
                        </div>

                        {/* Region Tabs (Native App Style) */}
                        <div className="flex items-center gap-1 p-1 bg-slate-200/50 rounded-2xl border border-slate-200/50">
                            {REGIONS.map(reg => (
                                <button
                                    key={reg.id}
                                    onClick={() => setActiveRegion(reg.id)}
                                    aria-pressed={activeRegion === reg.id}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                                        activeRegion === reg.id
                                            ? "text-slate-900 bg-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                                    )}
                                >
                                    {reg.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                        {/* Left Column: Live Tickers */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="flex items-center gap-3 px-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Live Results</h2>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeRegion}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex flex-col gap-6"
                                >
                                    <LiveTicker round={1} targetDate={new Date().toISOString()} region={activeRegion} initialResult={initialLatestResults?.[activeRegion]?.round1} />
                                    <LiveTicker round={2} targetDate={new Date().toISOString()} region={activeRegion} initialResult={initialLatestResults?.[activeRegion]?.round2} />
                                </motion.div>
                            </AnimatePresence>

                            {/* Teer Culture Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="mt-4 rounded-[40px] bg-white border border-slate-200/60 shadow-sm relative overflow-hidden group"
                            >
                                <div className="relative h-48 w-full overflow-hidden">
                                    <motion.div
                                        className="relative h-48 w-full overflow-hidden"
                                        style={{ willChange: 'transform' }}
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 15, repeat: Infinity }}
                                    >
                                        <Image
                                            src="/teer-culture.png"
                                            alt="Meghalaya Teer archery culture - Khasi heritage"
                                            fill
                                            className="object-cover transition-transform group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, 500px"
                                            priority={true}
                                        />
                                    </motion.div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
                                    <div className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white">
                                        <Sparkles className="w-4.5 h-4.5" />
                                    </div>
                                </div>

                                <div className="p-8 pt-2 relative z-10">
                                    <div className="mb-6">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">Hit & Target Strategy</p>
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">Master The Board</h3>
                                    </div>

                                    <p className="text-xs text-slate-500 leading-relaxed mb-8 font-medium">
                                        Emerging from the misty peaks of Meghalaya, Teer blends legendary archery skills with modern probabilistic expertise – an ancient tradition evolved for the digital era to find daily targets.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white transition-all group/item cursor-default">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500 group-hover/item:scale-110 transition-transform">
                                                <Map className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-xs font-black text-slate-900 block font-sans">Hill Origins</span>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Khasi & Jaintia Legacy</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white transition-all group/item cursor-default">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500 group-hover/item:scale-110 transition-transform">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-xs font-black text-slate-900 block font-sans">Official Matches</span>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Weekly Shillong Targets</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full mt-10 py-4 rounded-3xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black active:scale-[0.98] transition-all shadow-xl shadow-slate-200 group/btn overflow-hidden relative">
                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
                                        Teer Results History
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Analytics & Feed */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <CommonNumbersCard initialRecords={initialCommonNumbers} />

                            <div className="flex items-center justify-between mb-8 gap-4 px-1">
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-slate-900 mb-1">Community Feed</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Active Predictions</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Live Updates</span>
                                </div>
                            </div>

                            <div className="w-full">
                                <PredictionFeed isAuth={isAuth} />
                            </div>
                        </div>
                    </div>

                    {/* Featured Collections */}
                    <div className="mb-2">
                        <div className="flex justify-between items-center mb-6 px-1">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Recent Winners</h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (winnersScrollRef.current) winnersScrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
                                    }}
                                    className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm group"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (winnersScrollRef.current) winnersScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                                    }}
                                    className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm group"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div
                            ref={winnersScrollRef}
                            className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 -mx-1 scrollbar-hide snap-x snap-mandatory"
                        >
                            {dummyWinners.length > 0 ? (
                                dummyWinners.map((winner, index) => (
                                    <PredictionWinnerCard
                                        key={winner.id}
                                        winner={winner}
                                        delay={0.1 * Math.min(index, 5)}
                                    />
                                ))
                            ) : (
                                <>
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="min-w-[240px] h-[190px] bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse flex flex-col justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-100" />
                                                <div className="space-y-2">
                                                    <div className="w-20 h-3 bg-slate-100 rounded" />
                                                    <div className="w-12 h-2 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                            <div className="bg-slate-50/50 rounded-xl h-20 w-full" />
                                            <div className="flex justify-between items-end pt-2">
                                                <div className="space-y-2">
                                                    <div className="w-8 h-2 bg-slate-100 rounded" />
                                                    <div className="w-12 h-3 bg-slate-100 rounded" />
                                                </div>
                                                <div className="w-16 h-4 bg-slate-100 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <VictoryCardModal
                isOpen={showVictoryModal}
                onClose={() => setShowVictoryModal(false)}
                userName="RahulB"
                isAlmostWon={victoryType === 'almost'}
                prediction={{
                    number: "42",
                    gameType: "Shillong",
                    round: "FR",
                    amount: 100,
                    winAmount: 8000
                }}
            />
        </main>
    );
}
