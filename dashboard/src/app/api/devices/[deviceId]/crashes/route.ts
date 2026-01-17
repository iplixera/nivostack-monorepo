import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  try {
    const { deviceId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const crashes = await prisma.crash.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        device: { select: { deviceId: true, platform: true, appVersion: true } },
      }
    })

    return NextResponse.json({ crashes })
  } catch (error) {
    console.error('Error fetching device crashes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


