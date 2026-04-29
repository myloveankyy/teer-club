import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Get backend URL from env, or assume localhost in dev
        const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
        const sitemapUrl = `${backendUrl}/sitemap.xml`;

        const response = await fetch(sitemapUrl, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            return new NextResponse('Sitemap not found or backend error', { status: 404 });
        }

        const xml = await response.text();

        return new NextResponse(xml, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
            },
        });
    } catch (error) {
        console.error('Sitemap proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
