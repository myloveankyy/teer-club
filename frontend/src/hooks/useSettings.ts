"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export type SiteSettings = {
    site_name: string;
    site_logo: string;
    site_favicon: string;
    shillong_rate: string;
    khanapara_rate: string;
    direct_rate: string;
    house_ending_rate: string;
};

export function useSettings() {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/admin/settings');
                setSettings(res.data);
            } catch (err) {
                console.error("Failed to load site settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return { settings, loading };
}
