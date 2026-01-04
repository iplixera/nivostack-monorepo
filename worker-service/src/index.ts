/**
 * Aggregation Worker Service
 *
 * External worker service that processes aggregation jobs from Redis queue.
 * Designed to run as a separate service in production (Railway, Render, etc.)
 *
 * Environment Variables:
 * - REDIS_HOST: Upstash Redis host
 * - REDIS_PORT: Upstash Redis port (default: 6379)
 * - REDIS_PASSWORD: Upstash Redis password
 * - REDIS_TLS: Enable TLS (default: true for Upstash)
 * - DATABASE_URL: Production database URL
 * - WORKER_CONCURRENCY: Number of concurrent jobs (default: 20)
 */

import dotenv from 'dotenv'
dotenv.config()

import { Worker } from 'bullmq'
import Redis from 'ioredis'

// Import aggregation logic from the main dashboard
// Note: This assumes the worker service is in the same monorepo
import { aggregateAll } from '../../dashboard/src/lib/aggregation/aggregate'

// Redis configuration for Upstash
const redisConfig = {
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD!,
  tls: process.env.REDIS_TLS !== 'false' ? {} : undefined, // Default to true for Upstash
  maxRetriesPerRequest: null, // Required for BullMQ workers
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
}

const redisConnection = new Redis(redisConfig)

redisConnection.on('connect', () => {
  console.log('[Worker Service] Connected to Redis')
})

redisConnection.on('error', (error) => {
  console.error('[Worker Service] Redis connection error:', error)
})

console.log('[Worker Service] 🚀 Aggregation worker service starting...')
console.log(`[Worker Service] Concurrency: ${process.env.WORKER_CONCURRENCY || 20}`)
console.log('[Worker Service] Waiting for jobs...')

const worker = new Worker(
  'aggregation',
  async (job) => {
    const { projectId, startTime, endTime, granularity } = job.data

    console.log(`[Worker Service] Processing job ${job.id} for project: ${projectId}`)
    console.log(`[Worker Service] Time range: ${startTime} to ${endTime}`)
    console.log(`[Worker Service] Granularity: ${granularity}`)

    try {
      await job.updateProgress(10)

      await aggregateAll(
        projectId,
        new Date(startTime),
        new Date(endTime),
        granularity
      )

      await job.updateProgress(100)

      console.log(`[Worker Service] ✅ Completed job ${job.id} for project ${projectId}`)

      return {
        success: true,
        projectId,
        processedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`[Worker Service] ❌ Error processing job ${job.id}:`, error)
      throw error
    }
  },
  {
    connection: redisConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '20'),
    limiter: {
      max: 100, // Max jobs per duration
      duration: 60000, // Per minute
    },
  }
)

worker.on('completed', (job) => {
  console.log(`[Worker Service] Job ${job.id} completed successfully`)
})

worker.on('failed', (job, err) => {
  console.error(`[Worker Service] Job ${job?.id} failed:`, err)
})

worker.on('error', (err) => {
  console.error('[Worker Service] Worker error:', err)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker Service] Received SIGTERM, shutting down gracefully...')
  await worker.close()
  await redisConnection.quit()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('[Worker Service] Received SIGINT, shutting down gracefully...')
  await worker.close()
  await redisConnection.quit()
  process.exit(0)
})
