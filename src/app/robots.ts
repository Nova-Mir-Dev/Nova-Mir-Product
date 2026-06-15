import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/api/', '/admin/', '/dashboard/', '/setup/', '/intake/'],
      },
    ],
    sitemap: 'https://novamir.dev/sitemap.xml',
  }
}
