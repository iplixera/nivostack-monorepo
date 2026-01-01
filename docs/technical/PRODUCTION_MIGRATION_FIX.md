# Production Migration Fix

## Issue

After deploying team invitations feature, production API endpoints (e.g., `/api/sdk-settings`) were returning 500 errors because:

1. The `ProjectMember` table doesn't exist in production yet (migrations haven't run)
2. The `canPerformAction` function queries `ProjectMember` table
3. When the table doesn't exist, Prisma throws an error causing 500 responses

## Solution

### 1. Error Handling (Already Applied)

Added graceful error handling in:
- `dashboard/src/lib/team-access.ts` - All functions that query `ProjectMember` now catch errors and fall back to legacy ownership checks
- `dashboard/src/app/api/sdk-settings/route.ts` - Added try-catch around `canPerformAction` with fallback to legacy check

This ensures the app works even if migrations haven't run yet.

### 2. Run Database Migrations

You need to run migrations to create the new tables (`ProjectMember`, `ProjectInvitation`, `UserNotification`, etc.).

#### Option A: Via Health Endpoint (Automatic)

The `/api/health` endpoint automatically runs migrations on first call after deployment:

```bash
curl https://studio.nivostack.com/api/health
```

This will:
- Run `prisma db push` to sync schema
- Create missing tables
- Return migration status

#### Option B: Manual Migration Script

Run the production migration script:

```bash
bash scripts/migrate-production.sh
```

This will:
- Push schema to production database
- Create all missing tables including:
  - `ProjectMember`
  - `ProjectInvitation`
  - `UserNotification`
  - `UserNotificationPreferences`
  - `SystemConfiguration`

#### Option C: Via Vercel Function

You can also trigger migrations via the `/api/migrate` endpoint (requires auth):

```bash
curl -X POST https://studio.nivostack.com/api/migrate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Verification

After running migrations, verify tables exist:

1. Check Supabase Dashboard → Table Editor
2. You should see:
   - `ProjectMember`
   - `ProjectInvitation`
   - `UserNotification`
   - `UserNotificationPreferences`
   - `SystemConfiguration`

3. Test API endpoints:
   ```bash
   curl https://studio.nivostack.com/api/sdk-settings?projectId=YOUR_PROJECT_ID \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Status

- ✅ Error handling added (prevents 500 errors)
- ⏳ Migrations need to be run (choose one option above)
- ✅ Backward compatibility maintained (legacy projects still work)

## Next Steps

1. Run migrations using one of the options above
2. Verify tables exist in Supabase
3. Test API endpoints
4. Check Vercel logs for any errors

