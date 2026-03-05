"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Share2, Download, Check, X, Target, MapPin, Sparkles, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { slideUpModalVariants, tapRipple } from "@/lib/motion";

interface ResultPosterProps {
    isOpen: boolean;
    onClose: () => void;
    region: string;
    round: number;
    result: string;
    date: string;
}

export function ResultPosterModal({ isOpen, onClose, region, round, result, date }: ResultPosterProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [shared, setShared] = useState(false);

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            await new Promise(res => setTimeout(res, 200));

            const dataUrl = await toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 4, // Ultra-high resolution for "sexier" social sharing
                cacheBust: true,
                style: {
                    borderRadius: '0px'
                }
            });

            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], `teer-club-result-${region}-${round}.png`, { type: blob.type });
                await navigator.share({
                    title: `Official ${region.toUpperCase()} Result 🎯`,
                    text: `Teer Club: ${region} Round ${round} Result is ${result}! Check history at https://teer.club`,
                    files: [file],
                });
            } else {
                const link = document.createElement('a');
                link.download = `teer-club-${region}-round${round}.png`;
                link.href = dataUrl;
                link.click();
            }
            setShared(true);
            setTimeout(() => setShared(false), 3000);
        } catch (err) {
            console.error("Capture failed:", err);
        } finally {
            setIsSharing(false);
        }
    };

    const getBgImage = () => {
        if (region.toLowerCase() === 'khanapara') return '/khanapara-bg.png';
        if (region.toLowerCase() === 'juwai') return '/juwai-bg.png';
        return '/shillong-bg.png';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
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
                            className="absolute -top-16 right-0 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-md border border-white/10 active:scale-90"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* --- HIGH-END SOCIAL POSTER --- */}
                        <div
                            ref={cardRef}
                            className="w-full relative overflow-hidden rounded-[48px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] bg-white group/poster"
                            style={{ aspectRatio: '4/6' }}
                        >
                            {/* Realistic Culture-based Background */}
                            <div
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover/poster:scale-110"
                                style={{ backgroundImage: `url('${getBgImage()}')` }}
                            />

                            {/* Minimalist White Gradient for that "Sexy" sleek look */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-white/95" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_60%)]" />

                            <div className="relative h-full flex flex-col p-9 z-10 justify-between">
                                {/* Top Badges - Official Declaration */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-2xl">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">
                                                OFFICIAL DECLARATION
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 tracking-tight text-lg leading-none uppercase">{region}</h4>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Meghalaya Tradition</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="px-3 py-1 bg-indigo-600 rounded-lg text-white font-black text-[10px] tracking-widest uppercase shadow-lg shadow-indigo-600/30">
                                            {round === 1 ? 'FR' : 'SR'} ROUND
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-900/40">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-[10px] font-black">{date}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Result Number Display */}
                                <div className="flex-1 flex flex-col items-center justify-center relative">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className="relative"
                                    >
                                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center w-full">
                                            <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500 mb-2 animate-bounce" />
                                            <span className="text-[12px] font-black tracking-[0.5em] text-slate-400 uppercase text-center block">
                                                AAJ KA HIT NUMBER
                                            </span>
                                        </div>

                                        <h1 className="text-[14rem] leading-[0.75] font-black tracking-tighter text-slate-950/95 drop-shadow-[0_12px_24px_rgba(0,0,0,0.1)] select-none">
                                            {result}
                                        </h1>

                                        <div className="mt-12 flex flex-col items-center">
                                            <div className="w-12 h-1 bg-indigo-600 rounded-full mb-4 shadow-[0_0_12px_rgba(79,70,229,0.5)]" />
                                            <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                                                <Check className="w-4 h-4 text-emerald-600" />
                                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">REAL-TIME VERIFIED</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Bottom Branding Section */}
                                <div className="space-y-6">
                                    <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[40px] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] flex items-center justify-between overflow-hidden relative group/footer">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent opacity-0 group-hover/footer:opacity-100 transition-opacity duration-500" />
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl flex items-center justify-center border border-white/20 shadow-xl group-hover/footer:rotate-6 transition-transform">
                                                <Trophy className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-lg tracking-tight uppercase">Teer<span className="text-indigo-400">.Club</span></p>
                                                <p className="text-[10px] text-white/40 font-bold tracking-[0.2em] uppercase">Advanced Analytics</p>
                                            </div>
                                        </div>
                                        <div className="text-right relative z-10">
                                            <div className="font-black text-[9px] text-white/30 tracking-[0.4em] uppercase mb-1">DOWNLOAD APP</div>
                                            <div className="flex gap-1.5 justify-end opacity-40">
                                                <div className="w-10 h-3.5 bg-white/20 rounded-md" />
                                                <div className="w-10 h-3.5 bg-white/20 rounded-md" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verification Footer Text */}
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                                        <span className="text-[9px] font-black tracking-[0.4em] uppercase text-slate-900 text-center">
                                            Official Results Portal v2.2 • Securing Traditions
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="w-full px-4 pt-2">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleShare}
                                disabled={isSharing}
                                className={cn(
                                    "w-full py-6 rounded-[32px] font-black text-[14px] uppercase tracking-[0.25em] flex items-center justify-center gap-4 text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden",
                                    shared
                                        ? "bg-emerald-500"
                                        : "bg-indigo-600"
                                )}
                            >
                                {isSharing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Designing Card...</span>
                                    </div>
                                ) : shared ? (
                                    <>
                                        <Check className="w-6 h-6 stroke-[3]" />
                                        <span>Sent to WhatsApp!</span>
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-6 h-6 stroke-[3]" />
                                        <span>Share to WhatsApp</span>
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
