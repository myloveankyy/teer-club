import type { Metadata } from "next";
import api from "@/lib/api";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section } from "@/components/ui/Grid";
import { PredictionCard } from "@/components/ui/PredictionCard";
import { Button } from "@/components/ui/Button";
import { DarkHero, HeroBadge } from "@/components/layout/DarkHero";

interface PageProps {
    params: Promise<{ game: string; date: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { game, date } = await params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (!isDate) return {};

    const defaultUrl = `/common-numbers/${game}/${date}`;
    let pageData = null;
    try {
        const res = await api.pages.getByUrl(defaultUrl);
        if (res.data?.success && res.data?.data) {
            pageData = res.data.data;
        }
    } catch (e) {}

    const formattedDate = new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const gameNameDisplay = game.charAt(0).toUpperCase() + game.slice(1);

    return {
        title: pageData?.meta_title || `${gameNameDisplay} Common Number Today ${formattedDate} - Hit Number`,
        description: pageData?.meta_description || `Get 100% verified ${gameNameDisplay} Teer Common Number for ${formattedDate} today. Highly accurate hit numbers, house and ending predictions.`,
        keywords: [
            `${gameNameDisplay} Teer Common Number`,
            `${gameNameDisplay} Teer Hit Number Today`,
            `${gameNameDisplay} Teer Target Today`,
            `${gameNameDisplay} Teer House Ending`,
            `${gameNameDisplay} Common Number ${formattedDate}`,
        ].join(', '),
        alternates: {
            canonical: pageData?.canonical_url || `https://teer.club/common-numbers/${game}/${date}`
        },
        robots: {
            index: pageData?.indexed ?? true,
            follow: true,
        }
    };
}

export default async function GameDateCommonNumbersPage({ params }: PageProps) {
    const { game, date } = await params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(date);

    if (!isDate) {
        notFound();
    }

    let prediction: any = null;
    let formattedDate = new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    
    const defaultUrl = `/common-numbers/${game}/${date}`;
    let pageData = null;
    try {
        const res = await api.pages.getByUrl(defaultUrl);
        if (res.data?.success && res.data?.data) {
            pageData = res.data.data;
        }
    } catch (e) {}

    try {
        const res = await api.predictions.getByDate(date);
        if (res.data.success) {
            // Filter predictions by game
            const allPredictions = res.data.data.predictions;
            prediction = allPredictions.find((p: any) => 
                p.game?.name.toLowerCase() === game.toLowerCase() || 
                p.gameId === game ||
                p.game?.displayName.toLowerCase() === game.toLowerCase()
            );

            if (!prediction) {
                notFound();
            }
        } else {
            notFound();
        }
    } catch (err) {
        console.error("Failed to fetch predictions for parameter:", err);
        notFound();
    }

    const gameNameDisplay = (prediction?.game?.displayName || game).replace(/Teer|teer/g, "").trim();

    return (
        <PageLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": `${gameNameDisplay} Teer Targets - ${formattedDate}`,
                        "description": `Teer target numbers for ${gameNameDisplay} on ${formattedDate}. Verified house, ending and hit numbers.`,
                        "url": `https://teer.club/common-numbers/${game}/${date}`,
                        "datePublished": date,
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
                        { label: gameNameDisplay, href: `/${game}` },
                        { label: formattedDate }
                    ]}
                    title={<span dangerouslySetInnerHTML={{ __html: pageData?.title || `${formattedDate} <br/> <span class="text-blue-500">${gameNameDisplay} Targets</span>` }} />}
                    badges={
                        <HeroBadge variant="amber">Predicted Target</HeroBadge>
                    }
                >
                    {pageData?.content ? (
                        <div className="mt-6 text-sm md:text-base text-blue-200/80 leading-relaxed max-w-2xl font-medium" dangerouslySetInnerHTML={{ __html: pageData.content }} />
                    ) : (
                        <p className="mt-6 text-sm md:text-base text-blue-200/80 leading-relaxed max-w-2xl font-medium">
                            100% Verified Teer Common Numbers. Get today's {gameNameDisplay} hit numbers, house, and ending predictions.
                        </p>
                    )}
                </DarkHero>

                {/* Data Section */}
                <Section background="white" className="py-12 lg:py-24">
                    <Container>
                        <div className="max-w-2xl mx-auto flex flex-col gap-6 lg:gap-10">
                            <div className="flex flex-col gap-2 lg:gap-3 border-b-4 border-blue-600 w-fit pb-3 lg:pb-4 mx-auto items-center">
                                <div className="flex items-center gap-3 lg:gap-4">
                                    <h2 className="text-xl lg:text-2xl font-bold text-[#111827] uppercase leading-none">Target Numbers</h2>
                                </div>
                                <span className="text-[10px] lg:text-[12px] font-medium text-gray-500 text-center">Calculated Prediction for {formattedDate}</span>
                            </div>
                            
                            <div className="grid gap-6 lg:gap-8">
                                <PredictionCard
                                    game={gameNameDisplay}
                                    directNumbers={[prediction.directNumber, ...prediction.commonNumbers.slice(0, 4)]}
                                    houseNumbers={prediction.house ? prediction.house.split(',').map((s: string) => s.trim()) : []}
                                    endingNumbers={prediction.ending ? prediction.ending.split(',').map((s: string) => s.trim()) : []}
                                />
                            </div>

                            <div className="mt-12 text-center flex flex-col sm:flex-row justify-center gap-4">
                                <Button href="/common-numbers" variant="secondary" className="!px-8 py-4 shadow-sm">
                                    ← All Common Numbers
                                </Button>
                                <Button href={`/match-proofs/${game}/${date}`} variant="primary" className="!px-8 py-4 shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
                                    View Match Proof →
                                </Button>
                            </div>
                        </div>
                    </Container>
                </Section>
            </main>
        </PageLayout>
    );
}
