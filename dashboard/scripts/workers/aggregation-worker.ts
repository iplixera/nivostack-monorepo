/**
 * Aggregation Worker Process
 * 
 * Worker that processes aggregation jobs from the queue.
 * Runs continuously, consuming jobs and aggregating data.
 * 
 * Usage:
 *   pnpm worker:aggregation
 */

import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { aggregateAll } from '../../src/lib/aggregation/aggregate';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Create Redis connection
const redisConnection = new Redis(redisConfig);

// Handle Redis connection events
redisConnection.on('connect', () => {
  console.log('[Worker] Connected to Redis');
});

redisConnection.on('error', (error) => {
  console.error('[Worker] Redis connection error:', error);
});

redisConnection.on('close', () => {
  console.log('[Worker] Redis connection closed');
});

// Create Worker
const worker = new Worker(
  'aggregation',
  async (job) => {
    const { projectId, startTime, endTime, granularity } = job.data;

    console.log(`[Worker] Processing job ${job.id} for project: ${projectId}`);
    console.log(`[Worker] Granularity: ${granularity}`);
    console.log(`[Worker] Time range: ${startTime} to ${endTime}`);

    try {
      // Update job progress
      await job.updateProgress(10);

      // Aggregate all data types
      await aggregateAll(
        projectId,
        new Date(startTime),
        new Date(endTime),
        granularity
      );

      // Update job progress
      await job.updateProgress(100);

      console.log(`[Worker] ✅ Completed job ${job.id} for project ${projectId}`);
      
      return {
        success: true,
        projectId,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[Worker] ❌ Error processing job ${job.id}:`, error);
      throw error; // Will trigger retry mechanism
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs in parallel
    limiter: {
      max: 10, // Max 10 jobs per duration
      duration: 60000, // Per 60 seconds
    },
  }
);

// Worker event handlers
worker.on('completed', (job) => {
  console.log(`[Worker] ✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] ❌ Job ${job?.id} failed:`, err);
  console.error(`[Worker] Error details:`, err.message);
  if (job?.data) {
    console.error(`[Worker] Job data:`, job.data);
  }
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});

worker.on('active', (job) => {
  console.log(`[Worker] 🔄 Job ${job.id} is now active`);
});

worker.on('stalled', (jobId) => {
  console.warn(`[Worker] ⚠️  Job ${jobId} stalled`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, shutting down gracefully...');
  await worker.close();
  await redisConnection.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] SIGINT received, shutting down gracefully...');
  await worker.close();
  await redisConnection.quit();
  process.exit(0);
});

console.log('[Worker] 🚀 Aggregation worker started');
console.log('[Worker] Waiting for jobs...');
console.log(`[Worker] Concurrency: 5 jobs`);
console.log(`[Worker] Rate limit: 10 jobs per 60 seconds`);

