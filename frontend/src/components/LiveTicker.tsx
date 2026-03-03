'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Target, Trophy, MapPin, Share2, Loader2, X, Download, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveTickerProps {
    round: 1 | 2;
    targetDate: string; // ISO date string
    result?: string | null;
    region?: 'shillong' | 'khanapara' | 'juwai';
}

export function LiveTicker({ round, targetDate, result, region = 'shillong', initialResult }: LiveTickerProps & { initialResult?: string }) {
    const [displayNumber, setDisplayNumber] = useState(initialResult || '--');
    const [previousResult, setPreviousResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isDrawClose, setIsDrawClose] = useState(false);
    const [isOffDay, setIsOffDay] = useState(false);

    // Teer Schedule (Approximate)
    const SCHEDULE = {
        shillong: { r1: '15:45', r2: '16:45' },
        khanapara: { r1: '16:00', r2: '16:30' },
        juwai: { r1: '13:45', r2: '14:45' }
    };

    useEffect(() => {
        const updateTimer = () => {
            // Force IST Time for accurate Teer Results
            const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const day = now.getDay();

            // Sunday Check
            if (day === 0) {
                setIsOffDay(true);
                setTimeLeft('Next: MON');
                return;
            }
            setIsOffDay(false);

            const timeStr = SCHEDULE[region][round === 1 ? 'r1' : 'r2'];
            const [hours, minutes] = timeStr.split(':').map(Number);

            const target = new Date(now.getTime());
            target.setHours(hours, minutes, 0, 0);

            const diff = target.getTime() - now.getTime();

            if (diff > 0) {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);

                // Special Live Suspense (30 mins before)
                if (diff < 30 * 60 * 1000) setIsDrawClose(true);
                else setIsDrawClose(false);
            } else {
                // It's past the time, if no result, show "PENDING" or "LIVE"
                if (displayNumber === '--') {
                    if (diff > -60 * 60 * 1000) { // 1 hour window
                        setTimeLeft('LIVE NOW');
                        setIsDrawClose(true);
                    } else {
                        setTimeLeft('Awaiting Data');
                        setIsDrawClose(false);
                    }
                } else {
                    setTimeLeft('DECLARED');
                    setIsDrawClose(false);
                }
            }

            // Phase 4: Heartbeat & Slot Machine Logic (Consolidated)
            const min = now.getMinutes();
            if (displayNumber === '--' && (min === 44 || min === 43 || min === 29 || min === 30)) {
                setCountdownPulse(true);
            } else {
                setCountdownPulse(false);
            }
        };

        const timerInterval = setInterval(updateTimer, 1000);
        updateTimer();

        const fetchData = async () => {
            try {
                // Fetch Latest
                const latestRes = await fetch('/api/results/latest');
                let latestData = null;
                try {
                    if (latestRes.ok) latestData = await latestRes.json();
                } catch (e) { }

                // Fetch History for Previous Result
                const historyRes = await fetch('/api/results/history');
                let historyData = null;
                try {
                    if (historyRes.ok) historyData = await historyRes.json();
                } catch (e) { }

                const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

                if (latestData && latestData[region]) {
                    const dataDate = latestData[region].date;
                    // Only show today's results if the date matches today
                    if (dataDate === todayStr) {
                        if (round === 1 && latestData[region].round1) {
                            setDisplayNumber(latestData[region].round1);
                        } else if (round === 2 && latestData[region].round2) {
                            setDisplayNumber(latestData[region].round2);
                        } else {
                            setDisplayNumber('--');
                        }
                    } else {
                        setDisplayNumber('--');
                    }
                }

                if (historyData && historyData.length > 0) {
                    const previousEntry = historyData.find((entry: any) => entry.date !== todayStr);

                    if (previousEntry && previousEntry[region]) {
                        if (round === 1) setPreviousResult(previousEntry[region].round1);
                        else if (round === 2) setPreviousResult(previousEntry[region].round2);
                    }
                }
                setIsLoading(false);

            } catch (error) {
                console.error("Failed to fetch results:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => {
            clearInterval(interval);
            clearInterval(timerInterval);
        };
    }, [round, region, displayNumber]);

    const isLive = displayNumber === '--';

    // Phase 4: Heartbeat & Slot Machine Logic
    const [countdownPulse, setCountdownPulse] = useState(false);
    const [rollingDigits, setRollingDigits] = useState(false);

    // Developer testing trigger for the slot-animation
    const handleMockDrop = () => {
        setRollingDigits(true);
        setTimeout(() => {
            setDisplayNumber(Math.floor(Math.random() * 90 + 10).toString());
            setRollingDigits(false);
        }, 1200); // 1.2s drama suspense
    };

    const getRegionStyles = () => {
        if (region === 'shillong') {
            return round === 1
                ? { gradient: "from-rose-600 to-orange-500", glow: "shadow-[0_4px_24px_rgba(244,63,94,0.06)] hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)]", bgIcon: "bg-rose-50 text-rose-600 shadow-[inset_0_1px_4px_rgba(244,63,94,0.1)]", backdrop: "from-rose-500 via-orange-300 to-transparent", text: "text-rose-600", dot: "bg-rose-500" }
                : { gradient: "from-cyan-600 to-blue-500", glow: "shadow-[0_4px_24px_rgba(6,182,212,0.06)] hover:shadow-[0_20px_40px_rgba(6,182,212,0.15)]", bgIcon: "bg-cyan-50 text-cyan-600 shadow-[inset_0_1px_4px_rgba(6,182,212,0.1)]", backdrop: "from-cyan-500 via-blue-300 to-transparent", text: "text-cyan-600", dot: "bg-cyan-500" };
        }
        if (region === 'khanapara') {
            return round === 1
                ? { gradient: "from-emerald-600 to-teal-500", glow: "shadow-[0_4px_24px_rgba(16,185,129,0.06)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)]", bgIcon: "bg-emerald-50 text-emerald-600 shadow-[inset_0_1px_4px_rgba(16,185,129,0.1)]", backdrop: "from-emerald-500 via-teal-300 to-transparent", text: "text-emerald-600", dot: "bg-emerald-500" }
                : { gradient: "from-amber-600 to-yellow-500", glow: "shadow-[0_4px_24px_rgba(245,158,11,0.06)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)]", bgIcon: "bg-amber-50 text-amber-600 shadow-[inset_0_1px_4px_rgba(245,158,11,0.1)]", backdrop: "from-amber-500 via-yellow-300 to-transparent", text: "text-amber-600", dot: "bg-amber-500" };
        }
        if (region === 'juwai') {
            return round === 1
                ? { gradient: "from-purple-600 to-fuchsia-500", glow: "shadow-[0_4px_24px_rgba(147,51,234,0.06)] hover:shadow-[0_20px_40px_rgba(147,51,234,0.15)]", bgIcon: "bg-purple-50 text-purple-600 shadow-[inset_0_1px_4px_rgba(147,51,234,0.1)]", backdrop: "from-purple-500 via-fuchsia-300 to-transparent", text: "text-purple-600", dot: "bg-purple-500" }
                : { gradient: "from-indigo-600 to-violet-500", glow: "shadow-[0_4px_24px_rgba(79,70,229,0.06)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.15)]", bgIcon: "bg-indigo-50 text-indigo-600 shadow-[inset_0_1px_4px_rgba(79,70,229,0.1)]", backdrop: "from-indigo-500 via-violet-300 to-transparent", text: "text-indigo-600", dot: "bg-indigo-500" };
        }
        return { gradient: "from-slate-600 to-slate-400", glow: "", bgIcon: "", backdrop: "from-slate-500 to-transparent", text: "text-slate-600", dot: "bg-slate-500" };
    };

    const [isGeneratingShare, setIsGeneratingShare] = useState(false);
    const [shareImage, setShareImage] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);

    const handleShareResult = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (displayNumber === '--') return;

        setIsGeneratingShare(true);
        setShowShareModal(true);

        try {
            const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
            const response = await fetch('/api/image/generate-share-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ region, round, result: displayNumber, date: todayStr })
            });

            const data = await response.json();
            if (data.success && data.imageBase64) {
                // Determine full URL path
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
                setShareImage(`${baseUrl}${data.imageBase64}`);
            } else {
                console.error("[Share] Image generation failed:", data.error);
                setShareImage(null); // Shows "Failed to generate" state
            }
        } catch (error) {
            console.error("Failed to generate AI share card:", error);
            setShareImage(null);
        } finally {
            setIsGeneratingShare(false);
        }
    };

    const handleNativeShare = async () => {
        if (!shareImage) return;
        try {
            const fetchResponse = await fetch(shareImage);
            const blob = await fetchResponse.blob();
            const file = new File([blob], `teerclub-${region}-r${round}.png`, { type: blob.type });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Teer Club - ${region.toUpperCase()} R${round}`,
                    text: `Check out today's ${region} Teer results!`,
                    files: [file],
                });
            } else {
                alert("Your browser doesn't support direct image sharing. Please use the Download button.");
            }
        } catch (err) {
            console.error("Error sharing:", err);
        }
    };

    const styles = getRegionStyles();

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={isLive ? handleMockDrop : undefined}
                aria-label={`${region} ${round === 1 ? 'First' : 'Second'} Round Teer Result`}
                className={cn(
                    "relative w-full rounded-[32px] overflow-hidden group select-none transition-all duration-700 cursor-pointer shadow-2xl min-h-[310px]",
                    isLive ? "ring-2 ring-white/20" : "",
                    countdownPulse ? "ring-4 ring-rose-500/50" : ""
                )}>

                {/* Dynamic Official Asset */}
                <div className="absolute inset-0 z-0 text-transparent">
                    <motion.div
                        className="w-full h-full relative"
                        style={{ willChange: 'transform' }}
                        initial={{ scale: 1.1 }}
                        animate={{
                            scale: [1.1, 1.15, 1.1],
                            x: [0, 5, -5, 0],
                            y: [0, -5, 5, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <Image
                            src={region === 'shillong' ? '/shillong-bg.png' : region === 'khanapara' ? '/khanapara-bg.png' : '/juwai-bg.png'}
                            alt={`${region} background`}
                            fill
                            className={cn(
                                "object-cover",
                                (region === 'shillong' && isLive) ? "" : "brightness-[0.75] saturate-[1.2]"
                            )}
                            priority={true}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </motion.div>

                    {/* Region-specific Overlays */}
                    <div className={cn(
                        "absolute inset-0 transition-opacity duration-1000",
                        isLive
                            ? (region === 'shillong' ? "bg-black/10" : region === 'khanapara' ? "bg-emerald-950/40" : "bg-purple-950/40")
                            : "bg-black/60"
                    )} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                </div>

                {/* Content Container - Compact Refresh */}
                <div className="relative h-full flex flex-col p-6 z-10 w-full">

                    {/* Top Bar */}
                    <div className="flex justify-between items-start mb-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white leading-none">
                                {round === 1 ? <Target className="w-4.5 h-4.5" /> : <Trophy className="w-4.5 h-4.5" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 leading-none mb-1">
                                    {round === 1 ? 'First' : 'Second'} Round
                                </span>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-white/80" />
                                    <span className="text-sm font-black text-white tracking-tight">
                                        {region.charAt(0).toUpperCase() + region.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {isLive ? (
                            <motion.div
                                animate={isDrawClose ? { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl transition-colors duration-500",
                                    isDrawClose
                                        ? "bg-rose-600/30 border-rose-500/50"
                                        : "bg-indigo-600/20 border-indigo-500/30"
                                )}
                            >
                                <div className={cn(
                                    "w-2 h-2 rounded-full animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.4)]",
                                    isDrawClose ? "bg-rose-500" : "bg-indigo-400"
                                )} />
                                <span className="text-[9px] font-black text-white tracking-[0.2em]">
                                    {isOffDay ? 'HOLIDAY' : (isDrawClose ? 'LIVE DRAW' : 'UPCOMING')}
                                </span>
                            </motion.div>
                        ) : (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleShareResult}
                                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white transition-all shadow-lg"
                            >
                                <Share2 className="w-4.5 h-4.5" />
                            </motion.button>
                        )}
                    </div>

                    {/* Hero Number / Timer */}
                    <div className="flex-1 flex flex-col items-center justify-center relative py-2">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={displayNumber + rollingDigits.toString() + (displayNumber === '--' ? 'timer' : 'result')}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            >
                                {displayNumber === '--' && !rollingDigits ? (
                                    <div className="flex flex-col items-center">
                                        <h2 className={cn(
                                            "text-4xl md:text-5xl font-black text-white tracking-tighter mb-2",
                                            isOffDay ? "text-slate-400" : (isDrawClose ? "text-rose-400" : "text-white")
                                        )}>
                                            {timeLeft}
                                        </h2>
                                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.4em]">
                                            {isOffDay ? 'Weekly Holiday' : 'Counting Down'}
                                        </span>
                                    </div>
                                ) : (
                                    <h1 className={cn(
                                        "text-[5.5rem] sm:text-[6.5rem] md:text-[7.5rem] leading-none font-black tracking-[-0.05em] text-white transition-all duration-700",
                                        rollingDigits ? "blur-md scale-95 opacity-50" : "scale-100 placeholder:opacity-0"
                                    )}>
                                        {rollingDigits ? "88" : displayNumber}
                                    </h1>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex flex-col items-center gap-1 mt-1">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.6em] ml-1">
                                {isLive ? (isOffDay ? 'MARKET CLOSED' : (isDrawClose ? 'WAITING FOR RESULT' : 'UPCOMING RESULT')) : 'Official Result'}
                            </span>
                        </div>
                    </div>

                    {/* Footer Metadata - Industrial Grade Spacing */}
                    <div className="mt-auto flex items-end justify-between border-t border-white/10 pt-5 pb-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1.5">Yesterday</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[11px] font-black text-white/40">RESULT.</span>
                                <span className="text-3xl font-black text-white tracking-tighter">
                                    {previousResult || '--'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">Status</span>
                            <span className="text-[11px] font-black text-white bg-white/20 px-5 py-1.5 rounded-full border border-white/30 backdrop-blur-md">
                                VERIFIED
                            </span>
                        </div>
                    </div>

                </div>
            </motion.div>

            {/* AI Share Card Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowShareModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-2xl z-20 border border-white/20"
                        >
                            {/* Modal Header */}
                            <div className="absolute top-6 right-6 z-30">
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-all shadow-lg active:scale-95"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Image Canvas View */}
                            <div className="aspect-square relative flex items-center justify-center bg-slate-50">
                                {isGeneratingShare ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <Loader2 className="w-12 h-12 text-slate-200 animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Processing Global Archive</span>
                                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">Generating AI Share Card...</span>
                                        </div>
                                    </div>
                                ) : shareImage ? (
                                    <motion.img
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        src={shareImage}
                                        alt="AI Result Share Card"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center p-8">
                                        <p className="text-slate-400 text-sm">Failed to generate image. Please try again.</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer (CTAs) */}
                            <div className="p-8 bg-white flex flex-col items-center">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Official AI Share Card</h3>
                                <p className="text-[11px] text-slate-400 font-medium tracking-wide uppercase mb-6 text-center">Ready to showcase your local victory.<br /><span className="text-indigo-500 font-bold">Refer & Earn integrated.</span></p>

                                <div className="w-full flex gap-3">
                                    {shareImage && (
                                        <>
                                            <button
                                                onClick={handleNativeShare}
                                                className="flex-1 h-14 bg-indigo-600 text-white rounded-[20px] flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
                                            >
                                                <Upload className="w-4 h-4" /> Share
                                            </button>
                                            <a
                                                href={shareImage}
                                                download={`teer-club-${region}-${new Date().toLocaleDateString()}.png`}
                                                className="flex-1 h-14 bg-slate-900 text-white rounded-[20px] flex items-center justify-center gap-2 text-[13px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
                                            >
                                                <Download className="w-4 h-4" /> Save
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
