import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function formatRegionName(region: string) {
    return region.charAt(0).toUpperCase() + region.slice(1);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export async function generateMetadata({ params }: { params: Promise<{ region: string; year: string }> }): Promise<Metadata> {
    const { region, year } = await params;
    if (!['shillong', 'khanapara', 'juwai'].includes(region)) return { title: 'Not Found' };
    if (isNaN(parseInt(year, 10)) || year.length !== 4) return { title: 'Not Found' };

    const regionName = formatRegionName(region);
    const title = `${regionName} Teer Result ${year} - Yearly Archive & Common Numbers`;

    return {
        title,
        description: `Complete overview of ${regionName} Teer results for the year ${year}. Browse monthly archives, yearly trends, and historical First Round (FR) and Second Round (SR) winning numbers.`,
        keywords: `${regionName} teer result ${year}, ${regionName} teer history ${year}, ${year} teer result list, ${regionName} common numbers ${year}`,
        openGraph: {
            title,
            description: `Yearly archive of all FR & SR numbers for ${regionName} Teer in ${year}.`,
            url: `https://teer.club/results/${region}/archive/${year}`,
            type: 'website',
        },
    };
}

export default async function YearlyHubPage({ params }: { params: Promise<{ region: string; year: string }> }) {
    const { region, year } = await params;

    if (!['shillong', 'khanapara', 'juwai'].includes(region)) {
        notFound();
    }
    if (isNaN(parseInt(year, 10)) || year.length !== 4) {
        notFound();
    }

    const regionName = formatRegionName(region);

    // Dynamic schema for the dataset (Yearly view)
    const datasetSchema = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": `${regionName} Teer Results for ${year}`,
        "description": `Comprehensive directory of ${regionName} Teer lottery results during the year ${year}.`,
        "url": `https://teer.club/results/${region}/archive/${year}`,
        "keywords": `teer, ${regionName}, lottery, result, ${year}`,
        "creator": {
            "@type": "Organization",
            "name": "Teer Club"
        }
    };

    return (
        <main className="min-h-screen bg-[#F0F2F5] text-slate-800 pb-32 pt-24 font-sans relative z-10">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />

            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 list-none uppercase">
                        {regionName} Teer Archive
                        <span className="block text-indigo-600 mt-2">{year}</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed mb-6">
                        Explore the complete history of {regionName} Teer for {year}. Select a month below to view every daily First Round (FR) and Second Round (SR) result.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {MONTHS.map((monthStr, index) => {
                            const monthNum = (index + 1).toString().padStart(2, '0');
                            return (
                                <Link
                                    key={monthNum}
                                    href={`/results/${region}/${year}/${monthNum}`}
                                    className="group block p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all text-center"
                                >
                                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Month {monthNum}</div>
                                    <h2 className="text-xl font-black text-slate-900">{monthStr}</h2>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Content Block for SEO */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 prose prose-slate max-w-none">
                    <h2>About the {year} {regionName} Teer Season</h2>
                    <p>
                        The {year} season of the {regionName} Teer game brought incredible moments for archery players and fans across Meghalaya.
                        By analyzing historical data month by month, you can discover patterns and calculate common numbers for future bets.
                    </p>
                    <p>
                        Teer is predominantly played six days a week, and keeping track of the winning numbers is the key to identifying trends.
                        Select any month above to view the complete dataset of winning numbers.
                    </p>
                </div>
            </div>
        </main>
    );
}
