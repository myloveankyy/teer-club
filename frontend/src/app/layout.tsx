import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Tracker } from "@/components/shared/Tracker";
import NotificationPrompt from "@/components/NotificationPrompt";
import { RealtimeTracker } from "@/components/shared/RealtimeTracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://teer.club"),
  title: "Teer Result Today | Official Shillong, Khanapara & Juwai Results",
  description: "The leading platform for Teer Result Today. Get real-time Shillong, Khanapara and Juwai results, expert common numbers, and previous result history archives.",
  keywords: ["Teer Result Today", "Official Teer Results", "Live Teer Feed", "Shillong Teer Result"],
  authors: [{ name: "Teer Club" }],
  openGraph: {
    title: "Teer Result Today | Official Shillong, Khanapara & Juwai Results",
    description: "The leading platform for Teer Result Today. Get real-time Shillong, Khanapara and Juwai results.",
    type: "website",
    locale: "en_US",
    siteName: "Teer Club",
    url: "https://teer.club",
    images: [{ url: "https://teer.club/images/og-default.png", width: 1200, height: 630, alt: "Teer Result Today - Official Live Results" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Teer Result Today | Official Shillong, Khanapara & Juwai Results",
    description: "The leading platform for Teer Result Today.",
    images: ["https://teer.club/images/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      "en-IN": "https://teer.club",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="min-h-screen flex flex-col bg-white text-gray-900 overflow-x-hidden"
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-2 focus:left-2 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
        >
          Skip to main content
        </a>
        <Providers>
          <Tracker />
          <NotificationPrompt />
          <RealtimeTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}
