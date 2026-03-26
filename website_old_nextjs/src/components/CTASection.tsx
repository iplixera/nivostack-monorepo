import Link from 'next/link'
import { DOMAINS } from '@/lib/branding'
import Button from './Button'

interface CTASectionProps {
  title?: string
  description?: string
  primaryCTA?: { text: string; href: string }
  secondaryCTA?: { text: string; href: string }
  className?: string
}

export default function CTASection({
  title = 'Ready to get started?',
  description = 'Join thousands of developers using NivoStack to monitor and configure their mobile apps.',
  primaryCTA = { text: 'Start Free Forever', href: `${DOMAINS.studio}/register` },
  secondaryCTA = { text: 'Learn More', href: '/features' },
  className = '',
}: CTASectionProps) {
  return (
    <section className={`bg-gradient-to-r from-blue-600 to-blue-800 py-16 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href={primaryCTA.href} variant="secondary" size="lg">
            {primaryCTA.text}
          </Button>
          <Button href={secondaryCTA.href} variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            {secondaryCTA.text}
          </Button>
        </div>
      </div>
    </section>
  )
}

