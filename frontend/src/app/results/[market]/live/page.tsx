import type { Metadata } from "next";
import api from "@/lib/api";
import { DynamicGamePage } from "@/components/DynamicGamePage";

export const revalidate = 30; // ISR: Revalidate every 30 seconds

interface PageProps {
  params: Promise<{ market: string }>;
}

// ─── Pre-generate paths for all enabled games ────────────────────────────────
export async function generateStaticParams() {
  try {
    const res = await api.games.getAll();
    if (res.data?.success && res.data.data) {
      return res.data.data
        .filter((g) => g.isEnabled)
        .map((game) => ({ market: game.name.toLowerCase() }));
    }
  } catch {
    // Build continues without pre-generated paths
  }
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { market } = await params;
  const displayName = market.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
  const siteName = "Teer Club";
  const title = `${displayName} Teer Live Result Today | ${displayName} Teer Result`;
  const description = `Check today's ${displayName} Teer live result including first round and second round numbers. Also browse previous ${displayName} Teer results history.`;
  // Canonical must point to redirect destination (/live/:market), not this path
  const url = `https://teer.club/live/${market}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "en_IN",
      type: "website",
      images: [{ url: "https://teer.club/images/og-default.png", width: 1200, height: 630, alt: `${displayName} Teer Result Today` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://teer.club/images/og-default.png"],
    },
  };
}

export default async function GameLivePage({ params }: PageProps) {
  const { market } = await params;
  const displayName = market.charAt(0).toUpperCase() + market.slice(1);

  let initialGame = null;
  let initialResults = null;

  try {
    const gameRes = await api.games.getById(market);
    if (gameRes.data?.success) {
      initialGame = gameRes.data.data;
      if (initialGame?.id) {
        const resultsRes = await api.results.getDashboard({ gameId: initialGame.id, limit: 10 });
        if (resultsRes.data?.success) {
          initialResults = resultsRes.data.data.results;
        }
      }
    }
  } catch (err) {
    console.error(`[SSR] Failed to fetch data for market ${market}:`, err);
  }

  const gameName = initialGame?.displayName || displayName;

  // JSON-LD: Event + BreadcrumbList (server-rendered for crawlers)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${gameName} Teer Live Result Today`,
    description: `Check today's ${gameName} Teer live result including first round and second round numbers.`,
    url: `https://teer.club/live/${market}`,
    mainEntity: {
      "@type": "Event",
      name: `${gameName} Teer Today`,
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "VirtualLocation",
        url: `https://teer.club/live/${market}`,
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://teer.club" },
      { "@type": "ListItem", position: 2, name: "Live Results", item: "https://teer.club/live" },
      { "@type": "ListItem", position: 3, name: `${gameName} Live`, item: `https://teer.club/live/${market}` },
    ],
  };

  // Determine SSR status for SEO text
  const todayResult = initialResults?.[0];
  const isToday = todayResult && new Date(todayResult.date).toDateString() === new Date().toDateString();
  const fr = isToday ? (todayResult?.round1 || "Awaiting") : "Awaiting";
  const sr = isToday ? (todayResult?.round2 || "Awaiting") : "Awaiting";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* SSR SEO content block — visible to crawlers even if client JS doesn't execute */}
      <div className="sr-only" aria-hidden="false">
        <h1>{gameName} Teer Result Today Live – FR &amp; SR</h1>
        <p>
          Welcome to the official {gameName} Teer Result Today page on Teer Club.
          Get the fastest live updates for {gameName} Teer including First Round (FR) and
          Second Round (SR) results directly from the official archery counters.
        </p>
        <p>Today&apos;s {gameName} Teer Result: FR = {fr}, SR = {sr}.</p>
        <p>
          Check {gameName} Teer Common Number, {gameName} Teer Previous Results,
          and {gameName} Teer Result List on Teer Club.
        </p>
      </div>
      <DynamicGamePage gameName={market} initialGame={initialGame} initialResults={initialResults} />
    </>
  );
}
