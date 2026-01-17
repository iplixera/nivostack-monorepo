import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseDeviceQuery, buildDeviceWhere } from '@/lib/deviceQuery'

/**
 * GET /api/projects/:projectId/devices/facets
 * 
 * Returns facet distributions (Platform, OS, App, Environment) for the current query context.
 * CRITICAL: Each facet is computed WITHOUT filtering by that facet dimension itself,
 * so users can see all available options even when one is selected.
 * 
 * This prevents the "only Web exists" bug.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const { searchParams } = new URL(request.url)
    const query = parseDeviceQuery(searchParams)

    // Compute each facet distribution by excluding that dimension from filters
    const [platformFacets, environmentFacets, appVersionFacets, osVersionFacets] = await Promise.all([
      // Platform facets - exclude platform filter
      prisma.device.groupBy({
        by: ['platform'],
        where: buildDeviceWhere(query, projectId, 'platform'),
        _count: true,
        orderBy: { _count: { platform: 'desc' } },
      }),
      
      // Environment facets - exclude environment filter
      prisma.device.groupBy({
        by: ['environment'],
        where: buildDeviceWhere(query, projectId, 'environment'),
        _count: true,
        orderBy: { _count: { environment: 'desc' } },
      }),
      
      // App version facets - exclude appVersion filter, top 8
      prisma.device.groupBy({
        by: ['appVersion'],
        where: {
          ...buildDeviceWhere(query, projectId, 'appVersion'),
          appVersion: { not: null },
        },
        _count: true,
        orderBy: { _count: { appVersion: 'desc' } },
        take: 8,
      }),
      
      // OS version facets - exclude osVersion filter, top 8
      prisma.device.groupBy({
        by: ['osVersion'],
        where: {
          ...buildDeviceWhere(query, projectId, 'osVersion'),
          osVersion: { not: null },
        },
        _count: true,
        orderBy: { _count: { osVersion: 'desc' } },
        take: 8,
      }),
    ])

    return NextResponse.json({
      facets: {
        platform: platformFacets.map(f => ({
          value: f.platform,
          label: f.platform.toUpperCase(),
          count: f._count,
        })),
        environment: environmentFacets.map(f => ({
          value: f.environment,
          label: f.environment.charAt(0).toUpperCase() + f.environment.slice(1),
          count: f._count,
        })),
        appVersion: appVersionFacets.map(f => ({
          value: f.appVersion || 'unknown',
          label: f.appVersion || 'Unknown',
          count: f._count,
        })),
        osVersion: osVersionFacets.map(f => ({
          value: f.osVersion || 'unknown',
          label: f.osVersion || 'Unknown',
          count: f._count,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching device facets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

