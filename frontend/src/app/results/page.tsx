import type { Metadata } from "next";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container } from "@/components/ui/Grid";
import { Button } from "@/components/ui/Button";
import { ResultsList } from "@/components/ResultsList";

export const metadata: Metadata = {
  title: "Previous Teer Results | Shillong Khanapara Juwai Teer Result History",
  description:
    "Browse previous Teer results for Shillong, Khanapara, Juwai and other Teer games. Check historical winning numbers and past results.",
  keywords: [
    "previous Teer results",
    "past Teer results",
    "Teer result history",
    "Shillong Teer previous result",
    "Khanapara Teer previous result",
    "Teer archives",
  ],
  alternates: {
    canonical: "https://teer.club/results",
  },
  openGraph: {
    title: "Previous Teer Results",
    description: "Browse historical Teer results for all games.",
    type: "website",
    locale: "en_US",
    siteName: "Teer Club",
  },
  twitter: {
    card: "summary_large_image",
    title: "Previous Teer Results",
    description: "Historical Teer results.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Previous Teer Results",
  description: "Historical Teer results for all games",
  url: "https://teer.club/results",
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
      name: "Previous Results",
      item: "https://teer.club/results",
    },
  ],
};

import { PlayLiveWidget } from "@/components/PlayLiveWidget";

export default function ResultsPage() {
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
        {/* Hero Section */}
        <Section background="white" className="!py-16 md:!py-24 border-b border-gray-100 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden">
          <Container>
            <div className="flex flex-col gap-16 md:flex-row md:items-center md:justify-between py-8">
              <div className="flex-1 text-center md:text-left max-w-2xl px-4 md:px-0">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-primary bg-primary/5 border border-primary/10 shadow-sm transition-all hover:scale-105">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Official Archives
                </div>
                <h1 className="mb-6 text-h1 text-gray-900 leading-tight">
                  Previous <span className="text-primary">Teer Results</span>
                </h1>
                <p className="mx-auto md:mx-0 mb-10 max-w-2xl text-base font-medium text-gray-500 md:text-lg leading-relaxed">
                  Explore Shillong, Khanapara, and Juwai historical Teer results.
                  We provide 100% verified records for all regional teer games.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <Button
                    href="/live"
                    variant="primary"
                    className="!px-8 !py-3.5 !rounded-2xl text-sm font-bold shadow-xl shadow-primary/20"
                  >
                    Watch Live Results
                  </Button>
                  <Button
                    href="/common-numbers"
                    variant="secondary"
                    className="!px-8 !py-3.5 !rounded-2xl text-sm font-bold"
                  >
                    Common Numbers
                  </Button>
                </div>
              </div>

              <div className="w-full md:w-auto flex justify-center md:block">
                <PlayLiveWidget
                  image="/images/teer-results-board.png"
                  title="Official Teer Archives"
                  subtitle="Explore the complete historical database of verified Shillong, Khanapara, and Juwai numbers."
                  badgeText="Archive"
                  buttonText="Share Results"
                  showVideoIcon={false}
                  isUppercase={false}
                />
              </div>
            </div>
          </Container>
        </Section>

        {/* Results List Section */}
        <Section className="!py-16 md:!py-20" background="gray">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
                <div>
                  <h2 className="text-h2 text-foreground tracking-tight font-bold">Latest Results</h2>
                  <p className="mt-1 text-xs font-semibold text-foreground/40 tracking-normal">Showing results for all games today</p>
                </div>
              </div>
              <ResultsList />
            </div>
          </Container>
        </Section>
      </main>
    </PageLayout>
  );
}
