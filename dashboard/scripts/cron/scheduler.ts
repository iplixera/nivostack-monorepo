/**
 * Aggregation Cron Scheduler
 * 
 * Node-cron scheduler that triggers aggregation jobs.
 * Runs continuously and enqueues jobs on schedule.
 * 
 * Usage:
 *   pnpm tsx scripts/cron/scheduler.ts
 *   OR
 *   pnpm cron:scheduler
 */

// Load environment variables
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from root directory
dotenv.config({ path: resolve(__dirname, '../../../.env.local') });

import cron from 'node-cron';
import { enqueueHourlyAggregation, enqueueDailyAggregation } from '../../src/lib/aggregation/enqueue';

// Validate cron expressions
const HOURLY_CRON = '0 * * * *'; // Every hour at minute 0
const DAILY_CRON = '0 0 * * *'; // Every day at midnight (00:00)

console.log('[Cron] Starting aggregation scheduler...');
console.log(`[Cron] Hourly schedule: ${HOURLY_CRON} (every hour at :00)`);
console.log(`[Cron] Daily schedule: ${DAILY_CRON} (every day at 00:00)`);

// Hourly aggregation job
const hourlyJob = cron.schedule(HOURLY_CRON, async () => {
  const timestamp = new Date().toISOString();
  console.log(`[Cron] [${timestamp}] Triggering hourly aggregation...`);
  
  try {
    const result = await enqueueHourlyAggregation();
    console.log(`[Cron] [${timestamp}] Hourly aggregation enqueued: ${result.enqueued} jobs`);
  } catch (error) {
    console.error(`[Cron] [${timestamp}] Error enqueueing hourly aggregation:`, error);
  }
}, {
  scheduled: true,
  timezone: 'UTC', // Use UTC for consistency
});

// Daily aggregation job
const dailyJob = cron.schedule(DAILY_CRON, async () => {
  const timestamp = new Date().toISOString();
  console.log(`[Cron] [${timestamp}] Triggering daily aggregation...`);
  
  try {
    const result = await enqueueDailyAggregation();
    console.log(`[Cron] [${timestamp}] Daily aggregation enqueued: ${result.enqueued} jobs`);
  } catch (error) {
    console.error(`[Cron] [${timestamp}] Error enqueueing daily aggregation:`, error);
  }
}, {
  scheduled: true,
  timezone: 'UTC', // Use UTC for consistency
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Cron] SIGTERM received, stopping scheduler...');
  hourlyJob.stop();
  dailyJob.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Cron] SIGINT received, stopping scheduler...');
  hourlyJob.stop();
  dailyJob.stop();
  process.exit(0);
});

console.log('[Cron] Scheduler started successfully');
console.log('[Cron] Press Ctrl+C to stop');

