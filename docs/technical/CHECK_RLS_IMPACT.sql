-- Check Current Database Role and RLS Status
-- Run this in Supabase SQL Editor to determine if enabling RLS is safe

-- 1. Check current user/role
SELECT 
  current_user as "Current User",
  current_role as "Current Role",
  session_user as "Session User";

-- 2. Check if current role is service_role (bypasses RLS)
SELECT 
  CASE 
    WHEN current_user = 'service_role' THEN '✅ Service Role - RLS bypassed'
    WHEN current_user = 'postgres' THEN '⚠️ Postgres User - RLS will apply'
    ELSE '❓ Unknown Role - Check Supabase settings'
  END as "RLS Impact";

-- 3. Check RLS status on a sample table
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('User', 'Project', 'Device', 'Log', 'ApiTrace')
ORDER BY tablename;

-- 4. Test query (what Prisma does) - should work if using service_role
SELECT COUNT(*) as "User Count" FROM "User";
SELECT COUNT(*) as "Project Count" FROM "Project";
SELECT COUNT(*) as "Device Count" FROM "Device";

-- 5. Check connection info
SELECT 
  inet_server_addr() as "Server IP",
  inet_server_port() as "Server Port",
  version() as "PostgreSQL Version";

