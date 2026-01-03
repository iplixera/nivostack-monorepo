# DBeaver Performance Monitoring Guide

## How to Check Database Performance in DBeaver

DBeaver has built-in tools to monitor and analyze database performance. Here's how to use them to verify our optimizations.

## 1. Query Execution Plan (EXPLAIN ANALYZE)

### What It Does
Shows how PostgreSQL executes a query, including:
- Which indexes are used
- Query execution time
- Rows scanned vs returned
- Join methods

### How to Use

1. **Open Query Editor**
   - Right-click on `devbridge` database
   - Select **"SQL Editor"** → **"New SQL Script"**

2. **Run EXPLAIN ANALYZE**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM "Device" 
   WHERE "projectId" = 'your-project-id' AND platform = 'android';
   ```

3. **View Results**
   - DBeaver shows execution plan in a tree view
   - Look for:
     - ✅ **Index Scan** (good - using index)
     - ❌ **Seq Scan** (bad - full table scan)
     - **Execution Time**: Should be < 100ms for optimized queries

### Example: Check Device Query Performance

```sql
-- Before optimization: Multiple count queries
EXPLAIN ANALYZE
SELECT COUNT(*) FROM "Device" WHERE "projectId" = 'test-id';

-- Check if index is used (should show "Index Scan using Device_projectId_idx")
EXPLAIN ANALYZE
SELECT * FROM "Device" 
WHERE "projectId" = 'test-id' AND platform = 'android';
-- Should use: Index Scan using Device_projectId_platform_idx
```

---

## 2. Index Usage Statistics

### Check Which Indexes Are Being Used

```sql
-- View index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  CASE 
    WHEN idx_scan = 0 THEN '⚠️ Never Used'
    WHEN idx_scan < 100 THEN '🟡 Rarely Used'
    ELSE '✅ Frequently Used'
  END as usage_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('Device', 'ApiTrace', 'ProjectMember')
ORDER BY idx_scan DESC;
```

**What to Look For**:
- ✅ High `index_scans` = Index is being used
- ⚠️ `index_scans = 0` = Index not used (may need to investigate)

### Check New Performance Indexes

```sql
-- Verify our new indexes exist and are being used
SELECT 
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE indexname IN (
  'Device_projectId_platform_idx',
  'Device_projectId_createdAt_idx',
  'Device_projectId_lastSeenAt_idx',
  'ApiTrace_projectId_timestamp_idx',
  'ApiTrace_projectId_screenName_idx',
  'ApiTrace_projectId_deviceId_idx',
  'ApiTrace_projectId_method_statusCode_idx',
  'ProjectMember_userId_projectId_idx'
)
ORDER BY tablename, idx_scan DESC;
```

---

## 3. Slow Query Logging

### Enable Query Logging in DBeaver

1. **Open SQL Editor**
2. **Run these commands** (temporary, for current session):

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 100; -- Log queries > 100ms
SELECT pg_reload_conf();

-- View recent slow queries
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```

**Note**: `pg_stat_statements` extension must be enabled first.

---

## 4. Table Statistics

### Check Table Sizes and Row Counts

```sql
-- Table sizes and row counts
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                 pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
  (SELECT COUNT(*) FROM information_schema.tables t2 
   WHERE t2.table_schema = schemaname AND t2.table_name = tablename) as row_count_estimate
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('Device', 'ApiTrace', 'ProjectMember', 'Project')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Actual Row Counts

```sql
-- Actual row counts (may be slow on large tables)
SELECT 
  'Device' as table_name,
  COUNT(*) as row_count
FROM "Device"
UNION ALL
SELECT 
  'ApiTrace' as table_name,
  COUNT(*) as row_count
FROM "ApiTrace"
UNION ALL
SELECT 
  'ProjectMember' as table_name,
  COUNT(*) as row_count
FROM "ProjectMember";
```

---

## 5. Query Performance Comparison

### Test Optimized Endpoints

#### Test Devices Endpoint Query
```sql
-- Simulate the optimized devices query
-- This should use indexes and be fast

-- Test 1: Simple projectId filter (should use Device_projectId_idx)
EXPLAIN ANALYZE
SELECT * FROM "Device" 
WHERE "projectId" = 'test-project-id'
LIMIT 50;

-- Test 2: Platform filter (should use Device_projectId_platform_idx)
EXPLAIN ANALYZE
SELECT * FROM "Device" 
WHERE "projectId" = 'test-project-id' AND platform = 'android'
LIMIT 50;

-- Test 3: Date range (should use Device_projectId_createdAt_idx)
EXPLAIN ANALYZE
SELECT * FROM "Device" 
WHERE "projectId" = 'test-project-id' 
  AND "createdAt" >= CURRENT_DATE - INTERVAL '7 days'
LIMIT 50;
```

#### Test Traces Endpoint Query
```sql
-- Test screen names query (should use ApiTrace_projectId_screenName_idx)
EXPLAIN ANALYZE
SELECT DISTINCT "screenName"
FROM "ApiTrace"
WHERE "projectId" = 'test-project-id'
  AND "screenName" IS NOT NULL
ORDER BY "screenName";

-- Test timestamp query (should use ApiTrace_projectId_timestamp_idx)
EXPLAIN ANALYZE
SELECT * FROM "ApiTrace"
WHERE "projectId" = 'test-project-id'
ORDER BY timestamp DESC
LIMIT 50;
```

---

## 6. DBeaver Built-in Monitoring Tools

### Database Navigator → Statistics

1. **Right-click on `devbridge` database**
2. Select **"View Statistics"** or **"Properties"**
3. View:
   - Database size
   - Number of tables
   - Number of indexes

### Table Statistics

1. **Right-click on a table** (e.g., `Device`)
2. Select **"View Statistics"**
3. See:
   - Row count
   - Table size
   - Index information

### Index Information

1. **Expand table** → **"Indexes"**
2. **Right-click on an index**
3. Select **"Properties"** to see:
   - Index definition
   - Size
   - Usage statistics (if available)

---

## 7. Performance Monitoring Queries

### Create a Monitoring Dashboard Query

Save this query in DBeaver and run it regularly:

```sql
-- Performance Monitoring Dashboard
WITH index_stats AS (
  SELECT 
    tablename,
    COUNT(*) as total_indexes,
    SUM(CASE WHEN idx_scan > 0 THEN 1 ELSE 0 END) as used_indexes,
    SUM(idx_scan) as total_scans
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
    AND tablename IN ('Device', 'ApiTrace', 'ProjectMember')
  GROUP BY tablename
),
table_stats AS (
  SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND tablename IN ('Device', 'ApiTrace', 'ProjectMember')
)
SELECT 
  t.tablename,
  t.size,
  t.live_rows,
  i.total_indexes,
  i.used_indexes,
  i.total_scans,
  CASE 
    WHEN i.used_indexes = 0 THEN '⚠️ No indexes used'
    WHEN i.used_indexes::float / i.total_indexes < 0.5 THEN '🟡 Some indexes unused'
    ELSE '✅ Most indexes used'
  END as index_health
FROM table_stats t
JOIN index_stats i ON t.tablename = i.tablename
ORDER BY t.tablename;
```

---

## 8. Verify Optimizations Are Working

### Check 1: Indexes Exist
```sql
-- Verify all performance indexes are created
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('Device', 'ApiTrace', 'ProjectMember')
  AND indexname LIKE '%projectId%' 
  OR indexname LIKE '%platform%'
  OR indexname LIKE '%createdAt%'
  OR indexname LIKE '%screenName%'
ORDER BY tablename, indexname;
```

### Check 2: Indexes Are Used
```sql
-- After running some queries, check if indexes are being used
SELECT 
  indexname,
  idx_scan as times_used
FROM pg_stat_user_indexes
WHERE indexname IN (
  'Device_projectId_platform_idx',
  'Device_projectId_createdAt_idx',
  'ApiTrace_projectId_timestamp_idx',
  'ApiTrace_projectId_screenName_idx'
)
ORDER BY idx_scan DESC;
```

### Check 3: Query Performance
```sql
-- Compare query execution times
-- Run these and note the execution time shown in DBeaver

-- Should be fast (< 50ms) with index
EXPLAIN ANALYZE
SELECT COUNT(*) FROM "Device" 
WHERE "projectId" = 'test-id' AND platform = 'android';

-- Should use index scan, not sequential scan
EXPLAIN ANALYZE
SELECT DISTINCT "screenName" 
FROM "ApiTrace" 
WHERE "projectId" = 'test-id';
```

---

## 9. DBeaver Query Execution Time

### View Execution Time in DBeaver

1. **Run a query** in SQL Editor
2. **Look at the bottom status bar**:
   - Shows execution time
   - Shows rows returned
   - Shows query duration

3. **Compare Before/After**:
   - Before optimization: Multiple queries, slower
   - After optimization: Fewer queries, faster

### Enable Query Timing

In DBeaver:
1. **Window** → **Preferences** → **DBeaver** → **SQL Editor**
2. Check **"Show query execution statistics"**
3. Execution time will be shown for each query

---

## 10. Monitoring Checklist

### Daily Monitoring
- [ ] Check index usage statistics
- [ ] Monitor slow queries (> 100ms)
- [ ] Verify indexes are being used
- [ ] Check table sizes

### Weekly Monitoring
- [ ] Review query performance trends
- [ ] Check for unused indexes
- [ ] Analyze table growth
- [ ] Review connection pool usage

### Performance Verification
- [ ] Devices endpoint: Should use `Device_projectId_platform_idx`
- [ ] Traces endpoint: Should use `ApiTrace_projectId_screenName_idx`
- [ ] Projects endpoint: Should batch fetch (no N+1)
- [ ] Query times: Should be < 200ms (p95)

---

## Quick Performance Test Script

Save this in DBeaver and run to verify optimizations:

```sql
-- Performance Test Script
\echo '=== Index Verification ==='
SELECT COUNT(*) as performance_indexes_count
FROM pg_indexes
WHERE indexname IN (
  'Device_projectId_platform_idx',
  'Device_projectId_createdAt_idx',
  'ApiTrace_projectId_timestamp_idx',
  'ApiTrace_projectId_screenName_idx'
);

\echo '=== Index Usage ==='
SELECT 
  indexname,
  idx_scan as times_used,
  CASE WHEN idx_scan > 0 THEN '✅ Used' ELSE '⚠️ Not Used' END as status
FROM pg_stat_user_indexes
WHERE indexname IN (
  'Device_projectId_platform_idx',
  'ApiTrace_projectId_screenName_idx'
);

\echo '=== Query Performance Test ==='
EXPLAIN ANALYZE
SELECT COUNT(*) FROM "Device" 
WHERE "projectId" IS NOT NULL AND platform = 'android';
```

---

## Tips for DBeaver

1. **Save Queries**: Save monitoring queries as SQL scripts
2. **Query History**: View → SQL History (see all executed queries)
3. **Explain Plan**: Right-click query → "Explain Plan" (visual query plan)
4. **Auto-complete**: Use `Ctrl+Space` for SQL autocomplete
5. **Format SQL**: Right-click → "Format SQL" for readability

---

## Additional Resources

- DBeaver Documentation: https://dbeaver.com/docs/
- PostgreSQL Performance Tuning: https://www.postgresql.org/docs/current/performance-tips.html
- EXPLAIN Documentation: https://www.postgresql.org/docs/current/using-explain.html

