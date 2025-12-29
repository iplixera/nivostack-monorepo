# DevBridge AI Assistant Knowledge Base

This folder contains comprehensive documentation and troubleshooting guides for the DevBridge project, created during development sessions with the AI assistant.

---

## 📚 Knowledge Base Index

### 🚨 Troubleshooting & Problem Resolution

#### [Multi-Environment Setup Troubleshooting](./MULTI_ENV_TROUBLESHOOTING_2024_12_23.md)
**Date**: Dec 23, 2025 | **Status**: ✅ Resolved

Complete troubleshooting guide for 404 errors after multi-environment setup. Covers:
- Supabase integration variable conflicts
- Framework detection issues
- Environment-specific variable configuration
- Database connection string formats

**Key Learning**: Vercel Supabase integration overrides manual variables - must be deleted for multi-environment setup.

---

## 🏗️ Architecture & Setup

### [Environment Setup Guide](../ENVIRONMENT_SETUP.md)
Complete guide for setting up databases and environment variables across production, staging, and development environments.

### [Supabase-Specific Setup](../SUPABASE_SETUP.md)
Detailed instructions for configuring Supabase databases for DevBridge, including connection strings and multi-environment configuration.

### [Quick Start: Environment Variables](../ENV_QUICK_START.md)
Quick reference card for environment variable setup.

---

## 🔄 Development Workflow

### [Development Workflow Guide](../DEVELOPMENT_WORKFLOW.md)
Complete Git Flow workflow with:
- Feature branch strategy
- Pull request process
- Deployment pipeline
- Code review checklist

### [Workflow Diagrams](../WORKFLOW_DIAGRAM.md)
Visual representations of Git workflow, deployment flow, and branch strategies.

---

## 🎯 Feature Documentation

### [Multi-Tenant Subscription Management](../features/MULTI_TENANT_SUBSCRIPTION_SUMMARY.md)
**Date**: Dec 23, 2025 | **Status**: 📋 Planning Complete

Complete planning documentation for multi-tenant subscription system:
- **PRD**: [MULTI_TENANT_SUBSCRIPTION_PRD.md](../features/MULTI_TENANT_SUBSCRIPTION_PRD.md)
- **Implementation Plan**: [MULTI_TENANT_SUBSCRIPTION_IMPLEMENTATION.md](../features/MULTI_TENANT_SUBSCRIPTION_IMPLEMENTATION.md)
- **Summary**: [MULTI_TENANT_SUBSCRIPTION_SUMMARY.md](../features/MULTI_TENANT_SUBSCRIPTION_SUMMARY.md)

**Key Features**:
- Free Plan with 30-day trial
- Automatic subscription creation on registration
- Trial expiration with data deletion
- Billing/Invoices/Subscription management tabs
- Server-side feature restrictions

**Implementation**: 8 phases, ~16 days estimated

---

### [Device Debug Mode](../DEVICE_DEBUG_MODE.md)
Documentation for selective API/session tracking for specific devices in production.

**Features**:
- Device code generation
- Debug mode toggle
- User association
- Auto-expiry
- Tracking mode selector

---

## ⚡ Performance

### [Performance Optimization](../PERFORMANCE_OPTIMIZATION.md)
Analysis and implementation of API performance improvements.

**Achievements**: 93.4% reduction in SDK init time (4,367ms → 290ms)

### [Performance Tasks](../PERFORMANCE_TASKS.md)
Detailed task breakdown for performance optimization work.

---

## 📖 Reference Documentation

### [Setup Complete Summary](../../SETUP_COMPLETE.md)
Comprehensive summary of multi-environment setup with checklists and quick reference.

### [Developer Guide](../DEVELOPER_GUIDE.md)
Guide for developers working on the DevBridge project.

### [Product Requirements Document](../PRD.md)
Original product requirements and specifications.

---

## 🔧 Common Issues & Solutions

### Issue: All Routes Return 404 on Vercel

**Symptoms**:
- Build succeeds
- No errors in build logs
- All routes (including API) return 404
- Works locally

**Root Causes**:
1. Framework Preset not set (most common)
2. Integration variables overriding manual config
3. Incorrect database connection strings

**Solution**: See [MULTI_ENV_TROUBLESHOOTING_2024_12_23.md](./MULTI_ENV_TROUBLESHOOTING_2024_12_23.md)

---

### Issue: Environment Variables Not Working

**Symptoms**:
- Variables visible in Vercel dashboard
- App can't access them
- Wrong database being used

**Root Cause**: Integration variables (⚡ icon) taking precedence

**Solution**:
1. Delete integration variables
2. Create manual environment-specific variables
3. Ensure correct targeting (production vs preview)

---

### Issue: Wrong Database in Different Environments

**Symptoms**:
- Staging using production database
- Production using staging database

**Root Cause**: Integration variables pointing all environments to same database

**Solution**:
1. Delete Supabase integration variables
2. Create separate variables with different targets:
   - `POSTGRES_PRISMA_URL` (production) → prod DB
   - `POSTGRES_PRISMA_URL` (preview) → staging DB

---

## 🎓 Key Concepts

### Vercel Environment Targets

Vercel supports three environment targets:
- **Production**: `main` branch deployments
- **Preview**: All other branches (develop, feature/*, etc.)
- **Development**: Local development

Variables can target one or more environments.

### Environment Variable Precedence

1. **Integration variables** (⚡) - HIGHEST precedence
2. **Manual variables** (environment-specific)
3. **Manual variables** (all environments)
4. **Default values** - LOWEST precedence

**Critical**: Integration variables ALWAYS win, even if manual variables are environment-specific.

### Supabase Connection String Formats

**Pooled (port 6543)**:
```
postgres://postgres.PROJECT:PASSWORD@aws-X-region.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct (port 5432)**:
```
postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres?sslmode=require
```

**Never**: Mix pooler subdomain with direct port or vice versa.

---

## 📊 Project Statistics

### Multi-Environment Setup (Dec 23, 2025)
- **Total Time**: ~4 hours
- **Variables Created**: 6 (environment-specific)
- **Variables Deleted**: 14 (integration conflicts)
- **Deployments Triggered**: 15+
- **Final Status**: ✅ Success

### Performance Optimization (Previous)
- **Time Improvement**: 93.4% (4,367ms → 290ms)
- **Tasks Completed**: 6 major tasks
- **Status**: ✅ Complete

---

## 🔗 External Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Supabase Connection Strings](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)

---

## 📝 Notes for AI Assistant

### When Troubleshooting Vercel 404s:
1. ✅ Check Framework Preset first
2. ✅ Look for integration variables (⚡)
3. ✅ Verify app works locally
4. ✅ Check environment variable targeting
5. ✅ Test direct deployment URL before alias

### When Setting Up Multi-Environment:
1. ❌ DON'T use Supabase integration
2. ✅ DO create manual environment-specific variables
3. ✅ DO verify each environment separately
4. ✅ DO use correct connection string formats

### Common User Confusion Points:
- Framework Preset: "Next.js" vs "NestJS" (very similar names!)
- Integration variables: Not obvious they override manual config
- Environment targets: "Preview" includes ALL non-main branches

---

## 🗂️ Knowledge Base Maintenance

### Adding New Documentation
1. Create markdown file in this folder
2. Use descriptive filename with date: `TOPIC_YYYY_MM_DD.md`
3. Update this INDEX.md with entry
4. Add cross-references to related docs

### Documentation Standards
- ✅ Include date and status
- ✅ Clear problem statement
- ✅ Step-by-step solution
- ✅ Root cause analysis
- ✅ Key learnings section
- ✅ Related documentation links

---

**Last Updated**: December 23, 2025  
**Maintained By**: AI Assistant (Claude)  
**Project**: DevBridge - Mobile App Monitoring Platform

