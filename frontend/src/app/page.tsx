import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";
import { Hero } from "@/components/Hero";
import { TodaysResults } from "@/components/TodaysResults";
import { Section, Container } from "@/components/ui/Grid";
import api from "@/lib/api";
import { TelegramBanner } from "@/components/TelegramBanner";
import dynamic from "next/dynamic";
import { TrafficGrid } from "@/components/layout/TrafficGrid";
import AdSlot from "@/components/ads/AdSlot";
import { ShareToUnlock } from "@/components/growth/ShareToUnlock";
import { SunkCostStreak } from "@/components/growth/SunkCostStreak";

// Code splitting for below-the-fold heavy components
const MoreByTeerClub = dynamic(() => import("@/components/MoreByTeerClub").then((mod) => mod.MoreByTeerClub));
const FAQ = dynamic(() => import("@/components/FAQ").then((mod) => mod.FAQ));

export const revalidate = 60; // ISR: Revalidate every 60 seconds

import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const defaultMeta: Metadata = {
    title: "Teer Result Today | Official Shillong, Khanapara & Juwai Teer Results",
    description:
      "Get the fastest Teer Result Today for Shillong, Khanapara and Juwai. View official Morning and Evening archery results, previous result archives, and daily common numbers.",
    keywords: [
      "Teer Result Today",
      "Shillong Teer Result",
      "Khanapara Teer Result",
      "Juwai Teer Result Today",
      "Shillong Teer Result Today",
      "Teer Common Number",
      "Teer Result List",
      "Teer Result Morning",
      "Teer Result Evening",
    ],
    alternates: {
      canonical: "/",
    },
  };

  try {
    const res = await api.pages.getByUrl("/");
    if (res.data?.success && res.data.data) {
      const page = res.data.data;
      return {
        ...defaultMeta,
        title: (page.meta_title || defaultMeta.title as string).replace(/\s*\|\s*Teer Club/i, ''),
        description: page.meta_description || defaultMeta.description,
        openGraph: {
          title: (page.meta_title || defaultMeta.title as string).replace(/\s*\|\s*Teer Club/i, ''),
          description: (page.meta_description || defaultMeta.description) as string,
          type: "website",
          locale: "en_IN",
          siteName: "Teer Club",
          url: "https://teer.club",
          images: page.featured_image
            ? [{ url: page.featured_image, alt: page.image_alt || "Teer Result" }]
            : [{ url: "https://teer.club/images/og-default.png", width: 1200, height: 630, alt: "Teer Result Today" }],
        },
        twitter: {
          card: "summary_large_image" as const,
          title: (page.meta_title || defaultMeta.title as string).replace(/\s*\|\s*Teer Club/i, ''),
          description: (page.meta_description || defaultMeta.description) as string,
          images: page.featured_image ? [page.featured_image] : ["https://teer.club/images/og-default.png"],
        },
      };
    }
  } catch (error) {
    console.error("Failed to fetch custom metadata", error);
  }

  return defaultMeta;
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Teer Result Today",
  description: "Official Teer results for Shillong, Khanapara, Juwai, and major regional games",
  url: "https://teer.club",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://teer.club",
    },
  ],
};

export default async function Home() {
  let initialGames = undefined;
  let initialDate = undefined;

  try {
    const res = await api.results.getToday();
    if (res.data?.success) {
      initialGames = res.data.data.games;
      initialDate = res.data.data.date;
    }
  } catch (error) {
    console.error("Failed to fetch today's results for SSR:", error);
    // Silent fail; component will fallback to CSR fetching in TodaysResults
  }

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main id="main-content" className="flex-1 bg-surface pb-28 sm:pb-0">
        <Hero initialGames={initialGames} />

        {/* Viral Growth Features Section */}
        <Container>
          <div className="flex flex-col lg:flex-row gap-6 my-8 items-center justify-center">
            <ShareToUnlock />
            <SunkCostStreak />
          </div>
        </Container>

        <TrafficGrid />
        <Section className="!py-10 border-b border-border/50">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">Teer Result Today - Shillong & Khanapara</h2>
              <p className="text-body text-gray-500 leading-relaxed max-w-3xl mx-auto mb-8">
                Welcome to the leading platform for <Link href="/results" className="text-primary font-bold hover:underline">Teer Result Today</Link>, expert <Link href="/common-numbers" className="text-primary font-bold hover:underline">Teer Common Numbers</Link>, and historical archives. We provide live updates for <Link href="/results/shillong/live" className="text-primary font-bold hover:underline">Shillong Teer Result</Link>, Khanapara, and Juwai games with 100% verified results.
              </p>
              <div className="max-w-2xl mx-auto">
                <TelegramBanner />
              </div>
            </div>
            <div className="max-w-4xl mx-auto mt-6">
               <AdSlot slotType="header" />
            </div>
          </Container>
        </Section>

        {/* Micro-timestamping for Google Indexing freshness */}
        {initialDate && (
          <time dateTime={`${initialDate}T00:00:00+05:30`} className="hidden">Last Updated: {initialDate}</time>
        )}

        <TodaysResults initialGames={initialGames} initialDate={initialDate} />

        <Container>
           <AdSlot slotType="inFeed" />
        </Container>



        {/* SEO Content Section */}
        <Section className="!py-16 bg-gray-50/30 border-y border-gray-100">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-2xl font-bold text-gray-900 tracking-tight text-center md:text-left">Understanding Teer Result Today</h2>
              <div className="grid gap-8 md:grid-cols-2 text-sm text-gray-600 leading-relaxed">
                <div className="space-y-4">
                  <p>
                    Checking the <strong className="text-gray-900 font-bold">Teer Result Today</strong> is a daily routine for thousands of enthusiasts in Shillong, Khanapara, and Juwai. Teer is a traditional archery-based game played primarily in Meghalaya, where the result is determined by the number of arrows that hit the target during two rounds of archery.
                  </p>
                  <p>
                    The <strong className="text-gray-900 font-bold">Shillong Teer Result</strong> is announced in two rounds: Round 1 (Morning) and Round 2 (Evening). Similarly, the <strong className="text-gray-900 font-bold">Khanapara Teer Result</strong> follows its own schedule, providing multiple opportunities for players to verify their predictions.
                  </p>
                </div>
                <div className="space-y-4">
                  <p>
                    To improve your chances, many players look for <strong className="text-gray-900 font-bold">Teer Common Numbers</strong>. These are calculated target numbers based on previous result patterns and historical data analysis. Our platform provides the most accurate predictions to help you stay ahead.
                  </p>
                  <p>
                    Whether you are looking for <strong className="text-gray-900 font-bold">Teer Lucky Numbers</strong> or an archive of previous results, Teer.club offers the fastest and most reliable data feed directly from the official counters. Stay tuned for live updates!
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <MoreByTeerClub />
        <FAQ />
        
        {/* Mobile Sticky Footer Ad Wrapper - Hardcoded min-height to prevent CLS */}
        <div className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] h-[50px] overflow-hidden" role="complementary" aria-label="Advertisement">
            <AdSlot slotType="stickyFooter" format="rectangle" responsive={false} className="!m-0 h-[50px]" />
        </div>
      </main>
    </PageLayout>
  );
}
