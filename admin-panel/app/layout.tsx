import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/SidebarContext";
import { ToastProvider } from "@/components/Toast";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileBlocker from "@/components/MobileBlocker";
import MainContent from "@/components/MainContent";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin Dashboard",
};

import Providers from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-gray-50" suppressHydrationWarning>
        <Providers>
          <MobileBlocker>
            <Sidebar />
            <Header />
            <MainContent>{children}</MainContent>
          </MobileBlocker>
        </Providers>
      </body>
    </html>
  );
}