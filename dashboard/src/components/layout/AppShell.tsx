'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { initTheme } from '@/lib/theme'
import ThemeToggle from '../ThemeToggle'
import UsagePill from '../UsagePill'
import { useAuth } from '../AuthProvider'
import Navigation from './Navigation'
import { api } from '@/lib/api'

interface AppShellProps {
  children: React.ReactNode
  projectId?: string
  projectName?: string
  projects?: Array<{ id: string; name: string; role?: string }>
  onProjectChange?: (projectId: string) => void
}

export default function AppShell({
  children,
  projectId,
  projectName: initialProjectName,
  projects: initialProjects = [],
  onProjectChange,
}: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, token } = useAuth()
  const [projectName, setProjectName] = useState(initialProjectName || '')
  const [projects, setProjects] = useState(initialProjects)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)

  useEffect(() => {
    initTheme()
  }, [])

  const fetchProject = useCallback(async () => {
    if (!token || !projectId) return
    try {
      const data = await api.projects.list(token)
      const project = data.projects?.find(p => p.id === projectId)
      setProjectName(project?.name || 'Project')
    } catch (error) {
      console.error('Failed to fetch project:', error)
    }
  }, [token, projectId])

  const fetchProjects = useCallback(async () => {
    if (!token) return
    try {
      const data = await api.projects.list(token)
      setProjects(data.projects || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }, [token])

  const handleProjectChange = useCallback((newProjectId: string) => {
    setShowProjectDropdown(false)
    if (onProjectChange) {
      onProjectChange(newProjectId)
    } else {
      router.push(`/projects/${newProjectId}`)
    }
  }, [onProjectChange, router])

  const handleToggleDropdown = useCallback(() => {
    setShowProjectDropdown(prev => !prev)
  }, [])

  const handleCloseDropdown = useCallback(() => {
    setShowProjectDropdown(false)
  }, [])

  useEffect(() => {
    initTheme()
  }, [])

  useEffect(() => {
    if (token && projectId && !initialProjectName) {
      fetchProject()
    }
  }, [token, projectId, initialProjectName, fetchProject])

  useEffect(() => {
    if (token && !user?.isAdmin && projects.length === 0) {
      fetchProjects()
    }
  }, [token, user?.isAdmin, projects.length, fetchProjects])

  // Memoize isAdmin to prevent unnecessary re-renders
  const isAdminMemo = useMemo(() => user?.isAdmin || false, [user?.isAdmin])

  return (
    <div className="app" style={{
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      minHeight: '100vh'
    }}>
      {/* Sidebar */}
      <aside
        className="sidebar bg-sidebar border-r border-default"
        style={{
          background: 'var(--sb)',
          borderRight: '1px solid var(--b)',
          padding: '16px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto'
        }}
      >
        {/* Brand */}
        <div
          className="brand"
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            padding: '10px',
            borderRadius: '14px',
            background: 'linear-gradient(180deg, var(--s), var(--s2))',
            border: '1px solid var(--b)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            className="logo"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--p), var(--a))'
            }}
          />
          <div>
            <b style={{ fontSize: '14px', color: 'var(--t)' }}>NivoStack Console</b>
            <br />
            <small style={{ color: 'var(--m)', fontSize: '12px' }}>Dashboard</small>
          </div>
        </div>

        {/* Project Selector */}
        <div style={{ marginTop: '16px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--m)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px',
            paddingLeft: '2px'
          }}>
            Current Project
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--b)',
                borderRadius: '12px',
                color: 'var(--t)',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  {projectName || 'Select Project'}
                </span>
                {projectId && (
                  <span style={{ fontSize: '12px', color: 'var(--m)', marginTop: '2px' }}>
                    prod · GCC
                  </span>
                )}
              </div>
              <svg
                style={{
                  width: '16px',
                  height: '16px',
                  transition: 'transform 0.2s',
                  transform: showProjectDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProjectDropdown && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 50
                  }}
                  onClick={() => setShowProjectDropdown(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--bg)',
                  border: '1px solid var(--b)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 60,
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  {projects.length === 0 ? (
                    <div style={{
                      padding: '16px',
                      textAlign: 'center',
                      color: 'var(--m)',
                      fontSize: '14px'
                    }}>
                      No projects available
                    </div>
                  ) : (
                    projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setShowProjectDropdown(false)
                          onProjectChange?.(project.id)
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          border: 'none',
                          background: project.id === projectId ? 'var(--accent)' : 'transparent',
                          color: 'var(--t)',
                          cursor: 'pointer',
                          borderRadius: project.id === projectId ? '8px' : '0',
                          fontSize: '14px',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '500' }}>{project.name}</span>
                          {project.role && project.role !== 'owner' && (
                            <span style={{ fontSize: '12px', color: 'var(--m)', marginTop: '2px' }}>
                              {project.role}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <Navigation projectId={projectId} isAdmin={isAdminMemo} />
      </aside>

      {/* Main Content */}
      <main
        className="main"
        style={{
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Topbar */}
        <div
          className="topbar"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'var(--top)',
            borderBottom: '1px solid var(--b)',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          {/* App Logo & Name */}
          <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/projects" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                N
              </div>
              <div>
                <b style={{ fontSize: '16px', color: 'var(--t)' }}>NivoStack</b>
                <div style={{ fontSize: '10px', color: 'var(--m)' }}>Studio</div>
              </div>
            </Link>
          </div>


          {/* Page Title */}
          <div className="page-title" style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <b style={{ fontSize: '16px', display: 'block', color: 'var(--t)' }}>
              NivoStack Studio
            </b>
            <span style={{ fontSize: '12px', color: 'var(--m)' }}>
              {projectName ? `${projectName} Analytics` : 'Aggregated Analytics'}
            </span>
          </div>
          <div
            className="actions"
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            {projectId && <UsagePill projectId={projectId} />}
            <ThemeToggle />
          </div>
        </div>

        {/* Content */}
        <div
          className="content"
          style={{
            padding: '24px 32px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto'
          }}
        >
          {children}
        </div>
      </main>
    </div>
  )
}

