import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container, Grid } from "@/components/ui/Grid";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DreamNumberSearch } from "@/components/DreamNumberSearch";
import { dreamNumbersData } from "@/data/dreamNumbers";

export const metadata: Metadata = {
  title: "Teer Dream Numbers List | Dream Meaning Numbers for Teer",
  description:
    "Find dream numbers used in Teer games including snake, water, fire, marriage and more. Search dream meanings and corresponding Teer numbers.",
  keywords: [
    "Dream Numbers Teer",
    "Teer Dream Numbers List",
    "Teer Lucky Numbers",
    "Teer Dream Meaning Numbers",
    "Teer dream numbers",
    "dream meaning Teer",
  ],
  openGraph: {
    title: "Teer Dream Numbers List | Dream Meaning Numbers for Teer",
    description:
      "Find dream numbers used in Teer games. Search dream meanings and corresponding Teer numbers.",
    type: "article",
    locale: "en_US",
    siteName: "Teer Club",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Teer Dream Numbers Guide",
  description:
    "Find the Teer numbers associated with dreams, symbols, and daily life events used by Teer players.",
  author: {
    "@type": "Organization",
    name: "Teer.club",
  },
  publisher: {
    "@type": "Organization",
    name: "Teer.club",
    url: "https://teer.club",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are Teer dream numbers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Teer dream numbers are traditional interpretations where specific dreams or daily life events are associated with numbers from 00 to 99 used in Teer games.",
      },
    },
    {
      "@type": "Question",
      name: "How do dream numbers work in Teer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Players interpret their dreams or events and match them to traditional number associations. For example, dreaming about a snake is traditionally associated with numbers 12 or 45.",
      },
    },
    {
      "@type": "Question",
      name: "Are dream numbers guaranteed to win?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, dream numbers are based on traditional beliefs and superstitions. They are not guaranteed predictions and should be used as reference only.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I check daily common numbers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can check daily common numbers on our /common-numbers page. We update predictions every day before results are announced.",
      },
    },
    {
      "@type": "Question",
      name: "Can I search dream meanings on Teer.club?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, you can use the search feature on this page to find dream numbers. Simply type your dream or event to see the associated Teer numbers.",
      },
    },
  ],
};

const popularDreams = [
  { dream: "Snake", numbers: ["12", "45"], icon: "🐍" },
  { dream: "Water", numbers: ["16", "32"], icon: "💧" },
  { dream: "Marriage", numbers: ["20", "25"], icon: "💒" },
  { dream: "Fire", numbers: ["08", "29"], icon: "🔥" },
  { dream: "Fish", numbers: ["15", "27"], icon: "🐟" },
  { dream: "Money", numbers: ["20", "55"], icon: "💰" },
  { dream: "Elephant", numbers: ["06", "60"], icon: "🐘" },
  { dream: "Baby", numbers: ["01", "11"], icon: "👶" },
];

const tips = [
  {
    title: "Combine with Common Numbers",
    description:
      "Check dream numbers together with our daily common numbers for better reference.",
  },
  {
    title: "Review Previous Results",
    description:
      "Look at past result patterns to understand how certain numbers have performed.",
  },
  {
    title: "Use as Reference Only",
    description:
      "Dream numbers are based on traditional beliefs and should not be considered as guaranteed predictions.",
  },
  {
    title: "Play Responsibly",
    description:
      "Always play within your means and treat Teer as entertainment, not a source of income.",
  },
];

export default function DreamNumbersPage() {
  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="flex-1">
        {/* Hero Section */}
        <Section background="white" className="!py-16 md:!py-24 border-b border-gray-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
          <Container className="text-center">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary bg-blue-50 border border-blue-100">
                Traditional Interpretation
              </span>
            </div>
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl leading-tight">
              Teer <span className="text-primary">Dream Numbers</span> Guide
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-base font-medium text-gray-600 md:text-lg leading-relaxed">
              Find the connection between your dreams and Teer winning numbers. We maintain a verified list of traditional dream-to-number associations for enthusiasts.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="/common-numbers"
                variant="primary"
                className="!px-10 !py-4 text-base shadow-2xl shadow-blue-100"
              >
                View Live Results
              </Button>
            </div>
          </Container>
        </Section>

        {/* Search Section */}
        <Section className="!py-24" background="gray">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-none mb-4">
                  Search <span className="text-primary">Dream Meanings</span>
                </h2>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Find associated numbers for your dreams</p>
              </div>
              <Card className="!p-8 !rounded-[3rem] bg-white shadow-2xl shadow-gray-200/50 border-gray-100">
                <DreamNumberSearch />
              </Card>
            </div>
          </Container>
        </Section>

        {/* Popular Section */}
        <Section className="!py-24" background="white">
          <Container>
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-none mb-4">
                Popular <span className="text-primary">Dream Meanings</span>
              </h2>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Most searched Teer dream associations</p>
            </div>

            <Grid cols={4}>
              {popularDreams.map((item) => (
                <Card
                  key={item.dream}
                  className="!p-8 !rounded-[2.5rem] bg-gray-50/10 border-gray-100/50 hover:border-blue-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500"
                >
                  <div className="mb-6 text-4xl">{item.icon}</div>
                  <h3 className="mb-3 text-lg font-bold text-gray-900 tracking-tight">{item.dream}</h3>
                  <div className="mt-4 flex gap-2">
                    {item.numbers.map((num) => (
                      <span
                        key={num}
                        className="inline-flex h-10 w-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-blue-200"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </Grid>
          </Container>
        </Section>

        {/* Master List Section */}
        <Section className="!py-24" background="gray">
          <Container>
            <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-none mb-4">
                  Full <span className="text-primary">List</span>
                </h2>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alphabetical list of Teer dream meanings</p>
              </div>

              <Card className="!p-0 !rounded-[3rem] overflow-hidden border-gray-100 shadow-2xl">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-[#111827] text-white">
                      <tr>
                        <th className="px-8 py-6 text-xs font-semibold uppercase tracking-wider">Dream Meaning</th>
                        <th className="px-8 py-6 text-xs font-semibold uppercase tracking-wider text-right">Teer Numbers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {dreamNumbersData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-8 py-4 text-sm font-bold text-[#111827] uppercase tracking-tight">{item.dream}</td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              {item.numbers.map((num) => (
                                <span
                                  key={num}
                                  className="inline-flex h-8 w-10 items-center justify-center rounded-lg bg-gray-50 text-xs font-black text-gray-400"
                                >
                                  {num}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </Container>
        </Section>

        {/* Intelligence Section */}
        <Section background="white" className="!py-24">
          <Container>
            <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-primary bg-blue-50 px-3 py-1 rounded-full">HOW IT WORKS</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-none">
                  Traditional <span className="text-primary">Meanings</span>
                </h2>
              </div>
              <Card className="!p-10 !rounded-[3rem] bg-gray-900 text-white border-transparent shadow-2xl shadow-gray-200">
                <p className="mb-10 text-lg md:text-xl font-medium leading-relaxed text-gray-300 italic">
                  <strong className="text-blue-400 uppercase tracking-widest text-xs block mb-4 font-bold">About Dream Numbers</strong>
                  Teer players often use their dreams to find potential lucky numbers.
                  This tool helps you find connections between traditional beliefs and archery results.
                </p>
                <div className="grid gap-6 sm:grid-cols-2">
                  {tips.map((tip, idx) => (
                    <div key={idx} className="p-6 rounded-3xl bg-white/5 border border-white/5">
                      <h4 className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">{tip.title}</h4>
                      <p className="text-sm font-medium text-gray-400">{tip.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 rounded-[2rem] bg-primary/10 border border-blue-600/20 flex items-start gap-4">
                  <span className="text-blue-500 text-2xl">ℹ️</span>
                  <p className="text-sm font-medium text-gray-400 leading-relaxed">
                    <strong className="text-white">Note:</strong> Dream numbers are based on traditional cultural beliefs.
                    They do not represent guaranteed results and should be used as reference only.
                  </p>
                </div>
              </Card>
            </div>
          </Container>
        </Section>

        {/* Global CTA */}
        <Section background="dark" className="!py-24 bg-gray-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2" />
          <Container className="text-center relative z-10">
            <h2 className="mb-8 text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Ready for <span className="text-blue-500">Live Results</span>?
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="/live"
                variant="primary"
                className="!px-12 !py-5 shadow-2xl shadow-blue-500/20"
              >
                Check Live Results
              </Button>
              <Button
                href="/common-numbers"
                variant="secondary"
                className="!px-12 !py-5 bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Daily Targets
              </Button>
            </div>
          </Container>
        </Section>
      </main>
    </PageLayout>
  );
}
