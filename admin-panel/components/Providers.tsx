"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { SidebarProvider } from "./SidebarContext";
import { ToastProvider } from "./Toast";

export default function Providers({ children }: { children: ReactNode }) {
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
            <ToastProvider>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
            </ToastProvider>
        </QueryClientProvider>
    );
}
