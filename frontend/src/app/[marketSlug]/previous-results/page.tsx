import { Metadata } from "next";
import { PreviousResultsPage } from "@/components/PreviousResultsPage";

interface PageProps {
    params: Promise<{ marketSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { marketSlug } = await params;
    const name = marketSlug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");

    return {
        title: `${name} History | Teer Club`,
        description: `Complete historical results for ${name}.`,
    };
}

export default async function Page({ params }: PageProps) {
    const { marketSlug } = await params;

    // Strip "-teer" if it exists to match DB names (e.g., "shillong-teer" -> "shillong")
    const marketId = marketSlug.replace("-teer", "");

    return <PreviousResultsPage gameId={marketId} />;
}
