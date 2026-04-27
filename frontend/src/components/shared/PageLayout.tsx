import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import api from "@/lib/api";

interface PageLayoutProps {
    children: React.ReactNode;
    showHeader?: boolean;
    showFooter?: boolean;
    className?: string;
}

export const PageLayout = ({
    children,
    showHeader = true,
    showFooter = true,
    className = "",
}: PageLayoutProps) => {
    return (
        <div className={`flex min-h-screen flex-col bg-white ${className}`}>
            {showHeader && <Header />}
            <main id="main-content" className="flex-1">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
};
