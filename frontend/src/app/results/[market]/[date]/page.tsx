import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section } from "@/components/ui/Grid";
import Link from "next/link";
import api from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { DarkHero, HeroBadge } from "@/components/layout/DarkHero";
import { TrafficGrid } from "@/components/layout/TrafficGrid";

export const revalidate = 3600;

interface Props {
  params: Promise<{ market: string; date: string }>;
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { weekday: 'long', day: "2-digit", month: "long", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { market, date } = await params;
  const gameName = market.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedDate = formatDate(date);
  const defaultUrl = `/results/${market}/${date}`;

  let pageData = null;
  try {
      const res = await api.pages.getByUrl(defaultUrl);
      if (res.data?.success && res.data?.data) {
          pageData = res.data.data;
      }
  } catch (e) {
      // Fallback
  }

  const title = pageData?.meta_title || `${gameName} Result on ${formattedDate} | Teer Club`;
  const description = pageData?.meta_description || `Official ${gameName} Teer Result for ${formattedDate}. Check the First Round (F/R) and Second Round (S/R) winning numbers.`;

  return {
    title,
    description,
    keywords: [`${gameName} result ${date}`, `${gameName} teer result ${formattedDate}`, `${market} previous result`],
    alternates: {
        canonical: pageData?.canonical_url || defaultUrl,
    },
    robots: {
        index: pageData?.indexed ?? true,
        follow: true,
    }
  };
}

export default async function DateResultPage({ params }: Props) {
  const { market, date } = await params;

  let data = null;
  try {
    // Attempt to fetch result for specific game and date
    // Backend accepts gameIdentifier (name or ID)
    const res = await api.client.get(`/results/${market}/${date}`);
    if (res.data?.success) {
      data = res.data.data;
    }
  } catch (error) {
    console.error(`Failed to fetch result for ${market} on ${date}:`, error);
  }

  if (!data) {
    notFound();
  }

  const result = data;
  const gameName = result.game?.displayName || market.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedDate = formatDate(date);
  const defaultUrl = `/results/${market}/${date}`;

  let pageData = null;
  try {
      const res = await api.pages.getByUrl(defaultUrl);
      if (res.data?.success && res.data?.data) {
          pageData = res.data.data;
      }
  } catch (e) {
      // Fallback
  }

  const h1Title = pageData?.title || `${gameName} Result`;
  const bodyContent = pageData?.content || null;

  return (
    <PageLayout>
      <main className="flex-1 bg-surface">
        <DarkHero
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Results", href: "/results" },
            { label: gameName, href: `/results/${market}/previous-results` },
            { label: formattedDate },
          ]}
          title={
            <>
              {h1Title}{" "}
              <span className="text-indigo-300/80">{formattedDate}</span>
            </>
          }
          badges={
            <HeroBadge>Historical Archive</HeroBadge>
          }
          cta={{
            label: `${gameName} History`,
            href: `/results/${market}/previous-results`,
          }}
        >
          {bodyContent && (
            <div className="text-base text-indigo-100 mt-6 max-w-2xl" dangerouslySetInnerHTML={{ __html: bodyContent }} />
          )}
        </DarkHero>

        <TrafficGrid gameId={market} />

        <Section className="!py-16 border-b border-border/50 bg-gray-50/50">
          <Container>
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                  
                  {/* Round 1 */}
                  <div className="text-center relative">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-4">First Round (F/R)</p>
                    <div className="flex items-center justify-center h-32 w-full rounded-2xl bg-gray-50 border border-gray-100">
                      <span className="text-6xl font-black text-gray-900 drop-shadow-sm">
                        {result.round1 || "XX"}
                      </span>
                    </div>
                  </div>

                  {/* Round 2 */}
                  <div className="text-center relative">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Second Round (S/R)</p>
                    <div className="flex items-center justify-center h-32 w-full rounded-2xl bg-gray-50 border border-gray-100">
                      <span className="text-6xl font-black text-gray-900 drop-shadow-sm">
                        {result.round2 || "XX"}
                      </span>
                    </div>
                  </div>

                </div>

                {result.round3 && (
                  <div className="mt-8 text-center border-t border-dashed border-gray-200 pt-8">
                     <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Third Round (T/R)</p>
                     <span className="text-5xl font-black text-gray-900">
                        {result.round3}
                     </span>
                  </div>
                )}

                <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      100% Verified Official Source
                   </div>
                   <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                     Teer.club
                   </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </main>
    </PageLayout>
  );
}
