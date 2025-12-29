'use client'

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
  counts 
}: { 
  onTabChange?: (tab: string) => void
  activeTab?: string
  counts?: Record<string, number>
}) {
  const pathname = usePathname()
  const params = useParams()
  const { user } = useAuth()
  const projectId = params?.id as string

  const isProjectPage = pathname?.startsWith('/projects/') && projectId

  const menuCategories: MenuCategory[] = [
    {
      header: 'Platform',
      items: [
        { label: 'DevBridge Admin', href: '/admin', adminOnly: true },
      ],
    },
    {
      header: 'Runtime',
      items: [
        { label: 'Devices', tab: 'devices', onClick: () => onTabChange?.('devices'), count: counts?.devices },
        { label: 'API Traces', tab: 'traces', onClick: () => onTabChange?.('traces'), count: counts?.traces },
        { label: 'Screen Flow', tab: 'flow', onClick: () => onTabChange?.('flow'), count: counts?.flow },
        { label: 'Device Logs', tab: 'logs', onClick: () => onTabChange?.('logs'), count: counts?.logs },
        { label: 'Crashes', tab: 'crashes', onClick: () => onTabChange?.('crashes'), count: counts?.crashes },
      ],
    },
    {
      header: 'Content',
      items: [
        { label: 'Business Configuration', tab: 'business-config', onClick: () => onTabChange?.('business-config') },
        { label: 'Localization', tab: 'localization', onClick: () => onTabChange?.('localization') },
      ],
    },
    {
      header: 'APIs',
      items: [
        { label: 'API Config', tab: 'config', onClick: () => onTabChange?.('config') },
        { label: 'API Mocking', tab: 'mocks', onClick: () => onTabChange?.('mocks') },
        { label: 'Monitoring', tab: 'monitor', onClick: () => onTabChange?.('monitor'), count: counts?.monitor },
        { label: 'Cost Analysis', tab: 'analytics', onClick: () => onTabChange?.('analytics') },
      ],
    },
    {
      header: 'Settings',
      items: [
        { label: 'Project Settings', tab: 'settings', onClick: () => onTabChange?.('settings') },
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
        <Link href="/projects" className="text-xl font-bold text-white block mb-6">
          DevBridge
        </Link>
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
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          active
                            ? 'bg-blue-900/30 text-blue-400 font-medium'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleClick(item)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                          active
                            ? 'bg-blue-900/30 text-blue-400 font-medium'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.count !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            active ? 'bg-blue-500' : 'bg-gray-700'
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

