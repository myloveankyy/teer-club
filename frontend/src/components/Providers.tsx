"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode, createContext } from "react";

import { ThemeProvider } from "./ui/ThemeProvider";
import { SiteSettings } from "@/hooks/useSiteSettings";

export const InitialSettingsContext = createContext<SiteSettings | null>(null);

export default function Providers({ children, initialSettings }: { children: ReactNode, initialSettings?: SiteSettings | null }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                retry: 2,
                refetchOnWindowFocus: true,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <InitialSettingsContext.Provider value={initialSettings || null}>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </InitialSettingsContext.Provider>
        </QueryClientProvider>
    );
}
