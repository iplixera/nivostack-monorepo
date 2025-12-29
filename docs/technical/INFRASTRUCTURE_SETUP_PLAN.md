# NivoStack Infrastructure Setup Plan

**Domain**: nivostack.com  
**Vercel Team**: NivoStack (team_MBPi3LRUH16KWHeCO2JAQtxs)  
**DNS Provider**: GoDaddy  
**Last Updated**: December 30, 2024

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Monorepo Structure Analysis](#monorepo-structure-analysis)
3. [Vercel Projects Mapping](#vercel-projects-mapping)
4. [DNS Configuration Plan](#dns-configuration-plan)
5. [SDK Release Strategy](#sdk-release-strategy)
6. [Folder-to-Project Mapping](#folder-to-project-mapping)
7. [Performance Considerations](#performance-considerations)
8. [Implementation Steps](#implementation-steps)
9. [Recommendations](#recommendations)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    NivoStack Monorepo                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Brand Website   │  │  Admin Dashboard │                │
│  │  nivostack.com   │  │  studio.nivostack.com │          │
│  │  (Marketing)      │  │  (Console/Studio)    │          │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Ingest API       │  │  Control API      │                │
│  │  ingest.nivostack.com │  api.nivostack.com │              │
│  │  (Data Ingestion) │  │  (Config/CRUD)     │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Domain Structure

| Domain | Purpose | Vercel Project | Traffic Type |
|--------|---------|----------------|--------------|
| `nivostack.com` | Marketing website | `nivostack-website` | Public (low volume) |
| `www.nivostack.com` | Marketing website (www) | `nivostack-website` | Public (low volume) |
| `studio.nivostack.com` | Admin dashboard | `nivostack-studio` | Authenticated users |
| `ingest.nivostack.com` | Data ingestion | `nivostack-ingest-api` | High volume (SDKs) |
| `api.nivostack.com` | Configuration & CRUD | `nivostack-control-api` | Medium volume (SDKs + Dashboard) |

---

## 📁 Monorepo Structure Analysis

### Current Structure

```
nivostack-monorepo-checkout/
├── dashboard/                    # Next.js app (UI + APIs)
│   ├── src/
│   │   └── app/
│   │       ├── api/              # All API routes (shared)
│   │       └── (dashboard)/      # Dashboard UI pages
│   ├── prisma/                   # Database schema (shared)
│   └── package.json
├── packages/
│   ├── sdk-flutter/              # Flutter SDK
│   └── sdk-android/              # Android SDK
├── docs/                         # Documentation
├── scripts/                      # Development scripts
├── prisma/                       # Root schema (shared)
└── vercel.json                   # Current Vercel config
```

### Key Observations

✅ **Strengths**:
- Monorepo structure is clean
- Shared Prisma schema at root
- SDKs are properly separated
- API routes are centralized

⚠️ **Challenges**:
- Single `dashboard/` folder contains both UI and APIs
- Need to separate concerns for different Vercel projects
- No branding website folder yet
- API routes need to be filtered per project

---

## 🚀 Vercel Projects Mapping

### Project 1: Brand Website (`nivostack-website`)

**Purpose**: Marketing website, landing pages, documentation  
**Domain**: `nivostack.com`, `www.nivostack.com`  
**Root Directory**: `website/` (to be created)  
**Framework**: Next.js (Static/SSG)  
**Cost**: Free tier (Hobby plan)  
**Traffic**: Low volume (public marketing)

**Pages**:
- `/` - Homepage
- `/features` - Features page
- `/pricing` - Pricing page
- `/about` - About page
- `/contact` - Contact page
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/docs` - Documentation (optional)

**Build Command**: `cd website && pnpm install && pnpm build`  
**Output Directory**: `website/.next`

**Environment Variables**: None (static site)

---

### Project 2: Admin Dashboard (`nivostack-studio`)

**Purpose**: NivoStack Studio - Admin console for managing projects  
**Domain**: `studio.nivostack.com`  
**Root Directory**: `dashboard/`  
**Framework**: Next.js (App Router)  
**Cost**: Pro plan ($20/month)  
**Traffic**: Medium volume (authenticated users)

**Routes**:
- All UI pages: `/`, `/login`, `/register`, `/dashboard/*`, `/projects/*`, etc.
- Dashboard API routes (for UI data fetching)

**Build Command**: `cd dashboard && pnpm install && pnpm build`  
**Output Directory**: `dashboard/.next`

**Environment Variables**:
```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

**Vercel Config**: `dashboard/vercel-studio.json`

---

### Project 3: Ingest API (`nivostack-ingest-api`)

**Purpose**: High-volume data ingestion endpoints (SDK → Backend)  
**Domain**: `ingest.nivostack.com`  
**Root Directory**: `dashboard/` (shared codebase)  
**Framework**: Next.js API Routes  
**Cost**: Pro plan ($20/month)  
**Traffic**: High volume (SDK telemetry)

**API Routes** (POST/PUT/PATCH only):
- `/api/devices` (POST) - Device registration
- `/api/traces` (POST) - API trace ingestion
- `/api/logs` (POST) - Log ingestion
- `/api/crashes` (POST) - Crash report ingestion
- `/api/sessions` (POST, PUT, PATCH) - Session tracking
- `/api/devices/[id]/user` (PATCH, DELETE) - User association

**Build Command**: `cd dashboard && pnpm install && pnpm build`  
**Output Directory**: `dashboard/.next`

**Environment Variables**:
```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-jwt-secret
```

**Vercel Config**: `dashboard/vercel-ingest.json` (route filtering)

---

### Project 4: Control API (`nivostack-control-api`)

**Purpose**: Configuration and CRUD operations (SDK config + Dashboard)  
**Domain**: `api.nivostack.com`  
**Root Directory**: `dashboard/` (shared codebase)  
**Framework**: Next.js API Routes  
**Cost**: Pro plan ($20/month)  
**Traffic**: Medium volume (SDK config + Dashboard CRUD)

**API Routes** (GET + CRUD):
- `/api/sdk-init` (GET) - SDK initialization
- `/api/business-config` (GET) - Business configuration
- `/api/localization/*` (GET) - Localization data
- `/api/feature-flags` (GET) - Feature flags
- `/api/sdk-settings` (GET) - SDK settings
- `/api/projects` (CRUD) - Project management
- `/api/devices` (GET, DELETE) - Device management
- `/api/sessions` (GET) - Session queries
- `/api/traces` (GET) - Trace queries
- `/api/logs` (GET) - Log queries
- `/api/crashes` (GET) - Crash queries
- `/api/admin/*` (All admin endpoints)
- `/api/auth/*` (Authentication)
- `/api/subscription/*` (Subscription management)

**Build Command**: `cd dashboard && pnpm install && pnpm build`  
**Output Directory**: `dashboard/.next`

**Environment Variables**:
```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Vercel Config**: `dashboard/vercel-control.json` (route filtering)

---

## 🌐 DNS Configuration Plan

### GoDaddy DNS Records Setup

**Note**: DNS records will be configured after Vercel projects are created and domains are added.

#### Step 1: Add Domains in Vercel

First, add domains to each Vercel project (via Vercel Dashboard or CLI):

```bash
# Brand Website
vercel domains add nivostack.com --project nivostack-website --scope team_MBPi3LRUH16KWHeCO2JAQtxs
vercel domains add www.nivostack.com --project nivostack-website --scope team_MBPi3LRUH16KWHeCO2JAQtxs

# Admin Dashboard
vercel domains add studio.nivostack.com --project nivostack-studio --scope team_MBPi3LRUH16KWHeCO2JAQtxs

# Ingest API
vercel domains add ingest.nivostack.com --project nivostack-ingest-api --scope team_MBPi3LRUH16KWHeCO2JAQtxs

# Control API
vercel domains add api.nivostack.com --project nivostack-control-api --scope team_MBPi3LRUH16KWHeCO2JAQtxs
```

#### Step 2: Get Vercel DNS Values

After adding domains, Vercel will provide DNS configuration values. Get these from:
- Vercel Dashboard → Project → Settings → Domains → DNS Configuration

#### Step 3: Configure GoDaddy DNS

**GoDaddy DNS Management** → `nivostack.com` → DNS Records

| Type | Name | Value | TTL | Notes |
|------|------|-------|-----|-------|
| A | @ | `76.76.21.21` | 3600 | Vercel IP (get from Vercel) |
| CNAME | www | `cname.vercel-dns.com` | 3600 | Replace with actual Vercel CNAME |
| CNAME | studio | `cname.vercel-dns.com` | 3600 | Replace with actual Vercel CNAME |
| CNAME | ingest | `cname.vercel-dns.com` | 3600 | Replace with actual Vercel CNAME |
| CNAME | api | `cname.vercel-dns.com` | 3600 | Replace with actual Vercel CNAME |

**Important**: 
- Replace `cname.vercel-dns.com` with actual CNAME values from Vercel
- A record IP will be provided by Vercel
- DNS propagation takes 24-48 hours

---

## 📦 SDK Release Strategy

### Flutter SDK

**Package Manager**: pub.dev  
**Release Method**: GitHub Releases + pub.dev publishing  
**Versioning**: Semantic Versioning (MAJOR.MINOR.PATCH)

#### Release Process

1. **Create Release Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.0.0
   ```

2. **Update Version**
   - File: `packages/sdk-flutter/pubspec.yaml`
   ```yaml
   version: 1.0.0
   ```

3. **Update CHANGELOG**
   - File: `packages/sdk-flutter/CHANGELOG.md`

4. **Commit & Tag**
   ```bash
   git add .
   git commit -m "chore: prepare release v1.0.0"
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin release/v1.0.0 --tags
   ```

5. **Create GitHub Release**
   - Go to GitHub → Releases → New Release
   - Tag: `v1.0.0`
   - Title: `v1.0.0 - Initial Public Release`
   - Description: Copy from CHANGELOG.md
   - Attach: SDK artifacts (if any)

6. **Publish to pub.dev**
   ```bash
   cd packages/sdk-flutter
   flutter pub publish --dry-run  # Test first
   flutter pub publish             # Actual publish
   ```

#### SDK API Endpoints Configuration

**Flutter SDK** (`packages/sdk-flutter/lib/src/nivostack.dart`):

```dart
class NivoStack {
  // Ingest API (for telemetry)
  static const String ingestEndpoint = 'https://ingest.nivostack.com';
  
  // Control API (for configuration)
  static const String controlEndpoint = 'https://api.nivostack.com';
  
  // Initialize SDK
  static Future<void> init({
    required String apiKey,
    String? ingestUrl,
    String? controlUrl,
  }) async {
    final ingest = ingestUrl ?? ingestEndpoint;
    final control = controlUrl ?? controlEndpoint;
    // ... initialization
  }
}
```

### Android SDK

**Package Manager**: Maven Central / Sonatype  
**Release Method**: GitHub Releases + Maven publishing  
**Versioning**: Semantic Versioning

#### Release Process

1. **Update Version**
   - File: `packages/sdk-android/nivostack-core/build.gradle.kts`
   ```kotlin
   version = "1.0.0"
   ```

2. **Build & Publish**
   ```bash
   cd packages/sdk-android
   ./gradlew publishReleasePublicationToSonatypeRepository
   ```

3. **Create GitHub Release** (same as Flutter)

### iOS SDK

**Package Manager**: CocoaPods / Swift Package Manager  
**Release Method**: GitHub Releases  
**Versioning**: Semantic Versioning

**Note**: iOS SDK structure needs to be defined (currently not in monorepo)

---

## 🗺️ Folder-to-Project Mapping

### Current Structure → Vercel Projects

| Folder/Path | Vercel Project | Purpose | Notes |
|-------------|----------------|---------|-------|
| `website/` (new) | `nivostack-website` | Brand website | To be created |
| `dashboard/src/app/(dashboard)/` | `nivostack-studio` | Dashboard UI | All UI pages |
| `dashboard/src/app/api/devices` (POST) | `nivostack-ingest-api` | Device registration | Route filtering |
| `dashboard/src/app/api/traces` (POST) | `nivostack-ingest-api` | Trace ingestion | Route filtering |
| `dashboard/src/app/api/logs` (POST) | `nivostack-ingest-api` | Log ingestion | Route filtering |
| `dashboard/src/app/api/crashes` (POST) | `nivostack-ingest-api` | Crash ingestion | Route filtering |
| `dashboard/src/app/api/sessions` (POST/PUT/PATCH) | `nivostack-ingest-api` | Session tracking | Route filtering |
| `dashboard/src/app/api/sdk-init` (GET) | `nivostack-control-api` | SDK initialization | Route filtering |
| `dashboard/src/app/api/business-config` (GET) | `nivostack-control-api` | Business config | Route filtering |
| `dashboard/src/app/api/localization/*` (GET) | `nivostack-control-api` | Localization | Route filtering |
| `dashboard/src/app/api/feature-flags` (GET) | `nivostack-control-api` | Feature flags | Route filtering |
| `dashboard/src/app/api/projects` (CRUD) | `nivostack-control-api` | Project CRUD | Route filtering |
| `dashboard/src/app/api/admin/*` | `nivostack-control-api` | Admin APIs | Route filtering |
| `dashboard/src/app/api/auth/*` | `nivostack-control-api` | Authentication | Route filtering |
| `prisma/` | All projects | Shared schema | Used by all |

### Route Filtering Strategy

Since all projects share the `dashboard/` folder, we'll use Vercel route filtering:

**Ingest API** (`vercel-ingest.json`):
- Only expose POST/PUT/PATCH routes
- Block GET routes (except health check)
- Block dashboard UI routes

**Control API** (`vercel-control.json`):
- Expose GET routes (SDK config)
- Expose CRUD routes (Dashboard)
- Block ingest-only routes

**Studio** (`vercel-studio.json`):
- Expose UI routes
- Expose dashboard API routes (for UI data fetching)
- Block ingest routes

---

## ⚡ Performance Considerations

### 1. Database Connection Pooling

**Issue**: All 4 projects share the same database  
**Solution**: Use connection pooling (already configured via `POSTGRES_PRISMA_URL`)

**Recommendation**: 
- Monitor connection pool usage
- Consider separate databases if traffic exceeds 1000 concurrent connections

### 2. Cold Start Optimization

**Issue**: Serverless functions have cold starts  
**Solution**: 
- Use Edge Functions for high-frequency endpoints (SDK init)
- Implement caching headers (already done)
- Consider keeping functions warm (Vercel Pro feature)

**Recommendation**:
- Move `/api/sdk-init` to Edge Runtime
- Cache responses aggressively (already implemented)

### 3. API Rate Limiting

**Issue**: Ingest API could be abused  
**Solution**: Implement rate limiting per API key

**Recommendation**:
- Add rate limiting middleware
- Use Vercel Edge Config for rate limit counters
- Set limits: 1000 requests/minute per API key

### 4. Caching Strategy

**Current**: ETag and Cache-Control headers implemented  
**Recommendation**:
- ✅ Keep current caching for SDK config endpoints
- ✅ Add Redis for session caching (future)
- ✅ Use Vercel Edge Cache for static assets

### 5. Cost Optimization

**Current Setup**: 4 projects × $20/month = $80/month  
**Recommendation**:
- Start with 1 Pro plan ($20/month) for Studio
- Use Hobby plan (free) for website
- Upgrade Ingest/Control to Pro only when traffic justifies it

**Alternative**: Start with single project, split later when needed

---

## 🛠️ Implementation Steps

### Phase 1: Create Brand Website (Week 1)

- [ ] Create `website/` directory
- [ ] Initialize Next.js project
- [ ] Create marketing pages (home, features, pricing, about, contact, privacy, terms)
- [ ] Create `website/vercel.json`
- [ ] Test locally
- [ ] Create Vercel project `nivostack-website`
- [ ] Deploy to preview
- [ ] Configure domain `nivostack.com`

### Phase 2: Setup Vercel Projects (Week 1-2)

- [ ] Create `nivostack-studio` project
- [ ] Create `nivostack-ingest-api` project
- [ ] Create `nivostack-control-api` project
- [ ] Link all projects to GitHub repository
- [ ] Configure root directories
- [ ] Set environment variables for each project

### Phase 3: Configure Route Filtering (Week 2)

- [ ] Create `dashboard/vercel-studio.json`
- [ ] Create `dashboard/vercel-ingest.json` (route filtering)
- [ ] Create `dashboard/vercel-control.json` (route filtering)
- [ ] Test route filtering locally
- [ ] Deploy and verify routes work correctly

### Phase 4: DNS Configuration (Week 2)

- [ ] Add domains in Vercel Dashboard
- [ ] Get DNS configuration values from Vercel
- [ ] Configure GoDaddy DNS records
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Verify all domains work

### Phase 5: SDK Configuration (Week 2-3)

- [ ] Update Flutter SDK endpoints
- [ ] Update Android SDK endpoints
- [ ] Update iOS SDK endpoints (when created)
- [ ] Test SDKs with new endpoints
- [ ] Update SDK documentation

### Phase 6: SDK Release Setup (Week 3)

- [ ] Setup pub.dev publisher account
- [ ] Configure GitHub Actions for releases
- [ ] Create release workflow documentation
- [ ] Test release process (dry run)

### Phase 7: Monitoring & Optimization (Week 4)

- [ ] Setup Vercel Analytics
- [ ] Configure error tracking
- [ ] Monitor performance metrics
- [ ] Optimize based on metrics

---

## 💡 Recommendations

### 1. Start Simple, Scale Later

**Recommendation**: Start with 2 projects instead of 4
- `nivostack-website` (Hobby - free)
- `nivostack-studio` (Pro - $20/month) - includes all APIs

**Rationale**:
- Lower initial cost ($20/month vs $80/month)
- Easier to manage
- Can split APIs later when traffic justifies it
- Current traffic doesn't require separation yet

**When to Split**:
- Ingest API: > 1M requests/month
- Control API: > 500K requests/month
- Need independent scaling

### 2. Use Middleware for Route Filtering (Alternative)

Instead of separate projects, use Next.js middleware:

```typescript
// dashboard/src/middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Ingest API
  if (hostname === 'ingest.nivostack.com') {
    // Only allow POST/PUT/PATCH
    if (!['POST', 'PUT', 'PATCH'].includes(request.method)) {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
  }
  
  // Control API
  if (hostname === 'api.nivostack.com') {
    // Allow GET and CRUD
    // Block ingest-only routes
  }
  
  // Studio
  if (hostname === 'studio.nivostack.com') {
    // Allow UI routes
  }
}
```

**Pros**: Single project, single deployment  
**Cons**: All traffic counts toward same quota

### 3. Database Strategy

**Current**: Single database for all projects  
**Recommendation**: Keep single database initially

**When to Split**:
- > 1000 concurrent connections
- Need different backup schedules
- Compliance requirements

### 4. SDK Endpoint Configuration

**Recommendation**: Make endpoints configurable

```dart
// Flutter SDK
class NivoStack {
  static Future<void> init({
    required String apiKey,
    String? ingestUrl,      // Default: https://ingest.nivostack.com
    String? controlUrl,     // Default: https://api.nivostack.com
  })
}
```

**Benefits**:
- Easy to test with different environments
- Can switch endpoints without SDK update
- Supports staging/preview environments

### 5. Branch Strategy for Deployments

**Recommendation**: Use existing Git Flow

- `main` → Production (all projects)
- `develop` → Staging (all projects)
- `feature/*` → Preview deployments

**Vercel Auto-Deploy**:
- `main` → Production
- `develop` → Staging
- `feature/*` → Preview

### 6. Environment Variables Management

**Recommendation**: Use Vercel Environment Variables

- Production: Set in Vercel Dashboard
- Preview: Inherit from Production (can override)
- Development: Use `.env.local`

**Best Practice**: 
- Never commit secrets
- Use Vercel CLI for bulk updates
- Document all required variables

---

## 📊 Cost Breakdown

### Option 1: Full Separation (4 Projects)

| Project | Plan | Cost/Month |
|---------|------|------------|
| nivostack-website | Hobby (Free) | $0 |
| nivostack-studio | Pro | $20 |
| nivostack-ingest-api | Pro | $20 |
| nivostack-control-api | Pro | $20 |
| **Total** | | **$60/month** |

### Option 2: Simplified (2 Projects) ⭐ Recommended

| Project | Plan | Cost/Month |
|---------|------|------------|
| nivostack-website | Hobby (Free) | $0 |
| nivostack-studio | Pro | $20 |
| **Total** | | **$20/month** |

### Option 3: Single Project (1 Project)

| Project | Plan | Cost/Month |
|---------|------|------------|
| nivostack-studio | Pro | $20 |
| **Total** | | **$20/month** |

**Recommendation**: Start with Option 2, upgrade to Option 1 when traffic justifies it.

---

## ✅ Success Criteria

### Phase 1 Complete When:
- [ ] Brand website deployed to `nivostack.com`
- [ ] All marketing pages accessible
- [ ] SSL certificates active

### Phase 2 Complete When:
- [ ] All 4 Vercel projects created
- [ ] Projects linked to GitHub
- [ ] Environment variables configured

### Phase 3 Complete When:
- [ ] Route filtering working correctly
- [ ] Each project only exposes intended routes
- [ ] No route conflicts

### Phase 4 Complete When:
- [ ] All domains resolving correctly
- [ ] SSL certificates active for all domains
- [ ] DNS propagation complete

### Phase 5 Complete When:
- [ ] SDKs updated with new endpoints
- [ ] SDKs tested with new infrastructure
- [ ] Documentation updated

### Phase 6 Complete When:
- [ ] Release process documented
- [ ] GitHub Actions configured (optional)
- [ ] pub.dev account ready

---

## 📚 Related Documentation

- [Vercel Deployment Strategy](./VERCEL_DEPLOYMENT_STRATEGY.md)
- [Development Workflow](../DEVELOPMENT_WORKFLOW.md)
- [SDK Publishing Guide](../best-practices/SDK_PUBLISHING_GUIDE.md)
- [Branching Strategy](../best-practices/BRANCHING_STRATEGY.md)

---

**Next Steps**: Review this plan, discuss recommendations, then proceed with Phase 1 implementation.

