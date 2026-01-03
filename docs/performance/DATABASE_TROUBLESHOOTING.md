# Database Connection Troubleshooting

## Common Errors and Solutions

### Error: "FATAL: could not open file 'global/pg_filenode.map': Permission denied"

This error typically indicates PostgreSQL permission issues with its data directory.

#### Solution 1: Restart Database Container
```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout
docker restart devbridge-postgres
```

Wait a few seconds, then try connecting again.

#### Solution 2: Recreate Database Container
If restart doesn't work, recreate the container:

```bash
# Stop and remove container
docker stop devbridge-postgres
docker rm devbridge-postgres

# Start fresh (will recreate container)
cd /Users/karim-f/Code/nivostack-monorepo-checkout
bash scripts/database/start-local-database.sh
```

**Note**: This will **NOT** delete your data if you're using a Docker volume.

#### Solution 3: Fix Permissions (Advanced)
```bash
# Check current permissions
docker exec devbridge-postgres ls -ld /var/lib/postgresql/data

# Fix permissions (if needed)
docker exec devbridge-postgres chown -R postgres:postgres /var/lib/postgresql/data
docker exec devbridge-postgres chmod 700 /var/lib/postgresql/data
```

#### Solution 4: Use Docker Exec Instead
If DBeaver has issues, use Docker exec directly:

```bash
docker exec -it devbridge-postgres psql -U postgres -d devbridge
```

This bypasses network connection issues.

---

### Error: "Connection Refused"

**Problem**: Can't connect to database

**Solutions**:
1. Check if container is running:
   ```bash
   docker ps | grep postgres
   ```

2. Start database:
   ```bash
   cd /Users/karim-f/Code/nivostack-monorepo-checkout
   bash scripts/database/start-local-database.sh
   ```

3. Verify port:
   - Should be `5433` (not 5432)
   - Check: `docker ps | grep postgres`

---

### Error: "Authentication Failed"

**Problem**: Wrong password

**Solutions**:
1. Verify password: `devbridge_local_password`
2. Check `.env.local` file
3. Try resetting password:
   ```bash
   docker exec devbridge-postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'devbridge_local_password';"
   ```

---

### Error: "Database does not exist"

**Problem**: Database name incorrect

**Solutions**:
1. Verify database name: `devbridge`
2. List databases:
   ```bash
   docker exec devbridge-postgres psql -U postgres -l
   ```

3. Create database if missing:
   ```bash
   docker exec devbridge-postgres psql -U postgres -c "CREATE DATABASE devbridge;"
   ```

---

### DBeaver Specific Issues

#### Connection Test Fails
1. **Check Connection Settings**:
   - Host: `localhost` (not `127.0.0.1`)
   - Port: `5433`
   - Database: `devbridge`
   - Username: `postgres`
   - Password: `devbridge_local_password`

2. **Test with psql first**:
   ```bash
   psql postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
   ```
   If this works, the issue is with DBeaver configuration.

3. **Check DBeaver Driver**:
   - Ensure PostgreSQL driver is installed
   - DBeaver → Database → Driver Manager → PostgreSQL
   - Download/Update driver if needed

#### SSL Connection Errors
In DBeaver connection settings:
- **SSL Mode**: `disable` (for local development)
- Or uncheck "Use SSL"

---

## Quick Diagnostic Commands

### Check Database Status
```bash
# Is container running?
docker ps | grep postgres

# Check logs
docker logs devbridge-postgres --tail 50

# Test connection
docker exec devbridge-postgres psql -U postgres -d devbridge -c "SELECT 1;"
```

### Verify Connection Details
```bash
# Check environment variables
cd /Users/karim-f/Code/nivostack-monorepo-checkout
cat .env.local | grep POSTGRES

# Test connection string
psql postgresql://postgres:devbridge_local_password@localhost:5433/devbridge -c "SELECT version();"
```

### Check Port Availability
```bash
# Check if port 5433 is in use
lsof -i :5433

# Check Docker port mapping
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep postgres
```

---

## Alternative Connection Methods

If DBeaver continues to have issues, try:

### 1. TablePlus (Recommended)
```bash
brew install --cask tableplus
```
- More reliable on Mac
- Better error messages

### 2. Command Line (psql)
```bash
# Direct connection
psql postgresql://postgres:devbridge_local_password@localhost:5433/devbridge

# Or via Docker
docker exec -it devbridge-postgres psql -U postgres -d devbridge
```

### 3. VS Code Extensions
- PostgreSQL Extension
- SQLTools Extension

---

## Complete Reset (Last Resort)

If nothing works, completely reset the database:

```bash
# Stop and remove container
docker stop devbridge-postgres
docker rm devbridge-postgres

# Remove volume (WARNING: Deletes all data)
docker volume rm $(docker volume ls | grep postgres | awk '{print $2}')

# Start fresh
cd /Users/karim-f/Code/nivostack-monorepo-checkout
bash scripts/database/start-local-database.sh

# Run migrations
cd dashboard
export POSTGRES_PRISMA_URL="postgresql://postgres:devbridge_local_password@localhost:5433/devbridge"
export POSTGRES_URL_NON_POOLING="postgresql://postgres:devbridge_local_password@localhost:5433/devbridge"
pnpm prisma db push
```

---

## Still Having Issues?

1. Check Docker Desktop is running
2. Verify Docker has enough resources allocated
3. Check system logs: `docker logs devbridge-postgres`
4. Try connecting from command line first to isolate the issue
5. Consider using TablePlus instead of DBeaver for Mac

