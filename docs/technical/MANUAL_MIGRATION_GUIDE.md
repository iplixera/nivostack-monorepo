# Manual Database Migration Guide

## Issue

The database migrations are not running automatically during Vercel builds. This is causing 500 errors because the following tables/columns are missing:

- `ProjectMember` table
- `ProjectInvitation` table  
- `UserNotification` table
- `UserNotificationPreferences` table
- `Plan.maxTeamMembers` column
- `Plan.maxSeats` column

## Solution: Run Migrations Manually

You need to run `prisma db push` manually on the production database. Here are the options:

### Option 1: Run from Local Machine (Recommended)

1. **Set up environment variables** to point to production database:
   ```bash
   export POSTGRES_PRISMA_URL="your-production-database-url"
   export POSTGRES_URL_NON_POOLING="your-production-direct-database-url"
   ```

2. **Navigate to dashboard directory**:
   ```bash
   cd dashboard
   ```

3. **Run the migration**:
   ```bash
   pnpm prisma db push
   ```

   This will:
   - Create missing tables (`ProjectMember`, `ProjectInvitation`, `UserNotification`, `UserNotificationPreferences`)
   - Add missing columns (`Plan.maxTeamMembers`, `Plan.maxSeats`)
   - Update the database schema to match `prisma/schema.prisma`

### Option 2: Use Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Pull environment variables**:
   ```bash
   vercel env pull .env.local
   ```

3. **Run migration**:
   ```bash
   cd dashboard
   pnpm prisma db push
   ```

### Option 3: Use Supabase Dashboard SQL Editor

If you're using Supabase, you can run the migrations via SQL:

1. Go to Supabase Dashboard → SQL Editor
2. Run the following SQL (this is what `prisma db push` would do):

```sql
-- Add maxTeamMembers and maxSeats to Plan table
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "maxTeamMembers" INTEGER;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "maxSeats" INTEGER;

-- Create ProjectMember table
CREATE TABLE IF NOT EXISTS "ProjectMember" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- Create ProjectInvitation table
CREATE TABLE IF NOT EXISTS "ProjectInvitation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "token" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "emailDelivered" BOOLEAN NOT NULL DEFAULT false,
    "emailOpened" BOOLEAN NOT NULL DEFAULT false,
    "emailClicked" BOOLEAN NOT NULL DEFAULT false,
    "resendCount" INTEGER NOT NULL DEFAULT 0,
    "lastResentAt" TIMESTAMP(3),
    "lastResentBy" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "acceptedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProjectInvitation_pkey" PRIMARY KEY ("id")
);

-- Create UserNotification table
CREATE TABLE IF NOT EXISTS "UserNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- Create UserNotificationPreferences table
CREATE TABLE IF NOT EXISTS "UserNotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailInvitations" BOOLEAN NOT NULL DEFAULT true,
    "emailProjectUpdates" BOOLEAN NOT NULL DEFAULT true,
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "emailWeeklyDigest" BOOLEAN NOT NULL DEFAULT false,
    "inAppInvitations" BOOLEAN NOT NULL DEFAULT true,
    "inAppProjectUpdates" BOOLEAN NOT NULL DEFAULT true,
    "inAppAlerts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserNotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys and indexes (run these after creating tables)
-- Note: Adjust based on your actual foreign key constraints
```

## Verify Migration Success

After running migrations, verify by:

1. **Check Vercel logs** - The errors should stop appearing
2. **Test APIs**:
   - `GET /api/plans` - Should return plans (not 500)
   - `GET /api/subscription` - Should return subscription (not 500)
   - `GET /api/subscription/usage` - Should return usage stats (not 404)
   - `GET /api/notifications` - Should return empty array (not 500)

## Why Migrations Aren't Running Automatically

The build script (`scripts/vercel-build.sh`) includes `prisma db push`, but it's set to not fail the build if migrations fail. This is intentional to prevent build failures, but it means migrations might not run if:

1. Database connection isn't available during build
2. Database has IP restrictions
3. Migration takes too long and times out

## Future Improvements

Consider:
1. Running migrations in a separate step (not during build)
2. Using Prisma Migrate instead of `db push` for better control
3. Setting up a migration service/webhook that runs after deployment

