import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileBlocker from "@/components/MobileBlocker";
import MainContent from "@/components/MainContent";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin Dashboard",
};

import Providers from "@/components/Providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAuth = cookieStore.get("admin_auth")?.value === "true";

  if (!isAuth) {
    return (
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body className="h-full bg-gray-50" suppressHydrationWarning>
          {children}
        </body>
      </html>
    );
  }

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