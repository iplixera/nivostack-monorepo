import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all projects with their aggregation states
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        aggregationState: {
          select: {
            lastHourlyAggregation: true,
            lastDailyAggregation: true,
            isAggregating: true,
          },
        },
      },
    })

    const states = projects.map(project => ({
      projectId: project.id,
      projectName: project.name,
      lastHourlyAggregation: project.aggregationState?.lastHourlyAggregation?.toISOString(),
      lastDailyAggregation: project.aggregationState?.lastDailyAggregation?.toISOString(),
      isAggregating: project.aggregationState?.isAggregating || false,
    }))

    return NextResponse.json({ states })
  } catch (error) {
    console.error('Get aggregation states error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
