'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface HistoryItem {
    date: string;
    shillong: {
        round1: string;
        round2: string;
    };
    khanapara: {
        round1: string | null;
        round2: string | null;
    };
    juwai: {
        round1: string | null;
        round2: string | null;
    };
}

interface HistoryListProps {
    history: HistoryItem[];
}

export function HistoryList({ history }: HistoryListProps) {
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm transition-all animate-in fade-in zoom-in-95 duration-700">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Records Found</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Adjust filters for more results</p>
            </div>
        );
    }

    return (
        <div className="relative pl-8 sm:pl-10 space-y-6 pb-32">
            {/* Industry Gradient Timeline */}
            <div className="absolute left-[15px] sm:left-[21px] top-4 bottom-0 w-[2px] bg-indigo-100 rounded-full opacity-60" />

            {history.map((item, index) => {
                const dateObj = new Date(item.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
                const dayNum = dateObj.getDate().toString().padStart(2, '0');

                return (
                    <motion.div
                        key={item.date}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.5 }}
                        className="relative group"
                    >
                        {/* Professional Timeline Node */}
                        <div className="absolute -left-10 sm:-left-12 top-5 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-white border-[3px] border-indigo-500 shadow-sm z-10 group-hover:scale-110 transition-transform duration-300" />
                        </div>

                        {/* Social Header: Professional Alignment */}
                        <div className="flex items-center gap-3 mb-3 px-1">
                            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden shrink-0">
                                <span className="text-[9px] font-bold text-indigo-500 uppercase leading-none mt-0.5">{monthName}</span>
                                <span className="text-base font-bold text-slate-900 leading-none mb-0.5">{dayNum}</span>
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="text-[15px] font-bold text-slate-900 tracking-tight leading-none mb-1 truncate">
                                    Teer Result - {dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dayName} Update</span>
                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Verified Archive</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Industry Grade Result Card */}
                        <div className="bg-white rounded-xl p-1.5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">

                                {/* Shillong Teer Segment */}
                                <div className="bg-slate-50/50 rounded-[18px] p-4 border border-slate-100/50 transition-colors hover:bg-rose-50/20 group/item">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                                <span className="text-rose-600 font-bold text-[10px]">SL</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Shillong Teer</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="flex-1 flex flex-col items-center py-2 bg-white rounded-xl border border-slate-50 shadow-sm">
                                            <span className="text-[8px] font-medium text-slate-300 uppercase tracking-widest mb-1.5">R1</span>
                                            <span className="text-3xl font-bold text-slate-800 tracking-tight">{item.shillong.round1 || '--'}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center py-2 bg-white rounded-xl border border-slate-50 shadow-sm">
                                            <span className="text-[8px] font-medium text-slate-300 uppercase tracking-widest mb-1.5">R2</span>
                                            <span className="text-3xl font-bold text-slate-800 tracking-tight">{item.shillong.round2 || '--'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Khanapara Teer Segment */}
                                <div className="bg-slate-50/50 rounded-[18px] p-4 border border-slate-100/50 transition-colors hover:bg-emerald-50/20 group/item">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                                <span className="text-emerald-600 font-bold text-[10px]">KH</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Khanapara Teer</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="flex-1 flex flex-col items-center py-2 bg-white rounded-xl border border-slate-50 shadow-sm">
                                            <span className="text-[8px] font-medium text-slate-300 uppercase tracking-widest mb-1.5">R1</span>
                                            <span className="text-3xl font-bold text-slate-800 tracking-tight">{item.khanapara.round1 || '--'}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center py-2 bg-white rounded-xl border border-slate-50 shadow-sm">
                                            <span className="text-[8px] font-medium text-slate-300 uppercase tracking-widest mb-1.5">R2</span>
                                            <span className="text-3xl font-bold text-slate-800 tracking-tight">{item.khanapara.round2 || '--'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Juwai Teer Segment */}
                                <div className="bg-slate-50/50 rounded-[18px] p-4 border border-slate-100/50 transition-colors hover:bg-purple-50/20 group/item">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100">
                                                <span className="text-purple-600 font-bold text-[10px]">JW</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Juwai Teer</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="flex-1 flex flex-col items-center py-2 bg-white rounded-xl border border-slate-50 shadow-sm">
                                            <span className="text-[8px] font-medium text-slate-300 uppercase tracking-widest mb-1.5">R1</span>
                                            <span className="text-3xl font-bold text-slate-800 tracking-tight">{item.juwai?.round1 || '--'}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center py-2 bg-white rounded-xl border border-slate-50 shadow-sm">
                                            <span className="text-[8px] font-medium text-slate-300 uppercase tracking-widest mb-1.5">R2</span>
                                            <span className="text-3xl font-bold text-slate-800 tracking-tight">{item.juwai?.round2 || '--'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

export function HistorySkeleton() {
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
                    <div className="h-[140px] bg-white rounded-xl border border-slate-100" />
                </div>
            ))}
        </div>
    );
}
