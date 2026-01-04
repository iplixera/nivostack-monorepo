# Production Scenario: 1000 Projects

## Overview

This document explains what happens in production with **1000 projects** for all customers.

---

## 1. Hourly Aggregation (Every Hour)

### What Happens Every Hour at :00

**Time: 1:00 PM (13:00)**

**Step 1: Cron Triggers**
```
Cron Schedule: 0 * * * * (every hour at minute 0)
Time: 13:00:00
```

**Step 2: Enqueue Function Runs**
```typescript
enqueueHourlyAggregation()
  ├─ Query: SELECT id FROM Project
  ├─ Returns: 1000 projects
  ├─ Loop: for each project (1000 iterations)
  │   ├─ Calculate time range (last hour: 12:00 → 13:00)
  │   └─ Create job: hourly-aggregate (priority 1)
  └─ Result: 1000 hourly jobs created
```

**Step 3: Jobs Added to Queue**
```
Redis Queue: bull:aggregation
├─ Prioritized Queue: +1000 jobs (Priority 1)
└─ Total in queue: 1000 jobs
```

**Step 4: Worker Starts Processing**
```
Worker Process (concurrency: 5)
├─ Picks up 5 jobs → Moves to active
├─ Processes 5 jobs in parallel
├─ When one finishes → Picks up next
└─ Continues until all 1000 jobs done
```

### Processing Timeline

**Assumptions:**
- Each job takes **2 minutes** to process (average)
- Worker concurrency: **5 jobs** at once
- Processing time includes:
  - Database queries (fetch raw data)
  - Aggregation calculations
  - Database writes (save aggregates)

**Timeline:**

**Time: 13:00:00** (Cron triggers)
- Jobs created: 1000
- Queue: 1000 prioritized, 0 active

**Time: 13:00:05** (Worker starts)
- Queue: 995 prioritized, 5 active
- Processing: Jobs 1-5

**Time: 13:02:05** (First batch completes)
- Completed: 5 jobs
- Queue: 990 prioritized, 5 active
- Processing: Jobs 6-10

**Time: 13:04:05** (Second batch completes)
- Completed: 10 jobs
- Queue: 985 prioritized, 5 active
- Processing: Jobs 11-15

**...continues...**

**Time: 13:40:05** (All hourly jobs complete)
- Completed: 1000 jobs
- Queue: 0 prioritized, 0 active
- **Total time: ~40 minutes**

### Next Hour: 2:00 PM (14:00)

**Time: 14:00:00** (Cron triggers again)
- Creates another 1000 hourly jobs
- Queue: 1000 jobs
- Worker processes them
- Completes by ~14:40:00

**Important:** Previous hour's jobs are already done, so no overlap!

---

## 2. Daily Aggregation (Every Day)

### What Happens Every Day at Midnight

**Time: 00:00:00 (Midnight)**

**Step 1: Cron Triggers**
```
Cron Schedule: 0 0 * * * (every day at 00:00)
Time: 00:00:00
```

**Step 2: Enqueue Function Runs**
```typescript
enqueueDailyAggregation()
  ├─ Query: SELECT id FROM Project
  ├─ Returns: 1000 projects
  ├─ Loop: for each project (1000 iterations)
  │   ├─ Calculate time range (previous day: 00:00 → 23:59:59)
  │   └─ Create job: daily-aggregate (priority 2)
  └─ Result: 1000 daily jobs created
```

**Step 3: Jobs Added to Queue**
```
Redis Queue: bull:aggregation
├─ Prioritized Queue: +1000 jobs (Priority 2)
└─ Total in queue: 1000 jobs
```

**Step 4: Worker Processes**
```
Worker Process (concurrency: 5)
├─ Processes Priority 2 jobs (daily)
├─ Each job processes 24 hours of data
└─ Takes longer than hourly jobs
```

### Processing Timeline

**Assumptions:**
- Each daily job takes **10 minutes** to process (more data)
- Worker concurrency: **5 jobs** at once
- Daily jobs have more data to aggregate (24 hours vs 1 hour)

**Timeline:**

**Time: 00:00:00** (Cron triggers)
- Jobs created: 1000 daily jobs
- Queue: 1000 prioritized (Priority 2), 0 active

**Time: 00:00:05** (Worker starts)
- Queue: 995 prioritized, 5 active
- Processing: Daily jobs 1-5

**Time: 00:10:05** (First batch completes)
- Completed: 5 jobs
- Queue: 990 prioritized, 5 active
- Processing: Daily jobs 6-10

**Time: 00:20:05** (Second batch completes)
- Completed: 10 jobs
- Queue: 985 prioritized, 5 active
- Processing: Daily jobs 11-15

**...continues...**

**Time: 03:20:05** (All daily jobs complete)
- Completed: 1000 jobs
- Queue: 0 prioritized, 0 active
- **Total time: ~3 hours 20 minutes**

---

## 3. Combined Scenario: Hourly + Daily

### What Happens When Both Run

**Scenario: Daily cron runs at midnight, hourly runs at 1:00 AM**

**Time: 00:00:00** (Daily cron)
- Creates 1000 daily jobs (Priority 2)
- Queue: 1000 jobs (Priority 2)

**Time: 00:00:05** (Worker starts daily jobs)
- Processing: 5 daily jobs at a time
- Queue: 995 prioritized, 5 active

**Time: 01:00:00** (Hourly cron triggers)
- Creates 1000 hourly jobs (Priority 1)
- Queue: 1000 hourly (Priority 1) + 995 daily (Priority 2) = 1995 jobs

**Important:** BullMQ processes Priority 1 BEFORE Priority 2!

**Time: 01:00:05** (Worker switches to hourly)
- Worker pauses daily jobs (if any active)
- Picks up 5 hourly jobs (Priority 1)
- Processes hourly jobs first
- Queue: 995 hourly + 995 daily = 1990 jobs

**Time: 01:40:05** (All hourly jobs complete)
- Completed: 1000 hourly jobs
- Queue: 995 daily jobs remaining
- Worker resumes daily jobs

**Time: 03:20:05** (All daily jobs complete)
- Completed: 1000 daily jobs
- Queue: 0 jobs
- **Total time: ~3 hours 20 minutes**

---

## 4. Queue Size Over Time

### Normal Operation (No Issues)

**Hour 1 (13:00):**
```
13:00:00 → 1000 jobs created
13:00:05 → 995 prioritized, 5 active
13:02:05 → 990 prioritized, 5 active
...
13:40:05 → 0 jobs (all done)
```

**Queue Size Graph:**
```
Jobs
1000 |████████████████████████████████████████
     |                                    \
     |                                     \
     |                                      \
     |                                       \
   0 |________________________________________\___
     13:00  13:10  13:20  13:30  13:40  Time
```

**Peak Queue Size:** 1000 jobs (at 13:00:00)  
**Average Queue Size:** ~500 jobs  
**Minimum Queue Size:** 0 jobs (after processing)

### With Delays (Worker Slower)

**If each job takes 3 minutes instead of 2:**

**Hour 1 (13:00):**
```
13:00:00 → 1000 jobs created
13:00:05 → 995 prioritized, 5 active
13:03:05 → 990 prioritized, 5 active
...
14:00:00 → 200 jobs remaining (not done yet!)
14:00:00 → +1000 new jobs created!
14:00:00 → Queue: 1200 jobs (backlog!)
```

**Problem:** Queue grows if processing is slower than job creation!

**Solution:** Increase worker concurrency or add more workers

---

## 5. Resource Usage

### Database Load

**Per Job:**
- **Reads:** ~10,000-100,000 rows (depending on data volume)
- **Writes:** ~10-100 aggregate rows (upserts)
- **Queries:** ~10-20 database queries

**With 1000 Projects:**

**Hourly Aggregation:**
- **Total Reads:** 1000 jobs × 50,000 rows = 50 million rows/hour
- **Total Writes:** 1000 jobs × 50 rows = 50,000 rows/hour
- **Peak:** During processing (5 jobs × 50,000 = 250,000 concurrent reads)

**Daily Aggregation:**
- **Total Reads:** 1000 jobs × 1,200,000 rows = 1.2 billion rows/day
- **Total Writes:** 1000 jobs × 1,200 rows = 1.2 million rows/day
- **Peak:** During processing (5 jobs × 1,200,000 = 6 million concurrent reads)

### Redis Load

**Queue Storage:**
- Each job: ~500 bytes (job data)
- 1000 jobs: ~500 KB
- **Peak:** ~1 MB (with backlog)

**Operations:**
- **Enqueue:** 1000 operations/hour (hourly) + 1000 operations/day (daily)
- **Dequeue:** 1000 operations/hour (hourly) + 1000 operations/day (daily)
- **Total:** ~2000 operations/hour (very light load)

### Worker CPU/Memory

**Per Job:**
- **CPU:** ~10-20% (during processing)
- **Memory:** ~50-100 MB (data processing)

**With Concurrency 5:**
- **CPU:** ~50-100% (5 jobs × 20%)
- **Memory:** ~250-500 MB (5 jobs × 50-100 MB)

**With 1000 Projects:**
- **Total CPU Time:** 1000 jobs × 2 min = 2000 minutes = 33 hours
- **But:** With concurrency 5, actual time = 2000 ÷ 5 = 400 minutes = 6.7 hours
- **Peak CPU:** ~100% (during active processing)

---

## 6. Scaling Strategies

### Current Setup (Concurrency 5)

**Processing Time:**
- Hourly: 1000 jobs ÷ 5 = 200 batches × 2 min = **40 minutes**
- Daily: 1000 jobs ÷ 5 = 200 batches × 10 min = **3 hours 20 minutes**

**Can it keep up?**
- ✅ Hourly: Yes (40 min < 60 min, completes before next run)
- ✅ Daily: Yes (3.3 hours < 24 hours, completes before next run)

### Option 1: Increase Concurrency

**Concurrency: 10**
```typescript
concurrency: 10  // Process 10 jobs at once
```

**Processing Time:**
- Hourly: 1000 jobs ÷ 10 = 100 batches × 2 min = **20 minutes**
- Daily: 1000 jobs ÷ 10 = 100 batches × 10 min = **1 hour 40 minutes**

**Trade-offs:**
- ✅ Faster processing
- ⚠️ More database connections (10 concurrent)
- ⚠️ More memory usage (~500 MB - 1 GB)

### Option 2: Multiple Workers

**2 Workers, Concurrency 5 Each**
```bash
# Worker 1
pnpm worker:aggregation  # concurrency: 5

# Worker 2
pnpm worker:aggregation  # concurrency: 5
```

**Processing Time:**
- Hourly: 1000 jobs ÷ 10 = 100 batches × 2 min = **20 minutes**
- Daily: 1000 jobs ÷ 10 = 100 batches × 10 min = **1 hour 40 minutes**

**Trade-offs:**
- ✅ Faster processing
- ✅ Redundancy (if one fails, other continues)
- ⚠️ More complex to manage
- ⚠️ More infrastructure needed

### Option 3: Horizontal Scaling (Multiple Servers)

**3 Servers, 1 Worker Each, Concurrency 10**
```bash
# Server 1
pnpm worker:aggregation  # concurrency: 10

# Server 2
pnpm worker:aggregation  # concurrency: 10

# Server 3
pnpm worker:aggregation  # concurrency: 10
```

**Total Concurrency:** 30 jobs at once

**Processing Time:**
- Hourly: 1000 jobs ÷ 30 = 34 batches × 2 min = **7 minutes**
- Daily: 1000 jobs ÷ 30 = 34 batches × 10 min = **5.7 minutes** (wait, that's wrong)

**Correction:**
- Daily: 1000 jobs ÷ 30 = 34 batches × 10 min = **340 minutes = 5.7 hours**

**Trade-offs:**
- ✅ Very fast processing
- ✅ High availability
- ⚠️ More expensive (3 servers)
- ⚠️ More complex to coordinate

---

## 7. Production Recommendations

### For 1000 Projects

**Recommended Setup:**

**Option A: Single Worker, Higher Concurrency**
```typescript
concurrency: 20  // Process 20 jobs at once
```

**Processing Time:**
- Hourly: 1000 ÷ 20 = 50 batches × 2 min = **10 minutes**
- Daily: 1000 ÷ 20 = 50 batches × 10 min = **50 minutes**

**Pros:**
- ✅ Simple (one process)
- ✅ Fast enough (10 min < 60 min)
- ✅ Easy to monitor

**Cons:**
- ⚠️ Single point of failure
- ⚠️ High memory usage (~1-2 GB)

**Option B: Two Workers, Moderate Concurrency**
```bash
# Worker 1
concurrency: 10

# Worker 2
concurrency: 10
```

**Processing Time:**
- Hourly: 1000 ÷ 20 = 50 batches × 2 min = **10 minutes**
- Daily: 1000 ÷ 20 = 50 batches × 10 min = **50 minutes**

**Pros:**
- ✅ Redundancy
- ✅ Fast processing
- ✅ Balanced resource usage

**Cons:**
- ⚠️ More complex to manage

### Database Optimization

**For 1000 Projects:**

**1. Indexes:**
```sql
-- Ensure these indexes exist:
CREATE INDEX idx_api_trace_project_timestamp 
  ON "ApiTrace" (projectId, timestamp DESC);

CREATE INDEX idx_log_project_timestamp 
  ON "Log" (projectId, timestamp DESC);

CREATE INDEX idx_crash_project_timestamp 
  ON "Crash" (projectId, timestamp DESC);

CREATE INDEX idx_session_project_started 
  ON "Session" (projectId, startedAt DESC);
```

**2. Batch Size:**
```typescript
// In aggregate.ts
const batchSize = 10000;  // Process 10K rows at a time
```

**3. Connection Pool:**
```typescript
// Prisma connection pool
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  // Ensure connection pool is large enough
  // For 20 concurrent jobs: pool size >= 20
}
```

---

## 8. Monitoring & Alerts

### Key Metrics to Monitor

**1. Queue Size:**
```typescript
// Alert if queue > 2000 jobs
if (queueSize > 2000) {
  alert("Queue backlog detected!");
}
```

**2. Processing Time:**
```typescript
// Alert if hourly jobs take > 50 minutes
if (hourlyProcessingTime > 50 * 60 * 1000) {
  alert("Hourly aggregation slow!");
}
```

**3. Failed Jobs:**
```typescript
// Alert if > 10 jobs failed
if (failedJobs > 10) {
  alert("Multiple aggregation failures!");
}
```

**4. Database Load:**
```typescript
// Monitor database connections
// Alert if > 80% of pool used
```

---

## 9. Daily Timeline Example

### Complete 24-Hour Cycle

**00:00:00** - Daily cron triggers
- Creates 1000 daily jobs
- Queue: 1000 jobs
- Worker processes them
- Completes by ~03:20:00

**01:00:00** - Hourly cron triggers
- Creates 1000 hourly jobs
- Queue: 1000 jobs (daily done, only hourly)
- Worker processes them
- Completes by ~01:40:00

**02:00:00** - Hourly cron triggers
- Creates 1000 hourly jobs
- Queue: 1000 jobs
- Worker processes them
- Completes by ~02:40:00

**...continues every hour...**

**23:00:00** - Hourly cron triggers
- Creates 1000 hourly jobs
- Queue: 1000 jobs
- Worker processes them
- Completes by ~23:40:00

**00:00:00** (Next Day) - Daily cron triggers again
- Cycle repeats

### Queue Size Over 24 Hours

```
Jobs
1000 |     ████     ████     ████     ████     ████
     |    █   █    █   █    █   █    █   █    █   █
     |   █     █  █     █  █     █  █     █  █     █
     |  █       ██       ██       ██       ██       ██
   0 |__█________█________█________█________█________█___
     00:00  06:00  12:00  18:00  00:00  Time
```

**Pattern:**
- **Peak:** Every hour at :00 (1000 jobs)
- **Trough:** ~40 minutes after each hour (0 jobs)
- **Average:** ~500 jobs

---

## 10. Cost Estimation

### Infrastructure Costs

**Single Worker (Concurrency 20):**
- **Server:** 1 × $50/month = $50/month
- **Redis:** 1 × $10/month = $10/month
- **Database:** Included (existing)
- **Total:** ~$60/month

**Two Workers (Concurrency 10 Each):**
- **Servers:** 2 × $50/month = $100/month
- **Redis:** 1 × $10/month = $10/month
- **Total:** ~$110/month

**Three Workers (Concurrency 10 Each):**
- **Servers:** 3 × $50/month = $150/month
- **Redis:** 1 × $10/month = $10/month
- **Total:** ~$160/month

### Database Costs

**Reads:**
- Hourly: 50 million rows/hour × 24 hours = 1.2 billion rows/day
- Daily: 1.2 billion rows/day
- **Total:** ~2.4 billion rows/day

**Writes:**
- Hourly: 50,000 rows/hour × 24 hours = 1.2 million rows/day
- Daily: 1.2 million rows/day
- **Total:** ~2.4 million rows/day

**Cost:** Depends on database provider (usually included in plan)

---

## Summary

### With 1000 Projects:

**Hourly Aggregation:**
- **Jobs Created:** 1000 every hour
- **Processing Time:** ~40 minutes (concurrency 5)
- **Queue Peak:** 1000 jobs (at :00)
- **Queue Average:** ~500 jobs

**Daily Aggregation:**
- **Jobs Created:** 1000 every day at midnight
- **Processing Time:** ~3 hours 20 minutes (concurrency 5)
- **Queue Peak:** 1000 jobs (at 00:00)
- **Queue Average:** ~500 jobs

**Recommended Setup:**
- **Concurrency:** 20 (or 2 workers × 10)
- **Processing Time:** ~10 minutes (hourly), ~50 minutes (daily)
- **Queue Size:** Stays manageable (< 1000 jobs)
- **Cost:** ~$60-110/month

**Key Points:**
- ✅ System can handle 1000 projects with current setup
- ✅ Processing completes before next batch arrives
- ✅ Queue stays manageable
- ✅ Can scale up if needed (increase concurrency or add workers)

