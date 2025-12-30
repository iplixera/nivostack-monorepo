'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { api } from '@/lib/api'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Users Management</h1>
        <p className="text-gray-400">View and manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-4 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="disabled">Disabled</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {user.email}
                        {user.isAdmin && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-purple-600/20 text-purple-400 rounded">Admin</span>
                        )}
                      </div>
                      {user.name && (
                        <div className="text-sm text-gray-400">{user.name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.subscription ? (
                      <div>
                        <div className="text-sm text-white">{user.subscription.plan.displayName}</div>
                        <div className="text-xs text-gray-400">
                          ${user.subscription.plan.price === 0 ? 'Free' : user.subscription.plan.price.toFixed(2)}/mo
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No subscription</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.subscription ? (
                      <div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          !user.subscription.enabled
                            ? 'bg-red-900/30 text-red-400'
                            : user.subscription.status === 'active'
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {!user.subscription.enabled
                            ? 'Disabled'
                            : user.subscription.status === 'active'
                            ? 'Active'
                            : user.subscription.status}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user._count.projects}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No users found
          </div>
        )}
      </div>

      <div className="text-sm text-gray-400">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  )
}

