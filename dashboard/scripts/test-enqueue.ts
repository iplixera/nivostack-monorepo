/**
 * Test Enqueue Function
 * 
 * Manually trigger enqueue to test the aggregation queue system.
 * 
 * Usage:
 *   pnpm test:enqueue
 */

// Load environment variables
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from root directory
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

import { enqueueHourlyAggregation, enqueueDailyAggregation } from '../src/lib/aggregation/enqueue';

async function main() {
  console.log('🧪 Testing aggregation enqueue...\n');

  try {
    // Test hourly aggregation
    console.log('📤 Testing hourly aggregation enqueue...');
    const hourlyResult = await enqueueHourlyAggregation();
    console.log(`✅ Hourly: Enqueued ${hourlyResult.enqueued} jobs\n`);

    // Test daily aggregation
    console.log('📤 Testing daily aggregation enqueue...');
    const dailyResult = await enqueueDailyAggregation();
    console.log(`✅ Daily: Enqueued ${dailyResult.enqueued} jobs\n`);

    console.log('✅ Enqueue test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Enqueue test failed:', error);
    process.exit(1);
  }
}

main();

