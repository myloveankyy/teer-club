"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { settings } = useSiteSettings();

    useEffect(() => {
        if (!settings) return;

        const root = document.documentElement;

        // Brand Colors
        root.style.setProperty("--primary", settings.primaryColor || "#2563eb");
        root.style.setProperty("--accent", settings.accentColor || "#22c55e");

        // Global Surfaces & Typography
        root.style.setProperty("--bg", settings.backgroundColor || "#ffffff");
        root.style.setProperty("--text", settings.textColor || "#111827");

        // Border Radius Mapping
        const radiusMap: Record<string, string> = {
            sm: "0.4rem",
            md: "0.75rem",
            lg: "1.25rem",
        };
        root.style.setProperty("--radius", radiusMap[settings.borderRadius] || "1rem");

        // Success / Error adjustments if needed (can be static or dynamic)
        // root.style.setProperty("--color-success", settings.primaryColor || "#16a34a");

    }, [settings]);

    return <>{children}</>;
}
