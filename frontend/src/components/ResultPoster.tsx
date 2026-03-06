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
    round1Result?: string;
    round2Result?: string;
    date: string;
    userName?: string;
}

export function ResultPosterModal({ isOpen, onClose, region, round1Result, round2Result, date, userName = "Top Predictor" }: ResultPosterProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [shared, setShared] = useState(false);

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            const dataUrl = await toPng(cardRef.current, {
                quality: 0.9,
                pixelRatio: 2,
                cacheBust: true,
                style: { borderRadius: '0px' }
            });

            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], `teer-club-${region}.png`, { type: blob.type });
                await navigator.share({
                    title: `Official ${region.toUpperCase()} Result`,
                    text: `Teer Club: ${region} Today's Results! FR: ${round1Result || '--'} | SR: ${round2Result || '--'}. Join at https://teer.club`,
                    files: [file],
                });
            } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(`Official ${region.toUpperCase()} Teer Result Today: FR: ${round1Result || '--'} | SR: ${round2Result || '--'}. Join and Earn at https://teer.club`)}`, '_blank');
            }
            setShared(true);
            setTimeout(() => setShared(false), 3000);
        } catch (err) {
            console.error("Share failed:", err);
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
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-0 md:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95"
                    />

                    <motion.div
                        variants={slideUpModalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full md:max-w-[420px] h-full md:h-auto flex flex-col items-center justify-center gap-4 bg-black md:bg-transparent"
                    >
                        {/* Native Close for Mobile */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 w-10 h-10 bg-white/5 text-white flex items-center justify-center z-50 md:-top-16 md:right-0 active:scale-90"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* --- ARTIST-DRIVEN CINEMATIC POSTER --- */}
                        <div
                            ref={cardRef}
                            className="w-[90%] md:w-full relative bg-black overflow-hidden border border-white/5 shadow-2xl"
                            style={{ aspectRatio: '1/1.4' }}
                        >
                            {/* Cinematic Focus Background */}
                            <div
                                className="absolute inset-0 bg-cover bg-center saturate-[0.8] brightness-[0.35]"
                                style={{ backgroundImage: `url('${getBgImage()}')` }}
                            />

                            {/* Artful Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-black/40" />
                            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-[120px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px]" />

                            <div className="relative h-full flex flex-col p-8 md:p-12 z-10 justify-between">
                                {/* Top Branding: Minimalist & Spaced */}
                                <div className="flex justify-between items-start border-b border-white/5 pb-6">
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-white tracking-[0.4em] text-sm uppercase leading-none">{region}</h4>
                                        <p className="text-[10px] font-medium text-indigo-400 uppercase tracking-widest opacity-80">Official Archery Result</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1.5 font-black text-[9px] tracking-[0.3em] text-white">
                                            <div className="w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                                            LIVE DATA
                                        </div>
                                        <span className="text-[9px] font-bold text-white/30 tracking-[0.2em]">{date}</span>
                                    </div>
                                </div>

                                {/* Center Stage: Numbers as Art (Responsive & Fluid) */}
                                <div className="flex-1 flex flex-col items-center justify-center relative py-4 overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />

                                    <div className="flex flex-col items-center group relative z-10 w-full">
                                        <span className="text-[9px] md:text-[10px] font-black tracking-[0.6em] text-white/20 uppercase mb-2 transition-all group-hover:text-indigo-500 group-hover:tracking-[0.8em]">FIRST ROUND</span>
                                        <h1 className="text-[clamp(5rem,20vw,10rem)] leading-none font-black tracking-tighter text-white select-none text-center">
                                            {round1Result || '--'}
                                        </h1>
                                        <div className="w-12 h-0.5 bg-indigo-500/30 mt-1 rounded-full" />
                                    </div>

                                    {/* Marketing Seal - Scaled for Mobile */}
                                    <div className="relative w-full h-10 my-4 flex items-center justify-center">
                                        <div className="absolute w-[120%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full relative z-20 shadow-2xl overflow-hidden group/seal">
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover/seal:opacity-100 transition-opacity" />
                                            <p className="text-[9px] md:text-[11px] font-black text-white tracking-[0.1em] text-center whitespace-nowrap">
                                                GET INSTANT <span className="text-emerald-400">₹25</span> AT <span className="text-indigo-400 font-extrabold">TEER.CLUB</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center group relative z-10 w-full">
                                        <span className="text-[9px] md:text-[10px] font-black tracking-[0.6em] text-white/20 uppercase mb-2 transition-all group-hover:text-purple-500 group-hover:tracking-[0.8em]">SECOND ROUND</span>
                                        <h1 className="text-[clamp(3.5rem,15vw,7rem)] leading-none font-black tracking-tighter text-white/90 select-none text-center">
                                            {round2Result || '--'}
                                        </h1>
                                    </div>
                                </div>

                                {/* Bottom: Editorial Slogan & Sign-off */}
                                <div className="flex flex-col gap-6 pt-6 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <p className="text-[20px] md:text-[26px] font-black text-white tracking-widest uppercase leading-none">TEER<span className="text-indigo-500">.CLUB</span></p>
                                            <p className="text-[9px] md:text-[10px] text-indigo-300 font-bold uppercase tracking-[0.4em] leading-none">The Science of Prediction</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1 leading-none">Verified By</p>
                                            <p className="text-sm md:text-base font-black text-white uppercase leading-none">{userName}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-1.5 opacity-10">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <div key={i} className="w-1 h-1 bg-white rounded-full" />)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Integrated Action Bar: Sexy Buttons */}
                        <div className="w-[90%] md:w-full flex flex-col gap-3 pb-8 md:pb-0">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleShare}
                                disabled={isSharing}
                                className="w-full py-4 bg-white text-black font-black text-[12px] uppercase tracking-[0.5em] flex flex-col items-center justify-center gap-0.5 shadow-[0_25px_50px_-12px_rgba(255,255,255,0.2)] group relative overflow-hidden rounded-2xl"
                            >
                                <div className="flex items-center gap-3 relative z-10 transition-all group-hover:scale-105 group-hover:tracking-[0.6em]">
                                    <Share2 className="w-4 h-4" />
                                    <span>Share & Earn ₹25</span>
                                </div>
                                {isSharing && (
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    </div>
                                )}
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleShare}
                                className="w-full py-4 bg-transparent border border-white/20 text-white font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 group transition-all hover:bg-white/5 hover:border-white/40 active:scale-95 rounded-2xl"
                            >
                                <div className="relative">
                                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 group-hover:rotate-12 transition-transform" />
                                    <div className="absolute inset-0 bg-amber-500 blur-md opacity-20" />
                                </div>
                                <span>Add to Story</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
