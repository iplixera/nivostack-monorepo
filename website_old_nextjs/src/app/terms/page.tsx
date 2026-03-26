import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { BRAND, DOMAINS } from '@/lib/branding'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'NivoStack Terms of Service - Terms and conditions for using our platform.',
  alternates: {
    canonical: `${DOMAINS.marketing}/terms`,
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using {BRAND.name} ({DOMAINS.marketing}), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {BRAND.name} provides a mobile app monitoring and configuration platform that allows you to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Monitor API requests and responses</li>
                <li>Track logs and errors</li>
                <li>Manage remote configurations</li>
                <li>Control feature flags</li>
                <li>Analyze user sessions and flows</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use our service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Account Security</h3>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. We are not liable for any loss or damage resulting from unauthorized access to your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Use the service for any illegal purpose</li>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Use the service to harm or harass others</li>
                <li>Collect data from users without consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscription and Billing</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Subscription Plans</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer various subscription plans. By subscribing, you agree to pay the fees associated with your chosen plan.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Billing</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Billing occurs on a monthly or annual basis, depending on your plan. Fees are charged in advance.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Cancellation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.4 Refunds</h3>
              <p className="text-gray-700 leading-relaxed">
                We offer a 30-day money-back guarantee for new subscriptions. Refunds are processed within 5-10 business days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The service and its content are owned by {BRAND.name} and protected by intellectual property laws. You may not:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Copy, modify, or distribute our content</li>
                <li>Reverse engineer or decompile our software</li>
                <li>Use our trademarks without permission</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of data you upload to our service. By using our service, you grant us a license to use your data to provide the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data and Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your use of our service is also governed by our Privacy Policy. We collect and process data as described in that policy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for ensuring that any data you upload complies with applicable laws and that you have the right to upload such data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We strive to maintain high availability but do not guarantee uninterrupted service. We may:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Perform scheduled maintenance</li>
                <li>Experience downtime due to technical issues</li>
                <li>Modify or discontinue features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>We provide the service "as is" without warranties</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount you paid in the last 12 months</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your use of the service or violation of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account if you:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
                <li>Violate these terms</li>
                <li>Fail to pay fees</li>
                <li>Engage in fraudulent or illegal activity</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, your right to use the service ceases immediately. We may delete your data after a reasonable retention period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may modify these terms at any time. We will notify you of significant changes via email or through our service. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these terms, please contact us at:
              </p>
              <p className="text-gray-700">
                Email: <a href="mailto:legal@nivostack.com" className="text-blue-600 hover:text-blue-700">legal@nivostack.com</a>
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
