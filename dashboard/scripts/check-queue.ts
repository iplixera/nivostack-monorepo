/**
 * Check Queue Status
 * 
 * Display the current status of the aggregation queue.
 * 
 * Usage:
 *   pnpm check:queue
 */

// Load environment variables
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from root directory
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

import { aggregationQueue } from '../src/lib/aggregation/queue';

async function main() {
  console.log('📊 Checking aggregation queue status...\n');

  try {
    const waiting = await aggregationQueue.getWaiting();
    const delayed = await aggregationQueue.getDelayed();
    const prioritized = await aggregationQueue.getPrioritized();
    const active = await aggregationQueue.getActive();
    const completed = await aggregationQueue.getCompleted(0, 10); // Last 10 completed
    const failed = await aggregationQueue.getFailed(0, 10); // Last 10 failed

    console.log('Queue Status:');
    console.log(`  ⏳ Waiting: ${waiting.length}`);
    console.log(`  ⏰ Delayed: ${delayed.length}`);
    console.log(`  ⚡ Prioritized: ${prioritized.length}`);
    console.log(`  🔄 Active: ${active.length}`);
    console.log(`  ✅ Completed: ${completed.length} (showing last 10)`);
    console.log(`  ❌ Failed: ${failed.length} (showing last 10)`);

    if (waiting.length > 0) {
      console.log('\n⏳ Waiting Jobs:');
      waiting.forEach((job) => {
        console.log(`  - Job ${job.id}: ${job.name} (Project: ${job.data.projectId})`);
      });
    }

    if (delayed.length > 0) {
      console.log('\n⏰ Delayed Jobs:');
      delayed.forEach((job) => {
        console.log(`  - Job ${job.id}: ${job.name} (Project: ${job.data.projectId})`);
      });
    }

    if (prioritized.length > 0) {
      console.log('\n⚡ Prioritized Jobs:');
      prioritized.forEach((job) => {
        console.log(`  - Job ${job.id}: ${job.name} (Project: ${job.data.projectId})`);
      });
    }

    if (active.length > 0) {
      console.log('\n🔄 Active Jobs:');
      active.forEach((job) => {
        console.log(`  - Job ${job.id}: ${job.name} (Project: ${job.data.projectId})`);
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed Jobs:');
      failed.forEach((job) => {
        console.log(`  - Job ${job?.id}: ${job?.name} (Project: ${job?.data?.projectId})`);
        if (job?.failedReason) {
          console.log(`    Reason: ${job.failedReason}`);
        }
      });
    }

    console.log('\n✅ Queue check completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Queue check failed:', error);
    process.exit(1);
  }
}

main();

