import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Teer Club — Official Teer Results',
        short_name: 'Teer Club',
        description: 'The leading platform for fastest Teer Result Today. Live Shillong, Khanapara & Juwai results.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        orientation: 'portrait-primary',
        categories: ['entertainment', 'news'],
        icons: [
            {
                src: '/favicon.ico',
                sizes: '48x48',
                type: 'image/x-icon',
            },
            {
                src: '/images/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/images/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            }
        ],
    }
}
