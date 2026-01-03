# Simple Database Performance Tools

Quick guide to check database performance using simple tools.

## Option 1: psql (Command Line) - Simplest & Already Installed ✅

### Setup (One-time)

1. **Connect to your local database:**
   ```bash
   # Option A: Direct docker exec (easiest, no password needed)
   docker exec -it devbridge-postgres psql -U postgres -d devbridge
   
   # Option B: From host machine (if psql is installed)
   psql -h localhost -p 5433 -U postgres -d devbridge
   # Password: devbridge_local_password
   ```

2. **You're now in psql!** You'll see: `devbridge=#`

### Check Execution Plan

```sql
-- Test 1: Check if index is used
EXPLAIN ANALYZE
SELECT * FROM "Device" 
WHERE "projectId" = 'your-project-id' AND platform = 'android';

-- Test 2: Check traces query
EXPLAIN ANALYZE
SELECT DISTINCT "screenName"
FROM "ApiTrace"
WHERE "projectId" = 'your-project-id' AND "screenName" IS NOT NULL;
```

### What You'll See

**Good (Using Index):**
```
QUERY PLAN
─────────────────────────────────────────────────────────────
 Index Scan using Device_projectId_platform_idx on Device
   Index Cond: (("projectId" = 'test-id') AND (platform = 'android'))
 Planning Time: 0.123 ms
 Execution Time: 2.456 ms  ← This is what matters!
```

**Bad (No Index):**
```
QUERY PLAN
─────────────────────────────────────────────────────────────
 Seq Scan on Device  ← BAD! Scans entire table
   Filter: (("projectId" = 'test-id') AND (platform = 'android'))
 Planning Time: 0.123 ms
 Execution Time: 125.789 ms  ← Too slow!
```

### Quick Performance Check Commands

```sql
-- 1. Check if indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('Device', 'ApiTrace', 'ProjectMember')
ORDER BY tablename, indexname;

-- 2. Check index usage
SELECT 
  tablename,
  indexname,
  idx_scan as times_used,
  CASE 
    WHEN idx_scan = 0 THEN '⚠️ Not Used'
    WHEN idx_scan < 10 THEN '🟡 Rarely Used'
    ELSE '✅ Frequently Used'
  END as status
FROM pg_stat_user_indexes
WHERE tablename IN ('Device', 'ApiTrace', 'ProjectMember')
ORDER BY idx_scan DESC;

-- 3. Exit psql
\q
```

### Tips
- ✅ **Index Scan** = Good (using index)
- ❌ **Seq Scan** = Bad (full table scan)
- **Execution Time** should be < 100ms for simple queries
- Press `q` to exit the query result view
- Type `\q` and Enter to exit psql

---

## Option 2: TablePlus (Mac GUI) - Recommended for Mac Users 🍎

### Installation

```bash
# Using Homebrew
brew install --cask tableplus

# Or download from: https://tableplus.com/
```

### Setup Connection

1. **Open TablePlus**
2. **Click "Create a new connection"**
3. **Select PostgreSQL**
4. **Enter connection details:**
   - **Name**: `Local Devbridge`
   - **Host**: `localhost`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: `postgres` (or check your docker-compose.yml)
   - **Database**: `devbridge`
5. **Click "Test"** then **"Connect"**

### Check Execution Plan

1. **Click "New Query"** (top toolbar)
2. **Write your query:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM "Device" 
   WHERE "projectId" = 'your-project-id' AND platform = 'android';
   ```
3. **Click "Run"** (▶️ button or `Cmd+Enter`)
4. **View results** in the bottom panel

### Features
- ✅ Clean, modern interface
- ✅ Visual query results
- ✅ Easy to read execution plans
- ✅ Free for basic use

---

## Option 3: Postico (Mac GUI) - Very Simple 🍎

### Installation

```bash
# Using Homebrew
brew install --cask postico

# Or download from: https://eggerapps.at/postico/
```

### Setup Connection

1. **Open Postico**
2. **Click "New Favorite"**
3. **Enter:**
   - **Host**: `localhost`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: `postgres`
   - **Database**: `devbridge`
4. **Click "Connect"**

### Check Execution Plan

1. **Click "New Query"** tab
2. **Write:**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM "Device" 
   WHERE "projectId" = 'your-project-id' AND platform = 'android';
   ```
3. **Press `Cmd+Enter`** to run
4. **View results** below

### Features
- ✅ Very simple interface
- ✅ Mac-native app
- ✅ Free for basic use
- ✅ Great for quick queries

---

## Option 4: pgcli (Better Command Line) 💻

### Installation

```bash
pip install pgcli
# or
brew install pgcli
```

### Connect

```bash
pgcli -h localhost -U postgres -d devbridge
# Password: postgres
```

### Features
- ✅ Better than psql (syntax highlighting, autocomplete)
- ✅ Still command-line (lightweight)
- ✅ Shows execution plans clearly

---

## Quick Comparison

| Tool | Type | Ease of Use | Best For |
|------|------|-------------|----------|
| **psql** | CLI | ⭐⭐⭐ | Quick checks, already installed |
| **TablePlus** | GUI | ⭐⭐⭐⭐⭐ | Mac users, visual results |
| **Postico** | GUI | ⭐⭐⭐⭐⭐ | Mac users, simplest GUI |
| **pgcli** | CLI | ⭐⭐⭐⭐ | Better CLI experience |

---

## Recommended: Start with psql (Already Available!)

Since you already have Docker running, you can use psql immediately:

```bash
# Connect
docker exec -it devbridge-postgres psql -U postgres -d devbridge

# Run this test query (replace 'your-project-id' with actual ID)
EXPLAIN ANALYZE
SELECT * FROM "Device" 
WHERE "projectId" = 'your-project-id' AND platform = 'android';

# Check index usage
SELECT 
  tablename,
  indexname,
  idx_scan as times_used
FROM pg_stat_user_indexes
WHERE tablename IN ('Device', 'ApiTrace', 'ProjectMember')
ORDER BY idx_scan DESC;

# Exit
\q
```

**That's it!** No installation needed. 🎉

---

## Need Help?

If you want to get a project ID to test with:

```sql
-- Get a project ID
SELECT id, name FROM "Project" LIMIT 1;

-- Then use that ID in your EXPLAIN ANALYZE queries
```

