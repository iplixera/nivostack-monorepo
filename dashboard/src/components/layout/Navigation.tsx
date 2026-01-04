'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavItem {
  label: string
  href: string
  badge?: 'Agg' | 'Raw' | 'Live' | 'CP' | 'Dev' | 'Org' | 'Ops' | 'Rel'
  count?: number
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface NavigationProps {
  projectId?: string
  counts?: Record<string, number>
  isAdmin?: boolean
}

export default function Navigation({ projectId, counts = {}, isAdmin = false }: NavigationProps) {
  const pathname = usePathname()

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', href: projectId ? `/projects/${projectId}` : '/projects', badge: 'Agg' },
      ],
    },
    {
      title: 'Observe',
      items: [
        { label: 'Devices', href: projectId ? `/projects/${projectId}/devices` : '/projects', badge: 'Raw', count: counts.devices },
        { label: 'Sessions', href: projectId ? `/projects/${projectId}/sessions` : '/projects', badge: 'Raw', count: counts.sessions },
        { label: 'API Traces', href: projectId ? `/projects/${projectId}/traces` : '/projects', badge: 'Raw', count: counts.traces },
        { label: 'Logs', href: projectId ? `/projects/${projectId}/logs` : '/projects', badge: 'Raw', count: counts.logs },
        { label: 'Crashes', href: projectId ? `/projects/${projectId}/crashes` : '/projects', badge: 'Agg' },
        { label: 'Screen Flow', href: projectId ? `/projects/${projectId}/screenflow` : '/projects', badge: 'Agg' },
        { label: 'Live Debug', href: projectId ? `/projects/${projectId}/live-debug` : '/projects', badge: 'Live' },
      ],
    },
    {
      title: 'Control Plane',
      items: [
        { label: 'Business Config', href: projectId ? `/projects/${projectId}/business-config` : '/projects', badge: 'CP' },
        { label: 'Localization', href: projectId ? `/projects/${projectId}/localization` : '/projects', badge: 'CP' },
        { label: 'Builds', href: projectId ? `/projects/${projectId}/builds` : '/projects', badge: 'Rel' },
        { label: 'API Config', href: projectId ? `/projects/${projectId}/api-config` : '/projects', badge: 'CP' },
        { label: 'API Mocking', href: projectId ? `/projects/${projectId}/mocks` : '/projects', badge: 'Dev' },
      ],
    },
    {
      title: 'Operate',
      items: [
        { label: 'Alerts', href: projectId ? `/projects/${projectId}/alerts` : '/projects', badge: 'Ops' },
      ],
    },
    {
      title: 'Developer',
      items: [
        { label: 'SDK Settings', href: projectId ? `/projects/${projectId}/sdk-settings` : '/projects', badge: 'Dev' },
        { label: 'Files', href: projectId ? `/projects/${projectId}/files` : '/projects', badge: 'Dev' },
      ],
    },
    {
      title: 'Organization',
      items: [
        { label: 'Team & Access', href: '/team', badge: 'Org' },
        { label: 'Billing & Quotas', href: '/billing', badge: 'Org' },
        { label: 'Project Settings', href: projectId ? `/projects/${projectId}/settings` : '/settings', badge: 'Org' },
        { label: 'Notifications', href: projectId ? `/projects/${projectId}/notifications` : '/notifications', badge: 'Org' },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: 'Admin',
            items: [
              { label: 'Dashboard', href: '/admin', badge: 'Admin' },
              { label: 'Users', href: '/admin/users', badge: 'Admin' },
              { label: 'Subscriptions', href: '/admin/subscriptions', badge: 'Admin' },
              { label: 'Plans', href: '/admin/plans', badge: 'Admin' },
              { label: 'Revenue', href: '/admin/revenue', badge: 'Admin' },
              { label: 'Statistics', href: '/admin/statistics', badge: 'Admin' },
              { label: 'Promo Codes', href: '/admin/promo-codes', badge: 'Admin' },
              { label: 'Offers', href: '/admin/offers', badge: 'Admin' },
              { label: 'Configurations', href: '/admin/configurations', badge: 'Admin' },
            ],
          },
        ]
      : []),
  ]

  const isActive = (href: string) => {
    if (!projectId) {
      // For non-project pages, exact match
      return pathname === href
    }
    
    // For project pages, check if pathname matches
    if (href.includes('?')) {
      const [base] = href.split('?')
      // Check if current path matches the base path
      if (base.includes('/projects/')) {
        return pathname === base || pathname?.startsWith(base + '/')
      }
      // For query-based navigation, check if we're on the project page
      return pathname?.startsWith(`/projects/${projectId}`)
    }
    
    // Exact match or starts with
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Agg':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--a)', border: 'rgba(34, 197, 94, 0.2)' }
      case 'Raw':
        return { bg: 'rgba(37, 99, 235, 0.1)', color: 'var(--p)', border: 'rgba(37, 99, 235, 0.2)' }
      case 'Live':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--w)', border: 'rgba(245, 158, 11, 0.2)' }
      case 'CP':
        return { bg: 'rgba(56, 189, 248, 0.1)', color: 'var(--p)', border: 'rgba(56, 189, 248, 0.2)' }
      case 'Dev':
        return { bg: 'rgba(139, 92, 246, 0.1)', color: '#A78BFA', border: 'rgba(139, 92, 246, 0.2)' }
      case 'Org':
        return { bg: 'rgba(148, 163, 184, 0.1)', color: 'var(--m)', border: 'rgba(148, 163, 184, 0.2)' }
      case 'Ops':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--d)', border: 'rgba(239, 68, 68, 0.2)' }
      case 'Rel':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--w)', border: 'rgba(245, 158, 11, 0.2)' }
      default:
        return { bg: 'transparent', color: 'var(--m)', border: 'var(--b)' }
    }
  }

  return (
    <nav style={{ marginTop: '16px' }}>
      {navSections.map((section) => (
        <div key={section.title} style={{ marginBottom: '24px' }}>
          <div
            className="navTitle"
            style={{
              margin: '16px 10px 8px',
              fontSize: '11px',
              color: 'var(--m)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}
          >
            {section.title}
          </div>
          <div className="nav">
            {section.items.map((item) => {
              const active = isActive(item.href)
              const badgeStyle = getBadgeColor(item.badge)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '12px',
                    color: active ? 'var(--t)' : 'var(--m)',
                    alignItems: 'center',
                    background: active ? 'var(--chip)' : 'transparent',
                    border: active ? '1px solid var(--b)' : '1px solid transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--s2)'
                      e.currentTarget.style.color = 'var(--t)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--m)'
                    }
                  }}
                >
                  <span>{item.label}</span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {item.count !== undefined && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          borderRadius: '999px',
                          background: active ? 'var(--p)' : 'var(--s2)',
                          color: active ? 'white' : 'var(--m)'
                        }}
                      >
                        {item.count}
                      </span>
                    )}
                    {item.badge && (
                      <span
                        className="badge"
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          border: `1px solid ${badgeStyle.border}`,
                          background: badgeStyle.bg,
                          color: badgeStyle.color
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
      {/* Legend */}
      <div
        className="navTitle"
        style={{
          margin: '16px 10px 8px',
          fontSize: '11px',
          color: 'var(--m)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}
      >
        Legend
      </div>
      <div
        className="footerNote muted"
        style={{
          marginTop: '10px',
          fontSize: '11px',
          color: 'var(--m)',
          padding: '0 10px'
        }}
      >
        Aggregated = rollups/materialized views<br/>
        Raw = row-level tables (paged + filtered)<br/>
        Live = recent raw deltas (poll/stream)
      </div>
    </nav>
  )
}

