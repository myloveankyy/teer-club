'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    LogIn,
    ChevronRight,
    LogOut,
    ShieldCheck,
    Zap,
    Settings,
    HelpCircle,
    User as UserIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MENU_ITEMS } from '@/lib/constants';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { staggerContainer, fadeUpItem } from '@/lib/motion';

interface MobileMenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            checkAuth();
        }
    }, [isOpen]);

    const checkAuth = async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data.success) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            onClose();
            router.push('/');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleNavigation = (path: string) => {
        onClose();
        router.push(path);
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Native-Style Backdrop - GPU Accelerated */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md md:hidden transform-gpu"
                        aria-hidden="true"
                    />

                    {/* Industry Grade Bottom Sheet - Compact & Non-Scrollable */}
                    <motion.div
                        initial={{ y: '100%', rotateX: '5deg' }}
                        animate={{ y: 0, rotateX: 0 }}
                        exit={{ y: '100%', rotateX: '5deg' }}
                        transition={{ type: "spring", stiffness: 300, damping: 35, mass: 0.8 }}
                        className="fixed bottom-0 left-0 right-0 z-[101] bg-[#F8FAFC] rounded-t-[32px] md:hidden shadow-[0_-8px_40px_rgba(0,0,0,0.12)] flex flex-col max-h-[90vh] overflow-hidden transform-gpu"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="menu-title"
                    >
                        {/* Compact Drag Handle Area - Glassmorphism Refresh */}
                        <div className="shrink-0 flex justify-center pt-3 pb-2 bg-white/40 backdrop-blur-3xl border-b border-white/40 relative">
                            <div className="w-12 h-1.5 bg-slate-200/60 rounded-full mb-1 shadow-inner" />

                            <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                <button
                                    onClick={onClose}
                                    aria-label="Close menu"
                                    className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-black active:scale-90 transition-all shadow-lg shadow-slate-200"
                                >
                                    <X className="w-5 h-5" strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        {/* Industry Grade Compact Feed - Overflow Restricted */}
                        <div className="flex-1 overflow-hidden p-5 md:p-6 space-y-6 flex flex-col justify-between pb-8">

                            <div className="space-y-6">
                                {/* Profile / Identity Section - Repurposed for Performance */}
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <div key="loading" className="h-[100px] rounded-[24px] bg-white animate-pulse border border-slate-100" />
                                    ) : user ? (
                                        <motion.div
                                            key="user"
                                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="bg-white rounded-[24px] p-4 text-slate-900 relative overflow-hidden shadow-lg shadow-slate-200/40 border border-slate-100 transform-gpu group"
                                        >
                                            {/* Light Mesh Gradient Hub */}
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full blur-[40px] -mr-24 -mt-24" />

                                            <div className="relative z-10 flex items-center justify-between">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 p-[2px] shadow-md shadow-indigo-500/10">
                                                        <div className="w-full h-full bg-white rounded-[12px] flex items-center justify-center text-base font-black italic text-indigo-600">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <p className="font-bold text-[15px] text-slate-900 truncate tracking-tight">@{user.username}</p>
                                                            <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                                                        </div>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-80 truncate">{user.email}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleNavigation('/profile')}
                                                    className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 active:scale-90 transition-all shadow-sm"
                                                >
                                                    <Settings className="w-4.5 h-4.5" />
                                                </button>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 relative z-10">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reputation</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-black text-slate-900 leading-none">Level {Math.floor(user.reputation / 10) + 1}</span>
                                                        <div className="px-1 py-0.5 rounded bg-indigo-50 text-[7px] font-bold text-indigo-600 border border-indigo-100">PRO</div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col border-l border-slate-100 pl-4">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account</span>
                                                    <span className="text-sm font-black flex items-center gap-1 text-slate-900 leading-none">
                                                        Resident Member
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="guest"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gradient-to-br from-indigo-600 to-purple-800 p-6 rounded-[28px] text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden transform-gpu"
                                        >
                                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-[40px]" />
                                            <div className="relative z-10">
                                                <h3 className="text-lg font-black tracking-tight mb-1">Elevate Your Strategy</h3>
                                                <p className="text-indigo-100/70 text-[11px] font-bold leading-normal mb-4 max-w-[200px]">Unlock professional analytics, global communities, and secure wallet.</p>
                                                <button
                                                    onClick={() => handleNavigation('/login')}
                                                    className="w-full bg-white text-indigo-900 font-black py-2.5 rounded-[16px] shadow-lg shadow-black/5 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
                                                >
                                                    <LogIn className="w-4 h-4" strokeWidth={2.5} /> Get Started
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Bento Menu Grid - Compact Organization */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-2">
                                        <h4 id="menu-title" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Main Navigation</h4>
                                        <div className="flex-1 h-[1px] bg-slate-100" />
                                    </div>
                                    <motion.div
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        {MENU_ITEMS.map((item) => {
                                            if (item.requiresAuth && !user) return null;

                                            return (
                                                <motion.button
                                                    key={item.name}
                                                    variants={fadeUpItem}
                                                    onClick={() => handleNavigation(item.path)}
                                                    className="relative overflow-hidden group bg-white border border-slate-200/50 rounded-[20px] p-4 flex flex-col gap-2 active:scale-95 transition-all text-left shadow-sm hover:border-indigo-200 hover:shadow-md transform-gpu"
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-[12px] shrink-0 flex items-center justify-center transition-all group-hover:scale-105",
                                                        "bg-slate-50 border border-slate-100 " + item.color
                                                    )}>
                                                        <item.icon className="w-5 h-5" strokeWidth={2.5} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <span className="font-bold text-slate-900 text-[14px] tracking-tight block group-hover:text-indigo-600 transition-colors leading-none">{item.name}</span>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                </div>
                            </div>

                            {/* Action Cluster - Compact Exit */}
                            <div className="space-y-4">
                                {user && !loading && (
                                    <motion.button
                                        variants={fadeUpItem}
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-between p-4 rounded-[20px] bg-white border border-rose-100 text-rose-600 active:scale-[0.98] transition-all group overflow-hidden relative shadow-sm"
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                                                <LogOut className="w-4.5 h-4.5" />
                                            </div>
                                            <div className="text-left">
                                                <span className="font-bold text-[14px] tracking-tight block leading-none mb-1">Log Out</span>
                                                <span className="text-[9px] font-bold text-rose-300 uppercase tracking-widest leading-none">Exit Session</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-rose-200" />
                                    </motion.button>
                                )}

                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">TEER CLUB ECOSYSTEM</span>
                                    <p className="text-[8px] font-black text-slate-200 uppercase tracking-[0.2em]">SYNC 5.2.0</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
