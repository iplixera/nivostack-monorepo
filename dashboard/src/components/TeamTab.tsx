'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { api } from '@/lib/api'

interface TeamMember {
  id: string
  user: {
    id: string
    email: string
    name: string | null
  }
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: string | null
  invitedBy: {
    id: string
    name: string | null
    email: string
  } | null
}

interface Invitation {
  id: string
  email: string
  role: string
  invitedBy: {
    id: string
    name: string | null
    email: string
  }
  invitedAt: string
  expiresAt: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  emailSent: boolean
  emailSentAt: string | null
  resendCount: number
}

export default function TeamTab({ projectId }: { projectId: string }) {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamData()
  }, [projectId])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Fetch members
      const membersRes = await fetch(`/api/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const membersData = await membersRes.json()
      setMembers(membersData.members || [])

      // Fetch invitations
      const invitationsRes = await fetch(`/api/projects/${projectId}/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const invitationsData = await invitationsRes.json()
      setInvitations(invitationsData.invitations || [])
    } catch (err) {
      console.error('Failed to fetch team data:', err)
      setError('Failed to load team data')
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setError('Email is required')
      return
    }

    try {
      setInviting(true)
      setError(null)
      const token = localStorage.getItem('token')

      const response = await fetch(`/api/projects/${projectId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      // Refresh data
      await fetchTeamData()
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('member')
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      setError(null)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/projects/${projectId}/invitations/${invitationId}/resend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (response.ok) {
        await fetchTeamData()
      } else {
        setError(data.error || 'Failed to resend invitation')
      }
    } catch (err: any) {
      console.error('Failed to resend invitation:', err)
      setError(err.message || 'Failed to resend invitation')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    const invitation = invitations.find((i) => i.id === invitationId)
    if (!invitation) return

    if (!confirm(`Are you sure you want to cancel the invitation to ${invitation.email}?`)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/projects/${projectId}/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (response.ok) {
        await fetchTeamData()
        setError(null)
      } else {
        setError(data.error || 'Failed to cancel invitation')
      }
    } catch (err: any) {
      console.error('Failed to cancel invitation:', err)
      setError(err.message || 'Failed to cancel invitation')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return

    if (!confirm(`Are you sure you want to remove ${member.user.name || member.user.email} from this project?`)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (response.ok) {
        await fetchTeamData()
        setError(null)
      } else {
        setError(data.error || 'Failed to remove member')
      }
    } catch (err: any) {
      console.error('Failed to remove member:', err)
      setError(err.message || 'Failed to remove member')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-900/30 text-purple-400'
      case 'admin':
        return 'bg-blue-900/30 text-blue-400'
      case 'member':
        return 'bg-green-900/30 text-green-400'
      case 'viewer':
        return 'bg-gray-700 text-gray-300'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  const currentUserMember = members.find((m) => m.user.id === user?.id)
  const canInvite = currentUserMember?.role === 'owner' || currentUserMember?.role === 'admin'

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Team</h2>
          <p className="text-gray-400 mt-1">Manage team members and invitations</p>
        </div>
        {error && (
          <div className="flex-1 max-w-md mx-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-400 text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-300 hover:text-red-200"
            >
              ×
            </button>
          </div>
        )}
        {canInvite && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Invite Member
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-300 hover:text-red-200 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Members Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Members ({members.length})</h3>
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          {members.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No members yet</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {members.map((member) => (
                <div key={member.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {member.user.name
                          ? member.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                          : member.user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {member.user.name || member.user.email}
                        </div>
                        <div className="text-sm text-gray-400">{member.user.email}</div>
                        {member.joinedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      {canInvite && member.user.id !== user?.id && member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Pending Invitations ({invitations.filter((i) => i.status === 'pending').length})
          </h3>
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="divide-y divide-gray-800">
              {invitations
                .filter((i) => i.status === 'pending')
                .map((invitation) => (
                  <div key={invitation.id} className="p-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{invitation.email}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Invited by {invitation.invitedBy.name || invitation.invitedBy.email} as{' '}
                          <span className="capitalize">{invitation.role}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {canInvite && (
                          <>
                            <button
                              onClick={() => handleResendInvitation(invitation.id)}
                              className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
                            >
                              Resend
                            </button>
                            <button
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Invite Team Member</h3>
            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setError(null)
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

