import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { calculateExperimentStats, calculateStatisticalSignificance } from '@/lib/business-config/experiments'

/**
 * GET /api/experiments/[id]/results
 * Get experiment results and statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const experiment = await prisma.experiment.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Experiment not found' }, { status: 404 })
    }

    // Verify project ownership
    if (experiment.project.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get assignments
    const assignments = await prisma.experimentAssignment.findMany({
      where: { experimentId: id },
      select: {
        variantIndex: true,
        assignedAt: true
      }
    })

    // Get all assignments first for efficient lookup
    const allAssignments = await prisma.experimentAssignment.findMany({
      where: { experimentId: id }
    })
    
    // Create lookup map
    const assignmentMap = new Map<string, number>()
    allAssignments.forEach(a => {
      const key = `${a.deviceId || 'none'}:${a.userId || 'none'}`
      assignmentMap.set(key, a.variantIndex)
    })

    // Get events with device/user info
    const events = await prisma.experimentEvent.findMany({
      where: { experimentId: id },
      select: {
        deviceId: true,
        userId: true,
        eventType: true,
        eventName: true,
        eventValue: true,
        createdAt: true
      }
    })

    // Map events to variant indices via assignments
    const eventsWithVariants = events.map((e) => {
      const key = `${e.deviceId || 'none'}:${e.userId || 'none'}`
      const variantIndex = assignmentMap.get(key) ?? 0
      return {
        variantIndex,
        eventType: e.eventType,
        eventName: e.eventName,
        eventValue: e.eventValue || undefined
      }
    })

    // Calculate statistics
    const stats = calculateExperimentStats(
      assignments.map(a => ({ variantIndex: a.variantIndex, createdAt: a.assignedAt })),
      eventsWithVariants.map(e => ({
        variantIndex: e.variantIndex,
        eventType: e.eventType,
        eventValue: e.eventValue || undefined
      }))
    )

    // Calculate statistical significance between variants
    const significanceResults: any[] = []
    if (stats.variants.length >= 2) {
      for (let i = 0; i < stats.variants.length - 1; i++) {
        for (let j = i + 1; j < stats.variants.length; j++) {
          const sig = calculateStatisticalSignificance(
            {
              assignments: stats.variants[i].assignments,
              conversions: stats.variants[i].conversions
            },
            {
              assignments: stats.variants[j].assignments,
              conversions: stats.variants[j].conversions
            }
          )
          significanceResults.push({
            variantA: i,
            variantB: j,
            ...sig
          })
        }
      }
    }

    return NextResponse.json({
      experiment: {
        id: experiment.id,
        name: experiment.name,
        status: experiment.status,
        variants: experiment.variants
      },
      stats,
      significance: significanceResults,
      totalEvents: events.length
    })
  } catch (error) {
    console.error('Get experiment results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

