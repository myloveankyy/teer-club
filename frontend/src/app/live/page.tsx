import type { Metadata } from "next";
import api from "@/lib/api";
import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section } from "@/components/ui/Grid";
import { FAQ } from "@/components/FAQ";
import { Button } from "@/components/ui/Button";
import { LiveResultsClient } from "./LiveResultsClient";
import Link from "next/link";

export const revalidate = 10; // ISR: Revalidate every 10 seconds

export const metadata: Metadata = {
  title: "Live Teer Result Today | Official Shillong, Khanapara, Juwai Results",
  description: "Get the fastest live Teer Result Today for Shillong, Khanapara, and Juwai. Real-time archery result updates with official data synchronization.",
  keywords: ["live teer result today", "Shillong teer live result", "Khanapara teer result live", "Juwai teer results"],
  alternates: {
    canonical: "https://teer.club/live",
  },
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
      name: "Live Results",
      item: "https://teer.club/live",
    },
  ],
};

export default async function LiveResultsPage() {
  let initialData = null;
  let settings = undefined;

  try {
    const [resultsRes, settingsRes] = await Promise.all([
      api.results.getToday(),
      api.settings.get()
    ]);

    if (resultsRes.data.success) {
      initialData = resultsRes.data;
    }
    if (settingsRes.data.success) {
      settings = settingsRes.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch initial data for /live page:", err);
  }

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="flex-1 bg-surface">
        {/* Minimal Header Section */}
        <Section background="white" className="!py-20 border-b border-border/50 bg-[radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:32px_32px]">
          <Container className="text-center">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 inline-flex">
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Live Results Today
                </span>
              </div>
              <h1 className="mb-6 text-h1 text-gray-900 leading-[1.1] tracking-tightest">
                Live <span className="text-primary italic">Teer Result</span> Today
              </h1>
              <p className="mx-auto max-w-2xl text-body text-gray-500 leading-relaxed font-medium">
                Shillong, Khanapara, Jowai & All Teer Games Live Updates. Real-time synchronization with official archery counters.
              </p>
            </div>
          </Container>
        </Section>

        {/* Main Results Grid */}
        <Section background="gray" className="!py-16 lg:!py-28">
          <Container>
            <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-border/50 pb-8">
              <div className="max-w-xl">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight uppercase mb-2">
                  Live Teer <span className="text-primary">Results</span> Today
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">
                  Real-time updates from official counters
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" href="/results" className="text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded-lg border-border bg-white hover:bg-gray-50 shadow-sm transition-all">
                  Archives
                </Button>
              </div>
            </div>

            {/* Client-side components handle real-time logic */}
            <LiveResultsClient initialData={initialData} settings={settings} />
          </Container>
        </Section>

        {/* SEO Content Section */}
        <Section background="white" className="!py-24 border-t border-border/50">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-16 lg:grid-cols-2 items-start">
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">How to Check Live Teer Results</h2>
                    <div className="text-body text-gray-500 space-y-4">
                      <p>
                        Our platform uses a direct connection system with official association counters. This ensures you see the <strong className="text-gray-900">live teer result today</strong> before most other platforms.
                      </p>
                      <p>
                        Results are declared in two rounds: <strong>First Round (FR)</strong> and <strong>Second Round (SR)</strong>. Once both rounds are verified, they are archived for historical reference.
                      </p>
                    </div>
                  </div>
                  <div className="p-8 rounded-3xl bg-gray-50 border border-border">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Today&apos;s Teer Overview</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Verified Shillong Teer Result
                      </li>
                      <li className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Instant Khanapara Result Today
                      </li>
                      <li className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Live Juwai Teer Updates
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Optimized Performance & Accuracy</h2>
                  <div className="text-body text-gray-500 space-y-6">
                    <p>
                      We prioritize <em className="text-primary italic">Live Result Status</em> accuracy above everything else. Our system handles data fetching from official sources with extreme reliability.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="p-6 rounded-2xl bg-white border border-border">
                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Latency</span>
                        <span className="text-2xl font-black text-gray-900 tracking-tighter">&lt; 100ms</span>
                      </div>
                      <div className="p-6 rounded-2xl bg-white border border-border">
                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Uptime</span>
                        <span className="text-2xl font-black text-gray-900 tracking-tighter">99.9%</span>
                      </div>
                    </div>
                    <p>
                      Whether you are waiting for the <strong className="text-gray-900">Shillong teer result live</strong> or checking the <strong className="text-gray-900">Khanapara teer result today</strong>, our platform provides the most reliable data.
                    </p>
                    <p className="text-sm pt-4 border-t border-gray-100">
                      Official results provided for educational and analytic purposes. View our <Link href="/disclaimer" className="text-primary hover:underline">Disclaimer</Link> for more information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <FAQ />
      </main>
    </PageLayout>
  );
}
