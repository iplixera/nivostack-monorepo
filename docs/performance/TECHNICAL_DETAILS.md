# Performance Optimization - Technical Details

**Last Updated**: January 2, 2025

## Issue 1: Devices Endpoint - Multiple Count Queries

### Current Implementation

**File**: `dashboard/src/app/api/devices/route.ts:389-448`

**Problem**: Running 9 separate database queries:
```typescript
const [devices, filteredCount, totalCount, androidCount, iosCount, todayCount, thisWeekCount, thisMonthCount, debugModeCount] = await Promise.all([
  prisma.device.findMany({ ... }),
  prisma.device.count({ where }),
  prisma.device.count({ where: { projectId } }),
  prisma.device.count({ where: { projectId, platform: 'android' } }),
  prisma.device.count({ where: { projectId, platform: 'ios' } }),
  prisma.device.count({ where: { projectId, createdAt: { gte: today } } }),
  prisma.device.count({ where: { projectId, createdAt: { gte: weekAgo } } }),
  prisma.device.count({ where: { projectId, createdAt: { gte: monthAgo } } }),
  prisma.device.count({ where: { projectId, debugModeEnabled: true } })
])
```

**Impact**: Each count query scans the table, causing significant load with large datasets.

### Proposed Solution

**Option 1: Single Aggregated Query (Recommended)**
```typescript
// Use raw SQL for better performance
const stats = await prisma.$queryRaw<Array<{
  total: bigint
  android: bigint
  ios: bigint
  today: bigint
  thisWeek: bigint
  thisMonth: bigint
  debugMode: bigint
}>>`
  SELECT
    COUNT(*) FILTER (WHERE "projectId" = ${projectId}) as total,
    COUNT(*) FILTER (WHERE "projectId" = ${projectId} AND platform = 'android') as android,
    COUNT(*) FILTER (WHERE "projectId" = ${projectId} AND platform = 'ios') as ios,
    COUNT(*) FILTER (WHERE "projectId" = ${projectId} AND "createdAt" >= CURRENT_DATE) as today,
    COUNT(*) FILTER (WHERE "projectId" = ${projectId} AND "createdAt" >= CURRENT_DATE - INTERVAL '7 days') as thisWeek,
    COUNT(*) FILTER (WHERE "projectId" = ${projectId} AND "createdAt" >= CURRENT_DATE - INTERVAL '30 days') as thisMonth,
    COUNT(*) FILTER (WHERE "projectId" = ${projectId} AND "debugModeEnabled" = true) as debugMode
  FROM "Device"
  WHERE "projectId" = ${projectId}
`
```

**Option 2: Materialized View**
Create a materialized view that refreshes periodically:
```sql
CREATE MATERIALIZED VIEW device_stats AS
SELECT
  "projectId",
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE platform = 'android') as android,
  COUNT(*) FILTER (WHERE platform = 'ios') as ios,
  COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE) as today,
  COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE - INTERVAL '7 days') as thisWeek,
  COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days') as thisMonth,
  COUNT(*) FILTER (WHERE "debugModeEnabled" = true) as debugMode
FROM "Device"
GROUP BY "projectId";

CREATE UNIQUE INDEX ON device_stats ("projectId");
```

### Required Indexes
```prisma
model Device {
  // ... existing fields
  
  @@index([projectId])
  @@index([projectId, platform])
  @@index([projectId, createdAt])
  @@index([projectId, debugModeEnabled])
}
```

---

## Issue 2: Projects Endpoint - N+1 Query Problem

### Current Implementation

**File**: `dashboard/src/app/api/projects/route.ts:53-72`

**Problem**: Fetching inviter details in a loop:
```typescript
for (const member of memberProjects) {
  if (member.invitedBy) {
    const inviter = await prisma.user.findUnique({
      where: { id: member.invitedBy },
      select: { id: true, name: true, email: true }
    })
    member.inviter = inviter
  }
}
```

**Impact**: If user is member of 10 projects, executes 10 separate queries.

### Proposed Solution

**Batch Fetch Inviters**:
```typescript
// Collect all unique inviter IDs
const inviterIds = memberProjects
  .map(m => m.invitedBy)
  .filter(Boolean) as string[]

// Batch fetch all inviters in one query
const inviters = await prisma.user.findMany({
  where: { id: { in: inviterIds } },
  select: { id: true, name: true, email: true }
})

// Create a map for O(1) lookup
const inviterMap = new Map(inviters.map(i => [i.id, i]))

// Associate inviters with members
for (const member of memberProjects) {
  member.inviter = member.invitedBy ? inviterMap.get(member.invitedBy) || null : null
}
```

**Performance Improvement**: 10 queries → 1 query

---

## Issue 3: Traces Endpoint - Inefficient Distinct Query

### Current Implementation

**File**: `dashboard/src/app/api/traces/route.ts:538-548`

**Problem**: 
```typescript
// Scans entire table for distinct screen names
const screenNames = await prisma.apiTrace.findMany({
  where: { projectId },
  select: { screenName: true },
  distinct: ['screenName']
})

// Always fetches devices, even when not needed
const devices = await prisma.device.findMany({
  where: { projectId },
  select: { id: true, deviceId: true, platform: true, model: true }
})
```

### Proposed Solution

**1. Add Index for Distinct Query**:
```prisma
model ApiTrace {
  // ... existing fields
  
  @@index([projectId, screenName])
}
```

**2. Conditional Device Fetching**:
```typescript
// Only fetch devices when groupByDevice is true
const devices = groupByDevice 
  ? await prisma.device.findMany({
      where: { projectId },
      select: { id: true, deviceId: true, platform: true, model: true }
    })
  : []

// Use GROUP BY for better performance
const screenNames = await prisma.$queryRaw<Array<{ screenName: string }>>`
  SELECT DISTINCT "screenName"
  FROM "ApiTrace"
  WHERE "projectId" = ${projectId}
    AND "screenName" IS NOT NULL
  ORDER BY "screenName"
`
```

**3. Cache Screen Names** (Future optimization):
```typescript
// Cache screen names per project with TTL
const cacheKey = `screenNames:${projectId}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

// ... fetch from database
await redis.setex(cacheKey, 300, JSON.stringify(screenNames)) // 5 min TTL
```

---

## Issue 4: Projects List - Expensive Counts

### Current Implementation

**File**: `dashboard/src/app/api/projects/route.ts:15-28`

**Problem**: `_count` includes require subqueries:
```typescript
const ownedProjects = await prisma.project.findMany({
  where: { userId: user.id },
  include: {
    _count: {
      select: {
        devices: true,
        logs: true,
        crashes: true,
        apiTraces: true
      }
    }
  }
})
```

### Proposed Solution

**Option 1: Lazy Load Counts** (Recommended)
Only fetch counts when needed (e.g., on project detail page):
```typescript
const ownedProjects = await prisma.project.findMany({
  where: { userId: user.id },
  // Remove _count include
  orderBy: { createdAt: 'desc' }
})

// Counts can be fetched separately if needed
```

**Option 2: Cache Counts**
Use a caching layer or materialized view for counts:
```typescript
// Fetch from cache or database
const projectCounts = await getProjectCounts(projectIds)
```

---

## Database Index Strategy

### Priority 1: Critical Indexes
```prisma
model Device {
  @@index([projectId]) // Most queries filter by projectId
  @@index([projectId, platform]) // Platform filtering
  @@index([projectId, createdAt]) // Date range queries
}

model ApiTrace {
  @@index([projectId, timestamp]) // Time-based queries
  @@index([projectId, screenName]) // Distinct screen names
}
```

### Priority 2: Composite Indexes
```prisma
model Device {
  @@index([projectId, debugModeEnabled]) // Debug mode filtering
  @@index([projectId, lastSeenAt]) // Recent devices
}

model ApiTrace {
  @@index([projectId, deviceId]) // Device-specific traces
  @@index([projectId, method, statusCode]) // Filtering by method/status
}
```

### Priority 3: Foreign Key Indexes
```prisma
model ProjectMember {
  @@index([userId]) // User's projects
  @@index([projectId]) // Project members
  @@index([userId, projectId]) // Unique lookup
}
```

## Monitoring & Validation

### Query Performance Monitoring
```typescript
// Add query logging in development
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
})

prisma.$on('query', (e) => {
  if (e.duration > 100) { // Log slow queries (>100ms)
    console.warn('Slow query:', e.query, e.duration)
  }
})
```

### Supabase Dashboard Monitoring
1. Enable Query Performance Insights
2. Monitor slow query logs
3. Track index usage
4. Monitor connection pool usage

### Validation Queries
```sql
-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

