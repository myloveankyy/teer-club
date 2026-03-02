'use client';

import { motion } from 'framer-motion';

export function AmbientBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F5F7FA]">
            {/* Base Background - Lighter for readability */}
            <div className="absolute inset-0 bg-[#F5F7FA] z-10 opacity-70" />

            {/* Static CSS Gradient Orbs (No Framer Motion/CSS Blur computations) */}
            <div
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] opacity-50 z-10"
                style={{ background: 'radial-gradient(circle, rgba(165, 180, 252, 0.4) 0%, rgba(165, 180, 252, 0) 70%)' }}
            />
            <div
                className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] opacity-50 z-10"
                style={{ background: 'radial-gradient(circle, rgba(216, 180, 254, 0.4) 0%, rgba(216, 180, 254, 0) 70%)' }}
            />
            <div
                className="absolute bottom-[-10%] left-[10%] w-[60%] h-[60%] opacity-50 z-10"
                style={{ background: 'radial-gradient(circle, rgba(249, 168, 212, 0.4) 0%, rgba(249, 168, 212, 0) 70%)' }}
            />

            {/* Subtle Cultural Motif Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden opacity-[0.02] mix-blend-overlay">
                <svg className="absolute w-full h-full text-slate-400" preserveAspectRatio="none" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 600C240 600 480 400 720 400C960 400 1200 600 1440 600V800H0V600Z" fill="currentColor" />
                    <path d="M0 500C240 500 480 300 720 300C960 300 1200 500 1440 500V800H0V500Z" fill="currentColor" />
                    <path d="M0 700C240 700 480 600 720 600C960 600 1200 700 1440 700V800H0V700Z" fill="currentColor" />
                </svg>
            </div>
        </div>
    );
}
