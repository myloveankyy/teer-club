"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
// No library icon imports to prevent Turbopack bundle issues.


interface LiveActionWidgetProps {
    image?: string;
    title?: string;
    subtitle?: string;
    badgeText?: string;
    buttonText?: string;
    showLiveIcon?: boolean;
    isUppercase?: boolean;
    initialSettings?: any;
}

export function LiveActionWidget({
    image = "/images/shillong-ground.png",
    title = "SHILLONG GROUND PLAY",
    subtitle = "Official Partner Link for Secure & Instant Teer Transactions",
    badgeText = "LIVE NOW",
    buttonText,
    showLiveIcon = true,
    isUppercase = true,
    initialSettings
}: LiveActionWidgetProps) {
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
                    console.error("Failed to fetch settings for LiveActionWidget:", err);
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
        <div className="group relative mx-auto lg:mx-0 w-full lg:max-w-xl bg-white border border-gray-200 overflow-hidden transition-all duration-300 hover:border-gray-900 min-h-[320px] flex flex-col shadow-sm">
            {/* Top Bar - Terminal Style */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-none bg-rose-600 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900">{badgeText}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-medium uppercase tracking-widest text-gray-400">Market /</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Verified</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-1">
                {/* Visual Area */}
                <div className="relative w-full sm:w-2/5 md:w-2/5 min-h-[180px] bg-gray-100 overflow-hidden border-b sm:border-b-0 sm:border-r border-gray-100">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700 opacity-90"
                        priority
                    />
                    <div className="absolute inset-0 bg-gray-900/5 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                    <h3 className={`mb-3 text-2xl font-bold text-gray-900 tracking-tight leading-tight ${isUppercase ? 'uppercase' : ''}`}>
                        {title}
                    </h3>
                    <p className={`mb-8 text-xs font-medium text-gray-500 leading-relaxed max-w-[240px] ${isUppercase ? 'uppercase' : ''}`}>
                        {subtitle}
                    </p>

                    <Link
                        href={playUrl}
                        target={isEnabled ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={`group/btn relative inline-flex items-center justify-center gap-4 px-8 py-4 text-[11px] font-black tracking-[0.25em] transition-all bg-gray-900 text-white hover:bg-rose-600 rounded-none w-fit ${isUppercase ? 'uppercase' : ''}`}
                        onClick={(e) => !isEnabled && e.preventDefault()}
                    >
                        {finalButtonText}
                        {buttonText?.toLowerCase().includes("share") ? (
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        )}
                    </Link>
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-1 w-0 bg-gray-900 transition-all duration-500 group-hover:w-full" />
        </div>
    );
}
