import type { Metadata } from "next";
import { notFound } from "next/navigation";
import api from "@/lib/api";
import { GamePageClient } from "./GamePageClient";

// ISR: Revalidate every 30 seconds for fresh results
export const revalidate = 30;

interface PageProps {
    params: Promise<{ gameSlug: string }>;
}

// Helper: Convert "3:30 PM" → "15:30" for ISO datetime in structured data
function convertTo24h(timeStr: string): string {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM|am|pm)?/i);
    if (!match) return '15:30';
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const modifier = match[3]?.toUpperCase();
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mins}`;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { gameSlug } = await params;
    const displayName = gameSlug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");

    // Attempt to fetch real game data for accurate metadata
    let gameName = displayName;
    try {
        const res = await api.games.getById(gameSlug);
        if (res.data?.success && res.data.data) {
            gameName = res.data.data.displayName || displayName;
        }
    } catch {
        // Fallback to slug-derived name
    }

    const title = `${gameName} Teer Result Today Live | Teer Club`;
    const description = `Check ${gameName} Teer Result Today Live (FR & SR). Get latest and previous results updated instantly on Teer Club.`;

    return {
        title,
        description,
        keywords: [
            `${gameName} Teer Result Today`,
            `${gameName} Teer Result`,
            `${gameName} Teer Live Result`,
            "Live Teer Result",
            "Teer Common Number",
            "Teer Result Today",
        ],
        openGraph: {
            title,
            description,
            type: "website",
            locale: "en_IN",
            siteName: "Teer Club",
            url: `https://teer.club/live/${gameSlug}`,
            images: [{ url: "https://teer.club/images/og-default.png", width: 1200, height: 630, alt: `${gameName} Teer Live Result` }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["https://teer.club/images/og-default.png"],
        },
        alternates: {
            canonical: `/live/${gameSlug}`,
        },
    };
}

// ─── Static Params for ISR Pre-generation ────────────────────────────────────
export async function generateStaticParams() {
    try {
        const res = await api.games.getAll();
        if (res.data?.success && res.data.data) {
            return res.data.data
                .filter((g) => g.isEnabled)
                .map((game) => ({
                    gameSlug: game.name.toLowerCase(),
                }));
        }
    } catch {
        // Build continues without pre-generated paths; pages generate on-demand
    }
    return [];
}

// ─── Server Component ────────────────────────────────────────────────────────
export default async function GamePage({ params }: PageProps) {
    const { gameSlug } = await params;

    // Fetch game metadata
    let game = null;
    try {
        const res = await api.games.getById(gameSlug);
        if (res.data?.success && res.data.data) {
            game = res.data.data;
        }
    } catch (error: any) {
        if (error?.status === 404) {
            game = null;
        } else {
            // Fallback object to allow client-side hydration and prevent 500s
            game = {
                id: gameSlug,
                name: gameSlug,
                displayName: gameSlug.split("-").map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
                isEnabled: true
            };
        }
    }

    if (!game) {
        notFound();
    }

    // Fetch today's result for this game
    let todayResult = null;
    let allGames: any[] = [];
    try {
        const res = await api.results.getToday();
        if (res.data?.success && res.data.data?.games) {
            allGames = res.data.data.games;
            const match = res.data.data.games.find(
                (g: any) => g.name.toLowerCase() === gameSlug.toLowerCase()
            );
            if (match) {
                todayResult = match;
            }
        }
    } catch {
        // Silent fail — client will poll
    }

    // Fetch initial history
    let initialHistory: any[] = [];
    try {
        const res = await api.results.getHistory(gameSlug, { page: 1, limit: 10 });
        if (res.data?.success && res.data.data?.results) {
            initialHistory = res.data.data.results;
        }
    } catch {
        // Silent fail — client will fetch
    }

    // JSON-LD: Event Schema (Google-compliant with ALL required fields)
    const todayISO = new Date().toISOString().split('T')[0]; // e.g. "2026-05-18"
    const eventJsonLd = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: `${game.displayName} Teer Result Today`,
        description: `Live ${game.displayName} Teer archery result with First Round and Second Round updates.`,
        url: `https://teer.club/live/${gameSlug}`,
        startDate: `${todayISO}T${game.frTime ? convertTo24h(game.frTime) : '15:30'}:00+05:30`,
        endDate: `${todayISO}T${game.srTime ? convertTo24h(game.srTime) : '17:00'}:00+05:30`,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
        image: ["https://teer.club/images/og-default.png"],
        location: {
            "@type": "Place",
            name: game.location || "North East India",
            address: {
                "@type": "PostalAddress",
                addressRegion: game.location || "Meghalaya",
                addressCountry: "IN",
            },
        },
        organizer: {
            "@type": "Organization",
            name: "Teer Club",
            url: "https://teer.club",
        },
        performer: {
            "@type": "Organization",
            name: `${game.displayName} Teer Association`,
        },
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: `https://teer.club/live/${gameSlug}`,
            validFrom: `${todayISO}T00:00:00+05:30`,
        },
    };

    // JSON-LD: BreadcrumbList
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://teer.club",
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "Live Results",
                item: "https://teer.club/live",
            },
            {
                "@type": "ListItem",
                position: 3,
                name: `${game.displayName} Teer Result`,
                item: `https://teer.club/live/${gameSlug}`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <GamePageClient
                game={game}
                gameSlug={gameSlug}
                todayResult={todayResult}
                initialHistory={initialHistory}
                siblingGames={allGames
                    .filter((g: any) => g.isEnabled && g.name.toLowerCase() !== gameSlug.toLowerCase())
                    .map((g: any) => ({ name: g.name, displayName: g.displayName, location: g.location }))}
            />
        </>
    );
}
