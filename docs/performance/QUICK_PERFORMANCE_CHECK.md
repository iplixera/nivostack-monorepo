# Quick Database Performance Check

Simple commands to check database performance - **No installation needed!**

## 🚀 Quick Start

### Connect to Database
```bash
docker exec -it devbridge-postgres psql -U postgres -d devbridge
```

### Run Performance Tests

Once connected, run these queries:

#### 1. Check if Performance Indexes Exist
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('Device', 'ApiTrace', 'ProjectMember')
  AND (
    indexname LIKE '%platform%' OR
    indexname LIKE '%createdAt%' OR
    indexname LIKE '%timestamp%' OR
    indexname LIKE '%screenName%'
  )
ORDER BY tablename, indexname;
```

**Expected Results:**
- ✅ `Device_projectId_platform_idx`
- ✅ `Device_projectId_createdAt_idx`
- ✅ `Device_projectId_lastSeenAt_idx`
- ✅ `ApiTrace_projectId_timestamp_idx`
- ✅ `ApiTrace_projectId_screenName_idx`

#### 2. Test Query Performance
```sql
-- Get a project ID first
SELECT id FROM "Project" LIMIT 1;

-- Then test (replace 'your-project-id' with actual ID)
EXPLAIN ANALYZE
SELECT * FROM "Device" 
WHERE "projectId" = 'your-project-id' AND platform = 'android'
LIMIT 10;
```

**What to Look For:**
- ✅ **Index Scan using Device_projectId_platform_idx** = Good!
- ❌ **Seq Scan on Device** = Bad (no index or too little data)

#### 3. Check Index Usage
```sql
SELECT 
  relname as table_name,
  indexrelname as index_name,
  idx_scan as times_used
FROM pg_stat_user_indexes
WHERE schemaname = 'public' 
  AND relname IN ('Device', 'ApiTrace', 'ProjectMember')
ORDER BY idx_scan DESC
LIMIT 10;
```

## 📊 One-Line Commands (No psql needed)

### Check Indexes
```bash
docker exec devbridge-postgres psql -U postgres -d devbridge -c "SELECT tablename, indexname FROM pg_indexes WHERE tablename IN ('Device', 'ApiTrace') AND indexname LIKE '%projectId%' ORDER BY tablename;"
```

### Test Query Performance
```bash
PROJECT_ID=$(docker exec devbridge-postgres psql -U postgres -d devbridge -t -c "SELECT id FROM \"Project\" LIMIT 1;" | xargs)
docker exec devbridge-postgres psql -U postgres -d devbridge -c "EXPLAIN ANALYZE SELECT * FROM \"Device\" WHERE \"projectId\" = '$PROJECT_ID' AND platform = 'android' LIMIT 10;"
```

## 💡 Understanding Results

### Good Query Plan (Using Index)
```
QUERY PLAN
─────────────────────────────────────────────────────────────
 Index Scan using Device_projectId_platform_idx on Device
   Index Cond: (("projectId" = '...') AND (platform = 'android'))
 Planning Time: 0.123 ms
 Execution Time: 2.456 ms  ← Fast!
```

### Bad Query Plan (No Index)
```
QUERY PLAN
─────────────────────────────────────────────────────────────
 Seq Scan on Device  ← BAD! Scans entire table
   Filter: (("projectId" = '...') AND (platform = 'android'))
 Planning Time: 0.123 ms
 Execution Time: 125.789 ms  ← Slow!
```

### Note About Seq Scan
If you see **Seq Scan** with very little data (< 100 rows), this is **normal**. PostgreSQL chooses Seq Scan when:
- Table is very small (faster than index lookup)
- Index overhead is more than scanning the table

With production data (thousands of rows), indexes will be used.

## 🔧 If Indexes Don't Exist

If the performance indexes are missing, apply the migration:

```bash
cd dashboard
npx prisma migrate deploy
# or
npx prisma db push
```

Then regenerate Prisma client:
```bash
npx prisma generate
```

## 📖 More Tools

See `docs/performance/SIMPLE_DB_PERFORMANCE_TOOLS.md` for:
- TablePlus setup (Mac GUI)
- Postico setup (Mac GUI)
- pgcli setup (better CLI)

