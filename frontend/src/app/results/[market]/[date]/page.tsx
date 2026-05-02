import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section } from "@/components/ui/Grid";
import Link from "next/link";
import api from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

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

  return {
    title: `${gameName} Result on ${formattedDate} | Teer Club`,
    description: `Official ${gameName} Teer Result for ${formattedDate}. Check the First Round (F/R) and Second Round (S/R) winning numbers.`,
    keywords: [`${gameName} result ${date}`, `${gameName} teer result ${formattedDate}`, `${market} previous result`],
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

  return (
    <PageLayout>
      <main className="flex-1 bg-surface">
        <Section className="!py-16 md:!py-24 bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-200 mb-6 border border-white/10">
                Historical Archive
              </span>
              <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl">
                {gameName} Result
              </h1>
              <p className="text-xl md:text-2xl text-emerald-400 font-bold mb-6">
                {formattedDate}
              </p>
              <div className="flex justify-center mt-8">
                 <Link href={`/results/${market}`} className="text-sm font-bold text-indigo-300 hover:text-white underline underline-offset-4">
                    &larr; Back to {gameName} History
                 </Link>
              </div>
            </div>
          </Container>
        </Section>

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
