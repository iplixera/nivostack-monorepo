/**
 * Aggregation Logic
 * 
 * Functions to aggregate raw data into aggregate tables.
 * Handles batch processing, incremental updates, and metric calculations.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AggregationJobData {
  projectId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  granularity: 'hourly' | 'daily';
}

/**
 * Extract endpoint pattern from URL (remove IDs, query params)
 */
function extractEndpoint(url: string): string {
  try {
    const urlObj = new URL(url, 'http://dummy.com');
    let path = urlObj.pathname;
    
    // Replace UUIDs and IDs with :id
    path = path.replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id');
    path = path.replace(/\/\d+/g, '/:id');
    
    return path;
  } catch {
    // If URL parsing fails, return original
    return url.split('?')[0];
  }
}

/**
 * Derive status class from status code
 */
function getStatusClass(statusCode: number | null | undefined): string | null {
  if (!statusCode) return null;
  if (statusCode >= 200 && statusCode < 300) return '2xx';
  if (statusCode >= 400 && statusCode < 500) return '4xx';
  if (statusCode >= 500) return '5xx';
  return null;
}

/**
 * Calculate percentiles from sorted array
 */
function calculatePercentile(values: number[], percentile: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Truncate datetime to period start (hour or day)
 */
function truncateToPeriod(date: Date, granularity: 'hourly' | 'daily'): Date {
  const truncated = new Date(date);
  truncated.setSeconds(0, 0);
  truncated.setMinutes(0);
  
  if (granularity === 'daily') {
    truncated.setHours(0);
  }
  
  return truncated;
}

/**
 * Aggregate API Traces
 */
export async function aggregateApiTraces(
  projectId: string,
  startTime: Date,
  endTime: Date,
  granularity: 'hourly' | 'daily'
): Promise<void> {
  console.log(`[Aggregate] Aggregating API traces for project ${projectId} (${granularity})`);

  const batchSize = 10000;
  let offset = 0;
  let totalProcessed = 0;

  // Track aggregates by dimension key
  const aggregates = new Map<string, {
    projectId: string;
    period: Date;
    granularity: string;
    endpoint: string | null;
    method: string | null;
    statusClass: string | null;
    screenName: string | null;
    buildVersion: string | null;
    country: string | null;
    platform: string | null;
    durations: number[];
    costs: number[];
    count: number;
    errorCount: number;
    status2xx: number;
    status4xx: number;
    status5xx: number;
  }>();

  while (true) {
    // Fetch batch of traces with device relation for platform/buildVersion
    const traces = await prisma.apiTrace.findMany({
      where: {
        projectId,
        timestamp: {
          gte: startTime,
          lt: endTime,
        },
      },
      include: {
        device: {
          select: {
            platform: true,
            appVersion: true,
          },
        },
      },
      take: batchSize,
      skip: offset,
      orderBy: { timestamp: 'asc' },
    });

    if (traces.length === 0) break;

    // Process each trace
    for (const trace of traces) {
      const period = truncateToPeriod(trace.timestamp, granularity);
      const endpoint = extractEndpoint(trace.url);
      const statusClass = getStatusClass(trace.statusCode);
      const platform = trace.device?.platform || null;
      const buildVersion = trace.device?.appVersion || null;

      // Create dimension key
      const dimensionKey = `${period.toISOString()}-${endpoint || 'null'}-${trace.method || 'null'}-${statusClass || 'null'}-${trace.screenName || 'null'}-${buildVersion || 'null'}-${trace.country || 'null'}-${platform || 'null'}`;

      if (!aggregates.has(dimensionKey)) {
        aggregates.set(dimensionKey, {
          projectId,
          period,
          granularity,
          endpoint,
          method: trace.method || null,
          statusClass,
          screenName: trace.screenName || null,
          buildVersion,
          country: trace.country || null,
          platform,
          durations: [],
          costs: [],
          count: 0,
          errorCount: 0,
          status2xx: 0,
          status4xx: 0,
          status5xx: 0,
        });
      }

      const agg = aggregates.get(dimensionKey)!;
      agg.count++;

      // Track duration
      if (trace.duration !== null && trace.duration !== undefined) {
        agg.durations.push(trace.duration);
      }

      // Track cost
      if (trace.cost !== null && trace.cost !== undefined) {
        agg.costs.push(trace.cost);
      }

      // Track errors
      if (trace.statusCode && trace.statusCode >= 400) {
        agg.errorCount++;
      }

      // Track status classes
      if (trace.statusCode) {
        if (trace.statusCode >= 200 && trace.statusCode < 300) agg.status2xx++;
        else if (trace.statusCode >= 400 && trace.statusCode < 500) agg.status4xx++;
        else if (trace.statusCode >= 500) agg.status5xx++;
      }
    }

    totalProcessed += traces.length;
    offset += batchSize;

    console.log(`[Aggregate] Processed ${totalProcessed} traces...`);
  }

  // Calculate metrics and upsert aggregates
  console.log(`[Aggregate] Calculating metrics for ${aggregates.size} dimension combinations...`);

  for (const agg of aggregates.values()) {
    const durationSum = agg.durations.reduce((sum, d) => sum + BigInt(d), BigInt(0));
    const durationAvg = agg.durations.length > 0 ? durationSum / BigInt(agg.durations.length) : BigInt(0);
    const durationMax = agg.durations.length > 0 ? Math.max(...agg.durations) : 0;
    const durationP50 = calculatePercentile(agg.durations, 50);
    const durationP95 = calculatePercentile(agg.durations, 95);

    const costSum = agg.costs.reduce((sum, c) => sum + c, 0);
    const errorRate = agg.count > 0 ? agg.errorCount / agg.count : 0;

    await prisma.apiTraceAggregate.upsert({
      where: {
        projectId_period_granularity_endpoint_method_statusClass_screenName_buildVersion_country_platform: {
          projectId: agg.projectId,
          period: agg.period,
          granularity: agg.granularity,
          endpoint: agg.endpoint,
          method: agg.method,
          statusClass: agg.statusClass,
          screenName: agg.screenName,
          buildVersion: agg.buildVersion,
          country: agg.country,
          platform: agg.platform,
        },
      },
      update: {
        count: agg.count,
        errorCount: agg.errorCount,
        errorRate,
        durationSum,
        durationAvg: Number(durationAvg),
        durationMax,
        durationP50,
        durationP95,
        costSum,
        status2xx: agg.status2xx,
        status4xx: agg.status4xx,
        status5xx: agg.status5xx,
        updatedAt: new Date(),
      },
      create: {
        projectId: agg.projectId,
        period: agg.period,
        granularity: agg.granularity,
        endpoint: agg.endpoint,
        method: agg.method,
        statusClass: agg.statusClass,
        screenName: agg.screenName,
        buildVersion: agg.buildVersion,
        country: agg.country,
        platform: agg.platform,
        count: agg.count,
        errorCount: agg.errorCount,
        errorRate,
        durationSum,
        durationAvg: Number(durationAvg),
        durationMax,
        durationP50,
        durationP95,
        costSum,
        status2xx: agg.status2xx,
        status4xx: agg.status4xx,
        status5xx: agg.status5xx,
      },
    });
  }

  console.log(`[Aggregate] ✅ Completed API trace aggregation: ${totalProcessed} traces → ${aggregates.size} aggregates`);
}

/**
 * Aggregate Logs
 */
export async function aggregateLogs(
  projectId: string,
  startTime: Date,
  endTime: Date,
  granularity: 'hourly' | 'daily'
): Promise<void> {
  console.log(`[Aggregate] Aggregating logs for project ${projectId} (${granularity})`);

  const batchSize = 10000;
  let offset = 0;
  let totalProcessed = 0;

  const aggregates = new Map<string, {
    projectId: string;
    period: Date;
    granularity: string;
    level: string | null;
    screenName: string | null;
    buildVersion: string | null;
    platform: string | null;
    count: number;
    errorCount: number;
  }>();

  while (true) {
    const logs = await prisma.log.findMany({
      where: {
        projectId,
        timestamp: {
          gte: startTime,
          lt: endTime,
        },
      },
      include: {
        device: {
          select: {
            platform: true,
            appVersion: true,
          },
        },
      },
      take: batchSize,
      skip: offset,
      orderBy: { timestamp: 'asc' },
    });

    if (logs.length === 0) break;

    for (const log of logs) {
      const period = truncateToPeriod(log.timestamp, granularity);
      const platform = log.device?.platform || null;
      const buildVersion = log.device?.appVersion || null;

      const dimensionKey = `${period.toISOString()}-${log.level || 'null'}-${log.screenName || 'null'}-${buildVersion || 'null'}-${platform || 'null'}`;

      if (!aggregates.has(dimensionKey)) {
        aggregates.set(dimensionKey, {
          projectId,
          period,
          granularity,
          level: log.level || null,
          screenName: log.screenName || null,
          buildVersion,
          platform,
          count: 0,
          errorCount: 0,
        });
      }

      const agg = aggregates.get(dimensionKey)!;
      agg.count++;
      if (log.level === 'error') {
        agg.errorCount++;
      }
    }

    totalProcessed += logs.length;
    offset += batchSize;
  }

  // Upsert aggregates
  for (const agg of aggregates.values()) {
    const errorRate = agg.count > 0 ? agg.errorCount / agg.count : 0;

    await prisma.logAggregate.upsert({
      where: {
        projectId_period_granularity_level_screenName_buildVersion_platform: {
          projectId: agg.projectId,
          period: agg.period,
          granularity: agg.granularity,
          level: agg.level,
          screenName: agg.screenName,
          buildVersion: agg.buildVersion,
          platform: agg.platform,
        },
      },
      update: {
        count: agg.count,
        errorCount: agg.errorCount,
        errorRate,
        updatedAt: new Date(),
      },
      create: {
        projectId: agg.projectId,
        period: agg.period,
        granularity: agg.granularity,
        level: agg.level,
        screenName: agg.screenName,
        buildVersion: agg.buildVersion,
        platform: agg.platform,
        count: agg.count,
        errorCount: agg.errorCount,
        errorRate,
      },
    });
  }

  console.log(`[Aggregate] ✅ Completed log aggregation: ${totalProcessed} logs → ${aggregates.size} aggregates`);
}

/**
 * Aggregate Crashes
 */
export async function aggregateCrashes(
  projectId: string,
  startTime: Date,
  endTime: Date,
  granularity: 'hourly' | 'daily'
): Promise<void> {
  console.log(`[Aggregate] Aggregating crashes for project ${projectId} (${granularity})`);

  const batchSize = 10000;
  let offset = 0;
  let totalProcessed = 0;

  const aggregates = new Map<string, {
    projectId: string;
    period: Date;
    granularity: string;
    buildVersion: string | null;
    platform: string | null;
    country: string | null;
    count: number;
    uniqueMessages: Set<string>;
  }>();

  while (true) {
    const crashes = await prisma.crash.findMany({
      where: {
        projectId,
        timestamp: {
          gte: startTime,
          lt: endTime,
        },
      },
      include: {
        device: {
          select: {
            platform: true,
            appVersion: true,
          },
        },
      },
      take: batchSize,
      skip: offset,
      orderBy: { timestamp: 'asc' },
    });

    if (crashes.length === 0) break;

    for (const crash of crashes) {
      const period = truncateToPeriod(crash.timestamp, granularity);
      const platform = crash.device?.platform || null;
      const buildVersion = crash.device?.appVersion || null;
      // Note: country not directly on Crash, would need to get from device metadata if needed
      const country = null; // TODO: Extract from device metadata if available

      const dimensionKey = `${period.toISOString()}-${buildVersion || 'null'}-${platform || 'null'}-${country || 'null'}`;

      if (!aggregates.has(dimensionKey)) {
        aggregates.set(dimensionKey, {
          projectId,
          period,
          granularity,
          buildVersion,
          platform,
          country,
          count: 0,
          uniqueMessages: new Set(),
        });
      }

      const agg = aggregates.get(dimensionKey)!;
      agg.count++;
      agg.uniqueMessages.add(crash.message);
    }

    totalProcessed += crashes.length;
    offset += batchSize;
  }

  // Upsert aggregates
  for (const agg of aggregates.values()) {
    await prisma.crashAggregate.upsert({
      where: {
        projectId_period_granularity_buildVersion_platform: {
          projectId: agg.projectId,
          period: agg.period,
          granularity: agg.granularity,
          buildVersion: agg.buildVersion,
          platform: agg.platform,
        },
      },
      update: {
        count: agg.count,
        uniqueMessages: agg.uniqueMessages.size,
        updatedAt: new Date(),
      },
      create: {
        projectId: agg.projectId,
        period: agg.period,
        granularity: agg.granularity,
        buildVersion: agg.buildVersion,
        platform: agg.platform,
        country: agg.country,
        count: agg.count,
        uniqueMessages: agg.uniqueMessages.size,
      },
    });
  }

  console.log(`[Aggregate] ✅ Completed crash aggregation: ${totalProcessed} crashes → ${aggregates.size} aggregates`);
}

/**
 * Aggregate Sessions
 */
export async function aggregateSessions(
  projectId: string,
  startTime: Date,
  endTime: Date,
  granularity: 'hourly' | 'daily'
): Promise<void> {
  console.log(`[Aggregate] Aggregating sessions for project ${projectId} (${granularity})`);

  const batchSize = 10000;
  let offset = 0;
  let totalProcessed = 0;

  const aggregates = new Map<string, {
    projectId: string;
    period: Date;
    granularity: string;
    entryScreen: string | null;
    exitScreen: string | null;
    buildVersion: string | null;
    platform: string | null;
    country: string | null;
    durations: number[];
    screenCounts: number[];
    eventCounts: number[];
    errorCounts: number[];
    count: number;
  }>();

  while (true) {
    const sessions = await prisma.session.findMany({
      where: {
        projectId,
        startedAt: {
          gte: startTime,
          lt: endTime,
        },
      },
      include: {
        device: {
          select: {
            platform: true,
            appVersion: true,
          },
        },
      },
      take: batchSize,
      skip: offset,
      orderBy: { startedAt: 'asc' },
    });

    if (sessions.length === 0) break;

    for (const session of sessions) {
      const period = truncateToPeriod(session.startedAt, granularity);
      const platform = session.device?.platform || null;
      const buildVersion = session.device?.appVersion || session.appVersion || null;
      // Note: country not directly on Session, would need to get from device metadata if needed
      const country = null; // TODO: Extract from device metadata if available

      const dimensionKey = `${period.toISOString()}-${session.entryScreen || 'null'}-${session.exitScreen || 'null'}-${buildVersion || 'null'}-${platform || 'null'}-${country || 'null'}`;

      if (!aggregates.has(dimensionKey)) {
        aggregates.set(dimensionKey, {
          projectId,
          period,
          granularity,
          entryScreen: session.entryScreen || null,
          exitScreen: session.exitScreen || null,
          buildVersion,
          platform,
          country,
          durations: [],
          screenCounts: [],
          eventCounts: [],
          errorCounts: [],
          count: 0,
        });
      }

      const agg = aggregates.get(dimensionKey)!;
      agg.count++;

      if (session.duration !== null && session.duration !== undefined) {
        agg.durations.push(session.duration);
      }
      if (session.screenCount !== null && session.screenCount !== undefined) {
        agg.screenCounts.push(session.screenCount);
      }
      if (session.eventCount !== null && session.eventCount !== undefined) {
        agg.eventCounts.push(session.eventCount);
      }
      if (session.errorCount !== null && session.errorCount !== undefined) {
        agg.errorCounts.push(session.errorCount);
      }
    }

    totalProcessed += sessions.length;
    offset += batchSize;
  }

  // Calculate metrics and upsert aggregates
  for (const agg of aggregates.values()) {
    const durationSum = agg.durations.reduce((sum, d) => sum + BigInt(d), BigInt(0));
    const durationAvg = agg.durations.length > 0 ? Number(durationSum) / agg.durations.length : 0;
    const durationMax = agg.durations.length > 0 ? Math.max(...agg.durations) : 0;
    const durationP50 = calculatePercentile(agg.durations, 50);
    const durationP95 = calculatePercentile(agg.durations, 95);

    const screenCountSum = agg.screenCounts.reduce((sum, c) => sum + BigInt(c), BigInt(0));
    const screenCountAvg = agg.screenCounts.length > 0 ? Number(screenCountSum) / agg.screenCounts.length : 0;
    const screenCountMax = agg.screenCounts.length > 0 ? Math.max(...agg.screenCounts) : 0;

    const eventCountSum = agg.eventCounts.reduce((sum, c) => sum + BigInt(c), BigInt(0));
    const eventCountAvg = agg.eventCounts.length > 0 ? Number(eventCountSum) / agg.eventCounts.length : 0;
    const eventCountMax = agg.eventCounts.length > 0 ? Math.max(...agg.eventCounts) : 0;

    const errorCountSum = agg.errorCounts.reduce((sum, c) => sum + BigInt(c), BigInt(0));
    const errorCountAvg = agg.errorCounts.length > 0 ? Number(errorCountSum) / agg.errorCounts.length : 0;
    const sessionsWithErrors = agg.errorCounts.filter(c => c > 0).length;
    const errorRate = agg.count > 0 ? sessionsWithErrors / agg.count : 0;

    await prisma.sessionAggregate.upsert({
      where: {
        projectId_period_granularity_entryScreen_exitScreen_buildVersion_platform_country: {
          projectId: agg.projectId,
          period: agg.period,
          granularity: agg.granularity,
          entryScreen: agg.entryScreen,
          exitScreen: agg.exitScreen,
          buildVersion: agg.buildVersion,
          platform: agg.platform,
          country: agg.country,
        },
      },
      update: {
        count: agg.count,
        durationSum,
        durationAvg,
        durationMax,
        durationP50,
        durationP95,
        screenCountSum,
        screenCountAvg,
        screenCountMax,
        eventCountSum,
        eventCountAvg,
        eventCountMax,
        errorCountSum,
        errorCountAvg,
        errorRate,
        updatedAt: new Date(),
      },
      create: {
        projectId: agg.projectId,
        period: agg.period,
        granularity: agg.granularity,
        entryScreen: agg.entryScreen,
        exitScreen: agg.exitScreen,
        buildVersion: agg.buildVersion,
        platform: agg.platform,
        country: agg.country,
        count: agg.count,
        durationSum,
        durationAvg,
        durationMax,
        durationP50,
        durationP95,
        screenCountSum,
        screenCountAvg,
        screenCountMax,
        eventCountSum,
        eventCountAvg,
        eventCountMax,
        errorCountSum,
        errorCountAvg,
        errorRate,
      },
    });
  }

  console.log(`[Aggregate] ✅ Completed session aggregation: ${totalProcessed} sessions → ${aggregates.size} aggregates`);
}

/**
 * Main aggregation function - aggregates all data types
 */
export async function aggregateAll(
  projectId: string,
  startTime: Date,
  endTime: Date,
  granularity: 'hourly' | 'daily'
): Promise<void> {
  console.log(`[Aggregate] Starting aggregation for project ${projectId} (${granularity})`);
  console.log(`[Aggregate] Time range: ${startTime.toISOString()} to ${endTime.toISOString()}`);

  try {
    // Aggregate all data types in parallel
    await Promise.all([
      aggregateApiTraces(projectId, startTime, endTime, granularity),
      aggregateLogs(projectId, startTime, endTime, granularity),
      aggregateCrashes(projectId, startTime, endTime, granularity),
      aggregateSessions(projectId, startTime, endTime, granularity),
    ]);

    // Update last aggregation time
    await prisma.projectAggregationState.upsert({
      where: { projectId },
      update: {
        [granularity === 'hourly' ? 'lastHourlyAgg' : 'lastDailyAgg']: endTime,
        updatedAt: new Date(),
      },
      create: {
        projectId,
        [granularity === 'hourly' ? 'lastHourlyAgg' : 'lastDailyAgg']: endTime,
      },
    });

    console.log(`[Aggregate] ✅ Completed all aggregations for project ${projectId}`);
  } catch (error) {
    console.error(`[Aggregate] ❌ Error aggregating project ${projectId}:`, error);
    throw error;
  }
}

