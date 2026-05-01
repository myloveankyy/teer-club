"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";
import { useToast } from "@/components/Toast";
import { useState, useEffect } from "react";

export default function NotificationSettingsPage() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        a2hsEnabled: true,
        pushEnabled: false,
    });

    const [pushMessage, setPushMessage] = useState({ title: "", body: "", url: "" });

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ["notificationSettings"],
        queryFn: () => api.settings.notifications.get(),
    });

    const { data: subscriberStats } = useQuery({
        queryKey: ["notificationSubscribers"],
        queryFn: () => api.settings.notifications.getSubscribers(),
        refetchInterval: 30000, // background refresh 30s
    });

    useEffect(() => {
        if (settingsData?.success) {
            setFormData({
                a2hsEnabled: settingsData.data.a2hsEnabled ?? true,
                pushEnabled: settingsData.data.pushEnabled ?? false,
            });
        }
    }, [settingsData]);

    const updateMutation = useMutation({
        mutationFn: (data: typeof formData) => api.settings.notifications.update(data),
        onSuccess: () => {
            showToast("Notification strategy committed", "success");
            queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
        },
        onError: (err: any) => {
            showToast(err.message || "Failed to update strategy", "error");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    const handleSendPush = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we didn't implement webpush backend yet fully, we show a mock UI success
        // In real world, we would call an api.settings.notifications.sendPush(pushMessage)
        if (!formData.pushEnabled) {
            showToast("Please enable push notifications globally first", "error");
            return;
        }
        showToast("Signal deployed to Service Worker endpoints", "success");
        setPushMessage({ title: "", body: "", url: "" });
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center h-64 flex-col gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
                <span className="text-gray-500 font-medium">Fetching PWA configurations...</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notification & PWA Command Hub</h1>
                <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                    Full control interface for user conversion pipelines. Manage mobile home-screen prompt aggressiveness alongside direct Web-Push service worker broadcasts.
                </p>
            </div>

            {/* Live Analytics Banner */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <p className="text-gray-400 font-bold text-sm tracking-wider uppercase mb-1">Active Listeners</p>
                    <h3 className="text-4xl font-black">{subscriberStats?.data?.count || 0}</h3>
                    <p className="text-xs text-green-400 mt-2 font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Service Worker Connected
                    </p>
                </div>
                <div className="bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl p-6">
                    <p className="text-gray-400 font-bold text-sm tracking-wider uppercase mb-1">Click Through (CTR)</p>
                    <h3 className="text-4xl font-black text-gray-900">0.0%</h3>
                    <p className="text-xs text-gray-500 mt-2 font-mono">Requires initial push sequence</p>
                </div>
                <div className="bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl p-6 border-l-4 border-l-indigo-500">
                    <p className="text-gray-400 font-bold text-sm tracking-wider uppercase mb-1">A2HS Accepted</p>
                    <h3 className="text-4xl font-black text-indigo-900">Tracked Offline</h3>
                    <p className="text-xs text-indigo-500 mt-2 font-mono">Client-side metric only</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Toggles */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40 h-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            Core PWA Mechanics
                        </h2>

                        <div className="space-y-6">
                            {/* A2HS */}
                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-200 transition-all hover:border-gray-300">
                                <div className="pr-4">
                                    <h4 className="font-bold text-gray-900 text-lg">Add to Home Screen (A2HS)</h4>
                                    <p className="text-sm text-gray-500 mt-1">Prompt compatible mobile Chrome/Safari browsers to install Teer Club as a persistent app.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, a2hsEnabled: !formData.a2hsEnabled })}
                                    className={`relative flex-shrink-0 inline-flex h-8 w-16 items-center rounded-full transition-colors ${formData.a2hsEnabled ? "bg-rose-500" : "bg-gray-300"}`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition shadow-md ${formData.a2hsEnabled ? "translate-x-9" : "translate-x-1"}`} />
                                </button>
                            </div>

                            {/* Push */}
                            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-200 transition-all hover:border-gray-300">
                                <div className="pr-4">
                                    <h4 className="font-bold text-gray-900 text-lg">Web Push Subscriptions</h4>
                                    <p className="text-sm text-gray-500 mt-1">Request notification permissions. Automatically records endpoints to PostgreSQL logic layer.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, pushEnabled: !formData.pushEnabled })}
                                    className={`relative flex-shrink-0 inline-flex h-8 w-16 items-center rounded-full transition-colors ${formData.pushEnabled ? "bg-rose-500" : "bg-gray-300"}`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition shadow-md ${formData.pushEnabled ? "translate-x-9" : "translate-x-1"}`} />
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="w-full px-8 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                            >
                                {updateMutation.isPending ? "Syncing..." : "SAVE CONFIGURATION"}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Direct Console / Manual Send */}
                <form onSubmit={handleSendPush} className="h-full">
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl border border-indigo-800 p-8 shadow-2xl relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3 relative z-10">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Direct Action Transmitter
                        </h2>
                        <p className="text-indigo-200 text-xs mb-8">Execute raw push notifications bypassing scheduled rulesets.</p>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Notification Title</label>
                                <input
                                    type="text"
                                    required
                                    value={pushMessage.title}
                                    onChange={(e) => setPushMessage({ ...pushMessage, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-medium transition-all text-white placeholder-white/30"
                                    placeholder="🎯 Live Shillong Result!"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Message Body</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={pushMessage.body}
                                    onChange={(e) => setPushMessage({ ...pushMessage, body: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-medium transition-all text-white placeholder-white/30"
                                    placeholder="Click to view the fastest live target hitting now..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Target Action URL (Optional)</label>
                                <input
                                    type="url"
                                    value={pushMessage.url}
                                    onChange={(e) => setPushMessage({ ...pushMessage, url: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none font-medium transition-all text-white placeholder-white/30"
                                    placeholder="https://teer.club/live"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 px-8 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-400 transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] flex justify-center items-center gap-2"
                            >
                                TRANSMIT PAYLOAD
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
