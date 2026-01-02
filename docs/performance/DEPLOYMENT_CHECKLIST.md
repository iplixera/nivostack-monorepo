# Performance Optimization Deployment Checklist

**Branch**: `feature/performance-improvements`  
**Last Updated**: January 2, 2025

## Pre-Deployment Checklist

### Code Changes
- [x] Database indexes added to schema
- [x] Projects endpoint optimized (N+1 fix)
- [x] Devices endpoint optimized (9→3 queries)
- [x] Traces endpoint optimized (conditional fetching)
- [x] Migration file created
- [x] Prisma client regenerated
- [x] All tests passing locally

### Documentation
- [x] Performance tracker updated
- [x] Technical details documented
- [x] Testing guide created
- [x] Supabase tracking document created

## Local Deployment ✅

### Completed
- [x] Migration file created: `prisma/migrations/*/migration.sql`
- [x] Indexes applied to local database
- [x] Prisma client regenerated
- [x] Server running and tested

### Verification
```sql
-- Verify indexes exist
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

## Staging Deployment

### Pre-Deployment
- [ ] Review all code changes
- [ ] Verify migration SQL is correct
- [ ] Backup staging database
- [ ] Notify team of deployment

### Deployment Steps

1. **Merge to develop branch**
   ```bash
   git checkout develop
   git merge feature/performance-improvements
   git push origin develop
   ```

2. **Deploy to Staging**
   - Trigger staging deployment (Vercel/CI)
   - Wait for deployment to complete

3. **Run Migration**
   ```bash
   # On staging server or via CI
   pnpm prisma migrate deploy
   ```

4. **Verify Indexes**
   ```sql
   -- Connect to staging database
   SELECT indexname FROM pg_indexes 
   WHERE tablename IN ('Device', 'ApiTrace', 'ProjectMember')
   ORDER BY tablename, indexname;
   ```

5. **Test Endpoints**
   - [ ] `/api/projects` - Verify N+1 fix
   - [ ] `/api/devices` - Verify query reduction
   - [ ] `/api/traces` - Verify conditional fetching

6. **Monitor Performance**
   - [ ] Check Supabase dashboard for query performance
   - [ ] Monitor API response times
   - [ ] Check database connection pool usage
   - [ ] Verify no errors in logs

7. **Update Documentation**
   - [ ] Update SUPABASE_TRACKING.md with staging metrics
   - [ ] Record baseline and improved metrics
   - [ ] Document any issues encountered

### Staging Success Criteria
- [ ] All indexes created successfully
- [ ] No errors in application logs
- [ ] API endpoints responding correctly
- [ ] Query performance improved
- [ ] No regressions observed
- [ ] Database load acceptable

## Production Deployment

### Pre-Deployment
- [ ] Staging tests passed
- [ ] Performance improvements verified in staging
- [ ] No critical issues in staging
- [ ] Backup production database
- [ ] Schedule maintenance window (if needed)
- [ ] Notify stakeholders

### Deployment Steps

1. **Merge to main branch**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Deploy to Production**
   - Trigger production deployment
   - Monitor deployment process

3. **Run Migration**
   ```bash
   # On production server or via CI
   pnpm prisma migrate deploy
   ```
   
   **Note**: Index creation can be done online but may take time on large tables.
   Monitor during creation.

4. **Verify Indexes**
   ```sql
   -- Connect to production database
   SELECT indexname FROM pg_indexes 
   WHERE tablename IN ('Device', 'ApiTrace', 'ProjectMember')
   ORDER BY tablename, indexname;
   ```

5. **Monitor Closely**
   - [ ] Watch query performance in Supabase dashboard
   - [ ] Monitor database CPU and memory usage
   - [ ] Check API response times
   - [ ] Verify no errors in logs
   - [ ] Monitor connection pool usage

6. **Update Documentation**
   - [ ] Update SUPABASE_TRACKING.md with production metrics
   - [ ] Update PERFORMANCE_TRACKER.md with deployment status
   - [ ] Document performance improvements achieved

### Production Success Criteria
- [ ] All indexes created successfully
- [ ] No errors in application logs
- [ ] API endpoints responding correctly
- [ ] Query performance improved (verify with metrics)
- [ ] No incidents during deployment
- [ ] Database load acceptable

## Rollback Plan

If issues occur:

1. **Code Rollback**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Index Rollback** (if needed)
   ```sql
   -- Drop indexes if causing issues
   DROP INDEX IF EXISTS "Device_projectId_platform_idx";
   DROP INDEX IF EXISTS "Device_projectId_createdAt_idx";
   DROP INDEX IF EXISTS "Device_projectId_lastSeenAt_idx";
   DROP INDEX IF EXISTS "ApiTrace_projectId_timestamp_idx";
   DROP INDEX IF EXISTS "ApiTrace_projectId_screenName_idx";
   DROP INDEX IF EXISTS "ApiTrace_projectId_deviceId_idx";
   DROP INDEX IF EXISTS "ApiTrace_projectId_method_statusCode_idx";
   DROP INDEX IF EXISTS "ProjectMember_userId_projectId_idx";
   ```

3. **Investigate Issues**
   - Review error logs
   - Check database performance
   - Identify root cause
   - Fix and re-deploy

## Post-Deployment

### Monitoring (First 24 Hours)
- [ ] Monitor API response times hourly
- [ ] Check database query performance
- [ ] Monitor error rates
- [ ] Check Supabase dashboard metrics
- [ ] Verify user reports (if any)

### Monitoring (First Week)
- [ ] Daily performance review
- [ ] Compare metrics with baseline
- [ ] Verify sustained improvements
- [ ] Document any issues

### Documentation Updates
- [ ] Final performance metrics recorded
- [ ] Lessons learned documented
- [ ] Update team on improvements
- [ ] Close performance optimization task

## Contacts

- **Database**: Supabase Dashboard
- **Deployment**: Vercel Dashboard
- **Monitoring**: Supabase Query Performance Insights

## Notes

- Index creation is non-blocking but may take time on large tables
- Monitor database load during index creation
- Keep migration file for reference
- All changes are backward compatible

