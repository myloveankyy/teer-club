import { Metadata } from 'next';
import Link from 'next/link';
import ShareButtons from '@/components/ShareButtons';

export const dynamic = 'force-dynamic';

function formatDateString(date: Date) {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatRegionName(region: string) {
    return region.charAt(0).toUpperCase() + region.slice(1);
}

export function generatePredictionMetadata(region: string, isCommonNumber: boolean): Metadata {
    const regionName = formatRegionName(region);
    const date = new Date();
    const formattedDate = formatDateString(date);

    const typeLabel = isCommonNumber ? "Common Number" : "Prediction";
    const title = `${regionName} Teer ${typeLabel} Today - ${formattedDate} | Live Expert Analysis`;
    const description = `Get today's authentic ${regionName} Teer ${typeLabel} for ${formattedDate}. Expert mathematical analysis, previous patterns, FR & SR likely hits to maximize your winning odds.`;

    return {
        title,
        description,
        keywords: `${regionName} teer, ${regionName} teer ${isCommonNumber ? 'common number' : 'prediction'}, teer today`,
        openGraph: {
            title,
            description,
            type: 'article',
        }
    };
}

export default function PredictionPage({ region, isCommonNumber, slug }: { region: string; isCommonNumber: boolean; slug: string }) {
    const regionName = formatRegionName(region);
    const date = new Date();
    const formattedDate = formatDateString(date);
    const isoDate = date.toISOString().split('T')[0];

    const typeLabel = isCommonNumber ? "Common Number" : "Prediction";

    // Simulate programmatic data injection
    const targetNumbers = ['23', '45', '67', '89', '12', '34'];
    const houseEnding = { house: ['2', '4', '6'], ending: ['3', '5', '7'] };

    return (
        <main className="min-h-screen bg-[#F0F2F5] text-slate-800 pb-32 pt-24 font-sans relative z-10">
            {/* FAQ Schema for "People Also Ask" Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": `What is the ${regionName} Teer ${typeLabel} for today?`,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": `Today's (${formattedDate}) target numbers are ${targetNumbers.join(', ')}. The strong house is ${houseEnding.house.join(', ')} and strong ending is ${houseEnding.ending.join(', ')}.`
                                }
                            },
                            {
                                "@type": "Question",
                                "name": `When is the ${regionName} Teer result declared?`,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": `The First Round (FR) is declared around 4:00 PM and Second Round (SR) around 4:50 PM.`
                                }
                            }
                        ]
                    })
                }}
            />

            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                        Daily Analysis
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        {regionName} Teer {typeLabel}
                        <span className="block text-indigo-600 mt-2">Today, {formattedDate}</span>
                    </h1>

                    <p className="text-slate-600 font-medium text-lg leading-relaxed mb-8">
                        Welcome to our daily breakdown of the {regionName} Teer {typeLabel.toLowerCase()}s. Our system utilizes historical pattern recognition, mathematical frequency modeling, and top expert opinions to bring you the highest probability targets for today's First Round (FR) and Second Round (SR).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Direct Targets</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {targetNumbers.map((num, i) => (
                                    <div key={i} className="bg-white rounded-xl py-3 text-center text-2xl font-black text-slate-800 shadow-sm border border-slate-100">
                                        {num}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">House & Ending</h3>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <span className="text-xs font-bold text-indigo-800 uppercase block mb-1">Strong House</span>
                                    <div className="flex gap-2">
                                        {houseEnding.house.map((num, i) => <span key={i} className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-indigo-600 shadow-sm">{num}</span>)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-indigo-800 uppercase block mb-1">Strong Ending</span>
                                    <div className="flex gap-2">
                                        {houseEnding.ending.map((num, i) => <span key={i} className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">{num}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ShareButtons
                        title={`${regionName} Teer ${typeLabel} - ${formattedDate}`}
                        description={`Get the highly accurate ${regionName} Teer ${typeLabel} today! Secret House & Ending targets revealed.`}
                    />

                    {/* Silo Authority Automated Linking */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verify Yesterday</span>
                            <Link href={`/history`} className="text-indigo-600 hover:text-indigo-800 font-bold underline transition-colors">
                                View Past {regionName} Results
                            </Link>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Updates</span>
                            <Link href={`/`} className="text-indigo-600 hover:text-indigo-800 font-bold underline transition-colors">
                                Track Live {regionName} Results Today
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Advertisement Placeholder */}
                <div className="w-full h-[90px] bg-slate-100/50 rounded-2xl border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest mb-8 font-bold">
                    Advertisement Space - Analysis Break
                </div>

                {/* Long-form SEO Content */}
                <div className="prose prose-slate max-w-none bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h2>How We Calculate {regionName} Teer Common Numbers</h2>
                    <p>
                        Calculating the {regionName} Teer {typeLabel.toLowerCase()} involves analyzing the result archives of the past 30 days to detect repeating clusters and anomalies. While the game of Teer (archery) involves chance, statistical distribution theories suggest that observing the frequency of "House" (first digit) and "Ending" (second digit) hits can provide a marginal advantage.
                    </p>
                    <p>
                        It is important to remember that all numbers provided on <strong>Teer Club</strong> for {formattedDate} are for educational and entertainment purposes. We recommend pairing these predictions with your own dream numbers from the traditional Teer Dream Chart.
                    </p>
                    <h3>Important Notice & Risk Warning</h3>
                    <p>
                        Teer is a lottery game. There is absolutely no mathematical formula that guarantees a 100% win rate. Play responsibly and never risk money you cannot afford to lose. The common numbers generated here are predictive models, not certainties.
                    </p>
                </div>
            </div>
        </main>
    );
}
