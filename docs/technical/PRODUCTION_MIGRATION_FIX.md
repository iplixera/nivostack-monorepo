# Production Migration Fix - Subscription & Notification APIs

## Issue

Production APIs were returning 500 errors:
- `GET /api/subscription` - 500 Internal Server Error
- `GET /api/subscription/enforcement` - 500 Internal Server Error
- `GET /api/subscription/usage` - 500 Internal Server Error
- `GET /api/notifications` - 500 Internal Server Error
- `GET /api/sdk-settings` - 500 Internal Server Error (for some users)

## Root Cause

The Prisma schema was missing the following models that were being used in the code:
1. `ProjectMember` - Team member relationships
2. `ProjectInvitation` - Pending invitations
3. `UserNotification` - In-app notifications
4. `UserNotificationPreferences` - User notification preferences

These models were defined in the team invitations feature plan but were never added to the actual Prisma schema file. When the code tried to access these models, Prisma threw errors because the tables didn't exist in the database.

## Solution

### 1. Added Missing Models to Prisma Schema

Added the following models to `dashboard/prisma/schema.prisma`:

- **ProjectMember**: Many-to-many relationship between Users and Projects with roles
- **ProjectInvitation**: Tracks pending invitations with tokens and expiry
- **UserNotification**: In-app notifications for users
- **UserNotificationPreferences**: User preferences for email/in-app notifications

### 2. Updated Model Relations

- Updated `User` model to include:
  - `projectMemberships` (ProjectMember[])
  - `sentInvitations` (ProjectInvitation[])
  - `notifications` (UserNotification[])
  - `notificationPreferences` (UserNotificationPreferences?)
  - `invitedMembers` (ProjectMember[])

- Updated `Project` model to include:
  - `members` (ProjectMember[])
  - `invitations` (ProjectInvitation[])

### 3. Added Error Handling

Added graceful error handling to prevent 500 errors when tables don't exist:

- **`dashboard/src/lib/subscription.ts`**: Added try-catch around `prisma.projectMember.findMany()` in `getUsageStats()`
- **`dashboard/src/lib/enforcement.ts`**: Added try-catch around `prisma.enforcementState` operations
- **`dashboard/src/app/api/notifications/route.ts`**: Added try-catch around `prisma.userNotification.findMany()`
- **`dashboard/src/lib/notifications.ts`**: Added try-catch in `getUnreadNotificationCount()`

All error handlers check for Prisma error codes (`P2021`) and messages indicating missing tables, then return safe defaults (empty arrays, 0 counts, null values) instead of throwing errors.

## Deployment Steps

1. **Schema Changes**: The Prisma schema has been updated with the missing models
2. **Database Migration**: Run `prisma db push` to create the tables in production
3. **Code Deployment**: The code changes with error handling are already deployed

## Migration Command

The build script (`scripts/vercel-build.sh`) already includes `prisma db push`, so the migration should run automatically on the next deployment. However, if needed, you can manually run:

```bash
cd dashboard
pnpm prisma db push
```

## Testing

After deployment, verify:
1. ✅ `/api/subscription` returns subscription data
2. ✅ `/api/subscription/enforcement` returns enforcement state (or defaults)
3. ✅ `/api/subscription/usage` returns usage stats (teamMembers count may be 0 initially)
4. ✅ `/api/notifications` returns empty array (or notifications if any exist)
5. ✅ `/api/sdk-settings` works for all users (owners and invited members)

## Notes

- The error handling ensures backward compatibility - if tables don't exist, the APIs return safe defaults instead of crashing
- Once migrations are applied, the error handling will still work but won't be triggered
- Team member counts will be 0 until `ProjectMember` entries are created
- Notifications will be empty until `UserNotification` entries are created
