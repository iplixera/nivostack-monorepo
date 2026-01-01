import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import CTASection from '@/components/CTASection'
import { BRAND, DOMAINS } from '@/lib/branding'

export const metadata: Metadata = {
  title: 'About Us - NivoStack Team',
  description: 'Learn about NivoStack - Our mission, vision, and commitment to helping mobile app developers build better products.',
  alternates: {
    canonical: `${DOMAINS.marketing}/about`,
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Building Tools for
            <br />
            <span className="text-blue-600">Modern Developers</span>
          </h1>
          <p className="text-xl text-gray-600">
            We're on a mission to simplify mobile app monitoring and configuration.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To empower mobile app developers with powerful, affordable tools that simplify monitoring, debugging, and configuration management.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We believe that every developer should have access to enterprise-grade tools without the enterprise price tag.
              </p>
            </div>
            <div>
              <div className="text-4xl mb-4">👁️</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To become the go-to platform for mobile app teams, replacing multiple expensive SaaS tools with one unified, affordable solution.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We envision a future where developers spend less time configuring tools and more time building amazing products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚀',
                title: 'Innovation',
                description: 'We continuously improve our platform with new features and better performance.',
              },
              {
                icon: '🤝',
                title: 'Transparency',
                description: 'Honest pricing, clear documentation, and open communication with our users.',
              },
              {
                icon: '💪',
                title: 'Reliability',
                description: '99.9% uptime guarantee and dedicated support when you need it.',
              },
              {
                icon: '🎯',
                title: 'Simplicity',
                description: 'Complex problems deserve simple solutions. We make powerful tools easy to use.',
              },
              {
                icon: '🌍',
                title: 'Accessibility',
                description: 'Enterprise-grade tools accessible to teams of all sizes, from startups to enterprises.',
              },
              {
                icon: '❤️',
                title: 'Customer First',
                description: 'Your success is our success. We listen, learn, and build what you need.',
              },
            ].map((value, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="text-3xl mb-3">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Story
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed mb-4">
              NivoStack was born from frustration. As mobile app developers ourselves, we were tired of juggling multiple expensive SaaS tools—each with its own dashboard, API, and learning curve.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              We needed Datadog for monitoring, Sentry for crash reporting, Firebase for remote config, LaunchDarkly for feature flags, and MixPanel for analytics. The costs were adding up, and managing all these tools was becoming a full-time job.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              So we built NivoStack—one unified platform that replaces all these tools at a fraction of the cost. We started with the features we needed most, and we're continuously adding more based on feedback from our community.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, NivoStack helps hundreds of developers monitor, debug, and configure their mobile apps more efficiently. And we're just getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Active Projects' },
              { value: '10K+', label: 'Devices Tracked' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  )
}
