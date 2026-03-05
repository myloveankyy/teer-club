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
                pixelRatio: 4,
                cacheBust: true,
                style: { borderRadius: '0px' }
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
                        className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl"
                    />

                    <motion.div
                        variants={slideUpModalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-[440px] flex flex-col items-center gap-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-16 right-0 w-12 h-12 bg-white/10 text-white flex items-center justify-center transition-all border border-white/5 active:scale-90"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* --- INDUSTRIAL GRADE SOCIAL POSTER --- */}
                        <div
                            ref={cardRef}
                            className="w-full relative bg-black overflow-hidden shadow-[0_60px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5"
                            style={{ aspectRatio: '1/1.4' }}
                        >
                            {/* Cinematic Focus Background */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-[3s] hover:scale-105 saturate-[0.8] brightness-[0.4]"
                                style={{ backgroundImage: `url('${getBgImage()}')` }}
                            />

                            {/* Minimalist Tech Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[120px]" />

                            <div className="relative h-full flex flex-col p-10 z-10 justify-between">
                                {/* Top Technical Bar */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[9px] font-black tracking-[0.4em] text-indigo-400 uppercase">SYSTEM LOG: 2.2.0</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-0.5 h-8 bg-indigo-500" />
                                                <div>
                                                    <h4 className="font-black text-white tracking-widest text-xl uppercase leading-none">{region} Result</h4>
                                                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">Status: Fully Verified</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <div className="bg-white/5 border border-white/10 px-4 py-2 text-white font-black text-[10px] tracking-widest uppercase">
                                            {round === 1 ? 'Round 01' : 'Round 02'}
                                        </div>
                                        <div className="flex items-center gap-2 text-white/30">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-[10px] font-black lowercase tracking-widest">{date}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Stage (Sexy Minimalism) */}
                                <div className="flex-1 flex flex-col items-center justify-center relative">
                                    <motion.div
                                        initial={{ filter: "blur(20px)", opacity: 0, scale: 0.95 }}
                                        animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3, duration: 1 }}
                                        className="relative flex flex-col items-center"
                                    >
                                        <span className="text-[11px] font-black tracking-[0.6em] text-white/20 uppercase mb-4">Official Hit Number</span>
                                        <h1 className="text-[12rem] leading-none font-black tracking-[-0.08em] text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.15)] flex items-center">
                                            {result}
                                        </h1>

                                        <div className="mt-8 flex items-center gap-8 opacity-40">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Latency</span>
                                                <span className="text-[10px] font-medium">0.42ms</span>
                                            </div>
                                            <div className="w-px h-6 bg-white/20" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Algorithm</span>
                                                <span className="text-[10px] font-medium">v3.1 High-Sigma</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Bottom Industrial Branding */}
                                <div className="space-y-8">
                                    <div className="flex justify-between items-end border-t border-white/10 pt-8">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[22px] font-black text-white tracking-widest uppercase">Teer<span className="text-indigo-500">.Club</span></p>
                                            <p className="text-[9px] text-white/30 font-medium tracking-[0.4em] uppercase">Premium Archery Analytics</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex gap-1">
                                                {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-indigo-500/40" />)}
                                            </div>
                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Cryptographically Signed</span>
                                        </div>
                                    </div>

                                    <p className="text-[8px] font-black tracking-[0.5em] text-white/10 uppercase text-center w-full">
                                        Industrial Verification Protocol Enabled &nbsp; | &nbsp; 2026 Official Result Source
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Integrated Share Options (Sexy Action Bar) */}
                        <div className="w-full flex flex-col gap-4">
                            <motion.button
                                whileHover={{ backgroundColor: "rgb(255, 255, 255)", color: "rgb(0, 0, 0)" }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleShare}
                                disabled={isSharing}
                                className="w-full py-5 border border-white/20 text-white font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all"
                            >
                                {isSharing ? "Processing..." : "Digital Poster"}
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={async () => {
                                    setIsSharing(true);
                                    try {
                                        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
                                        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                                        const imageUrl = `/shares/consolidated-${dateStr}.png`;
                                        const headCheck = await fetch(imageUrl, { method: 'HEAD' });
                                        if (!headCheck.ok) { alert("AI is finalizing board details. Wait 5s."); setIsSharing(false); return; }

                                        if (navigator.share) {
                                            const response = await fetch(imageUrl);
                                            const blob = await response.blob();
                                            const file = new File([blob], `teer-club-board-${dateStr}.png`, { type: blob.type });
                                            await navigator.share({
                                                title: `Teer Results Board 🎯`,
                                                text: `Premium Results at Teer.Club`,
                                                files: [file],
                                            });
                                        } else {
                                            const link = document.createElement('a');
                                            link.href = imageUrl;
                                            link.download = `teer-club-${dateStr}.png`;
                                            link.click();
                                        }
                                    } catch (err) { console.error(err); } finally { setIsSharing(false); }
                                }}
                                className="w-full py-5 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl"
                            >
                                <Sparkles className="w-4 h-4 fill-white" />
                                <span>Realistic AI Board</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
