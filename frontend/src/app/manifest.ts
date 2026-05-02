import { MetadataRoute } from 'next'
import api from '@/lib/api'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    let faviconUrl = '/favicon.ico';
    try {
        const res = await api.settings.get();
        if (res.data?.success && res.data.data.faviconUrl) {
            faviconUrl = res.data.data.faviconUrl;
        }
    } catch (e) { }

    const isIco = faviconUrl.toLowerCase().endsWith('.ico');
    const iconType = isIco ? 'image/x-icon' : 'image/png';

    return {
        name: 'Teer Club',
        short_name: 'Teer Club',
        description: 'The leading platform for fastest Teer Result Today.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0f172a',
        icons: [
            {
                src: faviconUrl,
                sizes: '192x192',
                type: iconType,
            },
            {
                src: faviconUrl,
                sizes: '512x512',
                type: iconType,
            }
        ],
    }
}
