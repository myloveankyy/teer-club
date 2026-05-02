import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { validateEnv } from "@/lib/env";
import api from "@/lib/api";
import { Tracker } from "@/components/shared/Tracker";
import NotificationPrompt from "@/components/NotificationPrompt";
import { RealtimeTracker } from "@/components/shared/RealtimeTracker";

// Run validation when the server process boots
if (typeof window === "undefined") {
  validateEnv();
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  let settings: any = {};
  let seoData: any = {};

  try {
    const res = await api.settings.get();
    if (res.data?.success) settings = res.data.data;
  } catch (e) { }

  try {
    const res = await api.settings.seo.get();
    if (res.data?.success) seoData = res.data.data;
  } catch (e) { }

  const metaTitle = seoData?.defaultMetaTitle || "Teer Result Today | Official Shillong, Khanapara & Juwai Results";
  const metaDescription = seoData?.metaDescription || "The leading platform for Teer Result Today. Get real-time Shillong, Khanapara and Juwai results, expert common numbers, and previous result history archives.";
  const keywordsStr = seoData?.defaultKeywords || "Teer Result Today, Official Teer Results, Live Teer Feed, Shillong Teer Result";
  const keywords = keywordsStr.split(',').map((k: string) => k.trim());
  const index = seoData?.indexEnabled ?? true;
  const follow = seoData?.followEnabled ?? true;

  const icons: any = {};
  if (settings?.faviconUrl) icons.icon = `${settings.faviconUrl}?v=${Date.now()}`;
  if (settings?.appleTouchIconUrl) icons.apple = `${settings.appleTouchIconUrl}?v=${Date.now()}`;

  return {
    metadataBase: new URL("https://teer.club"),
    title: metaTitle,
    description: metaDescription,
    keywords,
    authors: [{ name: "Teer Club" }],
    icons: Object.keys(icons).length ? icons : undefined,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      locale: "en_US",
      siteName: "Teer Club",
      url: "https://teer.club",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
    },
    robots: {
      index,
      follow,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  let seoData = null;
  try {
    const res = await api.settings.get();
    if (res.data?.success) {
      settings = res.data.data;
    }
    const seoRes = await api.settings.seo.get();
    if (seoRes.data?.success) {
      seoData = seoRes.data.data;
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
        {seoData?.structuredDataJson && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: seoData.structuredDataJson }}
          />
        )}
        {settings?.isAdsEnabled && settings?.googleAdsenseClientId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.googleAdsenseClientId}`}
            crossOrigin="anonymous"
          ></script>
        )}
      </head>
      <body
        className="min-h-screen flex flex-col bg-white text-gray-900 overflow-x-hidden"
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
          <Tracker />
          <NotificationPrompt />
          <RealtimeTracker />
          {children}
        </Providers>
      </body>
    </html>
  );
}

