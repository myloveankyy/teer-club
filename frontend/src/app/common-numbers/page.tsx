import type { Metadata } from "next";
import api from "@/lib/api";
import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section } from "@/components/ui/Grid";
import { PredictionCard } from "@/components/ui/PredictionCard";
import { MatchProofCard } from "@/components/ui/MatchProofCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TrafficGrid } from "@/components/layout/TrafficGrid";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "Teer Common Number Today - Shillong Khanapara Target Number",
  description:
    "Get 100% verified Teer Common Number Today for Shillong, Khanapara and Juwai. Our system provides daily target numbers for House, Ending and Direct matches.",
  keywords: [
    "Teer Common Number Today",
    "Shillong Teer Target Number",
    "Khanapara Teer Target Number",
    "Teer Hit Number",
    "Teer Forecast Today",
    "Shillong Teer House Ending",
    "Khanapara Teer Common",
    "Teer Predictive Analysis",
  ],
  alternates: {
    canonical: "/common-numbers",
  },
  openGraph: {
    title: "Official Teer Common Numbers Today | Today Target Numbers",
    description: "Access today's Teer common number projections and expert forecast archives.",
    type: "website",
    locale: "en_IN",
    siteName: "Teer Club",
    images: [{ url: "https://teer.club/images/og-default.png", width: 1200, height: 630, alt: "Teer Common Numbers Today" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Official Teer Common Numbers Today",
    description: "Access today's Teer common number projections.",
    images: ["https://teer.club/images/og-default.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Teer Common Numbers Today - House, Ending & Hit Numbers",
  "description": "Daily Teer common numbers, target numbers and predictions for Shillong and Khanapara Teer. 100% verified house and ending hit numbers.",
  "url": "https://teer.club/common-numbers",
  "publisher": {
    "@type": "Organization",
    "name": "Teer Club",
    "logo": {
      "@type": "ImageObject",
      "url": "https://teer.club/logo.png"
    }
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Shillong Teer Common Numbers"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Khanapara Teer Common Numbers"
      }
    ]
  }
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
    {
      "@type": "ListItem",
      position: 2,
      name: "Common Numbers",
      item: "https://teer.club/common-numbers",
    },
  ],
};

export default async function CommonNumbersPage() {
  let todaysNumbers: any[] = [];
  let formattedDate = "";

  try {
    const res = await api.predictions.getTodayAll();

    if (res.data?.success) {
      const predData = res.data.data;
      formattedDate = new Date(predData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      todaysNumbers = predData.predictions.map((p: any) => ({
        id: p.id,
        gameName: p.game?.displayName || p.gameId,
        gameSlugId: (p.game?.name || p.gameId || '').toLowerCase(),
        directNumbers: [p.directNumber, ...p.commonNumbers.slice(0, 4)],
        houseNumbers: p.house ? p.house.split(',').map((s: string) => s.trim()) : [],
        endingNumbers: p.ending ? p.ending.split(',').map((s: string) => s.trim()) : [],
        dateSlug: predData.date,
        actualResult: p.actualResult || "PENDING",
        houseMatch: p.houseMatch,
        endingMatch: p.endingMatch,
        directMatch: p.directMatch,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch common numbers content:", err);
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
      <main className="flex-1">
        {/* Compact Hero Section */}
        <Section background="dark" className="bg-[#111827] !py-10 lg:!py-14 border-b border-white/5">
          <Container className="text-center relative z-10">
            <div className="mb-3 flex justify-center">
              <StatusBadge status="declared" customLabels={{ declared: "LIVE TARGETS" }} />
            </div>
            <h1 className="text-h1 mb-3 text-white uppercase leading-tight">
              {formattedDate || "TODAY'S"} <span className="text-blue-500">Targets</span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-gray-400 leading-relaxed">
              100% Verified Teer Common Numbers — Shillong, Khanapara & Juwai hit numbers, house and ending predictions.
            </p>
          </Container>
        </Section>

        <TrafficGrid />

        {/* Data Section — Per-Game Paired Layout */}
        <Section background="white" className="!py-8 lg:!py-14">
          <Container>
            {todaysNumbers.length === 0 ? (
              <div className="text-center py-10 lg:py-14 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-3xl lg:text-4xl mb-3 block" role="img" aria-label="Clock">⌛</span>
                <h3 className="text-base lg:text-lg font-black text-gray-900 uppercase">Numbers Updating</h3>
                <p className="mt-1.5 text-xs lg:text-sm text-gray-500 font-medium tracking-tight">Common numbers are being calculated for today. Check back shortly.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 lg:gap-10">
                {todaysNumbers.map((item, gameIdx) => (
                  <div key={item.id} className="flex flex-col gap-3">
                    {/* Game Section Header */}
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center rounded-lg font-bold text-[10px] shadow-sm">
                        {String(gameIdx + 1).padStart(2, '0')}
                      </div>
                      <h2 className="text-base lg:text-lg font-bold text-gray-900 uppercase tracking-tight leading-none">
                        {item.gameName.replace(/Teer|teer/g, "").trim()} Teer
                      </h2>
                    </div>

                    {/* Prediction + Proof Side-by-Side on Desktop, Stacked on Mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <PredictionCard
                        game={item.gameName.replace(/Teer|teer/g, "").trim()}
                        directNumbers={item.directNumbers}
                        houseNumbers={item.houseNumbers}
                        endingNumbers={item.endingNumbers}
                        reportUrl={`/common-numbers/${item.gameSlugId}/${item.dateSlug}`}
                      />
                      <MatchProofCard
                        date={formattedDate}
                        game={item.gameName.replace(/Teer|teer/g, "").trim()}
                        numbers={item.directNumbers}
                        result={item.actualResult}
                        compact={true}
                        matchDetails={{
                          house: item.houseMatch,
                          ending: item.endingMatch,
                          direct: item.directMatch
                        }}
                        reportUrl={`/match-proofs/${item.gameSlugId}/${item.dateSlug}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Container>
        </Section>

        {/* Jackpot Trust Link */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-100/50">
          <Container className="py-6 lg:py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Check Our Prediction Accuracy</h3>
                <p className="text-xs text-gray-500">View historical match proofs, win streaks & accuracy stats</p>
              </div>
            </div>
            <Link
              href="/jackpot"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-md shadow-amber-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              View Jackpot Proofs →
            </Link>
          </Container>
        </section>

        {/* Verify Past Results */}
        <Section background="gray" className="!py-8 lg:!py-14 border-t border-gray-200">
          <Container>
            <div className="text-center mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 uppercase tracking-tight">Verify Past Results</h2>
              <p className="mt-1 text-sm text-gray-500 font-medium">Check historical performance of our common numbers</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/results/shillong/previous-results" className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">Shillong History</a>
              <a href="/results/khanapara/previous-results" className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">Khanapara History</a>
              <a href="/results/juwai/previous-results" className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-900 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">Juwai History</a>
              <a href="/results" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition-all">View All Results</a>
            </div>
          </Container>
        </Section>
      </main>
    </PageLayout>
  );
}
