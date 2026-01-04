# Queue System Logic - Complete Explanation

## 📊 Current System State

Based on your current data and configuration, here's how everything works:

---

## 1. Database State

### Projects in Database
You have **4 projects** in your database:
- `cmjoin79y00059z09y0x3eym7`
- `cmjvsbdhx000g56tnzd9lwu6q`
- `cmjxkkd52000411t4jvrc583p`
- `cmjxkkd52000511t4yohtdcfh`

**How to verify:**
```sql
SELECT COUNT(*) FROM "Project";
-- Returns: 4
```

---

## 2. Job Creation Logic

### When `enqueueHourlyAggregation()` Runs:

**Step 1: Get All Projects**
```typescript
const projects = await prisma.project.findMany({
  select: { id: true }
});
// Returns: 4 projects
```

**Step 2: Calculate Time Range**
```typescript
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
const now = new Date();
// Example: 2026-01-04T01:40:19.542Z → 2026-01-04T02:40:19.542Z
```

**Step 3: Create Jobs (Loop Through Projects)**
```typescript
for (const project of projects) {  // Loop 4 times
  const job = await aggregationQueue.add('hourly-aggregate', {
    projectId: project.id,
    startTime: oneHourAgo.toISOString(),
    endTime: now.toISOString(),
    granularity: 'hourly'
  }, {
    jobId: `hourly-${project.id}-${Date.now()}-${random}`,
    priority: 1  // Higher priority
  });
}
```

**Result:** 4 hourly jobs created (one per project)

### When `enqueueDailyAggregation()` Runs:

**Same logic, but:**
- Time range: Previous day (00:00 to 23:59:59)
- Job name: `daily-aggregate`
- Priority: 2 (lower than hourly)

**Result:** 4 daily jobs created (one per project)

### Total Jobs Per Enqueue Run:
- **4 hourly jobs** (priority 1)
- **4 daily jobs** (priority 2)
- **Total: 8 jobs per run**

---

## 3. Why You Have 32 Jobs

### Calculation:

**You ran `test:enqueue` 4 times:**
- Run 1: Created 8 jobs (4 hourly + 4 daily)
- Run 2: Created 8 jobs (4 hourly + 4 daily)
- Run 3: Created 8 jobs (4 hourly + 4 daily)
- Run 4: Created 8 jobs (4 hourly + 4 daily)

**Total: 4 runs × 8 jobs = 32 jobs**

### Breakdown:
- **20 hourly jobs** (priority 1)
- **12 daily jobs** (priority 2)
- **Total: 32 jobs**

**Why different counts?**
- Some test runs might have been interrupted
- Or some jobs were created at different times with different jobIds

---

## 4. Queue States Explained

### BullMQ Queue Structure:

```
Redis Queue: "bull:aggregation"
├── wait          → Jobs waiting (FIFO, no priority)
├── prioritized   → Jobs with priority 1 or 2
├── delayed       → Jobs scheduled for future
├── active        → Jobs currently being processed
├── completed     → Jobs that finished successfully
└── failed        → Jobs that failed
```

### Current State:

**Prioritized Queue (32 jobs):**
- Contains jobs with `priority: 1` or `priority: 2`
- BullMQ processes prioritized jobs BEFORE waiting jobs
- Priority 1 (hourly) processed before Priority 2 (daily)

**Active Queue (5 jobs):**
- Jobs currently being processed by worker
- Worker concurrency: 5 (processes 5 jobs simultaneously)

**Waiting Queue (0 jobs):**
- Empty because all jobs have priority
- Would contain jobs with no priority (FIFO order)

---

## 5. Worker Processing Logic

### Worker Configuration:

```typescript
const worker = new Worker('aggregation', async (job) => {
  // Process job
}, {
  concurrency: 5,  // Process 5 jobs at once
  limiter: {
    max: 10,       // Max 10 jobs per duration
    duration: 60000  // Per 60 seconds
  }
});
```

### Processing Flow:

**Step 1: Worker Picks Up Jobs**
- Worker polls Redis for jobs
- Gets jobs from prioritized queue (priority 1 first, then 2)
- Moves jobs to active queue

**Step 2: Process Job**
- Calls `aggregateAll(projectId, startTime, endTime, granularity)`
- Aggregates: ApiTrace, Log, Crash, Session
- Saves aggregates to database
- Updates `ProjectAggregationState`

**Step 3: Mark Complete**
- Moves job from active → completed
- Job stays in completed for 24 hours, then auto-deleted

---

## 6. Cron Job Logic

### Cron Scheduler (`scheduler.ts`):

**Hourly Cron:**
```typescript
cron.schedule('0 * * * *', async () => {
  // Runs every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
  await enqueueHourlyAggregation();
});
```

**Schedule:** `0 * * * *`
- Minute: 0 (at :00)
- Hour: * (every hour)
- Day: * (every day)
- Month: * (every month)
- Day of week: * (every day)

**Daily Cron:**
```typescript
cron.schedule('0 0 * * *', async () => {
  // Runs every day at 00:00 (midnight)
  await enqueueDailyAggregation();
});
```

**Schedule:** `0 0 * * *`
- Minute: 0
- Hour: 0 (midnight)
- Day: * (every day)

### What Happens When Cron Runs:

**Hourly (every hour at :00):**
1. Cron triggers `enqueueHourlyAggregation()`
2. Gets 4 projects
3. Creates 4 hourly jobs (priority 1)
4. Jobs added to prioritized queue
5. Worker picks them up and processes

**Daily (every day at 00:00):**
1. Cron triggers `enqueueDailyAggregation()`
2. Gets 4 projects
3. Creates 4 daily jobs (priority 2)
4. Jobs added to prioritized queue
5. Worker picks them up and processes

---

## 7. Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE SYSTEM FLOW                     │
└─────────────────────────────────────────────────────────────┘

TIME: Every Hour at :00 (e.g., 1:00 PM)
┌─────────────────────┐
│  Cron Scheduler     │ ← Runs automatically
│  (node-cron)        │
└──────────┬──────────┘
           │
           │ 1. Trigger enqueueHourlyAggregation()
           ▼
┌─────────────────────┐
│  Enqueue Function   │
│  - Get 4 projects   │
│  - Create 4 jobs     │
└──────────┬──────────┘
           │
           │ 2. Add jobs to Redis queue
           ▼
┌─────────────────────────────────────────────────────────────┐
│              Redis Queue (bull:aggregation)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Prioritized Queue (Priority 1)                       │  │
│  │  - hourly-project1-...                               │  │
│  │  - hourly-project2-...                               │  │
│  │  - hourly-project3-...                               │  │
│  │  - hourly-project4-...                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           │
           │ 3. Worker picks up jobs (5 at a time)
           ▼
┌─────────────────────┐
│  Worker Process     │ ← Processes 5 jobs in parallel
│  (5 concurrent)    │
└──────────┬──────────┘
           │
           │ 4. For each job:
           │    - Fetch raw data from database
           │    - Aggregate by dimensions
           │    - Calculate metrics
           │    - Save to aggregate tables
           ▼
┌─────────────────────┐
│  Database           │
│  - ApiTraceAggregate│
│  - LogAggregate     │
│  - CrashAggregate   │
│  - SessionAggregate │
└─────────────────────┘
```

---

## 8. Job Lifecycle

### Job States:

```
CREATED → PRIORITIZED → ACTIVE → COMPLETED → DELETED (24h)
                │
                └──→ FAILED → RETRY → COMPLETED or DELETED (7d)
```

**Example Job Journey:**

1. **Created** (by enqueue function)
   - Job ID: `hourly-cmjxkkd52000511t4yohtdcfh-1767494419542`
   - State: Added to prioritized queue
   - Priority: 1

2. **Prioritized** (waiting in queue)
   - State: In Redis prioritized list
   - Waiting for worker to pick up

3. **Active** (being processed)
   - Worker picks up job
   - State: Moved to active queue
   - Progress: 0% → 100%

4. **Completed** (success)
   - Aggregation finished
   - State: Moved to completed queue
   - Kept for 24 hours

5. **Deleted** (auto-cleanup)
   - After 24 hours
   - Automatically removed from Redis

---

## 9. Current Queue Breakdown

### Your 32 Jobs Breakdown:

**By Type:**
- Hourly jobs: 20
- Daily jobs: 12

**By Project:**
- Each project has multiple jobs (from multiple test runs)
- Same project, different time ranges

**By Priority:**
- Priority 1 (hourly): 20 jobs
- Priority 2 (daily): 12 jobs

**By State:**
- Prioritized: 27 jobs (waiting)
- Active: 5 jobs (processing)
- Completed: 0 jobs (none finished yet)

---

## 10. Processing Order

### BullMQ Processing Rules:

1. **Priority Order:**
   - Priority 1 jobs processed first
   - Priority 2 jobs processed after Priority 1

2. **Within Same Priority:**
   - FIFO (First In, First Out)
   - Oldest jobs processed first

3. **Concurrency:**
   - Worker processes 5 jobs simultaneously
   - When one finishes, picks up next from queue

### Your Current Processing:

**Active Jobs (5):**
- All Priority 1 (hourly)
- Processing in parallel
- When these finish, next 5 will start

**Remaining Jobs (27):**
- 15 more Priority 1 (hourly) - will process next
- 12 Priority 2 (daily) - will process after all Priority 1

---

## 11. Time Range Logic

### Hourly Aggregation:

**Time Range Calculation:**
```typescript
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
const now = new Date();
```

**Example:**
- Current time: `2026-01-04T02:40:19.542Z`
- One hour ago: `2026-01-04T01:40:19.542Z`
- Range: `01:40:19 → 02:40:19` (1 hour window)

**What Gets Aggregated:**
- All ApiTrace records where `timestamp >= oneHourAgo AND timestamp < now`
- All Log records where `timestamp >= oneHourAgo AND timestamp < now`
- All Crash records where `timestamp >= oneHourAgo AND timestamp < now`
- All Session records where `startedAt >= oneHourAgo AND startedAt < now`

### Daily Aggregation:

**Time Range Calculation:**
```typescript
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
const startOfDay = new Date(oneDayAgo);
startOfDay.setHours(0, 0, 0, 0);  // 00:00:00
const endOfDay = new Date(oneDayAgo);
endOfDay.setHours(23, 59, 59, 999);  // 23:59:59.999
```

**Example:**
- Previous day: `2026-01-03`
- Range: `2026-01-03T00:00:00.000Z → 2026-01-03T23:59:59.999Z`

---

## 12. Aggregation Logic

### What Happens During Aggregation:

**For Each Data Type (ApiTrace, Log, Crash, Session):**

1. **Fetch Raw Data** (in batches of 10K)
   ```typescript
   const traces = await prisma.apiTrace.findMany({
     where: {
       projectId: 'xxx',
       timestamp: { gte: startTime, lt: endTime }
     },
     take: 10000,
     skip: offset
   });
   ```

2. **Group by Dimensions**
   - ApiTrace: endpoint, method, statusClass, screenName, buildVersion, country, platform
   - Log: level, screenName, buildVersion, platform
   - Crash: buildVersion, platform, country
   - Session: entryScreen, exitScreen, buildVersion, platform, country

3. **Calculate Metrics**
   - Count, averages, max, percentiles (p50, p95)
   - Error rates, sums

4. **Save Aggregates**
   ```typescript
   await prisma.apiTraceAggregate.upsert({
     where: { unique_constraint },
     update: { metrics },
     create: { metrics }
   });
   ```

---

## 13. Why Multiple Jobs for Same Project?

### Different Time Ranges:

Each test run creates jobs with **different time ranges**:

**Run 1 (at 01:40:19):**
- Hourly: `01:40:19 → 02:40:19`

**Run 2 (at 01:40:23):**
- Hourly: `01:40:23 → 02:40:23`

**Run 3 (at 01:40:30):**
- Hourly: `01:40:30 → 02:40:30`

**Result:** Same project, but different 1-hour windows

**This is normal for testing**, but in production:
- Cron runs once per hour
- Creates one job per project per hour
- No duplicates

---

## 14. Production vs Testing

### Testing (Current State):
- Manual `test:enqueue` runs
- Creates jobs on demand
- Can create duplicates (different time ranges)
- **32 jobs from 4 test runs**

### Production (Normal Operation):
- Cron runs automatically every hour
- Creates 8 jobs per hour (4 projects × 2 types)
- Worker processes them
- Queue stays relatively empty
- **~8 jobs in queue at any time**

---

## 15. Monitoring Commands

### Check Queue Status:
```bash
pnpm check:queue
# Shows: Waiting, Prioritized, Active, Completed, Failed counts
```

### View Detailed Jobs:
```bash
pnpm view:queue
# Shows: All jobs with details (ID, project, time range, priority)
```

### View Only Prioritized:
```bash
pnpm view:queue:prioritized
# Shows: Only prioritized jobs
```

### Check Redis Directly:
```bash
docker exec redis-aggregation redis-cli
> LLEN bull:aggregation:prioritized
> LLEN bull:aggregation:active
> LLEN bull:aggregation:completed
```

---

## Summary

**32 Jobs = 4 test runs × 8 jobs per run**

**Queue States:**
- **Prioritized (27)**: Waiting to be processed
- **Active (5)**: Currently being processed
- **Completed (0)**: Finished (will show after processing)

**Processing:**
- Worker processes 5 jobs at a time
- Priority 1 (hourly) processed before Priority 2 (daily)
- Each job aggregates 1 hour or 1 day of data for 1 project

**Normal Operation:**
- Cron creates 8 jobs per hour
- Worker processes them
- Queue stays small (~8 jobs)

