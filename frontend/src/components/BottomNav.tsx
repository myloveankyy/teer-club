"use client";

import { useState, useEffect } from 'react';
import { CORE_NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Feather } from 'lucide-react';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import api from '@/lib/api';

const bgColors: Record<string, string> = {
    'text-rose-500': 'bg-rose-500/15',
    'text-orange-500': 'bg-orange-500/15',
    'text-purple-500': 'bg-purple-500/15',
    'text-violet-500': 'bg-violet-500/15',
    'text-blue-500': 'bg-blue-500/15',
    'text-emerald-500': 'bg-emerald-500/15',
    'text-cyan-500': 'bg-cyan-500/15',
};

export function BottomNav() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Initial silent auth check (to hide/show items that depend on auth in the nav)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data.success) {
                    setUser(res.data.user);
                }
            } catch (err) {
                // Ignore, means user isn't logged in
            }
        };
        checkAuth();
    }, []);

    const handlePostClick = () => {
        window.dispatchEvent(new CustomEvent('open-post-modal'));
    };

    // Filter items based on auth requirement
    const visibleItems = CORE_NAV_ITEMS.filter((item) => {
        if (item.requiresAuth && !user) return false;
        return true;
    });

    // Hide global navigation in specific immersive pages (Group Chats, Wallet, Predictions)
    const isImmersivePage = (pathname?.startsWith('/groups/') && pathname !== '/groups') ||
        pathname === '/user/wallet' ||
        pathname === '/predictions' ||
        pathname === '/dreams' ||
        pathname === '/profile' ||
        pathname === '/notifications' ||
        pathname === '/referral' ||
        pathname === '/winners' ||
        pathname?.startsWith('/blog');
    if (isImmersivePage) return null;

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 xl:hidden pointer-events-none flex justify-center">
                <div className="max-w-[400px] w-full pointer-events-auto flex items-center justify-between gap-1 p-1.5 rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                    {visibleItems.map((item, index) => {
                        const isActive = item.path === '/'
                            ? pathname === '/'
                            : pathname?.startsWith(item.path);

                        const activeBgClass = bgColors[item.color] || 'bg-slate-100';

                        return (
                            <div key={item.name} className="flex-1 flex items-center justify-center">
                                {index === 2 && (
                                    <button
                                        onClick={handlePostClick}
                                        className="relative -top-3 w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-[0_12px_24px_rgba(0,0,0,0.12)] active:scale-95 transition-all group overflow-hidden border border-slate-100"
                                        style={{ WebkitTapHighlightColor: "transparent" }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-white" />
                                        <div className="relative z-10">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-800 group-hover:scale-110 transition-transform">
                                                <path d="M12 5V19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </button>
                                )}
                                <Link
                                    href={item.path}
                                    className="relative flex items-center justify-center shrink-0 outline-none w-full h-full p-1"
                                    style={{ WebkitTapHighlightColor: "transparent" }}
                                >
                                    <motion.div
                                        layout
                                        initial={false}
                                        animate={{
                                            width: isActive ? "auto" : "46px",
                                            paddingLeft: isActive ? "12px" : "0px",
                                            paddingRight: isActive ? "16px" : "0px",
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 35,
                                            mass: 1
                                        }}
                                        className={cn(
                                            "flex items-center justify-center h-[46px] rounded-full gap-2 transition-colors",
                                            isActive ? activeBgClass : "hover:bg-slate-50 active:bg-slate-100"
                                        )}
                                    >
                                        <motion.div layout className="relative z-10 shrink-0 flex items-center justify-center">
                                            <item.icon
                                                className={cn("transition-all duration-300", isActive ? `w-4.5 h-4.5 ${item.color}` : "w-5.5 h-5.5 text-slate-400")}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                        </motion.div>

                                        <AnimatePresence mode="popLayout">
                                            {isActive && (
                                                <motion.span
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                                    exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                                    className={cn(
                                                        "text-[12px] font-bold tracking-tight whitespace-nowrap block relative z-10",
                                                        item.color
                                                    )}
                                                >
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </Link>
                            </div>
                        );
                    })}

                    {/* Menu Trigger Button */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="relative flex items-center justify-center shrink-0 outline-none w-[46px] h-[46px] rounded-full hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        <Menu className="w-5.5 h-5.5 text-slate-400" strokeWidth={2} />
                    </button>
                </div>
            </div>

            <MobileMenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
}

export default BottomNav;
