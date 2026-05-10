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
        <link rel="dns-prefetch" href="https://api.teer.club" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body
        className="min-h-screen flex flex-col bg-white text-gray-900 overflow-x-hidden"
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
        <noscript>
          <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
            <h1>Teer Club — Official Teer Results</h1>
            <p>Please enable JavaScript to view live results, common numbers, and predictions.</p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
