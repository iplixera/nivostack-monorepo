'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

type Project = {
  id: string
  name: string
  apiKey: string
  createdAt: string
  role?: 'owner' | 'admin' | 'member' | 'viewer' // User's role in the project
  invitedBy?: {
    name: string | null
    email: string
  } | null // Who invited the user (null for owned projects)
  joinedAt?: string | null // When user joined (for invited projects)
  _count: {
    devices: number
    logs: number
    crashes: number
    apiTraces: number
  }
}

type UsageStats = {
  projects: {
    used: number
    limit: number | null
    percentage: number
  }
}

export default function ProjectsPage() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const fetchProjects = async () => {
    if (!token) return
    try {
      const data = await api.projects.list(token)
      setProjects(data.projects)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsageStats = async () => {
    if (!token) return
    try {
      const data = await api.subscription.getUsage(token)
      if (data && data.usage) {
        setUsageStats({
          projects: data.usage.projects || { used: 0, limit: null, percentage: 0 }
        })
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error)
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchUsageStats()
  }, [token])

  const isLimitReached = () => {
    if (!usageStats) return false
    const { used, limit } = usageStats.projects
    return limit !== null && used >= limit
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !newProjectName.trim()) return

    setCreating(true)
    setCreateError('')
    try {
      await api.projects.create(newProjectName, token)
      setNewProjectName('')
      setShowCreateModal(false)
      fetchProjects()
      fetchUsageStats() // Refresh usage stats after creating
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create project'
      setCreateError(errorMessage)
      console.error('Failed to create project:', error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="text-gray-400">Loading projects...</div>
  }

  const limitReached = isLimitReached()
  const projectsUsage = usageStats?.projects

  return (
    <div>
      {/* Warning Banner */}
      {limitReached && (
        <div className="mb-6 bg-yellow-900/20 border border-yellow-600 text-yellow-400 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Project limit reached</p>
              <p className="text-sm text-yellow-300 mt-1">
                You have used {projectsUsage?.used} of {projectsUsage?.limit} projects. 
                <Link href="/subscription" className="underline ml-1 hover:text-yellow-200">
                  Upgrade your plan
                </Link>
                {' '}to create more projects.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Info */}
      {usageStats && !limitReached && projectsUsage && projectsUsage.limit !== null && (
        <div className="mb-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Projects Usage</span>
            <span className="text-sm text-gray-300">
              {projectsUsage.used} / {projectsUsage.limit}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                projectsUsage.percentage >= 80
                  ? 'bg-yellow-500'
                  : projectsUsage.percentage >= 100
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(projectsUsage.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={limitReached}
          className={`px-4 py-2 rounded transition-colors ${
            limitReached
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <p className="text-gray-400 mb-4">No projects yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={limitReached}
            className={`px-4 py-2 rounded transition-colors ${
              limitReached
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isOwned = project.role === 'owner'
            const isInvited = project.role && project.role !== 'owner'
            
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={`block p-6 rounded-lg transition-all ${
                  isOwned
                    ? 'bg-gray-900 hover:bg-gray-800 border border-gray-800'
                    : 'bg-gray-900/80 hover:bg-gray-800/80 border border-blue-900/50 hover:border-blue-800/70'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white flex-1 pr-2">{project.name}</h2>
                  {isOwned && (
                    <span className="flex-shrink-0 px-2 py-1 text-xs font-medium rounded bg-purple-900/30 text-purple-400 border border-purple-800/50">
                      Owned
                    </span>
                  )}
                  {isInvited && (
                    <span className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded ${
                      project.role === 'admin'
                        ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                        : project.role === 'member'
                        ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                        : 'bg-gray-700/30 text-gray-400 border border-gray-600/50'
                    }`}>
                      {project.role === 'admin' ? 'Admin' : project.role === 'member' ? 'Member' : 'Viewer'}
                    </span>
                  )}
                </div>
                
                {/* Show inviter info for invited projects */}
                {isInvited && project.invitedBy && (
                  <div className="mb-3 text-xs text-gray-500">
                    Invited by {project.invitedBy.name || project.invitedBy.email}
                    {project.joinedAt && (
                      <span className="ml-2">
                        • Joined {new Date(project.joinedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-400">
                    <span className="text-white font-medium">{project._count.devices}</span> devices
                  </div>
                  <div className="text-gray-400">
                    <span className="text-white font-medium">{project._count.logs}</span> logs
                  </div>
                  <div className="text-gray-400">
                    <span className="text-red-400 font-medium">{project._count.crashes}</span> crashes
                  </div>
                  <div className="text-gray-400">
                    <span className="text-white font-medium">{project._count.apiTraces}</span> traces
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create Project</h2>
            {limitReached && (
              <div className="mb-4 bg-yellow-900/20 border border-yellow-600 text-yellow-400 px-3 py-2 rounded text-sm">
                Project limit reached. Please upgrade your plan to create more projects.
              </div>
            )}
            {createError && (
              <div className="mb-4 bg-red-900/20 border border-red-600 text-red-400 px-3 py-2 rounded text-sm">
                {createError}
              </div>
            )}
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => {
                  setNewProjectName(e.target.value)
                  setCreateError('')
                }}
                placeholder="Project name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                required
                disabled={limitReached}
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateError('')
                    setNewProjectName('')
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || limitReached}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
