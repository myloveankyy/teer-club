import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface PageProps {
  params: Promise<{ market: string }>;
}

import { DynamicGamePage } from "@/components/DynamicGamePage";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { market } = await params;
  const displayName = market.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
  const siteName = "Teer Club";
  const title = `${displayName} Teer Live Result Today | ${displayName} Teer Result`;
  const description = `Check today's ${displayName} Teer live result including first round and second round numbers. Also browse previous ${displayName} Teer results history.`;
  const url = `https://teer.club/results/${market}/live`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function GameLivePage({ params }: PageProps) {
  const { market } = await params;
  const displayName = market.charAt(0).toUpperCase() + market.slice(1);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${displayName} Teer Live Result Today`,
    description: `Check today's ${displayName} Teer live result including first round and second round numbers.`,
    url: `https://teer.club/results/${market}/live`,
    mainEntity: {
      "@type": "Event",
      name: `${displayName} Teer Today`,
      eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "VirtualLocation",
        url: `https://teer.club/results/${market}/live`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DynamicGamePage gameName={market} />
    </>
  );
}
