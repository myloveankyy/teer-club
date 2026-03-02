'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, ShieldCheck, Lock, Globe, ArrowUpRight, ChevronLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Group {
    id: string;
    name: string;
    members: number;
    description: string;
    isPrivate: boolean;
    category: string;
    image: string; // maps to image_key or icon_url from DB
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await fetch('/api/groups');
                const data = await res.json();
                setGroups(data);
            } catch (error) {
                console.error("Failed to fetch groups:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 font-sans selection:bg-indigo-500/20 relative overflow-x-hidden">
            {/* Ambient Luxe Backdrop */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.03),transparent_40%),radial-gradient(circle_at_100%_100%,rgba(16,185,129,0.03),transparent_40%)] pointer-events-none" />

            <div className="relative z-10 px-4 md:px-6 max-w-[1200px] mx-auto pt-8">
                {/* Industry Grade Header */}
                <div className="max-w-[800px] mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full mb-4">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Predictor Communities</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
                        Official Shillong & Khanapara <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Teer Strategy Groups</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl">
                        Connect with top-ranked technical predictors, share dream interpretations, and master the community-vetted tactics.
                    </p>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-[200px] bg-white rounded-[32px] animate-pulse shadow-sm border border-slate-100" />
                        ))
                    ) : (
                        groups.map((group, index) => (
                            <Link
                                key={group.id}
                                href={`/groups/${group.id}`}
                                className="group relative flex flex-col bg-white rounded-[32px] p-6 border border-slate-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_48px_rgba(79,70,229,0.1)] transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                            >
                                {/* Luxe Ambient Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={cn(
                                            "w-14 h-14 rounded-[18px] flex items-center justify-center text-xl font-bold text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                            group.image === 'shillong' ? "bg-gradient-to-br from-rose-500 to-orange-500 shadow-rose-500/20" :
                                                group.image === 'khanapara' ? "bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-indigo-500/20" :
                                                    group.image === 'night' ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-violet-500/20" :
                                                        "bg-gradient-to-br from-emerald-500 to-teal-400 shadow-emerald-500/20"
                                        )}>
                                            {group.name.charAt(0)}
                                        </div>
                                        <div className="p-2 rounded-full bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                                            <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {group.name}
                                            </h3>
                                            {group.category === 'Official' && (
                                                <div className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[13px] text-slate-500 font-medium line-clamp-2 leading-relaxed h-[40px]">
                                            {group.description}
                                        </p>
                                    </div>

                                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[12px] font-bold text-slate-600 tracking-tight">
                                                    {group.members.toLocaleString()} Members
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100">
                                            {group.isPrivate ? (
                                                <>
                                                    <Lock className="w-3 h-3 text-rose-500" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Private</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Globe className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Public</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {/* Engagement Footer */}
                <div className="mt-20 p-10 rounded-[40px] bg-white border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.04)] text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_70%)]" />
                    <div className="relative z-10 max-w-lg mx-auto">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Can't find your club?</h2>
                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            Premium members can create their own private prediction circles. Join the elite hub today.
                        </p>
                        <button className="px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 shadow-slate-900/10 hover:shadow-indigo-600/20">
                            Apply for Group Creation
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
