import type { Metadata } from "next";
import api from "@/lib/api";
import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section, Grid } from "@/components/ui/Grid";
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
    locale: "en_US",
    siteName: "Teer Club",
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

    if (res.data.success) {
      const predData = res.data.data;
      formattedDate = new Date(predData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      todaysNumbers = predData.predictions.map((p: any) => ({
        id: p.id,
        gameName: p.game?.displayName || p.gameId,
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
        {/* Header Section (Cloned from daily page but with Global context) */}
        <Section background="dark" className="bg-[#111827] !py-16 lg:!py-24 border-b border-white/5">
          <Container className="text-center relative z-10">
            <div className="mb-6 flex justify-center">
              <StatusBadge status="declared" customLabels={{ declared: "LIVE TARGETS" }} />
            </div>
            <h1 className="text-h1 mb-6 text-white uppercase leading-tight">
              {formattedDate || "TODAY'S"} <span className="text-blue-500">Targets</span>
            </h1>
            <p className="mx-auto max-w-2xl text-body text-gray-400">
              100% Verified Teer Common Numbers. Get today's Shillong, Khanapara, and Juwai Teer hit numbers, house, and ending predictions.
            </p>
          </Container>
        </Section>

        <TrafficGrid />

        {/* Data Section */}
        <Section background="white" className="py-12 lg:py-24">
          <Container>
            {todaysNumbers.length === 0 ? (
              <div className="text-center py-12 lg:py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <span className="text-4xl lg:text-5xl mb-4 block" role="img" aria-label="Clock">⌛</span>
                <h3 className="text-lg lg:text-xl font-black text-gray-900 uppercase">Numbers Updating</h3>
                <p className="mt-2 text-sm lg:text-base text-gray-500 font-medium tracking-tight">Common numbers are being calculated for today. Check back shortly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Predictions Column */}
                <div className="flex flex-col gap-6 lg:gap-10">
                  <div className="flex flex-col gap-2 lg:gap-3 border-b-4 border-blue-600 w-fit pb-3 lg:pb-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="h-8 lg:h-10 w-8 lg:w-10 bg-[#111827] text-white flex items-center justify-center rounded-xl font-bold text-sm lg:text-lg shadow-md" aria-hidden="true">01</div>
                      <h2 className="text-xl lg:text-2xl font-bold text-[#111827] uppercase leading-none">Today Target Numbers</h2>
                    </div>
                    <span className="text-[10px] lg:text-[12px] font-medium text-gray-500 pl-11 lg:pl-14">Predicted numbers based on previous results & patterns</span>
                  </div>
                  <div className="grid gap-6 lg:gap-8">
                    {todaysNumbers.map((item) => (
                      <PredictionCard
                        key={item.id}
                        game={item.gameName.replace(/Teer|teer/g, "").trim()}
                        directNumbers={item.directNumbers}
                        houseNumbers={item.houseNumbers}
                        endingNumbers={item.endingNumbers}
                        dateSlug={item.dateSlug} // Triggers URL deep-link without revealing direct hits
                      />
                    ))}
                  </div>
                </div>

                {/* Proof Column */}
                <div className="flex flex-col gap-6 lg:gap-10">
                  <div className="flex flex-col gap-2 lg:gap-3 border-b-4 border-green-600 w-fit pb-3 lg:pb-4">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="h-8 lg:h-10 w-8 lg:w-10 bg-green-600 text-white flex items-center justify-center rounded-xl font-bold text-sm lg:text-lg shadow-md" aria-hidden="true">02</div>
                      <h2 className="text-xl lg:text-2xl font-bold text-[#111827] uppercase leading-none">Match Proof</h2>
                    </div>
                    <span className="text-[9px] lg:text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-11 lg:pl-14">Verified Win Record</span>
                  </div>
                  <div className="grid gap-6 lg:gap-8">
                    {todaysNumbers.map((item) => (
                      <MatchProofCard
                        key={`proof-${item.id}`}
                        date={formattedDate}
                        game={item.gameName.replace(/Teer|teer/g, "").trim()}
                        numbers={item.directNumbers}
                        result={item.actualResult}
                        matchDetails={{
                          house: item.houseMatch,
                          ending: item.endingMatch,
                          direct: item.directMatch
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Container>
        </Section>

        {/* Related Games / Verify Past Results */}
        <Section background="gray" className="py-12 lg:py-24 border-t border-gray-200">
          <Container>
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 uppercase tracking-tight">Verify Past Results</h2>
              <p className="mt-2 text-gray-500 font-medium">Check historical performance of our common numbers</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/results/shillong/previous-results" className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">Shillong History</a>
              <a href="/results/khanapara/previous-results" className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">Khanapara History</a>
              <a href="/results/juwai/previous-results" className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-900 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">Juwai History</a>
              <a href="/results" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-sm hover:bg-blue-700 transition-all">View All Results</a>
            </div>
          </Container>
        </Section>
      </main>
    </PageLayout>
  );
}
