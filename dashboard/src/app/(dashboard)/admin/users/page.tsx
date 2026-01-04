'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar from '@/components/FilterBar'

type User = {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
  createdAt: string
  subscription: {
    id: string
    status: string
    enabled: boolean
    plan: {
      displayName: string
      price: number
    }
    trialEndDate: string
  } | null
  _count: {
    projects: number
  }
}

export default function AdminUsersPage() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!token) return

    api.admin.getUsers(token)
      .then((data) => {
        setUsers(data.users || [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [token])

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
    
    if (statusFilter === 'all') return matchesSearch
    if (statusFilter === 'admin') return matchesSearch && user.isAdmin
    if (!user.subscription) return false
    
    if (statusFilter === 'active') {
      return matchesSearch && user.subscription.enabled && user.subscription.status === 'active'
    }
    if (statusFilter === 'expired') {
      return matchesSearch && user.subscription.status === 'expired'
    }
    if (statusFilter === 'disabled') {
      return matchesSearch && !user.subscription.enabled
    }
    
    return matchesSearch
  })

  return (
    <AppShell>
      <PageHeader
        title="Users Management"
        subtitle="View and manage all registered users"
        dataMode="Admin"
        actions={
          <>
            <ThemeToggle />
          </>
        }
      />

      {/* Filter Bar */}
      <FilterBar
        filters={[
          {
            type: 'search',
            placeholder: 'Search by email or name...',
            value: search,
            onChange: (e) => setSearch(e.target.value),
          },
          {
            type: 'select',
            options: [
              { value: 'all', label: 'Status: All Users' },
              { value: 'active', label: 'Active' },
              { value: 'expired', label: 'Expired' },
              { value: 'disabled', label: 'Disabled' },
              { value: 'admin', label: 'Admins' },
            ],
            value: statusFilter,
            onChange: (e) => setStatusFilter(e.target.value),
          },
        ]}
        stats={[
          { label: 'Total users', value: users.length },
          { label: 'Active', value: users.filter(u => u.subscription?.enabled && u.subscription?.status === 'active').length },
          { label: 'Admins', value: users.filter(u => u.isAdmin).length },
        ]}
      />

      {/* Users Table */}
      <DataTable
        data={filteredUsers}
        columns={[
          {
            key: 'user',
            label: 'User',
            render: (user) => (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <b>{user.email}</b>
                  {user.isAdmin && (
                    <span className="chip" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#A78BFA', border: 'rgba(139, 92, 246, 0.2)' }}>
                      Admin
                    </span>
                  )}
                </div>
                {user.name && (
                  <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                    {user.name}
                  </div>
                )}
              </>
            ),
          },
          {
            key: 'subscription',
            label: 'Subscription',
            render: (user) => {
              if (!user.subscription) {
                return <span className="muted">No subscription</span>
              }
              return (
                <>
                  <b>{user.subscription.plan.displayName}</b>
                  <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                    ${user.subscription.plan.price === 0 ? 'Free' : user.subscription.plan.price.toFixed(2)}/mo
                  </div>
                </>
              )
            },
          },
          {
            key: 'status',
            label: 'Status',
            render: (user) => {
              if (!user.subscription) {
                return <span className="muted">—</span>
              }
              const status = !user.subscription.enabled
                ? { label: 'Disabled', dot: 'bad' }
                : user.subscription.status === 'active'
                ? { label: 'Active', dot: 'good' }
                : { label: user.subscription.status, dot: 'warn' }
              
              return (
                <span className="chip">
                  <span className={`dot ${status.dot}`} />
                  {status.label}
                </span>
              )
            },
          },
          {
            key: 'projects',
            label: 'Projects',
            render: (user) => user._count.projects,
          },
          {
            key: 'registered',
            label: 'Registered',
            render: (user) => (
              <span className="muted">{new Date(user.createdAt).toLocaleDateString()}</span>
            ),
          },
        ]}
        loading={loading}
        emptyMessage="No users found"
        footerNote={`Showing ${filteredUsers.length} of ${users.length} users`}
      />
    </AppShell>
  )
}
