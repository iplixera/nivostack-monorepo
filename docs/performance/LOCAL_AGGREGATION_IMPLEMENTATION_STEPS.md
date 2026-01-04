# Local Aggregation Implementation Steps

## Overview
This document outlines the step-by-step implementation plan for local development of aggregation tables using Redis, BullMQ, and node-cron.

## Implementation Steps

### Step 1: Setup Redis in Docker ✅
**Objective**: Install and configure Redis as a Docker container for local job queue

**Tasks**:
- [ ] Create `docker-compose.yml` for Redis
- [ ] Start Redis container
- [ ] Verify Redis connection
- [ ] Test Redis with `redis-cli ping`

**Commands**:
```bash
docker run -d --name redis-aggregation -p 6379:6379 redis:alpine
# OR
docker-compose up -d redis
```

**Verification**:
- Redis container running on port 6379
- Can connect via `redis-cli`

---

### Step 2: Install Dependencies ✅
**Objective**: Install required packages for queue management and scheduling

**Tasks**:
- [ ] Install `bullmq` (queue management)
- [ ] Install `ioredis` (Redis client)
- [ ] Install `node-cron` (scheduler)
- [ ] Install TypeScript types

**Commands**:
```bash
pnpm add bullmq ioredis node-cron
pnpm add -D @types/node-cron
```

**Files to Update**:
- `package.json`

---

### Step 3: Create Queue Configuration ✅
**Objective**: Set up BullMQ queue with Redis connection

**Tasks**:
- [ ] Create `lib/aggregation/queue.ts`
- [ ] Configure Redis connection
- [ ] Create aggregation queue instance
- [ ] Add connection error handling

**Files to Create**:
- `dashboard/src/lib/aggregation/queue.ts`

**Key Components**:
- Redis connection configuration
- Queue instance creation
- Environment variable support

---

### Step 4: Create Enqueue Function ✅
**Objective**: Create function to enqueue aggregation jobs for projects

**Tasks**:
- [ ] Create `lib/aggregation/enqueue.ts`
- [ ] Implement `enqueueHourlyAggregation()` function
- [ ] Get all projects from database
- [ ] Create jobs for each project
- [ ] Add to queue with proper job data

**Files to Create**:
- `dashboard/src/lib/aggregation/enqueue.ts`

**Job Data Structure**:
```typescript
{
  projectId: string,
  startTime: Date,
  endTime: Date,
  granularity: 'hourly' | 'daily'
}
```

---

### Step 5: Create Worker Process ✅
**Objective**: Create worker that processes aggregation jobs from queue

**Tasks**:
- [ ] Create `scripts/workers/aggregation-worker.ts`
- [ ] Connect to Redis
- [ ] Create worker instance
- [ ] Implement job processing logic
- [ ] Connect to database
- [ ] Implement aggregation logic
- [ ] Save aggregates to database
- [ ] Add error handling and retries

**Files to Create**:
- `scripts/workers/aggregation-worker.ts`

**Key Features**:
- Batch processing (10K rows per batch)
- Incremental aggregation (only new data)
- Error handling and retries
- Progress logging

---

### Step 6: Setup Node-Cron Scheduler ✅
**Objective**: Create cron scheduler to trigger aggregation jobs

**Tasks**:
- [ ] Create `scripts/cron/scheduler.ts`
- [ ] Setup hourly cron job (every hour at :00)
- [ ] Setup daily cron job (every day at 00:00)
- [ ] Call enqueue function on schedule
- [ ] Add error handling and logging

**Files to Create**:
- `scripts/cron/scheduler.ts`

**Schedule**:
- Hourly: `0 * * * *` (every hour at minute 0)
- Daily: `0 0 * * *` (every day at midnight)

---

### Step 7: Create Aggregate Table Schemas ✅
**Objective**: Define Prisma models for aggregate tables

**Tasks**:
- [ ] Review UI requirements for metrics
- [ ] Design aggregate table schemas
- [ ] Create Prisma models:
  - `ApiTraceAggregate`
  - `LogAggregate`
  - `CrashAggregate`
  - `SessionAggregate`
- [ ] Create migration files
- [ ] Run migrations

**Files to Update**:
- `prisma/schema.prisma`

**Key Fields**:
- `projectId`, `period`, `granularity`
- Dimension fields (method, platform, etc.)
- Metric fields (count, avg, max, p95, etc.)

---

### Step 8: Implement Aggregation Logic ✅
**Objective**: Create functions to aggregate raw data into aggregate tables

**Tasks**:
- [ ] Create `lib/aggregation/aggregate.ts`
- [ ] Implement `aggregateApiTraces()` function
- [ ] Implement `aggregateLogs()` function
- [ ] Implement `aggregateCrashes()` function
- [ ] Implement `aggregateSessions()` function
- [ ] Handle percentiles (p50, p95)
- [ ] Handle batch processing
- [ ] Handle incremental updates

**Files to Create**:
- `dashboard/src/lib/aggregation/aggregate.ts`

**Aggregation Functions**:
- Group by dimensions (projectId, period, method, platform, etc.)
- Calculate metrics (count, avg, max, p50, p95, sum)
- Upsert aggregates (update if exists, insert if new)

---

### Step 9: Add Package.json Scripts ✅
**Objective**: Add convenient scripts for running workers and cron

**Tasks**:
- [ ] Add `worker:aggregation` script
- [ ] Add `cron:scheduler` script
- [ ] Add `test:enqueue` script
- [ ] Add `check:queue` script

**Files to Update**:
- `dashboard/package.json`

**Scripts**:
```json
{
  "scripts": {
    "worker:aggregation": "tsx scripts/workers/aggregation-worker.ts",
    "cron:scheduler": "tsx scripts/cron/scheduler.ts",
    "test:enqueue": "tsx scripts/test-enqueue.ts",
    "check:queue": "tsx scripts/check-queue.ts"
  }
}
```

---

### Step 10: Testing & Verification ✅
**Objective**: Test the complete aggregation pipeline

**Tasks**:
- [ ] Test Redis connection
- [ ] Test enqueue function
- [ ] Test worker processing
- [ ] Test cron scheduler
- [ ] Verify aggregates in database
- [ ] Test incremental updates
- [ ] Test error handling
- [ ] Performance testing

**Test Commands**:
```bash
# Test enqueue manually
pnpm test:enqueue

# Check queue status
pnpm check:queue

# Start worker
pnpm worker:aggregation

# Start cron
pnpm cron:scheduler
```

---

## Complete Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT SETUP                 │
└─────────────────────────────────────────────────────────────┘

Terminal 1: Redis (Docker)
┌─────────────────────┐
│   Docker Redis      │ ← docker run -d -p 6379:6379 redis:alpine
│   Port: 6379        │
└─────────────────────┘

Terminal 2: Worker Process
┌─────────────────────┐
│  Aggregation Worker │ ← pnpm worker:aggregation
│  - Gets jobs        │
│  - Processes data   │
│  - Saves aggregates │
└─────────────────────┘

Terminal 3: Cron Scheduler
┌─────────────────────┐
│  Node-Cron          │ ← pnpm cron:scheduler
│  - Hourly trigger   │
│  - Daily trigger    │
│  - Enqueues jobs    │
└─────────────────────┘

Terminal 4: Next.js App (Optional)
┌─────────────────────┐
│  Next.js Dev Server │ ← pnpm dev
│  - Dashboard        │
│  - API routes       │
└─────────────────────┘
```

---

## File Structure

```
dashboard/
├── src/
│   └── lib/
│       └── aggregation/
│           ├── queue.ts          # Queue configuration
│           ├── enqueue.ts        # Enqueue functions
│           └── aggregate.ts      # Aggregation logic
├── scripts/
│   ├── workers/
│   │   └── aggregation-worker.ts  # Worker process
│   ├── cron/
│   │   └── scheduler.ts         # Cron scheduler
│   ├── test-enqueue.ts          # Test enqueue
│   └── check-queue.ts            # Check queue status
└── prisma/
    └── schema.prisma            # Aggregate table models

docker-compose.yml                # Redis configuration
```

---

## Environment Variables

Add to `.env.local`:
```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # Optional for local

# Database (already exists)
DATABASE_URL=your_database_url
```

---

## Next Steps After Local Implementation

1. ✅ Test thoroughly locally
2. ✅ Verify aggregates are correct
3. ✅ Performance testing
4. ✅ Move to production implementation:
   - Setup Upstash Redis
   - Setup Vercel Cron jobs
   - Deploy external worker service
   - Update API endpoints to use aggregates

---

## GitHub Issues Tracking

Each step should have a corresponding GitHub issue:
- [ ] Step 1: Setup Redis in Docker
- [ ] Step 2: Install Dependencies
- [ ] Step 3: Create Queue Configuration
- [ ] Step 4: Create Enqueue Function
- [ ] Step 5: Create Worker Process
- [ ] Step 6: Setup Node-Cron Scheduler
- [ ] Step 7: Create Aggregate Table Schemas
- [ ] Step 8: Implement Aggregation Logic
- [ ] Step 9: Add Package.json Scripts
- [ ] Step 10: Testing & Verification

