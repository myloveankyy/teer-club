import { NextResponse } from 'next/server';

const EMPTY_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

export async function GET() {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
        const sitemapUrl = `${backendUrl}/sitemap.xml`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(sitemapUrl, {
            signal: controller.signal,
            next: { revalidate: 3600 }
        });

        clearTimeout(timeout);

        if (!response.ok) {
            console.warn(`[Sitemap Proxy] Backend returned ${response.status}, serving empty fallback`);
            return new NextResponse(EMPTY_SITEMAP, {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml',
                    'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=59',
                },
            });
        }

        const xml = await response.text();

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        console.error('[Sitemap Proxy] Error fetching from backend:', error);
        // Always return valid XML — never return 500
        return new NextResponse(EMPTY_SITEMAP, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59',
            },
        });
    }
}
