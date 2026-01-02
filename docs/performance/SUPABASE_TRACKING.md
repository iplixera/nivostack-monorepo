# Supabase Database Performance Tracking

**Purpose**: Track database performance metrics for staging and production environments on Supabase.

## Environments

### Staging Environment
- **Database**: Supabase Staging
- **Connection**: [Add connection string]
- **Dashboard**: [Add Supabase dashboard URL]
- **Last Updated**: January 2, 2025

### Production Environment
- **Database**: Supabase Production
- **Connection**: [Add connection string]
- **Dashboard**: [Add Supabase dashboard URL]
- **Last Updated**: January 2, 2025

## Performance Metrics

### Query Performance

#### Staging
| Query Type | Avg Time (ms) | p95 Time (ms) | p99 Time (ms) | Status |
|------------|---------------|---------------|---------------|--------|
| Device List | - | - | - | Baseline |
| Device Counts | - | - | - | Baseline |
| Project List | - | - | - | Baseline |
| Trace List | - | - | - | Baseline |
| Screen Names | - | - | - | Baseline |

#### Production
| Query Type | Avg Time (ms) | p95 Time (ms) | p99 Time (ms) | Status |
|------------|---------------|---------------|---------------|--------|
| Device List | - | - | - | Baseline |
| Device Counts | - | - | - | Baseline |
| Project List | - | - | - | Baseline |
| Trace List | - | - | - | Baseline |
| Screen Names | - | - | - | Baseline |

### Index Usage

#### Staging
| Table | Index | Scans | Tuples Read | Status |
|-------|-------|-------|-------------|--------|
| Device | projectId | - | - | Monitoring |
| Device | projectId_platform | - | - | Monitoring |
| ApiTrace | projectId_timestamp | - | - | Monitoring |
| ApiTrace | projectId_screenName | - | - | Monitoring |

#### Production
| Table | Index | Scans | Tuples Read | Status |
|-------|-------|-------|-------------|--------|
| Device | projectId | - | - | Monitoring |
| Device | projectId_platform | - | - | Monitoring |
| ApiTrace | projectId_timestamp | - | - | Monitoring |
| ApiTrace | projectId_screenName | - | - | Monitoring |

### Connection Pool

#### Staging
- **Pool Size**: -
- **Active Connections**: -
- **Idle Connections**: -
- **Utilization**: -%
- **Status**: Monitoring

#### Production
- **Pool Size**: -
- **Active Connections**: -
- **Idle Connections**: -
- **Utilization**: -%
- **Status**: Monitoring

## Monitoring Queries

### Check Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('Device', 'ApiTrace', 'ProjectMember', 'Project')
ORDER BY idx_scan DESC;
```

### Check Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('Device', 'ApiTrace', 'ProjectMember', 'Project')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Slow Queries
```sql
-- Enable slow query logging in Supabase dashboard
-- Or use pg_stat_statements extension
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%Device%' OR query LIKE '%ApiTrace%'
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### Check Connection Pool
```sql
SELECT 
  count(*) as total_connections,
  count(*) FILTER (WHERE state = 'active') as active_connections,
  count(*) FILTER (WHERE state = 'idle') as idle_connections,
  count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
FROM pg_stat_activity
WHERE datname = current_database();
```

## Deployment Checklist

### Before Deploying Indexes
- [ ] Review index recommendations in TECHNICAL_DETAILS.md
- [ ] Test indexes locally
- [ ] Check index size impact
- [ ] Verify query plans with EXPLAIN ANALYZE

### Deploying to Staging
- [ ] Create migration for new indexes
- [ ] Deploy migration to staging
- [ ] Monitor query performance
- [ ] Verify index usage
- [ ] Check connection pool impact
- [ ] Document baseline metrics

### Deploying to Production
- [ ] Review staging metrics
- [ ] Schedule maintenance window (if needed)
- [ ] Deploy migration to production
- [ ] Monitor query performance closely
- [ ] Verify index usage
- [ ] Update metrics in this document

## Change Log

### 2025-01-02
- Created Supabase tracking document
- Set up monitoring structure
- Added index recommendations

## Notes

- Update metrics weekly or after major deployments
- Use Supabase dashboard for real-time monitoring
- Alert on query times > 500ms (p95)
- Alert on connection pool utilization > 80%

