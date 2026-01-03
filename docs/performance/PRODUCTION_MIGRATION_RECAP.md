# Production Migration Recap

**Date**: January 3, 2025  
**Branch**: `feature/performance-improvements`  
**Status**: Ready for Production Migration

## Summary

This document summarizes all changes made to APIs, Prisma schema, and database that need to be migrated to production via the admin panel API.

---

## 🔧 API Changes (Access Control Fixes)

### Changed from Ownership Checks to Membership Checks

All API endpoints below were updated to use `canPerformAction` from `@/lib/team-access` instead of checking `project.userId === user.id`. This allows project members (not just owners) to access resources.

#### 1. Localization APIs
- **File**: `dashboard/src/app/api/localization/translations/route.ts`
  - `POST /api/localization/translations` - Create/update translation
  - Fixed unique constraint from `keyId_languageId_pluralForm` to `keyId_languageId` (matches schema)
  - Removed non-existent fields: `pluralForm`, `translationProvider`, `translationConfidence`, `translationCost`, `hasVariables`

- **File**: `dashboard/src/app/api/localization/keys/route.ts`
  - `PATCH /api/localization/keys` - Update localization key
  - `DELETE /api/localization/keys` - Delete localization key

- **File**: `dashboard/src/app/api/localization/languages/route.ts`
  - `GET /api/localization/languages` - List languages
  - `POST /api/localization/languages` - Create language

- **File**: `dashboard/src/app/api/localization/keys/route.ts` (GET/POST)
  - `GET /api/localization/keys` - List keys
  - `POST /api/localization/keys` - Create key

#### 2. Logs API
- **File**: `dashboard/src/app/api/logs/route.ts`
  - `GET /api/logs` - List logs

#### 3. Business Config API
- **File**: `dashboard/src/app/api/business-config/route.ts`
  - `GET /api/business-config` - List business configs

#### 4. Experiments API
- **File**: `dashboard/src/app/api/experiments/route.ts`
  - `GET /api/experiments` - List experiments
  - `POST /api/experiments` - Create experiment

#### 5. Config Categories API
- **File**: `dashboard/src/app/api/config-categories/route.ts`
  - `GET /api/config-categories` - List categories
  - `POST /api/config-categories` - Create category
  - `PUT /api/config-categories` - Update category
  - `DELETE /api/config-categories` - Delete category

### Pattern Used:
```typescript
// OLD (ownership check):
const project = await prisma.project.findFirst({
  where: { id: projectId, userId: payload.userId }
})
if (!project) {
  return NextResponse.json({ error: 'Project not found' }, { status: 404 })
}

// NEW (membership check):
const { canPerformAction } = await import('@/lib/team-access')
const hasAccess = await canPerformAction(payload.userId, projectId, 'view')
if (!hasAccess) {
  return NextResponse.json({ error: 'Project not found' }, { status: 404 })
}
const project = await prisma.project.findUnique({
  where: { id: projectId }
})
if (!project) {
  return NextResponse.json({ error: 'Project not found' }, { status: 404 })
}
```

---

## 📊 Prisma Schema Changes

### Database Indexes Added

#### Device Table Indexes
```prisma
@@index([projectId, platform])
@@index([projectId, createdAt])
@@index([projectId, lastSeenAt])
```

#### ApiTrace Table Indexes
```prisma
@@index([projectId, timestamp])
@@index([projectId, screenName])
@@index([projectId, deviceId])
@@index([projectId, method, statusCode])
```

#### ProjectMember Table Indexes
```prisma
@@index([userId, projectId])
```

**Note**: These indexes are already in the schema file. The migration SQL needs to be applied to production.

---

## 🗄️ Database Migration SQL

### Migration File
**Path**: `prisma/migrations/20260103034431_add_performance_indexes/migration.sql`

### SQL to Execute:
```sql
-- Add performance optimization indexes

-- Device table indexes
CREATE INDEX IF NOT EXISTS "Device_projectId_platform_idx" ON "Device"("projectId", "platform");
CREATE INDEX IF NOT EXISTS "Device_projectId_createdAt_idx" ON "Device"("projectId", "createdAt");
CREATE INDEX IF NOT EXISTS "Device_projectId_lastSeenAt_idx" ON "Device"("projectId", "lastSeenAt");

-- ApiTrace table indexes
CREATE INDEX IF NOT EXISTS "ApiTrace_projectId_timestamp_idx" ON "ApiTrace"("projectId", "timestamp");
CREATE INDEX IF NOT EXISTS "ApiTrace_projectId_screenName_idx" ON "ApiTrace"("projectId", "screenName");
CREATE INDEX IF NOT EXISTS "ApiTrace_projectId_deviceId_idx" ON "ApiTrace"("projectId", "deviceId");
CREATE INDEX IF NOT EXISTS "ApiTrace_projectId_method_statusCode_idx" ON "ApiTrace"("projectId", "method", "statusCode");

-- ProjectMember table indexes
CREATE INDEX IF NOT EXISTS "ProjectMember_userId_projectId_idx" ON "ProjectMember"("userId", "projectId");
```

---

## 🚀 Migration Steps for Production

### Option 1: Via Admin Panel API (Recommended)

1. **Access Admin Panel**
   - Navigate to `/admin` page
   - Authenticate as admin user

2. **Run Migration**
   - Use the migration runner in the admin panel
   - Or call: `POST /api/admin/migrations/run`
   - The endpoint will execute the SQL above

3. **Verify Migration**
   - Check migration status: `GET /api/admin/migrations/status`
   - Or verify indexes exist:
     ```sql
     SELECT indexname FROM pg_indexes 
     WHERE indexname IN (
       'Device_projectId_platform_idx',
       'Device_projectId_createdAt_idx',
       'Device_projectId_lastSeenAt_idx',
       'ApiTrace_projectId_timestamp_idx',
       'ApiTrace_projectId_screenName_idx',
       'ApiTrace_projectId_deviceId_idx',
       'ApiTrace_projectId_method_statusCode_idx',
       'ProjectMember_userId_projectId_idx'
     );
     ```

### Option 2: Direct Database Access

If you have direct database access:

```bash
# Connect to production database
psql $DATABASE_URL

# Run the migration SQL
\i prisma/migrations/20260103034431_add_performance_indexes/migration.sql
```

### Option 3: Prisma Migrate (if available)

```bash
# Deploy migrations
pnpm prisma migrate deploy

# Or push schema (not recommended for production)
pnpm prisma db push
```

---

## ✅ Pre-Migration Checklist

- [ ] Backup production database
- [ ] Review all API changes
- [ ] Test API endpoints locally with membership checks
- [ ] Verify migration SQL is correct
- [ ] Schedule maintenance window (if needed)
- [ ] Notify team of deployment

---

## 🔍 Post-Migration Verification

### 1. Verify Indexes Exist
```sql
SELECT 
  tablename, 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('Device', 'ApiTrace', 'ProjectMember')
  AND indexname LIKE '%projectId%'
ORDER BY tablename, indexname;
```

### 2. Test API Endpoints
- [ ] Test project member can access logs
- [ ] Test project member can access business config
- [ ] Test project member can access localization
- [ ] Test project member can create experiments
- [ ] Test project member can manage config categories

### 3. Monitor Performance
- [ ] Check query execution times in Supabase dashboard
- [ ] Verify indexes are being used (EXPLAIN ANALYZE)
- [ ] Monitor API response times
- [ ] Check for any errors in logs

---

## 📝 Notes

1. **API Changes**: All API changes are code-only and don't require database migrations. They will take effect immediately after deployment.

2. **Database Indexes**: The indexes are additive and safe to add. They will improve query performance without breaking existing functionality.

3. **Backward Compatibility**: All changes are backward compatible. Existing functionality will continue to work.

4. **Rollback Plan**: 
   - API changes: Revert code deployment
   - Database indexes: Drop indexes if needed (not recommended)

---

## 🐛 Known Issues Fixed

1. ✅ Translation update failing with "Key not found" - Fixed access check
2. ✅ Translation update failing with "Internal server error" - Fixed schema mismatch
3. ✅ Experiment creation failing with "Project not found" - Fixed access check
4. ✅ Config categories failing with 404 - Fixed access check
5. ✅ Logs/Business Config/Localization showing "Project not found" for members - Fixed access checks

---

## 📚 Related Documentation

- [Performance Tracker](./PERFORMANCE_TRACKER.md)
- [Technical Details](./TECHNICAL_DETAILS.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Testing Guide](./TESTING_GUIDE.md)

---

**Last Updated**: January 3, 2025  
**Prepared By**: AI Assistant  
**Reviewed By**: Pending

