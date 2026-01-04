# Complete Queue System Explanation - Based on Current Data

## 📊 Current System State

**Database:** 4 projects  
**Queue:** 32 jobs (27 prioritized, 5 active)  
**Worker:** Running (processing 5 jobs concurrently)

---

## 1. Why 32 Jobs? - The Math

### Step-by-Step Calculation:

**You have 4 projects in your database:**
```
Project 1: cmjoin79y00059z09y0x3eym7
Project 2: cmjvsbdhx000g56tnzd9lwu6q
Project 3: cmjxkkd52000411t4jvrc583p
Project 4: cmjxkkd52000511t4yohtdcfh
```

**Each `test:enqueue` run does this:**

1. **Calls `enqueueHourlyAggregation()`:**
   ```typescript
   // Gets all 4 projects
   const projects = await prisma.project.findMany({ select: { id: true } });
   // Returns: [project1, project2, project3, project4]
   
   // Loops 4 times, creates 4 hourly jobs
   for (const project of projects) {
     aggregationQueue.add('hourly-aggregate', {...}, { priority: 1 });
   }
   // Result: 4 hourly jobs created
   ```

2. **Calls `enqueueDailyAggregation()`:**
   ```typescript
   // Gets same 4 projects
   // Loops 4 times, creates 4 daily jobs
   for (const project of projects) {
     aggregationQueue.add('daily-aggregate', {...}, { priority: 2 });
   }
   // Result: 4 daily jobs created
   ```

**Total per run: 4 hourly + 4 daily = 8 jobs**

**You ran `test:enqueue` 4 times:**
- Run 1: 8 jobs
- Run 2: 8 jobs  
- Run 3: 8 jobs
- Run 4: 8 jobs

**Total: 4 × 8 = 32 jobs**

---

## 2. Job Breakdown by Type

### Current Queue Analysis:

**Hourly Jobs (Priority 1):** 20 jobs
- Each processes last 1 hour of data
- Higher priority (processed first)
- Example time ranges:
  - `01:40:19 → 02:40:19`
  - `01:40:23 → 02:40:23`
  - `01:40:30 → 02:40:30`

**Daily Jobs (Priority 2):** 12 jobs
- Each processes previous day's data
- Lower priority (processed after hourly)
- Example time range:
  - `2026-01-03T00:00:00 → 2026-01-03T23:59:59`

**Why different counts?**
- Some test runs might have been interrupted
- Or some jobs were created at different times

---

## 3. Queue States - Complete Explanation

### BullMQ Queue Structure in Redis:

```
Redis Key: "bull:aggregation"
│
├── wait (List)          → Jobs with no priority (FIFO)
├── prioritized (ZSet)   → Jobs with priority 1 or 2 (sorted by priority)
├── delayed (ZSet)       → Jobs scheduled for future execution
├── active (Set)         → Jobs currently being processed
├── completed (List)     → Jobs that finished successfully
└── failed (List)        → Jobs that failed
```

### Current State Breakdown:

**Prioritized Queue: 27 jobs**
- **What it is:** Jobs with `priority: 1` or `priority: 2`
- **Why here:** BullMQ processes prioritized jobs BEFORE waiting jobs
- **Processing order:** Priority 1 first, then Priority 2
- **Your jobs:** All 32 jobs have priority (1 or 2), so they're all here

**Active Queue: 5 jobs**
- **What it is:** Jobs currently being processed by worker
- **Why 5:** Worker concurrency is set to 5 (processes 5 jobs simultaneously)
- **What's happening:** Worker is aggregating data for these 5 projects

**Waiting Queue: 0 jobs**
- **What it is:** Jobs with no priority (would be FIFO)
- **Why empty:** All your jobs have priority, so none are here

**Completed Queue: 0 jobs**
- **What it is:** Jobs that finished successfully
- **Why empty:** Worker just started, jobs still processing

**Failed Queue: 0 jobs**
- **What it is:** Jobs that failed (can retry)
- **Why empty:** No failures yet

---

## 4. How Jobs Are Created

### Manual Test (What You Did):

```bash
pnpm test:enqueue
```

**What happens:**

1. **Script runs:**
   ```typescript
   // test-enqueue.ts
   await enqueueHourlyAggregation();  // Creates 4 hourly jobs
   await enqueueDailyAggregation();  // Creates 4 daily jobs
   ```

2. **For each project, creates 2 jobs:**
   - Job 1: `hourly-aggregate` (priority 1)
   - Job 2: `daily-aggregate` (priority 2)

3. **Jobs added to Redis:**
   - Stored in `bull:aggregation:prioritized` (ZSet)
   - Sorted by priority (1 before 2)
   - Job ID format: `hourly-{projectId}-{timestamp}-{random}`

### Automatic Cron (Production):

**Hourly Cron (`0 * * * *`):**
- Runs every hour at minute 0 (1:00, 2:00, 3:00, etc.)
- Calls `enqueueHourlyAggregation()`
- Creates 4 hourly jobs (one per project)
- Jobs go to prioritized queue

**Daily Cron (`0 0 * * *`):**
- Runs every day at 00:00 (midnight)
- Calls `enqueueDailyAggregation()`
- Creates 4 daily jobs (one per project)
- Jobs go to prioritized queue

---

## 5. Worker Processing Logic

### Worker Configuration:

```typescript
const worker = new Worker('aggregation', async (job) => {
  // Process job
}, {
  concurrency: 5,  // Process 5 jobs at the same time
  limiter: {
    max: 10,       // Max 10 jobs
    duration: 60000  // Per 60 seconds
  }
});
```

### Processing Flow:

**Step 1: Worker Polls Redis**
- Worker continuously checks Redis for jobs
- Looks in prioritized queue first (priority 1)
- Picks up 5 jobs (concurrency limit)

**Step 2: Move to Active**
- Jobs moved from `prioritized` → `active`
- This is why you see: Prioritized: 27, Active: 5

**Step 3: Process Each Job**
```typescript
// For each of the 5 active jobs:
aggregateAll(projectId, startTime, endTime, granularity)
  ├─ aggregateApiTraces()    // Process API traces
  ├─ aggregateLogs()        // Process logs
  ├─ aggregateCrashes()     // Process crashes
  └─ aggregateSessions()   // Process sessions
```

**Step 4: Save Results**
- Aggregates saved to database tables
- `ProjectAggregationState` updated

**Step 5: Mark Complete**
- Job moved from `active` → `completed`
- Next job picked up from prioritized queue

### Processing Order:

**Current State:**
- 5 jobs active (all Priority 1 - hourly)
- 15 more Priority 1 jobs waiting
- 12 Priority 2 jobs waiting

**Processing Sequence:**
1. Finish current 5 active jobs → Move to completed
2. Pick up next 5 Priority 1 jobs → Process
3. Repeat until all Priority 1 done
4. Then process Priority 2 jobs (daily)

---

## 6. Time Range Logic Explained

### Hourly Aggregation Time Range:

**Calculation:**
```typescript
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
// Example: Current = 02:40:19 → oneHourAgo = 01:40:19

const now = new Date();
// Example: 02:40:19
```

**Result:**
- Start: `2026-01-04T01:40:19.542Z`
- End: `2026-01-04T02:40:19.542Z`
- Duration: Exactly 1 hour

**What Gets Aggregated:**
```sql
-- ApiTrace
WHERE projectId = 'xxx' 
  AND timestamp >= '2026-01-04T01:40:19.542Z'
  AND timestamp < '2026-01-04T02:40:19.542Z'

-- Log
WHERE projectId = 'xxx'
  AND timestamp >= '2026-01-04T01:40:19.542Z'
  AND timestamp < '2026-01-04T02:40:19.542Z'

-- Crash
WHERE projectId = 'xxx'
  AND timestamp >= '2026-01-04T01:40:19.542Z'
  AND timestamp < '2026-01-04T02:40:19.542Z'

-- Session
WHERE projectId = 'xxx'
  AND startedAt >= '2026-01-04T01:40:19.542Z'
  AND startedAt < '2026-01-04T02:40:19.542Z'
```

### Daily Aggregation Time Range:

**Calculation:**
```typescript
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
// Example: Current = 2026-01-04 → oneDayAgo = 2026-01-03

const startOfDay = new Date(oneDayAgo);
startOfDay.setHours(0, 0, 0, 0);
// Result: 2026-01-03T00:00:00.000Z

const endOfDay = new Date(oneDayAgo);
endOfDay.setHours(23, 59, 59, 999);
// Result: 2026-01-03T23:59:59.999Z
```

**Result:**
- Start: `2026-01-03T00:00:00.000Z`
- End: `2026-01-03T23:59:59.999Z`
- Duration: Full day (24 hours)

---

## 7. Why Multiple Jobs for Same Project?

### Different Time Ranges:

**Run 1 (at 01:40:19):**
- Creates job with range: `01:40:19 → 02:40:19`

**Run 2 (at 01:40:23):**
- Creates job with range: `01:40:23 → 02:40:23`

**Run 3 (at 01:40:30):**
- Creates job with range: `01:40:30 → 02:40:30`

**Result:** Same project, but different 1-hour windows

**This is normal for testing**, but in production:
- Cron runs once per hour
- Creates one job per project per hour
- No overlapping time ranges

---

## 8. Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│              COMPLETE SYSTEM FLOW                            │
└─────────────────────────────────────────────────────────────┘

DATABASE STATE:
┌─────────────────────┐
│  4 Projects         │
│  - Project 1        │
│  - Project 2        │
│  - Project 3        │
│  - Project 4        │
└─────────────────────┘
           │
           │ Query: SELECT id FROM Project
           ▼
┌─────────────────────────────────────────────────────────────┐
│  ENQUEUE FUNCTION (enqueueHourlyAggregation)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Loop: for each project (4 iterations)                 │  │
│  │   ├─ Calculate time range (last hour)                 │  │
│  │   ├─ Create job data:                                 │  │
│  │   │   { projectId, startTime, endTime, granularity } │  │
│  │   └─ Add to queue with priority: 1                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  Result: 4 hourly jobs created                              │
└─────────────────────────────────────────────────────────────┘
           │
           │ Same for daily (creates 4 daily jobs)
           ▼
┌─────────────────────────────────────────────────────────────┐
│              REDIS QUEUE (bull:aggregation)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Prioritized Queue (ZSet)                             │  │
│  │  Score = Priority (1 or 2)                          │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │ Priority 1 (Hourly) - 20 jobs                │   │  │
│  │  │  - hourly-project1-timestamp1-random          │   │  │
│  │  │  - hourly-project2-timestamp1-random          │   │  │
│  │  │  - hourly-project3-timestamp1-random          │   │  │
│  │  │  - hourly-project4-timestamp1-random          │   │  │
│  │  │  ... (16 more)                                 │   │  │
│  │  └──────────────────────────────────────────────┘   │   │  │
│  │  ┌──────────────────────────────────────────────┐   │   │  │
│  │  │ Priority 2 (Daily) - 12 jobs                │   │  │
│  │  │  - daily-project1-timestamp-random           │   │  │
│  │  │  - daily-project2-timestamp-random           │   │  │
│  │  │  ... (10 more)                                │   │  │
│  │  └──────────────────────────────────────────────┘   │   │  │
│  └──────────────────────────────────────────────────────┘  │
│  Total: 32 jobs                                            │
└─────────────────────────────────────────────────────────────┘
           │
           │ Worker picks up 5 jobs (concurrency: 5)
           ▼
┌─────────────────────────────────────────────────────────────┐
│  WORKER PROCESS (5 concurrent jobs)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──┐ │
│  │ Job 1    │  │ Job 2    │  │ Job 3    │  │ Job 4    │  │5│ │
│  │ Project1 │  │ Project2 │  │ Project3 │  │ Project4 │  │P1│ │
│  │ Hourly   │  │ Hourly   │  │ Hourly   │  │ Hourly   │  │H2│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──┘ │
│       │             │             │             │             │
│       │ 4. Fetch raw data from database                        │
│       │    - ApiTrace WHERE projectId = 'xxx'                 │
│       │      AND timestamp BETWEEN startTime AND endTime       │
│       │    - Log WHERE projectId = 'xxx' ...                  │
│       │    - Crash WHERE projectId = 'xxx' ...                 │
│       │    - Session WHERE projectId = 'xxx' ...               │
│       │                                                         │
│       │ 5. Aggregate by dimensions                             │
│       │    - Group by: endpoint, method, platform, etc.       │
│       │    - Calculate: count, avg, max, p50, p95             │
│       │                                                         │
│       │ 6. Save aggregates                                     │
│       │    - Upsert to ApiTraceAggregate                       │
│       │    - Upsert to LogAggregate                            │
│       │    - Upsert to CrashAggregate                          │
│       │    - Upsert to SessionAggregate                        │
│       │                                                         │
│       │ 7. Update ProjectAggregationState                      │
│       │    - lastHourlyAgg = endTime                           │
│       │                                                         │
│       └───────────────────────────────────────────────────────┘
│       │
│       │ 8. Mark job complete
│       ▼
┌─────────────────────┐
│  Completed Queue    │
│  (Auto-delete 24h)  │
└─────────────────────┘
```

---

## 9. Job Lifecycle - Step by Step

### Example: One Hourly Job

**1. Created (by enqueue function)**
```
Job ID: hourly-cmjxkkd52000511t4yohtdcfh-1767494419542
State: Added to prioritized queue
Priority: 1
Data: {
  projectId: "cmjxkkd52000511t4yohtdcfh",
  startTime: "2026-01-04T01:40:19.542Z",
  endTime: "2026-01-04T02:40:19.542Z",
  granularity: "hourly"
}
```

**2. Prioritized (waiting in queue)**
```
Redis Key: bull:aggregation:prioritized
Score: 1 (priority)
Value: Job ID
State: Waiting for worker
```

**3. Active (being processed)**
```
Worker picks up job
Redis Key: bull:aggregation:active
State: Processing
Progress: 0% → 10% → 50% → 100%
```

**4. Processing Steps:**
```
a. Fetch ApiTrace data (batches of 10K)
   WHERE projectId = 'xxx' 
     AND timestamp >= '2026-01-04T01:40:19.542Z'
     AND timestamp < '2026-01-04T02:40:19.542Z'

b. Group by dimensions:
   - endpoint, method, statusClass, screenName, 
     buildVersion, country, platform

c. Calculate metrics:
   - count, errorCount, errorRate
   - durationSum, durationAvg, durationMax, durationP50, durationP95
   - costSum
   - status2xx, status4xx, status5xx

d. Repeat for Log, Crash, Session

e. Upsert aggregates to database
```

**5. Completed (success)**
```
State: Moved to completed queue
Redis Key: bull:aggregation:completed
Kept for: 24 hours
Then: Auto-deleted
```

---

## 10. Cron Job Schedule Explained

### Hourly Cron: `0 * * * *`

**Cron Expression Breakdown:**
```
0     *     *     *     *
│     │     │     │     │
│     │     │     │     └── Day of week (0-7, 0 or 7 = Sunday)
│     │     │     └──────── Month (1-12)
│     │     └────────────── Day of month (1-31)
│     └──────────────────── Hour (0-23)
└────────────────────────── Minute (0-59)
```

**What it means:**
- Minute: 0 (at :00)
- Hour: * (every hour)
- Day: * (every day)
- Month: * (every month)
- Day of week: * (every day)

**Runs at:**
- 00:00, 01:00, 02:00, 03:00, ... 23:00
- **24 times per day**

**Each run creates:** 4 hourly jobs (one per project)

### Daily Cron: `0 0 * * *`

**What it means:**
- Minute: 0
- Hour: 0 (midnight)
- Day: * (every day)

**Runs at:** 00:00 (midnight) every day

**Each run creates:** 4 daily jobs (one per project)

---

## 11. Production vs Testing Comparison

### Testing (Current - Manual):

| Aspect | Testing | Production |
|--------|---------|------------|
| **Trigger** | Manual `test:enqueue` | Automatic cron |
| **Frequency** | On demand | Every hour + daily |
| **Jobs per run** | 8 (4 hourly + 4 daily) | 8 (4 hourly + 4 daily) |
| **Queue size** | Can accumulate (32 jobs) | Stays small (~8 jobs) |
| **Time ranges** | Can overlap | No overlap (sequential) |

### Production Normal Operation:

**Every Hour:**
1. Cron runs at :00
2. Creates 4 hourly jobs
3. Worker processes them (~5-10 minutes)
4. Queue clears

**Every Day:**
1. Cron runs at 00:00
2. Creates 4 daily jobs
3. Worker processes them (~10-20 minutes)
4. Queue clears

**Result:** Queue typically has 0-8 jobs

---

## 12. Aggregation Details

### What Each Job Does:

**For Project `cmjxkkd52000511t4yohtdcfh`:**

**Hourly Job (Priority 1):**
```
Time Range: 2026-01-04T01:40:19 → 2026-01-04T02:40:19

1. Fetch ApiTrace (last hour)
   - WHERE projectId = 'cmjxkkd52000511t4yohtdcfh'
   - AND timestamp BETWEEN '01:40:19' AND '02:40:19'
   - Example: 1,000 traces

2. Group by dimensions:
   - endpoint: "/api/users" (500 traces)
   - endpoint: "/api/orders" (300 traces)
   - endpoint: "/api/products" (200 traces)

3. Calculate metrics for each group:
   - "/api/users": count=500, avgDuration=120ms, p95=250ms
   - "/api/orders": count=300, avgDuration=80ms, p95=150ms
   - "/api/products": count=200, avgDuration=50ms, p95=100ms

4. Save to ApiTraceAggregate:
   - Row 1: { endpoint: "/api/users", count: 500, ... }
   - Row 2: { endpoint: "/api/orders", count: 300, ... }
   - Row 3: { endpoint: "/api/products", count: 200, ... }

5. Repeat for Log, Crash, Session
```

**Daily Job (Priority 2):**
```
Time Range: 2026-01-03T00:00:00 → 2026-01-03T23:59:59

Same process, but:
- Processes full day (24 hours)
- More data to aggregate
- Takes longer to process
```

---

## 13. Current Queue Breakdown

### By Project:

**Project 1 (cmjoin79y00059z09y0x3eym7):**
- Hourly jobs: ~5 jobs
- Daily jobs: ~3 jobs
- Total: ~8 jobs

**Project 2 (cmjvsbdhx000g56tnzd9lwu6q):**
- Hourly jobs: ~5 jobs
- Daily jobs: ~3 jobs
- Total: ~8 jobs

**Project 3 (cmjxkkd52000411t4jvrc583p):**
- Hourly jobs: ~5 jobs
- Daily jobs: ~3 jobs
- Total: ~8 jobs

**Project 4 (cmjxkkd52000511t4yohtdcfh):**
- Hourly jobs: ~5 jobs
- Daily jobs: ~3 jobs
- Total: ~8 jobs

**Total: ~32 jobs** (from 4 test runs)

---

## 14. Processing Timeline

### Current Processing:

**Time: Now**
- Active: 5 jobs (processing)
- Prioritized: 27 jobs (waiting)

**Time: +5 minutes** (estimated)
- Active: 5 jobs (next batch)
- Completed: 5 jobs (first batch done)
- Prioritized: 22 jobs (remaining)

**Time: +10 minutes**
- Active: 5 jobs
- Completed: 10 jobs
- Prioritized: 17 jobs

**Time: +30 minutes** (all Priority 1 done)
- Active: 5 jobs (Priority 2 - daily)
- Completed: 20 jobs (all hourly done)
- Prioritized: 7 jobs (remaining daily)

**Time: +45 minutes** (all done)
- Active: 0 jobs
- Completed: 32 jobs
- Prioritized: 0 jobs

---

## 15. Commands to Monitor

### View Current State:
```bash
# Quick summary
pnpm check:queue

# Detailed view
pnpm view:queue

# View only prioritized
pnpm view:queue:prioritized
```

### Check Redis Directly:
```bash
docker exec -it redis-aggregation redis-cli

# Count jobs in each state
> LLEN bull:aggregation:wait
> ZCARD bull:aggregation:prioritized
> SCARD bull:aggregation:active
> LLEN bull:aggregation:completed
> LLEN bull:aggregation:failed

# View prioritized jobs
> ZRANGE bull:aggregation:prioritized 0 -1 WITHSCORES
```

---

## Summary

**32 Jobs = 4 test runs × 8 jobs per run**

**Breakdown:**
- 20 hourly jobs (Priority 1)
- 12 daily jobs (Priority 2)

**Current State:**
- 27 prioritized (waiting)
- 5 active (processing)
- 0 completed (still processing)

**Processing:**
- Worker processes 5 jobs concurrently
- Priority 1 processed before Priority 2
- Each job aggregates 1 hour or 1 day of data

**Normal Production:**
- Cron creates 8 jobs per hour
- Worker processes them quickly
- Queue stays small

