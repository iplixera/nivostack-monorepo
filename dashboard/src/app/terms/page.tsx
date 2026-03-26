import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900">NivoStack</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Features</Link>
              <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Pricing</Link>
              <Link href="/#integrations" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Integrations</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-blue-100">
              Last updated: January 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using NivoStack's services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed">
                NivoStack provides a mobile app testing and monitoring platform that includes API tracing, crash reporting, remote logging, business configuration management, and related services. We reserve the right to modify, suspend, or discontinue any part of our services at any time.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-600 leading-relaxed mb-4">To use our services, you must:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Promptly notify us of any unauthorized use of your account</li>
                <li>Be at least 18 years old or have legal parental consent</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription Plans and Billing</h2>
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Free Plan</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our free plan provides access to core features with usage limits. The free plan has no expiration date and renews automatically each month.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Paid Plans</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Paid subscriptions are billed in advance on a monthly or annual basis. You authorize us to charge your payment method for all fees incurred.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Refunds</h3>
              <p className="text-gray-600 leading-relaxed">
                Subscription fees are non-refundable except as required by law. You may cancel your subscription at any time, and you will continue to have access until the end of your billing period.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
              <p className="text-gray-600 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Use our services for any illegal purpose</li>
                <li>Transmit malware, viruses, or harmful code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt our services</li>
                <li>Reverse engineer or decompile our software</li>
                <li>Resell or redistribute our services without authorization</li>
                <li>Use our services to collect sensitive personal data without consent</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data and Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                Your use of our services is also governed by our <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>. You are responsible for ensuring that your use of our services complies with applicable data protection laws. You retain all rights to your data, and we process it only to provide our services.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                NivoStack and its original content, features, and functionality are owned by NivoStack and are protected by international copyright, trademark, and other intellectual property laws. Our SDKs are licensed under their respective open-source licenses.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Level Agreement</h2>
              <p className="text-gray-600 leading-relaxed">
                For paid plans, we target 99.9% uptime for our services. Scheduled maintenance windows will be communicated in advance. Service credits may be available for extended outages as specified in your subscription agreement.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by law, NivoStack shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
              <p className="text-gray-600 leading-relaxed">
                You agree to indemnify and hold harmless NivoStack and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of our services or violation of these terms.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use our services will cease immediately. Provisions that by their nature should survive termination shall survive.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify you of any changes by updating the "Last updated" date and, for material changes, by email or through our platform. Your continued use of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which NivoStack is incorporated, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                For any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-600 mt-4">
                Email: <a href="mailto:legal@nivostack.com" className="text-blue-600 hover:text-blue-700">legal@nivostack.com</a>
              </p>
              <p className="text-gray-600 mt-2">
                Or visit our <Link href="/contact" className="text-blue-600 hover:text-blue-700">Contact Page</Link>
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                  <span className="text-xl font-bold">NivoStack</span>
                </div>
                <p className="text-gray-400 text-sm max-w-xs">
                  The complete mobile app testing and monitoring platform for modern development teams.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="/#integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
              <p>© {new Date().getFullYear()} NivoStack. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
