'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Copy,
    TrendingUp,
    Award,
    ArrowRight,
    Gift,
    ChevronRight,
    Target,
    Share2,
    CheckCircle2,
    Info,
    ArrowUpRight,
    Wallet,
    Star,
    Zap,
    Trophy,
    ChevronLeft,
    ShieldCheck,
    Sparkles
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ReferralVisualizer } from '@/components/ReferralVisualizer';

interface ReferralStats {
    referralCode: string;
    referralLink: string;
    totalEarnings: number;
    stats: {
        level1: number;
        level2: number;
        level3: number;
        level4: number;
        level5: number;
        total: number;
    };
}

interface Earning {
    id: number;
    amount: number;
    description: string;
    created_at: string;
}

export default function ReferralPage() {
    const router = useRouter();
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            const [statsRes, earningsRes] = await Promise.all([
                api.get('/referral/stats'),
                api.get('/referral/earnings')
            ]);
            if (statsRes.data.success) setStats(statsRes.data.data);
            if (earningsRes.data.success) setEarnings(earningsRes.data.data);
        } catch (err) {
            console.error('Failed to fetch referral data', err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!stats) return;
        navigator.clipboard.writeText(stats.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full mb-6"
            />
            <h2 className="text-xl font-bold text-slate-900 mb-2">ARCHERY REWARDS</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading your network...</p>
        </div>
    );

    const treeLevels = [
        { label: 'Direct referrals', value: stats?.stats?.level1 || 0, reward: '₹25', color: 'bg-indigo-600' },
        { label: 'Grandchildren', value: stats?.stats?.level2 || 0, reward: '₹5', color: 'bg-indigo-500' },
        { label: 'Level 3 Network', value: stats?.stats?.level3 || 0, reward: '₹2', color: 'bg-indigo-400' },
        { label: 'Level 4 Network', value: stats?.stats?.level4 || 0, reward: '₹2', color: 'bg-indigo-300' },
        { label: 'Global Reach', value: stats?.stats?.level5 || 0, reward: '₹1', color: 'bg-indigo-200' },
    ];

    return (
        <main className="min-h-screen bg-slate-50 text-[#1D1D1F] pb-32 font-sans selection:bg-indigo-500/20 relative overflow-x-hidden">

            {/* LAS Cinematic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <img
                    src="/teer-history-bg.png"
                    className="w-full h-full object-cover brightness-[0.98] opacity-[0.05] saturate-[0.8] scale-110 blur-xl"
                    alt="Background Target Area"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-white/80 to-slate-50/50" />
            </div>

            <div className="relative z-10 px-4 md:px-8 max-w-[1000px] mx-auto pt-8">

                {/* iOS-Style Back Button */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-slate-400 hover:text-indigo-600 transition-colors group"
                    >
                        <ChevronLeft className="w-7 h-7 -ml-2.5" />
                        <span className="text-[17px] font-medium tracking-tight">Back</span>
                    </button>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-white/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rewards Live</span>
                    </div>
                </div>

                {/* Hero Panel */}
                <div className="mb-10 rounded-[40px] overflow-hidden bg-white border border-slate-200/60 shadow-md group relative flex flex-col md:flex-row items-stretch min-h-[220px]">
                    <div className="relative w-full md:w-[35%] h-48 md:h-auto overflow-hidden shrink-0">
                        <img
                            src="/teer-history-bg.png"
                            alt="Referral Hub"
                            className="w-full h-full object-cover brightness-[0.85] transition-transform duration-[20s] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 hidden md:block" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Gift className="w-16 h-16 text-white/40 mb-2" />
                        </div>
                    </div>

                    <div className="p-8 md:p-10 flex-1 flex flex-col justify-center relative z-10">
                        <div className="flex items-center gap-2.5 mb-4 px-1">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                                <Trophy className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Exclusive Prize Hub</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-indigo-600 transition-all duration-700">
                            Build Your Legacy. <br />
                            Claim Your Rewards.
                        </h1>
                        <p className="text-[12px] text-slate-400 font-medium leading-relaxed max-w-lg mb-8 px-1">
                            Connect your network to the Teer Club ecosystem and earn consistent prize commissions across 5 community tiers.
                        </p>

                        {/* Premium Referral Link Utility */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center px-5 font-mono text-[13px] text-slate-600 group/link transition-all hover:bg-white hover:border-indigo-100 overflow-hidden whitespace-nowrap">
                                {stats?.referralLink || "teer.club/ref/..."}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className={cn(
                                    "px-8 h-14 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                                    copied ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-900 text-white shadow-slate-900/10 hover:bg-indigo-600 hover:shadow-indigo-600/20"
                                )}
                            >
                                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy link'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* LAS Bento Statistical Hub */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                    {/* Prize Balance Card */}
                    <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prize Wallet</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-[18px] font-bold text-slate-400 tracking-tighter">₹</span>
                                <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                                    {Math.floor(stats?.totalEarnings || 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Network Size Card */}
                    <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Community Size</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                                    {stats?.stats?.total || 0}
                                </span>
                                <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">Active Members</span>
                            </div>
                        </div>
                    </div>

                    {/* Reward Tier Card */}
                    <div className="hidden lg:flex bg-slate-900 rounded-[28px] p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden flex-col justify-center min-h-[160px]">
                        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] -mr-16 -mt-16 opacity-30" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-400 border border-white/10 shadow-inner">
                                    <Star className="w-5 h-5 fill-amber-400" />
                                </div>
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Status Tier</span>
                            </div>
                            <div>
                                <div className="text-3xl font-black tracking-tight leading-none mb-1">Elite Archer</div>
                                <p className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">Verified High Growth Network</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-10 min-h-[400px] bg-slate-900/5 backdrop-blur-sm rounded-[48px] border border-slate-200/50 p-6 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-slate-100 shadow-sm">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Live Tree</span>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Network Architecture</h2>
                        <p className="text-xs text-slate-400 font-medium mb-2">Visualize your community impact across 5 unique growth tiers.</p>
                        <ReferralVisualizer stats={stats?.stats} />
                    </div>
                </div>

                {/* 5-Level Referral Tree - Refined List View */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left: Tiers List */}
                    <div className="lg:col-span-12">
                        <div className="mb-6 px-1 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-indigo-600" /> Network Performance
                                </h2>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tiered commission distribution system</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {treeLevels.map((lvl, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:border-indigo-100 transition-all group"
                                >
                                    <div className={cn("w-12 h-12 rounded-2xl mb-4 flex items-center justify-center text-white shadow-lg", lvl.color)}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div className="mb-4">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{lvl.label}</p>
                                        <h4 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{lvl.value}</h4>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50">
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">{lvl.reward} / Player</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Settlement History - LAS Table Style */}
                    <div className="lg:col-span-12 mt-12 pb-20">
                        <div className="mb-6 px-1 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" /> Settlement Log
                                </h2>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified archival referral credits</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] overflow-hidden border border-slate-200/60 shadow-md">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Ledger</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description / Recipient</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Credit Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {earnings.length > 0 ? (earnings.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-indigo-50/10 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors" />
                                                        <span className="text-[12px] font-bold text-slate-400 font-mono tracking-widest uppercase">
                                                            {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-[14px] font-bold text-slate-700 tracking-tight uppercase group-hover:text-slate-900">{tx.description}</p>
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Automatic Settlement</p>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="inline-flex items-center gap-2 text-emerald-600 font-black">
                                                        <span className="text-[16px] tracking-tighter">+ ₹{tx.amount.toFixed(2)}</span>
                                                        <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))) : (
                                            <tr>
                                                <td colSpan={3} className="px-8 py-24 text-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-4">
                                                        <Award className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">No Settlement History</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LAS Footer Immersive CTA */}
                <div className="p-12 rounded-[48px] bg-slate-900 text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_70%)]" />
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <Zap className="w-32 h-32 text-indigo-500 transition-transform group-hover:scale-110 duration-1000" />
                    </div>
                    <div className="relative z-10 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-6 border border-white/10">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Growth Accelerator</span>
                        </div>
                        <h2 className="text-3xl font-black mb-4 tracking-tight">Expand the Circle. <br /> Multiply the Prizes.</h2>
                        <p className="text-white/50 font-medium mb-10 leading-relaxed">
                            Elite Archers who invite over 10 active players per month unlock unique priority commission status and boosted settlement multipliers.
                        </p>
                        <button className="h-14 px-10 bg-white text-slate-900 font-black text-[13px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all shadow-xl active:scale-95 group/btn overflow-hidden relative">
                            <span className="relative z-10 flex items-center gap-3">
                                View Accelerator Terms <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
