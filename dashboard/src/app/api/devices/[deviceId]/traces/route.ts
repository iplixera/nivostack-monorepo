import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const since = searchParams.get('since') // For realtime tail
    
    const where: any = { deviceId }
    if (since) {
      where.timestamp = { gt: new Date(since) }
    }

    const traces = await prisma.apiTrace.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        device: { select: { deviceId: true, platform: true } },
        session: { select: { id: true, sessionToken: true } },
      }
    })

    return NextResponse.json({ traces })
  } catch (error) {
    console.error('Error fetching device traces:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


