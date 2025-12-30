# NivoStack Deployment Summary

## Overview

This document summarizes the deployment strategy for the NivoStack monorepo, covering both single-project and multi-project approaches.

## Architecture Decisions

### Current Structure

```
Monorepo
├── dashboard/          # Next.js app (UI + APIs)
├── packages/
│   ├── sdk-flutter/   # Flutter SDK
│   └── sdk-android/    # Android SDK
└── docs/              # Documentation
```

### Domain Structure

| Domain | Purpose | Service |
|--------|---------|---------|
| `nivostack.com` | Marketing website | Brand site |
| `studio.nivostack.com` | Admin console | Dashboard UI |
| `ingest.nivostack.com` | Data ingestion | Ingest API |
| `api.nivostack.com` | Configuration & CRUD | Control API |

## Deployment Approaches

### Approach 1: Single Vercel Project ⭐ Recommended to Start

**Configuration**: One Vercel project with middleware-based route filtering

**Cost**: $20/month (Vercel Pro)

**Setup Complexity**: Low

**Pros**:
- Simple to set up and maintain
- Single deployment
- Shared codebase
- Easier environment variable management
- Lower initial cost

**Cons**:
- All traffic counts toward same quota
- Can't scale services independently
- Single point of failure

**When to Use**:
- Starting out
- Moderate traffic (< 1M requests/month)
- Want simplicity
- Budget-conscious

**Files**:
- `VERCEL_DEPLOYMENT_ALTERNATIVE.md` - Full guide
- `DEPLOYMENT_QUICK_START.md` - Quick setup

### Approach 2: Multiple Vercel Projects

**Configuration**: Separate Vercel projects for each service

**Cost**: ~$60/month (3x Vercel Pro)

**Setup Complexity**: Medium-High

**Pros**:
- Independent scaling per service
- Better cost control (can downgrade individual services)
- Isolated failures
- Separate analytics per service
- Better performance for high-traffic endpoints

**Cons**:
- More complex setup
- Higher cost
- Multiple deployments to manage
- More environment variables to configure

**When to Use**:
- High traffic (> 1M requests/month)
- Need independent scaling
- Want service isolation
- Budget allows for multiple projects

**Files**:
- `VERCEL_DEPLOYMENT_STRATEGY.md` - Full guide

## Recommendation

**Start with Approach 1 (Single Project)**, then migrate to Approach 2 when:
- Traffic exceeds 1M requests/month
- Need independent scaling
- Want better cost optimization
- Service isolation becomes critical

## DNS Setup (GoDaddy)

### Required DNS Records

```
Type    Name    Value                          TTL
CNAME   studio  cname.vercel-dns.com.         3600
CNAME   ingest  cname.vercel-dns.com.         3600
CNAME   api     cname.vercel-dns.com.         3600
```

**Note**: Get actual CNAME values from Vercel domain settings.

### DNS Propagation

- Typical: 1-24 hours
- Maximum: 48 hours
- Check with: [DNS Checker](https://dnschecker.org/)

## Cost Breakdown

### Single Project Approach

| Item | Cost |
|------|------|
| Vercel Pro | $20/month |
| Database (Supabase/Neon) | $0-25/month |
| **Total** | **$20-45/month** |

### Multiple Projects Approach

| Item | Cost |
|------|------|
| Vercel Pro (Dashboard) | $20/month |
| Vercel Pro (Ingest API) | $20/month |
| Vercel Pro (Control API) | $20/month |
| Database (Supabase/Neon) | $0-25/month |
| **Total** | **$60-85/month** |

## Environment Variables

### Required for All Projects

```bash
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
JWT_SECRET=your-secret-key
```

### Required for Dashboard & Control API

```bash
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

## Deployment Checklist

### Initial Setup
- [ ] Install Vercel CLI
- [ ] Login to Vercel
- [ ] Link project(s)
- [ ] Configure domains in Vercel
- [ ] Set up DNS records in GoDaddy
- [ ] Configure environment variables
- [ ] Create middleware (if single project)
- [ ] Deploy to production
- [ ] Verify all domains work
- [ ] Test API endpoints
- [ ] Set up monitoring

### Ongoing Maintenance
- [ ] Monitor Vercel analytics
- [ ] Check error logs
- [ ] Review costs monthly
- [ ] Optimize based on usage
- [ ] Update dependencies
- [ ] Review security settings

## Monitoring & Analytics

### Vercel Analytics
- Enable for each project
- Track function invocations
- Monitor response times
- Set up alerts

### Custom Monitoring
- Health check endpoints
- Error tracking (Sentry)
- Performance monitoring
- Cost tracking

## Security Considerations

1. **API Keys**: Store in Vercel environment variables
2. **CORS**: Configure per domain
3. **Rate Limiting**: Implement per endpoint
4. **Authentication**: JWT for dashboard, API keys for SDKs
5. **HTTPS**: Enforced by Vercel

## Migration Path

### From Single to Multiple Projects

1. Create new Vercel projects
2. Configure DNS for new projects
3. Update SDK endpoints
4. Deploy to new projects
5. Monitor for issues
6. Switch DNS when ready
7. Decommission old project

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [GoDaddy DNS Help](https://www.godaddy.com/help)

## Quick Links

- **Quick Start**: `DEPLOYMENT_QUICK_START.md`
- **Single Project Guide**: `VERCEL_DEPLOYMENT_ALTERNATIVE.md`
- **Multiple Projects Guide**: `VERCEL_DEPLOYMENT_STRATEGY.md`

