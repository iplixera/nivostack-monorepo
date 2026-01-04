/**
 * View Queue Details
 * 
 * Detailed view of all jobs in the aggregation queue with filtering options.
 * 
 * Usage:
 *   pnpm view:queue
 *   pnpm view:queue --waiting
 *   pnpm view:queue --prioritized
 *   pnpm view:queue --all
 */

// Load environment variables
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from root directory
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

import { aggregationQueue } from '../src/lib/aggregation/queue';

interface QueueStats {
  waiting: number;
  delayed: number;
  prioritized: number;
  active: number;
  completed: number;
  failed: number;
}

async function viewQueueDetails(filter?: string) {
  console.log('📊 Aggregation Queue Details\n');

  try {
    // Get all job types
    const [waiting, delayed, prioritized, active, completed, failed] = await Promise.all([
      aggregationQueue.getWaiting(),
      aggregationQueue.getDelayed(),
      aggregationQueue.getPrioritized(),
      aggregationQueue.getActive(),
      aggregationQueue.getCompleted(0, 100), // Last 100 completed
      aggregationQueue.getFailed(0, 100), // Last 100 failed
    ]);

    const stats: QueueStats = {
      waiting: waiting.length,
      delayed: delayed.length,
      prioritized: prioritized.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };

    // Summary
    console.log('📈 Queue Summary:');
    console.log(`  ⏳ Waiting: ${stats.waiting}`);
    console.log(`  ⏰ Delayed: ${stats.delayed}`);
    console.log(`  ⚡ Prioritized: ${stats.prioritized}`);
    console.log(`  🔄 Active: ${stats.active}`);
    console.log(`  ✅ Completed: ${stats.completed}`);
    console.log(`  ❌ Failed: ${stats.failed}`);
    console.log(`  📦 Total: ${stats.waiting + stats.delayed + stats.prioritized + stats.active + stats.completed + stats.failed}\n`);

    // Show jobs based on filter
    if (!filter || filter === 'all' || filter === 'waiting') {
      if (waiting.length > 0) {
        console.log(`\n⏳ Waiting Jobs (${waiting.length}):`);
        waiting.forEach((job, idx) => {
          const data = job.data as any;
          console.log(`  ${idx + 1}. Job ID: ${job.id}`);
          console.log(`     Name: ${job.name}`);
          console.log(`     Project: ${data.projectId}`);
          console.log(`     Granularity: ${data.granularity}`);
          console.log(`     Time Range: ${data.startTime} → ${data.endTime}`);
          console.log(`     Priority: ${job.opts.priority || 'default'}`);
          console.log(`     Created: ${new Date(job.timestamp).toLocaleString()}`);
          console.log('');
        });
      }
    }

    if (!filter || filter === 'all' || filter === 'prioritized') {
      if (prioritized.length > 0) {
        console.log(`\n⚡ Prioritized Jobs (${prioritized.length}):`);
        prioritized.forEach((job, idx) => {
          const data = job.data as any;
          console.log(`  ${idx + 1}. Job ID: ${job.id}`);
          console.log(`     Name: ${job.name}`);
          console.log(`     Project: ${data.projectId}`);
          console.log(`     Granularity: ${data.granularity}`);
          console.log(`     Time Range: ${data.startTime} → ${data.endTime}`);
          console.log(`     Priority: ${job.opts.priority || 'default'}`);
          console.log(`     Created: ${new Date(job.timestamp).toLocaleString()}`);
          console.log('');
        });
      }
    }

    if (!filter || filter === 'all' || filter === 'active') {
      if (active.length > 0) {
        console.log(`\n🔄 Active Jobs (${active.length}):`);
        active.forEach((job, idx) => {
          const data = job.data as any;
          console.log(`  ${idx + 1}. Job ID: ${job.id}`);
          console.log(`     Name: ${job.name}`);
          console.log(`     Project: ${data.projectId}`);
          console.log(`     Progress: ${job.progress || 0}%`);
          console.log('');
        });
      }
    }

    if (!filter || filter === 'all' || filter === 'completed') {
      if (completed.length > 0) {
        console.log(`\n✅ Completed Jobs (showing last ${Math.min(completed.length, 10)}):`);
        completed.slice(0, 10).forEach((job, idx) => {
          const data = job.returnvalue || job.data;
          console.log(`  ${idx + 1}. Job ID: ${job.id}`);
          console.log(`     Name: ${job.name}`);
          if (data?.projectId) {
            console.log(`     Project: ${data.projectId}`);
          }
          console.log(`     Completed: ${new Date(job.finishedOn || job.processedOn).toLocaleString()}`);
          console.log('');
        });
      }
    }

    if (!filter || filter === 'all' || filter === 'failed') {
      if (failed.length > 0) {
        console.log(`\n❌ Failed Jobs (showing last ${Math.min(failed.length, 10)}):`);
        failed.slice(0, 10).forEach((job, idx) => {
          const data = job.data as any;
          console.log(`  ${idx + 1}. Job ID: ${job.id}`);
          console.log(`     Name: ${job.name}`);
          console.log(`     Project: ${data?.projectId || 'unknown'}`);
          console.log(`     Failed: ${new Date(job.failedReason ? job.timestamp : Date.now()).toLocaleString()}`);
          console.log(`     Reason: ${job.failedReason || 'Unknown'}`);
          console.log(`     Attempts: ${job.attemptsMade}/${job.opts.attempts || 3}`);
          console.log('');
        });
      }
    }

    // Explain why jobs exist
    if (stats.prioritized > 0 || stats.waiting > 0) {
      console.log('\n💡 Job Creation Logic:');
      console.log('  - Each project gets 2 jobs per enqueue:');
      console.log('    1. Hourly aggregation (priority 1)');
      console.log('    2. Daily aggregation (priority 2)');
      console.log(`  - You have ${stats.prioritized + stats.waiting} jobs waiting to be processed`);
      console.log('  - Jobs are prioritized: hourly jobs (priority 1) process before daily (priority 2)');
      console.log('  - Start the worker with: pnpm worker:aggregation');
    }

    console.log('\n✅ Queue details retrieved successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to get queue details:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const filter = process.argv[2]?.replace('--', '') || 'all';

viewQueueDetails(filter);

