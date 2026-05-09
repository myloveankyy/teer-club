import type { Metadata } from "next";
import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section } from "@/components/ui/Grid";
import { DarkHero, HeroBadge } from "@/components/layout/DarkHero";
import { TrafficGrid } from "@/components/layout/TrafficGrid";
import { JackpotDashboard } from "@/components/JackpotDashboard";

export const metadata: Metadata = {
  title: "Teer Jackpot & Match Proofs - Verification & Accuracy Stats",
  description:
    "Check our Teer prediction accuracy with verified match proofs. See our history of Shillong and Khanapara Teer direct hits, house, and ending matches.",
  keywords: [
    "Teer prediction accuracy",
    "Teer jackpot proof",
    "Teer hit number verification",
    "Shillong Teer match proof",
    "Teer win history",
    "Verified Teer target numbers"
  ],
  alternates: {
    canonical: "/jackpot",
  },
  openGraph: {
    title: "Teer Prediction Accuracy & Jackpot Proofs",
    description: "View our verified history of Teer target hits and prediction accuracy.",
    type: "website",
    locale: "en_IN",
    siteName: "Teer Club",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Teer Jackpot & Match Proofs",
  "description": "Verified match proofs and accuracy statistics for Teer Club predictions.",
  "url": "https://teer.club/jackpot"
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
      name: "Jackpot Proofs",
      item: "https://teer.club/jackpot",
    },
  ],
};

export default function JackpotPage() {
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
        <DarkHero
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Jackpot Proofs" }
          ]}
          title={
            <span dangerouslySetInnerHTML={{ __html: `Prediction <span class="text-amber-500">Accuracy</span>` }} />
          }
          badges={
            <HeroBadge variant="amber">Verified Trust Dashboard</HeroBadge>
          }
        >
          <p className="mt-4 text-sm md:text-base text-amber-100/80 leading-relaxed max-w-2xl font-medium">
            Transparent verification of our Teer target numbers against official results. We track every direct hit, house match, and ending match so you can trust the accuracy of our predictions.
          </p>
        </DarkHero>

        <TrafficGrid />

        <Section background="white" className="!py-8 lg:!py-14 bg-gray-50/50">
          <Container>
            <JackpotDashboard />
          </Container>
        </Section>
      </main>
    </PageLayout>
  );
}
