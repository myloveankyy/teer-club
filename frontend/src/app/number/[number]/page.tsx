import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section } from "@/components/ui/Grid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { DarkHero, HeroBadge } from "@/components/layout/DarkHero";
import { TrafficGrid } from "@/components/layout/TrafficGrid";
import api from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { InlineAd } from "@/components/AdSlot";

export const revalidate = 3600; // Cache for 1 hour

interface Props {
  params: Promise<{ number: string }>;
}

// Pre-build all 100 number pages at build time for 0ms latency
export async function generateStaticParams() {
  return Array.from({ length: 100 }, (_, i) => ({
    number: String(i).padStart(2, "0"),
  }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const number = (await params).number;
  if (!number || number.length !== 2 || isNaN(Number(number))) {
    return { title: "Not Found" };
  }

  const defaultUrl = `/number/${number}`;
  let pageData = null;
  try {
      const res = await api.pages.getByUrl(defaultUrl);
      if (res.data?.success && res.data?.data) {
          pageData = res.data.data;
      }
  } catch (e) {}

  const title = pageData?.meta_title || `Teer Number ${number} History | How Many Times ${number} Came in Shillong Teer`;
  const description = pageData?.meta_description || `Complete analysis of Teer number ${number}. See how many times ${number} appeared as FR and SR in Shillong, Khanapara, Juwai Teer. Last appeared date and frequency data.`;

  return {
    title,
    description,
    keywords: [`Teer number ${number}`, `Shillong Teer ${number}`, `Teer Target ${number}`, `Teer previous result ${number}`, `teer hit number ${number}`],
    alternates: {
      canonical: pageData?.canonical_url || defaultUrl,
    },
    robots: {
      index: pageData?.indexed ?? true,
      follow: true,
    }
  };
}

export default async function NumberPage({ params }: Props) {
  const number = (await params).number;

  if (!number || number.length !== 2 || isNaN(Number(number))) {
    notFound();
  }

  let data = null;
  try {
    const res = await api.results.getNumberStats(number);
    if (res.data?.success) {
      data = res.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch number history:", error);
  }

  // Even if API fails, render with zero stats for SEO indexing
  const stats = data?.stats || { totalHits: 0, round1Hits: 0, round2Hits: 0, round3Hits: 0, lastHit: null, lastGame: null };
  const history = data?.history || [];

  // Fetch dreams that reference this number for cross-linking
  let relatedDreams: any[] = [];
  try {
    const dreamsRes = await api.dreams.getAll();
    if (dreamsRes.data?.success && dreamsRes.data.data) {
      relatedDreams = dreamsRes.data.data.filter((d: any) =>
        d.numbers.split(',').map((n: string) => n.trim().padStart(2, '0')).includes(number)
      ).slice(0, 8);
    }
  } catch (err) {
    // Silently fail — dreams cross-links are optional
  }

  // Adjacent number navigation
  const prevNum = String((parseInt(number) - 1 + 100) % 100).padStart(2, "0");
  const nextNum = String((parseInt(number) + 1) % 100).padStart(2, "0");

  const defaultUrl = `/number/${number}`;
  let pageData = null;
  try {
      const res = await api.pages.getByUrl(defaultUrl);
      if (res.data?.success && res.data?.data) {
          pageData = res.data.data;
      }
  } catch (e) {}

  const h1Title = pageData?.title || `Target Number <span class="text-emerald-400">${number}</span>`;
  const bodyContent = pageData?.content || null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pageData?.title || `Teer Number ${number} - Complete Frequency Analysis`,
    description: pageData?.meta_description || `How many times has number ${number} appeared in Teer results.`,
    author: { "@type": "Organization", name: "Teer.club" },
    publisher: { "@type": "Organization", name: "Teer.club", url: "https://teer.club" },
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="flex-1 bg-surface">
        <DarkHero
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Results", href: "/results" },
            { label: `Number ${number}` }
          ]}
          title={<span dangerouslySetInnerHTML={{ __html: h1Title }} />}
          badges={
            <HeroBadge>Number Analytics</HeroBadge>
          }
        >
          <div className="mt-8">
            <p className="text-sm md:text-base text-indigo-200/80 leading-relaxed max-w-2xl font-medium mb-6">
              Comprehensive history and frequency analysis for the number {number} across all official Teer games.
            </p>
            <div className="flex items-center gap-4">
              <Link href={`/number/${prevNum}`} className="px-4 py-2 rounded-lg border border-white/20 text-sm font-bold text-white/70 hover:bg-white/10 transition-all">
                ← Number {prevNum}
              </Link>
              <Link href={`/number/${nextNum}`} className="px-4 py-2 rounded-lg border border-white/20 text-sm font-bold text-white/70 hover:bg-white/10 transition-all">
                Number {nextNum} →
              </Link>
            </div>
          </div>
        </DarkHero>

        <TrafficGrid />

        {/* Stats Grid */}
        <Section className="!py-12 border-b border-border/50">
          <Container>
            <div className="grid gap-6 md:grid-cols-4 mx-auto max-w-5xl">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/50 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Total Hits</p>
                <p className="text-4xl font-black text-gray-900">{stats.totalHits}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/50 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">First Round (F/R)</p>
                <p className="text-4xl font-black text-emerald-600">{stats.round1Hits}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/50 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Second Round (S/R)</p>
                <p className="text-4xl font-black text-blue-600">{stats.round2Hits}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100/50 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Last Appeared</p>
                <p className="text-lg font-bold text-gray-900 mt-2">
                  {stats.lastHit ? new Date(stats.lastHit).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Never"}
                </p>
                <p className="text-xs font-medium text-gray-500 mt-1">{stats.lastGame || "-"}</p>
              </div>
            </div>
          </Container>
        </Section>

        {/* History Table */}
        <Section className="!py-16">
          <Container>
            <div className="mx-auto max-w-5xl">
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Recent Appearances of <span className="text-primary">{number}</span>
              </h2>
              <p className="text-sm text-gray-500 font-medium mb-8">Last {history.length} times number {number} appeared in official Teer results</p>

              {history.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
                  <p className="text-gray-500 font-medium">No historical records found for this number in our recent database.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50">
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-[#111827] text-white text-xs uppercase tracking-widest">
                        <tr>
                          <th className="px-6 py-4 font-bold">Date</th>
                          <th className="px-6 py-4 font-bold">Game</th>
                          <th className="px-6 py-4 font-bold">F/R</th>
                          <th className="px-6 py-4 font-bold">S/R</th>
                          <th className="px-6 py-4 font-bold text-center">Round</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {history.map((record: any) => {
                          const dateObj = new Date(record.date);
                          const isFR = record.round1 === number;
                          const isSR = record.round2 === number;
                          
                          return (
                            <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Link href={`/results/${record.game?.name?.toLowerCase() || ''}`} className="font-bold text-indigo-600 hover:text-indigo-800">
                                  {record.game?.displayName || "Unknown Game"}
                                </Link>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-black text-lg ${isFR ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-2' : 'bg-gray-50 text-gray-400'}`}>
                                  {record.round1 || "XX"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-black text-lg ${isSR ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-offset-2' : 'bg-gray-50 text-gray-400'}`}>
                                  {record.round2 || "XX"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isFR ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                                  {isFR ? "FR" : "SR"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </Container>
        </Section>

        {/* Ad Slot — between history and SEO content */}
        <InlineAd />

        {/* SEO Content */}
        <Section background="gray" className="!py-16 md:!py-24">
          <Container className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About Teer Number {number}</h2>
              {bodyContent ? (
                  <div className="prose prose-lg text-gray-600 max-w-none" dangerouslySetInnerHTML={{ __html: bodyContent }} />
              ) : (
                  <div className="prose prose-lg text-gray-600 max-w-none">
                    <p>
                      Number <strong>{number}</strong> is one of the 100 possible outcomes (00-99) in Teer archery games played across Meghalaya and Assam.
                      Based on our historical database, this number has appeared a total of <strong>{stats.totalHits} times</strong> across
                      Shillong Teer, Khanapara Teer, Juwai Teer, and other regional games.
                    </p>
                    <p>
                      Of those appearances, <strong>{stats.round1Hits}</strong> were in the First Round (FR) and <strong>{stats.round2Hits}</strong> were
                      in the Second Round (SR). Players looking for the <strong>Teer hit number {number}</strong> can use this frequency data to
                      inform their analysis alongside <Link href="/common-numbers" className="text-primary hover:underline">daily common numbers</Link> and{" "}
                      <Link href="/dreams" className="text-primary hover:underline">dream number interpretations</Link>.
                    </p>
                    {stats.lastHit && (
                      <p>
                        The most recent appearance of number {number} was on{" "}
                        <strong>{new Date(stats.lastHit).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>{" "}
                        in the <strong>{stats.lastGame}</strong> game.
                      </p>
                    )}
                  </div>
              )}
            </div>
          </Container>
        </Section>

        {/* Related Dreams Cross-Link */}
        {relatedDreams.length > 0 && (
          <Section background="white" className="!py-16 border-t border-gray-100">
            <Container className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                  Dreams Linked to <span className="text-primary">{number}</span>
                </h3>
                <p className="text-sm text-gray-500 font-medium">These dreams are traditionally associated with number {number}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedDreams.map((dream: any) => (
                  <Link key={dream.id || dream.slug} href={`/dreams/${dream.slug}`} className="block group">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all text-center">
                      <h4 className="font-bold text-gray-900 capitalize mb-2 group-hover:text-primary">{dream.dream}</h4>
                      <div className="flex gap-1 justify-center flex-wrap">
                        {dream.numbers.split(',').map((n: string) => (
                          <span key={n.trim()} className={`text-xs font-bold px-2 py-0.5 rounded-md ${n.trim().padStart(2, '0') === number ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                            {n.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </Section>
        )}

        {/* Number Grid Navigation */}
        <Section background="white" className="!py-16 md:!py-24 border-t border-gray-100">
          <Container>
            <div className="mb-12 text-center">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                Explore All <span className="text-primary">Numbers</span>
              </h3>
              <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">Click any number to view its frequency analysis</p>
            </div>
            <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto">
              {Array.from({ length: 100 }, (_, i) => {
                const n = String(i).padStart(2, "0");
                const isCurrent = n === number;
                return (
                  <Link
                    key={n}
                    href={`/number/${n}`}
                    className={`flex items-center justify-center h-10 rounded-lg text-sm font-bold transition-all ${
                      isCurrent
                        ? "bg-primary text-white shadow-lg shadow-blue-200 scale-110"
                        : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-primary"
                    }`}
                  >
                    {n}
                  </Link>
                );
              })}
            </div>
          </Container>
        </Section>

        {/* CTA */}
        <Section background="dark" className="!py-20 bg-[#111827]">
          <Container className="text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-6">
              Check Today&apos;s <span className="text-blue-400">Live Results</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">See if number {number} appears in today&apos;s Teer results. Real-time updates from official counters.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/live" variant="primary" className="!px-10 !py-4 shadow-xl">Check Live Results</Button>
              <Button href="/common-numbers" variant="secondary" className="!px-10 !py-4 bg-white/5 border-white/10 text-white hover:bg-white/10">Common Numbers</Button>
            </div>
          </Container>
        </Section>
      </main>
    </PageLayout>
  );
}
