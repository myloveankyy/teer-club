"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

// Using native fetch to avoid interceptor retries for non-critical analytics overhead
export function Tracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/analytics/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: window.location.href,
                pathname
            })
        }).catch(() => {
            // fail silently to avoid console warnings for users
        });
    }, [pathname]);

    return null; // Invisible component
}
