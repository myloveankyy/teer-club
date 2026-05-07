import type { Metadata } from "next";
import api from "@/lib/api";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section, Grid } from "@/components/ui/Grid";
import { PredictionCard } from "@/components/ui/PredictionCard";
import { MatchProofCard } from "@/components/ui/MatchProofCard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DarkHero, HeroBadge } from "@/components/layout/DarkHero";
import { TrafficGrid } from "@/components/layout/TrafficGrid";

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
};

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(slug);
    const defaultUrl = `/common-numbers/${slug}`;

    let pageData = null;
    try {
        const res = await api.pages.getByUrl(defaultUrl);
        if (res.data?.success && res.data?.data) {
            pageData = res.data.data;
        }
    } catch (e) {}

    if (isDate) {
        const formattedDate = new Date(slug).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        return {
            title: pageData?.meta_title || `Teer Common Number Today ${formattedDate} - Shillong Khanapara Hit Number`,
            description: pageData?.meta_description || `Get 100% verified Teer Common Number for ${formattedDate} today. Highly accurate Shillong Teer and Khanapara Teer hit numbers, house ending predictions, and live match proofs.`,
            keywords: [
                `Shillong Teer Common Number`,
                `Khanapara Teer Hit Number Today`,
                `Teer Target Today`,
                `Teer House Ending`,
                `Teer Common Number ${formattedDate}`,
                `Shillong Teer Result`,
            ].join(', '),
            alternates: {
                canonical: pageData?.canonical_url || `https://teer.club/common-numbers/${slug}`
            },
            robots: {
                index: pageData?.indexed ?? true,
                follow: true,
            }
        };
    } else {
        const gameNameDisplay = slug.charAt(0).toUpperCase() + slug.slice(1);
        return {
            title: pageData?.meta_title || `${gameNameDisplay} Teer Common Number Today - Hit Number & Target`,
            description: pageData?.meta_description || `Get the 100% verified ${gameNameDisplay} Teer Common Number today. Find out highly accurate ${gameNameDisplay} hit numbers, house/ending targets, and match proofs.`,
            keywords: [
                `${gameNameDisplay} Teer Common Number`,
                `${gameNameDisplay} Teer Hit Number Today`,
                `${gameNameDisplay} Teer Target Today`,
                `${gameNameDisplay} Teer House Ending`,
            ].join(', '),
            alternates: {
                canonical: pageData?.canonical_url || `https://teer.club/common-numbers/${slug}`
            },
            robots: {
                index: pageData?.indexed ?? true,
                follow: true,
            }
        };
    }
}

export default async function CommonNumbersDatePage({ params }: PageProps) {
    const { slug } = await params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(slug);

    let predictions: any[] = [];
    let formattedDate = "";
    
    const defaultUrl = `/common-numbers/${slug}`;
    let pageData = null;
    try {
        const res = await api.pages.getByUrl(defaultUrl);
        if (res.data?.success && res.data?.data) {
            pageData = res.data.data;
        }
    } catch (e) {}

    try {
        if (isDate) {
            const res = await api.predictions.getByDate(slug);
            if (res.data?.success) {
                predictions = res.data.data.predictions;
                formattedDate = new Date(slug).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
            } else {
                notFound();
            }
        } else {
            const res = await api.predictions.getToday(slug);
            if (res.data?.success) {
                const singlePrediction = res.data.data;
                predictions = [singlePrediction];
                if (singlePrediction.date) {
                    formattedDate = new Date(singlePrediction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                }
            } else {
                notFound();
            }
        }
    } catch (err) {
        console.error("Failed to fetch predictions for parameter:", err);
        notFound();
    }

    return (
        <PageLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": `${formattedDate} Teer Targets - Prediction Report`,
                        "description": `Teer target numbers for ${formattedDate}. Verified house, ending and hit numbers for Shillong and Khanapara.`,
                        "url": `https://teer.club/common-numbers/${slug}`,
                        "datePublished": isDate ? slug : new Date().toISOString().split('T')[0],
                        "publisher": {
                            "@type": "Organization",
                            "name": "Teer Club"
                        }
                    })
                }}
            />
            <main className="flex-1">
                <DarkHero
                    breadcrumbs={[
                        { label: "Home", href: "/" },
                        { label: "Common Numbers", href: "/common-numbers" },
                        { label: isDate ? formattedDate : `${slug.charAt(0).toUpperCase() + slug.slice(1)} Teer` }
                    ]}
                    title={<span dangerouslySetInnerHTML={{ __html: pageData?.title || `${formattedDate || slug.charAt(0).toUpperCase() + slug.slice(1)} <span class="text-indigo-400">Targets</span>` }} />}
                    badges={
                        <HeroBadge variant="amber">Historical Database</HeroBadge>
                    }
                >
                    {pageData?.content ? (
                        <div className="mt-6 text-sm md:text-base text-indigo-200/80 leading-relaxed max-w-2xl font-medium" dangerouslySetInnerHTML={{ __html: pageData.content }} />
                    ) : (
                        <p className="mt-6 text-sm md:text-base text-indigo-200/80 leading-relaxed max-w-2xl font-medium">
                            100% Verified Teer Common Numbers. Daily Shillong, Khanapara, and Juwai Teer hit numbers, house, and ending predictions.
                        </p>
                    )}
                </DarkHero>

                <TrafficGrid />

                {/* Data Section */}
                <Section background="white" className="py-12 lg:py-24">
                    <Container>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                            {/* Predictions Column */}
                            <div className="flex flex-col gap-6 lg:gap-10">
                                <div className="flex flex-col gap-2 lg:gap-3 border-b-4 border-blue-600 w-fit pb-3 lg:pb-4">
                                    <div className="flex items-center gap-3 lg:gap-4">
                                        <div className="h-8 lg:h-10 w-8 lg:w-10 bg-[#111827] text-white flex items-center justify-center rounded-xl font-bold text-sm lg:text-lg shadow-md" aria-hidden="true">01</div>
                                        <h2 className="text-xl lg:text-2xl font-bold text-[#111827] uppercase leading-none">Today Target Numbers</h2>
                                    </div>
                                    <span className="text-[10px] lg:text-[12px] font-medium text-gray-500 pl-11 lg:pl-14">Predicted numbers based on previous results & patterns</span>
                                </div>
                                <div className="grid gap-6 lg:gap-8">
                                    {predictions.map((p: any) => (
                                        <PredictionCard
                                            key={p.id}
                                            game={(p.game?.displayName || p.gameId).replace(/Teer|teer/g, "").trim()}
                                            directNumbers={[p.directNumber, ...p.commonNumbers.slice(0, 4)]}
                                            houseNumbers={p.house ? p.house.split(',').map((s: string) => s.trim()) : []}
                                            endingNumbers={p.ending ? p.ending.split(',').map((s: string) => s.trim()) : []}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Proof Column */}
                            <div className="flex flex-col gap-6 lg:gap-10">
                                <div className="flex flex-col gap-2 lg:gap-3 border-b-4 border-green-600 w-fit pb-3 lg:pb-4">
                                    <div className="flex items-center gap-3 lg:gap-4">
                                        <div className="h-8 lg:h-10 w-8 lg:w-10 bg-green-600 text-white flex items-center justify-center rounded-xl font-bold text-sm lg:text-lg shadow-md" aria-hidden="true">02</div>
                                        <h2 className="text-xl lg:text-2xl font-bold text-[#111827] uppercase leading-none">Match Proof</h2>
                                    </div>
                                    <span className="text-[9px] lg:text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-11 lg:pl-14">Verified Win Record</span>
                                </div>
                                <div className="grid gap-6 lg:gap-8">
                                    {predictions.map((p: any) => (
                                        <MatchProofCard
                                            key={p.id}
                                            date={formattedDate}
                                            game={(p.game?.displayName || p.gameId).replace(/Teer|teer/g, "").trim()}
                                            numbers={[p.directNumber, ...p.commonNumbers.slice(0, 4)]}
                                            result={p.actualResult || "PENDING"}
                                            matchDetails={{
                                                house: p.houseMatch,
                                                ending: p.endingMatch,
                                                direct: p.directMatch
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-24 text-center">
                            <Button href="/common-numbers" variant="secondary" className="!px-12 py-5 text-[10px] shadow-2xl shadow-gray-100">
                                ← Return to Command Center
                            </Button>
                        </div>
                    </Container>
                </Section>
            </main>
        </PageLayout>
    );
}
