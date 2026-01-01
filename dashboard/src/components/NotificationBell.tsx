'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  readAt: string | null
  actionUrl: string | null
  createdAt: string
}

export default function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    // Fetch notifications
    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications?limit=20', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // Handle invitation notifications specially
    if (notification.type === 'invitation') {
      setIsOpen(false)
      
      // If we have a token, accept directly
      if (notification.data?.token) {
        await handleAcceptInvitation(notification.data.token, notification.data.projectId)
        return
      }
      
      // Otherwise, navigate to team page (handles both new and old format URLs)
      const projectId = notification.data?.projectId
      if (projectId) {
        router.push(`/team?project=${projectId}`)
        return
      }
      
      // Fallback: navigate to team page
      router.push('/team')
      return
    }

    if (notification.actionUrl) {
      setIsOpen(false)
      router.push(notification.actionUrl)
    }
  }

  const handleAcceptInvitation = async (token: string, projectId: string) => {
    try {
      const authToken = localStorage.getItem('token')
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh notifications to remove accepted one
        fetchNotifications()
        // Show success message
        alert('Invitation accepted successfully!')
        // Navigate to project
        router.push(`/projects/${projectId}`)
        // Force page reload to refresh project list
        window.location.href = `/projects/${projectId}`
      } else {
        const error = await response.json()
        console.error('Failed to accept invitation:', error)
        alert(error.error || 'Failed to accept invitation. Please try again.')
        // Navigate to team page as fallback
        router.push(`/team?project=${projectId}`)
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error)
      alert('Failed to accept invitation. Please try again.')
      // Navigate to team page as fallback
      router.push(`/team?project=${projectId}`)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'invitation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        )
      case 'project_update':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'alert':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            fetchNotifications()
          }
        }}
        className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-50 max-h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-4 hover:bg-gray-800 transition-colors ${
                      !notification.read ? 'bg-gray-800/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex-shrink-0 mt-1 ${
                          notification.read ? 'text-gray-500' : 'text-blue-500'
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p
                            className={`text-sm font-medium ${
                              notification.read ? 'text-gray-400' : 'text-white'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="ml-2 flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

