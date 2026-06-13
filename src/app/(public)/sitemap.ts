import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://novamir.dev'
  const pages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/services', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/process', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/portfolio', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/intake', priority: 0.5, changeFrequency: 'monthly' as const },
  ]

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))
}
