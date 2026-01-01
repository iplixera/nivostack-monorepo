import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireProjectAccess } from '@/lib/middleware/require-project-access'

/**
 * PATCH /api/projects/[id]
 * Update project (name)
 * Requires: manage_settings permission (admin or owner)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await requireProjectAccess(request, params, {
      action: 'manage_settings',
      errorMessage: 'You do not have permission to update this project',
    })
    if (accessCheck) return accessCheck

    const { id } = await params
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Update project name
    const updatedProject = await prisma.project.update({
      where: { id },
      data: { name: name.trim() }
    })

    return NextResponse.json({ project: updatedProject })
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete project and all associated data
 * Devices are soft-deleted (marked as deleted) for analytics purposes
 * Requires: delete_project permission (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await requireProjectAccess(request, params, {
      action: 'delete_project',
      role: 'owner',
      errorMessage: 'Only project owners can delete projects',
    })
    if (accessCheck) return accessCheck

    const { id } = await params

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Step 1: Soft delete all devices (mark as deleted for analytics)
      // Devices are kept in the database but marked as deleted for future analytics
      // Set projectId to null to break the foreign key constraint
      const now = new Date()
      await tx.device.updateMany({
        where: { projectId: id },
        data: {
          status: 'deleted',
          deletedAt: now,
          projectId: null // Break foreign key so devices persist after project deletion
        }
      })

      // Step 2: Delete all other associated data (logs, traces, crashes, sessions, etc.)
      // These will cascade delete when we delete the project, but we'll do it explicitly
      // to ensure everything is cleaned up properly
      
      // Delete logs
      await tx.log.deleteMany({ where: { projectId: id } })
      
      // Delete API traces
      await tx.apiTrace.deleteMany({ where: { projectId: id } })
      
      // Delete crashes
      await tx.crash.deleteMany({ where: { projectId: id } })
      
      // Delete sessions
      await tx.session.deleteMany({ where: { projectId: id } })
      
      // Delete business config related data (order matters due to foreign keys)
      // ConfigApproval references BusinessConfig, so delete approvals first
      await tx.configApproval.deleteMany({ where: { projectId: id } })
      // ConfigAlertEvent references ConfigAlert, so delete events first
      await tx.configAlertEvent.deleteMany({ where: { projectId: id } })
      // ConfigAlert references BusinessConfig, so delete alerts before configs
      await tx.configAlert.deleteMany({ where: { projectId: id } })
      // Now delete business configs
      await tx.businessConfig.deleteMany({ where: { projectId: id } })
      // Delete config categories
      await tx.configCategory.deleteMany({ where: { projectId: id } })
      
      // Delete localization data (order matters due to foreign keys)
      // Translations reference keys and languages, so delete them first
      await tx.translation.deleteMany({ where: { projectId: id } })
      await tx.localizationKey.deleteMany({ where: { projectId: id } })
      await tx.language.deleteMany({ where: { projectId: id } })
      
      // Delete API configs
      await tx.apiConfig.deleteMany({ where: { projectId: id } })
      
      // Delete API alerts and monitored errors
      await tx.monitoredError.deleteMany({ 
        where: { 
          alert: { projectId: id } 
        } 
      })
      await tx.apiAlert.deleteMany({ where: { projectId: id } })
      
      // Delete mock endpoints and related data (order matters)
      // First, get all mock environments for this project
      const mockEnvironments = await tx.mockEnvironment.findMany({
        where: { projectId: id },
        select: { id: true }
      })
      const environmentIds = mockEnvironments.map(env => env.id)
      
      if (environmentIds.length > 0) {
        // Get all mock endpoints in these environments
        const mockEndpoints = await tx.mockEndpoint.findMany({
          where: { environmentId: { in: environmentIds } },
          select: { id: true }
        })
        const endpointIds = mockEndpoints.map(ep => ep.id)
        
        if (endpointIds.length > 0) {
          // Get all mock responses for these endpoints
          const mockResponses = await tx.mockResponse.findMany({
            where: { endpointId: { in: endpointIds } },
            select: { id: true }
          })
          const responseIds = mockResponses.map(res => res.id)
          
          // Delete conditions (can reference either endpointId or responseId)
          if (endpointIds.length > 0) {
            await tx.mockCondition.deleteMany({ 
              where: { 
                OR: [
                  { endpointId: { in: endpointIds } },
                  { responseId: { in: responseIds } }
                ]
              } 
            })
          }
          
          // Delete responses
          await tx.mockResponse.deleteMany({ 
            where: { endpointId: { in: endpointIds } } 
          })
        }
        
        // Delete endpoints
        await tx.mockEndpoint.deleteMany({ 
          where: { environmentId: { in: environmentIds } } 
        })
      }
      
      // Delete environments
      await tx.mockEnvironment.deleteMany({ where: { projectId: id } })
      
      // Delete builds and related data (order matters)
      // BuildFeature and BuildChangeLog reference Build
      // First get all builds for this project
      const builds = await tx.build.findMany({
        where: { projectId: id },
        select: { id: true }
      })
      const buildIds = builds.map(build => build.id)
      
      if (buildIds.length > 0) {
        // Delete build features and change logs
        await tx.buildFeature.deleteMany({ 
          where: { buildId: { in: buildIds } } 
        })
        await tx.buildChangeLog.deleteMany({ 
          where: { buildId: { in: buildIds } } 
        })
      }
      
      // Delete build mode (references project directly)
      await tx.buildMode.deleteMany({ where: { projectId: id } })
      // Delete builds
      await tx.build.deleteMany({ where: { projectId: id } })
      
      // Delete uploaded files
      await tx.uploadedFile.deleteMany({ where: { projectId: id } })
      
      // Delete feature flags and SDK settings
      await tx.featureFlags.deleteMany({ where: { projectId: id } })
      await tx.sdkSettings.deleteMany({ where: { projectId: id } })

      // Delete team members and invitations
      await tx.projectMember.deleteMany({ where: { projectId: id } })
      await tx.projectInvitation.deleteMany({ where: { projectId: id } })

      // Step 3: Delete the project itself
      // Note: Devices are NOT deleted - they are marked as deleted (status='deleted') above
      // We need to set projectId to null to break the foreign key constraint
      // But first, we need to handle the unique constraint
      // Solution: Set projectId to a special value or make it nullable
      // For now, we'll keep projectId but mark devices as deleted
      // The cascade will try to delete devices, but we've already marked them
      // Actually, we need to prevent cascade deletion of devices
      // So we'll delete the project manually after setting devices' projectId to null
      
      // Set projectId to null for all devices (breaking the foreign key)
      // This requires making projectId nullable, but for now we'll work around it
      // by keeping the projectId but marking devices as deleted
      await tx.project.delete({
        where: { id }
      })
      
      // Note: Due to cascade, devices would be deleted, but we want to keep them
      // So we need to change the schema to use SetNull instead of Cascade
      // For now, devices are marked as deleted before project deletion
      // In a future migration, we'll change Device.onDelete to SetNull
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete project error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

