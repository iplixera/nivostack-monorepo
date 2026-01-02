# Performance Optimization Tasks

Trackable tasks extracted from the [Performance Optimization Guide](./PERFORMANCE_OPTIMIZATION.md).

---

## Task Overview

| ID | Task | Priority | Impact | Effort | Status |
|----|------|----------|--------|--------|--------|
| TASK-001 | Combined SDK Init Endpoint | P0 | High | Medium | :white_circle: Not Started |
| TASK-002 | Edge Caching Headers | P0 | High | Low | :white_circle: Not Started |
| TASK-003 | Parallel Database Queries | P1 | Medium | Low | :white_circle: Not Started |
| TASK-004 | Client-Side Caching (Flutter) | P1 | Medium | Medium | :white_circle: Not Started |
| TASK-005 | ETag/Conditional Requests | P2 | Medium | Medium | :white_circle: Not Started |
| TASK-006 | Database Query Optimization | P2 | Low | Low | :white_circle: Not Started |
| TASK-007 | Lazy Loading Non-Critical Data | P3 | Low | Medium | :white_circle: Not Started |
| TASK-008 | Vercel Edge Functions | P3 | Low | High | :white_circle: Not Started |
| TASK-009 | Regional Database | P3 | Low | Low | :white_circle: Not Started |

**Legend:**
- :white_circle: Not Started
- :large_blue_circle: In Progress
- :green_circle: Completed
- :red_circle: Blocked

---

## P0 - Critical Priority

### TASK-001: Combined SDK Init Endpoint

**Priority**: P0 - Critical
**Impact**: High (60-70% reduction in SDK init time)
**Effort**: Medium
**Status**: :white_circle: Not Started

#### Description
Create a single `/api/sdk-init` endpoint that returns feature flags, SDK settings, AND business config in one HTTP response instead of three separate requests.

#### Acceptance Criteria
- [ ] Create `/api/sdk-init/route.ts` endpoint
- [ ] Endpoint returns combined response: `{ featureFlags, sdkSettings, businessConfig, timestamp }`
- [ ] Use `Promise.all()` for parallel database queries
- [ ] Update Flutter SDK to use new endpoint
- [ ] Maintain backward compatibility (old endpoints still work)
- [ ] Add cache headers to response
- [ ] Performance test shows SDK init < 2s

#### Technical Details
**Files to Create:**
- `src/app/api/sdk-init/route.ts`

**Files to Modify:**
- `packages/devbridge_sdk/lib/src/api_client.dart`
- `packages/devbridge_sdk/lib/src/devbridge.dart`

#### Notes
This is the highest impact optimization. Should be implemented first.

---

### TASK-002: Edge Caching with Cache Headers

**Priority**: P0 - Critical
**Impact**: High (80-90% reduction for cache hits)
**Effort**: Low
**Status**: :white_circle: Not Started

#### Description
Add HTTP cache headers to SDK endpoints to enable Vercel's edge network to cache responses globally.

#### Acceptance Criteria
- [ ] Add `Cache-Control` header to `/api/sdk-init` (or all SDK endpoints)
- [ ] Use `public, s-maxage=60, stale-while-revalidate=300`
- [ ] Verify caching works via Vercel dashboard
- [ ] Monitor cache HIT rate
- [ ] Document cache invalidation strategy

#### Technical Details
**Files to Modify:**
- `src/app/api/sdk-init/route.ts` (after TASK-001)
- `src/app/api/feature-flags/route.ts`
- `src/app/api/sdk-settings/route.ts`
- `src/app/api/business-config/route.ts`

#### Notes
Can be implemented alongside or after TASK-001. Very low effort, high impact.

---

## P1 - High Priority

### TASK-003: Parallel Database Queries

**Priority**: P1 - High
**Impact**: Medium (30-50% reduction in DB time)
**Effort**: Low
**Status**: :white_circle: Not Started

#### Description
Within endpoints, run all database queries in parallel using `Promise.all()` instead of sequentially.

#### Acceptance Criteria
- [ ] Audit all SDK endpoints for sequential queries
- [ ] Convert to parallel queries where applicable
- [ ] No functionality regression
- [ ] Performance improvement verified (measure before/after)

#### Technical Details
**Files to Modify:**
- `src/app/api/feature-flags/route.ts`
- `src/app/api/sdk-settings/route.ts`
- `src/app/api/business-config/route.ts`
- `src/app/api/sdk-init/route.ts` (if created)

#### Notes
If TASK-001 is implemented, this mainly applies to the new combined endpoint.

---

### TASK-004: Client-Side Caching in Flutter SDK

**Priority**: P1 - High
**Impact**: Medium (instant startup for returning users)
**Effort**: Medium
**Status**: :white_circle: Not Started

#### Description
Cache SDK configuration data locally on the mobile device using SharedPreferences. Load cached data immediately on startup, fetch fresh data in background.

#### Acceptance Criteria
- [ ] Create `DevBridgeConfigCache` class
- [ ] Cache SDK init response locally
- [ ] Load cached config on init (non-blocking)
- [ ] Fetch fresh config in background
- [ ] Update cache when new data received
- [ ] Handle cache corruption gracefully
- [ ] Returning user startup is near-instant

#### Technical Details
**Files to Create:**
- `packages/devbridge_sdk/lib/src/config_cache.dart`

**Files to Modify:**
- `packages/devbridge_sdk/lib/src/devbridge.dart`
- `packages/devbridge_sdk/pubspec.yaml` (ensure shared_preferences)

#### Notes
Works best in combination with TASK-001 (combined endpoint).

---

## P2 - Medium Priority

### TASK-005: ETag/Conditional Requests

**Priority**: P2 - Medium
**Impact**: Medium (70-80% for unchanged configs)
**Effort**: Medium
**Status**: :white_circle: Not Started

#### Description
Implement ETag headers so SDK can ask "has anything changed?" Server returns 304 Not Modified if unchanged.

#### Acceptance Criteria
- [ ] Server generates ETag from config data hash
- [ ] Server checks `If-None-Match` header
- [ ] Server returns 304 when ETag matches
- [ ] SDK stores and sends ETag
- [ ] SDK handles 304 response (uses cached data)
- [ ] ETag regenerates when config changes

#### Technical Details
**Server Files:**
- `src/app/api/sdk-init/route.ts`

**SDK Files:**
- `packages/devbridge_sdk/lib/src/api_client.dart`
- `packages/devbridge_sdk/lib/src/config_cache.dart`

---

### TASK-006: Database Query Optimization

**Priority**: P2 - Medium
**Impact**: Low-Medium (10-20% reduction)
**Effort**: Low
**Status**: :white_circle: Not Started

#### Description
Optimize Prisma queries to only fetch needed fields and ensure proper database indexing.

#### Acceptance Criteria
- [ ] Add `select` clauses to all SDK queries
- [ ] Review and add missing database indexes
- [ ] Run Prisma migration for indexes
- [ ] Verify query performance improvement

#### Technical Details
**Files to Modify:**
- `prisma/schema.prisma` (add indexes)
- All SDK API route files (add select clauses)

---

## P3 - Low Priority

### TASK-007: Lazy Loading Non-Critical Data

**Priority**: P3 - Low
**Impact**: Low (50% perceived improvement)
**Effort**: Medium
**Status**: :white_circle: Not Started

#### Description
Only fetch feature flags on SDK init (critical), load business config after first screen renders.

#### Acceptance Criteria
- [ ] SDK init only fetches feature flags
- [ ] Business config loaded asynchronously after init
- [ ] SDK provides callback when all configs ready
- [ ] App renders first screen faster

#### Technical Details
**Files to Modify:**
- `packages/devbridge_sdk/lib/src/devbridge.dart`

---

### TASK-008: Vercel Edge Functions

**Priority**: P3 - Low
**Impact**: Low-Medium (200-400ms reduction)
**Effort**: High
**Status**: :white_circle: Not Started

#### Description
Convert SDK endpoints to Edge Runtime for faster cold starts.

#### Acceptance Criteria
- [ ] Research Prisma edge compatibility
- [ ] Convert one endpoint as POC
- [ ] Test functionality and performance
- [ ] Roll out to all SDK endpoints if successful

#### Technical Details
Requires edge-compatible database client. May need Prisma Accelerate or @vercel/postgres.

---

### TASK-009: Regional Database Deployment

**Priority**: P3 - Low
**Impact**: Low (50-100ms reduction)
**Effort**: Low
**Status**: :white_circle: Not Started

#### Description
Ensure database and Vercel functions are in same region to minimize latency.

#### Acceptance Criteria
- [ ] Document current regions (DB: eu-central-2)
- [ ] Research Vercel function region configuration
- [ ] Either pin Vercel to EU or add Supabase read replica
- [ ] Verify latency improvement

---

## Implementation Schedule

### Phase 1: Critical (Target: 70% improvement)
| Task | Status | Notes |
|------|--------|-------|
| TASK-001 | :white_circle: | Start here |
| TASK-002 | :white_circle: | Low effort, do with TASK-001 |

### Phase 2: High Priority (Target: 90% improvement for returning users)
| Task | Status | Notes |
|------|--------|-------|
| TASK-003 | :white_circle: | May be included in TASK-001 |
| TASK-004 | :white_circle: | Big win for returning users |

### Phase 3: Medium Priority (Incremental gains)
| Task | Status | Notes |
|------|--------|-------|
| TASK-005 | :white_circle: | Bandwidth savings |
| TASK-006 | :white_circle: | Quick wins |

### Phase 4: Future (When needed)
| Task | Status | Notes |
|------|--------|-------|
| TASK-007 | :white_circle: | Perceived performance |
| TASK-008 | :white_circle: | Requires research |
| TASK-009 | :white_circle: | Depends on user locations |

---

## Performance Baseline

**Current State (December 2024):**
- Mean SDK Init: 4,886ms
- p95 SDK Init: 6,787ms
- Individual endpoints: 900-1,700ms each

**Target After Phase 1:**
- Mean SDK Init (uncached): < 2,000ms
- Mean SDK Init (cached): < 200ms

**Target After Phase 2:**
- Mean SDK Init (uncached): < 1,500ms
- Mean SDK Init (cached): < 100ms
- Returning user startup: Instant

---

## Running Performance Tests

```bash
# Navigate to project
cd /Users/karim-f/Code/devbridge

# Sequential endpoint test
python3 scripts/api-perf-test.py

# Concurrent SDK init simulation
python3 scripts/api-concurrent-test.py
```

---

*Last Updated: December 2024*
