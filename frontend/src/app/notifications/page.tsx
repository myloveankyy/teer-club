'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell,
    ArrowLeft,
    CheckCircle2,
    Trash2,
    Clock,
    Info,
    Trophy,
    Zap,
    User,
    Circle,
    MoreHorizontal,
    Rocket,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { staggerContainer, fadeUpItem } from '@/lib/motion';

interface Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'win':
        case 'reward':
            return <Trophy className="w-5 h-5 text-amber-500" />;
        case 'level_up':
        case 'rep':
            return <Zap className="w-5 h-5 text-indigo-500" />;
        case 'system':
            return <Info className="w-5 h-5 text-slate-400" />;
        default:
            return <Bell className="w-5 h-5 text-slate-400" />;
    }
};

const getNotificationColor = (type: string) => {
    switch (type.toLowerCase()) {
        case 'win':
        case 'reward':
            return 'bg-amber-50 border-amber-100';
        case 'level_up':
        case 'rep':
            return 'bg-indigo-50 border-indigo-100';
        default:
            return 'bg-slate-50 border-slate-100';
    }
};

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.notifications);
            }
        } catch (err: any) {
            console.error("Failed to load notifications", err);
            if (err.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const res = await api.put(`/notifications/${id}/read`);
            if (res.data.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, is_read: true } : n)
                );
            }
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    const markAllAsRead = async () => {
        if (notifications.every(n => n.is_read)) return;
        setMarkingAll(true);
        try {
            const res = await api.put('/notifications/read-all');
            if (res.data.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            }
        } catch (err) {
            console.error("Failed to mark all read", err);
        } finally {
            setMarkingAll(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                    <Bell className="w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning Alerts...</p>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <main className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-32 relative font-sans antialiased">
            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/40 via-white/50 to-transparent pointer-events-none z-0" />

            <div className="relative z-10 px-4 md:px-6 max-w-[600px] mx-auto pt-8">

                {/* Header Area */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-slate-600 active:scale-95 transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Activity Center</h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5">Alerts & Announcements</p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            disabled={markingAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 transition-all disabled:opacity-50"
                        >
                            {markingAll ? (
                                <Circle className="w-3 h-3 animate-pulse fill-indigo-400" />
                            ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Clear All
                        </button>
                    )}
                </div>

                {/* ── Changelog Shortcut ───────────────────────────────────────── */}
                <Link href="/notifications/changelog" className="group block mb-6">
                    <div className="relative flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white overflow-hidden shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20">
                            <Rocket className="w-5 h-5" />
                        </div>
                        <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-[14px] font-bold tracking-tight">What&apos;s New</h3>
                                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-black uppercase tracking-wider">Changelog</span>
                            </div>
                            <p className="text-white/70 text-[11px] font-medium">New features, fixes & announcements</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all relative z-10 shrink-0" />
                    </div>
                </Link>

                {/* Notifications Feed */}

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                >
                    {notifications.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Bell className="w-6 h-6 text-slate-200" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Silence is Golden</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No new updates to report</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                variants={fadeUpItem}
                                onClick={() => !notif.is_read && markAsRead(notif.id)}
                                className={cn(
                                    "group relative flex gap-4 p-5 rounded-2xl border transition-all cursor-pointer",
                                    notif.is_read
                                        ? "bg-white/60 border-slate-100 opacity-70 hover:opacity-100 hover:bg-white"
                                        : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100"
                                )}
                            >
                                {/* Unread Indicator */}
                                {!notif.is_read && (
                                    <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                                )}

                                {/* Icon Holder */}
                                <div className={cn(
                                    "w-12 h-12 rounded-xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105",
                                    getNotificationColor(notif.type)
                                )}>
                                    {getNotificationIcon(notif.type)}
                                </div>

                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className={cn(
                                            "text-[15px] font-bold tracking-tight truncate",
                                            notif.is_read ? "text-slate-600" : "text-slate-900"
                                        )}>
                                            {notif.title}
                                        </h3>
                                    </div>
                                    <p className="text-slate-500 text-[13px] leading-relaxed mb-3">
                                        {notif.message}
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Clock className="w-3 h-3" />
                                            {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="w-[1px] h-3 bg-slate-200" />
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                            {notif.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Action (Optional / Hover Only) */}
                                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-4 h-4 text-slate-300" />
                                </div>
                            </motion.div>
                        ))
                    )}
                </motion.div>

                {/* Footer Insight */}
                {notifications.length > 0 && (
                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">End of Transmission</p>
                    </div>
                )}
            </div>
        </main>
    );
}
