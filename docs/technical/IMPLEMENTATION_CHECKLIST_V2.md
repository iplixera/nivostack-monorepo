# Implementation Checklist - 4 Projects Setup

## Project Names

1. ✅ `nivostack-website` - Branding/Marketing site
2. ✅ `nivostack-studio` - Admin Dashboard
3. ✅ `nivostack-ingest-api` - Data Ingestion API
4. ✅ `nivostack-control-api` - Configuration & CRUD API

## Phase 1: Create Branding Website

- [ ] Create `website/` directory in monorepo root
- [ ] Initialize Next.js project in `website/`
- [ ] Create landing page (`website/src/app/page.tsx`)
- [ ] Create features page (`website/src/app/features/page.tsx`)
- [ ] Create pricing page (`website/src/app/pricing/page.tsx`)
- [ ] Create about page (`website/src/app/about/page.tsx`)
- [ ] Create contact page (`website/src/app/contact/page.tsx`)
- [ ] Create `website/vercel.json` configuration
- [ ] Create `website/package.json` with dependencies
- [ ] Test website locally

## Phase 2: Create Vercel Projects

- [ ] Create `nivostack-website` project in Vercel
- [ ] Create `nivostack-studio` project in Vercel
- [ ] Create `nivostack-ingest-api` project in Vercel
- [ ] Create `nivostack-control-api` project in Vercel
- [ ] Link all projects to repository
- [ ] Set root directories:
  - Website: `website/`
  - Others: `dashboard/`

## Phase 3: Configure Vercel Routing

### Website Project
- [ ] Create `website/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs"
}
```

### Dashboard Project
- [ ] Create `dashboard/vercel-studio.json`:
```json
{
  "buildCommand": "pnpm install && pnpm build",
  "framework": "nextjs"
}
```

### Ingest API Project
- [ ] Create `dashboard/vercel-ingest.json` with ingest routes
- [ ] Configure route filtering for POST/PUT/PATCH only

### Control API Project
- [ ] Create `dashboard/vercel-control.json` with control routes
- [ ] Configure route filtering for GET and CRUD operations

## Phase 4: DNS Configuration

### GoDaddy DNS
- [ ] Add A record for `@` (nivostack.com)
- [ ] Add CNAME for `www` → Vercel
- [ ] Add CNAME for `studio` → Vercel
- [ ] Add CNAME for `ingest` → Vercel
- [ ] Add CNAME for `api` → Vercel

### Vercel Domains
- [ ] Add `nivostack.com` to `nivostack-website`
- [ ] Add `www.nivostack.com` to `nivostack-website`
- [ ] Add `studio.nivostack.com` to `nivostack-studio`
- [ ] Add `ingest.nivostack.com` to `nivostack-ingest-api`
- [ ] Add `api.nivostack.com` to `nivostack-control-api`

## Phase 5: Environment Variables

### Website (`nivostack-website`)
- [ ] Set analytics IDs (if needed)
- [ ] Set contact form email (if needed)

### Dashboard (`nivostack-studio`)
- [ ] Set `POSTGRES_PRISMA_URL`
- [ ] Set `POSTGRES_URL_NON_POOLING`
- [ ] Set `JWT_SECRET`
- [ ] Set `STRIPE_SECRET_KEY`
- [ ] Set `STRIPE_WEBHOOK_SECRET`
- [ ] Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Ingest API (`nivostack-ingest-api`)
- [ ] Set `POSTGRES_PRISMA_URL`
- [ ] Set `POSTGRES_URL_NON_POOLING`
- [ ] Set `JWT_SECRET`

### Control API (`nivostack-control-api`)
- [ ] Set `POSTGRES_PRISMA_URL`
- [ ] Set `POSTGRES_URL_NON_POOLING`
- [ ] Set `JWT_SECRET`

## Phase 6: Deploy All Projects

- [ ] Deploy website: `cd website && vercel --prod`
- [ ] Deploy dashboard: `cd dashboard && vercel --prod --local-config vercel-studio.json`
- [ ] Deploy ingest API: `cd dashboard && vercel --prod --local-config vercel-ingest.json`
- [ ] Deploy control API: `cd dashboard && vercel --prod --local-config vercel-control.json`

## Phase 7: Testing

### Website
- [ ] Test `https://nivostack.com`
- [ ] Test `https://www.nivostack.com`
- [ ] Test all pages load correctly
- [ ] Test mobile responsiveness

### Dashboard
- [ ] Test `https://studio.nivostack.com`
- [ ] Test login/authentication
- [ ] Test dashboard UI loads
- [ ] Test API endpoints with JWT

### Ingest API
- [ ] Test `POST https://ingest.nivostack.com/api/devices` with API key
- [ ] Test `POST https://ingest.nivostack.com/api/traces` with API key
- [ ] Test `POST https://ingest.nivostack.com/api/logs` with API key
- [ ] Test `POST https://ingest.nivostack.com/api/crashes` with API key
- [ ] Test `POST https://ingest.nivostack.com/api/sessions` with API key
- [ ] Verify 401 without API key
- [ ] Verify 404 for non-ingest routes

### Control API
- [ ] Test `GET https://api.nivostack.com/api/sdk-init` with API key
- [ ] Test `GET https://api.nivostack.com/api/business-config` with API key
- [ ] Test `GET https://api.nivostack.com/api/localization/translations` with API key
- [ ] Test `GET https://api.nivostack.com/api/feature-flags` with API key
- [ ] Test `GET https://api.nivostack.com/api/projects` with API key
- [ ] Verify 401 without API key
- [ ] Verify 404 for non-control routes

## Phase 8: Monitoring

- [ ] Set up Vercel analytics for all projects
- [ ] Monitor error logs
- [ ] Check bandwidth usage per project
- [ ] Set up alerts for errors
- [ ] Monitor function execution times

## Quick Reference

### Project Names
- `nivostack-website` - Marketing site
- `nivostack-studio` - Admin dashboard
- `nivostack-ingest-api` - Data ingestion
- `nivostack-control-api` - Config & CRUD

### Domains
- `nivostack.com` → Website
- `studio.nivostack.com` → Dashboard
- `ingest.nivostack.com` → Ingest API
- `api.nivostack.com` → Control API

### Authentication
- Website: None (public)
- Dashboard: JWT tokens
- Ingest API: API Key
- Control API: API Key

## Estimated Timeline

- Phase 1 (Website): 2-4 hours
- Phase 2-3 (Projects & Config): 1-2 hours
- Phase 4 (DNS): 30 minutes
- Phase 5 (Env Vars): 30 minutes
- Phase 6 (Deploy): 1 hour
- Phase 7 (Testing): 2-3 hours
- Phase 8 (Monitoring): 1 hour

**Total: 8-12 hours**

