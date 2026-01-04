/**
 * Aggregation Enqueue Functions
 * 
 * Functions to enqueue aggregation jobs for projects.
 * Called by cron scheduler or manually for testing.
 */

import { aggregationQueue } from './queue';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AggregationJobData {
  projectId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  granularity: 'hourly' | 'daily';
}

/**
 * Enqueue hourly aggregation jobs for all projects
 */
export async function enqueueHourlyAggregation(): Promise<{ enqueued: number }> {
  console.log('[Enqueue] Starting hourly aggregation enqueue...');

  try {
    // Get all projects
    const projects = await prisma.project.findMany({
      select: { id: true },
    });

    if (projects.length === 0) {
      console.log('[Enqueue] No projects found');
      return { enqueued: 0 };
    }

    // Calculate time range (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const now = new Date();

    // Enqueue job for each project
    const jobs = [];
    for (const project of projects) {
      const jobData: AggregationJobData = {
        projectId: project.id,
        startTime: oneHourAgo.toISOString(),
        endTime: now.toISOString(),
        granularity: 'hourly',
      };

      const job = await aggregationQueue.add('hourly-aggregate', jobData, {
        jobId: `hourly-${project.id}-${now.getTime()}`,
        priority: 1,
      });

      jobs.push(job);
      console.log(`[Enqueue] Enqueued hourly job for project ${project.id}: ${job.id}`);
    }

    console.log(`[Enqueue] Successfully enqueued ${jobs.length} hourly aggregation jobs`);
    return { enqueued: jobs.length };
  } catch (error) {
    console.error('[Enqueue] Error enqueueing hourly aggregation:', error);
    throw error;
  }
}

/**
 * Enqueue daily aggregation jobs for all projects
 */
export async function enqueueDailyAggregation(): Promise<{ enqueued: number }> {
  console.log('[Enqueue] Starting daily aggregation enqueue...');

  try {
    // Get all projects
    const projects = await prisma.project.findMany({
      select: { id: true },
    });

    if (projects.length === 0) {
      console.log('[Enqueue] No projects found');
      return { enqueued: 0 };
    }

    // Calculate time range (previous day)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const now = new Date();

    // Set to start of previous day and end of previous day
    const startOfDay = new Date(oneDayAgo);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(oneDayAgo);
    endOfDay.setHours(23, 59, 59, 999);

    // Enqueue job for each project
    const jobs = [];
    for (const project of projects) {
      const jobData: AggregationJobData = {
        projectId: project.id,
        startTime: startOfDay.toISOString(),
        endTime: endOfDay.toISOString(),
        granularity: 'daily',
      };

      const job = await aggregationQueue.add('daily-aggregate', jobData, {
        jobId: `daily-${project.id}-${endOfDay.getTime()}`,
        priority: 2, // Lower priority than hourly
      });

      jobs.push(job);
      console.log(`[Enqueue] Enqueued daily job for project ${project.id}: ${job.id}`);
    }

    console.log(`[Enqueue] Successfully enqueued ${jobs.length} daily aggregation jobs`);
    return { enqueued: jobs.length };
  } catch (error) {
    console.error('[Enqueue] Error enqueueing daily aggregation:', error);
    throw error;
  }
}

/**
 * Enqueue aggregation job for a specific project and time range
 * Useful for backfilling or manual triggers
 */
export async function enqueueProjectAggregation(
  projectId: string,
  startTime: Date,
  endTime: Date,
  granularity: 'hourly' | 'daily'
): Promise<string> {
  console.log(`[Enqueue] Enqueueing ${granularity} aggregation for project ${projectId}`);

  try {
    const jobData: AggregationJobData = {
      projectId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      granularity,
    };

    const job = await aggregationQueue.add(`${granularity}-aggregate`, jobData, {
      jobId: `${granularity}-${projectId}-${endTime.getTime()}`,
      priority: granularity === 'hourly' ? 1 : 2,
    });

    console.log(`[Enqueue] Enqueued job ${job.id} for project ${projectId}`);
    return job.id!;
  } catch (error) {
    console.error(`[Enqueue] Error enqueueing job for project ${projectId}:`, error);
    throw error;
  }
}

