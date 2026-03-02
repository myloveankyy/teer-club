'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, X, ChevronRight, User as UserIcon, Feather } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CORE_NAV_ITEMS, MENU_ITEMS } from '@/lib/constants';
import { useSettings } from '@/hooks/useSettings';

const ALL_NAV_ITEMS = [...CORE_NAV_ITEMS, ...MENU_ITEMS];

export function Header() {
    const { settings } = useSettings();
    const pathname = usePathname();
    const { scrollY } = useScroll();

    // Dynamic Header Scroll Animation
    const headerY = useTransform(scrollY, [0, 50], [0, -10]);
    const headerScale = useTransform(scrollY, [0, 50], [1, 0.98]);
    const headerPadding = useTransform(scrollY, [0, 50], ["16px", "8px"]);
    const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.95]);

    const [isScrolled, setIsScrolled] = useState(false);

    const handlePostClick = () => {
        window.dispatchEvent(new CustomEvent('open-post-modal'));
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Helper to determine active state
    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname?.startsWith(path);
    };

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
        <motion.header
            style={{
                y: headerY,
                scale: headerScale,
                paddingTop: headerPadding,
                opacity: headerOpacity
            }}
            className="sticky top-0 left-0 right-0 z-50 px-4 pb-2 md:px-6 transition-none"
        >
            <div className={cn(
                "mx-auto max-w-[1800px] h-14 md:h-18 flex items-center justify-between px-3 md:px-6 transition-all duration-300",
                "glass-panel rounded-full md:rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-2xl border border-white/60",
                isScrolled ? "bg-white/80" : "bg-white/60"
            )}>

                {/* Logo Area */}
                <Link href="/" className="flex items-center gap-3 shrink-0 group outline-none" style={{ WebkitTapHighlightColor: "transparent" }}>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl md:rounded-[14px] flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                        {settings?.site_logo ? (
                            <img src={settings.site_logo} alt={settings.site_name || "Logo"} className="w-full h-full object-cover" />
                        ) : (
                            <span>{settings?.site_name?.charAt(0) || "T"}</span>
                        )}
                    </div>
                    <span className="font-bold text-base md:text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {settings?.site_name || "Teer Club"}
                    </span>
                </Link>

                {/* Centered Navigation (Desktop) - iPad/Desktop Only */}
                <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-md">
                    {ALL_NAV_ITEMS.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                className="relative px-4 py-2 rounded-full text-[13px] font-bold transition-colors duration-300 group outline-none"
                            >
                                {active && (
                                    <motion.div
                                        layoutId="header-active-tab"
                                        className="absolute inset-0 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                    />
                                )}
                                <div className="relative z-10 flex items-center gap-1.5">
                                    <item.icon className={cn("w-4 h-4 transition-colors duration-300", active ? item.color : "text-slate-400 group-hover:text-slate-600")} strokeWidth={active ? 2.5 : 2} />
                                    <span className={cn("transition-colors duration-300", active ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700")}>{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    {/* Instagram-style Post Button (White/Glass Variant) */}
                    <button
                        onClick={handlePostClick}
                        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-[0_8px_16px_rgba(0,0,0,0.06)] active:scale-95 transition-all group overflow-hidden"
                        style={{ WebkitTapHighlightColor: "transparent" }}
                        title="Create New Post"
                    >
                        {/* Refined Glass Highlight */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-white opacity-40 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5.5 h-5.5 text-slate-800 stroke-2 group-hover:scale-110 transition-transform duration-300"
                            >
                                <path d="M12 5V19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* Hover Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>

                    {/* Notification Bell */}
                    <Link href="/notifications" className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 transition-colors active:scale-95 relative group">
                        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="absolute top-2 right-2.5 md:top-2.5 md:right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    </Link>

                    {/* Profile / Avatar */}
                    <Link href="/profile" className="hidden sm:flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md hover:border-slate-300 transition-all active:scale-95 group">
                        <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <UserIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-700">Profile</span>
                    </Link>

                    {/* Mobile Profile Icon */}
                    <Link href="/profile" className="sm:hidden w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform overflow-hidden font-bold">
                        U
                    </Link>
                </div>
            </div>
        </motion.header>
    );
}

export default Header;
