# Aggregate Tables Design - Issue #11

**Issue**: Create analytics aggregate tables for dashboards  
**Status**: 🟡 Waiting for UI Design  
**Priority**: P0

---

## 📊 Current Schema Analysis

### 1. ApiTrace Table (Source)

**Current Fields Used for Aggregation:**
```prisma
model ApiTrace {
  id              String   @id @default(cuid())
  projectId       String   // Grouping dimension
  url             String   // Can extract endpoint from this
  method          String   // Grouping dimension (GET, POST, etc.)
  statusCode      Int?     // Used to calculate status_class and error_rate
  duration        Int?     // Used for avg/max/p50/p95
  cost            Float?   // Used for cost_sum
  screenName      String?  // Grouping dimension
  country         String?  // Grouping dimension
  platform        String?  // Grouping dimension (from device relation)
  timestamp       DateTime // Used for period grouping (hourly/daily)
  
  // Relations
  device          Device?  // Can get platform, buildVersion from here
}
```

**Key Metrics to Aggregate:**
- Count of traces per period
- Error rate (statusCode >= 400)
- Average/Max duration
- p50/p95 duration (percentiles)
- Total cost sum
- Status class distribution (2xx, 4xx, 5xx)

---

### 2. Log Table (Source)

**Current Fields Used for Aggregation:**
```prisma
model Log {
  id           String   @id @default(cuid())
  projectId    String   // Grouping dimension
  level        String   // Grouping dimension (verbose, debug, info, warn, error)
  screenName   String?  // Grouping dimension
  timestamp    DateTime // Used for period grouping
  
  // Relations
  device       Device?  // Can get platform, buildVersion from here
  session      Session? // Can get entryScreen, exitScreen from here
}
```

**Key Metrics to Aggregate:**
- Count of logs per level
- Count per screen
- Error log rate (level = 'error')

---

### 3. Crash Table (Source)

**Current Fields Used for Aggregation:**
```prisma
model Crash {
  id         String   @id @default(cuid())
  projectId  String   // Grouping dimension
  message    String   // Can group by crash type
  timestamp  DateTime // Used for period grouping
  
  // Relations
  device     Device?  // Can get platform, buildVersion from here
}
```

**Key Metrics to Aggregate:**
- Count of crashes per period
- Crash rate per device/platform
- Unique crash messages count

---

### 4. Session Table (Source)

**Current Fields Used for Aggregation:**
```prisma
model Session {
  id             String   @id @default(cuid())
  projectId      String   // Grouping dimension
  startedAt      DateTime // Used for period grouping
  endedAt        DateTime? // Used for duration calculation
  entryScreen    String?  // Grouping dimension
  exitScreen     String?  // Grouping dimension
  duration       Int?     // Used for avg/max/p50/p95
  screenCount    Int      // Used for avg/max
  eventCount     Int      // Used for avg/max
  errorCount     Int      // Used for error rate
  
  // Relations
  device         Device?  // Can get platform, buildVersion from here
}
```

**Key Metrics to Aggregate:**
- Count of sessions per period
- Average/Max session duration
- Average screens per session
- Average events per session
- Error rate per session

---

## 🎯 Proposed Aggregate Schema Design

### Design Principles

1. **Two Granularities**: Hourly and Daily aggregates
2. **Flexible Dimensions**: Support multiple dimension combinations
3. **Precomputed Metrics**: All calculations done during aggregation
4. **Efficient Queries**: Single table scan instead of multiple raw table scans

---

### Proposed Schema: ApiTraceAggregate

```prisma
model ApiTraceAggregate {
  id              String   @id @default(cuid())
  projectId       String
  // Time period
  period          DateTime // Start of hour/day (truncated)
  granularity     String   // "hourly" | "daily"
  
  // Dimensions (grouping keys)
  endpoint        String?  // Extracted from url (e.g., "/api/users/:id" → "/api/users")
  method          String?  // GET, POST, PUT, DELETE, PATCH
  statusClass     String?  // "2xx", "4xx", "5xx" (derived from statusCode)
  screenName      String?
  buildVersion    String?  // From device relation
  country         String?
  platform        String?  // From device relation
  
  // Metrics (aggregated values)
  count           Int      @default(0) // Total number of traces
  errorCount      Int      @default(0) // Count where statusCode >= 400
  errorRate       Float    @default(0) // errorCount / count
  
  // Duration metrics (in milliseconds)
  durationSum     BigInt   @default(0) // Sum of all durations
  durationAvg     Float    @default(0) // Average duration
  durationMax     Int      @default(0) // Maximum duration
  durationP50     Int?     // 50th percentile (median)
  durationP95     Int?     // 95th percentile
  
  // Cost metrics
  costSum         Float    @default(0) // Total cost
  
  // Status code distribution
  status2xx       Int      @default(0) // Count of 2xx responses
  status4xx       Int      @default(0) // Count of 4xx responses
  status5xx       Int      @default(0) // Count of 5xx responses
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([projectId, period, granularity, endpoint, method, statusClass, screenName, buildVersion, country, platform])
  @@index([projectId, period, granularity])
  @@index([projectId, granularity, period])
  @@index([projectId, endpoint])
  @@index([projectId, method])
  @@index([projectId, statusClass])
  @@index([projectId, screenName])
  @@index([projectId, platform])
}
```

---

### Proposed Schema: LogAggregate

```prisma
model LogAggregate {
  id              String   @id @default(cuid())
  projectId       String
  // Time period
  period          DateTime
  granularity     String   // "hourly" | "daily"
  
  // Dimensions
  level           String?  // verbose, debug, info, warn, error
  screenName      String?
  buildVersion    String?
  platform        String?
  
  // Metrics
  count           Int      @default(0) // Total logs
  errorCount      Int      @default(0) // Count where level = 'error'
  errorRate       Float    @default(0) // errorCount / count
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([projectId, period, granularity, level, screenName, buildVersion, platform])
  @@index([projectId, period, granularity])
  @@index([projectId, level])
  @@index([projectId, screenName])
}
```

---

### Proposed Schema: CrashAggregate

```prisma
model CrashAggregate {
  id              String   @id @default(cuid())
  projectId       String
  // Time period
  period          DateTime
  granularity     String   // "hourly" | "daily"
  
  // Dimensions
  buildVersion    String?
  platform        String?
  country         String?
  
  // Metrics
  count           Int      @default(0) // Total crashes
  uniqueMessages  Int      @default(0) // Count of distinct crash messages
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([projectId, period, granularity, buildVersion, platform, country])
  @@index([projectId, period, granularity])
  @@index([projectId, platform])
}
```

---

### Proposed Schema: SessionAggregate

```prisma
model SessionAggregate {
  id              String   @id @default(cuid())
  projectId       String
  // Time period
  period          DateTime
  granularity     String   // "hourly" | "daily"
  
  // Dimensions
  entryScreen     String?
  exitScreen      String?
  buildVersion    String?
  platform        String?
  country         String?
  
  // Metrics
  count           Int      @default(0) // Total sessions
  
  // Duration metrics (in seconds)
  durationSum     BigInt   @default(0)
  durationAvg     Float    @default(0)
  durationMax     Int      @default(0)
  durationP50     Int?
  durationP95     Int?
  
  // Screen metrics
  screenCountSum  BigInt   @default(0) // Sum of screenCount
  screenCountAvg  Float    @default(0) // Average screens per session
  screenCountMax  Int      @default(0)
  
  // Event metrics
  eventCountSum   BigInt   @default(0)
  eventCountAvg   Float    @default(0) // Average events per session
  eventCountMax   Int      @default(0)
  
  // Error metrics
  errorCountSum   BigInt   @default(0)
  errorCountAvg   Float    @default(0) // Average errors per session
  errorRate       Float    @default(0) // Sessions with errors / total sessions
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([projectId, period, granularity, entryScreen, exitScreen, buildVersion, platform, country])
  @@index([projectId, period, granularity])
  @@index([projectId, entryScreen])
  @@index([projectId, exitScreen])
  @@index([projectId, platform])
}
```

---

## 🏗️ Implementation Approach

### FAQ: Understanding Key Concepts

#### Q1: Why Do We Need Redis with Queues? What's Its Role?

**Redis Role:**
Redis acts as a **message broker** - a temporary storage system that holds jobs waiting to be processed.

**Why Redis?**
1. **Fast**: In-memory storage (microseconds latency)
2. **Reliable**: Persists jobs even if application restarts
3. **Queue Features**: Built-in queue operations (FIFO, priority, delays)
4. **Atomic Operations**: Prevents duplicate processing
5. **Pub/Sub**: Can notify workers when new jobs arrive

**How It Works:**
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Cron Job  │────────▶│    Redis    │────────▶│   Worker    │
│  (Enqueue)  │  Add    │   (Queue)   │  Get    │  (Process)   │
└─────────────┘  Job    └─────────────┘  Job   └─────────────┘
                              │
                              │ Stores jobs temporarily
                              │ until worker picks them up
                              ▼
```

**Without Redis:**
- Jobs stored in database → Slower (disk I/O)
- No built-in queue features → Need to build yourself
- Harder to scale → Database becomes bottleneck

**With Redis:**
- Jobs stored in memory → Very fast
- Built-in queue features → Ready to use
- Easy to scale → Multiple workers can consume jobs

---

#### Q2: What is Upstash Redis (Serverless Redis)?

**Traditional Redis:**
- You run a Redis server (Docker, VM, or managed service)
- You pay for server uptime (even when idle)
- You manage scaling, backups, etc.

**Upstash Redis (Serverless):**
- **Serverless** = No server to manage
- **Pay-per-use** = Only pay for what you use
- **Auto-scaling** = Handles traffic spikes automatically
- **Global** = Low latency worldwide
- **Perfect for Vercel** = Works seamlessly with serverless functions

**How It Works:**
```
Traditional Redis:
┌─────────────┐
│ Redis Server│ ← You manage this 24/7
│ (Always On) │
└─────────────┘

Upstash Redis (Serverless):
┌─────────────┐
│ Upstash API │ ← Managed by Upstash
│ (On-Demand) │ ← Only runs when needed
└─────────────┘
```

**Benefits:**
- ✅ No server management
- ✅ Cost-effective (pay per request)
- ✅ Works with Vercel serverless functions
- ✅ Auto-scales
- ✅ Free tier available

---

#### Q3: 10M Rows - Total Table or New Data?

**Answer: New Data (Incremental)**

**10K rows per batch** refers to **new data** that arrived since the last aggregation, NOT the entire table.

**Example:**
```
Total ApiTrace table: 50 Million rows
New data in last hour: 100,000 rows

We process: 100,000 rows (new data only)
In batches of: 10,000 rows per batch
Total batches: 10 batches

We do NOT process: 50 Million rows (entire table)
```

**Why Incremental?**
- ✅ Much faster (process 100K vs 50M)
- ✅ Avoids timeout issues
- ✅ Reduces database load
- ✅ More efficient

**How It Works:**
```typescript
// Track last processed time
const lastProcessed = await getLastAggregationTime(projectId);

// Only get new data
const newTraces = await prisma.apiTrace.findMany({
  where: {
    projectId,
    timestamp: { gt: lastProcessed } // Only new data
  },
  take: 10000 // Process 10K at a time
});
```

---

#### Q4: What Does "Projects" Mean in Parallel Processing?

**Projects** = Different customer projects in your system.

**Example:**
```
Your system has:
- Project A (Customer A's app)
- Project B (Customer B's app)
- Project C (Customer C's app)
- ... 1000+ projects

Each project has its own:
- ApiTrace data
- Log data
- Crash data
- Session data
```

**Sequential Processing (Slow):**
```
Process Project A → Wait → Process Project B → Wait → Process Project C
Time: 5 min + 5 min + 5 min = 15 minutes total
```

**Parallel Processing (Fast):**
```
Process Project A ┐
Process Project B ├─ All at the same time
Process Project C ┘
Time: 5 minutes total (all finish together)
```

**Why Parallel?**
- ✅ Much faster (process all projects simultaneously)
- ✅ Better resource utilization
- ✅ Scales horizontally (add more workers)

---

#### Q5: What is a Worker?

**Worker** = A background process that consumes jobs from the queue and processes them.

**Analogy:**
```
Queue = Restaurant Order Queue
Worker = Chef (processes orders)
Cron Job = Waiter (takes orders, adds to queue)
```

**How It Works:**
```
┌─────────────┐
│  Cron Job   │ ← Runs every hour
│  (Enqueue)  │ ← Adds jobs to queue
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Queue    │ ← Holds jobs
│   (Redis)   │
└──────┬──────┘
       │
       ├─────────┐
       │         │
       ▼         ▼
┌──────────┐  ┌──────────┐
│ Worker 1 │  │ Worker 2 │ ← Process jobs
│          │  │          │ ← Can run in parallel
└──────────┘  └──────────┘
```

**Worker Responsibilities:**
1. **Get job** from queue
2. **Process job** (aggregate data)
3. **Update progress** (optional)
4. **Mark job complete** or retry on failure

**Example Worker:**
```typescript
// Worker process (runs continuously)
const worker = new Worker('aggregation', async (job) => {
  // 1. Get job data
  const { projectId, startTime, endTime } = job.data;
  
  // 2. Process aggregation
  await aggregateData(projectId, startTime, endTime);
  
  // 3. Job complete (automatically marked)
});
```

---

#### Q6: What are PostgreSQL Window Functions?

**Window Functions** = SQL functions that perform calculations across a set of rows related to the current row.

**Regular Aggregate (Groups Rows):**
```sql
-- Groups all rows together, returns one result
SELECT AVG(duration) FROM api_trace;
-- Result: One average value
```

**Window Function (Keeps All Rows):**
```sql
-- Calculates average but keeps all rows
SELECT 
  id,
  duration,
  AVG(duration) OVER (PARTITION BY project_id) as avg_duration
FROM api_trace;
-- Result: All rows + average column
```

**Why Useful for Aggregation?**
- Can calculate percentiles efficiently
- Can rank/order within groups
- More efficient than application-level processing

**Example for Percentiles:**
```sql
-- Calculate p50, p95 using window functions
SELECT 
  project_id,
  method,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration) as p95
FROM api_trace
GROUP BY project_id, method;
```

---

#### Q7: How Does a Worker Connect to Redis and Database?

**Yes!** The worker connects to **BOTH** Redis and the Database. Here's the complete flow:

---

### Worker Connection Architecture

#### Worker Connects to 2 Services:

1. **Redis (Upstash)**
   - **Purpose**: Get jobs from queue
   - **Connection**: Redis client library
   - **Operations**: Get job, mark complete, retry on failure

2. **Database (PostgreSQL/Supabase)**
   - **Purpose**: Fetch raw data + insert aggregates
   - **Connection**: Prisma client or PostgreSQL client
   - **Operations**:
     - **Read**: Fetch ApiTrace, Log, Crash, Session data
     - **Write**: Insert into aggregate tables
     - **Update**: Track last processed time

---

### Complete Worker Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKER PROCESS                           │
└─────────────────────────────────────────────────────────────┘

1. Worker Starts (Continuous Loop)
   │
   ├─ Connect to Redis (get jobs)
   └─ Connect to Database (fetch/insert data)
   
2. Get Job from Redis Queue
   │
   └─ Redis: "Give me next job"
      └─ Redis returns: { projectId: "proj_123", startTime: "...", endTime: "..." }

3. Fetch Raw Data from Database
   │
   └─ Database Query: SELECT * FROM ApiTrace 
      WHERE projectId = 'proj_123' 
      AND timestamp > startTime 
      AND timestamp < endTime
      LIMIT 10000
   
4. Process/Aggregate Data (In Worker Memory)
   │
   └─ Calculate: count, avg, max, min, percentiles, etc.
      └─ Group by: method, statusCode, screenName, etc.

5. Insert Aggregated Results into Database
   │
   └─ Database INSERT INTO ApiTraceAggregate 
      VALUES (aggregated data)

6. Update Job Status
   │
   ├─ Mark job complete in Redis
   └─ Update last processed time in Database

7. Loop Back to Step 2 (Get Next Job)
```

---

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE DATA FLOW                        │
└─────────────────────────────────────────────────────────────┘

Vercel Cron Job (Every Hour)
         │
         │ 1. Enqueue job
         ▼
┌─────────────────┐
│  Upstash Redis  │ ← Stores job: { projectId, startTime, endTime }
│     (Queue)     │
└────────┬────────┘
         │
         │ 2. Worker gets job
         ▼
┌─────────────────┐
│  Worker Service │
│   (Railway)     │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌──────────────┐   ┌──────────────────┐
│   Redis      │   │   Database       │
│  (Get Job)   │   │  (Fetch Data)    │
└──────────────┘   └────────┬─────────┘
                            │
                            │ 3. Query: SELECT * FROM ApiTrace
                            │    WHERE projectId = 'proj_123'
                            │    AND timestamp > startTime
                            │
                            ▼
                    ┌──────────────────┐
                    │  Raw Data        │
                    │  (100K rows)     │
                    └────────┬─────────┘
                             │
                             │ 4. Process in batches (10K each)
                             │    Aggregate in worker memory
                             ▼
                    ┌──────────────────┐
                    │  Aggregated Data │
                    │  (count, avg, etc)│
                    └────────┬─────────┘
                             │
                             │ 5. INSERT INTO ApiTraceAggregate
                             ▼
                    ┌──────────────────┐
                    │   Database       │
                    │  (Insert Agg)    │
                    └──────────────────┘
```

---

### Example Worker Code

```typescript
// worker.ts (Runs on Railway/Render)
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

// 1. Connect to Redis (for jobs)
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

// 2. Connect to Database (for data)
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Same database as Vercel
    },
  },
});

// 3. Create Worker
const worker = new Worker(
  'aggregation',
  async (job) => {
    const { projectId, startTime, endTime, granularity } = job.data;
    
    console.log(`Processing job for project: ${projectId}`);
    
    // 4. FETCH RAW DATA FROM DATABASE
    const traces = await prisma.apiTrace.findMany({
      where: {
        projectId,
        timestamp: {
          gte: new Date(startTime),
          lt: new Date(endTime)
        }
      },
      take: 10000, // Batch size
      orderBy: { timestamp: 'asc' }
    });
    
    console.log(`Fetched ${traces.length} traces from database`);
    
    // 5. AGGREGATE DATA (In worker memory)
    const aggregates = aggregateTraces(traces, granularity);
    // Returns: { method: 'GET', count: 5000, avgDuration: 120, ... }
    
    // 6. INSERT AGGREGATES INTO DATABASE
    for (const agg of aggregates) {
      await prisma.apiTraceAggregate.upsert({
        where: {
          projectId_period_granularity_method: {
            projectId,
            period: agg.period,
            granularity,
            method: agg.method
          }
        },
        update: {
          count: agg.count,
          durationAvg: agg.avgDuration,
          // ... other metrics
        },
        create: {
          projectId,
          period: agg.period,
          granularity,
          method: agg.method,
          count: agg.count,
          durationAvg: agg.avgDuration,
          // ... other metrics
        }
      });
    }
    
    console.log(`Inserted ${aggregates.length} aggregates into database`);
    
    // 7. UPDATE LAST PROCESSED TIME IN DATABASE
    await prisma.projectAggregationState.upsert({
      where: { projectId },
      update: {
        lastHourlyAgg: new Date(endTime)
      },
      create: {
        projectId,
        lastHourlyAgg: new Date(endTime)
      }
    });
    
    console.log(`Job completed for project: ${projectId}`);
  },
  { connection: redis, concurrency: 5 } // Process 5 jobs in parallel
);

// Worker runs continuously, waiting for jobs
console.log('Worker started, waiting for jobs...');
```

---

### Summary: What the Worker Does

**The worker is essentially a background service that:**

1. ✅ **Gets work from Redis** (queue) - "What should I process next?"
2. ✅ **Fetches data from your database** - "Get me the raw data to aggregate"
3. ✅ **Processes/aggregates it** - "Calculate counts, averages, etc."
4. ✅ **Saves results back to your database** - "Store the aggregated results"
5. ✅ **Repeats** - "Get next job and do it again"

**Key Points:**
- Worker needs access to **both** Redis and Database
- Worker uses the **same database** that Vercel uses (shared connection)
- Processing happens **in worker memory** (aggregation calculations)
- Results are **saved to database** (aggregate tables)
- Worker runs **continuously** (always waiting for new jobs)

---

### Database Aggregate Functions vs Cron Jobs

#### Database Aggregate Functions (Materialized Views / Functions)

**What They Are:**
- PostgreSQL native features (materialized views, stored procedures, functions)
- Run directly in the database engine
- Can be refreshed on-demand or via triggers

**Pros:**
- ✅ Very fast (runs in database, no network overhead)
- ✅ Atomic operations (ACID compliance)
- ✅ Can use database indexes efficiently
- ✅ No external dependencies
- ✅ Can be triggered by database events

**Cons:**
- ❌ Limited to SQL capabilities
- ❌ Harder to debug and monitor
- ❌ Less flexible for complex business logic
- ❌ Can lock tables during refresh (for materialized views)
- ❌ Not ideal for very large datasets (can timeout)

**Best For:**
- Small to medium datasets (< 10M rows)
- Simple aggregations
- When you need real-time or near-real-time updates
- When you want to minimize external dependencies

**Example:**
```sql
-- Materialized View
CREATE MATERIALIZED VIEW api_trace_hourly_agg AS
SELECT 
  project_id,
  DATE_TRUNC('hour', timestamp) as period,
  method,
  COUNT(*) as count,
  AVG(duration) as avg_duration
FROM api_trace
GROUP BY project_id, DATE_TRUNC('hour', timestamp), method;

-- Refresh (can be slow for large datasets)
REFRESH MATERIALIZED VIEW CONCURRENTLY api_trace_hourly_agg;
```

---

#### Cron Jobs (Application-Level Aggregation)

**What They Are:**
- Scheduled tasks that run at specific intervals
- Run application code (TypeScript/JavaScript) that queries database
- Process data in batches and insert into aggregate tables

**Pros:**
- ✅ More flexible (can use complex business logic)
- ✅ Better error handling and retry logic
- ✅ Can process in chunks/batches (avoid timeouts)
- ✅ Better monitoring and logging
- ✅ Can distribute load across multiple workers
- ✅ Can pause/resume processing

**Cons:**
- ❌ Network overhead (application ↔ database)
- ❌ More complex setup
- ❌ Requires external scheduling system
- ❌ Can be slower for very large datasets (if not optimized)

**Best For:**
- Large datasets (> 10M rows)
- Complex aggregations with business logic
- When you need fine-grained control
- When you need to scale horizontally
- When you need better observability

**Example:**
```typescript
// Cron job that processes in batches
async function aggregateHourly() {
  const batchSize = 10000;
  let offset = 0;
  
  while (true) {
    const traces = await prisma.apiTrace.findMany({
      where: { timestamp: { gte: lastHour } },
      take: batchSize,
      skip: offset
    });
    
    if (traces.length === 0) break;
    
    // Process and insert aggregates
    await processBatch(traces);
    offset += batchSize;
  }
}
```

---

### Large-Scale Considerations

#### Why Queues Are Essential for Large Scale

**Problem with Direct Cron Jobs:**
- Vercel functions have timeout limits (60s Hobby, 300s Pro)
- Processing millions of rows can take hours
- Single function can't handle large datasets
- No way to resume if function fails mid-process

**Solution: Queue-Based Processing**
- Break work into small jobs
- Process jobs in parallel
- Retry failed jobs automatically
- Scale horizontally
- Monitor progress

---

### Local Development (Queue-Based)

#### Architecture Overview

**Local Setup Components:**
1. **Redis** → Runs in Docker container (job queue)
2. **Node-cron** → Scheduler that triggers enqueue (like Vercel Cron)
3. **Worker Process** → Separate Node.js process that processes jobs
4. **Database** → Local PostgreSQL (same as production, but local)

---

#### Step 1: Setup Redis in Docker

**Install Redis as Docker Container:**
```bash
# Start Redis container
docker run -d \
  --name redis-aggregation \
  -p 6379:6379 \
  redis:alpine

# Verify Redis is running
docker ps | grep redis
# Should show: redis-aggregation container running

# Test Redis connection
docker exec -it redis-aggregation redis-cli ping
# Should return: PONG
```

**Or use Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

```bash
docker-compose up -d redis
```

---

#### Step 2: Install Dependencies

```bash
pnpm add bullmq ioredis node-cron
pnpm add -D @types/node-cron
```

---

#### Step 3: Create Queue and Worker

**Queue Setup:**
```typescript
// lib/aggregation/queue.ts
import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Connect to Redis (Docker container)
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD, // Optional
});

// Create queue
export const aggregationQueue = new Queue('aggregation', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});
```

**Worker Setup (Separate Process):**
```typescript
// scripts/workers/aggregation-worker.ts
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

// Connect to Redis (same as queue)
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Connect to Database (same as your app)
const prisma = new PrismaClient();

// Create Worker
const worker = new Worker(
  'aggregation',
  async (job) => {
    const { projectId, startTime, endTime, granularity } = job.data;
    
    console.log(`[Worker] Processing job for project: ${projectId}`);
    
    // Fetch raw data from database
    const batchSize = 10000;
    let offset = 0;
    let totalProcessed = 0;
    
    while (true) {
      const traces = await prisma.apiTrace.findMany({
        where: {
          projectId,
          timestamp: {
            gte: new Date(startTime),
            lt: new Date(endTime)
          }
        },
        take: batchSize,
        skip: offset,
        orderBy: { timestamp: 'asc' }
      });
      
      if (traces.length === 0) break;
      
      // Aggregate batch
      const aggregates = aggregateTraces(traces, granularity);
      
      // Insert aggregates into database
      for (const agg of aggregates) {
        await prisma.apiTraceAggregate.upsert({
          where: {
            projectId_period_granularity_method: {
              projectId,
              period: agg.period,
              granularity,
              method: agg.method
            }
          },
          update: {
            count: agg.count,
            durationAvg: agg.avgDuration,
            // ... other metrics
          },
          create: {
            projectId,
            period: agg.period,
            granularity,
            method: agg.method,
            count: agg.count,
            durationAvg: agg.avgDuration,
            // ... other metrics
          }
        });
      }
      
      totalProcessed += traces.length;
      await job.updateProgress((totalProcessed / 100000) * 100); // Estimate
      
      offset += batchSize;
    }
    
    // Update last processed time
    await prisma.projectAggregationState.upsert({
      where: { projectId },
      update: { lastHourlyAgg: new Date(endTime) },
      create: { projectId, lastHourlyAgg: new Date(endTime) }
    });
    
    console.log(`[Worker] Completed job for project: ${projectId}`);
  },
  { 
    connection: redis, 
    concurrency: 5 // Process 5 jobs in parallel
  }
);

// Worker event handlers
worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('[Worker] Error:', err);
});

console.log('[Worker] Started, waiting for jobs...');
```

---

#### Step 4: Create Enqueue Function

**Enqueue Function:**
```typescript
// lib/aggregation/enqueue.ts
import { aggregationQueue } from './queue';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function enqueueHourlyAggregation() {
  console.log('[Enqueue] Starting hourly aggregation enqueue...');
  
  // Get all projects
  const projects = await prisma.project.findMany({
    select: { id: true }
  });
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const now = new Date();
  
  // Enqueue job for each project
  const jobs = [];
  for (const project of projects) {
    const job = await aggregationQueue.add('hourly-aggregate', {
      projectId: project.id,
      startTime: oneHourAgo.toISOString(),
      endTime: now.toISOString(),
      granularity: 'hourly'
    });
    jobs.push(job);
  }
  
  console.log(`[Enqueue] Enqueued ${jobs.length} jobs`);
  return { enqueued: jobs.length };
}
```

---

#### Step 5: Setup Node-Cron (Scheduler)

**Node-Cron Setup:**
```typescript
// scripts/cron/scheduler.ts
import cron from 'node-cron';
import { enqueueHourlyAggregation } from '@/lib/aggregation/enqueue';

// Run every hour at minute 0 (like Vercel Cron)
cron.schedule('0 * * * *', async () => {
  console.log('[Cron] Triggering hourly aggregation...');
  try {
    await enqueueHourlyAggregation();
    console.log('[Cron] Hourly aggregation enqueued successfully');
  } catch (error) {
    console.error('[Cron] Error enqueueing aggregation:', error);
  }
});

// Run daily aggregation at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron] Triggering daily aggregation...');
  // Similar to hourly, but with daily granularity
});

console.log('[Cron] Scheduler started');
console.log('[Cron] Hourly aggregation: Every hour at :00');
console.log('[Cron] Daily aggregation: Every day at 00:00');
```

---

#### Step 6: Running Locally

**You need 3 separate processes running:**

**Terminal 1: Start Redis (if not using Docker Compose)**
```bash
docker run -d --name redis-aggregation -p 6379:6379 redis:alpine
# Or if already running:
docker start redis-aggregation
```

**Terminal 2: Start Worker Process**
```bash
# Using tsx (for TypeScript)
pnpm tsx scripts/workers/aggregation-worker.ts

# Or compile and run
pnpm build
node dist/scripts/workers/aggregation-worker.js

# Or add to package.json:
# "scripts": {
#   "worker:aggregation": "tsx scripts/workers/aggregation-worker.ts"
# }
pnpm worker:aggregation
```

**Terminal 3: Start Cron Scheduler**
```bash
# Using tsx
pnpm tsx scripts/cron/scheduler.ts

# Or add to package.json:
# "scripts": {
#   "cron:scheduler": "tsx scripts/cron/scheduler.ts"
# }
pnpm cron:scheduler
```

**Terminal 4: Your Next.js App (optional, for testing)**
```bash
pnpm dev
```

---

#### Complete Local Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT SETUP                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   Docker        │
│   Redis         │ ← Container running on port 6379
│   (Queue)       │
└────────┬────────┘
         │
         │ Jobs stored here
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐
│  Node-Cron       │              │  Worker Process  │
│  (Scheduler)     │              │  (Separate)      │
│                  │              │                  │
│  Every hour:     │              │  - Gets jobs     │
│  - Enqueue jobs  │─────────────▶│  - Processes     │
│                  │              │  - Saves results │
└──────────────────┘              └────────┬─────────┘
                                           │
                                           │ Reads/Writes
                                           ▼
                                  ┌──────────────────┐
                                  │   PostgreSQL     │
                                  │   (Local DB)     │
                                  │                  │
                                  │  - Raw data      │
                                  │  - Aggregates    │
                                  └──────────────────┘
```

---

#### Key Differences: Local vs Production

| Component | Local Development | Production (Vercel) |
|------------|-------------------|---------------------|
| **Redis** | Docker container | Upstash Redis (serverless) |
| **Scheduler** | Node-cron (separate process) | Vercel Cron (built-in) |
| **Worker** | Separate Node.js process | External service (Railway/Render) |
| **Database** | Local PostgreSQL | Production PostgreSQL (Supabase) |
| **Setup** | Manual (3 terminals) | Automated (deployments) |

---

#### Testing Locally

**Manual Test (without waiting for cron):**
```typescript
// scripts/test-enqueue.ts
import { enqueueHourlyAggregation } from '@/lib/aggregation/enqueue';

// Manually trigger enqueue
enqueueHourlyAggregation()
  .then(() => {
    console.log('✅ Enqueue test successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Enqueue test failed:', error);
    process.exit(1);
  });
```

```bash
pnpm tsx scripts/test-enqueue.ts
```

**Check Queue Status:**
```typescript
// scripts/check-queue.ts
import { aggregationQueue } from '@/lib/aggregation/queue';

async function checkQueue() {
  const waiting = await aggregationQueue.getWaiting();
  const active = await aggregationQueue.getActive();
  const completed = await aggregationQueue.getCompleted();
  const failed = await aggregationQueue.getFailed();
  
  console.log('Queue Status:');
  console.log(`  Waiting: ${waiting.length}`);
  console.log(`  Active: ${active.length}`);
  console.log(`  Completed: ${completed.length}`);
  console.log(`  Failed: ${failed.length}`);
}

checkQueue();
```

```bash
pnpm tsx scripts/check-queue.ts
```

---

#### Option 2: PostgreSQL LISTEN/NOTIFY (Lightweight)

**For smaller scale or when you don't want Redis:**

```sql
-- Database function that notifies when aggregation needed
CREATE OR REPLACE FUNCTION notify_aggregation_needed()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('aggregation_needed', json_build_object(
    'projectId', NEW.project_id,
    'timestamp', NEW.timestamp
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on insert
CREATE TRIGGER api_trace_aggregation_trigger
AFTER INSERT ON "ApiTrace"
FOR EACH ROW
EXECUTE FUNCTION notify_aggregation_needed();
```

**Application Listener:**
```typescript
// lib/aggregation/listener.ts
import { Client } from 'pg';

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

client.on('notification', async (msg) => {
  if (msg.channel === 'aggregation_needed') {
    const data = JSON.parse(msg.payload);
    // Enqueue aggregation job
    await aggregationQueue.add('aggregate', data);
  }
});

await client.query('LISTEN aggregation_needed');
```

---

### Vercel Deployment (Queue-Based)

#### Option 1: Vercel Cron + External Queue Service

**Recommended: Upstash Redis (Serverless Redis)**

**Setup:**
```bash
pnpm add @upstash/redis @upstash/queue
```

**Vercel Cron Job (Enqueues):**
```typescript
// api/cron/aggregate-hourly.ts
import { Queue } from '@upstash/queue';

const queue = new Queue({
  url: process.env.UPSTASH_QUEUE_URL!,
  token: process.env.UPSTASH_QUEUE_TOKEN!,
});

export default async function handler(req: Request) {
  const projects = await prisma.project.findMany({ select: { id: true } });
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const now = new Date();
  
  // Enqueue jobs
  for (const project of projects) {
    await queue.add({
      projectId: project.id,
      startTime: oneHourAgo.toISOString(),
      endTime: now.toISOString(),
      granularity: 'hourly'
    });
  }
  
  return Response.json({ enqueued: projects.length });
}
```

**Worker API Route (Processes Jobs):**
```typescript
// api/workers/aggregate.ts
import { Queue } from '@upstash/queue';

const queue = new Queue({
  url: process.env.UPSTASH_QUEUE_URL!,
  token: process.env.UPSTASH_QUEUE_TOKEN!,
});

export async function POST(req: Request) {
  // Get job from queue
  const job = await queue.receive();
  
  if (!job) {
    return Response.json({ message: 'No jobs available' });
  }
  
  try {
    const { projectId, startTime, endTime, granularity } = job.data;
    
    // Process in batches
    await processAggregation(projectId, startTime, endTime, granularity);
    
    // Acknowledge job
    await queue.ack(job.id);
    
    return Response.json({ success: true });
  } catch (error) {
    // Retry job
    await queue.nack(job.id);
    throw error;
  }
}
```

**Vercel Cron Configuration:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/aggregate-hourly",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/aggregate-daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**External Worker (Separate Service):**
- Deploy worker as separate service (Railway, Render, etc.)
- Worker polls queue and processes jobs
- Can scale horizontally (multiple workers)

---

#### Option 2: Vercel Cron + Database Queue Table

**For when you can't use external queue service:**

```prisma
// Add to schema.prisma
model AggregationJob {
  id          String   @id @default(cuid())
  projectId   String
  startTime   DateTime
  endTime     DateTime
  granularity String   // "hourly" | "daily"
  status      String   @default("pending") // "pending" | "processing" | "completed" | "failed"
  attempts    Int      @default(0)
  error       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status, createdAt])
  @@index([projectId, status])
}
```

**Cron Job (Creates Jobs):**
```typescript
// api/cron/aggregate-hourly.ts
export default async function handler() {
  const projects = await prisma.project.findMany({ select: { id: true } });
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const now = new Date();
  
  // Create jobs
  await prisma.aggregationJob.createMany({
    data: projects.map(project => ({
      projectId: project.id,
      startTime: oneHourAgo,
      endTime: now,
      granularity: 'hourly',
      status: 'pending'
    }))
  });
  
  return Response.json({ created: projects.length });
}
```

**Worker API Route (Processes Jobs):**
```typescript
// api/workers/aggregate.ts
export async function POST(req: Request) {
  // Get pending job
  const job = await prisma.aggregationJob.findFirst({
    where: { status: 'pending' },
    orderBy: { createdAt: 'asc' }
  });
  
  if (!job) {
    return Response.json({ message: 'No jobs available' });
  }
  
  // Mark as processing
  await prisma.aggregationJob.update({
    where: { id: job.id },
    data: { status: 'processing', attempts: { increment: 1 } }
  });
  
  try {
    // Process in batches (handle timeout)
    await processAggregationInBatches(job);
    
    // Mark as completed
    await prisma.aggregationJob.update({
      where: { id: job.id },
      data: { status: 'completed' }
    });
    
    return Response.json({ success: true });
  } catch (error) {
    // Mark as failed or retry
    await prisma.aggregationJob.update({
      where: { id: job.id },
      data: {
        status: job.attempts >= 3 ? 'failed' : 'pending',
        error: error.message
      }
    });
    
    throw error;
  }
}
```

**Continuous Processing:**
- Use Vercel Cron to call worker every minute
- Worker processes one job at a time
- If job is large, worker processes one batch and re-enqueues itself

---

### Large-Scale Optimization Strategies

#### 1. Batch Processing

**Problem**: Processing 10M rows in one query times out

**Solution**: Process in batches
```typescript
async function processAggregationInBatches(
  projectId: string,
  startTime: Date,
  endTime: Date,
  granularity: 'hourly' | 'daily'
) {
  const batchSize = 10000;
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const traces = await prisma.apiTrace.findMany({
      where: {
        projectId,
        timestamp: { gte: startTime, lt: endTime }
      },
      take: batchSize,
      skip: offset,
      orderBy: { timestamp: 'asc' },
      select: {
        // Only select needed fields
        method: true,
        statusCode: true,
        duration: true,
        cost: true,
        screenName: true,
        timestamp: true
      }
    });
    
    if (traces.length === 0) {
      hasMore = false;
      break;
    }
    
    // Aggregate this batch
    const aggregates = computeAggregates(traces, granularity);
    
    // Upsert aggregates (merge with existing)
    await upsertAggregates(aggregates);
    
    offset += batchSize;
    
    // Yield to avoid timeout (for Vercel)
    if (offset % 50000 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
```

---

#### 2. Parallel Processing

**Problem**: Processing projects sequentially is slow

**Solution**: Process multiple projects in parallel
```typescript
// Process 5 projects at a time
const concurrency = 5;
const projects = await getProjectsToAggregate();

for (let i = 0; i < projects.length; i += concurrency) {
  const batch = projects.slice(i, i + concurrency);
  
  await Promise.all(
    batch.map(project => 
      aggregationQueue.add('aggregate', {
        projectId: project.id,
        // ...
      })
    )
  );
}
```

---

#### 3. Incremental Aggregation

**Problem**: Reprocessing entire dataset is wasteful

**Solution**: Only process new data
```typescript
// Track last aggregation time per project
model ProjectAggregationState {
  id                String   @id @default(cuid())
  projectId         String   @unique
  lastHourlyAgg     DateTime? // Last time hourly aggregation ran
  lastDailyAgg      DateTime? // Last time daily aggregation ran
  lastProcessedId   String?   // Last processed trace ID (for incremental)
}

// Only process new data
async function getNewTraces(projectId: string, granularity: string) {
  const state = await prisma.projectAggregationState.findUnique({
    where: { projectId }
  });
  
  const lastProcessed = state?.lastHourlyAgg || new Date(0);
  
  return prisma.apiTrace.findMany({
    where: {
      projectId,
      timestamp: { gt: lastProcessed },
      // Only process completed periods (not current hour/day)
      timestamp: { lt: getPeriodStart(new Date(), granularity) }
    }
  });
}
```

---

#### 4. Database-Level Optimization

**Use PostgreSQL Window Functions:**
```sql
-- More efficient than application-level aggregation
INSERT INTO "ApiTraceAggregate" (
  project_id, period, granularity, method, count, duration_avg
)
SELECT 
  project_id,
  DATE_TRUNC('hour', timestamp) as period,
  'hourly' as granularity,
  method,
  COUNT(*) as count,
  AVG(duration) as duration_avg
FROM "ApiTrace"
WHERE timestamp >= $1 AND timestamp < $2
GROUP BY project_id, DATE_TRUNC('hour', timestamp), method
ON CONFLICT (project_id, period, granularity, method, ...)
DO UPDATE SET
  count = EXCLUDED.count,
  duration_avg = EXCLUDED.duration_avg;
```

---

#### 5. Monitoring & Observability

**Track Progress:**
```typescript
// Update job progress
await job.updateProgress({
  processed: offset,
  total: totalRows,
  percentage: (offset / totalRows) * 100,
  currentBatch: batchNumber
});

// Log metrics
console.log({
  projectId,
  rowsProcessed: offset,
  timeElapsed: Date.now() - startTime,
  rowsPerSecond: offset / ((Date.now() - startTime) / 1000)
});
```

---

### Comparison: Database Functions vs Cron Jobs vs Queues

| Feature | DB Functions | Cron Jobs | Queues |
|---------|-------------|-----------|--------|
| **Scalability** | Limited | Medium | High |
| **Large Datasets** | ❌ Can timeout | ⚠️ Can timeout | ✅ Handles well |
| **Error Handling** | Basic | Good | Excellent |
| **Retry Logic** | Manual | Manual | Built-in |
| **Monitoring** | Limited | Good | Excellent |
| **Complexity** | Low | Medium | High |
| **Best For** | Small datasets | Medium datasets | Large datasets |

---

### Recommended Approach for Large Scale

**For Production (Vercel):**
1. ✅ **Use Queue Service** (Upstash Redis/Queue)
2. ✅ **Vercel Cron** to enqueue jobs (every hour)
3. ✅ **External Worker Service** (Railway/Render) to process jobs
4. ✅ **Batch Processing** (10K rows per batch)
5. ✅ **Incremental Aggregation** (only new data)
6. ✅ **Parallel Processing** (multiple projects simultaneously)

**For Local Development:**
1. ✅ **BullMQ + Redis** (Docker)
2. ✅ **Node-cron** to trigger enqueue
3. ✅ **Worker process** to consume jobs
4. ✅ Same batch/incremental strategies

---

### Cost Considerations

**Vercel:**
- Cron jobs: Free (Hobby) / Included (Pro)
- Function execution time: 60s (Hobby) / 300s (Pro)
- **Recommendation**: Use external worker for processing

**Upstash Redis:**
- Free tier: 10K commands/day
- Pay-as-you-go: $0.20 per 100K commands
- **Cost**: ~$5-20/month for moderate usage

**External Worker (Railway/Render):**
- Free tier available
- Paid: $5-20/month
- **Recommendation**: Use for processing jobs

---

## 📋 Implementation Steps (After UI Design)

### Phase 1: Schema Design ✅ (Waiting for UI)
- [ ] Review UI design requirements
- [ ] Finalize aggregate table schemas
- [ ] Create Prisma models
- [ ] Create migration files

### Phase 2: Aggregation Logic
- [ ] Create aggregation functions
- [ ] Implement hourly aggregation
- [ ] Implement daily aggregation
- [ ] Handle edge cases (nulls, missing data)

### Phase 3: Scheduled Jobs
- [ ] Set up local cron jobs
- [ ] Set up Vercel cron jobs
- [ ] Add error handling and retries
- [ ] Add monitoring/logging

### Phase 4: Dashboard Integration
- [ ] Update API endpoints to use aggregates
- [ ] Add fallback to raw tables (if aggregates missing)
- [ ] Update frontend queries
- [ ] Test performance improvements

### Phase 5: Migration & Backfill
- [ ] Backfill historical aggregates
- [ ] Verify data accuracy
- [ ] Monitor query performance
- [ ] Deploy to production

---

## 🔄 Aggregation Strategy

### Hourly Aggregation
- **When**: Every hour at :00 minutes
- **Source**: Raw tables from last hour
- **Granularity**: 1 hour periods
- **Retention**: Keep for last 30 days

### Daily Aggregation
- **When**: Daily at 00:00 UTC
- **Source**: Raw tables from previous day OR roll up hourly aggregates
- **Granularity**: 1 day periods
- **Retention**: Keep for last 365 days

### Incremental Updates
- Process only new data since last aggregation
- Use `timestamp > lastAggregationTime` filter
- Avoid reprocessing entire dataset

---

## 📊 Example Queries

### Current Query (Slow - Raw Table)
```sql
SELECT 
  COUNT(*) as total,
  AVG(duration) as avg_duration,
  MAX(duration) as max_duration,
  SUM(cost) as total_cost
FROM "ApiTrace"
WHERE "projectId" = 'xxx'
  AND "timestamp" >= NOW() - INTERVAL '7 days'
  AND "method" = 'GET'
GROUP BY DATE_TRUNC('day', "timestamp")
```

### New Query (Fast - Aggregate Table)
```sql
SELECT 
  SUM(count) as total,
  AVG(durationAvg) as avg_duration,
  MAX(durationMax) as max_duration,
  SUM(costSum) as total_cost
FROM "ApiTraceAggregate"
WHERE "projectId" = 'xxx'
  AND "granularity" = 'daily'
  AND "period" >= NOW() - INTERVAL '7 days'
  AND "method" = 'GET'
GROUP BY "period"
```

---

## ⚠️ Considerations

### Dimension Explosion
- **Problem**: Too many dimension combinations = too many rows
- **Solution**: Only aggregate commonly queried dimensions
- **Strategy**: Start with essential dimensions, add more as needed

### Null Handling
- **Problem**: NULL dimensions create separate aggregate rows
- **Solution**: Use COALESCE or default values for grouping

### Percentile Calculation
- **Problem**: p50/p95 require storing all values or approximation
- **Solution**: Use PostgreSQL's `percentile_cont` or approximate algorithms
- **Alternative**: Store histogram data for percentile calculation

### Data Freshness
- **Problem**: Aggregates lag behind real-time data
- **Solution**: 
  - Use aggregates for historical data (>1 hour old)
  - Use raw tables for recent data (<1 hour)
  - Or: Real-time aggregation for recent data

---

## 🎨 Waiting for UI Design

**Next Steps:**
1. ✅ Review UI design requirements
2. ✅ Understand which metrics are displayed
3. ✅ Understand which dimensions are filtered/grouped
4. ✅ Finalize aggregate schema based on UI needs
5. ✅ Implement aggregation logic
6. ✅ Update dashboard queries

**Questions to Answer from UI Design:**
- Which metrics are shown on dashboards?
- Which time ranges are queried? (last hour, day, week, month?)
- Which dimensions are used for filtering/grouping?
- Are there any custom aggregations needed?
- What's the expected data freshness? (real-time vs. 1-hour delay)

---

## 📈 Large-Scale Architecture Summary

### Production Architecture (Vercel) - Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION FLOW (Vercel)                     │
└─────────────────────────────────────────────────────────────────┘

Step 1: Vercel Cron Job (Every Hour)
┌─────────────────────┐
│  Vercel Cron Job    │ ← Runs automatically every hour
│  /api/cron/agg-hour │ ← Triggered by Vercel
└──────────┬──────────┘
           │
           │ 1. Get all projects
           ▼
┌─────────────────────┐
│   Get Projects      │
│   (from database)   │
└──────────┬──────────┘
           │
           │ 2. Create jobs for each project
           ▼
┌─────────────────────┐
│   Enqueue Jobs      │
│   (to Upstash Queue)│
└──────────┬──────────┘
           │
           │ 3. Jobs stored in queue
           ▼
┌─────────────────────────────────────────────────────────────┐
│              Upstash Redis/Queue (Serverless)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Job: P1  │  │ Job: P2  │  │ Job: P3  │  │ Job: P4  │   │
│  │ Hourly   │  │ Hourly   │  │ Hourly   │  │ Hourly   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
           │
           │ 4. Workers consume jobs
           ├─────────────────┬─────────────────┐
           ▼                 ▼                 ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Worker Service  │  │  Worker Service  │  │  Worker Service  │
│   (Railway)      │  │   (Railway)      │  │   (Railway)      │
│                  │  │                  │  │                  │
│  Processing:     │  │  Processing:     │  │  Processing:     │
│  Project 1       │  │  Project 2       │  │  Project 3       │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         │ 5. Process in batches                     │
         │    (10K rows per batch)                   │
         ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Batch Processing                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Batch 1  │→ │ Batch 2  │→ │ Batch 3  │→ ...            │
│  │ 10K rows │  │ 10K rows │  │ 10K rows │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
         │                     │                     │
         │ 6. Aggregate and insert                     │
         ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Supabase)                 │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         ApiTraceAggregate Table                      │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┐     │  │
│  │  │ Project  │  Period  │  Method  │  Count   │     │  │
│  │  ├──────────┼──────────┼──────────┼──────────┤     │  │
│  │  │   P1     │ 2024-01  │   GET    │  5000    │     │  │
│  │  │   P2     │ 2024-01  │   POST   │  3000    │     │  │
│  │  └──────────┴──────────┴──────────┴──────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Key Points:
✅ Vercel Cron enqueues jobs (no processing)
✅ Upstash Queue stores jobs (serverless, no server)
✅ External Workers process jobs (can scale horizontally)
✅ Batch processing prevents timeouts
✅ Incremental aggregation (only new data)
```

---

### Local Development Architecture - Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│              LOCAL DEVELOPMENT FLOW                             │
└─────────────────────────────────────────────────────────────────┘

Step 1: Node-Cron Scheduler (Runs Continuously)
┌─────────────────────┐
│    Node-Cron        │ ← Separate Node.js process
│  (Scheduler)        │ ← Runs: pnpm tsx scripts/cron/scheduler.ts
│                    │ ← Scheduled: Every hour at :00
└──────────┬──────────┘
           │
           │ 1. Trigger enqueue function (every hour)
           ▼
┌─────────────────────┐
│   Enqueue Function  │
│   (lib/aggregation/ │
│    enqueue.ts)      │
│                    │
│  - Get all projects│
│  - Create jobs     │
└──────────┬──────────┘
           │
           │ 2. Add jobs to queue
           ▼
┌─────────────────────────────────────────────────────────────┐
│         Redis (Docker Container)                             │
│         docker run -d -p 6379:6379 redis:alpine            │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Job: P1  │  │ Job: P2  │  │ Job: P3  │  │ Job: P4  │   │
│  │ Hourly   │  │ Hourly   │  │ Hourly   │  │ Hourly   │   │
│  │ {        │  │ {        │  │ {        │  │ {        │   │
│  │  project │  │  project │  │  project │  │  project │   │
│  │  start   │  │  start   │  │  start   │  │  start   │   │
│  │  end     │  │  end     │  │  end     │  │  end     │   │
│  │ }        │  │ }        │  │ }        │  │ }        │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
           │
           │ 3. Worker processes consume jobs
           │    (Runs: pnpm tsx scripts/workers/aggregation-worker.ts)
           ├─────────────────┬─────────────────┐
           ▼                 ▼                 ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Worker Process  │  │  Worker Process  │  │  Worker Process  │
│   (Separate)     │  │   (Separate)     │  │   (Separate)     │
│   Terminal 2     │  │   (Optional)     │  │   (Optional)     │
│                  │  │                  │  │                  │
│  1. Get job      │  │  1. Get job      │  │  1. Get job      │
│     from Redis   │  │     from Redis   │  │     from Redis   │
│                  │  │                  │  │                  │
│  2. Fetch data   │  │  2. Fetch data   │  │  2. Fetch data   │
│     from DB      │  │     from DB      │  │     from DB      │
│                  │  │                  │  │                  │
│  3. Aggregate   │  │  3. Aggregate   │  │  3. Aggregate   │
│     (in memory)  │  │     (in memory)  │  │     (in memory)  │
│                  │  │                  │  │                  │
│  4. Save to DB   │  │  4. Save to DB   │  │  4. Save to DB   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         │ 4. Process in batches (10K rows each)    │
         │    - Query database                       │
         │    - Aggregate in worker memory           │
         │    - Insert aggregates                    │
         ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Local PostgreSQL Database                            │
│         (Same as your app uses)                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Raw Tables (Source Data)                      │  │
│  │  ApiTrace, Log, Crash, Session                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Aggregate Tables (Results)                     │  │
│  │  ┌──────────┬──────────┬──────────┬──────────┐     │  │
│  │  │ Project  │  Period  │  Method  │  Count   │     │  │
│  │  ├──────────┼──────────┼──────────┼──────────┤     │  │
│  │  │   P1     │ 2024-01  │   GET    │  5000    │     │  │
│  │  │   P2     │ 2024-01  │   POST   │  3000    │     │  │
│  │  └──────────┴──────────┴──────────┴──────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

Key Points:
✅ Redis runs in Docker container (Terminal 1 or docker-compose)
✅ Node-cron runs as separate process (Terminal 3)
✅ Worker runs as separate Node.js process (Terminal 2)
✅ All connect to same Redis and Database
✅ Same batch/incremental strategies as production
```

---

### How to Run Everything Locally

**Complete Setup Instructions:**

1. **Start Redis (Terminal 1):**
   ```bash
   docker run -d --name redis-aggregation -p 6379:6379 redis:alpine
   # Or: docker-compose up -d redis
   ```

2. **Start Worker (Terminal 2):**
   ```bash
   pnpm tsx scripts/workers/aggregation-worker.ts
   # Worker will continuously wait for jobs
   ```

3. **Start Cron Scheduler (Terminal 3):**
   ```bash
   pnpm tsx scripts/cron/scheduler.ts
   # Cron will run every hour and enqueue jobs
   ```

4. **Optional: Start Next.js App (Terminal 4):**
   ```bash
   pnpm dev
   # Your dashboard/app runs here
   ```

**What Happens:**
- **Node-cron** (Terminal 3) runs every hour and calls `enqueueHourlyAggregation()`
- **Enqueue function** creates jobs and adds them to Redis queue
- **Worker** (Terminal 2) picks up jobs from Redis, processes them, saves to database
- **Database** stores both raw data and aggregates

---

### Detailed Flow: How a Single Job is Processed

```
┌─────────────────────────────────────────────────────────────────┐
│              SINGLE JOB PROCESSING FLOW                         │
└─────────────────────────────────────────────────────────────────┘

Job Data:
{
  projectId: "proj_123",
  startTime: "2024-01-01T10:00:00Z",
  endTime: "2024-01-01T11:00:00Z",
  granularity: "hourly"
}

┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Worker Picks Up Job                                      │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Worker gets job from queue
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Get Last Processed Time (Incremental)                    │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Query: SELECT lastHourlyAgg FROM ProjectAggregationState
         │        WHERE projectId = 'proj_123'
         │
         │ Result: lastHourlyAgg = "2024-01-01T09:00:00Z"
         │
         │ Only process: timestamp > "2024-01-01T09:00:00Z"
         │              AND timestamp < "2024-01-01T11:00:00Z"
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Process in Batches (10K rows per batch)                 │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Batch 1: Rows 1-10,000
         │   ├─ Query database (10K rows)
         │   ├─ Aggregate (count, avg, max, etc.)
         │   └─ Insert/Update aggregate table
         │
         │ Batch 2: Rows 10,001-20,000
         │   ├─ Query database (10K rows)
         │   ├─ Aggregate
         │   └─ Insert/Update aggregate table
         │
         │ Batch 3: Rows 20,001-30,000
         │   ...
         │
         │ Continue until no more rows
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Update Last Processed Time                              │
└─────────────────────────────────────────────────────────────────┘
         │
         │ UPDATE ProjectAggregationState
         │ SET lastHourlyAgg = "2024-01-01T11:00:00Z"
         │ WHERE projectId = 'proj_123'
         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Mark Job Complete                                        │
└─────────────────────────────────────────────────────────────────┘
         │
         │ Job status: "completed"
         │ Remove from queue
         ▼
         ✅ Done!
```

---

### Recommended Stack

**Production (Vercel):**
- **Queue**: Upstash Redis/Queue (serverless)
- **Enqueue**: Vercel Cron Jobs
- **Process**: External Worker Service (Railway/Render)
- **Strategy**: Batch processing + Incremental aggregation

**Local Development:**
- **Queue**: BullMQ + Redis (Docker)
- **Enqueue**: Node-cron
- **Process**: Worker process
- **Strategy**: Same as production

### Key Principles

1. **Never process entire dataset** - Use incremental aggregation
2. **Always batch** - Process 10K rows at a time
3. **Use queues** - For large-scale, queues are essential
4. **Monitor progress** - Track processing metrics
5. **Handle failures** - Retry logic and error handling
6. **Scale horizontally** - Multiple workers for parallel processing

### Comparison: Database Functions vs Cron Jobs vs Queues

| Feature | DB Functions | Cron Jobs | Queues |
|---------|-------------|-----------|--------|
| **Scalability** | Limited | Medium | High |
| **Large Datasets** | ❌ Can timeout | ⚠️ Can timeout | ✅ Handles well |
| **Error Handling** | Basic | Good | Excellent |
| **Retry Logic** | Manual | Manual | Built-in |
| **Monitoring** | Limited | Good | Excellent |
| **Complexity** | Low | Medium | High |
| **Best For** | Small datasets | Medium datasets | Large datasets |

---

**Status**: 🟡 **Waiting for UI Design** before finalizing schema and implementation.

