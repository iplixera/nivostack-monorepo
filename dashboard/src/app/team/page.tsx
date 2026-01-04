'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'
import ThemeToggle from '@/components/ThemeToggle'
import DataTable, { Column } from '@/components/DataTable'
import FilterBar from '@/components/FilterBar'

type TeamMember = {
  id: string
  email: string
  name: string | null
  role: 'owner' | 'admin' | 'member' | 'viewer'
  invitedAt: string
  lastActiveAt: string | null
  projects: number
}

export default function TeamPage() {
  const { token } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchMembers()
    }
  }, [token])

  const fetchMembers = async () => {
    if (!token) return
    try {
      setLoading(true)
      // TODO: Implement team API
      setMembers([])
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Team & Access"
        subtitle="Members, roles, invitations, and project-level access control. Enterprise: SSO/SCIM hooks later."
        dataMode="Org"
        actions={
          <>
            <ThemeToggle />
            <button className="btn" onClick={() => {}}>
              Invite Member
            </button>
          </>
        }
      />

      {/* Note Section */}
      <div className="note" style={{ marginTop: '18px' }}>
        <b>Members</b>
        <div className="muted" style={{ marginTop: '6px' }}>
          Team plan supports multiple seats. Roles: owner/admin/member/viewer.
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={[
          {
            type: 'search',
            placeholder: 'Search member email / name',
          },
          {
            type: 'select',
            options: [
              { value: 'all', label: 'Role: All' },
              { value: 'owner', label: 'Owner' },
              { value: 'admin', label: 'Admin' },
              { value: 'member', label: 'Member' },
              { value: 'viewer', label: 'Viewer' },
            ],
          },
          {
            type: 'button',
            label: 'More Filters',
            className: 'secondary',
          },
        ]}
        stats={[
          { label: 'Total members', value: members.length },
          { label: 'Active seats', value: members.filter(m => m.lastActiveAt).length },
          { label: 'Pending invites', value: '0' },
        ]}
      />

      {/* Members Table */}
      <DataTable
        data={members}
        columns={[
          {
            key: 'member',
            label: 'Member',
            render: (member) => (
              <>
                <b>{member.name || member.email}</b>
                {member.name && (
                  <div className="muted" style={{ fontSize: '11px' }}>
                    {member.email}
                  </div>
                )}
              </>
            ),
          },
          {
            key: 'role',
            label: 'Role',
            render: (member) => (
              <span className="chip">
                {member.role}
              </span>
            ),
          },
          {
            key: 'projects',
            label: 'Projects',
            render: (member) => member.projects,
          },
          {
            key: 'lastActive',
            label: 'Last Active',
            render: (member) => (
              <span className="muted">
                {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleDateString() : 'Never'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (member) => (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  className="btn secondary"
                  style={{ padding: '7px 10px', fontSize: '11px' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Edit member role
                  }}
                >
                  Edit Role
                </button>
                {member.role !== 'owner' && (
                  <button
                    className="btn secondary"
                    style={{ padding: '7px 10px', fontSize: '11px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Remove member
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ),
          },
        ]}
        loading={loading}
        emptyMessage="No team members found"
        onRowClick={(member) => {
          // TODO: Open member detail drawer
          console.log('Open member:', member.id)
        }}
        footerNote="Implementation: Team members have roles that control access to projects. Enterprise plans support SSO/SCIM."
      />
    </AppShell>
  )
}

