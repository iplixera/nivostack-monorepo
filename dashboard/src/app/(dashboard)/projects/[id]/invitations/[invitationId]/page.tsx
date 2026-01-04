'use client'

import { useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

/**
 * Redirect page for old invitation notification URLs
 * This handles the old format: /projects/[id]/invitations/[invitationId]
 * and redirects to the team page where users can accept invitations
 */
export default function InvitationRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const projectId = params?.id as string

  const handleRedirect = useCallback(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=/team?project=${projectId}`)
      return
    }

    // Redirect to team page with project selected
    router.push(`/team?project=${projectId}`)
  }, [user, projectId, router])

  useEffect(() => {
    handleRedirect()
  }, [handleRedirect])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          animation: 'spin 1s linear infinite',
          borderRadius: '50%',
          height: '48px',
          width: '48px',
          borderBottom: '2px solid var(--p)',
          margin: '0 auto 16px',
        }}></div>
        <p style={{ color: 'var(--m)' }}>Redirecting to team page...</p>
      </div>
    </div>
  )
}

