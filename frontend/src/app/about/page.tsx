import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Teer.club | Teer Result Website",
  description:
    "Learn about Teer.club – a fast and reliable website to check Shillong Teer, Khanapara Teer, and Juwai Teer live results, previous results, and common numbers.",
  keywords: [
    "Teer Result",
    "Shillong Teer Result",
    "Khanapara Teer Result",
    "Teer Live Result",
    "Teer Common Numbers",
    "Teer website",
  ],
  openGraph: {
    title: "About Teer.club",
    description: "Fast and reliable Teer results website for major markets.",
    type: "website",
    locale: "en_US",
    siteName: "Teer Club",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "WebSite"],
  name: "Teer.club",
  description: "Fast and reliable Teer results website",
  url: "https://teer.club",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Shillong Teer Result time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Shillong Teer first round result is announced at 4:00 PM and second round at 4:30 PM IST daily.",
      },
    },
    {
      "@type": "Question",
      name: "How many rounds are in Teer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Teer has two rounds daily - First Round (FR) and Second Round (SR). Results are announced twice every day.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I check Teer live results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can check live Teer results on our website at /live. We update results as soon as they are announced.",
      },
    },
    {
      "@type": "Question",
      name: "What are common numbers in Teer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Common numbers are predicted numbers that appear frequently based on historical patterns. We provide free daily common numbers.",
      },
    },
    {
      "@type": "Question",
      name: "Is Teer.club free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Teer.club is completely free to use. All features including live results, previous results, and common numbers are available at no cost.",
      },
    },
  ],
};

const features = [
  {
    title: "Fast Result Updates",
    description: "Results are updated immediately after official announcement",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Accurate Result Data",
    description: "All numbers are sourced directly from official Teer counters",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Mobile Friendly Design",
    description: "Easy to use on any device, anytime, anywhere",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Daily Common Numbers",
    description: "Free predictions updated every day before results",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Previous Results History",
    description: "Browse past results for all markets anytime",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Simple & Clean Interface",
    description: "No clutter, no confusion, just results",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
];

const markets = [
  { name: "Shillong Teer", location: "Meghalaya", frTime: "4:00 PM", srTime: "4:30 PM" },
  { name: "Khanapara Teer", location: "Assam", frTime: "4:00 PM", srTime: "4:30 PM" },
  { name: "Juwai Teer", location: "Meghalaya", frTime: "3:00 PM", srTime: "3:30 PM" },
  { name: "Laitlyngkot Teer", location: "Meghalaya", frTime: "4:30 PM", srTime: "5:00 PM" },
];

const faqs = [
  {
    question: "What is Shillong Teer Result time?",
    answer: "Shillong Teer first round result is announced at 4:00 PM and second round at 4:30 PM IST daily. Results are updated immediately after official announcement.",
  },
  {
    question: "How many rounds are in Teer?",
    answer: "Teer has two rounds daily - First Round (FR) and Second Round (SR). Each market announces results twice every day at their scheduled times.",
  },
  {
    question: "Where can I check Teer live results?",
    answer: "You can check live Teer results on our website. Simply visit the /live page for today's results or /results for previous results history.",
  },
  {
    question: "What are common numbers in Teer?",
    answer: "Common numbers are predicted numbers that appear frequently based on historical patterns and analysis. We provide free daily common numbers including direct numbers, house numbers, and ending numbers.",
  },
  {
    question: "Is Teer.club free to use?",
    answer: "Yes, Teer.club is completely free to use. All features including live results, previous results, common numbers, and match proof are available at no cost.",
  },
];

import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container, Grid } from "@/components/ui/Grid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Section background="gray" className="!py-16 md:!py-24 border-b border-gray-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <SectionHeader
              title="About Teer.club"
              subtitle="The definitive source for Teer analytics, live results, and historical archives across North-East India."
              badge="Our Mission"
              centered={true}
            />
            <div className="flex justify-center gap-4">
              <Button variant="primary" href="/live" className="!px-10 !py-4 text-base">
                View Live Results
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="white" className="!py-16 md:!py-24">
        <Container>
          <div className="mb-20 text-center">
            <SectionHeader
              title="What is the Teer Game?"
              subtitle="Rooted in tribal traditions of Meghalaya, Teer is where ancient skill meets modern results."
              centered={true}
            />
          </div>

          <Grid cols={2} className="gap-8">
            <Card className="p-10 !rounded-[2.5rem] bg-gray-50/50 border-gray-100/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-blue-100 opacity-20">
                <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900 tracking-tight">The Mechanism</h3>
              <p className="text-base font-medium text-gray-600 leading-relaxed relative z-10">
                Players pick numbers from 00 to 99 based on the count of arrows hitting the target during professional archery rounds.
              </p>
              <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Two Rounds Daily</span>
              </div>
            </Card>

            <Card className="p-10 !rounded-[2.5rem] bg-gray-50/50 border-gray-100/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-emerald-100 opacity-20">
                <svg className="h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900 tracking-tight">Result Calculation</h3>
              <p className="text-base font-medium text-gray-600 leading-relaxed relative z-10">
                The winning numbers are derived from the total arrows. If 845 arrows hit the target, the winning number is 45.
              </p>
              <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Verified Outcomes</span>
              </div>
            </Card>
          </Grid>
        </Container>
      </Section>

      <Section background="gray" className="!py-20 lg:!py-24 border-y border-gray-100">
        <Container>
          <div className="mb-16 text-center">
            <SectionHeader
              title="Platform Advantages"
              subtitle="Why millions of players trust Teer.club for their daily results and analysis."
              centered={true}
            />
          </div>

          <Grid cols={3} className="gap-6">
            {features.map((feature) => (
              <Card key={feature.title} hover={true} className="p-8 !rounded-3xl border-transparent hover:border-blue-100 group transition-all duration-300">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-primary transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 tracking-tight">{feature.title}</h3>
                <p className="text-sm font-medium text-gray-500 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section background="white" className="!py-20 lg:!py-24">
        <Container>
          <div className="mb-16 text-center">
            <SectionHeader
              title="Covered Teer Markets"
              subtitle="Comprehensive coverage across all major North-Eastern regulatory zones."
              centered={true}
            />
          </div>

          <Grid cols={4} className="gap-4">
            {markets.map((market) => (
              <Card key={market.name} className="p-6 !rounded-2xl border-gray-100 hover:border-blue-100 hover:shadow-xl transition-all duration-500">
                <h3 className="mb-1 text-base font-bold text-gray-900 tracking-tight">{market.name}</h3>
                <p className="mb-4 text-[10px] font-bold text-primary uppercase tracking-wider">{market.location}</p>
                <div className="space-y-3 pt-4 border-t border-gray-50">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-400">FR Schedule</span>
                    <span className="font-bold text-gray-900">{market.frTime}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-400">SR Schedule</span>
                    <span className="font-bold text-gray-900">{market.srTime}</span>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </Container>
      </Section>

      <Section background="dark" className="!py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />
        <Container className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-h1 text-white leading-tight">
              Trust & Reliability
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-base md:text-lg font-medium text-gray-400 leading-relaxed">
              Serving millions of daily requests with sub-second latency and verified data integrity for enthusiast players worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-white">Daily Results</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-white">Verified Data</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-white">Live Feed</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section background="white" className="!py-16 md:!py-24">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <SectionHeader
                title="Knowledge Base"
                subtitle="Frequently asked questions about our platform and the Teer results ecosystem."
                centered={true}
              />
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx} className="!p-0 !rounded-3xl border-gray-100 overflow-hidden hover:border-blue-100 transition-all duration-300">
                  <details className="group">
                    <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-gray-900 tracking-tight text-lg list-none">
                      {faq.question}
                      <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-gray-50 group-open:bg-blue-600 group-open:text-white transition-all duration-300">
                        <svg className="h-5 w-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </summary>
                    <div className="px-8 pb-8 text-base font-medium text-gray-600 leading-relaxed border-t border-gray-50 pt-6">
                      {faq.answer}
                    </div>
                  </details>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
}
