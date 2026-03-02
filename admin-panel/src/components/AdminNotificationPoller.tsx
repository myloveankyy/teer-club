'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, X, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import api from '@/lib/api';

export default function AdminNotificationPoller() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [lastFetchTime, setLastFetchTime] = useState<string>(new Date().toISOString());

    useEffect(() => {
        const fetchSystemAlerts = async () => {
            try {
                // Fetch latest admin logs which represent system alerts
                const res = await api.get('/admin/notifications');
                if (res.data.success && res.data.data.length > 0) {

                    const newAlerts = res.data.data.filter((alert: any) => {
                        return new Date(alert.created_at) > new Date(lastFetchTime) &&
                            !notifications.some(existing => existing.id === alert.id);
                    });

                    if (newAlerts.length > 0) {
                        setNotifications(prev => [...newAlerts, ...prev].slice(0, 5)); // Keep only 5 latest on screen
                        setLastFetchTime(new Date().toISOString());
                    }
                }
            } catch (error) {
                // Silently fail if not logged in
            }
        };

        const interval = setInterval(fetchSystemAlerts, 15000); // Check every 15s
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lastFetchTime, notifications]);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIconData = (action: string, status: string) => {
        if (status === 'ERROR' || status === 'FAILED') {
            return { Icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50', strip: 'bg-rose-500' };
        }
        if (action.includes('CREATED') || action.includes('UPDATED')) {
            return { Icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', strip: 'bg-emerald-500' };
        }
        return { Icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50', strip: 'bg-indigo-500' };
    };

    // Auto-dismiss toasts after 8 seconds
    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                setNotifications(prev => prev.slice(0, prev.length - 1)); // Remove oldest
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [notifications]);

    return (
        <div className="fixed bottom-6 right-6 z-[99999] flex flex-col-reverse justify-end gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((notif) => {
                    const { Icon, color, bg, strip } = getIconData(notif.action, notif.status);

                    // Format action text for readability
                    const title = notif.action.split('_').slice(0, 2).join(' ').replace(/\b\w/g, l => l.toUpperCase());
                    const message = notif.action.replace(/_/g, ' ').toLowerCase();

                    return (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: 50, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-[20px] p-4 w-[340px] pointer-events-auto relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 left-0 w-1 h-full \${strip}`} />
                            <div className="flex gap-4 items-start">
                                <div className={`w-10 h-10 rounded-full \${bg} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`w-5 h-5 \${color}`} />
                                </div>
                                <div className="flex-1 mt-0.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-[13px] font-black text-white/90 truncate leading-tight">{title}</h4>
                                        <span className="bg-slate-800 text-slate-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">Now</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed line-clamp-2">
                                        <span className="text-white/70 font-bold">@{notif.username}</span>: {message}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeNotification(notif.id)}
                                className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
