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
                quality: 1,
                pixelRatio: 3,
                cacheBust: true,
            });

            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], "teer-prediction.png", { type: blob.type });
                await navigator.share({
                    title: 'My Teer Prediction 🎯',
                    text: `Predicting ${prediction.number} on Teer Club today! Join me here: https://teer.club`,
                    files: [file],
                });
            } else {
                const link = document.createElement('a');
                link.download = `teer-prediction-${prediction.number}.png`;
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
                            className="w-full relative overflow-hidden rounded-[40px] shadow-2xl bg-white"
                            style={{ aspectRatio: '4/5' }}
                        >
                            {/* Modern Dark Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950" />

                            {/* Animated Background Pulse */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.15)_0%,transparent_70%)] pointer-events-none" />

                            <div className="relative h-full flex flex-col p-10 z-10 text-white justify-between">
                                {/* Header */}
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/10 shadow-inner">
                                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                            <span className="text-[10px] font-black tracking-widest uppercase text-white/90">
                                                {prediction.gameType}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
                                        <Target className="w-5 h-5 text-indigo-400" />
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <span className="text-[11px] font-black tracking-[0.3em] text-indigo-400 uppercase mb-4 opacity-80">
                                        MY PREDICTION TODAY
                                    </span>

                                    <div className="relative">
                                        <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full scale-150" />
                                        <h1 className="text-[10rem] leading-none font-black tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative z-10">
                                            {prediction.number}
                                        </h1>
                                    </div>

                                    <div className="mt-6 px-5 py-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-2 shadow-inner">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[10px] font-bold text-white/60 tracking-wider uppercase">High Probability Target</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 flex items-center justify-between shadow-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-xs border border-white/20">
                                            {userName.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/40 font-bold tracking-widest uppercase mb-0.5">Predictor</p>
                                            <p className="font-extrabold text-sm tracking-tight">{userName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <img src="/favicon.ico" alt="Teer Club" className="w-6 h-6 ml-auto mb-1 opacity-50" />
                                        <p className="text-[9px] font-black text-indigo-400 tracking-tighter uppercase">TEER.CLUB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="w-full px-4">
                            <motion.button
                                whileTap={tapRipple as any}
                                onClick={handleShare}
                                disabled={isSharing}
                                className={cn(
                                    "w-full py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 text-white shadow-2xl transition-all active:scale-95",
                                    shared ? "bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                                )}
                            >
                                {isSharing ? (
                                    <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : shared ? (
                                    <>
                                        <Check className="w-5 h-5" /> Shared to Group
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-5 h-5" /> Share to WhatsApp
                                    </>
                                )}
                            </motion.button>
                            <p className="text-center text-white/40 text-[10px] font-bold uppercase tracking-widest mt-4">
                                Viral Predictor Card • teer.club
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
