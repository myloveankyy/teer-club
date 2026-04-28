import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container, Grid } from "@/components/ui/Grid";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Teer Guide – Learn How Teer Game Works",
  description:
    "Complete beginner guide explaining what Teer game is, how Teer results are calculated, and how players choose numbers from 00 to 99.",
  keywords: [
    "Teer Game",
    "Shillong Teer",
    "Teer Result",
    "Teer Rules",
    "How to play Teer",
    "Teer guide",
  ],
  alternates: {
    canonical: "/teer-guide",
  },
  openGraph: {
    title: "Teer Guide – Learn How Teer Game Works",
    description:
      "Complete beginner guide explaining what Teer game is, how Teer results are calculated, and how players choose numbers.",
    type: "article",
    locale: "en_US",
    siteName: "Teer Club",
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Complete Guide to Teer Game",
  description:
    "Learn how the traditional Teer archery game works, how results are calculated, and how players choose numbers from 00 to 99.",
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
      name: "What is Teer game?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Teer is a traditional archery-based lottery game played mainly in Meghalaya, India. Instead of using machines or balls, archers shoot arrows at a target and players bet on numbers between 00 and 99 based on the arrow count.",
      },
    },
    {
      "@type": "Question",
      name: "How are Teer results calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After archers shoot arrows at the target, all arrows hitting the target are counted. The last two digits of the total become the winning number. For example, if 845 arrows hit the target, the result is 45.",
      },
    },
    {
      "@type": "Question",
      name: "What numbers can be played in Teer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Players can choose any number from 00 to 99 in Teer. Each number has equal probability of winning based on the arrow count.",
      },
    },
    {
      "@type": "Question",
      name: "How many rounds are there in Teer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Teer has two rounds every day - First Round (FR) and Second Round (SR). Results are announced twice daily, usually around 4:00 PM and 4:30 PM for Shillong Teer.",
      },
    },
    {
      "@type": "Question",
      name: "Where can I check live Teer results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can check live Teer results on Teer.club. We update results as soon as they are announced for all major games including Shillong, Khanapara, and Juwai.",
      },
    },
  ],
};

const steps = [
  {
    step: 1,
    title: "Choose a Number",
    description: "Select any number from 00 to 99 before the archery rounds begin.",
  },
  {
    step: 2,
    title: "Archers Shoot Arrows",
    description: "Trained archers shoot arrows at a traditional target during the scheduled rounds.",
  },
  {
    step: 3,
    title: "Arrows Counted",
    description: "All arrows that hit the target are carefully counted by officials.",
  },
  {
    step: 4,
    title: "Result Declared",
    description: "The last two digits of the total arrow count become the winning number.",
  },
];

const games = [
  {
    name: "Shillong Teer",
    location: "Meghalaya",
    resultTime: "4:00 PM – 4:30 PM",
    href: "/results/shillong/live",
  },
  {
    name: "Khanapara Teer",
    location: "Assam",
    resultTime: "4:00 PM – 4:30 PM",
    href: "/results/khanapara/live",
  },
  {
    name: "Juwai Teer",
    location: "Meghalaya",
    resultTime: "3:00 PM – 3:30 PM",
    href: "/results/juwai/live",
  },
  {
    name: "Laitlyngkot Teer",
    location: "Meghalaya",
    resultTime: "4:30 PM – 5:00 PM",
    href: "/results/laitlyngkot/live",
  },
];

export default function TeerGuidePage() {
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
        <Section background="white" className="!py-20 md:!py-32 border-b border-gray-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
          <Container className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-[#111827] text-white shadow-2xl shadow-gray-200">
                <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mb-6 text-4xl font-black tracking-tight text-[#111827] sm:text-7xl uppercase tracking-tighter leading-none">
              Teer <span className="text-primary">Guide</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-[#6b7280] leading-relaxed">
              Simple explanation of how the traditional archery-based teer game works.
              Learn how the numbers are counted and get the daily schedule.
            </p>
            <Button
              href="/live"
              variant="primary"
              className="!px-10 !py-4 text-base shadow-2xl shadow-blue-100"
            >
              Watch Live Results
            </Button>
          </Container>
        </Section>

        {/* Discovery Section */}
        <Section className="!py-24">
          <Container>
            <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                <div className="mb-4">
                  <Badge variant="info">OVERVIEW</Badge>
                </div>
                <h2 className="text-4xl font-black text-[#111827] uppercase tracking-tighter leading-none">
                  How it Works?
                </h2>
              </div>

              <Card className="!p-10 !rounded-[3rem] bg-gray-50/50 border-gray-100 shadow-2xl shadow-gray-100/50">
                <p className="mb-8 text-xl font-medium leading-relaxed text-[#111827]">
                  <strong className="text-primary uppercase tracking-widest text-xs block mb-2 font-black">About Teer</strong>
                  Teer is a traditional archery-based game popular in Northeast India.
                  Unlike digital lotteries, Teer results are based on actual arrows hitting a target.
                </p>
                <div className="mb-10 flex flex-wrap gap-3">
                  <Badge variant="neutral" className="px-4 py-2 text-[10px]">ARCHERY-BASED</Badge>
                  <Badge variant="neutral" className="px-4 py-2 text-[10px]">POPULAR GAME</Badge>
                  <Badge variant="neutral" className="px-4 py-2 text-[10px]">TWO ROUNDS DAILY</Badge>
                  <Badge variant="neutral" className="px-4 py-2 text-[10px]">OFFICIAL COUNTING</Badge>
                </div>
                <div className="rounded-[2rem] bg-white p-8 border border-gray-100 shadow-sm">
                  <p className="mb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Example Calculation</p>
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Total Arrows</p>
                      <p className="text-3xl font-black text-[#111827]">845 <span className="text-xs text-gray-400">ARROWS</span></p>
                    </div>
                    <div className="text-3xl text-gray-200 hidden sm:block">→</div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-[10px] font-black text-primary uppercase mb-1">Winning Number</p>
                      <p className="text-3xl font-black text-primary tracking-tighter">NUMBER 45</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </Section>

        {/* Process Section */}
        <Section background="gray" className="!py-24 border-y border-gray-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
          <Container>
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-black text-[#111827] uppercase tracking-tighter leading-none mb-4">
                How it <span className="text-primary">Works</span>
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Four stages of how results are announced</p>
            </div>

            <Grid cols={4}>
              {steps.map((item) => (
                <Card
                  key={item.step}
                  className="!p-8 !rounded-[2.5rem] bg-white border-transparent hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 group transition-all duration-500"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111827] text-white font-black text-xl mb-6 shadow-xl shadow-gray-200 group-hover:bg-primary group-hover:shadow-blue-200 transition-all">
                    {item.step}
                  </div>
                  <h3 className="mb-3 text-lg font-black text-[#111827] uppercase tracking-tight">{item.title}</h3>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">{item.description}</p>
                </Card>
              ))}
            </Grid>
          </Container>
        </Section>

        {/* Market Matrix */}
        <Section className="!py-24" background="white">
          <Container>
            <div className="mx-auto max-w-4xl">
              <div className="mb-16 text-center">
                <h2 className="text-4xl font-black text-[#111827] uppercase tracking-tighter leading-none mb-4">
                  Game <span className="text-primary">Schedule</span>
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Official regional game timings</p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {games.map((market) => (
                  <Link
                    key={market.name}
                    href={market.href}
                    className="group rounded-[2.5rem] border border-gray-100 bg-white p-8 transition-all hover:bg-gray-50 hover:shadow-2xl hover:shadow-blue-900/5"
                  >
                    <h3 className="mb-1 text-xl font-black text-[#111827] uppercase tracking-tighter group-hover:text-primary">
                      {market.name}
                    </h3>
                    <p className="mb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{market.location}</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                      <Badge variant="info" className="px-3 py-1 font-black text-[10px]">{market.resultTime}</Badge>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Full History →</span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-16 p-8 rounded-[2.5rem] border border-blue-100 bg-blue-50/30 flex items-start gap-4">
                <div className="h-10 w-10 flex-shrink-0 bg-blue-100 text-primary rounded-full flex items-center justify-center">ℹ️</div>
                <div>
                  <p className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Time Variance</p>
                  <p className="text-sm font-medium text-blue-800/60 leading-relaxed">
                    Note: Result times are based on local archery schedules. Juwai teer results are typically announced earlier than Shillong teer.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* CTA Section */}
        <Section background="dark" className="!py-24 bg-[#111827] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <Container className="text-center relative z-10">
            <h2 className="mb-6 text-4xl font-black tracking-tight text-white uppercase tracking-tighter leading-none sm:text-6xl">
              Check <span className="text-blue-500">Live Result</span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-gray-400">
              Access real-time live results, historical data, and expert common numbers on our dashboard.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                href="/live"
                variant="primary"
                className="!px-12 !py-5 shadow-2xl shadow-blue-500/20"
              >
                Watch Live Result
              </Button>
              <Button
                href="/common-numbers"
                variant="secondary"
                className="!px-12 !py-5 bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Common Numbers
              </Button>
            </div>
          </Container>
        </Section>
      </main>
    </PageLayout>
  );
}
