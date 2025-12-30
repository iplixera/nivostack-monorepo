# Edge Functions Explained

## What Are Edge Functions?

**Edge Functions** are serverless functions that run at the **edge** of the network (closer to your users) instead of in a central data center. Think of them as lightweight functions distributed globally across multiple locations worldwide.

```
┌─────────────────────────────────────────────────────────────┐
│                    Traditional Serverless                    │
│                                                              │
│  User (NYC) ────────────────▶ Server (Oregon)             │
│                                  (500ms latency)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Edge Functions                          │
│                                                              │
│  User (NYC) ───▶ Edge Server (NYC)                          │
│                     (50ms latency)                          │
│                                                              │
│  User (London) ───▶ Edge Server (London)                    │
│                        (50ms latency)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Edge Functions vs Regular Serverless Functions

### **Regular Serverless Functions (Node.js Runtime)**

**What you're using now:**
```typescript
// src/app/api/devices/route.ts
// No runtime specified = Node.js runtime (default)

export async function POST(request: NextRequest) {
  // Runs on Node.js runtime
  // Located in ONE region (e.g., US East)
  // Cold start: ~500ms
  // Warm start: ~50ms
}
```

**Characteristics:**
- ✅ Full Node.js environment (all npm packages work)
- ✅ Can use Prisma ORM directly
- ✅ More memory available
- ❌ Slower cold starts (~500ms)
- ❌ Runs in one region (higher latency for distant users)
- ❌ Higher cost per invocation

---

### **Edge Functions (Edge Runtime)**

**What Edge Functions are:**
```typescript
// src/app/api/devices/route.ts
export const runtime = 'edge' // Add this line

export async function POST(request: NextRequest) {
  // Runs on Edge Runtime
  // Distributed globally (runs closest to user)
  // Cold start: ~50ms
  // Warm start: ~10ms
}
```

**Characteristics:**
- ✅ **Much faster cold starts** (~50ms vs ~500ms)
- ✅ **Global distribution** (runs closer to users)
- ✅ **Lower latency** (data travels shorter distance)
- ✅ **Lower cost** (cheaper per invocation)
- ❌ **Limited runtime** (not full Node.js)
- ❌ **Fewer npm packages** (only Web APIs)
- ❌ **Database limitations** (need edge-compatible clients)

---

## Key Differences

| Feature | Regular Serverless | Edge Functions |
|---------|-------------------|----------------|
| **Cold Start** | ~500ms | ~50ms |
| **Warm Start** | ~50ms | ~10ms |
| **Location** | Single region | Global (closest to user) |
| **Runtime** | Full Node.js | Web APIs only |
| **NPM Packages** | All packages | Limited (Web APIs) |
| **Database** | Prisma (full) | Prisma Edge / @vercel/postgres |
| **Memory** | Up to 3GB | ~128MB |
| **Cost** | Higher | Lower |
| **Use Case** | Complex operations | Simple, fast operations |

---

## Real-World Example

### **Scenario: User in Tokyo requests device list**

**Current (Regular Serverless):**
```
Tokyo User → Vercel Server (US East) → Database (EU)
Total latency: ~800ms
```

**With Edge Functions:**
```
Tokyo User → Edge Server (Tokyo) → Database (EU)
Total latency: ~200ms
```

**Result**: 75% faster response time! 🚀

---

## When to Use Edge Functions

### ✅ **Good for Edge Functions:**
- Simple API endpoints (CRUD operations)
- Authentication/authorization checks
- Request/response transformation
- Caching logic
- Rate limiting
- A/B testing
- Personalization

### ❌ **Not Good for Edge Functions:**
- Complex business logic
- Heavy computations
- Large file processing
- Long-running operations (>30 seconds)
- Operations requiring many npm packages
- Complex database queries with Prisma (without Accelerate)

---

## How Edge Functions Work in Vercel

### **1. Request Comes In**
```
User in London → Vercel Edge Network
```

### **2. Vercel Routes to Closest Edge**
```
Vercel detects: User is in London
Routes to: London Edge Server
```

### **3. Edge Function Executes**
```
Edge Function runs in London
- Fast cold start (~50ms)
- Processes request
- Returns response
```

### **4. Response Sent Back**
```
Response sent from London → User in London
Low latency (~50ms total)
```

---

## Code Example: Converting to Edge Function

### **Before (Regular Serverless)**
```typescript
// src/app/api/devices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  // Runs on Node.js runtime
  // Cold start: ~500ms
  // Location: US East (or wherever Vercel deploys)
  
  const devices = await prisma.device.findMany({
    where: { projectId: 'xxx' }
  })
  
  return NextResponse.json({ devices })
}
```

### **After (Edge Function)**
```typescript
// src/app/api/devices/route.ts
import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge' // ← Add this!

import { sql } from '@vercel/postgres' // Edge-compatible DB client

export async function GET(request: NextRequest) {
  // Runs on Edge Runtime
  // Cold start: ~50ms
  // Location: Closest to user (global)
  
  const { rows } = await sql`
    SELECT * FROM "Device" WHERE "projectId" = 'xxx'
  `
  
  return NextResponse.json({ devices: rows })
}
```

---

## Database Compatibility

### **Problem: Prisma Doesn't Work Directly**

Regular Prisma requires Node.js runtime, which Edge Functions don't have.

### **Solutions:**

#### **Option 1: Use @vercel/postgres (Recommended)**
```typescript
import { sql } from '@vercel/postgres'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { rows } = await sql`
    SELECT * FROM "Device" WHERE "projectId" = ${projectId}
  `
  return NextResponse.json({ devices: rows })
}
```

**Pros:**
- ✅ Works with Edge Functions
- ✅ Simple SQL queries
- ✅ Fast

**Cons:**
- ❌ No ORM (write raw SQL)
- ❌ No type safety
- ❌ More verbose

---

#### **Option 2: Use Prisma Accelerate**
```typescript
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

export const runtime = 'edge'

const prisma = new PrismaClient().$extends(withAccelerate())

export async function GET(request: NextRequest) {
  const devices = await prisma.device.findMany({
    where: { projectId: 'xxx' }
  })
  return NextResponse.json({ devices })
}
```

**Pros:**
- ✅ Keep using Prisma ORM
- ✅ Type-safe queries
- ✅ Connection pooling

**Cons:**
- ❌ Additional service cost (Prisma Accelerate)
- ❌ More complex setup

---

## Cost Comparison

### **Vercel Pricing (as of 2024)**

**Regular Serverless Functions:**
- Free tier: 100GB-hours/month
- Pro tier: $20/month + $0.0000025 per GB-second
- Example: 1M requests × 500ms × 1GB = ~$1.25

**Edge Functions:**
- Free tier: 500K requests/month
- Pro tier: $20/month + $0.0000005 per request
- Example: 1M requests = ~$0.50

**Savings**: ~60% cheaper! 💰

---

## Performance Comparison

### **Cold Start Times**

```
Regular Serverless:
┌─────────────────────────────────────┐
│ 0ms    500ms                        │
│ │───────│                           │
│ Start  Ready                        │
└─────────────────────────────────────┘

Edge Functions:
┌─────────────────────────────────────┐
│ 0ms  50ms                           │
│ │────│                              │
│ Start Ready                         │
└─────────────────────────────────────┘
```

**10x faster cold starts!** ⚡

---

## Migration Strategy

### **Step 1: Identify Candidates**

Good candidates for Edge Functions:
- ✅ `/api/devices` - Simple CRUD
- ✅ `/api/logs` - Simple queries
- ✅ `/api/crashes` - Simple queries
- ✅ `/api/sdk-init` - Fast, simple endpoint
- ✅ `/api/feature-flags` - Read-only, fast

Not good candidates:
- ❌ `/api/analytics` - Complex aggregations
- ❌ `/api/flow` - Complex graph queries
- ❌ `/api/business-config/deploy` - Long-running operations

### **Step 2: Convert One Endpoint (POC)**

Start with a simple endpoint like `/api/feature-flags`:

```typescript
// src/app/api/feature-flags/route.ts
export const runtime = 'edge'

import { sql } from '@vercel/postgres'

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  
  const { rows } = await sql`
    SELECT * FROM "FeatureFlag" 
    WHERE "projectId" = (
      SELECT id FROM "Project" WHERE "apiKey" = ${apiKey}
    )
  `
  
  return NextResponse.json({ flags: rows })
}
```

### **Step 3: Test & Monitor**

- Test functionality
- Monitor performance
- Check costs
- Compare with original

### **Step 4: Roll Out Gradually**

Convert endpoints one by one, starting with high-traffic, simple ones.

---

## Limitations & Considerations

### **1. Runtime Limitations**
- No `fs` (file system)
- No `child_process`
- No native modules
- Limited to Web APIs

### **2. Database Limitations**
- Need edge-compatible client
- Raw SQL or Prisma Accelerate
- Connection pooling recommended

### **3. Memory Limits**
- ~128MB memory limit
- Not suitable for large data processing

### **4. Execution Time**
- Max 30 seconds execution time
- Not for long-running operations

---

## Summary

**Edge Functions** = Serverless functions that run **globally** at the **edge** of the network, closer to users.

**Benefits:**
- ⚡ 10x faster cold starts (50ms vs 500ms)
- 🌍 Global distribution (lower latency)
- 💰 Lower costs (~60% cheaper)
- 🚀 Better user experience

**Trade-offs:**
- ⚠️ Limited runtime (Web APIs only)
- ⚠️ Database compatibility (need edge clients)
- ⚠️ Less memory (~128MB)

**Best for:**
- Simple API endpoints
- High-traffic routes
- Low-latency requirements
- Global user base

---

## Next Steps

1. **Identify** which endpoints are good candidates
2. **Convert** one endpoint as proof of concept
3. **Test** performance and functionality
4. **Monitor** costs and latency
5. **Roll out** gradually to other endpoints

Want help converting your first endpoint? Let me know! 🚀

