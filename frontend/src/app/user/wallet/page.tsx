"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    History,
    Target,
    ShieldCheck,
    TrendingUp,
    Zap,
    ChevronLeft,
    Plus,
    Minus,
    QrCode,
    Sparkles,
    Shield,
    ArrowRight,
    ChevronRight,
    Trophy,
    Percent,
    ArrowRightLeft,
    Monitor,
    Smartphone
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function WalletDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [bets, setBets] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'transactions' | 'bets'>('transactions');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const userRes = await api.get('/auth/me');
                if (!userRes.data.success) {
                    router.push('/login');
                    return;
                }
                setUser(userRes.data.user);

                const [txRes, betRes] = await Promise.all([
                    api.get('/transactions/me'),
                    api.get('/bets/me')
                ]);

                if (txRes.data.success) setTransactions(txRes.data.data);
                if (betRes.data.success) setBets(betRes.data.data);

            } catch (error) {
                console.error("Failed to load wallet dashboard", error);
                router.push('/login');
            } finally {
                setTimeout(() => setLoading(false), 900);
            }
        };

        fetchDashboardData();
    }, [router]);

    const stats = useMemo(() => {
        const totalWon = bets.filter(b => b.status === 'WON').length;
        const totalEarning = bets.filter(b => b.status === 'WON').reduce((acc, curr) => acc + parseFloat(curr.payout || 0), 0);
        const winRatio = bets.length > 0 ? (totalWon / bets.length) : 0;
        const reputationDigit = Math.round(winRatio * 100);

        return { totalWon, totalEarning, reputationDigit, winRatio };
    }, [bets]);

    const WalletSkeleton = () => (
        <div className="min-h-screen bg-white flex flex-col pt-2 overflow-hidden px-6 max-w-[1200px] mx-auto w-full">
            <div className="flex justify-between py-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-50 animate-pulse" />
                <div className="w-24 h-4 bg-slate-50 rounded animate-pulse" />
                <div className="w-8 h-8 rounded-lg bg-slate-50 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="h-[200px] w-full rounded-[32px] bg-slate-50 animate-pulse" />
                    <div className="h-32 w-full rounded-[32px] bg-slate-50 animate-pulse" />
                </div>
                <div className="lg:col-span-8 space-y-6">
                    <div className="h-12 w-full rounded-2xl bg-slate-50 animate-pulse" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 w-full rounded-2xl bg-slate-50 animate-pulse" />)}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <WalletSkeleton />;
    if (!user) return null;

    const balance = parseFloat(user.wallet_balance);

    return (
        <main className="min-h-[100dvh] bg-white relative flex flex-col font-sans select-none overflow-x-hidden antialiased">

            {/* Ambient Background Elements (Desktop Optimized) */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-[5%] right-[10%] w-[30%] h-[30%] bg-indigo-50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[5%] left-[5%] w-[25%] h-[40%] bg-purple-50 rounded-full blur-[120px]" />
            </div>

            {/* Responsive "Perfect" Header */}
            <header className="sticky top-0 z-[60] px-6 lg:px-12 pt-3 pb-3 flex items-center justify-between bg-white/80 backdrop-blur-3xl border-b border-slate-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-50 active:scale-95 transition-all lg:border lg:border-slate-100"
                    >
                        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                    <div className="hidden lg:block">
                        <h1 className="text-[14px] font-bold text-slate-900 tracking-tight leading-none mb-1">Professional Wallet Hub</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encrypted Architecture</p>
                    </div>
                </div>

                <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex flex-col items-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Secure Vault</p>
                    <h1 className="text-[12px] font-bold text-slate-900 tracking-tight lg:hidden">V5 Core Assets</h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Sync Active</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-[14px] text-white font-bold shadow-lg shadow-indigo-900/10 transition-transform hover:rotate-3">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto relative z-10 w-full no-scrollbar pb-12 lg:pb-0">
                <div className="max-w-[1200px] mx-auto w-full px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN: Asset Hub & Reputation (Fixed feel on Desktop) */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-8 flex flex-col">

                        {/* Compact Balance Hero */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900 rounded-[36px] p-8 text-white relative overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] transform-gpu lg:sticky lg:top-24"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-16 -mt-16" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-indigo-200">Teer IQ Verified</span>
                                    </div>
                                    <Sparkles className="w-4 h-4 text-amber-400 opacity-40 animate-pulse" />
                                </div>

                                <div className="mb-10">
                                    <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.25em] mb-2 block">Available Assets</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-bold text-white/30">₹</span>
                                        <span className="text-5xl font-bold tracking-tighter">
                                            {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="bg-white text-slate-950 h-13 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-xl shadow-black/20 hover:bg-slate-50">
                                        <Plus className="w-4 h-4" strokeWidth={3} /> Add
                                    </button>
                                    <button className="bg-white/5 border border-white/10 text-white h-13 rounded-2xl font-bold text-[13px] flex items-center justify-center gap-2.5 active:scale-95 transition-all hover:bg-white/10">
                                        <Minus className="w-4 h-4" strokeWidth={3} /> Withdraw
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* High-Density Reputation Dashboard */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-50 border border-slate-100 rounded-[36px] p-7 grid grid-cols-2 lg:grid-cols-1 gap-6 relative overflow-hidden group lg:sticky lg:top-[430px]"
                        >
                            <div className="flex flex-col border-r lg:border-r-0 lg:border-b border-slate-200/60 pr-4 lg:pr-0 lg:pb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-amber-50 rounded-lg">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Net Earning</span>
                                </div>
                                <p className="text-2xl font-bold text-slate-900 tracking-tight">₹{stats.totalEarning.toLocaleString()}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[9.5px] font-bold text-emerald-500 uppercase tracking-widest">+{stats.totalWon} Targets Won</span>
                                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span className="text-[9.5px] font-bold text-slate-300 uppercase tracking-widest">Today</span>
                                </div>
                            </div>

                            <div className="flex flex-col pl-4 lg:pl-0 lg:pt-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                                        <Zap className="w-4 h-4 text-indigo-500" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Reputation Score</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{stats.reputationDigit}</p>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">PLATINUM</span>
                                </div>
                                <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Win Ratio: {stats.winRatio.toFixed(2)}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Archive & Interaction (Adaptive Scale) */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-8">

                        {/* Quick Action Grid (Industry Scale - Centered on Desktop) */}
                        <div className="grid grid-cols-4 gap-4 xl:gap-8 max-w-[600px] lg:mx-0">
                            {[
                                { icon: QrCode, label: "QR Bet", active: true },
                                { icon: History, label: "Statement" },
                                { icon: ShieldCheck, label: "Certify" },
                                { icon: Plus, label: "Rewards" }
                            ].map((item, i) => (
                                <button key={i} className="flex flex-col items-center gap-3 active:scale-90 transition-all group">
                                    <div className={cn(
                                        "w-14 h-14 xl:w-16 xl:h-16 rounded-[24px] flex items-center justify-center border border-slate-100/80 transition-all duration-300",
                                        item.active ? "bg-white shadow-xl shadow-slate-200/50 border-indigo-100 text-indigo-600 scale-105" : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:border-slate-200 group-hover:text-slate-600"
                                    )}>
                                        <item.icon className="w-6 h-6 xl:w-7 xl:h-7" strokeWidth={2.2} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Statement Hub (Full-Width High Density) */}
                        <div className="bg-white border border-slate-100 rounded-[40px] p-6 lg:p-8 shadow-[0_12px_48px_-12px_rgba(0,0,0,0.05)] flex flex-col min-h-[500px]">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex flex-col">
                                    <h2 className="text-[12px] font-bold text-slate-900 uppercase tracking-[0.2em] mb-1">Archive Statement</h2>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Real-time Node Sync</span>
                                </div>
                                <div className="flex gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                                    <button
                                        onClick={() => setActiveTab('transactions')}
                                        className={cn(
                                            "px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                            activeTab === 'transactions' ? "bg-white text-slate-900 shadow-md border border-slate-50" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >Timeline</button>
                                    <button
                                        onClick={() => setActiveTab('bets')}
                                        className={cn(
                                            "px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                                            activeTab === 'bets' ? "bg-white text-slate-900 shadow-md border border-slate-50" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >Hall-of-Fame</button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.3, ease: "circOut" }}
                                    className="space-y-4"
                                >
                                    {activeTab === 'transactions' ? (
                                        <div className="space-y-3">
                                            {transactions.length === 0 ? (
                                                <div className="py-32 text-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                                        <History className="w-6 h-6 text-slate-200" />
                                                    </div>
                                                    <p className="text-slate-300 text-[11px] font-bold uppercase tracking-[0.2em]">Transaction Archive Empty</p>
                                                </div>
                                            ) : (
                                                transactions.map((tx: any) => {
                                                    const isPositive = tx.type === 'DEPOSIT' || tx.type === 'WINNING';
                                                    return (
                                                        <div key={tx.id} className="flex items-center justify-between p-5 rounded-[24px] border border-slate-50 hover:border-slate-100 hover:bg-slate-50/50 transition-all group">
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn(
                                                                    "w-11 h-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
                                                                    isPositive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-slate-400 border-slate-100"
                                                                )}>
                                                                    {isPositive ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-[14px] text-slate-900 leading-none mb-1.5">
                                                                        {tx.type === 'BET_DEDUCTION' ? 'Market Liquidity' :
                                                                            tx.type === 'WINNING' ? 'Prize Settlement' :
                                                                                tx.type.charAt(0) + tx.type.slice(1).toLowerCase()}
                                                                    </p>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            {format(new Date(tx.created_at), 'MMM dd • HH:mm')}
                                                                        </span>
                                                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight">ID: {String(tx.id).slice(0, 8)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={cn(
                                                                    "text-[18px] font-bold tracking-tight mb-0.5",
                                                                    isPositive ? "text-emerald-600" : "text-slate-900"
                                                                )}>
                                                                    {isPositive ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString()}
                                                                </p>
                                                                <div className="flex items-center gap-1 justify-end">
                                                                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Verified</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {bets.length === 0 ? (
                                                <div className="col-span-full py-32 text-center bg-slate-50/50 rounded-[30px] border border-dashed border-slate-200">
                                                    <Target className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-300 text-[11px] font-bold uppercase tracking-widest">No Predictions Found</p>
                                                </div>
                                            ) : (
                                                bets.map((bet: any) => (
                                                    <div key={bet.id} className="bg-white p-5 rounded-[28px] border border-slate-100 flex flex-col shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group active:scale-[0.98]">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-lg transform group-hover:rotate-3 transition-transform">
                                                                    {bet.number}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-[13px] text-slate-900 leading-none mb-1">{bet.game_type}</p>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bet.round}</p>
                                                                </div>
                                                            </div>
                                                            <div className={cn(
                                                                "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                                                bet.status === 'WON' ? "border-emerald-100 text-emerald-600 bg-emerald-50" : "border-slate-100 text-slate-400 bg-slate-50"
                                                            )}>
                                                                {bet.status}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-end justify-between mt-auto">
                                                            <div>
                                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Wager Volume</span>
                                                                <p className="text-lg font-bold text-slate-900 tracking-tight leading-none">₹{parseFloat(bet.amount).toLocaleString()}</p>
                                                            </div>
                                                            {bet.status === 'WON' && (
                                                                <div className="text-right">
                                                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1 block">Payout Ratio</span>
                                                                    <p className="text-xl font-bold text-emerald-600 tracking-tighter leading-none">+₹{parseFloat(bet.payout || 0).toLocaleString()}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Minimalist Trust Branding Footer */}
                <div className="flex flex-col items-center gap-3 py-16 opacity-30 px-6">
                    <div className="flex items-center gap-4">
                        <div className="h-[1px] w-12 bg-slate-300" />
                        <Shield className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                        <div className="h-[1px] w-12 bg-slate-300" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.5em] text-center">Teer Pro Global • Universal Trust Layer • v5.2.0</p>
                </div>
            </div>

            {/* RESPONSIVE ACTION HUB: Fixed Floating Bar on Mobile, Integrated feel on Desktop */}
            <div className="fixed bottom-6 inset-x-0 z-[100] px-8 md:px-12 pointer-events-none flex justify-center">
                <motion.button
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-[400px] lg:max-w-[480px] bg-slate-900 text-white h-14 lg:h-16 rounded-[24px] shadow-[0_24px_48px_-8px_rgba(0,0,0,0.3)] pointer-events-auto flex items-center justify-between px-8 active:scale-95 transition-all relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                            <QrCode className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <span className="text-[12px] font-bold uppercase tracking-widest">Scan & Sync Prediction</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                </motion.button>
            </div>
        </main>
    );
}
