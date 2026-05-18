import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PreviousResultsPage } from "@/components/PreviousResultsPage";
import api from "@/lib/api";

export const revalidate = 60; // ISR: 60s for archive pages

interface PageProps {
    params: Promise<{ marketSlug: string }>;
}

// Pre-generate paths for all enabled games
export async function generateStaticParams() {
    try {
        const res = await api.games.getAll();
        if (res.data?.success && res.data.data) {
            return res.data.data
                .filter((g) => g.isEnabled)
                .map((game) => ({ marketSlug: game.name.toLowerCase() }));
        }
    } catch {
        // Build continues without pre-generated paths
    }
    return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { marketSlug } = await params;
    const gameId = marketSlug.replace("-teer", "");
    const fallbackName = gameId.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

    let gameName = fallbackName;
    try {
        const res = await api.games.getById(gameId);
        if (res.data?.success && res.data.data) {
            gameName = res.data.data.displayName || fallbackName;
        }
    } catch {}

    const title = `${gameName} Teer Previous Results | Result List & History | Teer Club`;
    const description = `Check ${gameName} Teer Previous Results with complete FR & SR history. View verified ${gameName} Teer Result List, past counter results, and official archives updated daily on Teer Club.`;

    return {
        title,
        description,
        keywords: [
            `${gameName} Teer Previous Result`,
            `${gameName} Teer Result List`,
            `${gameName} Teer Result History`,
            "Teer Previous Result",
            "Teer Result List",
            "Teer Counter Result",
            "Teer Result History",
        ],
        openGraph: {
            title,
            description,
            type: "website",
            locale: "en_IN",
            siteName: "Teer Club",
            url: `https://teer.club/results/${marketSlug}/previous-results`,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
        alternates: {
            // Canonical must point to the redirect destination, not this path
            canonical: `/results/${marketSlug}/previous-results`,
        },
    };
}

export default async function Page({ params }: PageProps) {
    const { marketSlug } = await params;
    const marketId = marketSlug.replace("-teer", "");

    // Validate if it's a real game to prevent soft-404s on the catch-all route
    let isValidGame = false;
    try {
        const gamesRes = await api.games.getAll();
        if (gamesRes.data?.success && gamesRes.data.data) {
            isValidGame = gamesRes.data.data.some((g: any) => g.name.toLowerCase() === marketId.toLowerCase() || g.id.toLowerCase() === marketId.toLowerCase());
        }
    } catch {
        // Fallback or handle API down
    }

    if (!isValidGame) {
        notFound();
    }

    // JSON-LD: BreadcrumbList
    const gameName = marketId.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://teer.club" },
            { "@type": "ListItem", position: 2, name: "Results", item: "https://teer.club/results" },
            { "@type": "ListItem", position: 3, name: `${gameName} Previous Results`, item: `https://teer.club/results/${marketSlug}/previous-results` },
        ],
    };

    // JSON-LD: Dataset schema
    const datasetJsonLd = {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: `${gameName} Teer Result History`,
        description: `Complete verified archive of ${gameName} Teer results including First Round and Second Round numbers.`,
        url: `https://teer.club/results/${marketSlug}/previous-results`,
        creator: { "@type": "Organization", name: "Teer Club", url: "https://teer.club" },
        temporalCoverage: "2020/..",
        license: "https://teer.club/disclaimer",
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />
            <PreviousResultsPage gameId={marketId} />
        </>
    );
}
