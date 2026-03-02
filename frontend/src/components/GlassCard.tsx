'use client'; // Required for Framer Motion

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    variant?: 'default' | 'frosted' | 'prism' | 'neon';
}

export function GlassCard({ children, className, variant = 'default', ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
                'relative overflow-hidden transition-all duration-300',
                variant === 'default' && 'glass border-white/40 shadow-lg hover:shadow-xl bg-white/30',
                variant === 'frosted' && 'glass-card text-slate-800',
                variant === 'prism' && 'glass-prism hover:scale-[1.02] active:scale-[0.98]',
                variant === 'neon' && 'glass border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]',
                className
            )}
            {...props}
        >
            {/* Iridescent shine effect for prism variant */}
            {variant === 'prism' && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            )}

            {children}
        </motion.div>
    );
}
