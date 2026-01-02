# Local Database Connection Details

## PostgreSQL Connection Information

### Connection String
```
postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
```

### Connection Details
- **Host**: `localhost`
- **Port**: `5433`
- **Database**: `devbridge`
- **Username**: `postgres`
- **Password**: `devbridge_local_password`

## Connection Methods

### 1. Using psql (Command Line)
```bash
psql postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
```

Or:
```bash
psql -h localhost -p 5433 -U postgres -d devbridge
# Password: devbridge_local_password
```

### 2. Using Docker Exec
```bash
docker exec -it devbridge-postgres psql -U postgres -d devbridge
```

### 3. Using Database GUI Tools

#### DBeaver
1. New Database Connection
2. PostgreSQL
3. Host: `localhost`
4. Port: `5433`
5. Database: `devbridge`
6. Username: `postgres`
7. Password: `devbridge_local_password`

#### TablePlus
1. New Connection → PostgreSQL
2. Host: `localhost`
3. Port: `5433`
4. User: `postgres`
5. Password: `devbridge_local_password`
6. Database: `devbridge`

#### pgAdmin
1. Add New Server
2. General → Name: `Local DevBridge`
3. Connection:
   - Host: `localhost`
   - Port: `5433`
   - Database: `devbridge`
   - Username: `postgres`
   - Password: `devbridge_local_password`

#### DataGrip / IntelliJ IDEA
1. New → Data Source → PostgreSQL
2. Host: `localhost`
3. Port: `5433`
4. Database: `devbridge`
5. User: `postgres`
6. Password: `devbridge_local_password`

### 4. Using VS Code Extensions

#### PostgreSQL Extension
- Extension: `ms-ossdata.vscode-postgresql`
- Connection string: `postgresql://postgres:devbridge_local_password@localhost:5433/devbridge`

#### SQLTools Extension
- Extension: `mtxr.sqltools-driver-pg`
- Host: `localhost`
- Port: `5433`
- Database: `devbridge`
- Username: `postgres`
- Password: `devbridge_local_password`

## Quick Connection Test

```bash
# Test connection
docker exec devbridge-postgres psql -U postgres -d devbridge -c "SELECT version();"

# List all tables
docker exec devbridge-postgres psql -U postgres -d devbridge -c "\dt"

# Check indexes
docker exec devbridge-postgres psql -U postgres -d devbridge -c "\di"
```

## Useful Queries

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size('devbridge'));
```

### List All Tables
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

### Check Indexes
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
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

## Docker Container Management

### Start Database
```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout
bash scripts/database/start-local-database.sh
```

### Stop Database
```bash
docker stop devbridge-postgres
```

### View Database Logs
```bash
docker logs devbridge-postgres
```

### Restart Database
```bash
docker restart devbridge-postgres
```

## Environment Variables

The connection details are stored in `.env.local`:
```bash
POSTGRES_PRISMA_URL=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
POSTGRES_URL_NON_POOLING=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
```

## Troubleshooting

### Connection Refused
- Check if Docker container is running: `docker ps | grep postgres`
- Start the database: `bash scripts/database/start-local-database.sh`

### Wrong Password
- Password is: `devbridge_local_password`
- Check `.env.local` file for correct credentials

### Port Already in Use
- Check if port 5433 is available: `lsof -i :5433`
- Stop conflicting service or change port in `docker-compose.yml`

### Database Not Found
- Database name is: `devbridge`
- Verify with: `docker exec devbridge-postgres psql -U postgres -l`

