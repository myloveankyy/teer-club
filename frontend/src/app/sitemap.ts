import { MetadataRoute } from 'next'

const BASE_URL = 'https://teer.club'
const API_URL = 'http://127.0.0.1:5000'

export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date()

    // --- Static Pages ---
    const staticPages = [
        { route: '', priority: 1.0, freq: 'daily' as const },
        { route: '/history', priority: 0.9, freq: 'daily' as const },
        { route: '/predictions', priority: 0.9, freq: 'hourly' as const },
        { route: '/dreams', priority: 0.7, freq: 'weekly' as const },
        { route: '/tools', priority: 0.7, freq: 'weekly' as const },
        { route: '/blog', priority: 0.8, freq: 'daily' as const },
        { route: '/winners', priority: 0.8, freq: 'daily' as const },
        { route: '/education', priority: 0.7, freq: 'weekly' as const },
        { route: '/education/teer-dream-number-chart', priority: 0.7, freq: 'weekly' as const },
    ]

    const staticUrls = staticPages.map((p) => ({
        url: `${BASE_URL}${p.route}`,
        lastModified: now,
        changeFrequency: p.freq,
        priority: p.priority,
    }))

    // --- Educational Content ---
    const educationTopics = ['what-is-teer', 'teer-rules', 'how-calculation-works']
    const educationUrls = educationTopics.map((topic) => ({
        url: `${BASE_URL}/education/${topic}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // --- Prediction & Common Number Pages (3 regions) ---
    const regions = ['shillong', 'khanapara', 'juwai']
    const predictionUrls = regions.flatMap((region) => [
        {
            url: `${BASE_URL}/${region}-teer-prediction-today`,
            lastModified: now,
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/${region}-teer-common-number-today`,
            lastModified: now,
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
    ])

    // --- Dynamic Result Pages (last 30 days × 3 regions) ---
    const months = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ]

    const resultUrls: MetadataRoute.Sitemap = []
    for (let i = 0; i < 30; i++) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dateStr = `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`
        const isoDate = d.toISOString().split('T')[0]

        for (const region of regions) {
            // Slug-format URLs (e.g. /shillong-teer-result-5-march-2026)
            resultUrls.push({
                url: `${BASE_URL}/${region}-teer-result-${dateStr}`,
                lastModified: d,
                changeFrequency: i === 0 ? 'hourly' : 'daily',
                priority: i === 0 ? 0.9 : 0.6,
            })
            // API-format URLs (e.g. /results/shillong/2026-03-05)
            resultUrls.push({
                url: `${BASE_URL}/results/${region}/${isoDate}`,
                lastModified: d,
                changeFrequency: i === 0 ? 'hourly' : 'daily',
                priority: i === 0 ? 0.9 : 0.6,
            })
        }
    }

    // --- Blog Posts (fetched from API) ---
    let blogUrls: MetadataRoute.Sitemap = []
    try {
        const res = await fetch(`${API_URL}/api/public/posts?limit=100`, {
            next: { revalidate: 3600 },
        })
        if (res.ok) {
            const data = await res.json()
            if (data.success && Array.isArray(data.data)) {
                blogUrls = data.data.map((post: any) => ({
                    url: `${BASE_URL}/blog/${post.slug}`,
                    lastModified: post.created_at ? new Date(post.created_at) : now,
                    changeFrequency: 'weekly' as const,
                    priority: 0.75,
                }))
            }
        }
    } catch (err) {
        console.error('[Sitemap] Failed to fetch blog posts:', err)
    }

    return [...staticUrls, ...educationUrls, ...predictionUrls, ...resultUrls, ...blogUrls]
}
