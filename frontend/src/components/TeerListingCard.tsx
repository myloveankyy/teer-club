'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TeerListingCardProps {
    title: string;
    subtitle: string;
    price?: string;
    rating?: string;
    imageSrc?: string; // Path to background image
    badge?: string;
    delay?: number;
}

export function TeerListingCard({
    title,
    subtitle,
    price,
    rating,
    imageSrc,
    badge,
    delay = 0
}: TeerListingCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay, ease: [0.32, 0.72, 0, 1] }}
            className="group relative w-full aspect-[3/4] rounded-[32px] overflow-hidden cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:-translate-y-1.5 transition-all duration-500 border border-slate-100"
        >
            {/* Background Image with Zoom Effect */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                style={{ backgroundImage: `url(${imageSrc || '/placeholder-teer.jpg'})` }}
            />

            {/* Light/Dark Overlay gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                {badge && (
                    <div className="glass-panel text-black px-3 py-1.5 rounded-full">
                        <span className="text-xs font-bold tracking-wide">{badge}</span>
                    </div>
                )}
                <div className="glass-panel text-black p-2 rounded-full hover:bg-white/90 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                </div>
            </div>

            {/* Glass Content Pane (iOS Style) - Light Theme */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/85 p-4 rounded-[24px] backdrop-blur-2xl border border-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] group-hover:bg-white/95 transition-colors duration-300">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{title}</h3>
                        {rating && (
                            <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                                <span>★</span>
                                <span>{rating}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 leading-tight line-clamp-2 font-medium">{subtitle}</p>
                    {price && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60">
                            <p className="text-[13px] text-indigo-600 font-bold uppercase tracking-wider">{price}</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
