# Vercel Build Configuration for All Projects

## Project Configuration Summary

### 1. nivostack-website

**Root Directory:** `website`

**Build Command:**
```bash
cd website && pnpm install && pnpm build
```

**Output Directory:**
```
website/.next
```

**Framework Preset:** Next.js

**Install Command:** (Auto-detected)
```bash
pnpm install
```

**Development Command:** (Auto-detected)
```bash
next dev
```

---

### 2. nivostack-studio

**Root Directory:** `dashboard`

**Build Command:**
```bash
cd dashboard && pnpm install && pnpm build
```

**Note:** The `pnpm build` command in `dashboard/package.json` automatically runs:
- `prisma generate --schema=../prisma/schema.prisma`
- `next build --webpack`

**Output Directory:**
```
dashboard/.next
```

**Framework Preset:** Next.js

**Install Command:** (Auto-detected)
```bash
pnpm install
```

**Development Command:** (Auto-detected)
```bash
next dev
```

**Environment Variables Required:**
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_READ_REPLICA_URL` (optional)
- `JWT_SECRET`
- `STRIPE_SECRET_KEY` (if using Stripe)
- `STRIPE_WEBHOOK_SECRET` (if using Stripe)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using Stripe)

---

### 3. nivostack-ingest-api

**Root Directory:** `dashboard`

**Build Command:**
```bash
cd dashboard && pnpm install && pnpm build
```

**Output Directory:**
```
dashboard/.next
```

**Framework Preset:** Next.js

**Install Command:** (Auto-detected)
```bash
pnpm install
```

**Development Command:** (Auto-detected)
```bash
next dev
```

**Environment Variables Required:**
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `JWT_SECRET`

**Route Filtering:** Configured via `vercel-ingest.json` (only POST endpoints allowed)

---

### 4. nivostack-control-api

**Root Directory:** `dashboard`

**Build Command:**
```bash
cd dashboard && pnpm install && pnpm build
```

**Output Directory:**
```
dashboard/.next
```

**Framework Preset:** Next.js

**Install Command:** (Auto-detected)
```bash
pnpm install
```

**Development Command:** (Auto-detected)
```bash
next dev
```

**Environment Variables Required:**
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY` (if using Stripe)
- `STRIPE_WEBHOOK_SECRET` (if using Stripe)

**Route Filtering:** Configured via `vercel-control.json` (GET/CRUD endpoints only)

---

## Quick Reference Table

| Project | Root Directory | Build Command | Output Directory |
|---------|---------------|--------------|------------------|
| **nivostack-website** | `website` | `cd website && pnpm install && pnpm build` | `website/.next` |
| **nivostack-studio** | `dashboard` | `cd dashboard && pnpm install && pnpm build` | `dashboard/.next` |
| **nivostack-ingest-api** | `dashboard` | `cd dashboard && pnpm install && pnpm build` | `dashboard/.next` |
| **nivostack-control-api** | `dashboard` | `cd dashboard && pnpm install && pnpm build` | `dashboard/.next` |

---

## Important Notes

### Monorepo Considerations

1. **Workspace Installation:** Since this is a pnpm monorepo, Vercel will install dependencies for the entire workspace. This is expected and correct.

2. **Prisma Generation:** The `nivostack-studio` build automatically generates Prisma client. Make sure `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are set for the build to succeed.

3. **Shared Dependencies:** All dashboard-based projects share the same `dashboard/` directory and dependencies, which is efficient for the monorepo structure.

### Build Optimization

- **Caching:** Vercel will cache `node_modules` and build outputs
- **Parallel Builds:** Each project builds independently
- **Incremental Builds:** Only changed files trigger rebuilds

### Troubleshooting

If builds fail:

1. **Check Root Directory:** Ensure it's set correctly in Vercel project settings
2. **Verify Build Command:** Must run from the correct directory
3. **Check Environment Variables:** All required vars must be set
4. **Review Build Logs:** Check Vercel deployment logs for specific errors
5. **Prisma Issues:** Ensure database connection strings are valid for build-time Prisma generation

---

## Setting Up in Vercel Dashboard

For each project:

1. Go to **Settings** → **General**
2. Set **Root Directory** (see table above)
3. Go to **Settings** → **Build & Development Settings**
4. Set **Build Command** (see table above)
5. Set **Output Directory** (see table above)
6. Verify **Framework Preset** is set to "Next.js"
7. Save changes

After configuration, push to GitHub to trigger automatic deployments!

