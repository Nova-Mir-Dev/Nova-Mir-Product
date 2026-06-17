import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nova Mir — Web Development for Small Businesses',
    short_name: 'Nova Mir',
    description:
      'Custom websites, lead systems, and operational tools for small businesses.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1a1a2e',
    icons: [
      {
        src: '/nova-mir-simple.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
