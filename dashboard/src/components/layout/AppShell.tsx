'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { initTheme } from '@/lib/theme'
import ThemeToggle from '../ThemeToggle'
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
        {projectId && (
          <div 
            className="project"
            style={{
              marginTop: '12px',
              padding: '10px',
              borderRadius: '14px',
              border: '1px solid var(--b)',
              background: 'var(--s)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--t)', fontSize: '14px' }}>
                  {projectName || 'Project'}
                </div>
                <div style={{ color: 'var(--m)', fontSize: '12px' }}>prod · GCC</div>
              </div>
              {projects.length > 1 && (
                <button
                  onClick={handleToggleDropdown}
                  className="badge"
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    border: '1px solid var(--b)',
                    color: 'var(--m)',
                    cursor: 'pointer',
                    background: 'transparent'
                  }}
                >
                  Switch ▼
                </button>
              )}
            </div>
            {showProjectDropdown && projects.length > 1 && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10
                  }}
                  onClick={handleCloseDropdown}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '8px',
                    width: '100%',
                    background: 'var(--s)',
                    border: '1px solid var(--b)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)',
                    zIndex: 20,
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}
                >
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectChange(project.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px',
                        fontSize: '12px',
                        color: project.id === projectId ? 'var(--t)' : 'var(--m)',
                        background: project.id === projectId ? 'var(--chip)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        margin: '4px'
                      }}
                    >
                      {project.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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
          <div className="title">
            <b style={{ fontSize: '16px', display: 'block', color: 'var(--t)' }}>
              {projectName || 'NivoStack'}
            </b>
            <span style={{ fontSize: '12px', color: 'var(--m)' }}>
              Dashboard
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
            <ThemeToggle />
          </div>
        </div>

        {/* Content */}
        <div 
          className="content"
          style={{
            padding: '18px',
            maxWidth: '1320px',
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

