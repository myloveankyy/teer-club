'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ArrowLeft, Zap, Star, Shield, Megaphone, Bug, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ChangelogEntry {
    id: number;
    version: string;
    title: string;
    description: string;
    type: string;
    created_at: string;
}

const TYPE_CONFIG = {
    feature: {
        label: 'New Feature',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        bar: 'bg-emerald-500',
        icon: <Star className="w-3.5 h-3.5" />,
        emoji: '🚀',
    },
    improvement: {
        label: 'Improvement',
        color: 'text-blue-600 bg-blue-50 border-blue-100',
        bar: 'bg-blue-500',
        icon: <Zap className="w-3.5 h-3.5" />,
        emoji: '⚡',
    },
    bugfix: {
        label: 'Bug Fix',
        color: 'text-rose-600 bg-rose-50 border-rose-100',
        bar: 'bg-rose-500',
        icon: <Bug className="w-3.5 h-3.5" />,
        emoji: '🐛',
    },
    security: {
        label: 'Security',
        color: 'text-amber-600 bg-amber-50 border-amber-100',
        bar: 'bg-amber-500',
        icon: <Shield className="w-3.5 h-3.5" />,
        emoji: '🛡️',
    },
    announcement: {
        label: 'Announcement',
        color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        bar: 'bg-indigo-500',
        icon: <Megaphone className="w-3.5 h-3.5" />,
        emoji: '📣',
    },
};

// Group by date label
function groupByDate(entries: ChangelogEntry[]) {
    const groups: Record<string, ChangelogEntry[]> = {};
    entries.forEach(entry => {
        const date = new Date(entry.created_at);
        const now = new Date();
        let label: string;
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) label = 'Today';
        else if (diffDays === 1) label = 'Yesterday';
        else if (diffDays < 7) label = 'This Week';
        else {
            label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        if (!groups[label]) groups[label] = [];
        groups[label].push(entry);
    });
    return groups;
}

export default function ChangelogPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChangelog = async () => {
            try {
                const res = await fetch('/api/changelog');
                const data = await res.json();
                if (data.success) setEntries(data.data);
            } catch (err) {
                console.error('Failed to load changelog', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChangelog();
    }, []);

    const grouped = groupByDate(entries);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full"
                />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Updates...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 font-sans antialiased">
            {/* Ambient glow */}
            <div className="fixed top-0 left-0 w-full h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white/50 to-transparent pointer-events-none z-0" />

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-5 py-4">
                <div className="max-w-[640px] mx-auto flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Rocket className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-[15px] font-bold text-slate-900 leading-tight">Changelog</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Updates</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="relative z-10 px-4 md:px-6 max-w-[640px] mx-auto pt-10">

                {/* Hero */}
                <div className="mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-5"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Always Improving</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="text-3xl font-bold text-slate-900 tracking-tight mb-3"
                    >
                        What&apos;s New at Teer Club
                    </motion.h2>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                        Follow along as we ship new features, improvements, and bug fixes every week.
                    </p>
                </div>

                {/* Type Legend */}
                <div className="flex flex-wrap gap-2 justify-center mb-10">
                    {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                        <span key={key} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border", cfg.color)}>
                            {cfg.icon}
                            {cfg.label}
                        </span>
                    ))}
                </div>

                {entries.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Rocket className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No updates yet</h3>
                        <p className="text-slate-400 text-sm">Check back soon for the latest product updates.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {Object.entries(grouped).map(([dateGroup, groupEntries]) => (
                            <div key={dateGroup}>
                                {/* Date Group Label */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="h-px flex-1 bg-slate-200" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] shrink-0">{dateGroup}</span>
                                    <div className="h-px flex-1 bg-slate-200" />
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {groupEntries.map((entry, idx) => {
                                            const cfg = TYPE_CONFIG[entry.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.announcement;
                                            return (
                                                <motion.div
                                                    key={entry.id}
                                                    initial={{ opacity: 0, y: 12 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.04 }}
                                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                                                >
                                                    {/* Color top bar */}
                                                    <div className={cn("h-1 w-full", cfg.bar)} />

                                                    <div className="p-5">
                                                        <div className="flex items-start justify-between gap-4 mb-3">
                                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                                <span className="text-[11px] font-black text-slate-400 font-mono tracking-tight">{entry.version}</span>
                                                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border", cfg.color)}>
                                                                    {cfg.icon}
                                                                    {cfg.label}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide shrink-0">
                                                                {new Date(entry.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>

                                                        <h3 className="text-[15px] font-bold text-slate-900 mb-2 leading-snug">{entry.title}</h3>
                                                        <p className="text-[13px] text-slate-500 leading-relaxed whitespace-pre-line">{entry.description}</p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                {entries.length > 0 && (
                    <div className="mt-16 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            You&apos;re all caught up • {entries.length} update{entries.length !== 1 ? 's' : ''} total
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
