import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Stitch Financeiro',
        short_name: 'Stitch',
        description: 'Gestão financeira simples e rápida',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#17B29F',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
