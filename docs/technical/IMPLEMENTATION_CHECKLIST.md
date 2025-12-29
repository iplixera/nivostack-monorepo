# NivoStack Deployment Implementation Checklist

## Final Recommendation Summary

### ✅ Architecture: 3 Separate Vercel Projects
- **Cost:** $20/month (one Pro plan)
- **Projects:**
  1. `nivostack-studio` → `studio.nivostack.com` (Dashboard)
  2. `nivostack-ingest-api` → `ingest.nivostack.com` (Ingest API)
  3. `nivostack-control-api` → `api.nivostack.com` (Control API)

### ✅ Middleware: Not Needed
- Each project handles its own routes via Vercel routing
- No middleware complexity required

### ✅ Authentication: Already Implemented
- ✅ API Key validation exists (`validateApiKey` in `auth.ts`)
- ✅ JWT validation exists (`verifyToken` in `auth.ts`)
- ✅ Helper functions exist (`getAuthUser`, `validateAdmin`)

## Implementation Checklist

### Phase 1: Authentication (Already Done ✅)

- [x] API Key validation (`validateApiKey`)
- [x] JWT token validation (`verifyToken`)
- [x] User authentication helpers (`getAuthUser`)
- [x] Admin validation (`validateAdmin`)

**Status:** ✅ Already implemented in `dashboard/src/lib/auth.ts`

### Phase 2: Create Vercel Projects

- [ ] Create `nivostack-studio` project in Vercel
- [ ] Create `nivostack-ingest-api` project in Vercel
- [ ] Create `nivostack-control-api` project in Vercel
- [ ] Link all projects to same repository
- [ ] Set root directory to `dashboard` for all projects

### Phase 3: Configure Vercel Routing

#### Dashboard Project (`nivostack-studio`)
- [ ] Create `dashboard/vercel-studio.json`:
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs"
}
```
- [ ] Deploy with: `vercel --prod --local-config vercel-studio.json`

#### Ingest API Project (`nivostack-ingest-api`)
- [ ] Create `dashboard/vercel-ingest.json`:
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs",
  "routes": [
    { "src": "/api/devices", "dest": "/api/devices", "methods": ["POST"] },
    { "src": "/api/traces", "dest": "/api/traces", "methods": ["POST"] },
    { "src": "/api/logs", "dest": "/api/logs", "methods": ["POST"] },
    { "src": "/api/crashes", "dest": "/api/crashes", "methods": ["POST"] },
    { "src": "/api/sessions", "dest": "/api/sessions", "methods": ["POST", "PUT", "PATCH"] },
    { "src": "/api/devices/(.*)/user", "dest": "/api/devices/$1/user", "methods": ["PATCH", "DELETE"] },
    { "src": "/(.*)", "dest": "/api/health" }
  ]
}
```
- [ ] Deploy with: `vercel --prod --local-config vercel-ingest.json`

#### Control API Project (`nivostack-control-api`)
- [ ] Create `dashboard/vercel-control.json`:
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs",
  "routes": [
    { "src": "/api/sdk-init", "dest": "/api/sdk-init" },
    { "src": "/api/business-config", "dest": "/api/business-config" },
    { "src": "/api/localization/(.*)", "dest": "/api/localization/$1" },
    { "src": "/api/feature-flags", "dest": "/api/feature-flags" },
    { "src": "/api/sdk-settings", "dest": "/api/sdk-settings" },
    { "src": "/api/projects", "dest": "/api/projects" },
    { "src": "/api/devices", "dest": "/api/devices" },
    { "src": "/api/sessions", "dest": "/api/sessions" },
    { "src": "/api/traces", "dest": "/api/traces" },
    { "src": "/api/logs", "dest": "/api/logs" },
    { "src": "/api/crashes", "dest": "/api/crashes" },
    { "src": "/(.*)", "dest": "/api/health" }
  ]
}
```
- [ ] Deploy with: `vercel --prod --local-config vercel-control.json`

### Phase 4: DNS Configuration

#### GoDaddy DNS Records
- [ ] Add CNAME for `studio.nivostack.com` → Vercel CNAME
- [ ] Add CNAME for `ingest.nivostack.com` → Vercel CNAME
- [ ] Add CNAME for `api.nivostack.com` → Vercel CNAME

#### Vercel Domain Configuration
- [ ] Add `studio.nivostack.com` to `nivostack-studio` project
- [ ] Add `ingest.nivostack.com` to `nivostack-ingest-api` project
- [ ] Add `api.nivostack.com` to `nivostack-control-api` project

### Phase 5: Environment Variables

#### All Projects (Shared)
- [ ] Set `POSTGRES_PRISMA_URL` in all 3 projects
- [ ] Set `POSTGRES_URL_NON_POOLING` in all 3 projects
- [ ] Set `JWT_SECRET` in all 3 projects

#### Dashboard Project Only
- [ ] Set `STRIPE_SECRET_KEY` in `nivostack-studio`
- [ ] Set `STRIPE_WEBHOOK_SECRET` in `nivostack-studio`
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `nivostack-studio`

### Phase 6: Verify Authentication

#### Test API Key Authentication (SDK Endpoints)
- [ ] Test `POST https://ingest.nivostack.com/api/devices` with API key
- [ ] Test `POST https://ingest.nivostack.com/api/traces` with API key
- [ ] Test `GET https://api.nivostack.com/api/sdk-init` with API key
- [ ] Test `GET https://api.nivostack.com/api/business-config` with API key
- [ ] Verify 401 error without API key
- [ ] Verify 401 error with invalid API key

#### Test JWT Authentication (Dashboard Endpoints)
- [ ] Test `GET https://studio.nivostack.com/api/projects` with JWT
- [ ] Test `GET https://studio.nivostack.com/api/admin/stats` with JWT
- [ ] Verify 401 error without JWT
- [ ] Verify 401 error with invalid JWT

### Phase 7: Deploy and Test

- [ ] Deploy dashboard project
- [ ] Deploy ingest API project
- [ ] Deploy control API project
- [ ] Test all endpoints
- [ ] Monitor Vercel analytics
- [ ] Check error logs

## Quick Start Commands

### Create Projects
```bash
cd dashboard

# Link projects
vercel link --project nivostack-studio
vercel link --project nivostack-ingest-api --scope your-team
vercel link --project nivostack-control-api --scope your-team
```

### Deploy
```bash
# Dashboard
vercel --prod --local-config vercel-studio.json

# Ingest API
vercel --prod --local-config vercel-ingest.json

# Control API
vercel --prod --local-config vercel-control.json
```

### Add Domains
```bash
vercel domains add studio.nivostack.com --project nivostack-studio
vercel domains add ingest.nivostack.com --project nivostack-ingest-api
vercel domains add api.nivostack.com --project nivostack-control-api
```

## Authentication Usage Examples

### In Route Handlers (API Key)
```typescript
import { validateApiKey } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const project = await validateApiKey(request);
  if (!project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const projectId = project.id;
  // Use projectId...
}
```

### In Route Handlers (JWT)
```typescript
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = user.id;
  // Use userId...
}
```

## Summary

✅ **Architecture:** 3 projects, 1 Pro plan ($20/month)  
✅ **Middleware:** Not needed  
✅ **Authentication:** Already implemented  
✅ **Next Steps:** Create projects, configure routing, set up DNS

**Estimated Time:** 2-3 hours for complete setup

