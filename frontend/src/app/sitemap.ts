import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://teer.club'
    const now = new Date()

    // --- Static Pages ---
    const staticPages = [
        '',
        '/history',
        '/predictions',
        '/dreams',
        '/tools',
        '/blog',
        '/winners',
        '/education',
        '/education/teer-dream-number-chart',
    ]

    const staticUrls = staticPages.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }))

    // --- Educational Content ---
    const educationTopics = ['what-is-teer', 'teer-rules', 'how-calculation-works']
    const educationUrls = educationTopics.map((topic) => ({
        url: `${baseUrl}/education/${topic}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // --- Prediction & Common Number Pages (3 regions) ---
    const regions = ['shillong', 'khanapara', 'juwai']
    const predictionUrls = regions.flatMap((region) => [
        {
            url: `${baseUrl}/${region}-teer-prediction-today`,
            lastModified: now,
            changeFrequency: 'daily' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/${region}-teer-common-number-today`,
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

        for (const region of regions) {
            resultUrls.push({
                url: `${baseUrl}/${region}-teer-result-${dateStr}`,
                lastModified: d,
                changeFrequency: 'daily' as const,
                priority: 0.9,
            })
        }
    }

    return [...staticUrls, ...educationUrls, ...predictionUrls, ...resultUrls]
}
