/**
 * Aggregation Queue Configuration
 * 
 * Sets up BullMQ queue with Redis connection for processing aggregation jobs.
 * Used by both enqueue functions and worker processes.
 */

import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Redis connection configuration
// Note: maxRetriesPerRequest can be a number for Queue (non-blocking), 
// but must be null for Worker (blocking operations)
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3, // OK for Queue (non-blocking)
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Create Redis connection
export const redisConnection = new Redis(redisConfig);

// Handle Redis connection events
redisConnection.on('connect', () => {
  console.log('[Redis] Connected to Redis');
});

redisConnection.on('error', (error) => {
  console.error('[Redis] Connection error:', error);
});

redisConnection.on('close', () => {
  console.log('[Redis] Connection closed');
});

// Create aggregation queue
export const aggregationQueue = new Queue('aggregation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds, then 4s, 8s, etc.
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Queue event handlers for monitoring
aggregationQueue.on('error', (error) => {
  console.error('[Queue] Error:', error);
});

aggregationQueue.on('waiting', (jobId) => {
  console.log(`[Queue] Job ${jobId} is waiting`);
});

aggregationQueue.on('active', (job) => {
  console.log(`[Queue] Job ${job.id} is now active`);
});

aggregationQueue.on('completed', (job) => {
  console.log(`[Queue] Job ${job.id} completed`);
});

aggregationQueue.on('failed', (job, err) => {
  console.error(`[Queue] Job ${job?.id} failed:`, err);
});

export default aggregationQueue;

