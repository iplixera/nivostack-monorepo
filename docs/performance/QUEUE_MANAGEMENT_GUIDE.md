# Queue Management Guide

## Understanding Job Creation Logic

### How Jobs Are Created

When you run `pnpm test:enqueue` or when the cron scheduler runs, jobs are created based on this logic:

**For Each Project:**
1. **Hourly Job** (Priority 1) - Aggregates data from the last hour
2. **Daily Job** (Priority 2) - Aggregates data from the previous day

**Example:**
- You have **4 projects** in your database
- Running `test:enqueue` once creates: **4 hourly + 4 daily = 8 jobs**
- Running it **4 times** creates: **32 jobs** (8 × 4 = 32)

### Why 32 Jobs?

Looking at your current queue:
- **32 prioritized jobs** = Multiple test runs
- Each test run created 8 jobs (4 projects × 2 job types)
- Jobs accumulate until processed by a worker

---

## Viewing Queue Status

### Quick Status Check

```bash
cd dashboard
pnpm check:queue
```

**Output:**
- ⏳ Waiting jobs
- ⏰ Delayed jobs  
- ⚡ Prioritized jobs (jobs with priority 1 or 2)
- 🔄 Active jobs (currently being processed)
- ✅ Completed jobs
- ❌ Failed jobs

### Detailed Queue View

```bash
cd dashboard
pnpm view:queue
```

**Shows:**
- Complete summary with counts
- Full job details (ID, project, time range, priority, created time)
- Job creation logic explanation

### Filtered Views

```bash
# View only waiting jobs
pnpm view:queue:waiting

# View only prioritized jobs
pnpm view:queue:prioritized

# View all jobs (waiting, prioritized, active, completed, failed)
pnpm view:queue:all
```

---

## Job States Explained

### ⏳ Waiting
Jobs ready to be processed (no priority set, FIFO order)

### ⚡ Prioritized  
Jobs with priority 1 or 2 (processed before waiting jobs)
- **Priority 1**: Hourly aggregation (higher priority)
- **Priority 2**: Daily aggregation (lower priority)

### 🔄 Active
Jobs currently being processed by a worker

### ✅ Completed
Jobs that finished successfully (kept for 24 hours)

### ❌ Failed
Jobs that failed (kept for 7 days, can be retried)

### ⏰ Delayed
Jobs scheduled for future execution

---

## Managing Jobs

### Clear All Jobs (Use with Caution!)

```bash
# Connect to Redis CLI
docker exec -it redis-aggregation redis-cli

# Delete all aggregation queue keys
KEYS "bull:aggregation:*"
# Then delete them one by one or use:
DEL bull:aggregation:wait bull:aggregation:prioritized bull:aggregation:delayed
```

### Remove Specific Job

```bash
cd dashboard
node -e "
const { Queue } = require('bullmq');
const Redis = require('ioredis');
const redis = new Redis({ host: 'localhost', port: 6379 });
const queue = new Queue('aggregation', { connection: redis });
queue.remove('JOB_ID_HERE').then(() => {
  console.log('Job removed');
  process.exit(0);
});
"
```

---

## Normal Workflow

### 1. Cron Scheduler Runs (Every Hour)
- Creates 8 jobs (4 projects × 2 types)
- Jobs go to **Prioritized** queue

### 2. Worker Processes Jobs
- Picks up jobs from Prioritized queue (priority 1 first, then priority 2)
- Processes aggregation
- Moves jobs to **Completed** or **Failed**

### 3. Jobs Clean Up Automatically
- Completed jobs: Removed after 24 hours
- Failed jobs: Removed after 7 days

---

## Current Situation

You have **32 jobs** because:
- `test:enqueue` was run **4 times**
- Each run created **8 jobs** (4 projects × 2 job types)
- **4 × 8 = 32 jobs**

**These are all valid jobs** - they will be processed when you start the worker.

---

## Commands Summary

| Command | Purpose |
|---------|---------|
| `pnpm check:queue` | Quick queue status |
| `pnpm view:queue` | Detailed job list |
| `pnpm view:queue:prioritized` | Show only prioritized jobs |
| `pnpm test:enqueue` | Manually create test jobs |
| `pnpm worker:aggregation` | Start worker to process jobs |
| `pnpm cron:scheduler` | Start cron scheduler |

---

## Next Steps

1. **Start Worker** to process the 32 jobs:
   ```bash
   pnpm worker:aggregation
   ```

2. **Monitor Progress**:
   ```bash
   # In another terminal
   pnpm check:queue
   ```

3. **View Details**:
   ```bash
   pnpm view:queue
   ```

The worker will process all 32 jobs automatically!

