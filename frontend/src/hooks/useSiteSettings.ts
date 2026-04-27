import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import api from "@/lib/api";
import { InitialSettingsContext } from "@/components/Providers";

export interface SiteSettings {
    youtubeUrl: string;
    youtubeEnabled: boolean;
    whatsappUrl: string;
    whatsappEnabled: boolean;
    telegramUrl: string;
    telegramEnabled: boolean;
    bannerText: string;
    bannerVisible: boolean;
    bannerColor: string;
    resultAwaitedText: string;
    sundayOffText: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    cardStyle: string;
    borderRadius: string;
}

export const useSiteSettings = (initialSettingsProp?: SiteSettings) => {
    const contextSettings = useContext(InitialSettingsContext);
    const resolvedInitialData = initialSettingsProp || contextSettings || undefined;

    const { data, isLoading, error } = useQuery({
        queryKey: ["site-settings"],
        queryFn: async () => {
            const response = await api.settings.get();
            return response.data.data as SiteSettings;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        ...(resolvedInitialData ? { initialData: resolvedInitialData } : {}),
    });

    return {
        settings: data,
        isLoading,
        error,
    };
};
