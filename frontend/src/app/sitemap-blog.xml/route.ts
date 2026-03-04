export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = 'https://teer.club';
    const staticPages = [
        'what-is-teer',
        'teer-rules',
        'how-teer-calculation-works',
        'teer-dream-number-chart',
        '2026-teer-trend-analysis',
        'most-frequent-numbers-last-1-year',
        'probability-breakdown'
    ];

    const lastMod = new Date().toISOString().split('T')[0];

    let urls = '';
    for (const page of staticPages) {
        urls += `  <url>
    <loc>${baseUrl}/${page}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;

    return new Response(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
