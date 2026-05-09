import type { Metadata } from "next";
import api from "@/lib/api";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/shared/PageLayout";
import { Container, Section } from "@/components/ui/Grid";
import { MatchProofCard } from "@/components/ui/MatchProofCard";
import { Button } from "@/components/ui/Button";
import { DarkHero, HeroBadge } from "@/components/layout/DarkHero";
import { generateSemanticIntro } from "@/lib/seo-spinner";

interface PageProps {
    params: Promise<{ game: string; date: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { game, date } = await params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (!isDate) return {};

    const defaultUrl = `/match-proofs/${game}/${date}`;
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
        title: pageData?.meta_title || `${gameNameDisplay} Match Proof ${formattedDate} - Teer Result Verification`,
        description: pageData?.meta_description || `See the verified ${gameNameDisplay} Teer match proof for ${formattedDate}. Check our accuracy with direct hits, house, and ending matches against live results.`,
        keywords: [
            `${gameNameDisplay} Match Proof ${formattedDate}`,
            `${gameNameDisplay} Teer Result Verification`,
            `${gameNameDisplay} Target Success`,
            `Teer Match Proof`,
        ].join(', '),
        alternates: {
            canonical: pageData?.canonical_url || `https://teer.club/match-proofs/${game}/${date}`
        },
        robots: {
            index: pageData?.indexed ?? true,
            follow: true,
        }
    };
}

export default async function GameDateMatchProofPage({ params }: PageProps) {
    const { game, date } = await params;
    const isDate = /^\d{4}-\d{2}-\d{2}$/.test(date);

    if (!isDate) {
        notFound();
    }

    let prediction: any = null;
    let formattedDate = new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    
    const defaultUrl = `/match-proofs/${game}/${date}`;
    let pageData = null;
    try {
        const res = await api.pages.getByUrl(defaultUrl);
        if (res.data?.success && res.data?.data) {
            pageData = res.data.data;
        }
    } catch (e) {}

    try {
        const res = await api.predictions.getByDate(date);
        if (res.data?.success) {
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
        console.error("Failed to fetch match proof for parameter:", err);
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
                        "name": `${gameNameDisplay} Teer Match Proof - ${formattedDate}`,
                        "description": `Verified Teer match proof for ${gameNameDisplay} on ${formattedDate}. Compare our target predictions with actual results.`,
                        "url": `https://teer.club/match-proofs/${game}/${date}`,
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
                        { label: `Proof: ${formattedDate}` }
                    ]}
                    title={<span dangerouslySetInnerHTML={{ __html: pageData?.title || `${formattedDate} <br/> <span class="text-green-500">${gameNameDisplay} Proof</span>` }} />}
                    badges={
                        <HeroBadge variant="emerald">Verified Accuracy</HeroBadge>
                    }
                >
                    {/* Micro-timestamping for Google Indexing freshness */}
                    <time dateTime={new Date().toISOString()} className="hidden">Last Updated: {new Date().toISOString()}</time>

                    {pageData?.content ? (
                        <div className="mt-6 text-sm md:text-base text-green-100/80 leading-relaxed max-w-2xl font-medium" dangerouslySetInnerHTML={{ __html: pageData.content }} />
                    ) : (
                        <div className="mt-6 text-sm md:text-base text-green-100/80 leading-relaxed max-w-2xl font-medium" dangerouslySetInnerHTML={{ __html: generateSemanticIntro(isDate ? 'Teer' : game, 'match-proofs', formattedDate) }} />
                    )}
                </DarkHero>

                {/* Data Section */}
                <Section background="white" className="py-12 lg:py-24 bg-gray-50/50">
                    <Container>
                        <div className="max-w-2xl mx-auto flex flex-col gap-6 lg:gap-10">
                            <div className="flex flex-col gap-2 lg:gap-3 border-b-4 border-green-600 w-fit pb-3 lg:pb-4 mx-auto items-center">
                                <div className="flex items-center gap-3 lg:gap-4">
                                    <h2 className="text-xl lg:text-2xl font-bold text-[#111827] uppercase leading-none">Match Verification</h2>
                                </div>
                                <span className="text-[10px] lg:text-[12px] font-medium text-gray-500 text-center">Comparing Target vs Result for {formattedDate}</span>
                            </div>
                            
                            <div className="grid gap-6 lg:gap-8">
                                <MatchProofCard
                                    date={formattedDate}
                                    game={gameNameDisplay}
                                    numbers={[prediction.directNumber, ...prediction.commonNumbers.slice(0, 4)]}
                                    result={prediction.actualResult || "PENDING"}
                                    matchDetails={{
                                        house: prediction.houseMatch,
                                        ending: prediction.endingMatch,
                                        direct: prediction.directMatch
                                    }}
                                />
                            </div>

                            <div className="mt-12 text-center flex flex-col sm:flex-row justify-center gap-4">
                                <Button href={`/common-numbers/${game}/${date}`} variant="secondary" className="!px-8 py-4 shadow-sm">
                                    ← Back to Target Numbers
                                </Button>
                                <Button href="/common-numbers" variant="primary" className="!px-8 py-4 shadow-xl shadow-gray-900/10 bg-gray-900 hover:bg-black text-white">
                                    View Today's Targets →
                                </Button>
                            </div>
                        </div>
                    </Container>
                </Section>
            </main>
        </PageLayout>
    );
}
