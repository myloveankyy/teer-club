import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { validateEnv } from "@/lib/env";
import api from "@/lib/api";

// Run validation when the server process boots
if (typeof window === "undefined") {
  validateEnv();
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://teer.club"),
  title: "Teer Result Today | Official Shillong, Khanapara & Juwai Results",
  description:
    "The leading platform for Teer Result Today. Get real-time Shillong, Khanapara and Juwai results, expert common numbers, and previous result history archives.",
  keywords: [
    "Teer Result Today",
    "Official Teer Results",
    "Live Teer Feed",
    "Shillong Teer Result",
    "Khanapara Teer Result",
    "Juwai Teer Result",
    "Teer Common Numbers",
    "Teer Target Number Today",
    "Shillong Teer Live",
    "Khanapara Teer Live",
  ],
  authors: [{ name: "Teer Club" }],
  openGraph: {
    title: "Official Teer Result Today | Verified Market Feed",
    description:
      "Access the fastest Teer Result Today, real-time live feeds, and historical archives for Shillong, Khanapara, and Juwai.",
    type: "website",
    locale: "en_US",
    siteName: "Teer Club",
    url: "https://teer.club",
  },
  twitter: {
    card: "summary_large_image",
    title: "Latest Teer Results Today",
    description: "Check today's latest Teer results for all games.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    const res = await api.settings.get();
    if (res.data?.success) {
      settings = res.data.data;
    }
  } catch (error) {
    console.error("Failed to prefetch settings for SSR:", error);
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Performance: preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"} />
      </head>
      <body
        className="min-h-screen flex flex-col bg-white text-gray-900"
        suppressHydrationWarning
      >
        {/* Accessibility: skip-to-content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:top-2 focus:left-2 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
        >
          Skip to main content
        </a>
        <Providers initialSettings={settings}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

