import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Live Teer Results Today | Shillong, Khanapara, Juwai Result Hub",
    description:
        "Get 100% verified Live Teer Results Today. Fast archery result updates for Shillong Teer, Khanapara Teer, and Juwai markets. Official round 1 and round 2 results filtered for trust.",
    keywords: [
        "live teer result today",
        "Shillong teer live result",
        "Khanapara teer live result",
        "Juwai teer live result",
        "teer result today live",
        "archery result today",
        "official teer results hub",
    ],
    openGraph: {
        title: "Official Live Teer Results Today - Fast & Verified",
        description: "Experience the fastest live teer result updates for all markets. Verified archery results updated every budget interval.",
        type: "website",
        locale: "en_US",
        siteName: "Teer Club",
        url: "https://teer.club/live",
    },
    twitter: {
        card: "summary_large_image",
        title: "Live Teer Results Hub",
        description: "Fastest verified Teer result updates for Shillong and Khanapara.",
    },
    alternates: {
        canonical: "https://teer.club/live",
    },
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Live Teer Results",
        description: "Live Teer results for all markets",
        url: "https://teer.club/live",
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
