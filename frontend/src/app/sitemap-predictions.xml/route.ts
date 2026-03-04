export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = 'https://teer.club';
    const regions = ['shillong', 'khanapara', 'juwai'];
    const lastMod = new Date().toISOString().split('T')[0];

    let urls = '';
    for (const region of regions) {
        urls += `  <url>
    <loc>${baseUrl}/${region}-teer-prediction-today</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
        urls += `  <url>
    <loc>${baseUrl}/${region}-teer-common-number-today</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
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
