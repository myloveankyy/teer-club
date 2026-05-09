import type { Metadata } from "next";
import api from "@/lib/api";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section } from "@/components/ui/Grid";
import { PredictionCard } from "@/components/ui/PredictionCard";
import { MatchProofCard } from "@/components/ui/MatchProofCard";
import { Button } from "@/components/ui/Button";
import { DarkHero, HeroBadge } from "@/components/layout/DarkHero";
import { TrafficGrid } from "@/components/layout/TrafficGrid";
import { generateSemanticIntro, generateFAQSchema } from "@/lib/seo-spinner";

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
};

interface PageProps {
    params: Promise<{ game: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { game } = await params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(game);
    const defaultUrl = `/common-numbers/${game}`;

    let pageData = null;
    try {
        const res = await api.pages.getByUrl(defaultUrl);
        if (res.data?.success && res.data?.data) {
            pageData = res.data.data;
        }
    } catch (e) {}

    if (isDate) {
        const formattedDate = new Date(game).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
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
                canonical: pageData?.canonical_url || `https://teer.club/common-numbers/${game}`
            },
            robots: {
                index: pageData?.indexed ?? true,
                follow: true,
            }
        };
    } else {
        const gameNameDisplay = game.charAt(0).toUpperCase() + game.slice(1);
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
                canonical: pageData?.canonical_url || `https://teer.club/common-numbers/${game}`
            },
            robots: {
                index: pageData?.indexed ?? true,
                follow: true,
            }
        };
    }
}

export default async function CommonNumbersDatePage({ params }: PageProps) {
    const { game } = await params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(game);

    let predictions: any[] = [];
    let formattedDate = "";
    
    const defaultUrl = `/common-numbers/${game}`;
    let pageData = null;
    try {
        const res = await api.pages.getByUrl(defaultUrl);
        if (res.data?.success && res.data?.data) {
            pageData = res.data.data;
        }
    } catch (e) {}

    try {
        if (isDate) {
            const res = await api.predictions.getByDate(game);
            if (res.data?.success) {
                predictions = res.data.data.predictions;
                formattedDate = new Date(game).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
            } else {
                notFound();
            }
        } else {
            const res = await api.predictions.getToday(game);
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
    } catch (err: any) {
        console.error("Failed to fetch predictions for parameter:", err);
        if (err?.status !== 404) {
            throw new Error(`API Error: ${err.message || 'Failed to fetch predictions'}`);
        }
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
                        "url": `https://teer.club/common-numbers/${game}`,
                        "datePublished": isDate ? game : new Date().toISOString().split('T')[0],
                        "publisher": {
                            "@type": "Organization",
                            "name": "Teer Club"
                        }
                    })
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema(isDate ? 'Teer' : game, 'common-numbers', formattedDate)) }}
            />
            <main className="flex-1">
                <DarkHero
                    breadcrumbs={[
                        { label: "Home", href: "/" },
                        { label: "Common Numbers", href: "/common-numbers" },
                        { label: isDate ? formattedDate : `${game.charAt(0).toUpperCase() + game.slice(1)} Teer` }
                    ]}
                    title={<span dangerouslySetInnerHTML={{ __html: pageData?.title || `${formattedDate || game.charAt(0).toUpperCase() + game.slice(1)} <span class="text-indigo-400">Targets</span>` }} />}
                    badges={
                        <HeroBadge variant="amber">Historical Database</HeroBadge>
                    }
                >
                    {/* Micro-timestamping for Google Indexing freshness */}
                    <time dateTime={new Date().toISOString()} className="hidden">Last Updated: {new Date().toISOString()}</time>

                    {pageData?.content ? (
                        <div className="mt-4 text-sm md:text-base text-indigo-200/80 leading-relaxed max-w-2xl font-medium" dangerouslySetInnerHTML={{ __html: pageData.content }} />
                    ) : (
                        <div className="mt-4 text-sm md:text-base text-indigo-200/80 leading-relaxed max-w-2xl font-medium" dangerouslySetInnerHTML={{ __html: generateSemanticIntro(isDate ? 'Teer' : game, 'common-numbers', formattedDate) }} />
                    )}

                    {!pageData?.content && !isDate && (
                        <div className="mt-4 pt-4 border-t border-indigo-500/30 max-w-2xl">
                            <p className="text-sm text-indigo-200/80">
                                Want to verify our predictions? Check the official <a href={`/results/${game}`} className="font-bold text-indigo-300 hover:text-white underline decoration-indigo-400/50 underline-offset-4">{game.charAt(0).toUpperCase() + game.slice(1)} Teer Results</a> archive.
                            </p>
                        </div>
                    )}
                </DarkHero>

                <TrafficGrid />

                {/* Data Section — Per-Game Paired Layout */}
                <Section background="white" className="!py-8 lg:!py-14">
                    <Container>
                        <div className="flex flex-col gap-6 lg:gap-8">
                            {predictions.map((p: any, idx: number) => (
                                <div key={p.id} className="flex flex-col gap-3">
                                    {/* Game Section Header */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="h-7 w-7 bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center rounded-lg font-bold text-[10px] shadow-sm">
                                            {String(idx + 1).padStart(2, '0')}
                                        </div>
                                        <h2 className="text-base lg:text-lg font-bold text-gray-900 uppercase tracking-tight leading-none">
                                            {(p.game?.displayName || p.gameId).replace(/Teer|teer/g, "").trim()} Teer
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                        <PredictionCard
                                            game={(p.game?.displayName || p.gameId).replace(/Teer|teer/g, "").trim()}
                                            directNumbers={[p.directNumber, ...p.commonNumbers.slice(0, 4)]}
                                            houseNumbers={p.house ? p.house.split(',').map((s: string) => s.trim()) : []}
                                            endingNumbers={p.ending ? p.ending.split(',').map((s: string) => s.trim()) : []}
                                        />
                                        <MatchProofCard
                                            date={formattedDate}
                                            game={(p.game?.displayName || p.gameId).replace(/Teer|teer/g, "").trim()}
                                            numbers={[p.directNumber, ...p.commonNumbers.slice(0, 4)]}
                                            result={p.actualResult || "PENDING"}
                                            compact={true}
                                            matchDetails={{
                                                house: p.houseMatch,
                                                ending: p.endingMatch,
                                                direct: p.directMatch
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <Button href="/common-numbers" variant="secondary" className="!px-10 py-4 text-[10px] shadow-lg">
                                ← Back to All Targets
                            </Button>
                        </div>
                    </Container>
                </Section>
            </main>
        </PageLayout>
    );
}
