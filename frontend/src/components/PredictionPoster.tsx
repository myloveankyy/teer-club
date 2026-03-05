"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Share2, Download, Check, X, Target, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { slideUpModalVariants, tapRipple } from "@/lib/motion";

interface PredictionPosterProps {
    isOpen: boolean;
    onClose: () => void;
    prediction: {
        number: string;
        gameType: string;
        amount: number;
    };
    userName: string;
}

export function PredictionPosterModal({ isOpen, onClose, prediction, userName }: PredictionPosterProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [shared, setShared] = useState(false);

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            await new Promise(res => setTimeout(res, 300)); // Allow rendering

            const dataUrl = await toPng(cardRef.current, {
                quality: 0.90, // Lowered slightly for faster generation
                pixelRatio: 2.0, // Optimized for high-speed mobile sharing
                cacheBust: true,
                skipFonts: false,
            });

            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], "teer-club-target.png", { type: blob.type });
                await navigator.share({
                    title: 'Bhai ka Target 🎯',
                    text: `Teer Club pe mera aaj ka single mapping! Check karo: https://teer.club`,
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
            console.error("Failed to share prediction", err);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
                    />

                    <motion.div
                        variants={slideUpModalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-sm flex flex-col items-center gap-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* SHARABLE POSTER */}
                        <div
                            ref={cardRef}
                            className="w-full relative overflow-hidden rounded-[48px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] bg-slate-900"
                            style={{ aspectRatio: '4/5.5' }}
                        >
                            {/* Realistic Background Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center grayscale shadow-inner opacity-40 mix-blend-overlay"
                                style={{ backgroundImage: 'url("/shillong-bg.png")' }}
                            />

                            {/* Dark Deep Blue Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 via-slate-900/95 to-slate-950" />

                            {/* Glow Effects */}
                            <div className="absolute top-0 left-1/4 w-full h-1/2 bg-indigo-500/10 blur-[120px] rounded-full" />
                            <div className="absolute bottom-1/4 right-0 w-full h-1/2 bg-blue-600/10 blur-[120px] rounded-full" />

                            <div className="relative h-full flex flex-col p-8 z-10 text-white justify-between">
                                {/* Header */}
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 bg-indigo-500/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-indigo-300">
                                                {prediction.gameType}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-white/40 tracking-widest uppercase">
                                            LIVE TARGET
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex-1 flex flex-col items-center justify-center -mt-4">
                                    <div className="relative mb-2">
                                        <Sparkles className="w-6 h-6 text-indigo-400 absolute -top-8 -left-8 animate-bounce" />
                                        <span className="text-[12px] font-black tracking-[0.4em] text-white/30 uppercase text-center block">
                                            AAJ KA SINGLE NUMBER
                                        </span>
                                    </div>

                                    <div className="relative py-2">
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full" />
                                        <h1 className="text-[11rem] leading-none font-black tracking-tighter drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] text-white italic relative z-10 text-center w-full">
                                            {prediction.number}
                                        </h1>
                                    </div>

                                    <div className="mt-4 px-6 py-2.5 bg-indigo-500/20 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3 shadow-lg">
                                        <Target className="w-4 h-4 text-white animate-pulse" />
                                        <span className="text-[11px] font-black text-white tracking-widest uppercase leading-none">Target Locked!</span>
                                    </div>
                                </div>

                                {/* App Promotion Section */}
                                <div className="mt-6 flex flex-col gap-4">
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                <div className="w-5 h-5 rounded-full border border-slate-900 bg-indigo-500" />
                                                <div className="w-5 h-5 rounded-full border border-slate-900 bg-purple-500" />
                                                <div className="w-5 h-5 rounded-full border border-slate-900 bg-blue-500" />
                                            </div>
                                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Join 50k+ Players</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="px-2 py-1 bg-white/10 rounded-md border border-white/5 flex items-center gap-0.5 grayscale opacity-60">
                                                <span className="text-[7px] font-black text-white/50 uppercase">Play Store</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-5 flex items-center justify-between shadow-2xl relative group/footer overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover/footer:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-sm border border-white/20 shadow-lg">
                                                {userName.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-white/40 font-black tracking-[0.2em] uppercase mb-0.5">Bhai ka Prediction</p>
                                                <p className="font-black text-base tracking-tight text-white">{userName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right relative z-10">
                                            <div className="font-black text-sm text-white tracking-tighter italic mb-0.5">TEER<span className="text-indigo-400">.CLUB</span></div>
                                            <p className="text-[8px] font-black text-white/30 tracking-[0.3em] uppercase underline decoration-indigo-500/50">www.teer.club</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="w-full">
                            <motion.button
                                whileTap={tapRipple as any}
                                onClick={handleShare}
                                disabled={isSharing}
                                className={cn(
                                    "w-full py-5 rounded-[32px] font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 text-white shadow-2xl transition-all active:scale-95 border border-white/10 relative overflow-hidden",
                                    shared ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/40"
                                )}
                            >
                                {isSharing ? (
                                    <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : shared ? (
                                    <>
                                        <Check className="w-5 h-5" /> Shared to Group!
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-5 h-5" /> Share to WhatsApp Karo
                                    </>
                                )}
                            </motion.button>
                            <div className="flex justify-center gap-6 mt-6">
                                <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Download className="w-3 h-3" /> Auto Save
                                </span>
                                <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Premium
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
