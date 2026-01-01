# Running Database Migrations Now

## Current Status

✅ **Code pushed to main** - Vercel should automatically deploy and run migrations

## Migration Options

### Option 1: Check Vercel Deployment (Recommended)

The migrations should have run automatically during the latest deployment:

1. Go to: https://vercel.com/plixeras/nivostack-studio/deployments
2. Check the latest deployment logs
3. Look for "Running Database Migrations..." section
4. Verify it says "✅ Migrations applied successfully"

### Option 2: Trigger via Vercel Dashboard

1. Go to: https://vercel.com/plixeras/nivostack-studio/functions
2. Find `/api/migrate` function
3. Click "Invoke" button
4. This will run migrations directly from the deployed server

### Option 3: Trigger Redeployment

If migrations didn't run, trigger a new deployment:

```bash
# Make a small change to trigger deployment
git commit --allow-empty -m "chore: trigger deployment for migrations"
git push origin main
```

### Option 4: Manual Migration (If IP Whitelisted)

If your IP is whitelisted in Supabase:

```bash
bash scripts/migrate-production.sh
# Type 'yes' when prompted
```

## Verification

After migrations run, verify tables exist:

1. **Check Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/djyqtlxjpzlncppmazzz/editor
   - Check Table Editor
   - Verify these tables exist:
     - `ProjectMember`
     - `ProjectInvitation`
     - `UserNotification`
     - `UserNotificationPreferences`
     - `SystemConfiguration`

2. **Test API:**
   ```bash
   curl https://studio.nivostack.com/api/sdk-settings?projectId=YOUR_PROJECT_ID \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   Should return 200 OK (not 500)

## What Gets Created

The migration will create these new tables:
- `ProjectMember` - Team member roles and permissions
- `ProjectInvitation` - Pending team invitations
- `UserNotification` - In-app notifications
- `UserNotificationPreferences` - User notification settings
- `SystemConfiguration` - System-wide configuration (invitation expiry, etc.)

## Troubleshooting

**Migrations didn't run during build?**
- Check Vercel build logs for errors
- May fail due to IP restrictions (non-blocking)
- Use Option 2 (Vercel Dashboard) to run manually

**Still getting 500 errors?**
- Error handling is in place (should fall back to legacy checks)
- But migrations still need to run for full functionality
- Check Vercel function logs for specific errors

