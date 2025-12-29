# DevBridge Project Instructions

This document provides guidelines for AI assistants working on the DevBridge project.

---

## Active Tasks & Status

> **Update this section as tasks progress. This persists between conversations.**

### Current Sprint: Device Debug Mode

**Goal**: Enable selective API/session tracking for specific devices in production

**Documentation**: `docs/DEVICE_DEBUG_MODE.md`

#### Phase 1: Database & Backend
| Task ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| TASK-101 | Add device fields to schema (deviceCode, user, debug) | P0 | :green_circle: Done |
| TASK-102 | Add trackingMode to SdkSettings | P0 | :green_circle: Done |
| TASK-103 | Update device registration endpoint | P0 | :green_circle: Done |
| TASK-104 | Create user association endpoints | P1 | :green_circle: Done |
| TASK-105 | Create debug mode toggle endpoint | P0 | :green_circle: Done |
| TASK-106 | Update sdk-init to return deviceConfig | P0 | :green_circle: Done |
| TASK-107 | Add cron job for debug mode auto-expiry | P2 | :green_circle: Done |

#### Phase 2: Dashboard UI
| Task ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| TASK-201 | Update Devices list with new columns | P0 | :green_circle: Done |
| TASK-202 | Add search by device code, user email | P1 | :green_circle: Done |
| TASK-203 | Add debug mode toggle + modal | P0 | :green_circle: Done |
| TASK-204 | Add tracking mode selector in SDK Settings | P1 | :green_circle: Done |
| TASK-205 | Show active debug devices count | P2 | :green_circle: Done |

#### Phase 3: Flutter SDK
| Task ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| TASK-301 | Implement device code generator | P0 | :green_circle: Done |
| TASK-302 | Store/retrieve device code from SharedPreferences | P0 | :green_circle: Done |
| TASK-303 | Send device code in registration | P0 | :green_circle: Done |
| TASK-304 | Add setUser() and clearUser() methods | P1 | :green_circle: Done |
| TASK-305 | Parse deviceConfig from sdk-init response | P0 | :green_circle: Done |
| TASK-306 | Add isTrackingEnabled check before tracking | P0 | :green_circle: Done |
| TASK-307 | Expose deviceCode getter for app display | P1 | :green_circle: Done |

#### Phase 4: Documentation & Testing
| Task ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| TASK-401 | Update SDK README with new methods | P1 | :green_circle: Done |
| TASK-402 | Add example code for app integration | P2 | :green_circle: Done |
| TASK-403 | Test end-to-end workflow | P0 | :white_circle: Not Started |
| TASK-404 | Update CHANGELOG | P1 | :green_circle: Done |

**Status Legend**: :white_circle: Not Started | :large_blue_circle: In Progress | :green_circle: Done

**Version Targets**:
- Dashboard: v1.5.0
- Flutter SDK: v1.2.0

---

### Previous Sprint: API Performance Optimization - COMPLETED

**Goal**: Reduce SDK init time from ~5s to <1s - **ACHIEVED: 93% improvement!**

| Task ID | Description | Status |
|---------|-------------|--------|
| TASK-001 | Combined SDK Init Endpoint | :green_circle: Done |
| TASK-002 | Edge Caching Headers | :green_circle: Done |
| TASK-003 | Parallel Database Queries | :green_circle: Done |
| TASK-004 | Client-Side Caching (Flutter SDK) | :green_circle: Done |
| TASK-005 | ETag/Conditional Requests | :green_circle: Done |
| TASK-006 | Database Query Optimization | :green_circle: Done |

**Results**: 93.4% faster (4,367ms → 290ms)

### Recently Completed
- [x] **Delete Device Feature** - Dec 2024
  - DELETE `/api/devices/[id]` endpoint with cascade deletion
  - Deletes device and all associated data (logs, traces, sessions, crashes)
  - Confirmation modal in dashboard UI
  - Transaction-based atomic deletion
- [x] Database Query Optimization (TASK-006) - Dec 2024
- [x] ETag/Conditional Requests (TASK-005) - Dec 2024
- [x] Client-Side Caching in Flutter SDK (TASK-004) - Dec 2024
- [x] SDK Performance Optimization (TASK-001, TASK-002, TASK-003) - Dec 2024
- [x] Global SDK Kill Switch (`sdkEnabled` feature flag) - v1.3.0
- [x] Session Timeline View - v1.3.0
- [x] Performance testing and documentation

### Reference Documents
- **Device Debug Mode**: `docs/DEVICE_DEBUG_MODE.md`
- **Performance tasks**: `docs/PERFORMANCE_TASKS.md`
- **Performance analysis**: `docs/PERFORMANCE_OPTIMIZATION.md`
- **Test scripts**: `scripts/api-perf-test.py`, `scripts/api-concurrent-test.py`

### Quick Commands
```bash
# Run performance tests
python3 scripts/api-perf-test.py
python3 scripts/api-concurrent-test.py

# Deploy to production
vercel --prod

# Database migrations
pnpm prisma db push
```

---

## Project Overview

DevBridge is a mobile app monitoring and configuration platform consisting of:

1. **Dashboard (Next.js)** - Web application for viewing device data, logs, API traces, sessions, and managing configurations
2. **Flutter SDK** - Client SDK for mobile apps to send telemetry and receive configurations

## Architecture

### Dashboard (`/Users/karim-f/Code/devbridge`)

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT-based authentication (custom implementation)
- **Hosting**: Vercel
- **URL**: https://devbridge-eta.vercel.app

Key directories:
- `src/app/` - Next.js pages and API routes
- `src/app/api/` - Backend API endpoints
- `src/app/(dashboard)/` - Dashboard UI pages
- `src/components/` - React components
- `src/lib/` - Utilities (auth, prisma client)
- `prisma/` - Database schema and migrations

### Flutter SDK (`/Users/karim-f/Code/merchant-mobile-app/packages/devbridge_sdk`)

- **Framework**: Flutter/Dart
- **Dependencies**: dio, device_info_plus, package_info_plus, connectivity_plus

Key files:
- `lib/src/devbridge.dart` - Main SDK class
- `lib/src/api_client.dart` - HTTP client for API calls
- `lib/src/business_config.dart` - Business configuration client
- `lib/src/localization.dart` - Localization client
- `lib/src/interceptors/` - Dio interceptors
- `lib/src/observers/` - Route observers

## Database Models

Core models (see `prisma/schema.prisma`):

- **User** - Dashboard users
- **Project** - Mobile app projects (has API key)
- **Device** - Registered mobile devices
- **Session** - App sessions with context and metrics
- **Log** - App logs with levels and tags
- **Crash** - Crash reports
- **ApiTrace** - HTTP request/response traces
- **ApiConfig** - API endpoint cost configuration
- **BusinessConfig** - Remote key-value configs
- **Language/Translation** - Localization data
- **FeatureFlags** - SDK feature toggles
- **ApiAlert/MonitoredError** - Error monitoring

## API Endpoints

All endpoints under `/api/`:

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### SDK Endpoints (use `X-API-Key` header)
- `POST /api/devices` - Register device
- `POST /api/sessions` - Start session
- `PUT /api/sessions` - End session
- `PATCH /api/sessions` - Update session
- `POST /api/traces` - Send API traces
- `POST /api/logs` - Send logs
- `POST /api/crashes` - Report crash
- `GET /api/business-config` - Get configurations
- `GET /api/localization/translations` - Get translations
- `GET /api/feature-flags` - Get feature flags

### Dashboard Endpoints (use `Authorization: Bearer <token>`)
- `GET /api/projects` - List projects
- `GET /api/devices` - List devices
- `GET /api/devices/[id]` - Get device details
- `DELETE /api/devices/[id]` - Delete device and all associated data
- `PATCH /api/devices/[id]/debug` - Toggle device debug mode
- `GET /api/sessions` - List sessions
- `GET /api/sessions/[id]/timeline` - Get session timeline (screens, requests, logs)
- `GET /api/logs` - List logs
- `GET /api/traces` - List traces
- CRUD operations for configs, alerts, etc.

## Feature Flags

SDK features can be toggled per project:

- `apiTracking` - Track HTTP requests
- `screenTracking` - Track screen views
- `crashReporting` - Report crashes
- `logging` - Send logs
- `deviceTracking` - Register devices
- `sessionTracking` - Track sessions with context
- `businessConfig` - Enable remote config
- `localization` - Enable translations
- `offlineSupport` - Queue events when offline
- `batchEvents` - Batch events before sending

## Common Development Tasks

### Adding a New API Endpoint

1. Create route file in `src/app/api/[endpoint]/route.ts`
2. Add authentication check (JWT for dashboard, API key for SDK)
3. Implement CRUD operations using Prisma
4. Add corresponding method to Flutter SDK's `api_client.dart`
5. Add public method to `devbridge.dart` if needed

### Adding a Database Model

1. Add model to `prisma/schema.prisma`
2. Run `pnpm prisma db push` to update database
3. Run `pnpm prisma generate` to update client
4. Create API endpoints for the model
5. Add UI pages if needed in dashboard

### Updating Flutter SDK

1. Modify files in `packages/devbridge_sdk/lib/src/`
2. Run `flutter pub get` to check dependencies
3. Run `flutter analyze` to check for issues
4. Update README.md with new features
5. Test in merchant app

### Deployment

Dashboard deploys automatically via Vercel on push to main branch.

Flutter SDK is a local package - update version in `pubspec.yaml` when releasing.

## Code Patterns

### API Authentication

```typescript
// Dashboard endpoints - JWT auth
const authHeader = request.headers.get('authorization')
const token = authHeader.replace('Bearer ', '')
const payload = verifyToken(token)

// SDK endpoints - API key auth
const apiKey = request.headers.get('x-api-key')
const project = await prisma.project.findUnique({ where: { apiKey } })
```

### Feature Flag Checking (Flutter)

```dart
// Always check feature flags before operations
if (!_featureFlags.logging) return;
if (!_featureFlags.sessionTracking) return;
```

### Batch Events (Flutter)

```dart
if (_featureFlags.batchEvents) {
  _queue.add(event);
  if (_queue.length >= _maxQueueSize) {
    await _flushQueue();
  }
} else {
  await _apiClient.send(event);
}
```

## Important Notes

1. **API Key Security**: Never expose API keys in client code beyond the SDK
2. **Session Tokens**: Generated client-side, unique per session
3. **Device IDs**: Platform-specific (Android ID, iOS IDFV)
4. **Offline Support**: Re-queue failed requests when enabled
5. **Print Statements**: SDK print statements are for debugging, suppress in production lint rules

## Testing

- Dashboard: Manual testing via UI or API calls
- Flutter SDK: Use `flutter analyze` for static analysis
- Integration: Test SDK with real mobile app (merchant-mobile-app)

## Environment Variables

Dashboard (`.env.local`):
- `POSTGRES_PRISMA_URL` - Database connection (pooled)
- `POSTGRES_URL_NON_POOLING` - Database connection (direct)
- `JWT_SECRET` - JWT signing secret

Flutter SDK:
- Configured via `DevBridge.init()` parameters
