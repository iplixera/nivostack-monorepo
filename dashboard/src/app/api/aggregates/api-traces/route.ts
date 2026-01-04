import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { canPerformAction } from '@/lib/team-access'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')
    const granularity = searchParams.get('granularity') || 'hourly' // 'hourly' | 'daily'

    // Dimension filters
    const endpoint = searchParams.get('endpoint')
    const method = searchParams.get('method')
    const statusClass = searchParams.get('statusClass')
    const screenName = searchParams.get('screenName')
    const buildVersion = searchParams.get('buildVersion')
    const country = searchParams.get('country')
    const platform = searchParams.get('platform')

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    if (!startTime || !endTime) {
      return NextResponse.json({ error: 'startTime and endTime are required' }, { status: 400 })
    }

    // Check if user has access to project
    const hasAccess = await canPerformAction(user.id, projectId, 'view')
    if (!hasAccess) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
    }

    // Build where clause
    const where: any = {
      projectId,
      granularity,
      period: {
        gte: new Date(startTime),
        lt: new Date(endTime),
      },
    }

    // Add dimension filters if provided
    if (endpoint) where.endpoint = endpoint
    if (method) where.method = method
    if (statusClass) where.statusClass = statusClass
    if (screenName) where.screenName = screenName
    if (buildVersion) where.buildVersion = buildVersion
    if (country) where.country = country
    if (platform) where.platform = platform

    // Get aggregated data
    const [aggregates, total] = await Promise.all([
      prisma.apiTraceAggregate.findMany({
        where,
        orderBy: { period: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.apiTraceAggregate.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }

    return NextResponse.json({
      aggregates,
      total,
      limit,
      offset,
      pagination,
    })
  } catch (error) {
    console.error('Get aggregate API traces error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
