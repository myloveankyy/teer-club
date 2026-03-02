'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ModernListingCardProps {
    title: string;
    subtitle: string;
    price?: string;
    rating?: string;
    imageColor?: string; // Fallback gradient color
    badge?: string;
    delay?: number;
}

export function ModernListingCard({
    title,
    subtitle,
    price,
    rating,
    imageColor = 'bg-gray-200',
    badge,
    delay = 0
}: ModernListingCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay }}
            className="group cursor-pointer flex flex-col gap-3 bg-white p-3 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
        >
            {/* Image Container - Highly Rounded */}
            <div className={cn(
                "aspect-square w-full rounded-2xl relative overflow-hidden",
                imageColor
            )}>
                {/* Guest Favorite Badge */}
                {badge && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm z-10">
                        <span className="text-xs font-bold text-black">{badge}</span>
                    </div>
                )}

                {/* Heart Icon */}
                <div className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="rgba(0,0,0,0.5)" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-0.5 px-1 pb-1">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-[15px] text-gray-900 leading-tight">{title}</h3>
                    {rating && (
                        <div className="flex items-center gap-1 text-[14px]">
                            <span>★</span>
                            <span>{rating}</span>
                        </div>
                    )}
                </div>
                <p className="text-[15px] text-gray-500 leading-tight">{subtitle}</p>
                {price && (
                    <p className="text-[15px] text-gray-900 mt-1">
                        <span className="font-semibold">{price}</span>
                    </p>
                )}
            </div>
        </motion.div>
    );
}
