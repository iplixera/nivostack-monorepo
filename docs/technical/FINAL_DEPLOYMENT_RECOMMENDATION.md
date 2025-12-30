# Final Deployment Recommendation for NivoStack

## Executive Summary

**Recommended Architecture:**
- ✅ **3 Separate Vercel Projects** (on one Pro plan - $20/month)
- ✅ **No Middleware Needed** (each project handles its own routes)
- ✅ **Domain-Based Authentication** (API keys for SDKs, JWT for dashboard)

## Architecture Decision

### ✅ Recommended: Multiple Projects (One Plan)

```
Vercel Pro Plan: $20/month
├── Project 1: nivostack-studio (Dashboard)
│   └── Domain: studio.nivostack.com
├── Project 2: nivostack-ingest-api (Ingest API)
│   └── Domain: ingest.nivostack.com
└── Project 3: nivostack-control-api (Control API)
    └── Domain: api.nivostack.com
```

**Why:**
- Same cost as single project ($20/month)
- Better organization and monitoring
- Independent deployments
- No middleware complexity needed
- Professional architecture

## Middleware Decision

### ❌ **No Middleware Needed**

**Why:**
- Each project handles its own routes
- Domain routing handled by Vercel DNS
- Simpler architecture
- No additional complexity

**When Middleware Would Be Needed:**
- Only if using single project (not recommended)
- Only if need domain-based filtering within one project

## Authentication Strategy

### 1. SDK Authentication (API Keys)

**For:** `ingest.nivostack.com` and `api.nivostack.com`

**Method:** API Key in `X-API-Key` header

**Implementation:**
```typescript
// In API route handlers
const apiKey = request.headers.get('x-api-key');
if (!apiKey) {
  return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
}

const project = await prisma.project.findUnique({
  where: { apiKey }
});

if (!project) {
  return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
}

// Project ID derived from API key
const projectId = project.id;
```

**Routes:**
- `/api/devices` (POST)
- `/api/traces` (POST)
- `/api/logs` (POST)
- `/api/crashes` (POST)
- `/api/sessions` (POST/PUT/PATCH)
- `/api/sdk-init` (GET)
- `/api/business-config` (GET)
- `/api/localization/*` (GET)

### 2. Dashboard Authentication (JWT)

**For:** `studio.nivostack.com`

**Method:** JWT token in `Authorization: Bearer <token>` header

**Implementation:**
```typescript
// In API route handlers
const authHeader = request.headers.get('authorization');
if (!authHeader) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const token = authHeader.replace('Bearer ', '');
const payload = verifyToken(token);

if (!payload) {
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}

// User ID available in payload
const userId = payload.userId;
```

**Routes:**
- `/api/auth/*` (login, register)
- `/api/projects` (CRUD)
- `/api/admin/*` (admin operations)
- `/api/subscription/*` (subscription management)
- All dashboard UI routes

### 3. Public Routes (No Auth)

**For:** All domains

**Routes:**
- `/api/health` (health check)
- `/api/auth/login` (login endpoint)
- `/api/auth/register` (registration endpoint)

## Project Structure

### Project 1: Dashboard (`nivostack-studio`)

**Domain:** `studio.nivostack.com`

**Routes:**
- All UI pages (`/dashboard/*`, `/projects/*`, etc.)
- Dashboard API routes:
  - `/api/auth/*` (JWT auth)
  - `/api/projects` (JWT auth)
  - `/api/admin/*` (JWT auth)
  - `/api/subscription/*` (JWT auth)

**Authentication:** JWT tokens

**Root Directory:** `dashboard`

### Project 2: Ingest API (`nivostack-ingest-api`)

**Domain:** `ingest.nivostack.com`

**Routes:**
- `/api/devices` (POST) - Device registration
- `/api/traces` (POST) - API traces
- `/api/logs` (POST) - Logs
- `/api/crashes` (POST) - Crash reports
- `/api/sessions` (POST/PUT/PATCH) - Session management
- `/api/devices/[id]/user` (PATCH/DELETE) - User association

**Authentication:** API Key (`X-API-Key` header)

**Root Directory:** `dashboard` (shared codebase)

**Vercel Config:** Routes only ingest endpoints

### Project 3: Control API (`nivostack-control-api`)

**Domain:** `api.nivostack.com`

**Routes:**
- `/api/sdk-init` (GET) - SDK initialization
- `/api/business-config` (GET) - Business configuration
- `/api/localization/*` (GET) - Localization
- `/api/feature-flags` (GET) - Feature flags
- `/api/sdk-settings` (GET) - SDK settings
- `/api/projects` (GET) - List projects (API key)
- `/api/devices` (GET) - List devices (API key)
- `/api/sessions` (GET) - List sessions (API key)
- `/api/traces` (GET) - List traces (API key)
- `/api/logs` (GET) - List logs (API key)
- `/api/crashes` (GET) - List crashes (API key)

**Authentication:** API Key (`X-API-Key` header)

**Root Directory:** `dashboard` (shared codebase)

**Vercel Config:** Routes only control endpoints

## Implementation Steps

### Step 1: Create Authentication Utilities

**File:** `dashboard/src/lib/auth.ts`

```typescript
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET!;

// Verify API Key
export async function validateApiKey(apiKey: string) {
  const project = await prisma.project.findUnique({
    where: { apiKey },
  });
  
  if (!project) {
    return null;
  }
  
  return {
    projectId: project.id,
    userId: project.userId,
  };
}

// Verify JWT Token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      name?: string;
    };
  } catch {
    return null;
  }
}

// Generate JWT Token
export function generateToken(userId: string, email: string, name?: string) {
  return jwt.sign(
    { userId, email, name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
```

### Step 2: Create Authentication Middleware Helper

**File:** `dashboard/src/lib/api-auth.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from './auth';

// For SDK endpoints (API Key)
export async function requireApiKey(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  
  if (!apiKey) {
    return {
      error: NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      ),
    };
  }
  
  const project = await validateApiKey(apiKey);
  
  if (!project) {
    return {
      error: NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      ),
    };
  }
  
  return { projectId: project.projectId, userId: project.userId };
}

// For Dashboard endpoints (JWT)
export function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);
  
  if (!payload) {
    return {
      error: NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      ),
    };
  }
  
  return { userId: payload.userId, email: payload.email };
}
```

### Step 3: Use in Route Handlers

**Example: Ingest API Route**

```typescript
// dashboard/src/app/api/devices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  // Require API key
  const auth = await requireApiKey(request);
  if (auth.error) return auth.error;
  
  const { projectId } = auth;
  
  // Use projectId for device registration
  const body = await request.json();
  // ... rest of handler
}
```

**Example: Control API Route**

```typescript
// dashboard/src/app/api/sdk-init/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  // Require API key
  const auth = await requireApiKey(request);
  if (auth.error) return auth.error;
  
  const { projectId } = auth;
  
  // Fetch SDK init data for project
  // ... rest of handler
}
```

**Example: Dashboard Route**

```typescript
// dashboard/src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  // Require JWT token
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  
  const { userId } = auth;
  
  // Fetch projects for user
  // ... rest of handler
}
```

### Step 4: Configure Vercel Projects

#### Project 1: Dashboard

**vercel.json:**
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs"
}
```

**Routes:** All routes (UI + APIs)

#### Project 2: Ingest API

**vercel.json:**
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs",
  "routes": [
    {
      "src": "/api/devices",
      "dest": "/api/devices",
      "methods": ["POST"]
    },
    {
      "src": "/api/traces",
      "dest": "/api/traces",
      "methods": ["POST"]
    },
    {
      "src": "/api/logs",
      "dest": "/api/logs",
      "methods": ["POST"]
    },
    {
      "src": "/api/crashes",
      "dest": "/api/crashes",
      "methods": ["POST"]
    },
    {
      "src": "/api/sessions",
      "dest": "/api/sessions",
      "methods": ["POST", "PUT", "PATCH"]
    },
    {
      "src": "/api/devices/(.*)/user",
      "dest": "/api/devices/$1/user",
      "methods": ["PATCH", "DELETE"]
    },
    {
      "src": "/(.*)",
      "dest": "/api/health"
    }
  ]
}
```

#### Project 3: Control API

**vercel.json:**
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs",
  "routes": [
    {
      "src": "/api/sdk-init",
      "dest": "/api/sdk-init"
    },
    {
      "src": "/api/business-config",
      "dest": "/api/business-config"
    },
    {
      "src": "/api/localization/(.*)",
      "dest": "/api/localization/$1"
    },
    {
      "src": "/api/feature-flags",
      "dest": "/api/feature-flags"
    },
    {
      "src": "/api/sdk-settings",
      "dest": "/api/sdk-settings"
    },
    {
      "src": "/api/projects",
      "dest": "/api/projects"
    },
    {
      "src": "/api/devices",
      "dest": "/api/devices"
    },
    {
      "src": "/api/sessions",
      "dest": "/api/sessions"
    },
    {
      "src": "/api/traces",
      "dest": "/api/traces"
    },
    {
      "src": "/api/logs",
      "dest": "/api/logs"
    },
    {
      "src": "/api/crashes",
      "dest": "/api/crashes"
    },
    {
      "src": "/(.*)",
      "dest": "/api/health"
    }
  ]
}
```

### Step 5: Set Up DNS

**GoDaddy DNS Records:**
```
Type    Name    Value                          TTL
CNAME   studio  cname.vercel-dns.com.         3600
CNAME   ingest  cname.vercel-dns.com.         3600
CNAME   api     cname.vercel-dns.com.         3600
```

**Vercel Domain Configuration:**
```bash
# Dashboard
vercel domains add studio.nivostack.com --project nivostack-studio

# Ingest API
vercel domains add ingest.nivostack.com --project nivostack-ingest-api

# Control API
vercel domains add api.nivostack.com --project nivostack-control-api
```

### Step 6: Environment Variables

**All Projects Share:**
```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-secret-key
```

**Dashboard Only:**
```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

## Summary

### ✅ Final Recommendation

1. **Architecture:** 3 separate Vercel projects (one Pro plan - $20/month)
2. **Middleware:** Not needed (each project handles its routes)
3. **Authentication:**
   - **SDK endpoints:** API Key (`X-API-Key` header)
   - **Dashboard endpoints:** JWT (`Authorization: Bearer <token>`)
   - **Public endpoints:** No auth (health checks, login, register)

### Benefits

- ✅ Same cost as single project ($20/month)
- ✅ Better organization and monitoring
- ✅ Independent deployments
- ✅ No middleware complexity
- ✅ Professional architecture
- ✅ Clear authentication strategy

### Next Steps

1. Create authentication utilities (`auth.ts`, `api-auth.ts`)
2. Update route handlers to use authentication helpers
3. Create 3 Vercel projects
4. Configure Vercel routing per project
5. Set up DNS
6. Deploy and test

This architecture provides the best balance of cost, organization, and maintainability!

