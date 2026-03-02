"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { AmbientBackground } from "@/components/AmbientBackground";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isHiddenPage = pathname === "/login" || pathname === "/signup" || pathname === "/notifications/changelog";

    return (
        <>
            {!isHiddenPage && <AmbientBackground />}
            {!isHiddenPage && <Header />}
            {children}
            {!isHiddenPage && <BottomNav />}
        </>
    );
}
