# pg_timezone_names Query Optimization

## Issue

The query `SELECT name FROM pg_timezone_names` is slow in Supabase.

## Analysis

### What is `pg_timezone_names`?

`pg_timezone_names` is a PostgreSQL system view that contains **all available timezone names** (600+ entries). It's used by PostgreSQL internally for timezone operations.

### Why It Might Be Slow

1. **Large dataset**: Contains 600+ timezone entries
2. **System view**: Not optimized for frequent queries
3. **No indexes**: System views typically don't have indexes
4. **Network overhead**: If queried frequently from Supabase UI

### Where This Query Might Come From

**Not from our codebase** - We don't query `pg_timezone_names` directly.

**Possible sources:**
1. **Supabase UI** - Table Editor or SQL Editor might query it for timezone selection dropdowns
2. **Prisma** - Might query it internally for timezone operations (unlikely)
3. **Manual queries** - If you're running it manually in SQL Editor

## Our Timezone Implementation

### Current Approach

We **don't query** `pg_timezone_names`. Instead:

1. **SDK collects timezone** from device:
   ```dart
   // Flutter SDK
   final timezone = DateTime.now().timeZoneName;
   ```

2. **Stored as string** in database:
   ```prisma
   model Device {
     timezone String? // Device timezone (e.g., "America/New_York")
   }
   ```

3. **Displayed directly** - No need to validate or query timezone names

### Why This Is Better

- ✅ **No database queries** for timezone names
- ✅ **Faster** - Direct string storage
- ✅ **Simpler** - No validation needed
- ✅ **Device-specific** - Uses actual device timezone

## If You Need Timezone Validation

### Option 1: Cache Timezone Names (Recommended)

If you need to validate timezone names, cache them:

```typescript
// Cache timezone names (query once, reuse)
const TIMEZONE_NAMES = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  // ... common timezones
]

// Or fetch once and cache
let cachedTimezones: string[] | null = null

async function getTimezoneNames(): Promise<string[]> {
  if (cachedTimezones) return cachedTimezones
  
  // Query once, cache forever
  const result = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM pg_timezone_names ORDER BY name
  `
  cachedTimezones = result.map(r => r.name)
  return cachedTimezones
}
```

### Option 2: Use Static List

For UI dropdowns, use a static list of common timezones:

```typescript
const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Australia/Sydney',
  // ... add more as needed
]
```

### Option 3: Optimize Query (If Needed)

If you must query `pg_timezone_names`:

```sql
-- Faster: Limit results and add ordering
SELECT name 
FROM pg_timezone_names 
WHERE name NOT LIKE 'Etc/%'  -- Exclude Etc timezones
ORDER BY name 
LIMIT 500;

-- Or cache in a materialized view
CREATE MATERIALIZED VIEW timezone_names_cache AS
SELECT name FROM pg_timezone_names ORDER BY name;

-- Refresh periodically (e.g., daily)
REFRESH MATERIALIZED VIEW timezone_names_cache;
```

## Recommendations

### For Our Use Case

**✅ Current approach is optimal:**
- We don't need to query `pg_timezone_names`
- Device timezone is collected and stored as-is
- No validation needed

### If Query Is From Supabase UI

**This is normal:**
- Supabase UI might query it for timezone dropdowns
- Not something we can control
- Not affecting our application performance

### If You Need Timezone Selection UI

**Use static list:**
- Create a static list of common timezones
- No database query needed
- Faster and simpler

## Summary

- ❌ **We don't query** `pg_timezone_names` in our codebase
- ✅ **Current implementation** is optimal (device timezone stored as string)
- ⚠️ **If slow**, it's likely from Supabase UI, not our code
- 💡 **If needed**, use static list or cache instead of querying

