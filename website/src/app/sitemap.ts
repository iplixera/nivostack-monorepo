import { MetadataRoute } from 'next'
import { locales } from '@/i18n'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_MARKETING_URL || 'https://nivostack.com'
  const pages = ['', 'features', 'pricing', 'about', 'contact', 'privacy', 'terms']
  
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  // Generate entries for each locale
  locales.forEach((locale) => {
    pages.forEach((page) => {
      const url = locale === 'en' 
        ? `${baseUrl}/${page || ''}`
        : `${baseUrl}/${locale}/${page || ''}`
      
      sitemapEntries.push({
        url: url.replace(/\/$/, '') || baseUrl,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : page === 'privacy' || page === 'terms' ? 'yearly' : 'monthly',
        priority: page === '' ? 1 : page === 'features' || page === 'pricing' ? 0.9 : page === 'about' || page === 'contact' ? 0.7 : 0.5,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              loc === 'en' 
                ? `${baseUrl}/${page || ''}`
                : `${baseUrl}/${loc}/${page || ''}`
            ])
          ),
        },
      })
    })
  })
  
  return sitemapEntries
}

