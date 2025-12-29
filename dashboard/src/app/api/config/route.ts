import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - List all API configs for a project (dashboard) or get configs for device
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    const authHeader = request.headers.get('authorization')
    const projectId = request.nextUrl.searchParams.get('projectId')

    // Device request - return configs for SDK
    if (apiKey) {
      const project = await prisma.project.findUnique({
        where: { apiKey }
      })

      if (!project) {
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
      }

      const configs = await prisma.apiConfig.findMany({
        where: {
          projectId: project.id,
          isEnabled: true
        },
        select: {
          endpoint: true,
          method: true,
          costPerRequest: true,
          name: true
        }
      })

      return NextResponse.json({ configs })
    }

    // Dashboard request - return full configs
    if (authHeader && projectId) {
      const token = authHeader.replace('Bearer ', '')
      const payload = verifyToken(token)

      if (!payload) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Verify project ownership
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: payload.userId
        }
      })

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      const configs = await prisma.apiConfig.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      })

      // Get unique endpoints from traces that don't have configs yet
      const tracedEndpoints = await prisma.apiTrace.findMany({
        where: { projectId },
        select: {
          url: true,
          method: true
        },
        distinct: ['url', 'method']
      })

      // Extract endpoint paths from full URLs
      const suggestedEndpoints = tracedEndpoints.map(t => {
        try {
          const url = new URL(t.url)
          return {
            endpoint: url.pathname,
            method: t.method,
            fullUrl: t.url
          }
        } catch {
          return {
            endpoint: t.url,
            method: t.method,
            fullUrl: t.url
          }
        }
      }).filter(e => !configs.some(c =>
        c.endpoint === e.endpoint && (c.method === null || c.method === e.method)
      ))

      return NextResponse.json({ configs, suggestedEndpoints })
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } catch (error) {
    console.error('Config GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new API config
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Config POST body:', JSON.stringify(body))
    const { projectId, endpoint, method, name, description, costPerRequest, isEnabled } = body

    if (!projectId || !endpoint) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: payload.userId
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const configCost = Number(costPerRequest) || 0
    console.log('Config POST creating with cost:', configCost)

    const config = await prisma.apiConfig.create({
      data: {
        projectId,
        endpoint,
        method: method || null,
        name: name || null,
        description: description || null,
        costPerRequest: configCost,
        isEnabled: isEnabled !== false
      }
    })

    console.log('Config POST result:', JSON.stringify(config))

    // Apply cost to existing traces that match this endpoint
    if (configCost > 0 && config.isEnabled) {
      const endpointPattern = config.endpoint.endsWith('/*')
        ? config.endpoint.slice(0, -2)
        : config.endpoint

      const tracesToUpdate = await prisma.apiTrace.findMany({
        where: {
          projectId: config.projectId,
          url: { contains: endpointPattern }
        },
        select: { id: true, url: true, method: true }
      })

      let updatedCount = 0
      for (const trace of tracesToUpdate) {
        try {
          const urlObj = new URL(trace.url)
          const tracePath = urlObj.pathname

          const isMatch = config.endpoint.endsWith('/*')
            ? tracePath.startsWith(endpointPattern)
            : tracePath === config.endpoint

          const methodMatch = !config.method || config.method === trace.method

          if (isMatch && methodMatch) {
            await prisma.apiTrace.update({
              where: { id: trace.id },
              data: { cost: config.costPerRequest }
            })
            updatedCount++
          }
        } catch {
          // URL parsing failed, skip
        }
      }
      console.log(`Config POST: Updated ${updatedCount} traces with new cost`)
    }

    return NextResponse.json({ config })
  } catch (error: unknown) {
    console.error('Config POST error:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Config for this endpoint already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an API config
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Config PUT body:', JSON.stringify(body))
    const { id, endpoint, method, name, description, costPerRequest, isEnabled } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing config ID' }, { status: 400 })
    }

    // Verify config ownership
    const existingConfig = await prisma.apiConfig.findUnique({
      where: { id },
      include: { project: true }
    })

    if (!existingConfig || existingConfig.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Prepare update data - use explicit null check to allow setting to null/0
    const updateData: Record<string, unknown> = {}
    if (endpoint !== undefined) updateData.endpoint = endpoint
    if (method !== undefined) updateData.method = method || null
    if (name !== undefined) updateData.name = name || null
    if (description !== undefined) updateData.description = description || null
    if (costPerRequest !== undefined) updateData.costPerRequest = Number(costPerRequest) || 0
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled

    console.log('Config PUT updateData:', JSON.stringify(updateData))

    const config = await prisma.apiConfig.update({
      where: { id },
      data: updateData
    })

    console.log('Config PUT result:', JSON.stringify(config))

    // Recalculate costs for existing traces that match this endpoint
    if (costPerRequest !== undefined && config.isEnabled) {
      const endpointPattern = config.endpoint.endsWith('/*')
        ? config.endpoint.slice(0, -2)
        : config.endpoint

      // Update traces that match this endpoint pattern
      const tracesToUpdate = await prisma.apiTrace.findMany({
        where: {
          projectId: config.projectId,
          url: { contains: endpointPattern }
        },
        select: { id: true, url: true, method: true }
      })

      for (const trace of tracesToUpdate) {
        try {
          const urlObj = new URL(trace.url)
          const tracePath = urlObj.pathname

          // Check if this trace matches the config
          const isMatch = config.endpoint.endsWith('/*')
            ? tracePath.startsWith(endpointPattern)
            : tracePath === config.endpoint

          const methodMatch = !config.method || config.method === trace.method

          if (isMatch && methodMatch) {
            await prisma.apiTrace.update({
              where: { id: trace.id },
              data: { cost: config.costPerRequest }
            })
          }
        } catch {
          // URL parsing failed, skip
        }
      }
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Config PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete an API config
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const configId = request.nextUrl.searchParams.get('id')

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!configId) {
      return NextResponse.json({ error: 'Missing config ID' }, { status: 400 })
    }

    // Verify config ownership
    const existingConfig = await prisma.apiConfig.findUnique({
      where: { id: configId },
      include: { project: true }
    })

    if (!existingConfig || existingConfig.project.userId !== payload.userId) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    await prisma.apiConfig.delete({
      where: { id: configId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Config DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
