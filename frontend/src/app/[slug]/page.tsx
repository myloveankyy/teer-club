import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getDynamicTitle } from "@/lib/seo/parasite";
import { InfiniteScrollTrap } from "@/components/InfiniteScrollTrap";
import ShareButtons from "@/components/ShareButtons";

export const dynamic = 'force-dynamic';
// export const revalidate = 60;

function formatDateString(dateStr: string) {
    try {
        const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split(' ');
        if (parts.length === 3) {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const year = parts[0].length === 4 ? parts[0] : parts[2];
            let monthIndex = parseInt(parts[1], 10) - 1;
            let day = parseInt(parts[2], 10);

            // if year is at the end "4-march-2026"
            if (parts[2].length === 4) {
                day = parseInt(parts[0], 10);
                monthIndex = months.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
                if (monthIndex === -1 && !isNaN(parseInt(parts[1], 10))) {
                    monthIndex = parseInt(parts[1], 10) - 1;
                }
            }

            if (monthIndex >= 0 && monthIndex < 12 && day > 0 && day <= 31) {
                return `${months[monthIndex]} ${day}, ${year}`;
            }
        }

        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function parseSlugDate(slugDate: string): string | null {
    // "4-march-2026" -> "2026-03-04"
    const parts = slugDate.split('-');
    if (parts.length === 3) {
        const dayStr = parts[0];
        const monthStr = parts[1].toLowerCase();
        const yearStr = parts[2];

        const monthMap: Record<string, string> = {
            'january': '01', 'february': '02', 'march': '03', 'april': '04',
            'may': '05', 'june': '06', 'july': '07', 'august': '08',
            'september': '09', 'october': '10', 'november': '11', 'december': '12'
        };

        const month = monthMap[monthStr];
        if (!month) {
            // Check if it's already a number
            if (!isNaN(parseInt(monthStr, 10))) {
                return `${yearStr}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`;
            }
            return null;
        }

        const day = dayStr.padStart(2, '0');
        const year = yearStr;

        return `${year}-${month}-${day}`;
    }
    return null;
}

function formatRegionName(region: string) {
    return region.charAt(0).toUpperCase() + region.slice(1);
}

// Generate last 7 days for fast static rendering on build
export async function generateStaticParams() {
    const regions = ['shillong', 'khanapara', 'juwai'];
    const params: { slug: string }[] = [];

    // Generate dates for the last 7 days and next 1 day
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    const today = new Date();
    for (let i = -7; i <= 1; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;

        for (const region of regions) {
            params.push({ slug: `${region}-teer-result-${dateStr}` });
        }
    }

    return params;
}

import PredictionPage, { generatePredictionMetadata } from './PredictionPage';

// Generate super-optimized metadata for this specific programmatic page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    // Handle Silo 2: Predictions & Common Numbers
    const predictionMatch = slug.match(/^(shillong|khanapara|juwai)-teer-(common-number-today|prediction-today)$/);
    if (predictionMatch) {
        return generatePredictionMetadata(predictionMatch[1], predictionMatch[2] === 'common-number-today');
    }

    // Handle Silo 1: Daily Results
    const resultMatch = slug.match(/^(shillong|khanapara|juwai)-teer-result-(.+)$/);
    if (!resultMatch) {
        return { title: 'Not Found' };
    }

    const region = resultMatch[1];
    const slugDate = resultMatch[2]; // e.g. 4-march-2026
    const apiDate = parseSlugDate(slugDate);

    if (!apiDate) {
        return { title: 'Not Found' };
    }

    const formattedDate = formatDateString(slugDate);
    const regionName = formatRegionName(region);

    const dynamicTitle = getDynamicTitle(region, formattedDate);

    return {
        title: dynamicTitle,
        description: `[LIVE NOW] Check the verified ${regionName} Teer result for ${formattedDate}. First Round (FR) and Second Round (SR) winning numbers, previous results, and common numbers. Fast and accurate.`,
        keywords: `${regionName} teer result, teer result today, ${regionName} teer ${apiDate}, ${regionName} teer previous result, fr sr ${regionName}`,
        openGraph: {
            title: `${regionName} Teer Result - ${formattedDate}`,
            description: `[URGENT] Live FR & SR numbers for ${regionName} Teer on ${formattedDate}. Verify your tickets now!`,
            url: `https://teer.club/${slug}`,
            siteName: 'Teer Club',
            images: [
                {
                    url: '/og-image.jpg',
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

export default async function ProgrammaticCatchAllRoute({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Handle Silo 2: Predictions Routing
    const predictionMatch = slug.match(/^(shillong|khanapara|juwai)-teer-(common-number-today|prediction-today)$/);
    if (predictionMatch) {
        return <PredictionPage region={predictionMatch[1]} isCommonNumber={predictionMatch[2] === 'common-number-today'} slug={slug} />;
    }

    // Handle Silo 1: Results Routing
    const resultMatch = slug.match(/^(shillong|khanapara|juwai)-teer-result-(.+)$/);
    if (!resultMatch) {
        notFound();
    }

    const region = resultMatch[1];
    const slugDate = resultMatch[2];
    const apiDate = parseSlugDate(slugDate) || slugDate;

    const formattedDate = formatDateString(slugDate);
    const regionName = formatRegionName(region);

    // Link Wheel Logic
    const currentDate = new Date(apiDate);
    if (isNaN(currentDate.getTime())) {
        notFound();
    }

    const prevDateObj = new Date(currentDate);
    prevDateObj.setDate(currentDate.getDate() - 1);
    const nextDateObj = new Date(currentDate);
    nextDateObj.setDate(currentDate.getDate() + 1);
    const lastYearDateObj = new Date(currentDate);
    lastYearDateObj.setFullYear(currentDate.getFullYear() - 1);

    const prevApiDateStr = prevDateObj.toISOString().split('T')[0];
    const nextApiDateStr = nextDateObj.toISOString().split('T')[0];

    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    const prevSlugDate = `${prevDateObj.getDate()}-${months[prevDateObj.getMonth()]}-${prevDateObj.getFullYear()}`;
    const nextSlugDate = `${nextDateObj.getDate()}-${months[nextDateObj.getMonth()]}-${nextDateObj.getFullYear()}`;
    const lastYearSlugDate = `${lastYearDateObj.getDate()}-${months[lastYearDateObj.getMonth()]}-${lastYearDateObj.getFullYear()}`;

    // Fetch the specific result for this date from the backend
    let fr = '--';
    let sr = '--';
    try {
        const INTERNAL_API = process.env.INTERNAL_API_URL || "http://127.0.0.1:5000";
        const res = await fetch(`${INTERNAL_API}/api/results/${region}?date=${apiDate}`, {
            next: { revalidate: 60 } // Cached for 60 seconds
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
                fr = data.data.round1_result || '--';
                sr = data.data.round2_result || '--';
            }
        }
    } catch (e) {
        console.error("Failed to fetch result for programmatic page", e);
    }

    return (
        <main className="min-h-screen bg-[#F0F2F5] text-slate-800 pb-32 pt-24 font-sans relative z-10">
            {/* Dynamic Content Schema - NewsArticle */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "NewsArticle",
                        "headline": `${regionName} Teer Result ${formattedDate}`,
                        "description": `Get the verified ${regionName} Teer result for ${formattedDate}.`,
                        "url": `https://teer.club/${slug}`,
                        "datePublished": `${apiDate}T16:00:00.000+05:30`,
                        "dateModified": `${apiDate}T16:00:00.000+05:30`,
                        "author": {
                            "@type": "Organization",
                            "name": "Teer Club"
                        }
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
                        "startDate": `${apiDate}T15:00:00+05:30`,
                        "endDate": `${apiDate}T17:00:00+05:30`,
                        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
                        "eventStatus": "https://schema.org/EventScheduled",
                        "location": {
                            "@type": "VirtualLocation",
                            "url": `https://teer.club/${slug}`
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center min-h-[160px]">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">First Round (FR)</span>
                            <div className="text-5xl font-black text-slate-900">{fr}</div>
                            <span className="text-xs text-slate-500 mt-2">Declared at 4:00 PM</span>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center justify-center min-h-[160px]">
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Second Round (SR)</span>
                            <div className="text-5xl font-black text-slate-900">{sr}</div>
                            <span className="text-xs text-slate-500 mt-2">Declared at 4:50 PM</span>
                        </div>
                    </div>

                    <ShareButtons
                        title={`${regionName} Teer Result - ${formattedDate}`}
                        description={`Check today's live FR/SR ${regionName} winning numbers immediately!`}
                    />

                    {/* Advertisement Placeholder: Between Rounds */}
                    <div className="w-full h-[90px] bg-slate-100/50 rounded-2xl border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest my-8 font-bold">
                        Advertisement Space - Between Rounds
                    </div>

                    <div className="flex gap-4">
                        <Link href="/" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors">
                            View Today&apos;s Live Result
                        </Link>
                        <Link href="/history" className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">
                            {regionName} History
                        </Link>
                    </div>
                </div>

                {/* Automated Link Wheel for Infinite Crawlability */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
                    <Link href={`/${region}-teer-result-${prevSlugDate}`} className="p-4 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 rounded-2xl flex flex-col items-center justify-center group transition-all">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Previous Day</span>
                        <div className="text-sm font-bold text-slate-700 text-center">{formatDateString(prevApiDateStr)}</div>
                    </Link>

                    <Link href={`/${region}-teer-result-${nextSlugDate}`} className="p-4 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 rounded-2xl flex flex-col items-center justify-center group transition-all">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Next Day</span>
                        <div className="text-sm font-bold text-slate-700 text-center">{formatDateString(nextApiDateStr)}</div>
                    </Link>

                    <Link href={`/${region}-teer-result-${lastYearSlugDate}`} className="p-4 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 rounded-2xl flex flex-col items-center justify-center group transition-all">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1 text-center">
                            <span>⏳</span> Last Year
                        </span>
                        <div className="text-sm font-bold text-amber-700 text-center">{formatDateString(lastYearDateObj.toISOString().split('T')[0])}</div>
                    </Link>

                    <Link href={`/${region}-teer-prediction-today`} className="p-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl flex flex-col items-center justify-center group transition-all shadow-md">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 text-center">Expert Analysis</span>
                        <div className="text-sm font-bold text-white text-center">View Predictions</div>
                    </Link>
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

                {/* Grey Hat SEO: Infinite Scroll Trap (Pogo-Sticking Preventer) */}
                <InfiniteScrollTrap />
            </div>
        </main>
    );
}
