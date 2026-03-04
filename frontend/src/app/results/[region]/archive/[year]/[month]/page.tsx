import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatRegionName(region: string) {
    return region.charAt(0).toUpperCase() + region.slice(1);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export async function generateMetadata({ params }: { params: Promise<{ region: string; year: string; month: string }> }): Promise<Metadata> {
    const { region, year, month } = await params;
    if (!['shillong', 'khanapara', 'juwai'].includes(region)) return { title: 'Not Found' };

    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex < 0 || monthIndex > 11 || isNaN(monthIndex) || isNaN(parseInt(year, 10))) return { title: 'Not Found' };

    const monthName = MONTHS[monthIndex];
    const regionName = formatRegionName(region);
    const title = `${regionName} Teer Result ${monthName} ${year} - Complete Monthly History`;

    return {
        title,
        description: `Complete archive of ${regionName} Teer results for ${monthName} ${year}. View all First Round (FR) and Second Round (SR) winning numbers, analyze patterns, and find common numbers for the entire month.`,
        keywords: `${regionName} teer result ${monthName} ${year}, ${regionName} teer history ${monthName} ${year}, ${monthName} teer result list`,
        openGraph: {
            title,
            description: `Monthly archive of all FR & SR numbers for ${regionName} Teer during ${monthName} ${year}.`,
            url: `https://teer.club/results/${region}/archive/${year}/${month}`,
            type: 'website',
        },
    };
}

export default async function MonthlyHubPage({ params }: { params: Promise<{ region: string; year: string; month: string }> }) {
    const { region, year, month } = await params;

    if (!['shillong', 'khanapara', 'juwai'].includes(region)) {
        notFound();
    }

    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex < 0 || monthIndex > 11) notFound();
    const monthName = MONTHS[monthIndex];
    const regionName = formatRegionName(region);

    let history: any[] = [];
    try {
        const INTERNAL_API = process.env.INTERNAL_API_URL || "http://127.0.0.1:5000";
        const res = await fetch(`${INTERNAL_API}/api/results/history`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (res.ok) {
            const allData = await res.json();
            // Filter data for the specific month and year
            history = allData.filter((item: any) => {
                const date = new Date(item.date);
                return date.getFullYear() === parseInt(year, 10) && date.getMonth() === monthIndex;
            });
            // Sort ascending by date
            history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
    } catch (e) {
        console.error("Failed to fetch history for monthly hub page", e);
    }

    // Dynamic schema for the dataset
    const datasetSchema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": `${regionName} Teer Results for ${monthName} ${year}`,
        "description": `A comprehensive dataset of the ${regionName} Teer lottery results during the month of ${monthName} ${year}. Includes daily FR and SR numbers.`,
        "url": `https://teer.club/results/${region}/archive/${year}/${month}`,
        "keywords": `teer, ${regionName}, lottery, result, ${monthName}, ${year}`,
        "creator": {
            "@type": "Organization",
            "name": "Teer Club"
        }
    };

    // Auto-generate FAQs for JSON-LD and page content
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `Where can I find the ${regionName} Teer results for ${monthName} ${year}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `You can find the complete list of daily ${regionName} Teer results for ${monthName} ${year} on this official archive page on Teer Club.`
                }
            },
            {
                "@type": "Question",
                "name": `How many rounds are there in ${regionName} Teer?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `There are two rounds every day: the First Round (FR) and the Second Round (SR). Both results are updated live on Teer Club.`
                }
            }
        ]
    };

    return (
        <main className="min-h-screen bg-[#F0F2F5] text-slate-800 pb-32 pt-24 font-sans relative z-10">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 list-none uppercase">
                        {regionName} Teer Result
                        <span className="block text-indigo-600 mt-2">{monthName} {year}</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed mb-6">
                        Welcome to the official monthly archive for the {regionName} Teer result spanning the entire month of {monthName} {year}. Browse the complete history of First Round and Second Round numbers below.
                    </p>

                    {/* Internal Link Wheel Context Block */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <Link href={`/results/${region}`} className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                            View Today's Result
                        </Link>
                        <Link href={`/history`} className="px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                            All History
                        </Link>
                    </div>

                    {history.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-slate-500 font-bold">No results found for this specific month.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-100 mb-8">
                            <table className="w-full text-left bg-white whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                                        <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">F/R (Round 1)</th>
                                        <th className="px-6 py-4 font-bold tracking-wider">S/R (Round 2)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((row) => {
                                        let fr = '--';
                                        let sr = '--';
                                        if (region === 'shillong') { fr = row.shillong_r1 || row.round1; sr = row.shillong_r2 || row.round2; }
                                        else if (region === 'khanapara') { fr = row.khanapara_r1; sr = row.khanapara_r2; }
                                        else if (region === 'juwai') { fr = row.juwai_r1; sr = row.juwai_r2; }

                                        // Skip empty rows nicely
                                        if (!fr && !sr) return null;

                                        return (
                                            <tr key={row.date} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <Link href={`/results/${region}/${row.date}`} className="font-bold text-indigo-600 hover:underline">
                                                        {new Date(row.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 font-black text-slate-900 text-xl">{fr || '--'}</td>
                                                <td className="px-6 py-4 font-black text-slate-900 text-xl">{sr || '--'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* FAQ Block Content */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {faqSchema.mainEntity.map((faq, i) => (
                            <div key={i} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                <h3 className="font-bold text-slate-800 text-lg mb-2">{faq.name}</h3>
                                <p className="text-slate-600 leading-relaxed">{faq.acceptedAnswer.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
