'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else if (!user.isAdmin) {
        router.push('/projects')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--m)' }}>Loading...</div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null
  }

  // Admin layout is now handled by the main dashboard layout
  // This layout just ensures admin access and passes through
  return <>{children}</>
}

