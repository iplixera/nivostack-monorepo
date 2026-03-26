import Link from 'next/link'

const blogPosts = [
  {
    title: 'Introducing NivoStack 2.0: Faster, Smarter, Better',
    excerpt: 'We\'re excited to announce the release of NivoStack 2.0, featuring improved performance, new analytics dashboard, and enhanced SDK capabilities.',
    date: 'January 15, 2025',
    category: 'Product',
    readTime: '5 min read',
    slug: 'introducing-nivostack-2'
  },
  {
    title: 'Best Practices for Mobile API Monitoring',
    excerpt: 'Learn how to effectively monitor your mobile app\'s API calls, identify bottlenecks, and improve user experience with real-time tracing.',
    date: 'January 10, 2025',
    category: 'Tutorial',
    readTime: '8 min read',
    slug: 'mobile-api-monitoring-best-practices'
  },
  {
    title: 'How to Debug Crash Reports Like a Pro',
    excerpt: 'A comprehensive guide to understanding and resolving crash reports in your mobile applications using NivoStack\'s crash reporting tools.',
    date: 'January 5, 2025',
    category: 'Tutorial',
    readTime: '10 min read',
    slug: 'debug-crash-reports'
  },
  {
    title: 'Remote Configuration: Ship Features Without App Updates',
    excerpt: 'Discover how remote configuration can help you iterate faster, run A/B tests, and manage feature flags without requiring app store releases.',
    date: 'December 28, 2024',
    category: 'Guide',
    readTime: '6 min read',
    slug: 'remote-configuration-guide'
  },
  {
    title: 'Building a Robust Mobile Logging Strategy',
    excerpt: 'Learn how to implement effective logging in your mobile apps to gain insights into user behavior and quickly diagnose issues.',
    date: 'December 20, 2024',
    category: 'Tutorial',
    readTime: '7 min read',
    slug: 'mobile-logging-strategy'
  },
  {
    title: 'NivoStack Flutter SDK: Getting Started Guide',
    excerpt: 'Step-by-step guide to integrating NivoStack into your Flutter application for cross-platform monitoring and configuration.',
    date: 'December 15, 2024',
    category: 'Documentation',
    readTime: '12 min read',
    slug: 'flutter-sdk-getting-started'
  }
]

export default function BlogPage() {
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
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Sign in</Link>
              <Link href="/register" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5">Start Free</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Insights, tutorials, and updates from the NivoStack team
            </p>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">N</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{post.category}</span>
                    <span className="text-gray-400 text-xs">{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{post.date}</span>
                    <span className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer">Read more →</span>
                  </div>
                </div>
              </article>
            ))}
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
                <p className="text-gray-400 text-sm max-w-xs">The complete mobile app testing and monitoring platform.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                  <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
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
