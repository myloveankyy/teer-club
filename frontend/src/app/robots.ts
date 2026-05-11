import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/_next/",
                    "/admin/",
                    "/admin-panel/",
                    "/*.json",
                ],
            },
        ],
        // Reference ALL sitemaps — if the index fails, Google still finds sub-sitemaps
        sitemap: [
            "https://teer.club/sitemap.xml",
            "https://teer.club/sitemap-static.xml",
            "https://teer.club/sitemap-results.xml",
            "https://teer.club/sitemap-numbers.xml",
        ],
    };
}
