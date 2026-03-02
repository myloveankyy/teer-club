'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { HistoryList } from '@/components/HistoryList';
import { ChevronLeft, ChevronDown, Calendar as CalendarIcon, TrendingUp, Award, BarChart3, Flame } from 'lucide-react';
import Link from 'next/link';

interface HistoryItem {
    date: string;
    shillong: { round1: string; round2: string; };
    khanapara: { round1: string | null; round2: string | null; };
    juwai: { round1: string | null; round2: string | null; };
}

export default function HistoryClient() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/results/history');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setHistory(data);
                    if (data.length > 0) {
                        const latestDate = new Date(data[0].date);
                        setSelectedYear(latestDate.getFullYear().toString());
                        setSelectedMonth(latestDate.getMonth().toString());
                    }
                } else if (data && data.data && Array.isArray(data.data)) {
                    setHistory(data.data);
                } else {
                    setHistory([]);
                }
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const years = useMemo(() => {
        if (!Array.isArray(history)) return [];
        const uniqueYears = new Set(history.map(item => new Date(item.date).getFullYear().toString()));
        return Array.from(uniqueYears).sort((a, b) => b.localeCompare(a));
    }, [history]);

    const filteredHistory = useMemo(() => {
        if (!Array.isArray(history)) return [];
        return history.filter(item => {
            const date = new Date(item.date);
            const yearMatch = selectedYear ? date.getFullYear().toString() === selectedYear : true;
            const monthMatch = selectedMonth ? date.getMonth().toString() === selectedMonth : true;
            return yearMatch && monthMatch;
        });
    }, [history, selectedYear, selectedMonth]);

    const [visibleCount, setVisibleCount] = useState(10);
    const visibleHistory = useMemo(() => filteredHistory.slice(0, visibleCount), [filteredHistory, visibleCount]);
    const loadMore = () => setVisibleCount(prev => prev + 10);

    useEffect(() => { setVisibleCount(10); }, [selectedYear, selectedMonth]);

    const monthlyInsights = useMemo(() => {
        if (!filteredHistory.length) return null;
        let totalGames = 0;
        let highestShillongNum = 0;
        const numberFrequency: Record<string, number> = {};

        filteredHistory.forEach(item => {
            totalGames++;
            const sR1Int = parseInt(item.shillong.round1) || 0;
            const sR2Int = parseInt(item.shillong.round2) || 0;
            if (sR1Int > highestShillongNum) highestShillongNum = sR1Int;
            if (sR2Int > highestShillongNum) highestShillongNum = sR2Int;
            if (item.shillong.round1 && item.shillong.round1 !== '--') numberFrequency[item.shillong.round1] = (numberFrequency[item.shillong.round1] || 0) + 1;
            if (item.shillong.round2 && item.shillong.round2 !== '--') numberFrequency[item.shillong.round2] = (numberFrequency[item.shillong.round2] || 0) + 1;
            if (item.khanapara?.round1 && item.khanapara.round1 !== '--') numberFrequency[item.khanapara.round1] = (numberFrequency[item.khanapara.round1] || 0) + 1;
            if (item.khanapara?.round2 && item.khanapara.round2 !== '--') numberFrequency[item.khanapara.round2] = (numberFrequency[item.khanapara.round2] || 0) + 1;
            if (item.juwai?.round1 && item.juwai.round1 !== '--') numberFrequency[item.juwai.round1] = (numberFrequency[item.juwai.round1] || 0) + 1;
            if (item.juwai?.round2 && item.juwai.round2 !== '--') numberFrequency[item.juwai.round2] = (numberFrequency[item.juwai.round2] || 0) + 1;
        });

        let hotNumber = '--'; let hotNumberHits = 0;
        Object.entries(numberFrequency).forEach(([num, count]) => {
            if (count > hotNumberHits) { hotNumber = num; hotNumberHits = count; }
        });
        return { totalGames, highestShillongNum, hotNumber, hotNumberHits };
    }, [filteredHistory]);

    const months = [
        { value: '0', label: 'January' }, { value: '1', label: 'February' },
        { value: '2', label: 'March' }, { value: '3', label: 'April' },
        { value: '4', label: 'May' }, { value: '5', label: 'June' },
        { value: '6', label: 'July' }, { value: '7', label: 'August' },
        { value: '8', label: 'September' }, { value: '9', label: 'October' },
        { value: '10', label: 'November' }, { value: '11', label: 'December' },
    ];

    return (
        <main className="min-h-screen bg-slate-50 text-[#1D1D1F] pb-32 font-sans selection:bg-indigo-500/20 selection:text-indigo-900 relative overflow-x-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="relative w-full h-full">
                    <Image src="/teer-history-bg.png" alt="Shillong Teer archery heritage background" fill
                        className="object-cover brightness-[0.98] opacity-[0.05] saturate-[0.8] scale-110 blur-xl"
                        sizes="100vw" priority={false} quality={40} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-white/80 to-slate-50/50" />
            </div>

            <div className="relative z-10 px-4 md:px-8 max-w-[1000px] mx-auto pt-8">
                <div className="mb-10 rounded-[32px] overflow-hidden bg-white border border-slate-200/60 shadow-md group relative flex flex-col md:flex-row items-stretch">
                    <div className="relative w-full md:w-1/3 h-32 md:h-auto overflow-hidden shrink-0">
                        <Image src="/teer-history-bg.png" alt="Shillong Teer heritage archery Meghalaya" fill
                            className="object-cover brightness-[0.9] transition-transform duration-[20s] group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 33vw" priority={false} />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 hidden md:block" />
                    </div>
                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2.5 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-md">
                                        <Award className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Archive Legacy</span>
                                </div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">Teer Result History</h1>
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-md">
                                    Shillong, Khanapara, and Juwai definitive historical repositories.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 self-start sm:self-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Verified Data</span>
                            </div>
                        </div>
                    </div>
                </div>

                {!loading && monthlyInsights && (
                    <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden h-[140px] flex flex-col justify-center">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500"><TrendingUp className="w-4 h-4" /></div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Peak</span>
                                    </div>
                                    <div className="flex items-baseline gap-2.5">
                                        <span className="text-5xl font-bold text-slate-900 tracking-tighter leading-none">{monthlyInsights.highestShillongNum.toString().padStart(2, '0')}</span>
                                        <div className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[9px] font-bold text-indigo-600 uppercase tracking-tighter">Shillong Teer</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-[24px] p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden h-[140px] flex flex-col justify-center">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-3xl -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><Flame className="w-4 h-4" /></div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hot Sequence</span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-5xl font-bold text-orange-600 tracking-tighter leading-none">{monthlyInsights.hotNumber.padStart(2, '0')}</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-orange-700 uppercase leading-none mb-1">{monthlyInsights.hotNumberHits} Hits</span>
                                            <span className="text-[8px] font-medium text-slate-400 uppercase tracking-tighter">Frequency Data</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex bg-slate-900 rounded-[24px] p-5 text-white border border-slate-800 shadow-xl relative overflow-hidden h-[140px]">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 border border-white/10"><Award className="w-4 h-4" /></div>
                                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Data Guard</span>
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold tracking-tight leading-tight mb-0.5">Verified Results</div>
                                        <p className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">Authentic Teer Records</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Controls */}
                <div className="sticky top-[80px] z-40 mb-12 flex justify-center px-4">
                    <div className="bg-white/70 backdrop-blur-3xl rounded-full p-1.5 border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex items-center gap-1.5 min-w-fit">
                        <div className="relative group transition-all">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <CalendarIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                                className="appearance-none bg-slate-50/50 hover:bg-white pl-10 pr-10 py-2.5 rounded-full text-[13px] font-bold text-slate-700 border border-slate-100 focus:outline-none cursor-pointer transition-all hover:shadow-sm">
                                {months.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                        </div>
                        <div className="w-px h-5 bg-slate-200/50" />
                        <div className="relative group transition-all">
                            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
                                className="appearance-none bg-slate-50/50 hover:bg-white pl-5 pr-10 py-2.5 rounded-full text-[13px] font-bold text-slate-700 border border-slate-100 focus:outline-none cursor-pointer transition-all hover:shadow-sm">
                                {years.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    {loading ? <HistoryListSkeleton /> : (
                        <>
                            <HistoryList history={visibleHistory} />
                            {filteredHistory.length > visibleCount && (
                                <div className="mt-12 flex justify-center pb-20">
                                    <button onClick={loadMore}
                                        className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-900 text-[13px] font-bold rounded-full border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
                                        Load More Previous Results
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

function HistoryListSkeleton() {
    return (
        <div className="relative pl-8 sm:pl-10 space-y-8 pb-32">
            <div className="absolute left-[15px] sm:left-[21px] top-4 bottom-0 w-[2px] bg-slate-100 rounded-full" />
            {[1, 2, 3].map((i) => (
                <div key={i} className="relative animate-pulse">
                    <div className="absolute -left-10 sm:-left-12 top-5 w-3 h-3 rounded-full bg-slate-100 border-[3px] border-slate-200" />
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                        <div className="space-y-2">
                            <div className="h-4 w-48 bg-slate-100 rounded-lg" />
                            <div className="h-3 w-24 bg-slate-100 rounded-lg" />
                        </div>
                    </div>
                    <div className="h-[140px] bg-white rounded-[24px] border border-slate-100" />
                </div>
            ))}
        </div>
    );
}
