'use client'

import { useState } from 'react'
import { usePathname, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from './AuthProvider'

type MenuItem = {
  label: string
  href?: string
  tab?: string
  adminOnly?: boolean
  onClick?: () => void
  count?: number
}

type MenuCategory = {
  header: string
  items: MenuItem[]
}

export default function Sidebar({
  onTabChange,
  activeTab,
  counts,
  projects = [],
  currentProjectId,
  onProjectChange
}: {
  onTabChange?: (tab: string) => void
  activeTab?: string
  counts?: Record<string, number>
  projects?: Array<{ id: string; name: string; role?: string }>
  currentProjectId?: string
  onProjectChange?: (projectId: string) => void
}) {
  const pathname = usePathname()
  const params = useParams()
  const { user } = useAuth()
  const projectId = params?.id as string
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)

  const isProjectPage = pathname?.startsWith('/projects/') && projectId

  const menuCategories: MenuCategory[] = [
    {
      header: 'Overview',
      items: [
        { label: 'Dashboard', href: projectId ? `/projects/${projectId}` : '/projects', adminOnly: false },
        { label: 'NivoStack Admin', href: '/admin', adminOnly: true },
      ],
    },
    {
      header: 'Runtime Monitoring',
      items: [
        { label: 'Devices', tab: 'devices', onClick: () => onTabChange?.('devices'), count: counts?.devices },
        { label: 'Sessions', tab: 'sessions', onClick: () => onTabChange?.('sessions'), count: counts?.sessions },
        { label: 'API Traces', tab: 'traces', onClick: () => onTabChange?.('traces'), count: counts?.traces },
        { label: 'Device Logs', tab: 'logs', onClick: () => onTabChange?.('logs'), count: counts?.logs },
        { label: 'Crashes', tab: 'crashes', onClick: () => onTabChange?.('crashes'), count: counts?.crashes },
        { label: 'Screen Flow', tab: 'screenflow', onClick: () => onTabChange?.('screenflow') },
      ],
    },
    {
      header: 'Content Management',
      items: [
        { label: 'Business Config', tab: 'business-config', onClick: () => onTabChange?.('business-config') },
        { label: 'Localization', tab: 'localization', onClick: () => onTabChange?.('localization') },
        { label: 'Builds', tab: 'builds', onClick: () => onTabChange?.('builds') },
      ],
    },
    {
      header: 'API & Development',
      items: [
        { label: 'API Config', tab: 'api-config', onClick: () => onTabChange?.('api-config') },
        { label: 'API Mocking', tab: 'mocks', onClick: () => onTabChange?.('mocks') },
        { label: 'Live Debug', tab: 'live-debug', onClick: () => onTabChange?.('live-debug') },
      ],
    },
    {
      header: 'Project',
      items: [
        { label: 'Settings', tab: 'settings', onClick: () => onTabChange?.('settings') },
        { label: 'Notifications', tab: 'notifications', onClick: () => onTabChange?.('notifications') },
      ],
    },
  ]

  const isActive = (item: MenuItem) => {
    if (item.href) {
      return pathname === item.href || pathname?.startsWith(item.href + '/')
    }
    if (item.tab && isProjectPage && activeTab) {
      return activeTab === item.tab
    }
    return false
  }

  const handleClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick()
    }
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen flex-shrink-0">
      <div className="p-4 sticky top-0">
        {/* Logo */}
        <Link key="sidebar-logo" href="/projects" className="text-xl font-bold text-white block mb-6">
          NivoStack
        </Link>

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Current Project
            </div>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium truncate max-w-[180px]">
                    {projects.find(p => p.id === currentProjectId)?.name || projects.find(p => p.id === projectId)?.name || 'Select Project'}
                  </span>
                  {projects.find(p => p.id === (currentProjectId || projectId))?.role && (
                    <span className="text-xs text-gray-400">
                      {projects.find(p => p.id === (currentProjectId || projectId))?.role}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${showProjectDropdown ? 'rotate-180' : ''}`}
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
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProjectDropdown(false)}
                  />
                  <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setShowProjectDropdown(false)
                          onProjectChange?.(project.id)
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors ${project.id === (currentProjectId || projectId) ? 'bg-blue-600 text-white' : 'text-gray-300'
                          }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{project.name}</span>
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

        {/* Separator */}
        <div className="border-t border-gray-700 mb-6"></div>
        <nav className="space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          {menuCategories.map((category) => {
            const visibleItems = category.items.filter(
              (item) => !item.adminOnly || user?.isAdmin
            )

            if (visibleItems.length === 0) return null

            return (
              <div key={category.header}>
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {category.header}
                </h3>
                <ul className="space-y-1">
                  {visibleItems.map((item, idx) => {
                    const active = isActive(item)
                    const content = item.href ? (
                      <Link
                        href={item.href}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${active
                          ? 'bg-blue-900/30 text-blue-400 font-medium'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleClick(item)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${active
                          ? 'bg-blue-900/30 text-blue-400 font-medium'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                      >
                        <span>{item.label}</span>
                        {item.count !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-blue-500' : 'bg-gray-700'
                            }`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    )

                    return (
                      <li key={item.label + idx}>
                        {content}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

