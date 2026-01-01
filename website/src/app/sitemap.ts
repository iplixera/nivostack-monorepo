import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_MARKETING_URL || 'https://nivostack.com'
  const pages = ['', 'features', 'pricing', 'about', 'contact', 'privacy', 'terms']
  
  return pages.map((page) => ({
    url: `${baseUrl}/${page || ''}`.replace(/\/$/, '') || baseUrl,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'weekly' : page === 'privacy' || page === 'terms' ? 'yearly' : 'monthly',
    priority: page === '' ? 1 : page === 'features' || page === 'pricing' ? 0.9 : page === 'about' || page === 'contact' ? 0.7 : 0.5,
  }))
}

