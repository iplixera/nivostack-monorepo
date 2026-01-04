'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar, { FilterItem } from '@/components/FilterBar'

type Notification = {
  id: string
  type: 'quota' | 'alert' | 'invite' | 'build' | 'other'
  title: string
  message: string
  read: boolean
  createdAt: string
  link?: string
}

export default function NotificationsPage() {
  const params = useParams()
  const { token } = useAuth()
  const projectId = params?.id as string

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [projectName, setProjectName] = useState('')

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

  const fetchNotifications = useCallback(async () => {
    if (!token || !projectId) return
    try {
      setLoading(true)
      // TODO: Implement notifications API
      setNotifications([
        {
          id: '1',
          type: 'quota',
          title: 'Quota warning: 82% used',
          message: 'You are close to the monthly limit for API Requests.',
          read: false,
          createdAt: new Date().toISOString(),
          link: `/projects/${projectId}/billing`,
        },
        {
          id: '2',
          type: 'alert',
          title: 'Alert triggered: Login 4xx spike',
          message: 'POST /v1/login has 19 errors in the last 5 minutes.',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          link: `/projects/${projectId}/alerts`,
        },
      ])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [token, projectId])

  useEffect(() => {
    if (token && projectId) {
      // Only fetch project name once on mount
      if (!projectName) {
        fetchProject()
      }
      fetchNotifications()
    }
  }, [token, projectId, fetchProject, fetchNotifications, projectName])

  // Style constants
  const ACTION_BUTTON_STYLE: React.CSSProperties = { padding: '7px 10px', fontSize: '11px' }
  const ACTION_CONTAINER_STYLE: React.CSSProperties = { display: 'flex', gap: '8px', flexWrap: 'wrap' }

  // Memoize helper function
  const formatTimeAgo = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }, [])

  // Memoize computed stats
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  // Memoize filter array
  const filterItems = useMemo<FilterItem[]>(() => [
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Type: All' },
        { value: 'quota', label: 'Quota' },
        { value: 'alert', label: 'Alert' },
        { value: 'invite', label: 'Invite' },
        { value: 'build', label: 'Build' },
      ],
    },
    {
      type: 'select',
      options: [
        { value: 'all', label: 'Status: All' },
        { value: 'unread', label: 'Unread' },
        { value: 'read', label: 'Read' },
      ],
    },
    { type: 'button', label: 'Clear All', className: 'secondary' },
  ], [])

  // Memoize stats array
  const statsItems = useMemo(() => [
    { label: 'Unread', value: unreadCount, dot: 'warn' as const },
    { label: 'Total', value: notifications.length },
  ], [unreadCount, notifications.length])

  // Memoize column definitions
  const notificationColumns = useMemo<Column<Notification>[]>(() => [
    {
      key: 'notification',
      label: 'Notification',
      render: (notif) => (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!notif.read && <span className="dot" style={{ background: 'var(--p)' }} />}
            <b>{notif.title}</b>
          </div>
          <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
            {notif.message}
          </div>
        </>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (notif) => (
        <span className="chip">
          {notif.type}
        </span>
      ),
    },
    {
      key: 'time',
      label: 'Time',
      render: (notif) => (
        <span className="muted">{formatTimeAgo(notif.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (notif) => (
        <div style={ACTION_CONTAINER_STYLE}>
          {notif.link && (
            <a
              href={notif.link}
              className="btn secondary"
              style={ACTION_BUTTON_STYLE}
              onClick={(e) => e.stopPropagation()}
            >
              Open
            </a>
          )}
        </div>
      ),
    },
  ], [formatTimeAgo])

  // Memoize handlers
  const handleRowClick = useCallback((notif: Notification) => {
    // TODO: Open notification detail
    console.log('Open notification:', notif.id)
  }, [])

  return (
    <AppShell projectId={projectId} projectName={projectName}>
      <PageHeader
        title="Notifications"
        subtitle="User notification center + preferences. Includes quota warnings and alert events as first-class notifications."
        dataMode="Org"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              Mark All Read
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>Notification center</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          This must include quota warnings (80/90), alert triggers, invite events, and build promotions.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={[
          {
            type: 'select',
            options: [
              { value: 'all', label: 'Type: All' },
              { value: 'quota', label: 'Quota' },
              { value: 'alert', label: 'Alert' },
              { value: 'invite', label: 'Invite' },
              { value: 'build', label: 'Build' },
            ],
          },
          {
            type: 'select',
            options: [
              { value: 'all', label: 'Status: All' },
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' },
            ],
          },
          {
            type: 'button',
            label: 'Clear All',
            className: 'secondary',
          },
        ]}
        stats={[
          { label: 'Unread', value: notifications.filter(n => !n.read).length, dot: 'warn' },
          { label: 'Total', value: notifications.length },
        ]}
      />

      {/* Notifications Table */}
      <DataTable
        data={notifications}
        columns={[
          {
            key: 'notification',
            label: 'Notification',
            render: (notif) => (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!notif.read && <span className="dot" style={{ background: 'var(--p)' }} />}
                  <b>{notif.title}</b>
                </div>
                <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                  {notif.message}
                </div>
              </>
            ),
          },
          {
            key: 'type',
            label: 'Type',
            render: (notif) => (
              <span className="chip">
                {notif.type}
              </span>
            ),
          },
          {
            key: 'time',
            label: 'Time',
            render: (notif) => (
              <span className="muted">{formatTimeAgo(notif.createdAt)}</span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (notif) => (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {notif.link && (
                  <a
                    href={notif.link}
                    className="btn secondary"
                    style={{ padding: '7px 10px', fontSize: '11px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </a>
                )}
                <button
                  className="btn secondary"
                  style={{ padding: '7px 10px', fontSize: '11px' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Mark as read
                  }}
                >
                  Mark Read
                </button>
              </div>
            ),
          },
        ]}
        loading={loading}
        emptyMessage="No notifications found"
        onRowClick={(notif) => {
          if (notif.link) {
            window.location.href = notif.link
          }
        }}
        footerNote="Implementation: Notifications include quota warnings, alert triggers, invites, and build promotions. All notifications are actionable."
      />
    </AppShell>
  )
}

