"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Video, Share2 } from "lucide-react";

interface PlayLiveWidgetProps {
    image?: string;
    title?: string;
    subtitle?: string;
    badgeText?: string;
    buttonText?: string;
    showVideoIcon?: boolean;
    isUppercase?: boolean;
    initialSettings?: any;
}

export function PlayLiveWidget({
    image = "/images/shillong-ground.png",
    title = "SHILLONG GROUND PLAY",
    subtitle = "Official Partner Link for Secure & Instant Teer Transactions",
    badgeText = "LIVE NOW",
    buttonText,
    showVideoIcon = true,
    isUppercase = true,
    initialSettings
}: PlayLiveWidgetProps) {
    const [settings, setSettings] = useState<any>(initialSettings || null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!initialSettings) {
            async function fetchSettings() {
                try {
                    const res = await api.settings.get();
                    if (res.data.success) {
                        setSettings(res.data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch settings for PlayLiveWidget:", err);
                }
            }
            fetchSettings();
        }
    }, [initialSettings]);

    if (!mounted) return <div className="aspect-[21/9] w-full max-w-xl rounded-[2.5rem] bg-gray-100 animate-pulse" />;

    const isEnabled = settings?.playLiveEnabled && settings?.playLiveUrl;
    const playUrl = isEnabled ? settings.playLiveUrl : "#";

    const finalButtonText = buttonText || (isEnabled ? "Enter Counter Now" : "Watch Live");

    const isShareBtn = buttonText?.toLowerCase().includes("share");
    const buttonStyles = isShareBtn
        ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/20 hover:bg-blue-700"
        : isEnabled
            ? "bg-white text-gray-900 shadow-2xl shadow-white/10 hover:bg-blue-600 hover:text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white";

    return (
        <div className="group relative mx-auto md:mx-0 w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-2 shadow-2xl shadow-blue-900/10 transition-all duration-700 hover:shadow-blue-900/20 hover:-translate-y-1 min-h-[300px] flex flex-col">
            <div className="relative flex-1 aspect-[21/9] min-h-[280px] overflow-hidden rounded-[2rem] bg-gray-900">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
                    priority
                />

                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center sm:items-start sm:text-left">
                    <div className="mb-3 flex items-center gap-2 rounded-full bg-rose-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-rose-600/30">
                        {showVideoIcon && <Video size={12} className="fill-current text-white animate-pulse" />}
                        {badgeText}
                    </div>

                    <h3 className={`mb-2 text-2xl font-black text-white tracking-tighter sm:text-4xl leading-none ${isUppercase ? 'uppercase' : ''}`}>
                        {title}
                    </h3>
                    <p className={`mb-6 text-[10px] font-bold text-gray-300 tracking-[0.15em] max-w-xs leading-relaxed ${isUppercase ? 'uppercase' : ''}`}>
                        {subtitle}
                    </p>

                    <Link
                        href={playUrl}
                        target={isEnabled ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={`group/btn relative inline-flex items-center gap-3 overflow-hidden rounded-2xl px-10 py-4 text-[10px] font-black tracking-widest transition-all ${buttonStyles} ${isUppercase ? 'uppercase' : ''}`}
                        onClick={(e) => !isEnabled && e.preventDefault()}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {finalButtonText}
                            {buttonText?.toLowerCase().includes("share") ? (
                                <Share2 size={14} className="transition-transform group-hover/btn:scale-110" />
                            ) : (
                                <svg className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            )}
                        </span>
                    </Link>
                </div>

                <div className="absolute top-6 right-8 hidden sm:flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Market Node</span>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Active terminal</span>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
    );
}
