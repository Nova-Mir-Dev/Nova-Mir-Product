import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/intake/', '/setup/'],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/intake/', '/setup/'],
      },
    ],
    sitemap: 'https://novamir.dev/sitemap.xml',
  }
}
