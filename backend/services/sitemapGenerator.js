const fs = require('fs');
const path = require('path');
const db = require('../db'); // Assuming db is at ../db from services

const BASE_URL = 'https://teer.club';

async function generateStaticSitemap() {
    try {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        const addUrl = (loc, freq, prio) => {
            const dateStr = new Date().toISOString().split('T')[0]; // Valid W3C Format: YYYY-MM-DD
            xml += `  <url>\n`;
            xml += `    <loc>${BASE_URL}${loc}</loc>\n`;
            xml += `    <lastmod>${dateStr}</lastmod>\n`;
            xml += `    <changefreq>${freq}</changefreq>\n`;
            xml += `    <priority>${prio}</priority>\n`;
            xml += `  </url>\n`;
        };

        // Static Core Pages
        addUrl('', 'daily', '1.0');
        addUrl('/history', 'daily', '0.9');
        addUrl('/predictions', 'hourly', '0.9');
        addUrl('/dreams', 'weekly', '0.7');
        addUrl('/tools', 'weekly', '0.7');
        addUrl('/blog', 'daily', '0.8');
        addUrl('/winners', 'daily', '0.8');

        // Target Prediction Landing Pages
        addUrl('/predictions/shillong-teer-prediction-today', 'hourly', '0.95');
        addUrl('/predictions/khanapara-teer-lucky-number-today', 'hourly', '0.95');
        addUrl('/predictions/juwai-teer-common-number-today', 'hourly', '0.95');

        // Blog Posts
        try {
            const { rows } = await db.query('SELECT slug FROM posts WHERE is_published = true');
            rows.forEach(post => {
                addUrl(`/blog/${post.slug}`, 'weekly', '0.75');
            });
        } catch (err) {
            console.error('[Sitemap Generator] Failed to fetch blog slugs:', err.message);
        }

        // Programmatic SEO Pages (Last 30 Days)
        const regions = ['shillong', 'khanapara', 'juwai'];
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            regions.forEach(region => {
                addUrl(`/results/${region}/${dateStr}`, i === 0 ? 'hourly' : 'daily', i === 0 ? '0.9' : '0.6');
            });
        }

        xml += '</urlset>';

        // Write directly to Next.js public directory
        const sitemapPath = path.join(__dirname, '../../frontend/public/sitemap.xml');
        fs.writeFileSync(sitemapPath, xml);
        console.log(`[Sitemap Generator] Successfully generated static sitemap.xml with ${regions.length * 30 + 7} base URLs!`);
        return true;
    } catch (e) {
        console.error('[Sitemap Generator] Error:', e);
        return false;
    }
}

module.exports = { generateStaticSitemap };

// If run directly for testing
if (require.main === module) {
    generateStaticSitemap().then(() => process.exit(0));
}
