'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=/team?project=${projectId}`)
      return
    }

    // Redirect to team page with project selected
    router.push(`/team?project=${projectId}`)
  }, [user, projectId, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to team page...</p>
      </div>
    </div>
  )
}

