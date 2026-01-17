'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import SubscriptionBanner from '@/components/SubscriptionBanner'
import Sidebar from '@/components/Sidebar'
import UserProfileDropdown from '@/components/UserProfileDropdown'
import NotificationBell from '@/components/NotificationBell'
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
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800">
          <Link href="/projects" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">NivoStack</div>
              <div className="text-gray-400 text-xs">Studio</div>
            </div>
          </Link>
        </div>

        {/* Project Selector */}
        {!isAdmin && (
          <div className="p-4 border-b border-gray-800">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Current Project
            </div>
            <div className="relative">
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                disabled={projectsLoading}
              >
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="font-medium truncate">
                    {currentProject ? currentProject.name : (projectsLoading ? 'Loading...' : 'Select Project')}
                  </span>
                  {currentProject && (
                    <span className="text-xs text-gray-400">
                      prod · GCC
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform flex-shrink-0 ${showProjectDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProjectDropdown && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setShowProjectDropdown(false)} />
                  <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-60 max-h-64 overflow-y-auto">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setShowProjectDropdown(false)
                          handleProjectChange(project.id)
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors text-sm ${project.id === projectId ? 'bg-blue-600 text-white' : 'text-gray-300'
                          }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{project.name}</span>
                          {project.role && project.role !== 'owner' && (
                            <span className="text-xs text-gray-400">{project.role}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-6">
            {/* Overview */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Overview</h3>
              <div className="space-y-1">
                <Link
                  href={isAdmin ? "/admin" : "/projects"}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === (isAdmin ? "/admin" : "/projects")
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  <span>{isAdmin ? 'Admin Dashboard' : 'Projects'}</span>
                </Link>
              </div>
            </div>

            {/* Project Navigation */}
            {isProjectPage && !isAdmin && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Project</h3>
                <div className="space-y-1">
                  <Link
                    href={`/projects/${projectId}`}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === `/projects/${projectId}`
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href={`/projects/${projectId}/devices`}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname?.startsWith(`/projects/${projectId}/devices`)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <span>Devices</span>
                  </Link>
                  <Link
                    href={`/projects/${projectId}/traces`}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname?.startsWith(`/projects/${projectId}/traces`)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <span>API Traces</span>
                  </Link>
                  <Link
                    href={`/projects/${projectId}/logs`}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname?.startsWith(`/projects/${projectId}/logs`)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <span>Logs</span>
                  </Link>
                  <Link
                    href={`/projects/${projectId}/crashes`}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname?.startsWith(`/projects/${projectId}/crashes`)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <span>Crashes</span>
                  </Link>
                  <Link
                    href={`/projects/${projectId}/sessions`}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname?.startsWith(`/projects/${projectId}/sessions`)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <span>Sessions</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Admin Navigation */}
            {isAdmin && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Admin</h3>
                <div className="space-y-1">
                  <Link
                    href="/admin/users"
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/admin/users'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <span>Users</span>
                  </Link>
                  <Link
                    href="/admin/plans"
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname?.startsWith('/admin/plans')
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <span>Plans</span>
                  </Link>
                  <Link
                    href="/admin/subscriptions"
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname?.startsWith('/admin/subscriptions')
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <span>Subscriptions</span>
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href={isAdmin ? "/admin" : "/projects"} className="text-xl font-bold text-white">
                  {isAdmin ? 'NivoStack Admin' : 'NivoStack Studio'}
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <NotificationBell />
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
