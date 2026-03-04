export const dynamic = 'force-dynamic';

export async function GET() {
    const baseUrl = 'https://teer.club';
    const regions = ['shillong', 'khanapara', 'juwai'];
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    let urls = '';
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`;
        const lastMod = d.toISOString().split('T')[0];

        for (const region of regions) {
            urls += `  <url>
    <loc>${baseUrl}/${region}-teer-result-${dateStr}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>\n`;
        }
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
