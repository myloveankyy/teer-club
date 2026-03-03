import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

// Helper to format date nicely
function formatDateString(dateStr: string) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function formatRegionName(region: string) {
    return region.charAt(0).toUpperCase() + region.slice(1);
}

interface PageProps {
    params: {
        region: string;
        date: string; // expecting YYYY-MM-DD
    };
}

// Generate super-optimized metadata for this specific programmatic page
export async function generateMetadata({ params }: { params: Promise<{ region: string; date: string }> }): Promise<Metadata> {
    const { region, date } = await params;

    // Basic validation
    if (!['shillong', 'khanapara', 'juwai'].includes(region)) {
        return { title: 'Not Found' };
    }

    const formattedDate = formatDateString(date);
    const regionName = formatRegionName(region);

    return {
        title: `${regionName} Teer Result Today ${formattedDate} - Live FR SR`,
        description: `Check the live ${regionName} Teer result for ${formattedDate}. First Round (FR) and Second Round (SR) winning numbers, previous results, and common numbers. Fast and accurate.`,
        keywords: `${regionName} teer result, teer result today, ${regionName} teer ${date}, ${regionName} teer previous result, fr sr ${regionName}`,
        openGraph: {
            title: `${regionName} Teer Result - ${formattedDate}`,
            description: `Live FR & SR numbers for ${regionName} Teer on ${formattedDate}.`,
            url: `https://teer.club/results/${region}/${date}`,
            siteName: 'Teer Club',
            images: [
                {
                    url: '/og-image.jpg', // Replace with a real OG image if you have one
                    width: 1200,
                    height: 630,
                    alt: `${regionName} Teer Result`,
                },
            ],
            locale: 'en_IN',
            type: 'website',
        },
    };
}

export default async function ProgrammaticResultPage({ params }: { params: Promise<{ region: string; date: string }> }) {
    const { region, date } = await params;

    if (!['shillong', 'khanapara', 'juwai'].includes(region)) {
        notFound();
    }

    const formattedDate = formatDateString(date);
    const regionName = formatRegionName(region);

    // In a real app, you would fetch the specific result for this date from your DB here
    // For now, we'll build the highly-optimized SEO shell that Google will index.

    return (
        <main className="min-h-screen bg-[#F0F2F5] text-slate-800 pb-32 pt-24 font-sans">
            {/* Dynamic JSON-LD injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": `${regionName} Teer Result ${formattedDate}`,
                        "description": `Get the verified ${regionName} Teer result for ${formattedDate}.`,
                        "url": `https://teer.club/results/${region}/${date}`,
                        "datePublished": date,
                        "dateModified": new Date().toISOString()
                    })
                }}
            />
            {/* Dynamic Event Schema - Trick Google into treating results as "Events" */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Event",
                        "name": `${regionName} Teer Result Declaration - ${formattedDate}`,
                        "startDate": `${date}T15:00:00+05:30`,
                        "endDate": `${date}T17:00:00+05:30`,
                        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
                        "eventStatus": "https://schema.org/EventScheduled",
                        "location": {
                            "@type": "VirtualLocation",
                            "url": `https://teer.club/results/${region}/${date}`
                        },
                        "description": `Live announcement of the ${regionName} Teer First Round (FR) and Second Round (SR) winning numbers.`
                    })
                }}
            />

            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        {regionName} Teer Result
                        <span className="block text-indigo-600 mt-2">{formattedDate}</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg mb-8 leading-relaxed">
                        Welcome to the official archive for the {regionName} Teer result on {formattedDate}.
                        Below you will find the verified First Round (FR) and Second Round (SR) winning numbers.
                    </p>

                    {/* Placeholder for the actual result data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center min-h-[160px]">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">First Round (FR)</span>
                            <div className="text-5xl font-black text-slate-900">--</div>
                            <span className="text-xs text-slate-500 mt-2">Declared at 4:00 PM</span>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center min-h-[160px]">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Second Round (SR)</span>
                            <div className="text-5xl font-black text-slate-900">--</div>
                            <span className="text-xs text-slate-500 mt-2">Declared at 4:50 PM</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors">
                            View Today's Live Result
                        </Link>
                        <Link href={`/history/${region}`} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">
                            {regionName} History
                        </Link>
                    </div>
                </div>

                {/* SEO Content Block */}
                <div className="prose prose-slate max-w-none bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h2>About {regionName} Teer on {formattedDate}</h2>
                    <p>
                        The {regionName} Teer is a traditional archery-based lottery game played in Meghalaya, India.
                        The results for {formattedDate} are eagerly awaited by thousands of participants.
                        We ensure that the numbers published here are accurate and updated as soon as they are officially declared by the Khasi Hills Archery Sports Association.
                    </p>
                    <h3>How it works</h3>
                    <p>
                        In the First Round, archers shoot arrows at a target, and the last two digits of the total number of arrows that hit the target become the winning number. The process is repeated for the Second Round.
                    </p>
                    <ul>
                        <li><strong>Game:</strong> {regionName} Teer</li>
                        <li><strong>Date:</strong> {formattedDate}</li>
                        <li><strong>Location:</strong> Meghalaya, India</li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
