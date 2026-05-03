import { Metadata } from "next";
import { notFound } from "next/navigation";
import api from "@/lib/api";
import { PageLayout } from "@/components/shared/PageLayout";
import { Section, Container } from "@/components/ui/Grid";
import { ResultsList } from "@/components/ResultsList";

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
                <Section background="white" className="!py-16 md:!py-24 border-b border-gray-100">
                    <Container>
                        <div className="max-w-3xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold text-primary bg-primary/5 uppercase">
                                Programmatic SEO Record
                            </div>
                            <h1 className="text-h1 text-gray-900 leading-tight mb-6">
                                {h1Title}
                            </h1>
                            <div className="text-lg text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: bodyContent }} />
                        </div>
                    </Container>
                </Section>
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
