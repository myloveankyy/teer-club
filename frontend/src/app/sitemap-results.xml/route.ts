import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://teer.club';
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    const regions = ['shillong', 'khanapara', 'juwai'];
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    // Generate dates for the last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;
        const lastMod = d.toISOString().split('T')[0] + 'T17:00:00+05:30';

        for (const region of regions) {
            sitemap += `  <url>\n    <loc>${baseUrl}/${region}-teer-result-${dateStr}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }
    }

    sitemap += `</urlset>`;

    return new NextResponse(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
