'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface MagazineCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    variant?: 'featured' | 'standard' | 'minimal';
    badge?: string;
    badgeColor?: 'black' | 'red' | 'outline';
}

export function MagazineCard({
    children,
    className,
    variant = 'standard',
    badge,
    badgeColor = 'black',
    ...props
}: MagazineCardProps) {

    const badgeStyles = {
        black: "bg-black text-white",
        red: "bg-accent text-white",
        outline: "border border-black text-black bg-transparent"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Magazine easing
            className={cn(
                'relative overflow-hidden magazine-card p-6 md:p-8 flex flex-col',
                variant === 'featured' && 'bg-black text-white border-none', // Featured is dark
                variant === 'minimal' && 'border-none p-0 shadow-none hover:shadow-none hover:transform-none bg-transparent',
                className
            )}
            {...props}
        >
            {/* Decorative Top Line for Standard Cards */}
            {variant === 'standard' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            )}

            {badge && (
                <div className={cn(
                    "absolute top-6 right-6 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1",
                    badgeStyles[badgeColor]
                )}>
                    {badge}
                </div>
            )}

            {children}
        </motion.div>
    );
}
