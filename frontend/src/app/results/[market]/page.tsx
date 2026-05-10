import { Metadata } from "next";
import { notFound } from "next/navigation";
import api from "@/lib/api";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container } from "@/components/ui/Grid";
import { ResultsList } from "@/components/ResultsList";
import { DarkHero, HeroBadge } from "@/components/layout/DarkHero";
import { TrafficGrid } from "@/components/layout/TrafficGrid";
import { generateSemanticIntro, generateFAQSchema, generateDatasetSchema } from "@/lib/seo-spinner";

export const revalidate = 60;

interface PageProps {
    params: Promise<{
        market: string;
    }>;
}

// Pre-generate paths for all enabled games
export async function generateStaticParams() {
    try {
        const res = await api.games.getAll();
        if (res.data?.success && res.data.data) {
            return res.data.data
                .filter((g) => g.isEnabled)
                .map((game) => ({ market: game.name.toLowerCase() }));
        }
    } catch {
        // Build continues without pre-generated paths
    }
    return [];
}

// ─── Extract programmatic SEO tokens from URL ───
// e.g. "shillong-teer-result-2026" => { title: "Shillong Teer Result 2026", market: "shillong" }
function parseMarketSlug(slug: string) {
    if (!slug) return { gameId: "", displayTitle: "" };
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
    const resolvedParams = await params;
    const market = resolvedParams?.market || "";
    const { displayTitle } = parseMarketSlug(market);
    const defaultUrl = `/results/${market}`;

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
        },
        openGraph: {
            title,
            description,
            type: "website",
            locale: "en_IN",
            siteName: "Teer Club",
            url: `https://teer.club${defaultUrl}`,
            images: [{ url: "https://teer.club/images/og-default.png", width: 1200, height: 630, alt: `${displayTitle} Teer Results` }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["https://teer.club/images/og-default.png"],
        }
    };
}

export default async function ProgrammaticMarketPage({ params }: PageProps) {
    const resolvedParams = await params;
    const market = resolvedParams?.market || "";
    const { gameId, displayTitle } = parseMarketSlug(market);
    const defaultUrl = `/results/${market}`;

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
    
    // Use SEO spinner if no custom body content is defined
    const bodyContent = pageData?.content || generateSemanticIntro(market, 'results');
    
    // Check if the market is a valid game or if it has custom pageData
    let isValidGame = false;
    try {
        const gamesRes = await api.games.getAll();
        if (gamesRes.data?.success && gamesRes.data.data) {
            isValidGame = gamesRes.data.data.some((g: any) => g.name.toLowerCase() === gameId.toLowerCase() || g.id.toLowerCase() === gameId.toLowerCase());
        }
    } catch(e: any) {
        if (e?.status !== 404) {
            throw new Error(`API Error: ${e.message || 'Failed to validate game existence'}`);
        }
    }

    if (!isValidGame && !pageData) {
        notFound();
    }

    const faqSchema = generateFAQSchema(market, 'results');
    const datasetSchema = generateDatasetSchema(market);

    return (
        <PageLayout>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
            />
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
                    {/* Micro-timestamping for Google Indexing freshness */}
                    <time dateTime={new Date().toISOString().split('T')[0]} className="hidden">Last Updated</time>

                    {bodyContent && (
                        <div className="text-base text-indigo-100 mt-6 max-w-2xl" dangerouslySetInnerHTML={{ __html: bodyContent }} />
                    )}
                    
                    {!pageData?.content && (
                        <div className="mt-4 pt-4 border-t border-indigo-500/30 max-w-2xl">
                            <p className="text-sm text-indigo-200/80">
                                Looking for predictions? Check out our mathematically calculated <a href={`/common-numbers/${gameId}`} className="font-bold text-indigo-300 hover:text-white underline decoration-indigo-400/50 underline-offset-4">{displayTitle} Common Numbers</a> for today.
                            </p>
                        </div>
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
