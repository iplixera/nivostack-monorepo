'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'

type Project = {
  id: string
  name: string
  apiKey: string
  createdAt: string
  role?: 'owner' | 'admin' | 'member' | 'viewer'
  invitedBy?: {
    name: string | null
    email: string
  } | null
  joinedAt?: string | null
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
      fetchUsageStats()
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create project'
      setCreateError(errorMessage)
      console.error('Failed to create project:', error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Projects"
          subtitle="Manage your projects"
          dataMode="Org"
          actions={<ThemeToggle />}
        />
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--m)' }}>
          Loading projects...
        </div>
      </div>
    )
  }

  const limitReached = isLimitReached()
  const projectsUsage = usageStats?.projects

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="Manage your projects"
        dataMode="Org"
        actions={
          <>
            <ThemeToggle />
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={limitReached}
              className="btn"
            >
              New Project
            </button>
          </>
        }
      />

      {/* Warning Banner */}
      {limitReached && (
        <div className="card" style={{ marginTop: '18px', borderColor: 'var(--w)', background: 'rgba(234, 179, 8, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b style={{ color: 'var(--w)' }}>Project limit reached</b>
              <div className="muted" style={{ marginTop: '6px', fontSize: '12px' }}>
                You have used {projectsUsage?.used} of {projectsUsage?.limit} projects.{' '}
                <Link href="/subscription" style={{ color: 'var(--p)', textDecoration: 'underline' }}>
                  Upgrade your plan
                </Link>
                {' '}to create more projects.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Info */}
      {usageStats && !limitReached && projectsUsage && projectsUsage.limit !== null && (
        <div className="card" style={{ marginTop: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="muted" style={{ fontSize: '12px' }}>Projects Usage</span>
            <span className="muted" style={{ fontSize: '12px' }}>
              {projectsUsage.used} / {projectsUsage.limit}
            </span>
          </div>
          <div style={{ width: '100%', background: 'var(--s2)', borderRadius: '999px', height: '8px' }}>
            <div
              style={{
                height: '8px',
                borderRadius: '999px',
                background: projectsUsage.percentage >= 100 ? 'var(--d)' : projectsUsage.percentage >= 80 ? 'var(--w)' : 'var(--p)',
                width: `${Math.min(projectsUsage.percentage, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card" style={{ marginTop: '18px', textAlign: 'center', padding: '60px 20px' }}>
          <p className="muted" style={{ marginBottom: '18px' }}>No projects yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={limitReached}
            className="btn"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px', marginTop: '18px' }}>
          {projects.map((project) => {
            const isOwned = project.role === 'owner'
            const isInvited = project.role && project.role !== 'owner'
            
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="card"
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  borderColor: isOwned ? 'var(--b)' : 'var(--p)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <b style={{ flex: 1, paddingRight: '8px' }}>{project.name}</b>
                  {isOwned && (
                    <span className="chip">
                      <span className="dot" />
                      Owned
                    </span>
                  )}
                  {isInvited && (
                    <span className="chip">
                      <span className={`dot ${project.role === 'admin' ? 'good' : project.role === 'member' ? 'warn' : ''}`} />
                      {project.role === 'admin' ? 'Admin' : project.role === 'member' ? 'Member' : 'Viewer'}
                    </span>
                  )}
                </div>
                
                {isInvited && project.invitedBy && (
                  <div className="muted" style={{ fontSize: '11px', marginBottom: '12px' }}>
                    Invited by {project.invitedBy.name || project.invitedBy.email}
                    {project.joinedAt && (
                      <span style={{ marginLeft: '8px' }}>
                        • Joined {new Date(project.joinedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                  <div className="muted">
                    <b style={{ color: 'var(--t)' }}>{project._count.devices}</b> devices <span style={{ fontSize: '10px', opacity: 0.7 }}>(total)</span>
                  </div>
                  <div className="muted">
                    <b style={{ color: 'var(--t)' }}>{project._count.logs}</b> logs <span style={{ fontSize: '10px', opacity: 0.7 }}>(all-time)</span>
                  </div>
                  <div className="muted">
                    <b style={{ color: 'var(--d)' }}>{project._count.crashes}</b> crashes <span style={{ fontSize: '10px', opacity: 0.7 }}>(all-time)</span>
                  </div>
                  <div className="muted">
                    <b style={{ color: 'var(--t)' }}>{project._count.apiTraces}</b> traces <span style={{ fontSize: '10px', opacity: 0.7 }}>(all-time)</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '18px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <b style={{ fontSize: '18px', marginBottom: '14px', display: 'block' }}>Create Project</b>
            {limitReached && (
              <div className="card" style={{ marginBottom: '14px', borderColor: 'var(--w)', background: 'rgba(234, 179, 8, 0.1)' }}>
                <div style={{ color: 'var(--w)', fontSize: '12px' }}>
                  Project limit reached. Please upgrade your plan to create more projects.
                </div>
              </div>
            )}
            {createError && (
              <div className="card" style={{ marginBottom: '14px', borderColor: 'var(--d)', background: 'rgba(220, 38, 38, 0.1)' }}>
                <div style={{ color: 'var(--d)', fontSize: '12px' }}>{createError}</div>
              </div>
            )}
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                className="input"
                value={newProjectName}
                onChange={(e) => {
                  setNewProjectName(e.target.value)
                  setCreateError('')
                }}
                placeholder="Project name"
                required
                disabled={limitReached}
                style={{ marginBottom: '14px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateError('')
                    setNewProjectName('')
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={creating || limitReached}
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
