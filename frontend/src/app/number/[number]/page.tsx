import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section } from "@/components/ui/Grid";
import Link from "next/link";
import api from "@/lib/api";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 3600; // Cache for 1 hour

interface Props {
  params: Promise<{ number: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const number = (await params).number;
  if (!number || number.length !== 2 || isNaN(Number(number))) {
    return { title: "Not Found" };
  }

  return {
    title: `Teer Number ${number} Target & Previous History | Teer Result Today`,
    description: `Check the history and frequency of the Teer number ${number}. See when ${number} last appeared in Shillong, Khanapara, and Juwai Teer results.`,
    keywords: [`Teer number ${number}`, `Shillong Teer ${number}`, `Teer Target ${number}`, `Teer previous result ${number}`],
  };
}

export default async function NumberPage({ params }: Props) {
  const number = (await params).number;

  if (!number || number.length !== 2 || isNaN(Number(number))) {
    notFound();
  }

  let data = null;
  try {
    // We fetch from the new endpoint we just created
    const res = await api.client.get(`/results/number/${number}`);
    if (res.data?.success) {
      data = res.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch number history:", error);
  }

  if (!data) {
    notFound();
  }

  const { stats, history } = data;

  return (
    <PageLayout>
      <main className="flex-1 bg-surface">
        <Section className="!py-16 md:!py-24 bg-gradient-to-b from-slate-900 to-indigo-950 text-white">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-200 backdrop-blur-md mb-6 border border-white/10">
                Number Analytics
              </span>
              <h1 className="mb-6 text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">
                Target Number <span className="text-emerald-400">{number}</span>
              </h1>
              <p className="text-lg md:text-xl text-indigo-200/80 leading-relaxed max-w-2xl mx-auto font-medium">
                Comprehensive history and frequency analysis for the number {number} across all official Teer games.
              </p>
            </div>
          </Container>
        </Section>

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

        <Section className="!py-16">
          <Container>
            <div className="mx-auto max-w-5xl">
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Appearances of {number}
              </h2>

              {history.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center">
                  <p className="text-gray-500 font-medium">No historical records found for this number in our recent database.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/80 text-xs uppercase tracking-widest text-gray-500 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-bold">Date</th>
                          <th className="px-6 py-4 font-bold">Game</th>
                          <th className="px-6 py-4 font-bold">F/R</th>
                          <th className="px-6 py-4 font-bold">S/R</th>
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
      </main>
    </PageLayout>
  );
}
