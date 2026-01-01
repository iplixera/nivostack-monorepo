# Database Migration Workflow

## Overview

Database migrations are run through the Admin Dashboard UI, not manually or during build. This ensures:
- Migrations run only when needed
- Admin control over when migrations execute
- No build failures due to migration issues
- Works in serverless environments (Vercel)

## Workflow for New Migrations

### Step 1: Update Prisma Schema

Add your new models/columns to `dashboard/prisma/schema.prisma`:

```prisma
model NewModel {
  id        String   @id @default(cuid())
  // ... fields
  createdAt DateTime @default(now())
}
```

### Step 2: Update Migration Endpoint

Edit `dashboard/src/app/api/admin/migrations/run/route.ts` and add the SQL to create your new tables/columns:

```typescript
// In the POST handler, add a new try-catch block:

try {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "NewModel" (
      "id" TEXT NOT NULL,
      -- ... other columns
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "NewModel_pkey" PRIMARY KEY ("id")
    );
  `)
  results.push('Created NewModel table')
} catch (e: any) {
  if (e.message?.includes('already exists')) {
    warnings.push('NewModel table may already exist')
  } else {
    throw e
  }
}
```

### Step 3: Update Status Check

Also update the GET handler to check if your new table/column exists:

```typescript
// In the GET handler, add a check:

try {
  await prisma.$queryRaw`SELECT 1 FROM "NewModel" LIMIT 1`
  checks.newModel = true
} catch (e: any) {
  if (!e.message?.includes('does not exist')) {
    console.warn('Error checking NewModel:', e.message)
  }
}
```

### Step 4: Deploy and Run

1. Commit and push your changes
2. Wait for deployment to complete
3. Go to Admin Dashboard (`/admin`)
4. Click "Run Migrations" if needed
5. Verify the migration completed successfully

## Best Practices

1. **Always use `IF NOT EXISTS`** - Prevents errors if migrations run multiple times
2. **Wrap in try-catch** - Handle "already exists" errors gracefully
3. **Add to status checks** - So admins can see what's missing
4. **Test locally first** - Run migrations on local database before deploying
5. **Document changes** - Add comments explaining what each migration does

## Example: Adding a New Column

```typescript
// Add column to existing table
try {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ExistingTable" 
    ADD COLUMN IF NOT EXISTS "newColumn" TEXT;
  `)
  results.push('Added newColumn to ExistingTable')
} catch (e: any) {
  if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
    warnings.push('newColumn may already exist')
  } else {
    throw e
  }
}
```

## Example: Creating a New Table with Relations

```typescript
// Create table with foreign key
try {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "NewTable" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "NewTable_pkey" PRIMARY KEY ("id")
    );
    
    CREATE INDEX IF NOT EXISTS "NewTable_userId_idx" ON "NewTable"("userId");
  `)
  results.push('Created NewTable with indexes')
} catch (e: any) {
  if (e.message?.includes('already exists')) {
    warnings.push('NewTable may already exist')
  } else {
    throw e
  }
}
```

## Troubleshooting

### Migration Fails
- Check Vercel logs for detailed error messages
- Verify SQL syntax is correct
- Ensure database connection is working
- Check if tables/columns already exist manually

### Status Shows "Pending" After Migration
- Refresh the page
- Check if migration actually completed (look at results)
- Verify the status check SQL is correct

### Migration Partially Completes
- Some tables created, others failed
- Check error messages in the response
- Run migration again (safe due to `IF NOT EXISTS`)
- Manually fix any issues and re-run

## Security Notes

- Only admins can run migrations (enforced by `validateAdmin`)
- Migrations run in production database (be careful!)
- Always test migrations locally first
- Consider backing up database before major migrations

