'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import SubscriptionBanner from '@/components/SubscriptionBanner'
import Sidebar from '@/components/Sidebar'
import UserProfileDropdown from '@/components/UserProfileDropdown'
import NotificationBell from '@/components/NotificationBell'
import { ThemeToggle } from '@/components/ThemeToggle'
import { api } from '@/lib/api'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isLoading, token } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isProjectPage = pathname?.startsWith('/projects/') && pathname !== '/projects'
  const isAdminPage = pathname?.startsWith('/admin')
  const isAdmin = user?.isAdmin === true
  
  // Extract project ID from pathname
  const projectId = isProjectPage ? pathname.split('/projects/')[1]?.split('/')[0] : null
  
  // Project selector state
  const [projects, setProjects] = useState<Array<{ id: string; name: string; role?: string }>>([])
  const [currentProject, setCurrentProject] = useState<{ id: string; name: string } | null>(null)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [projectsLoading, setProjectsLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Fetch projects for dropdown
  useEffect(() => {
    if (token && !isAdmin) {
      fetchProjects()
    }
  }, [token, isAdmin])

  // Update current project when projectId changes
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setCurrentProject({ id: project.id, name: project.name })
      }
    } else if (!isProjectPage) {
      setCurrentProject(null)
    }
  }, [projectId, projects, isProjectPage])

  const fetchProjects = async () => {
    if (!token) return
    try {
      setProjectsLoading(true)
      const data = await api.projects.list(token)
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setProjectsLoading(false)
    }
  }

  const handleProjectChange = (newProjectId: string) => {
    setShowProjectDropdown(false)
    router.push(`/projects/${newProjectId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* v6: Top Header - full width, fixed height, sticky */}
      <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between h-14">
              <div className="flex items-center space-x-8">
                {isProjectPage ? (
                  // Project selector dropdown
                  <div className="relative">
                    <button
                      onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                      disabled={projectsLoading}
                    >
                      <span className="text-lg font-semibold">
                        {currentProject ? currentProject.name : (projectsLoading ? 'Loading...' : 'Project')}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showProjectDropdown && !projectsLoading && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowProjectDropdown(false)}
                        />
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-20 max-h-96 overflow-y-auto">
                          <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Select Project
                            </div>
                            {projectsLoading ? (
                              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">Loading...</div>
                            ) : projects.length === 0 ? (
                              <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">No projects</div>
                            ) : (
                              projects.map((project) => (
                                <button
                                  key={project.id}
                                  onClick={() => handleProjectChange(project.id)}
                                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    project.id === projectId
                                      ? 'bg-blue-600 text-white'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{project.name}</span>
                                    {project.role && project.role !== 'owner' && (
                                      <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                                        project.role === 'admin'
                                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                          : project.role === 'member'
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                          : 'bg-gray-100 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400'
                                      }`}>
                                        {project.role}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-800 mt-2 pt-2">
                              <Link
                                href="/projects"
                                onClick={() => setShowProjectDropdown(false)}
                                className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                              >
                                View All Projects
                              </Link>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link href={isAdmin ? "/admin" : "/projects"} className="text-xl font-bold text-gray-900 dark:text-white">
                    NivoStack
                  </Link>
                )}
                {isAdmin ? (
                  // Admin Navigation
                  <>
                    <Link
                      href="/admin"
                      className={`transition-colors ${
                        pathname === '/admin'
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/users"
                      className={`transition-colors ${
                        pathname === '/admin/users'
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Users
                    </Link>
                    <Link
                      href="/admin/plans"
                      className={`transition-colors ${
                        pathname === '/admin/plans'
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Plans
                    </Link>
                    <Link
                      href="/admin/subscriptions"
                      className={`transition-colors ${
                        pathname?.startsWith('/admin/subscriptions')
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Subscriptions
                    </Link>
                    <Link
                      href="/admin/revenue"
                      className={`transition-colors ${
                        pathname === '/admin/revenue'
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Revenue
                    </Link>
                    <Link
                      href="/admin/configurations"
                      className={`transition-colors ${
                        pathname === '/admin/configurations'
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Configurations
                    </Link>
                    <Link
                      href="/admin/statistics"
                      className={`transition-colors ${
                        pathname === '/admin/statistics'
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
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
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Projects
                      </Link>
                    </>
                  )
                )}
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <NotificationBell />
                <UserProfileDropdown />
              </div>
            </div>
          </div>
        </nav>

        {/* v6: Main Content - full width, no centered container */}
        <main className="flex-1 overflow-auto">
          {!isAdmin && <SubscriptionBanner />}
          {children}
        </main>
    </div>
  )
}
