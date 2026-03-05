"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Feather, Wallet, Loader2, Coins, ChevronRight, Check } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { slideUpModalVariants, backdropVariants, tapRipple, successPop } from "@/lib/motion";

const GAME_TYPES = [
    "Shillong FR", "Shillong SR",
    "Khanapara FR", "Khanapara SR",
    "Juwai FR", "Juwai SR"
];

import { PredictionPosterModal } from "./PredictionPoster";

export default function PostPredictionModal() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Form State
    const [number, setNumber] = useState("");
    const [gameType, setGameType] = useState(GAME_TYPES[0]);
    const [amount, setAmount] = useState("10");
    const [caption, setCaption] = useState("");

    // Status State
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSuccessState, setIsSuccessState] = useState(false);
    const [showPoster, setShowPoster] = useState(false);
    const [lastPrediction, setLastPrediction] = useState<any>(null);

    const fetchUser = async () => {
        setLoadingAuth(true);
        try {
            const res = await api.get('/auth/me');
            if (res.data.success) {
                setUser(res.data.user);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoadingAuth(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUser();
            setSuccess("");
            setError("");
            setNumber("");
            setCaption("");
            setIsSuccessState(false);
            // Lock body scroll
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none'; // Prevent scroll on mobile completely
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.touchAction = 'auto';
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!number || number.length > 2) {
            setError("Invalid number format.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await api.post('/bets', {
                game_type: gameType,
                round: gameType.includes('FR') ? 'FR' : 'SR',
                number,
                amount: parseFloat(amount),
                caption
            });

            if (res.data.success) {
                setSuccess(res.data.message);
                setUser((prev: any) => ({ ...prev, wallet_balance: res.data.new_balance }));
                setIsSuccessState(true);

                // Store for poster
                setLastPrediction({
                    number,
                    gameType,
                    amount: parseFloat(amount)
                });

                setTimeout(() => {
                    setIsOpen(false);
                    setShowPoster(true); // Trigger viral loop
                    router.refresh();
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to post prediction. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-post-modal', handleOpen);
        return () => window.removeEventListener('open-post-modal', handleOpen);
    }, []);

    return (
        <>
            {/* Modal trigger button moved to BottomNav */}

            {/* Social Post Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end items-end md:items-center md:justify-center px-0 md:px-4">
                        {/* Backdrop */}
                        <motion.div
                            variants={backdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/40"
                        />

                        {/* Slide-out Drawer (Bottom on mobile, Center on desktop) */}
                        <motion.div
                            variants={slideUpModalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="relative w-full md:w-[450px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden native-card"
                        >
                            {/* Drag Handle for Mobile */}
                            <div className="w-full h-8 flex justify-center items-center md:hidden absolute top-0 z-20 bg-gradient-to-b from-white to-transparent">
                                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="px-6 py-4 md:pt-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 w-full mt-4 md:mt-0">
                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                                    New Prediction
                                </h3>
                                <div className="flex items-center gap-3">
                                    {user && (
                                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700">
                                            <Wallet className="w-3.5 h-3.5 text-slate-400" />
                                            ₹{parseFloat(user.wallet_balance).toFixed(0)}
                                        </div>
                                    )}
                                    <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-800 rounded-full transition-colors bg-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-6 relative z-10 scrollbar-hide">
                                {loadingAuth ? (
                                    <div className="flex flex-col items-center justify-center py-20 h-full">
                                        <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
                                        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Authenticating...</p>
                                    </div>
                                ) : !user ? (
                                    <div className="text-center py-8 flex flex-col items-center h-full justify-center">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                            <Feather className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Login Required</h4>
                                        <p className="text-slate-500 mb-8 max-w-[250px] mx-auto text-sm leading-relaxed">Join the community to post your predictions and earn rewards.</p>
                                        <Link href="/login" onClick={() => setIsOpen(false)} className="w-full mt-auto">
                                            <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg active:scale-95">
                                                Sign In to Join
                                            </button>
                                        </Link>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full">
                                        {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold text-center">{error}</div>}

                                        <div className="space-y-5">
                                            {/* Big Target Number Input */}
                                            <div className="flex flex-col items-center py-4 relative group">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="99"
                                                    required
                                                    value={number}
                                                    onChange={e => setNumber(e.target.value)}
                                                    className="w-32 bg-transparent border-b-2 border-slate-200 outline-none text-6xl font-black text-center text-slate-900 focus:border-slate-900 transition-colors placeholder:text-slate-200 pb-2"
                                                    placeholder="00"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Target Number</span>
                                                {/* Focus Glow */}
                                                <div className="absolute inset-0 bg-slate-100 rounded-3xl -z-10 opacity-0 group-focus-within:opacity-50 transition-opacity" />
                                            </div>

                                            {/* Game & Amount Row */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-2">Tag Game</label>
                                                    <select
                                                        value={gameType}
                                                        onChange={e => setGameType(e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-slate-900 outline-none appearance-none cursor-pointer"
                                                    >
                                                        {GAME_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 mb-2">Stake / Bet (₹)</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                            <Coins className="h-4 w-4 text-emerald-500" />
                                                        </div>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="10000"
                                                            value={amount}
                                                            onChange={e => setAmount(e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-slate-900 outline-none transition-shadow"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Social Caption */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-xs font-semibold text-slate-500">Add a caption</label>
                                                    <span className={cn("text-[10px] font-bold", caption.length > 90 ? "text-rose-500" : "text-slate-400")}>
                                                        {caption.length}/100
                                                    </span>
                                                </div>
                                                <textarea
                                                    maxLength={100}
                                                    placeholder="Feeling lucky today..."
                                                    value={caption}
                                                    onChange={e => setCaption(e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-slate-900 outline-none transition-shadow placeholder:text-slate-400 min-h-[80px] resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-4 pb-4 md:pb-0">
                                            <motion.button
                                                whileTap={tapRipple as any}
                                                type="submit"
                                                disabled={submitting || isSuccessState || parseFloat(user.wallet_balance) < parseFloat(amount)}
                                                className={cn(
                                                    "w-full py-4 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2",
                                                    isSuccessState ? "bg-emerald-500 shadow-emerald-500/30" : "bg-slate-900 shadow-slate-900/20 disabled:opacity-50"
                                                )}
                                            >
                                                <AnimatePresence mode="popLayout">
                                                    {isSuccessState ? (
                                                        <motion.div key="success" variants={successPop} initial="hidden" animate="visible" exit="hidden" className="flex items-center gap-2">
                                                            <Check className="w-5 h-5 text-white" />
                                                            <span>Posted!</span>
                                                        </motion.div>
                                                    ) : submitting ? (
                                                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                                            <span>Post Prediction</span>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.button>
                                            {parseFloat(user.wallet_balance) < parseFloat(amount) && !isSuccessState && (
                                                <p className="text-[10px] text-center text-rose-500 font-bold mt-3">Insufficient wallet balance.</p>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {lastPrediction && (
                <PredictionPosterModal
                    isOpen={showPoster}
                    onClose={() => setShowPoster(false)}
                    userName={user?.username || "Predictor"}
                    prediction={lastPrediction}
                />
            )}
        </>
    );
}
