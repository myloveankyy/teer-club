"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Share2, Download, Check, X, Trophy, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { slideUpModalVariants, tapRipple } from "@/lib/motion";

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
    isAlmostWon?: boolean; // If they were 1 digit off
}

export function VictoryCardModal({ isOpen, onClose, prediction, userName, isAlmostWon = false }: VictoryCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [shared, setShared] = useState(false);

    const handleShare = async () => {
        if (!cardRef.current) return;
        setIsSharing(true);
        try {
            // Give a tiny delay to ensure rendering is perfect before capture
            await new Promise(res => setTimeout(res, 100));

            const dataUrl = await toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 3, // High-res for Instagram/WhatsApp
                cacheBust: true,
            });

            // If Web Share API is available (Mobile)
            if (navigator.share) {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], "teer-victory.png", { type: blob.type });
                await navigator.share({
                    title: isAlmostWon ? 'Almost got it!' : 'Boom! Target Hit 🎯',
                    text: isAlmostWon ? `So close! Just 1 digit off on Teer Club today.` : `Nailed it! Hit the exact target on Teer Club today. 🔥`,
                    files: [file],
                });
            } else {
                // Fallback for desktop: Download
                const link = document.createElement('a');
                link.download = `teer-${isAlmostWon ? 'almost' : 'victory'}-${prediction.number}.png`;
                link.href = dataUrl;
                link.click();
            }
            setShared(true);
            setTimeout(() => setShared(false), 3000);
        } catch (err) {
            console.error("Failed to share image", err);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        variants={slideUpModalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-sm flex flex-col items-center gap-6"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* --- THE SHAREABLE DOM ELEMENT --- */}
                        {/* We render this cleanly without any standard interactive UI so it looks like a poster */}
                        <div
                            ref={cardRef}
                            className="w-full relative overflow-hidden rounded-[32px] shadow-2xl bg-white"
                            // A standard Instagram Story is 9:16, but 4:5 is better for feed/whatsapp.
                            style={{ aspectRatio: '4/5' }}
                        >
                            {/* Background Pattern / Gradient */}
                            <div className={cn(
                                "absolute inset-0 opacity-90 transition-colors duration-1000",
                                isAlmostWon
                                    ? "bg-gradient-to-br from-amber-500 via-orange-400 to-rose-500" // Almost won colors
                                    : "bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600" // Victory colors
                            )} />

                            {/* Overlay glow */}
                            <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none mix-blend-overlay" />

                            <div className="relative h-full flex flex-col p-8 z-10 text-white justify-between">
                                {/* Header */}
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full w-fit border border-white/20 shadow-inner">
                                            <MapPin className="w-3.5 h-3.5 text-white" />
                                            <span className="text-[10px] font-bold tracking-widest uppercase shadow-sm">
                                                {prediction.gameType}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                                        <Trophy className="w-5 h-5 text-yellow-300 drop-shadow-md" />
                                    </div>
                                </div>

                                {/* Body / Big Number */}
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <span className="text-sm font-bold tracking-[0.2em] text-white/80 uppercase mb-2">
                                        {isAlmostWon ? 'SO CLOSE!' : 'TARGET HIT 🎯'}
                                    </span>

                                    <div className="relative">
                                        {/* Glow behind number */}
                                        <div className="absolute inset-0 bg-white opacity-20 blur-2xl rounded-full" />
                                        <h1 className="text-[8rem] leading-none font-black tracking-tighter drop-shadow-2xl relative z-10 flex">
                                            {prediction.number}
                                        </h1>
                                    </div>

                                    {isAlmostWon && (
                                        <span className="mt-4 px-4 py-1.5 bg-black/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10 shadow-inner">
                                            Just 1 digit away 👀
                                        </span>
                                    )}
                                </div>

                                {/* Footer Data */}
                                <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-white/60 font-bold tracking-widest uppercase mb-0.5">Predictor</p>
                                        <p className="font-bold text-sm tracking-wide">{userName}</p>
                                    </div>
                                    {!isAlmostWon && (
                                        <div className="text-right">
                                            <p className="text-[10px] text-white/60 font-bold tracking-widest uppercase mb-0.5">Won</p>
                                            <p className="font-black text-lg tracking-tight text-green-300 drop-shadow-md">₹{prediction.winAmount}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Brand Tag at bottom */}
                                <div className="mt-6 flex justify-center items-center gap-1 opacity-60">
                                    <span className="text-[10px] font-medium tracking-widest uppercase">Played on Teer.Club</span>
                                </div>
                            </div>
                        </div>
                        {/* --- END OF SHAREABLE DOM --- */}

                        {/* Interactive UI Actions (These don't get screenshotted) */}
                        <div className="flex gap-4 w-full px-4">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleShare}
                                disabled={isSharing}
                                className={cn(
                                    "flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-white shadow-xl transition-all",
                                    shared ? "bg-green-500" : isAlmostWon ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"
                                )}
                            >
                                {isSharing ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : shared ? (
                                    <>
                                        <Check className="w-5 h-5" /> Shared!
                                    </>
                                ) : (
                                    <>
                                        {typeof navigator !== 'undefined' && 'share' in navigator ? <Share2 className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                                        {typeof navigator !== 'undefined' && 'share' in navigator ? "Share Flex" : "Download Poster"}
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
