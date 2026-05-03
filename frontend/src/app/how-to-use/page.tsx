import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container } from "@/components/ui/Grid";
import { Button } from "@/components/ui/Button";
import { InlineAd } from "@/components/AdSlot";
import { TrafficGrid } from "@/components/layout/TrafficGrid";

export const metadata: Metadata = {
  title: "How to Use Teer.club — Your Complete Guide to Shillong Teer Results",
  description: "Learn how to check live Teer results, find dream numbers, and use number analytics on Teer.club. Step-by-step guide for Shillong, Khanapara, and Juwai Teer.",
  keywords: "how to use teer club, teer club guide, shillong teer results how to check, teer club tutorial",
  alternates: {
    canonical: "/how-to-use",
  },
};

const steps = [
  {
    icon: "📱",
    title: "Check Live Results",
    description: "Open the Live page to see real-time updates from all Teer games",
    link: "/live",
    linkLabel: "Go to Live Results",
    details: [
      "Results are organized by game name (Shillong, Khanapara, Juwai, etc.)",
      "🟢 Declared = Confirmed & verified result",
      "🟡 Waiting = Round hasn't been played yet",
      "🔴 Sunday Off = No games on Sundays",
      "FR = First Round, SR = Second Round",
      "Results auto-update — no need to refresh!",
    ],
  },
  {
    icon: "🔮",
    title: "Find Dream Numbers",
    description: "Use your dreams to find potential lucky numbers",
    link: "/dreams",
    linkLabel: "Browse Dream Numbers",
    details: [
      "Search your dream keyword (e.g., snake, water, fire)",
      "Each dream is linked to traditional Teer target numbers",
      "Click any dream for detailed meaning and analysis",
      "Dream numbers are based on cultural traditions, not predictions",
    ],
  },
  {
    icon: "📊",
    title: "Analyze Number History",
    description: "See how often any number (00-99) has appeared in results",
    link: "/number/00",
    linkLabel: "Explore Number Analytics",
    details: [
      "View total hits, FR hits, and SR hits for each number",
      "See the last date a number appeared",
      "Browse full history table of all appearances",
      "Navigate between numbers using the grid or arrow buttons",
    ],
  },
  {
    icon: "📋",
    title: "Browse Previous Results",
    description: "Access the complete history of all Teer results",
    link: "/results",
    linkLabel: "View Past Results",
    details: [
      "Select your game from the list",
      "Browse results sorted newest first",
      "Filter by date range for specific periods",
      "All data sourced from official counters",
    ],
  },
  {
    icon: "🎯",
    title: "Check Common Numbers",
    description: "See which numbers appear most frequently across games",
    link: "/common-numbers",
    linkLabel: "View Common Numbers",
    details: [
      "Updated daily with the latest frequency data",
      "Compare patterns across different Teer games",
      "Use alongside dream numbers for informed analysis",
    ],
  },
];

const faqs = [
  { q: "Is Teer.club free to use?", a: "Yes, completely free. No registration, no hidden charges." },
  { q: "How fast are results updated?", a: "Results are updated within minutes of the official declaration from the archery grounds." },
  { q: "Are the results verified?", a: "Yes. All results are cross-verified from multiple official sources before being published." },
  { q: "Can I embed Teer results on my website?", a: "Yes! Visit our Widget page to get a free embeddable Teer results widget." },
  { q: "Does the app work on mobile?", a: "Yes, Teer.club is built mobile-first. It works perfectly on all phones, tablets, and desktops." },
  { q: "How do I get notifications for new results?", a: "Enable push notifications when prompted. You'll get instant alerts when new results are declared." },
];

export default function HowToUsePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Use Teer.club",
    description: "A complete guide to checking live Teer results, finding dream numbers, and using number analytics on Teer.club.",
    step: steps.map((step, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      name: step.title,
      text: step.description,
    })),
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 bg-surface">
        {/* Breadcrumb */}
        <div className="border-b border-gray-100 bg-white">
          <Container>
            <div className="py-4 flex gap-2 text-sm font-semibold text-gray-500">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <span className="text-gray-900">How to Use</span>
            </div>
          </Container>
        </div>

        {/* Hero */}
        <Section background="white" className="!py-16 md:!py-24 border-b border-gray-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
          <Container className="text-center max-w-4xl mx-auto">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary bg-blue-50 border border-blue-100">
                User Guide
              </span>
            </div>
            <h1 className="mb-6 text-3xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
              How to Use <span className="text-primary">Teer.club</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg font-medium text-gray-500 leading-relaxed">
              Your complete guide to checking live Teer results, finding dream numbers,
              and analyzing number history across Shillong, Khanapara, and Juwai Teer.
            </p>
          </Container>
        </Section>

        <TrafficGrid />

        {/* What is Teer.club */}
        <Section background="gray" className="!py-16">
          <Container className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What is Teer.club?</h2>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p>
                  <strong>Teer.club</strong> is India&apos;s fastest and most trusted platform for checking
                  live Teer results from Meghalaya and Assam. We provide real-time updates for
                  <strong> Shillong Teer</strong>, <strong>Khanapara Teer</strong>,{" "}
                  <strong>Juwai Teer</strong>, <strong>Laitlyngkot Teer</strong>, and more —
                  directly from the official archery counters.
                </p>
                <p>
                  Beyond live results, Teer.club offers <strong>dream number interpretations</strong>,{" "}
                  <strong>number frequency analytics</strong>, and{" "}
                  <strong>historical result archives</strong> — everything you need in one place,
                  completely free.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        {/* Step-by-step Guide */}
        <Section background="white" className="!py-16 md:!py-24">
          <Container className="max-w-4xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Step-by-Step <span className="text-primary">Guide</span>
              </h2>
            </div>

            <div className="space-y-8">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow p-6 md:p-8"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl border border-blue-100">
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                          Step {idx + 1}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-500 font-medium mb-4">{step.description}</p>

                      <ul className="space-y-2 mb-6">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={step.link}
                        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-blue-700 transition-colors"
                      >
                        {step.linkLabel}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Mobile Tips */}
        <Section background="gray" className="!py-16 md:!py-20">
          <Container className="max-w-3xl mx-auto">
            <div className="bg-[#111827] rounded-3xl p-8 md:p-12 text-white">
              <h2 className="text-2xl font-bold mb-6">📱 Mobile Usage Tips</h2>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-black text-lg">1.</span>
                  <div>
                    <p className="font-bold text-white">Add to Home Screen</p>
                    <p className="text-sm">Open teer.club in Chrome → Tap ⋮ → &quot;Add to Home Screen&quot;. This gives you app-like instant access.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-black text-lg">2.</span>
                  <div>
                    <p className="font-bold text-white">Enable Notifications</p>
                    <p className="text-sm">Get alerted the moment new results are declared. Never miss a result again.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-black text-lg">3.</span>
                  <div>
                    <p className="font-bold text-white">Use the Mobile Menu</p>
                    <p className="text-sm">Tap the ☰ icon in the top-right corner to access all pages including Dreams, Common Numbers, and Results.</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* FAQ */}
        <Section background="white" className="!py-16 md:!py-24">
          <Container className="max-w-3xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Frequently Asked <span className="text-primary">Questions</span>
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
                >
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-500 text-sm font-medium">{faq.a}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Ad Slot */}
        <InlineAd />

        {/* CTA */}
        <Section background="dark" className="!py-20 bg-[#111827]">
          <Container className="text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-6">
              Ready to Check <span className="text-blue-400">Today&apos;s Results</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of Teer players who trust Teer.club for the fastest, most accurate results.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/live" variant="primary" className="!px-10 !py-4 shadow-xl">
                Check Live Results
              </Button>
              <Button href="/dreams" variant="secondary" className="!px-10 !py-4 bg-white/5 border-white/10 text-white hover:bg-white/10">
                Dream Numbers
              </Button>
            </div>
          </Container>
        </Section>
      </main>
    </PageLayout>
  );
}
