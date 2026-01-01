import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Button from '@/components/Button'
import CTASection from '@/components/CTASection'
import { BRAND, DOMAINS } from '@/lib/branding'
import { PRICING_PLANS } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Pricing - Affordable Mobile App Monitoring',
  description: 'NivoStack pricing plans - Start free forever, upgrade when ready. Transparent pricing with no hidden fees.',
  alternates: {
    canonical: `${DOMAINS.marketing}/pricing`,
  },
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <br />
            <span className="text-blue-600">Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start free forever. Upgrade when you need more. No credit card required.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRICING_PLANS.map((plan, idx) => (
              <div
                key={plan.id}
                className={`rounded-2xl border-2 p-8 ${
                  plan.id === 'pro'
                    ? 'border-blue-600 shadow-2xl scale-105 bg-gradient-to-b from-blue-50 to-white'
                    : 'border-gray-200 shadow-lg hover:shadow-xl bg-white'
                } transition-all duration-300`}
              >
                {plan.id === 'pro' && (
                  <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline">
                    {plan.price === null ? (
                      <span className="text-4xl font-bold text-gray-900">Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-600 ml-2">/month</span>
                      </>
                    )}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  href={
                    plan.id === 'enterprise'
                      ? '/contact'
                      : `${DOMAINS.studio}/register`
                  }
                  variant={plan.id === 'pro' ? 'primary' : 'outline'}
                  className="w-full"
                  size="lg"
                >
                  {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-6">
            {[
              {
                question: 'Can I change plans later?',
                answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.',
              },
              {
                question: 'What happens if I exceed my limits?',
                answer: 'We\'ll notify you when you\'re approaching your limits. You can upgrade your plan or contact us for custom limits.',
              },
              {
                question: 'Do you offer refunds?',
                answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
              },
              {
                question: 'Is there a free trial?',
                answer: 'The Free Forever plan is always free. Paid plans include a 14-day free trial—no credit card required.',
              },
              {
                question: 'Can I cancel anytime?',
                answer: 'Yes, you can cancel your subscription at any time. Your data will be retained for 30 days after cancellation.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Need Custom Solutions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Enterprise plans include dedicated support, custom integrations, SLA guarantees, and on-premise options.
          </p>
          <Button href="/contact" variant="primary" size="lg">
            Contact Sales
          </Button>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  )
}
