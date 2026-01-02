# Performance Analysis - Database & Dashboard

**Date**: January 2, 2025  
**Branch**: `feature/performance-improvements`  
**Environment**: Local development (localhost:3000, PostgreSQL localhost:5433)

## Executive Summary

Initial analysis of the dashboard and database performance has identified several optimization opportunities:

1. **Multiple sequential count queries** in devices endpoint
2. **N+1 query problem** in projects endpoint
3. **Inefficient distinct queries** in traces endpoint
4. **Missing database indexes** on frequently queried fields
5. **Unnecessary data fetching** in several endpoints

## Performance Issues Identified

### 1. Devices Endpoint (`/api/devices`) - HIGH PRIORITY

**Location**: `dashboard/src/app/api/devices/route.ts:389-448`

**Issue**: Running 9 separate database queries:
- 1 `findMany` for devices
- 8 `count` queries for statistics (filtered, total, android, ios, today, week, month, debug)

**Impact**: Each count query scans the table, causing significant load with large datasets.

**Current Code**:
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

**Recommendation**:
- Use a single aggregated query with `GROUP BY` or `COUNT(*) FILTER (WHERE ...)`
- Consider caching statistics for frequently accessed projects
- Add database indexes on `projectId`, `platform`, `createdAt`, `debugModeEnabled`

### 2. Projects Endpoint (`/api/projects`) - HIGH PRIORITY

**Location**: `dashboard/src/app/api/projects/route.ts:53-72`

**Issue**: N+1 query problem - fetching inviter details in a loop.

**Current Code**:
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

**Impact**: If a user is a member of 10 projects, this executes 10 separate queries.

**Recommendation**:
- Batch fetch all inviters in a single query using `findMany` with `where: { id: { in: inviterIds } }`
- Use a Map to associate inviters with members

### 3. Traces Endpoint (`/api/traces`) - MEDIUM PRIORITY

**Location**: `dashboard/src/app/api/traces/route.ts:538-548`

**Issue**: 
- `distinct` query on `screenName` scans entire table
- Fetching all devices even when `groupByDevice` is false

**Current Code**:
```typescript
const screenNames = await prisma.apiTrace.findMany({
  where: { projectId },
  select: { screenName: true },
  distinct: ['screenName']
})

const devices = await prisma.device.findMany({
  where: { projectId },
  select: { id: true, deviceId: true, platform: true, model: true }
})
```

**Impact**: 
- Distinct queries are expensive on large tables
- Unnecessary device fetching adds overhead

**Recommendation**:
- Add index on `(projectId, screenName)` for faster distinct queries
- Only fetch devices when `groupByDevice === true`
- Consider caching screen names per project

### 4. Projects List with Counts - MEDIUM PRIORITY

**Location**: `dashboard/src/app/api/projects/route.ts:15-28`

**Issue**: Using `_count` includes which can be expensive.

**Current Code**:
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

**Impact**: Each `_count` requires a separate query or subquery.

**Recommendation**:
- Consider lazy-loading counts only when needed
- Cache counts and update on data changes
- Use database views or materialized views for statistics

## Database Index Recommendations

Based on query patterns, the following indexes should be added:

### Device Table
```prisma
@@index([projectId])
@@index([projectId, platform])
@@index([projectId, createdAt])
@@index([projectId, debugModeEnabled])
@@index([projectId, lastSeenAt])
```

### ApiTrace Table
```prisma
@@index([projectId, timestamp])
@@index([projectId, screenName])
@@index([projectId, deviceId])
@@index([projectId, method, statusCode])
```

### ProjectMember Table
```prisma
@@index([userId])
@@index([projectId])
@@index([userId, projectId])
```

## Dashboard Performance Issues

### 1. Large Bundle Sizes
- Check Next.js bundle analyzer
- Code splitting opportunities
- Lazy loading for heavy components

### 2. Client-Side Data Fetching
- Review React Query/SWR usage
- Implement proper caching strategies
- Reduce unnecessary re-fetches

### 3. Rendering Performance
- Check for unnecessary re-renders
- Memoization opportunities
- Virtual scrolling for long lists

## Next Steps

1. ✅ **Create performance branch** - Done
2. ⏳ **Add database indexes** - Priority 1
3. ⏳ **Optimize devices endpoint** - Priority 1
4. ⏳ **Fix N+1 in projects endpoint** - Priority 1
5. ⏳ **Optimize traces endpoint** - Priority 2
6. ⏳ **Add query performance monitoring** - Priority 2
7. ⏳ **Implement caching layer** - Priority 3
8. ⏳ **Dashboard bundle optimization** - Priority 3

## Testing Strategy

1. **Load Testing**: Use tools like `k6` or `artillery` to simulate load
2. **Query Analysis**: Enable Prisma query logging to identify slow queries
3. **Database Monitoring**: Use PostgreSQL `EXPLAIN ANALYZE` for query plans
4. **Performance Benchmarks**: Establish baseline metrics before optimization

## Metrics to Track

- API response times (p50, p95, p99)
- Database query execution times
- Page load times (FCP, LCP, TTI)
- Bundle sizes
- Database connection pool usage

