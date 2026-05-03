import { Metadata } from "next";
import { notFound } from "next/navigation";
import api from "@/lib/api";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container } from "@/components/ui/Grid";
import { ResultsList } from "@/components/ResultsList";
import { DarkHero, HeroBadge } from "@/components/layout/DarkHero";
import { TrafficGrid } from "@/components/layout/TrafficGrid";

interface PageProps {
    params: {
        market: string;
    };
}

// ─── Extract programmatic SEO tokens from URL ───
// e.g. "shillong-teer-result-2026" => { title: "Shillong Teer Result 2026", market: "shillong" }
function parseMarketSlug(slug: string) {
    const segments = slug.split("-");
    const game = segments[0] || slug;

    // Auto-generate capitalizations for keywords
    const title = slug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

    return {
        gameId: game,
        displayTitle: title,
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { displayTitle } = parseMarketSlug(params.market);
    const defaultUrl = `/results/${params.market}`;

    let pageData = null;
    try {
        const res = await api.pages.getByUrl(defaultUrl);
        if (res.data?.success && res.data?.data) {
            pageData = res.data.data;
        }
    } catch (e) {
        // Fallback
    }

    const title = pageData?.meta_title || `${displayTitle} | Verified Records`;
    const description = pageData?.meta_description || `Complete historical dataset and insights for ${displayTitle}. View live updates, previous records, and algorithmic analysis.`;

    return {
        title,
        description,
        keywords: [
            displayTitle,
            `${displayTitle} prediction`,
            `${displayTitle} live`,
            `${displayTitle} common numbers`
        ],
        alternates: {
            canonical: pageData?.canonical_url || defaultUrl,
        },
        robots: {
            index: pageData?.indexed ?? true,
            follow: true,
        }
    };
}

export default async function ProgrammaticMarketPage({ params }: PageProps) {
    const { gameId, displayTitle } = parseMarketSlug(params.market);
    const defaultUrl = `/results/${params.market}`;

    let pageData = null;
    try {
        const res = await api.pages.getByUrl(defaultUrl);
        if (res.data?.success && res.data?.data) {
            pageData = res.data.data;
        }
    } catch (e) {
        // Fallback
    }

    const h1Title = pageData?.title || displayTitle;
    const bodyContent = pageData?.content || `Welcome to the official dataset for ${displayTitle}. Here you can analyze recent outcomes, study long-term patterns, and access our optimized programmatic SEO hub for this specific query.`;

    return (
        <PageLayout>
            <main className="flex-1 bg-surface">
                <DarkHero
                    breadcrumbs={[
                        { label: "Home", href: "/" },
                        { label: "Results", href: "/results" },
                        { label: h1Title },
                    ]}
                    title={
                        <>
                            {h1Title.split(' ').slice(0, -1).join(' ')}{" "}
                            <span className="text-indigo-300/80">{h1Title.split(' ').slice(-1)}</span>
                        </>
                    }
                    badges={
                        <HeroBadge>Verified Records</HeroBadge>
                    }
                    cta={{
                        label: "Check Live Results",
                        href: `/results/${gameId}/live`,
                        showLiveDot: true,
                    }}
                >
                    {bodyContent && (
                        <div className="text-base text-indigo-100 mt-6 max-w-2xl" dangerouslySetInnerHTML={{ __html: bodyContent }} />
                    )}
                </DarkHero>

                <TrafficGrid gameId={gameId} />
                {/* Render a filtered ResultsList by gameId */}
                <Section className="!py-16" background="gray">
                    <Container>
                        <h2 className="text-xl font-bold mb-6">Historical Data Archive</h2>
                        <ResultsList />
                    </Container>
                </Section>
            </main>
        </PageLayout>
    );
}
