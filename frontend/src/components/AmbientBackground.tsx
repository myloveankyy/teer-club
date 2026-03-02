'use client';

import { motion } from 'framer-motion';

export function AmbientBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F5F7FA]">
            {/* Base Blur Layer */}
            <div className="absolute inset-0 backdrop-blur-[100px] z-10" />

            {/* Animated Gradient Orbs */}
            <motion.div
                animate={{
                    translate: [0, 30, -20, 0],
                    y: [0, -50, 20, 0],
                    scale: [1, 1.1, 0.9, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"
            />
            <motion.div
                animate={{
                    translate: [0, -20, 40, 0],
                    y: [0, 30, -40, 0],
                    scale: [1, 1.2, 0.8, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"
            />
            <motion.div
                animate={{
                    translate: [0, 40, -30, 0],
                    y: [0, -20, 50, 0],
                    scale: [1, 1.1, 0.9, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4
                }}
                className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-pink-300/30 rounded-full mix-blend-multiply filter blur-[80px] opacity-70"
            />

            {/* Subtle Cultural Motif Overlay */}
            <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden opacity-[0.02] mix-blend-overlay">
                <svg className="absolute w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 600C240 600 480 400 720 400C960 400 1200 600 1440 600V800H0V600Z" fill="currentColor" />
                    <path d="M0 500C240 500 480 300 720 300C960 300 1200 500 1440 500V800H0V500Z" fill="currentColor" />
                    <path d="M0 700C240 700 480 600 720 600C960 600 1200 700 1440 700V800H0V700Z" fill="currentColor" />
                </svg>
            </div>
        </div>
    );
}
