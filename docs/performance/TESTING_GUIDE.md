# Performance Optimization Testing Guide

**Date**: January 2, 2025  
**Branch**: `feature/performance-improvements`

## Local Testing

### Prerequisites
- Local database running (Docker PostgreSQL on localhost:5433)
- Dashboard server running (localhost:3000)
- Test user account with projects

### Test Scenarios

#### 1. Projects Endpoint - N+1 Fix
**Endpoint**: `GET /api/projects`

**Before**: N+1 queries (1 for projects + N for inviters)  
**After**: 2 queries (1 for projects + 1 batch for inviters)

**Test Steps**:
1. Create a user account
2. Create or join multiple projects (5-10 projects)
3. Monitor database queries using Prisma logging
4. Call `/api/projects` endpoint
5. Verify response includes all projects with inviter details
6. Check query count in logs (should be 2 queries)

**Expected Result**:
- All projects returned correctly
- Inviter details populated for member projects
- Only 2 database queries executed

#### 2. Devices Endpoint - Query Reduction
**Endpoint**: `GET /api/devices?projectId=<id>`

**Before**: 9 queries  
**After**: 3 queries

**Test Steps**:
1. Ensure project has multiple devices (10+ devices)
2. Call `/api/devices` endpoint with projectId
3. Monitor database queries
4. Verify response includes:
   - Devices list
   - Statistics (total, android, ios, today, week, month, debug)
5. Check query count (should be 3 queries)

**Expected Result**:
- All devices returned correctly
- Statistics accurate
- Only 3 database queries executed
- Response time improved

**Test with Filters**:
- Test with platform filter: `?projectId=<id>&platform=android`
- Test with search: `?projectId=<id>&search=<term>`
- Verify filtered count is correct

#### 3. Traces Endpoint - Conditional Fetching
**Endpoint**: `GET /api/traces?projectId=<id>`

**Before**: Always fetches devices  
**After**: Only fetches devices when `groupByDevice=true`

**Test Steps**:
1. Ensure project has traces and devices
2. Call `/api/traces?projectId=<id>` (without groupByDevice)
3. Monitor database queries
4. Verify response includes screen names but not devices
5. Call `/api/traces?projectId=<id>&groupByDevice=true`
6. Verify response includes devices

**Expected Result**:
- Screen names always fetched (for filter dropdown)
- Devices only fetched when grouping requested
- Query count reduced when not grouping

### Database Index Verification

#### Check Index Creation
```sql
-- Connect to local database
psql postgresql://postgres:devbridge_local_password@localhost:5433/devbridge

-- Check Device indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'Device' 
  AND indexname LIKE '%projectId%' OR indexname LIKE '%platform%' OR indexname LIKE '%createdAt%'
ORDER BY indexname;

-- Check ApiTrace indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'ApiTrace' 
  AND (indexname LIKE '%projectId%' OR indexname LIKE '%screenName%' OR indexname LIKE '%timestamp%')
ORDER BY indexname;

-- Check ProjectMember indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'ProjectMember' 
  AND indexname LIKE '%userId%'
ORDER BY indexname;
```

#### Verify Index Usage
```sql
-- Check index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('Device', 'ApiTrace', 'ProjectMember')
ORDER BY idx_scan DESC;
```

#### Test Query Performance
```sql
-- Test Device query with index
EXPLAIN ANALYZE
SELECT COUNT(*) 
FROM "Device" 
WHERE "projectId" = '<test-project-id>' AND platform = 'android';

-- Test ApiTrace query with index
EXPLAIN ANALYZE
SELECT DISTINCT "screenName"
FROM "ApiTrace"
WHERE "projectId" = '<test-project-id>' AND "screenName" IS NOT NULL;
```

**Expected**: Index scans should be used (not sequential scans)

### Performance Benchmarks

#### Baseline Metrics (Before Optimization)
| Endpoint | Avg Response Time | p95 Response Time | Queries | Notes |
|----------|------------------|-------------------|---------|-------|
| /api/projects | - | - | N+1 | Baseline |
| /api/devices | - | - | 9 | Baseline |
| /api/traces | - | - | 3+ | Baseline |

#### Target Metrics (After Optimization)
| Endpoint | Avg Response Time | p95 Response Time | Queries | Target |
|----------|------------------|-------------------|---------|--------|
| /api/projects | < 200ms | < 500ms | 2 | ✅ |
| /api/devices | < 300ms | < 600ms | 3 | ✅ |
| /api/traces | < 250ms | < 500ms | 2-3 | ✅ |

### Load Testing

#### Using curl
```bash
# Test projects endpoint
time curl -H "Cookie: <auth-cookie>" http://localhost:3000/api/projects

# Test devices endpoint
time curl -H "Cookie: <auth-cookie>" "http://localhost:3000/api/devices?projectId=<id>"

# Test traces endpoint
time curl -H "Cookie: <auth-cookie>" "http://localhost:3000/api/traces?projectId=<id>"
```

#### Using Apache Bench (ab)
```bash
# Install: brew install apache-bench (macOS)

# Test projects endpoint
ab -n 100 -c 10 -H "Cookie: <auth-cookie>" http://localhost:3000/api/projects

# Test devices endpoint
ab -n 100 -c 10 -H "Cookie: <auth-cookie>" "http://localhost:3000/api/devices?projectId=<id>"
```

### Prisma Query Logging

Enable query logging to monitor database queries:

```typescript
// In dashboard/src/lib/prisma.ts or similar
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
})

prisma.$on('query', (e) => {
  if (e.duration > 100) { // Log slow queries (>100ms)
    console.warn('Slow query:', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    })
  }
})
```

## Staging Testing

### Pre-Deployment Checklist
- [ ] All local tests passed
- [ ] Migration file created and reviewed
- [ ] Index creation verified locally
- [ ] Query performance verified
- [ ] No breaking changes

### Deployment Steps

1. **Deploy Migration to Staging**
   ```bash
   # On staging server
   pnpm prisma migrate deploy
   ```

2. **Verify Indexes Created**
   ```sql
   -- Connect to staging database
   SELECT indexname FROM pg_indexes 
   WHERE tablename IN ('Device', 'ApiTrace', 'ProjectMember')
   ORDER BY tablename, indexname;
   ```

3. **Monitor Performance**
   - Check Supabase dashboard for query performance
   - Monitor API response times
   - Check database connection pool usage
   - Verify no errors in logs

4. **Update SUPABASE_TRACKING.md**
   - Record baseline metrics
   - Document index usage
   - Track query performance improvements

### Staging Test Scenarios
- [ ] Test with production-like data volume
- [ ] Test with multiple concurrent users
- [ ] Monitor database CPU and memory usage
- [ ] Verify no performance regressions
- [ ] Check error rates

## Production Deployment

### Pre-Production Checklist
- [ ] Staging tests passed
- [ ] Performance improvements verified
- [ ] No errors in staging logs
- [ ] Migration tested on staging
- [ ] Rollback plan prepared

### Deployment Steps

1. **Schedule Maintenance Window** (if needed)
   - Index creation can be done online but may take time
   - Monitor during creation

2. **Deploy Migration**
   ```bash
   # On production server
   pnpm prisma migrate deploy
   ```

3. **Monitor Closely**
   - Watch query performance
   - Monitor database load
   - Check API response times
   - Verify no errors

4. **Update Documentation**
   - Update SUPABASE_TRACKING.md with production metrics
   - Update PERFORMANCE_TRACKER.md with deployment status

### Rollback Plan

If issues occur:
1. Revert code changes (git revert)
2. Indexes can remain (they don't break functionality)
3. Monitor and investigate issues
4. Re-deploy after fixes

## Success Criteria

✅ **Local Testing**
- All endpoints return correct data
- Query counts reduced as expected
- Response times improved
- No errors in logs

✅ **Staging Testing**
- Performance improvements verified
- No regressions
- Database load acceptable
- Ready for production

✅ **Production Deployment**
- Successful migration
- Performance improvements achieved
- No incidents
- Metrics tracked

## Troubleshooting

### Index Creation Fails
- Check database permissions
- Verify schema is correct
- Check for existing indexes
- Review migration SQL

### Query Performance Not Improved
- Verify indexes are being used (EXPLAIN ANALYZE)
- Check index statistics
- Verify query plans
- Consider additional indexes

### Increased Database Load
- Monitor index maintenance overhead
- Check VACUUM and ANALYZE schedules
- Consider index tuning

