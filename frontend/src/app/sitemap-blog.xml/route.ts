import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teer.club';
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const staticPages = [
        'what-is-teer',
        'teer-rules',
        'how-teer-calculation-works',
        'teer-dream-number-chart',
        '2026-teer-trend-analysis',
        'most-frequent-numbers-last-1-year',
        'probability-breakdown'
    ];

    const lastMod = new Date().toISOString().split('T')[0] + 'T00:00:00+05:30';

    for (const page of staticPages) {
        sitemap += `  <url>\n    <loc>${baseUrl}/${page}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    sitemap += `</urlset>`;

    return new NextResponse(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
