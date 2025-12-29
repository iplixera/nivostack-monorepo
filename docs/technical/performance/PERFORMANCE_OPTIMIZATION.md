# DevBridge API Performance Optimization Guide

This document outlines the performance analysis, benchmarks, and optimization tasks for DevBridge SDK API endpoints.

---

## Table of Contents

- [Current Performance Baseline](#current-performance-baseline)
- [Problem Statement](#problem-statement)
- [Latency Sources Analysis](#latency-sources-analysis)
- [Optimization Tasks](#optimization-tasks)
  - [P0 - Critical Priority](#p0---critical-priority)
  - [P1 - High Priority](#p1---high-priority)
  - [P2 - Medium Priority](#p2---medium-priority)
  - [P3 - Low Priority](#p3---low-priority)
- [Implementation Details](#implementation-details)
- [Expected Outcomes](#expected-outcomes)
- [Performance Testing](#performance-testing)

---

## Current Performance Baseline

### Test Environment
- **Date**: December 2024
- **Production URL**: https://devbridge-eta.vercel.app
- **Database**: Supabase PostgreSQL (eu-central-2)
- **Hosting**: Vercel Serverless Functions

### Sequential Request Results (10 requests each)

| Endpoint | Min | Mean | Max | p95 | Response Size |
|----------|-----|------|-----|-----|---------------|
| `/api/feature-flags` | 914ms | 938ms | 1,089ms | 1,089ms | 276 bytes |
| `/api/sdk-settings` | 1,649ms | 1,688ms | 1,789ms | 1,789ms | 383 bytes |
| `/api/business-config` | 1,195ms | 1,241ms | 1,326ms | 1,326ms | 2,710 bytes |

### Concurrent Request Results (5 users, 3 iterations)

| Metric | Feature Flags | SDK Settings | Business Config | Total SDK Init |
|--------|---------------|--------------|-----------------|----------------|
| Min | 1,025ms | 1,734ms | 1,276ms | 4,090ms |
| Mean | 1,622ms | 1,903ms | 1,361ms | **4,886ms** |
| Max | 3,612ms | 2,337ms | 1,848ms | 6,787ms |
| p95 | 3,612ms | 2,337ms | 1,848ms | 6,787ms |

### Assessment

| Status | Threshold | Current Performance |
|--------|-----------|---------------------|
| :green_circle: Good | < 1,000ms | - |
| :yellow_circle: Acceptable | 1,000-2,000ms | - |
| :orange_circle: Warning | 2,000-3,000ms | - |
| :red_circle: **Critical** | > 3,000ms | **4,886ms mean SDK init** |

---

## Problem Statement

The SDK initialization process takes approximately **5 seconds**, which severely impacts mobile app startup time. Users experience:

1. **Blank/loading screens** during app launch
2. **Poor first impression** of app performance
3. **Potential app abandonment** (users expect < 2s startup)
4. **Battery drain** from extended network activity

### Target Performance

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| SDK Init (uncached) | 4,886ms | < 1,500ms | 70% reduction |
| SDK Init (cached) | 4,886ms | < 200ms | 96% reduction |
| Single Endpoint | 900-1,700ms | < 500ms | 60% reduction |

---

## Latency Sources Analysis

### Breakdown of 5-Second SDK Init Time

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SDK Initialization Breakdown                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Request 1: /api/feature-flags                                       │
│  ├── DNS Resolution ────────────────────── ~50-100ms                │
│  ├── TLS Handshake ─────────────────────── ~100-200ms               │
│  ├── Vercel Cold Start ─────────────────── ~300-800ms  ⚠️           │
│  ├── Prisma Connection ─────────────────── ~200-400ms  ⚠️           │
│  ├── Database Query ────────────────────── ~50-100ms                │
│  └── Response Serialization ────────────── ~10-20ms                 │
│      Total: ~800-1,600ms                                            │
│                                                                      │
│  Request 2: /api/sdk-settings                                        │
│  ├── DNS (cached) ──────────────────────── ~5-10ms                  │
│  ├── TLS (reused) ──────────────────────── ~10-20ms                 │
│  ├── Vercel Cold Start ─────────────────── ~300-800ms  ⚠️           │
│  ├── Prisma Connection ─────────────────── ~200-400ms  ⚠️           │
│  ├── Database Query ────────────────────── ~100-200ms               │
│  └── Response Serialization ────────────── ~10-20ms                 │
│      Total: ~600-1,400ms                                            │
│                                                                      │
│  Request 3: /api/business-config                                     │
│  ├── DNS (cached) ──────────────────────── ~5-10ms                  │
│  ├── TLS (reused) ──────────────────────── ~10-20ms                 │
│  ├── Vercel Cold Start ─────────────────── ~300-800ms  ⚠️           │
│  ├── Prisma Connection ─────────────────── ~200-400ms  ⚠️           │
│  ├── Database Query ────────────────────── ~100-200ms               │
│  └── Response Serialization ────────────── ~20-50ms                 │
│      Total: ~600-1,400ms                                            │
│                                                                      │
│  ══════════════════════════════════════════════════════════════════ │
│  TOTAL SDK INIT TIME: ~2,000-5,000ms                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

⚠️ = Primary optimization targets
```

### Root Causes

| Cause | Impact | Description |
|-------|--------|-------------|
| **3 Sequential HTTP Requests** | 3x latency | SDK calls feature-flags → sdk-settings → business-config one after another |
| **Serverless Cold Starts** | +500-1,500ms | Each Vercel function needs to initialize Node.js runtime + Prisma client |
| **Database Connection Overhead** | +200-500ms | Prisma establishes new connection to Supabase connection pooler |
| **Geographic Latency** | +100-300ms | Database in EU (eu-central-2), Vercel edge varies by user location |
| **No Caching** | 100% DB hits | Every request queries database even for unchanged configuration data |
| **Large Response Payloads** | +50-100ms | Business config can be several KB, increases transfer time |

---

## Optimization Tasks

### P0 - Critical Priority

These optimizations should be implemented immediately as they provide the highest impact.

---

#### TASK-001: Combined SDK Init Endpoint

**Status**: :white_circle: Not Started
**Impact**: High (60-70% reduction)
**Effort**: Medium

**Description**:
Create a single `/api/sdk-init` endpoint that returns feature flags, SDK settings, AND business config in one HTTP response.

**Why This Helps**:
- Reduces 3 HTTP round-trips to 1
- Single serverless cold start instead of 3
- Single database connection instead of 3
- Eliminates sequential request overhead

**Implementation**:

1. Create `/api/sdk-init/route.ts`:
```typescript
// GET /api/sdk-init
// Returns: { featureFlags, sdkSettings, businessConfig, timestamp }

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')

  // Validate API key and get project
  const project = await prisma.project.findFirst({
    where: { apiKey },
    select: { id: true }
  })

  // Fetch all data in parallel
  const [featureFlags, sdkSettings, businessConfigs] = await Promise.all([
    prisma.featureFlags.findFirst({ where: { projectId: project.id } }),
    prisma.sdkSettings.findFirst({ where: { projectId: project.id } }),
    prisma.businessConfig.findMany({ where: { projectId: project.id } })
  ])

  return NextResponse.json({
    featureFlags: featureFlags || DEFAULT_FLAGS,
    sdkSettings: sdkSettings || DEFAULT_SETTINGS,
    businessConfig: transformConfigs(businessConfigs),
    timestamp: new Date().toISOString()
  })
}
```

2. Update Flutter SDK to use new endpoint:
```dart
Future<void> _fetchConfiguration() async {
  final response = await _apiClient.get('/api/sdk-init');
  _featureFlags = DevBridgeFeatureFlags.fromJson(response['featureFlags']);
  _sdkSettings = DevBridgeSdkSettings.fromJson(response['sdkSettings']);
  _businessConfig = DevBridgeBusinessConfig.fromJson(response['businessConfig']);
}
```

**Expected Improvement**: ~60-70% reduction (from ~5s to ~1.5-2s)

**Acceptance Criteria**:
- [ ] New endpoint created and deployed
- [ ] SDK updated to use new endpoint
- [ ] Backward compatibility maintained (old endpoints still work)
- [ ] Performance tests show < 2s SDK init time

---

#### TASK-002: Edge Caching with Cache Headers

**Status**: :white_circle: Not Started
**Impact**: High (80-90% for cache hits)
**Effort**: Low

**Description**:
Add HTTP cache headers to SDK endpoints to enable Vercel's edge network to cache responses globally.

**Why This Helps**:
- Configuration data rarely changes (maybe once per deploy/update)
- Vercel edge servers are globally distributed (closer to mobile users)
- Cached responses return in ~50-100ms instead of ~1000ms
- No code changes needed in SDK

**Implementation**:

1. Add cache headers to SDK endpoints:
```typescript
// In /api/sdk-init/route.ts (or each endpoint)
return new NextResponse(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    // Cache at edge for 60 seconds
    // Serve stale content for up to 5 minutes while revalidating in background
  }
})
```

2. Cache header explanation:
```
Cache-Control: public, s-maxage=60, stale-while-revalidate=300

- public: Response can be cached by CDN/edge
- s-maxage=60: Edge cache considers response fresh for 60 seconds
- stale-while-revalidate=300: For next 5 minutes, serve stale while fetching fresh
```

**Expected Improvement**:
- Cache HIT: ~50-100ms response (80-90% reduction)
- Cache MISS: Same as current (~1-2s)

**Acceptance Criteria**:
- [ ] Cache headers added to all SDK endpoints
- [ ] Vercel edge caching verified via response headers
- [ ] Cache HIT rate monitored in Vercel analytics
- [ ] Invalidation strategy documented

---

### P1 - High Priority

These optimizations provide significant improvements and should be implemented after P0.

---

#### TASK-003: Parallel Database Queries

**Status**: :white_circle: Not Started
**Impact**: Medium (30-50% reduction)
**Effort**: Low

**Description**:
Within the combined endpoint (or each individual endpoint), run all database queries in parallel using `Promise.all()`.

**Why This Helps**:
- Database can handle multiple queries simultaneously
- Queries don't depend on each other
- Reduces total query time from sum to max

**Implementation**:
```typescript
// Instead of sequential queries:
const flags = await prisma.featureFlags.findFirst(...)
const settings = await prisma.sdkSettings.findFirst(...)
const configs = await prisma.businessConfig.findMany(...)

// Use parallel queries:
const [flags, settings, configs] = await Promise.all([
  prisma.featureFlags.findFirst(...),
  prisma.sdkSettings.findFirst(...),
  prisma.businessConfig.findMany(...)
])
```

**Expected Improvement**: ~30-50% reduction in database time

**Acceptance Criteria**:
- [ ] All SDK endpoints use parallel queries where applicable
- [ ] No functionality regression
- [ ] Performance improvement verified

---

#### TASK-004: Client-Side Caching in Flutter SDK

**Status**: :white_circle: Not Started
**Impact**: Medium (instant for returning users)
**Effort**: Medium

**Description**:
Cache SDK configuration data locally on the mobile device using SharedPreferences or Hive.

**Why This Helps**:
- Subsequent app launches use cached data immediately
- Network request happens in background
- App is functional instantly for returning users
- Reduces server load

**Implementation**:
```dart
class DevBridgeConfigCache {
  static const _cacheKey = 'devbridge_sdk_config';
  static const _cacheTimestampKey = 'devbridge_sdk_config_timestamp';
  static const _cacheDuration = Duration(hours: 1);

  Future<Map<String, dynamic>?> loadCached() async {
    final prefs = await SharedPreferences.getInstance();
    final cached = prefs.getString(_cacheKey);
    if (cached == null) return null;

    final timestamp = prefs.getInt(_cacheTimestampKey) ?? 0;
    final cachedAt = DateTime.fromMillisecondsSinceEpoch(timestamp);

    // Return cached data (even if stale, will refresh in background)
    return jsonDecode(cached);
  }

  Future<void> save(Map<String, dynamic> config) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cacheKey, jsonEncode(config));
    await prefs.setInt(_cacheTimestampKey, DateTime.now().millisecondsSinceEpoch);
  }

  Future<bool> isStale() async {
    final prefs = await SharedPreferences.getInstance();
    final timestamp = prefs.getInt(_cacheTimestampKey);
    if (timestamp == null) return true;

    final cachedAt = DateTime.fromMillisecondsSinceEpoch(timestamp);
    return DateTime.now().difference(cachedAt) > _cacheDuration;
  }
}

// Usage in DevBridge.init():
Future<void> init() async {
  // 1. Load cached config immediately (non-blocking UI)
  final cached = await _cache.loadCached();
  if (cached != null) {
    _applyConfig(cached);
    _initialized = true; // App can proceed
  }

  // 2. Fetch fresh config in background
  _fetchAndUpdateConfig();
}
```

**Expected Improvement**: Near-instant startup for returning users

**Acceptance Criteria**:
- [ ] SDK caches configuration locally
- [ ] Cached data used on subsequent launches
- [ ] Background refresh when cache is stale
- [ ] Cache invalidation on config changes (optional)

---

### P2 - Medium Priority

These optimizations provide incremental improvements.

---

#### TASK-005: ETag/Conditional Requests

**Status**: :white_circle: Not Started
**Impact**: Medium (70-80% for unchanged configs)
**Effort**: Medium

**Description**:
Implement ETag headers so SDK can ask "has anything changed since my last fetch?" Server returns `304 Not Modified` if nothing changed.

**Why This Helps**:
- Mobile apps often restart (backgrounded, killed, etc.)
- If config hasn't changed, response is tiny (just headers)
- SDK uses cached local data
- Reduces bandwidth and parsing time

**Implementation**:

Server-side:
```typescript
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  const clientETag = request.headers.get('if-none-match')

  // Fetch data
  const data = await fetchSdkConfig(apiKey)

  // Generate ETag from data hash
  const etag = generateETag(data) // e.g., MD5 or SHA256 hash

  // Check if client has current version
  if (clientETag === etag) {
    return new NextResponse(null, { status: 304 })
  }

  return new NextResponse(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'ETag': etag,
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
```

Client-side (Flutter):
```dart
Future<void> _fetchConfig() async {
  final prefs = await SharedPreferences.getInstance();
  final cachedETag = prefs.getString('sdk_config_etag');

  final response = await http.get(
    Uri.parse('$endpoint/api/sdk-init'),
    headers: {
      'X-API-Key': apiKey,
      if (cachedETag != null) 'If-None-Match': cachedETag,
    },
  );

  if (response.statusCode == 304) {
    // Config unchanged, use cached data
    return;
  }

  if (response.statusCode == 200) {
    final newETag = response.headers['etag'];
    await prefs.setString('sdk_config_etag', newETag ?? '');
    await prefs.setString('sdk_config_data', response.body);
    _applyConfig(jsonDecode(response.body));
  }
}
```

**Expected Improvement**: ~70-80% reduction for unchanged configs

**Acceptance Criteria**:
- [ ] Server generates and returns ETag header
- [ ] Server returns 304 when ETag matches
- [ ] SDK sends If-None-Match header
- [ ] SDK handles 304 response correctly

---

#### TASK-006: Database Query Optimization

**Status**: :white_circle: Not Started
**Impact**: Low-Medium (10-20% reduction)
**Effort**: Low

**Description**:
Optimize Prisma queries to only fetch needed fields and ensure proper indexing.

**Why This Helps**:
- Reduces data transfer from database
- Faster query execution
- Lower memory usage

**Implementation**:

1. Use `select` to fetch only needed fields:
```typescript
// Instead of:
const flags = await prisma.featureFlags.findFirst({
  where: { projectId }
})

// Use select:
const flags = await prisma.featureFlags.findFirst({
  where: { projectId },
  select: {
    sdkEnabled: true,
    apiTracking: true,
    screenTracking: true,
    crashReporting: true,
    logging: true,
    // ... only the fields SDK needs
  }
})
```

2. Add database indexes (in schema.prisma):
```prisma
model Project {
  id     String @id @default(cuid())
  apiKey String @unique

  @@index([apiKey]) // Already unique, but explicit index
}

model FeatureFlags {
  projectId String @unique

  @@index([projectId])
}

model BusinessConfig {
  projectId String

  @@index([projectId])
  @@index([projectId, category]) // For category filtering
}
```

**Expected Improvement**: ~10-20% reduction in query time

**Acceptance Criteria**:
- [ ] All SDK queries use `select` for needed fields only
- [ ] Database indexes verified/added
- [ ] Query performance tested

---

### P3 - Low Priority

These optimizations can be considered for future iterations.

---

#### TASK-007: Lazy Loading Non-Critical Data

**Status**: :white_circle: Not Started
**Impact**: Low (50% perceived improvement)
**Effort**: Medium

**Description**:
Only fetch feature flags on SDK init (critical for startup), load other configs after app renders first screen.

**Why This Helps**:
- Feature flags are needed immediately (to know what to enable)
- Business config can be loaded after first screen renders
- User sees app faster (perceived performance)

**Implementation**:
```dart
// Phase 1: Critical data only (blocks init)
await DevBridge.init(
  apiKey: 'xxx',
  loadBusinessConfig: false, // Defer to phase 2
);

// App renders first screen immediately

// Phase 2: Non-critical data (background)
await DevBridge.instance.loadBusinessConfig();
await DevBridge.instance.loadLocalization();
```

**Expected Improvement**: ~50% perceived improvement in app startup

---

#### TASK-008: Vercel Edge Functions

**Status**: :white_circle: Not Started
**Impact**: Low-Medium (200-400ms reduction)
**Effort**: High

**Description**:
Convert SDK endpoints to Edge Runtime instead of Node.js runtime for faster cold starts.

**Why This Helps**:
- Edge functions have faster cold starts (~50ms vs ~500ms)
- Run closer to users globally
- Lower latency

**Limitations**:
- Requires edge-compatible database client
- Prisma has experimental edge support
- May need to switch to @vercel/postgres or Prisma Accelerate

**Implementation**:
```typescript
// Add to route file
export const runtime = 'edge'

// Use edge-compatible DB client
import { PrismaClient } from '@prisma/client/edge'
// OR
import { sql } from '@vercel/postgres'
```

**Expected Improvement**: ~200-400ms reduction

---

#### TASK-009: Regional Database Deployment

**Status**: :white_circle: Not Started
**Impact**: Low (50-100ms reduction)
**Effort**: Low

**Description**:
Ensure database and Vercel functions are in the same region.

**Current Setup**:
- Supabase: `eu-central-2` (Frankfurt)
- Vercel: Dynamic (depends on user location)

**Options**:
1. Pin Vercel function region to match database
2. Use Supabase Read Replicas for multi-region
3. Use Prisma Accelerate for connection pooling

**Expected Improvement**: ~50-100ms per query

---

## Implementation Details

### Recommended Implementation Order

```
Phase 1 (Week 1): Critical Impact
├── TASK-001: Combined SDK Init Endpoint
└── TASK-002: Edge Caching Headers

Phase 2 (Week 2): High Impact
├── TASK-003: Parallel Database Queries
└── TASK-004: Client-Side Caching (Flutter)

Phase 3 (Week 3): Medium Impact
├── TASK-005: ETag/Conditional Requests
└── TASK-006: Database Query Optimization

Phase 4 (Future): Low Priority
├── TASK-007: Lazy Loading
├── TASK-008: Edge Functions
└── TASK-009: Regional Database
```

### Risk Assessment

| Task | Risk | Mitigation |
|------|------|------------|
| TASK-001 | SDK breaking change | Version new endpoint, maintain old endpoints |
| TASK-002 | Stale data served | Short cache TTL (60s), stale-while-revalidate |
| TASK-004 | Cache corruption | Validate cached data, fallback to fresh fetch |
| TASK-008 | Prisma edge compatibility | Test thoroughly, have fallback to Node runtime |

---

## Expected Outcomes

### After Phase 1 (P0 Tasks)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| SDK Init (uncached) | 4,886ms | ~1,500ms | 70% |
| SDK Init (cached) | 4,886ms | ~100ms | 98% |
| Requests per init | 3 | 1 | 67% |

### After Phase 2 (P1 Tasks)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| SDK Init (uncached) | 4,886ms | ~1,200ms | 75% |
| SDK Init (cached) | 4,886ms | ~50ms | 99% |
| Returning user startup | ~5s | Instant | 100% |

### After All Phases

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| SDK Init (uncached) | 4,886ms | < 1,000ms | :green_circle: |
| SDK Init (cached) | 4,886ms | < 100ms | :green_circle: |
| p95 SDK Init | 6,787ms | < 2,000ms | :green_circle: |

---

## Performance Testing

### Running Performance Tests

Test scripts are located in `/scripts/`:

```bash
# Sequential endpoint testing
python3 scripts/api-perf-test.py

# Concurrent SDK init simulation
python3 scripts/api-concurrent-test.py
```

### Monitoring Performance in Production

1. **Vercel Analytics**: Monitor function duration in Vercel dashboard
2. **Custom Logging**: Add timing logs to SDK endpoints
3. **SDK Metrics**: Collect init timing in Flutter SDK

### Regression Testing

After each optimization, run the test scripts and compare:

```bash
# Before optimization
python3 scripts/api-concurrent-test.py > before.txt

# After optimization
python3 scripts/api-concurrent-test.py > after.txt

# Compare results
diff before.txt after.txt
```

---

## References

- [Vercel Edge Caching](https://vercel.com/docs/concepts/edge-network/caching)
- [HTTP Caching - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Flutter SharedPreferences](https://pub.dev/packages/shared_preferences)

---

*Last Updated: December 2024*
*Maintained by DevBridge Team*
