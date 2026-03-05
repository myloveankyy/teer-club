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
            const dataUrl = await toPng(cardRef.current, {
                quality: 0.95,
                pixelRatio: 2, // Industry standard balance for speed and quality
                cacheBust: true,
                style: { borderRadius: '0px' }
            });

            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], `teer-club-${region}-${round}.png`, { type: blob.type });
                await navigator.share({
                    title: `Official ${region.toUpperCase()} Result`,
                    text: `Teer Club: ${region} R${round} is ${result}! https://teer.club`,
                    files: [file],
                });
            } else {
                window.open(`https://wa.me/?text=${encodeURIComponent(`Official ${region.toUpperCase()} Teer Result: ${result}. Check at https://teer.club`)}`, '_blank');
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
                        className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl"
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
                            className="absolute top-6 right-6 w-10 h-10 bg-white/5 text-white flex items-center justify-center border border-white/10 z-50 md:-top-16 md:right-0"
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
                                className="absolute inset-0 bg-cover bg-center saturate-[0.8] brightness-[0.4]"
                                style={{ backgroundImage: `url('${getBgImage()}')` }}
                            />

                            {/* Minimalist Tech Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                            <div className="relative h-full flex flex-col p-6 md:p-10 z-10 justify-between">
                                {/* Top Technical Bar */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[8px] font-black tracking-[0.4em] text-indigo-400 uppercase">VERIFIED LOG 2.2</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-0.5 h-6 bg-indigo-500" />
                                                <h4 className="font-black text-white tracking-widest text-lg uppercase leading-none">{region}</h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 text-white/30">
                                        <div className="bg-white/5 border border-white/10 px-3 py-1 text-white font-black text-[9px] tracking-widest uppercase">
                                            R{round === 1 ? '01' : '02'}
                                        </div>
                                        <span className="text-[9px] font-black lowercase tracking-widest">{date}</span>
                                    </div>
                                </div>

                                {/* Center Stage (Sexy Minimalism) */}
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-black tracking-[0.5em] text-white/20 uppercase mb-2">Hit Number</span>
                                    <h1 className="text-[10rem] md:text-[12rem] leading-none font-black tracking-[-0.08em] text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.1)]">
                                        {result}
                                    </h1>
                                </div>

                                {/* Bottom Industrial Branding */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end border-t border-white/10 pt-6">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[18px] font-black text-white tracking-widest uppercase italic">Teer<span className="text-indigo-500">.Club</span></p>
                                            <p className="text-[8px] text-white/30 font-medium tracking-[0.3em] uppercase">Premium Analytics</p>
                                        </div>
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">SECURE-PROTOCOL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Integrated Action Bar (Optimized) */}
                        <div className="w-[90%] md:w-full flex flex-col gap-3 pb-8 md:pb-0">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleShare}
                                disabled={isSharing}
                                className="w-full py-4 bg-white text-black font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-xl"
                            >
                                <Share2 className="w-4 h-4" />
                                {isSharing ? "Processing..." : "Share to WhatsApp"}
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
                                className="w-full py-4 border border-white/20 text-white font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3"
                            >
                                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span>Realistic AI Board</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
