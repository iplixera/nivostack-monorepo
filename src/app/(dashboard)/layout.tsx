'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import SubscriptionBanner from '@/components/SubscriptionBanner'
import Sidebar from '@/components/Sidebar'
import UserProfileDropdown from '@/components/UserProfileDropdown'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isProjectPage = pathname?.startsWith('/projects/') && pathname !== '/projects'
  const isAdminPage = pathname?.startsWith('/admin')
  const isAdmin = user?.isAdmin === true

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href={isAdmin ? "/admin" : "/projects"} className="text-xl font-bold text-white">
                  DevBridge
                </Link>
                {isAdmin ? (
                  // Admin Navigation
                  <>
                    <Link
                      href="/admin"
                      className={`transition-colors ${
                        pathname === '/admin'
                          ? 'text-white font-medium'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/users"
                      className={`transition-colors ${
                        pathname === '/admin/users'
                          ? 'text-white font-medium'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Users
                    </Link>
                    <Link
                      href="/admin/plans"
                      className={`transition-colors ${
                        pathname === '/admin/plans'
                          ? 'text-white font-medium'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Plans
                    </Link>
                    <Link
                      href="/admin/subscriptions"
                      className={`transition-colors ${
                        pathname?.startsWith('/admin/subscriptions')
                          ? 'text-white font-medium'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Subscriptions
                    </Link>
                    <Link
                      href="/admin/revenue"
                      className={`transition-colors ${
                        pathname === '/admin/revenue'
                          ? 'text-white font-medium'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Revenue
                    </Link>
                    <Link
                      href="/admin/configurations"
                      className={`transition-colors ${
                        pathname === '/admin/configurations'
                          ? 'text-white font-medium'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Configurations
                    </Link>
                    <Link
                      href="/admin/statistics"
                      className={`transition-colors ${
                        pathname === '/admin/statistics'
                          ? 'text-white font-medium'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      Statistics
                    </Link>
                  </>
                ) : (
                  // Regular User Navigation - Only show Projects link, rest moved to user profile menu
                  !isProjectPage && (
                    <>
                      <Link
                        href="/projects"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        Projects
                      </Link>
                    </>
                  )
                )}
              </div>
              <div className="flex items-center space-x-4">
                <UserProfileDropdown />
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!isAdmin && <SubscriptionBanner />}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
