import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  preload: true,
});

const INTERNAL_API = process.env.INTERNAL_API_URL || "http://127.0.0.1:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://teer.club";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Teer Club";
  let siteFavicon = "/favicon.ico";
  try {
    const res = await fetch(`${INTERNAL_API}/api/admin/settings`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const settings = await res.json();
      siteName = settings.site_name || siteName;
      siteFavicon = settings.site_favicon || siteFavicon;
    }
  } catch (e) {
    console.warn("Failed to fetch settings for metadata", e);
  }

  return {
    title: {
      default: `Shillong Teer Result Today - Live FR & SR Numbers | ${siteName}`,
      template: `%s | ${siteName}`,
    },
    description:
      "Get live Shillong Teer, Khanapara Teer, Juwai Teer results today. FR & SR numbers updated in real-time with AI common numbers, dream number predictions, and historical archives.",
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: SITE_URL,
    },
    icons: {
      icon: siteFavicon,
      apple: siteFavicon,
    },
    keywords: [
      "shillong teer result today",
      "khanapara teer result",
      "juwai teer result",
      "teer result today",
      "teer common number",
      "shillong teer",
      "teer predictions",
      "teer analytics",
      "teer dream number",
      "teer house ending",
      "shillong teer fr result",
      "shillong teer sr result",
      "khanapara teer common number",
      "teer result history",
      "teer club",
    ],
    openGraph: {
      title: `Shillong Teer Result Today - Live FR & SR Numbers | ${siteName}`,
      description:
        "Get live Shillong Teer, Khanapara Teer, Juwai Teer results today. Real-time FR & SR numbers with AI predictions.",
      url: SITE_URL,
      siteName: siteName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Teer Club - Live Shillong Teer Results & Predictions",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Shillong Teer Result Today | ${siteName}`,
      description:
        "Live Shillong, Khanapara & Juwai Teer results with AI predictions and community insights.",
      images: [`${SITE_URL}/og-image.png`],
    },
    manifest: "/manifest.json",
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 5,
    },
    themeColor: "#4F46E5", // Indigo-600 branch color
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

import PostPredictionModal from "@/components/PostPredictionModal";
import NotificationPoller from "@/components/NotificationPoller";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${orbitron.variable} font-sans antialiased text-gray-900 bg-[#F5F7FA] relative min-h-screen`}
      >
        <div className="relative z-10">
          <LayoutWrapper>{children}</LayoutWrapper>
          <Footer />
        </div>
        <PostPredictionModal />
        <NotificationPoller />
      </body>
    </html>
  );
}
