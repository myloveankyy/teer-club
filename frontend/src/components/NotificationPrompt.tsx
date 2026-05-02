"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
};

// Convert URL-safe base64 to Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Detect OS from user agent
function detectOS(): string {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Unknown';
}

// Detect browser from user agent
function detectBrowser(): string {
    const ua = navigator.userAgent;
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/Chrome/i.test(ua)) return 'Chrome';
    if (/Firefox/i.test(ua)) return 'Firefox';
    if (/Safari/i.test(ua)) return 'Safari';
    return 'Other';
}

export default function NotificationPrompt() {
    const [settings, setSettings] = useState<{ a2hsEnabled: boolean; pushEnabled: boolean } | null>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showA2HS, setShowA2HS] = useState(false);
    const [showPushPermission, setShowPushPermission] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.settings.notifications.get();
                if (res.data?.success) {
                    setSettings(res.data.data);
                }
            } catch (err) { }
        };
        fetchSettings();
    }, []);

    // A2HS Logic
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(checkIOS);

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

        if (isStandalone) {
            return; // Already installed
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            if (settings?.a2hsEnabled) {
                const dismissed = localStorage.getItem("a2hs_dismissed");
                if (!dismissed) {
                    setTimeout(() => setShowA2HS(true), 2500); // Wait 2.5s to not bombard immediately
                }
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Fallback for iOS which doesn't support beforeinstallprompt natively
        if (checkIOS && settings?.a2hsEnabled) {
            const dismissed = localStorage.getItem("a2hs_dismissed");
            if (!dismissed) {
                setTimeout(() => setShowA2HS(true), 2500);
            }
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, [settings?.a2hsEnabled]);

    // Push Notifications Logic (Service Worker + VAPID)
    useEffect(() => {
        if (!settings?.pushEnabled || typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

        const setupPush = async () => {
            try {
                const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
                // Wait for the SW to be ready
                await navigator.serviceWorker.ready;

                const permission = Notification.permission;
                if (permission === 'default') {
                    const dismissed = localStorage.getItem("push_dismissed");
                    if (!dismissed) setShowPushPermission(true);
                } else if (permission === 'granted') {
                    await subscribeUser(reg);
                }
            } catch (error) {
                console.error("Service Worker registration failed:", error);
            }
        };

        // Delay prompt slightly to ensure rendering completes
        setTimeout(setupPush, 2000);
    }, [settings?.pushEnabled]);

    const subscribeUser = async (swRegistration?: ServiceWorkerRegistration) => {
        try {
            const reg = swRegistration || await navigator.serviceWorker.ready;
            const existingSub = await reg.pushManager.getSubscription();
            if (existingSub) {
                // Already subscribed — just ensure backend knows
                await api.settings.notifications.subscribe({
                    endpoint: existingSub.endpoint,
                    keys: existingSub.toJSON().keys,
                    deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                    browser: detectBrowser(),
                    os: detectOS()
                });
                return;
            }

            // Fetch VAPID public key from backend — critical for subscription to work
            let vapidPublicKey: string;
            try {
                const vapidRes = await api.settings.notifications.getVapid();
                vapidPublicKey = vapidRes.data.data.publicKey;
            } catch (err) {
                console.error("Failed to fetch VAPID key:", err);
                return;
            }

            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });

            await api.settings.notifications.subscribe({
                endpoint: subscription.endpoint,
                keys: subscription.toJSON().keys,
                deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
                browser: detectBrowser(),
                os: detectOS()
            });
        } catch (err) {
            console.error("Push subscription failed:", err);
        }
    };

    const handleAcceptA2HS = async () => {
        if (isIOS) {
            alert('To install: Tap the Share icon at the bottom of Safari, then choose "Add to Home Screen".');
            setShowA2HS(false);
            localStorage.setItem("a2hs_dismissed", "true");
            return;
        }

        setShowA2HS(false);
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                localStorage.setItem("a2hs_dismissed", "true");
            }
            setDeferredPrompt(null);
        }
    };

    const handleDismissA2HS = () => {
        setShowA2HS(false);
        localStorage.setItem("a2hs_dismissed", "true");
    };

    const handleAcceptPush = async () => {
        setShowPushPermission(false);
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            await subscribeUser();
        } else {
            localStorage.setItem("push_dismissed", "true");
        }
    };

    const handleDismissPush = () => {
        setShowPushPermission(false);
        localStorage.setItem("push_dismissed", "true");
    };

    // Render A2HS banner (prioritize over push if both trigger)
    if (showA2HS) {
        return (
            <div className="fixed bottom-0 sm:bottom-6 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] z-[9999] p-4 bg-white/95 backdrop-blur-md sm:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
                <div className="flex-1">
                    <h4 className="text-gray-900 font-bold text-sm tracking-tight flex items-center gap-1.5">
                        <span className="flex w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                        Get Fast Teer Updates
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">Add Teer Club to your home screen for instant Shillong results.</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={handleAcceptA2HS} className="px-5 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                        Install App
                    </button>
                    <button onClick={handleDismissA2HS} className="text-[10px] uppercase font-bold text-gray-400 hover:text-gray-600 transition-colors text-center">
                        Skip
                    </button>
                </div>
            </div>
        );
    }

    if (showPushPermission && !showA2HS) {
        return (
            <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 w-[90%] sm:w-[420px] z-[9999] p-5 bg-white border border-gray-200 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-top-10 fade-in duration-500">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h4 className="text-gray-900 font-semibold text-sm">Enable Notifications</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">Get live Teer results delivered to your device instantly.</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={handleAcceptPush} className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                        Allow
                    </button>
                    <button onClick={handleDismissPush} className="text-[10px] text-gray-400 hover:text-gray-600 font-semibold uppercase transition-colors text-center">
                        Skip
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
