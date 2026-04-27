import { MetadataRoute } from "next";
import { blogPosts } from "@/data/blogs";

const BASE_URL = "https://teer.club";

// Comprehensive game list — kept in sync with DB games
const GAMES = [
    "shillong",
    "khanapara",
    "juwai",
    "jowai-ladrymbai",
    "laitlyngkot",
    "bhutan-day",
    "arunachal",
    "manipur",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // ─── Static Pages ──────────────────────────────────────────────────────
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: "hourly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/live`,
            lastModified: now,
            changeFrequency: "hourly",
            priority: 0.95,
        },
        {
            url: `${BASE_URL}/results`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/common-numbers`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.85,
        },
        {
            url: `${BASE_URL}/dream-numbers`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/teer-guide`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/blogs`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/disclaimer`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${BASE_URL}/privacy-policy`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.2,
        },
    ];

    // ─── Per-Game Pages (live + history + previous-results) ────────────────
    const gamePages: MetadataRoute.Sitemap = GAMES.flatMap((game) => [
        {
            url: `${BASE_URL}/results/${game}/live`,
            lastModified: now,
            changeFrequency: "hourly" as const,
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/results/${game}`,
            lastModified: now,
            changeFrequency: "daily" as const,
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/results/${game}/previous-results`,
            lastModified: now,
            changeFrequency: "daily" as const,
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/${game}`,
            lastModified: now,
            changeFrequency: "daily" as const,
            priority: 0.7,
        },
    ]);

    // ─── Blog Pages ────────────────────────────────────────────────────────
    const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
        url: `${BASE_URL}/blogs/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    // ─── Common Numbers Dated Pages (last 30 days) ─────────────────────────
    const commonNumberPages: MetadataRoute.Sitemap = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (d.getDay() === 0) continue; // Skip Sundays
        const dateStr = d.toISOString().split("T")[0];
        commonNumberPages.push({
            url: `${BASE_URL}/common-numbers/${dateStr}`,
            lastModified: d,
            changeFrequency: "daily" as const,
            priority: 0.6,
        });
    }

    return [...staticPages, ...gamePages, ...blogPages, ...commonNumberPages];
}
