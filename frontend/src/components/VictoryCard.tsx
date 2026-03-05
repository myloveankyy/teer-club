"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Share2, Download, Check, X, Trophy, MapPin, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { slideUpModalVariants } from "@/lib/motion";

interface VictoryCardProps {
    isOpen: boolean;
    onClose: () => void;
    prediction: {
        number: string;
        gameType: string;
        round: string;
        amount: number;
        winAmount: number;
    };
    userName: string;
    isAlmostWon?: boolean;
}

export function VictoryCardModal({ isOpen, onClose, prediction, userName, isAlmostWon = false }: VictoryCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [shared, setShared] = useState(false);

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            await new Promise(res => setTimeout(res, 150)); // Wait for render stabilization

            const dataUrl = await toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 4, // Ultra-high res for premium feel
                cacheBust: true,
                style: {
                    borderRadius: '0px' // Ensure capture is clean
                }
            });

            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], "teer-club-hit.png", { type: blob.type });
                await navigator.share({
                    title: isAlmostWon ? 'Almost Hit! 🎯' : 'Nailed it! 💰',
                    text: `Caught the target on Teer.club! ${prediction.gameType} Result: ${prediction.number}`,
                    files: [file],
                });
            } else {
                const link = document.createElement('a');
                link.download = `teer-club-${prediction.number}.png`;
                link.href = dataUrl;
                link.click();
            }
            setShared(true);
            setTimeout(() => setShared(false), 3000);
        } catch (err) {
            console.error("Capture error", err);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                    />

                    <motion.div
                        variants={slideUpModalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-[420px] flex flex-col items-center gap-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-14 right-0 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/10 active:scale-90"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* --- SHAREABLE POSTER --- */}
                        <div
                            ref={cardRef}
                            className="w-full relative overflow-hidden rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-slate-100 group/poster"
                            style={{ aspectRatio: '4/5' }}
                        >
                            {/* Realistic Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover/poster:scale-110"
                                style={{ backgroundImage: "url('/shillong-bg.png')" }}
                            />

                            {/* Lighter overlays for readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-black/20" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_70%)]" />

                            <div className="relative h-full flex flex-col p-10 z-10 justify-between">
                                {/* Top Badges */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                                            <MapPin className="w-4 h-4 text-emerald-400" />
                                            <span className="text-[11px] font-black tracking-widest uppercase text-white">
                                                {prediction.gameType}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-200 shadow-sm w-fit">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{prediction.round} Round</span>
                                        </div>
                                    </div>
                                    <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white shadow-xl rotate-3 translate-x-1 -translate-y-1">
                                        <Trophy className="w-7 h-7 text-amber-500 drop-shadow-md" />
                                    </div>
                                </div>

                                {/* Main Success Card (Papery/Varnished feel) */}
                                <div className="flex-1 flex flex-col items-center justify-center py-6">
                                    <div className="relative">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.3, type: "spring" }}
                                            className="absolute -top-12 left-1/2 -translate-x-1/2"
                                        >
                                            <div className="bg-emerald-500 text-white px-5 py-2 rounded-full font-black text-[12px] tracking-[0.2em] uppercase shadow-lg border-2 border-white">
                                                {isAlmostWon ? 'NEAR MISS' : 'TARGET HIT'}
                                            </div>
                                        </motion.div>

                                        <h1 className="text-[11rem] leading-[0.8] font-black tracking-tighter text-slate-900 drop-shadow-[0_8px_12px_rgba(0,0,0,0.15)] select-none">
                                            {prediction.number}
                                        </h1>

                                        <div className="mt-8 flex items-center gap-3">
                                            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Master Accuracy</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Modern Bottom Information Bar */}
                                <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[32px] p-6 shadow-2xl flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Expert Player</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-600 text-xs">
                                                {userName.charAt(0)}
                                            </div>
                                            <p className="font-black text-slate-800 tracking-tight text-base">{userName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">Estimated Yield</p>
                                        <p className="font-black text-2xl tracking-tighter text-emerald-600">
                                            ₹{prediction.winAmount < 1000 ? prediction.winAmount : (prediction.winAmount / 1000).toFixed(1) + 'K'}
                                        </p>
                                    </div>
                                </div>

                                {/* Minimalist Brand Tag */}
                                <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                    <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-slate-900">Official Teer.Club Analytics</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions (Not captured in PNG) */}
                        <div className="flex gap-4 w-full px-4">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleShare}
                                disabled={isSharing}
                                className={cn(
                                    "flex-1 py-5 rounded-[24px] font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-3 text-white shadow-2xl transition-all duration-300",
                                    shared
                                        ? "bg-emerald-500"
                                        : "bg-slate-900 hover:bg-black active:shadow-inner"
                                )}
                            >
                                {isSharing ? (
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Capturing...</span>
                                    </div>
                                ) : shared ? (
                                    <>
                                        <Check className="w-5 h-5 stroke-[3]" />
                                        <span>Shared!</span>
                                    </>
                                ) : (
                                    <>
                                        {typeof navigator !== 'undefined' && 'share' in navigator ? <Share2 className="w-5 h-5 stroke-[3]" /> : <Download className="w-5 h-5 stroke-[3]" />}
                                        <span>Share Victory</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// v2.1 deployment bump

