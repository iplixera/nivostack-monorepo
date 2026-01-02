# pgAdmin Setup Guide - Local Database

## Installation

### macOS
```bash
# Using Homebrew
brew install --cask pgadmin4

# Or download from: https://www.pgadmin.org/download/
```

### Windows
Download from: https://www.pgadmin.org/download/pgadmin-4-windows/

### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install pgadmin4

# Or download from: https://www.pgadmin.org/download/
```

## First Launch Setup

1. **Open pgAdmin 4**
   - Launch from Applications (macOS) or Start Menu (Windows)

2. **Set Master Password** (First time only)
   - pgAdmin will ask you to set a master password
   - This is for pgAdmin itself, not the database
   - Choose a secure password and remember it

3. **pgAdmin Interface**
   - You'll see the pgAdmin dashboard
   - Left sidebar: Server Groups and Servers

## Adding Local Database Server

### Step 1: Create New Server
1. Right-click on **"Servers"** in the left sidebar
2. Select **"Register"** → **"Server..."**

### Step 2: General Tab
- **Name**: `Local DevBridge` (or any name you prefer)
- **Server Group**: `Servers` (default)
- **Comments**: Optional description

### Step 3: Connection Tab
Fill in the connection details:

- **Host name/address**: `localhost`
- **Port**: `5433`
- **Maintenance database**: `devbridge`
- **Username**: `postgres`
- **Password**: `devbridge_local_password`
- **Save password**: ✅ Check this box (optional, but convenient)

### Step 4: Advanced Tab (Optional)
- **DB restriction**: Leave empty (or enter `devbridge` to only show this database)

### Step 5: Save
- Click **"Save"** button
- pgAdmin will connect to your database

## Verifying Connection

After saving, you should see:
- ✅ Green checkmark next to "Local DevBridge" server
- Expand the server to see:
  - **Databases** → `devbridge`
  - **Login/Group Roles**
  - **Tablespaces**

## Exploring the Database

### View Tables
1. Expand: **Servers** → **Local DevBridge** → **Databases** → **devbridge** → **Schemas** → **public** → **Tables**
2. You'll see all tables: Device, ApiTrace, Project, etc.

### View Indexes
1. Expand any table (e.g., **Device**)
2. Click on **"Indexes"**
3. You'll see all indexes including the new performance indexes

### Run Queries
1. Right-click on **"devbridge"** database
2. Select **"Query Tool"**
3. Type your SQL query
4. Click **"Execute"** (F5) or press `Cmd+Enter` (macOS) / `F5` (Windows)

## Useful Queries to Run

### Check All Tables
```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Check Indexes
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('Device', 'ApiTrace', 'ProjectMember')
ORDER BY tablename, indexname;
```

### Check Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('Device', 'ApiTrace', 'ProjectMember')
ORDER BY idx_scan DESC;
```

## Troubleshooting

### Connection Refused
**Problem**: Can't connect to server

**Solutions**:
1. Check if Docker container is running:
   ```bash
   docker ps | grep postgres
   ```

2. Start the database:
   ```bash
   cd /Users/karim-f/Code/nivostack-monorepo-checkout
   bash scripts/database/start-local-database.sh
   ```

3. Verify port is correct: `5433` (not 5432)

### Authentication Failed
**Problem**: Wrong password error

**Solutions**:
1. Verify password: `devbridge_local_password`
2. Check `.env.local` file for correct credentials
3. Try re-entering password in pgAdmin connection settings

### Server Not Found
**Problem**: Can't find server after adding

**Solutions**:
1. Check if server is collapsed in left sidebar
2. Right-click on "Servers" → "Refresh"
3. Try removing and re-adding the server

### Can't See Tables
**Problem**: Database connected but no tables visible

**Solutions**:
1. Expand: Servers → Local DevBridge → Databases → devbridge → Schemas → public → Tables
2. Right-click on "Tables" → "Refresh"
3. Verify database name is `devbridge` (not `postgres`)

## Quick Reference

### Connection Details Summary
```
Host: localhost
Port: 5433
Database: devbridge
Username: postgres
Password: devbridge_local_password
```

### Keyboard Shortcuts
- **Execute Query**: `F5` or `Cmd+Enter` (macOS) / `F5` (Windows)
- **New Query**: `Cmd+Alt+Q` (macOS) / `Ctrl+Alt+Q` (Windows)
- **Refresh**: `F5` (when viewing objects)

### Useful Features
- **Query Tool**: Run SQL queries
- **View/Edit Data**: Right-click table → "View/Edit Data"
- **Properties**: Right-click object → "Properties" to see details
- **Scripts**: Right-click object → "Scripts" to generate SQL

## Next Steps

After connecting:
1. ✅ Explore tables and data
2. ✅ Run performance queries to verify indexes
3. ✅ Monitor query performance
4. ✅ Use Query Tool for testing optimizations

## Additional Resources

- pgAdmin Documentation: https://www.pgadmin.org/docs/
- PostgreSQL Documentation: https://www.postgresql.org/docs/

