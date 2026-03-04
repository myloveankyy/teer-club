import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teer.club';
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const regions = ['shillong', 'khanapara', 'juwai'];
    const lastMod = new Date().toISOString().split('T')[0] + 'T00:01:00+05:30';

    for (const region of regions) {
        // Today's prediction
        sitemap += `  <url>\n    <loc>${baseUrl}/${region}-teer-prediction-today</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        // Today's common number
        sitemap += `  <url>\n    <loc>${baseUrl}/${region}-teer-common-number-today</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    sitemap += `</urlset>`;

    return new NextResponse(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
