import { BRAND, DOMAINS } from '@/lib/branding'

export default function StructuredData() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    url: DOMAINS.marketing,
    logo: `${DOMAINS.marketing}/logo.png`,
    description: BRAND.description,
    sameAs: [
      'https://twitter.com/nivostack',
      'https://github.com/nivostack',
      'https://linkedin.com/company/nivostack',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@nivostack.com',
      contactType: 'Customer Service',
    },
  }

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: BRAND.name,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
    </>
  )
}

