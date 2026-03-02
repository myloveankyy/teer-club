'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Wallet, Bell, Target } from 'lucide-react';
import { VictoryCardModal } from './VictoryCard';

type VictoryData = {
    number: string;
    gameType: string;
    round: string;
    amount: number;
    winAmount: number;
};

export default function NotificationPoller() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [victoryData, setVictoryData] = useState<VictoryData | null>(null);
    const [userName, setUserName] = useState('Champion');

    // Fetch the logged-in username once for the victory card branding
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) setUserName(data.user.username || 'Champion');
                }
            } catch { /* silent — user may not be logged in */ }
        };
        fetchUser();
    }, []);

    // Poll for new notifications every 10 seconds
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (!res.ok) return;
                const data = await res.json();

                if (data.success && data.notifications.length > 0) {
                    setNotifications(prev => {
                        const newNotifs = data.notifications.filter(
                            (newNotif: any) => !prev.some((p: any) => p.id === newNotif.id)
                        );

                        // Trigger victory card for BET_WON notifications
                        const wonNotif = newNotifs.find((n: any) => n.type === 'BET_WON');
                        if (wonNotif) {
                            try {
                                const meta = wonNotif.metadata ? JSON.parse(wonNotif.metadata) : null;
                                setVictoryData({
                                    number: meta?.number || '??',
                                    gameType: meta?.game_type || 'Teer',
                                    round: meta?.round || 'FR',
                                    amount: Number(meta?.amount) || 0,
                                    winAmount: Number(meta?.win_amount) || 0,
                                });
                            } catch {
                                // Metadata not parseable — show generic victory card
                                setVictoryData({
                                    number: '??',
                                    gameType: 'Teer',
                                    round: 'FR',
                                    amount: 0,
                                    winAmount: 0,
                                });
                            }
                        }

                        return [...prev, ...newNotifs];
                    });

                    // Mark all fetched as read immediately
                    for (const notif of data.notifications) {
                        fetch(`/api/notifications/${notif.id}/read`, { method: 'PUT' });
                    }
                }
            } catch {
                // Silently fail — user may not be logged in
            }
        };

        const interval = setInterval(fetchNotifications, 5000);
        fetchNotifications(); // Run once on mount
        return () => clearInterval(interval);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter((n: any) => n.id !== id));
    };

    // Auto-dismiss each notification after 7 seconds
    useEffect(() => {
        if (notifications.length === 0) return;
        const latest = notifications[notifications.length - 1];
        const timer = setTimeout(() => removeNotification(latest.id), 7000);
        return () => clearTimeout(timer);
    }, [notifications]);

    const getIconData = (type: string) => {
        switch (type) {
            case 'BET_WON':
                return { Icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50', strip: 'bg-amber-400' };
            case 'GROUP_TOPUP':
            case 'FUNDS_RECEIVED_FROM_MOD':
                return { Icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50', strip: 'bg-emerald-500' };
            case 'result':
                return { Icon: Target, color: 'text-rose-500', bg: 'bg-rose-50', strip: 'bg-rose-500' };
            default:
                return { Icon: Bell, color: 'text-indigo-500', bg: 'bg-indigo-50', strip: 'bg-indigo-500' };
        }
    };

    return (
        <>
            {/* Victory Share Card — auto-pops on BET_WON */}
            {victoryData && (
                <VictoryCardModal
                    isOpen={true}
                    onClose={() => setVictoryData(null)}
                    prediction={victoryData}
                    userName={userName}
                />
            )}

            {/* Toast Notification Stack */}
            <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((notif: any) => {
                        const { Icon, color, bg, strip } = getIconData(notif.type);
                        return (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-2xl p-4 w-[320px] pointer-events-auto relative overflow-hidden group"
                            >
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${strip}`} />
                                <div className="flex gap-4 items-start">
                                    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0 shadow-inner`}>
                                        <Icon className={`w-5 h-5 ${color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-slate-800 pr-4">{notif.title}</h4>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeNotification(notif.id)}
                                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </>
    );
}
