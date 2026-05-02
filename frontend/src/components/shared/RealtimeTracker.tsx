"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function generateSessionId(): string {
    if (typeof window === "undefined") return "";
    let id = sessionStorage.getItem("_rt_sid");
    if (!id) {
        id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem("_rt_sid", id);
    }
    return id;
}

function detectDevice(): string {
    if (typeof navigator === "undefined") return "Unknown";
    return /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
}

function detectBrowser(): string {
    if (typeof navigator === "undefined") return "Unknown";
    const ua = navigator.userAgent;
    if (/Edg\//i.test(ua)) return "Edge";
    if (/Chrome/i.test(ua)) return "Chrome";
    if (/Firefox/i.test(ua)) return "Firefox";
    if (/Safari/i.test(ua)) return "Safari";
    return "Other";
}

function detectOS(): string {
    if (typeof navigator === "undefined") return "Unknown";
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Mac/i.test(ua)) return "macOS";
    if (/Linux/i.test(ua)) return "Linux";
    return "Unknown";
}

function detectReferrer(): string {
    if (typeof document === "undefined") return "direct";
    const ref = document.referrer;
    if (!ref) return "direct";
    try {
        const url = new URL(ref);
        if (url.hostname.includes("google")) return "Google";
        if (url.hostname.includes("bing")) return "Bing";
        if (url.hostname.includes("facebook") || url.hostname.includes("fb.")) return "Facebook";
        if (url.hostname.includes("twitter") || url.hostname.includes("t.co")) return "Twitter";
        if (url.hostname.includes("youtube")) return "YouTube";
        if (url.hostname.includes("teer.club")) return "internal";
        return url.hostname;
    } catch {
        return "direct";
    }
}

export function RealtimeTracker() {
    const pathname = usePathname();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const sessionId = generateSessionId();
        const deviceType = detectDevice();
        const browser = detectBrowser();
        const os = detectOS();
        const referrer = detectReferrer();

        const sendHeartbeat = () => {
            fetch(`${apiUrl}/analytics/heartbeat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    page: pathname || "/",
                    referrer,
                    deviceType,
                    browser,
                    os,
                }),
            }).catch(() => {
                // Fail silently — analytics must never break the app
            });
        };

        // Send immediately on page change
        sendHeartbeat();

        // Then send every 15 seconds
        intervalRef.current = setInterval(sendHeartbeat, 15_000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [pathname]);

    return null; // Invisible component
}
