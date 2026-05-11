import { Metadata } from "next";
import { PreviousResultsPage } from "@/components/PreviousResultsPage";

interface PageProps {
    params: Promise<{ market: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { market } = await params;
    const name = market.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

    return {
        title: `${name} Previous Results History | Teer Club`,
        description: `Check the complete historical results of ${name}. View date-wise first and second round numbers.`,
        alternates: {
            canonical: `https://teer.club/results/${market}/previous-results`,
        },
    };
}

export default async function Page({ params }: PageProps) {
    const { market } = await params;

    // Strip "-teer" if it exists to match DB names (e.g., "shillong-teer" -> "shillong")
    const marketId = market.replace("-teer", "");

    return <PreviousResultsPage gameId={marketId} />;
}
