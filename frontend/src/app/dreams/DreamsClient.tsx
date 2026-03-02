'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Cloud, Heart, Ghost, Eye, Home, Search, ArrowUp, Loader2, Feather, ChevronLeft, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Dream {
    dream: string;
    numbers: string[];
    category: string;
    description?: string;
}

const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case 'nature': return <Cloud className="w-5 h-5" />;
        case 'animals': return <Zap className="w-5 h-5" />;
        case 'events': return <Sparkles className="w-5 h-5" />;
        case 'objects': return <Home className="w-5 h-5" />;
        case 'people': return <Heart className="w-5 h-5" />;
        case 'supernatural': return <Ghost className="w-5 h-5" />;
        case 'emotions': return <Eye className="w-5 h-5" />;
        default: return <Feather className="w-5 h-5" />;
    }
};

const SkeletonDreamCard = () => (
    <div className="relative h-[220px] rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-50/80 to-transparent pointer-events-none" />
        <div className="relative h-full p-6 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100/50" />
                    <div className="w-20 h-6 rounded-full bg-slate-50 border border-slate-100/50" />
                </div>
                <div className="w-3/4 h-8 rounded-lg bg-slate-50 mb-3" />
                <div className="w-full h-4 rounded bg-slate-50 mb-2" />
                <div className="w-2/3 h-4 rounded bg-slate-50" />
            </div>
            <div className="flex gap-2 pt-5">
                <div className="w-12 h-12 rounded-lg bg-slate-50" />
                <div className="w-12 h-12 rounded-lg bg-slate-50" />
            </div>
        </div>
    </div>
);

export default function DreamsClient() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Dream[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => { fetchDreams(''); }, []);

    useEffect(() => {
        if (query.length === 0) { fetchDreams(''); return; }
        if (query.length < 20 && !aiAnalyzing) { fetchDreams(debouncedQuery); }
    }, [debouncedQuery]);

    const fetchDreams = async (q: string) => {
        setLoading(true);
        try {
            const url = q ? `/api/dreams?q=${encodeURIComponent(q)}` : `/api/dreams`;
            const res = await fetch(url);
            const data = await res.json();
            setResults(data);
        } catch (error) {
            console.error("Failed to search dreams:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchOrAi = async () => {
        if (!query) return;
        const isComplex = query.split(' ').length > 2;
        if (isComplex) {
            setAiAnalyzing(true);
            setResults([]);
            try {
                const res = await fetch(`/api/dreams?mode=ai&q=${encodeURIComponent(query)}`);
                const data = await res.json();
                const aiDreams = data.map((d: any) => ({ dream: query, numbers: d.luckyNumbers, category: d.symbolism, description: d.interpretation }));
                setResults(aiDreams);
            } catch (error) {
                console.error("AI Analysis failed:", error);
            } finally {
                setAiAnalyzing(false);
            }
        } else {
            fetchDreams(query);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-32 relative font-sans antialiased">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4">
                <div className="max-w-[1000px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 rounded-full text-slate-400 hover:bg-slate-50 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Moon className="w-5 h-5" />
                            </div>
                            <h1 className="text-lg font-bold text-slate-900">Teer Dream Numbers</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative px-4 md:px-6 max-w-[800px] mx-auto mt-12 z-10">
                <div className="mb-12 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">AI Vision Analysis</span>
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                        Turn Your Dreams into <span className="text-indigo-600">Lucky Numbers</span>
                    </motion.h2>
                    <p className="text-slate-500 text-[15px] max-w-md mx-auto leading-relaxed">
                        Search simple symbols or type your full vision to let our AI decipher the hidden sequence.
                    </p>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="relative max-w-2xl mx-auto mb-16">
                    <div className="relative rounded-xl bg-white shadow-sm border border-slate-200 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 transition-all duration-300 overflow-hidden">
                        <input ref={inputRef} type="text"
                            placeholder="Describe your vision (e.g. 'I saw a white tiger')..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchOrAi()}
                            className="w-full pl-6 pr-16 py-5 bg-transparent border-none text-[16px] md:text-[18px] text-slate-800 placeholder:text-slate-300 outline-none font-medium" />
                        <button onClick={handleSearchOrAi} disabled={!query || aiAnalyzing}
                            className={cn("absolute right-2 top-2 bottom-2 aspect-square rounded-lg flex items-center justify-center transition-all duration-300",
                                query ? "bg-slate-900 hover:bg-slate-800 text-white" : "bg-slate-100 text-slate-300 cursor-not-allowed")}>
                            {aiAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 pb-32">
                    <AnimatePresence mode='popLayout'>
                        {loading || aiAnalyzing ? (
                            [...Array(3)].map((_, i) => (
                                <motion.div key={`skel-${i}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <SkeletonDreamCard />
                                </motion.div>
                            ))
                        ) : (
                            results.map((item, index) => (
                                <motion.div key={index + item.dream} layout
                                    initial={{ opacity: 0, scale: 0.98, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                                    className="group bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                                    {getCategoryIcon(item.category)}
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                    {item.category} Symbolism
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight capitalize">{item.dream}</h3>
                                            {item.description && <p className="text-[14px] text-slate-500 leading-relaxed max-w-lg">{item.description}</p>}
                                        </div>
                                        <div className="shrink-0 pt-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Lucky Sequence</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {item.numbers.map((num) => (
                                                    <div key={num} className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[20px] font-bold shadow-sm transition-transform hover:scale-110">
                                                        {num}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {!loading && !aiAnalyzing && results.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No interpretations found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm">
                            Try searching for shorter terms or use the AI Analysis for complex visions.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
