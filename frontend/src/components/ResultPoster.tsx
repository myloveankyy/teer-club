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

                        {/* --- INDUSTRIAL GRADE SOCIAL POSTER --- */}
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

                            {/* Minimalist Tech Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />



                            {/* --- PREMIUM MARKETING OVERLAYS --- */}

                            {/* Neon Glow Accents */}
                            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[80px]" />
                            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[80px]" />

                            <div className="relative h-full flex flex-col p-6 md:p-10 z-10 justify-between">
                                {/* Top Branding & User Attribution */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                                                <span className="text-[9px] font-black tracking-[0.3em] text-amber-500 uppercase">TEER CLUB EXCLUSIVE</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="font-black text-white tracking-widest text-2xl uppercase leading-none mb-1">{region} ARCHERY</h4>
                                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Verified Numbers by @{userName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5">
                                        <div className="bg-indigo-600 px-3 py-1 rounded-sm text-white font-black text-[9px] tracking-widest uppercase shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                                            LIVE DATA
                                        </div>
                                        <span className="text-[9px] font-black text-white/40 tracking-[0.2em]">{date}</span>
                                    </div>
                                </div>

                                {/* Center Stage: Results with Depth */}
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
                                    <div className="flex flex-col items-center group relative">
                                        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-[9px] font-black tracking-[0.5em] text-white/30 uppercase mb-0 group-hover:text-indigo-400 transition-colors">FIRST ROUND</span>
                                        <h1 className="text-[9rem] md:text-[10rem] leading-none font-black tracking-[-0.05em] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                            {round1Result || '--'}
                                        </h1>
                                    </div>

                                    {/* Signup Bonus Glass Badge */}
                                    <div className="w-full flex justify-center -my-2 relative z-20">
                                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-2.5 rounded-2xl shadow-2xl flex flex-col items-center gap-0.5 transform -rotate-1 hover:rotate-0 transition-transform cursor-pointer group/bonus">
                                            <span className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.3em]">LIMITED OFFER</span>
                                            <p className="text-[11px] font-black text-white text-center leading-tight">GET INSTANT <span className="text-emerald-400">₹25</span> AFTER SIGNUP <br /> AT TEER.CLUB</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center group relative mt-4">
                                        <span className="text-[9px] font-black tracking-[0.5em] text-white/30 uppercase mb-0 group-hover:text-indigo-400 transition-colors">SECOND ROUND</span>
                                        <h1 className="text-[6rem] md:text-[7rem] leading-none font-black tracking-[-0.05em] text-white/80">
                                            {round2Result || '--'}
                                        </h1>
                                    </div>
                                </div>

                                {/* Bottom High-Energy Branding */}
                                <div className="pt-6 mt-auto">
                                    <div className="flex justify-between items-end border-t border-white/10 pt-6">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[22px] font-black text-white tracking-widest uppercase italic">TEER<span className="text-indigo-500">.CLUB</span></p>
                                            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-[0.2em]">CALCULATED TARGETS. REAL REWARDS.</p>
                                        </div>
                                        <div className="flex flex-col items-end opacity-40">
                                            <div className="flex gap-1.5 mb-2">
                                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                                            </div>
                                            <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.4em]">WINNER_CIRCLES_ONLY</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Integrated Action Bar (Optimized for Viral Conversion) */}
                        <div className="w-[90%] md:w-full flex flex-col gap-3 pb-8 md:pb-0">
                            <div className="flex flex-col items-center mb-1">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] animate-pulse">Viral Reward: ₹25 Credits Earned per Share</span>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleShare}
                                disabled={isSharing}
                                className="w-full py-4 bg-white text-black font-black text-[12px] uppercase tracking-[0.4em] flex flex-col items-center justify-center gap-0.5 shadow-[0_20px_40px_rgba(255,255,255,0.15)] group relative overflow-hidden"
                            >
                                <div className="flex items-center gap-3 relative z-10 transition-transform group-hover:scale-105">
                                    <Share2 className="w-4 h-4" />
                                    <span>Share & Earn ₹25</span>
                                </div>
                                <span className="text-[8px] font-bold text-slate-500 tracking-widest relative z-10">DIRECT TO WHATSAPP</span>
                                {isSharing && (
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    </div>
                                )}
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={async () => {
                                    setIsSharing(true);
                                    try {
                                        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
                                        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                                        const imageUrl = `/shares/consolidated-${dateStr}.png`;
                                        const headCheck = await fetch(imageUrl, { method: 'HEAD' });
                                        if (!headCheck.ok) { alert("AI Board Syncing... Try in 5s."); setIsSharing(false); return; }

                                        if (navigator.share) {
                                            const response = await fetch(imageUrl);
                                            const blob = await response.blob();
                                            const file = new File([blob], `teer-club-board.png`, { type: blob.type });
                                            await navigator.share({ files: [file] });
                                        } else {
                                            const link = document.createElement('a');
                                            link.href = imageUrl;
                                            link.download = `teer-club-board.png`;
                                            link.click();
                                        }
                                    } catch (err) { console.error(err); } finally { setIsSharing(false); }
                                }}
                                className="w-full py-4 border border-white/20 text-white font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 group transition-colors hover:bg-white/5 active:scale-95"
                            >
                                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 group-hover:rotate-12 transition-transform" />
                                <span>Realistic AI Board</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
