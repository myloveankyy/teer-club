import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teer.club';
    let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const sitemaps = [
        `${baseUrl}/sitemap-results.xml`,
        `${baseUrl}/sitemap-predictions.xml`,
        `${baseUrl}/sitemap-blog.xml`
    ];

    for (const url of sitemaps) {
        sitemapIndex += `  <sitemap>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n`;
    }

    sitemapIndex += `</sitemapindex>`;

    return new NextResponse(sitemapIndex, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
