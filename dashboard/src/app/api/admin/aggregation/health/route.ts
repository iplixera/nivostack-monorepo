import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import Redis from 'ioredis'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check database connectivity
    let databaseConnected = false
    try {
      await prisma.$queryRaw`SELECT 1`
      databaseConnected = true
    } catch (error) {
      console.error('Database health check failed:', error)
    }

    // Check Redis connectivity
    let redisConnected = false
    let redisConnection = null
    try {
      redisConnection = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => Math.min(times * 50, 2000),
      })

      await new Promise((resolve, reject) => {
        redisConnection!.on('connect', () => resolve(true))
        redisConnection!.on('error', reject)
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      })

      redisConnected = true
    } catch (error) {
      console.error('Redis health check failed:', error)
    } finally {
      if (redisConnection) {
        redisConnection.quit()
      }
    }

    // Check if worker is running (simplified - check if queue has active jobs)
    // In a real implementation, you'd have a heartbeat mechanism
    let workerRunning = false
    try {
      const activeJobs = await prisma.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count FROM "_bull_aggregation" WHERE "finished_on" IS NULL
      `
      workerRunning = (activeJobs[0]?.count || 0) > 0
    } catch (error) {
      console.error('Worker health check failed:', error)
    }

    const health = {
      databaseConnected,
      redisConnected,
      workerRunning,
      lastHeartbeat: new Date().toISOString(), // Simplified - in real implementation, track actual heartbeats
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error('Get health status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
