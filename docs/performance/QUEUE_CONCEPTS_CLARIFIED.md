# Queue Concepts Clarified

## 1. What Does "4 Runs" Mean?

### The Confusion:

You're asking: **"Why 4 runs × 8 jobs? What does '4 runs' mean?"**

### The Answer:

**"4 runs" = You manually executed `pnpm test:enqueue` 4 times**

### Step-by-Step Explanation:

**Run 1 (First time you ran the command):**
```bash
$ pnpm test:enqueue
```
**What happened:**
1. Script called `enqueueHourlyAggregation()`
   - Got 4 projects from database
   - Created 4 hourly jobs (one per project)
2. Script called `enqueueDailyAggregation()`
   - Got same 4 projects
   - Created 4 daily jobs (one per project)
3. **Total created: 8 jobs**

**Run 2 (Second time you ran the command):**
```bash
$ pnpm test:enqueue
```
**What happened:**
- Same process repeated
- Created another 8 jobs (with different timestamps)
- **Total now: 16 jobs** (8 from run 1 + 8 from run 2)

**Run 3 (Third time):**
```bash
$ pnpm test:enqueue
```
- Created another 8 jobs
- **Total now: 24 jobs**

**Run 4 (Fourth time):**
```bash
$ pnpm test:enqueue
```
- Created another 8 jobs
- **Total now: 32 jobs**

### Why Different Time Ranges?

Each run creates jobs with **different time ranges** because `Date.now()` changes:

**Run 1 (at 01:40:19):**
```
Job 1: hourly-project1-1767494419542
  Time range: 2026-01-04T01:40:19 → 2026-01-04T02:40:19
```

**Run 2 (at 01:40:23):**
```
Job 1: hourly-project1-1767494423886
  Time range: 2026-01-04T01:40:23 → 2026-01-04T02:40:23
```

**Run 3 (at 01:40:30):**
```
Job 1: hourly-project1-1767494430142
  Time range: 2026-01-04T01:40:30 → 2026-01-04T02:40:30
```

**Result:** Same project, but 3 different 1-hour windows!

### In Production (Normal Operation):

**You DON'T run `test:enqueue` manually!**

Instead:
- **Cron scheduler** runs automatically every hour
- Creates 8 jobs once per hour
- Worker processes them
- Queue clears
- **No accumulation** (queue stays at 0-8 jobs)

---

## 2. Why 5 Workers? Is It Dynamic or Static?

### The Confusion:

You're asking: **"Why 5 workers? Is that dynamic or static?"**

### The Answer:

**It's NOT 5 separate worker processes!**

**It's 1 worker process with `concurrency: 5`**

### What "Concurrency: 5" Means:

```typescript
const worker = new Worker('aggregation', async (job) => {
  // Process job
}, {
  concurrency: 5,  // ← This is the setting
});
```

**Translation:**
- **1 worker process** running
- **Processes 5 jobs simultaneously** (in parallel)
- Not 5 separate worker processes!

### Visual Explanation:

**What You Might Think (WRONG):**
```
Worker 1 → Processing Job 1
Worker 2 → Processing Job 2
Worker 3 → Processing Job 3
Worker 4 → Processing Job 4
Worker 5 → Processing Job 5
```
❌ This is NOT how it works!

**What Actually Happens (CORRECT):**
```
Single Worker Process
├─ Processing Job 1 (async, in parallel)
├─ Processing Job 2 (async, in parallel)
├─ Processing Job 3 (async, in parallel)
├─ Processing Job 4 (async, in parallel)
└─ Processing Job 5 (async, in parallel)
```
✅ This is how it works!

### How BullMQ Handles Concurrency:

**BullMQ internally:**
1. Worker picks up 5 jobs from queue
2. Moves them to "active" state
3. Processes all 5 using JavaScript `Promise.all()` or similar
4. When one finishes, picks up next job
5. Always maintains 5 active jobs (until queue is empty)

### Is It Dynamic or Static?

**It's STATIC (but configurable):**

**Current Setting:**
```typescript
concurrency: 5  // Fixed at 5
```

**You can change it:**
```typescript
// For faster processing (more parallel):
concurrency: 10  // Process 10 jobs at once

// For slower processing (less load):
concurrency: 2   // Process 2 jobs at once
```

**Why 5?**
- Good balance between speed and resource usage
- Not too many (would overload database)
- Not too few (would be slow)

### How to Change It:

**Option 1: Change in code:**
```typescript
// dashboard/scripts/workers/aggregation-worker.ts
const worker = new Worker('aggregation', async (job) => {
  // ...
}, {
  concurrency: 10,  // Change from 5 to 10
});
```

**Option 2: Use environment variable:**
```typescript
const worker = new Worker('aggregation', async (job) => {
  // ...
}, {
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
});
```

Then set in `.env.local`:
```bash
WORKER_CONCURRENCY=10
```

---

## 3. Complete Picture

### Current Setup:

**1 Worker Process:**
- Running: `pnpm worker:aggregation`
- Concurrency: 5 (processes 5 jobs simultaneously)
- Status: Active, processing jobs

**32 Jobs in Queue:**
- From 4 manual test runs
- 20 hourly (Priority 1)
- 12 daily (Priority 2)

**Processing:**
- Worker picks up 5 jobs at a time
- Processes them in parallel
- When one finishes, picks up next
- Continues until queue is empty

### Production Setup:

**1 Worker Process:**
- Running continuously (or via PM2/systemd)
- Concurrency: 5 (or higher, e.g., 10)
- Processes jobs as they arrive

**Cron Scheduler:**
- Runs every hour
- Creates 8 jobs
- Worker processes them quickly
- Queue stays small (0-8 jobs)

---

## 4. Why Not More Workers?

### Could You Run Multiple Worker Processes?

**Yes, but usually not needed:**

**Option 1: Single Worker, Higher Concurrency**
```typescript
concurrency: 10  // Process 10 jobs at once
```
✅ Simpler to manage  
✅ One process to monitor  
✅ Good for most cases

**Option 2: Multiple Workers, Lower Concurrency**
```bash
# Terminal 1
pnpm worker:aggregation  # concurrency: 5

# Terminal 2
pnpm worker:aggregation  # concurrency: 5
```
✅ Can scale horizontally  
✅ Good for very high load  
❌ More complex to manage  
❌ Need to coordinate

### When to Use Multiple Workers:

**Use multiple workers if:**
- Single worker can't keep up
- Jobs take very long (hours)
- You have multiple servers
- You want redundancy

**Stick with single worker if:**
- Current setup works fine
- Jobs process quickly (< 10 minutes)
- Simpler is better

---

## 5. Real-World Example

### Scenario: 100 Projects

**Hourly Cron Runs:**
- Creates 100 hourly jobs (one per project)
- Creates 100 daily jobs (one per project)
- **Total: 200 jobs**

**With Concurrency 5:**
- Worker processes 5 at a time
- Takes ~40 batches (200 ÷ 5 = 40)
- If each job takes 2 minutes: 40 × 2 = 80 minutes total

**With Concurrency 20:**
- Worker processes 20 at a time
- Takes ~10 batches (200 ÷ 20 = 10)
- If each job takes 2 minutes: 10 × 2 = 20 minutes total

**Trade-off:**
- Higher concurrency = Faster processing
- But = More database connections, more memory, more CPU

---

## Summary

### "4 Runs" Explained:
- **4 runs** = You ran `pnpm test:enqueue` 4 times manually
- Each run creates 8 jobs (4 hourly + 4 daily)
- Total: 4 × 8 = 32 jobs
- In production: Cron runs automatically, no manual runs needed

### "5 Workers" Explained:
- **NOT 5 separate processes!**
- **1 worker process** with `concurrency: 5`
- Processes 5 jobs simultaneously (in parallel)
- **Static but configurable** (can change to 10, 20, etc.)
- Current: 5 is a good balance

### Key Takeaway:
- **Runs** = How many times you executed the enqueue command
- **Concurrency** = How many jobs one worker processes at once
- **Workers** = Number of worker processes (currently 1)

