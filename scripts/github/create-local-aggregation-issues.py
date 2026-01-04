#!/usr/bin/env python3
"""
Create GitHub Issues for Local Aggregation Implementation Steps

This script creates issues for each step of local aggregation implementation.
"""

import os
import json
import urllib.request
import urllib.parse
from pathlib import Path

def get_github_token():
    """Get GitHub token from environment or config file."""
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        return token
    
    tokens_file = Path.home() / ".devbridge_tokens"
    if tokens_file.exists():
        try:
            with open(tokens_file, 'r') as f:
                for line in f:
                    if line.startswith("GITHUB_TOKEN="):
                        token = line.split("=", 1)[1].strip().strip('"\'')
                        if token and token != "ghp_your_token_here":
                            return token
        except Exception:
            pass
    
    return None

def make_api_request(method, url, token, data=None):
    """Make a GitHub API request."""
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "NivoStack-Issue-Creator"
    }
    
    req_data = None
    if data:
        req_data = json.dumps(data).encode('utf-8')
        headers["Content-Type"] = "application/json"
    
    request = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(request) as response:
            status_code = response.getcode()
            if status_code == 401:
                raise Exception("❌ Authentication failed. Check your GitHub token.")
            if status_code >= 400:
                error_body = response.read().decode('utf-8')
                raise Exception(f"❌ API request failed: {status_code} - {error_body}")
            
            response_body = response.read().decode('utf-8')
            return json.loads(response_body) if response_body else None
    except urllib.error.HTTPError as e:
        if e.code == 401:
            raise Exception("❌ Authentication failed. Check your GitHub token.")
        error_body = e.read().decode('utf-8')
        raise Exception(f"❌ API request failed: {e.code} - {error_body}")

def create_issue(token, title, body, labels):
    """Create a GitHub issue."""
    repo = "iplixera/nivostack-monorepo"
    url = f"https://api.github.com/repos/{repo}/issues"
    
    issue_data = {
        "title": title,
        "body": body,
        "labels": labels
    }
    
    try:
        result = make_api_request("POST", url, token, issue_data)
        return result
    except Exception as e:
        print(f"❌ Error creating issue: {e}")
        return None

def main():
    token = get_github_token()
    if not token:
        print("❌ No GitHub token found. Set GITHUB_TOKEN environment variable or add to ~/.devbridge_tokens")
        return
    
    # Local aggregation implementation steps
    steps = [
        {
            "step": 1,
            "title": "[DATA] Local: Step 1 - Setup Redis in Docker",
            "body": """## Objective
Setup Redis as a Docker container for local job queue management.

## Tasks
- [ ] Create `docker-compose.yml` for Redis
- [ ] Start Redis container
- [ ] Verify Redis connection
- [ ] Test Redis with `redis-cli ping`

## Commands
\`\`\`bash
docker run -d --name redis-aggregation -p 6379:6379 redis:alpine
# OR
docker-compose up -d redis
\`\`\`

## Verification
- Redis container running on port 6379
- Can connect via `redis-cli`
- `docker exec -it redis-aggregation redis-cli ping` returns PONG

## Related Documentation
- `/docs/performance/AGGREGATE_TABLES_DESIGN.md` - Step 1: Setup Redis in Docker
- `/docs/performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md` - Step 1""",
            "labels": ["data", "aggregation", "local", "p1", "seq-agg-local-01", "redis", "docker"]
        },
        {
            "step": 2,
            "title": "[DATA] Local: Step 2 - Install Dependencies (BullMQ, ioredis, node-cron)",
            "body": """## Objective
Install required packages for queue management and scheduling.

## Tasks
- [ ] Install `bullmq` (queue management)
- [ ] Install `ioredis` (Redis client)
- [ ] Install `node-cron` (scheduler)
- [ ] Install TypeScript types

## Commands
\`\`\`bash
pnpm add bullmq ioredis node-cron
pnpm add -D @types/node-cron
\`\`\`

## Files to Update
- `dashboard/package.json`

## Related Documentation
- `/docs/performance/AGGREGATE_TABLES_DESIGN.md` - Step 2: Install Dependencies
- `/docs/performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md` - Step 2""",
            "labels": ["data", "aggregation", "local", "p1", "seq-agg-local-02", "dependencies"]
        },
        {
            "step": 3,
            "title": "[DATA] Local: Step 3 - Create Queue Configuration",
            "body": """## Objective
Set up BullMQ queue with Redis connection.

## Tasks
- [ ] Create `lib/aggregation/queue.ts`
- [ ] Configure Redis connection
- [ ] Create aggregation queue instance
- [ ] Add connection error handling
- [ ] Support environment variables

## Files to Create
- `dashboard/src/lib/aggregation/queue.ts`

## Key Components
- Redis connection configuration
- Queue instance creation
- Environment variable support (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD)
- Default job options (retries, backoff)

## Related Documentation
- `/docs/performance/AGGREGATE_TABLES_DESIGN.md` - Step 3: Create Queue and Worker
- `/docs/performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md` - Step 3""",
            "labels": ["data", "aggregation", "local", "p1", "seq-agg-local-03", "queue", "bullmq"]
        },
        {
            "step": 4,
            "title": "[DATA] Local: Step 4 - Create Enqueue Function",
            "body": """## Objective
Create function to enqueue aggregation jobs for projects.

## Tasks
- [ ] Create `lib/aggregation/enqueue.ts`
- [ ] Implement `enqueueHourlyAggregation()` function
- [ ] Get all projects from database
- [ ] Create jobs for each project
- [ ] Add to queue with proper job data
- [ ] Implement `enqueueDailyAggregation()` function

## Files to Create
- `dashboard/src/lib/aggregation/enqueue.ts`

## Job Data Structure
\`\`\`typescript
{
  projectId: string,
  startTime: Date,
  endTime: Date,
  granularity: 'hourly' | 'daily'
}
\`\`\`

## Related Documentation
- `/docs/performance/AGGREGATE_TABLES_DESIGN.md` - Step 4: Create Enqueue Function
- `/docs/performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md` - Step 4""",
            "labels": ["data", "aggregation", "local", "p1", "seq-agg-local-04", "enqueue"]
        },
        {
            "step": 5,
            "title": "[DATA] Local: Step 5 - Create Worker Process",
            "body": """## Objective
Create worker that processes aggregation jobs from queue.

## Tasks
- [ ] Create `scripts/workers/aggregation-worker.ts`
- [ ] Connect to Redis
- [ ] Create worker instance
- [ ] Connect to database
- [ ] Implement job processing logic
- [ ] Implement aggregation logic
- [ ] Save aggregates to database
- [ ] Add error handling and retries
- [ ] Add progress logging

## Files to Create
- `scripts/workers/aggregation-worker.ts`

## Key Features
- Batch processing (10K rows per batch)
- Incremental aggregation (only new data)
- Error handling and retries
- Progress logging
- Parallel processing (concurrency: 5)

## Related Documentation
- `/docs/performance/AGGREGATE_TABLES_DESIGN.md` - Step 3: Create Queue and Worker
- `/docs/performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md` - Step 5""",
            "labels": ["data", "aggregation", "local", "p1", "seq-agg-local-05", "worker"]
        },
        {
            "step": 6,
            "title": "[DATA] Local: Step 6 - Setup Node-Cron Scheduler",
            "body": """## Objective
Create cron scheduler to trigger aggregation jobs.

## Tasks
- [ ] Create `scripts/cron/scheduler.ts`
- [ ] Setup hourly cron job (every hour at :00)
- [ ] Setup daily cron job (every day at 00:00)
- [ ] Call enqueue function on schedule
- [ ] Add error handling and logging

## Files to Create
- `scripts/cron/scheduler.ts`

## Schedule
- Hourly: \`0 * * * *\` (every hour at minute 0)
- Daily: \`0 0 * * *\` (every day at midnight)

## Related Documentation
- `/docs/performance/AGGREGATE_TABLES_DESIGN.md` - Step 5: Setup Node-Cron
- `/docs/performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md` - Step 6""",
            "labels": ["data", "aggregation", "local", "p1", "seq-agg-local-06", "cron", "scheduler"]
        },
        {
            "step": 7,
            "title": "[DATA] Local: Step 7 - Create Aggregate Table Schemas",
            "body": """## Objective
Define Prisma models for aggregate tables.

## Tasks
- [ ] Review UI requirements for metrics
- [ ] Design aggregate table schemas
- [ ] Create Prisma models:
  - `ApiTraceAggregate`
  - `LogAggregate`
  - `CrashAggregate`
  - `SessionAggregate`
- [ ] Create migration files
- [ ] Run migrations

## Files to Update
- `prisma/schema.prisma`

## Key Fields
- `projectId`, `period`, `granularity`
- Dimension fields (method, platform, screenName, etc.)
- Metric fields (count, avg, max, p50, p95, sum, etc.)

## Related Documentation
- `/docs/performance/AGGREGATE_TABLES_DESIGN.md` - Aggregate Table Schemas
- `/docs/performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md` - Step 7""",
            "labels": ["data", "aggregation", "local", "p0", "seq-agg-local-07", "database", "schema", "prisma"]
        },
        {
            "step": 8,
            "title": "[DATA] Local: Step 8 - Implement Aggregation Logic",
            "body": """## Objective
Create functions to aggregate raw data into aggregate tables.

## Tasks
- [ ] Create `lib/aggregation/aggregate.ts`
- [ ] Implement `aggregateApiTraces()` function
- [ ] Implement `aggregateLogs()` function
- [ ] Implement `aggregateCrashes()` function
- [ ] Implement `aggregateSessions()` function
- [ ] Handle percentiles (p50, p95)
- [ ] Handle batch processing
- [ ] Handle incremental updates
- [ ] Handle upsert logic

## Files to Create
- `dashboard/src/lib/aggregation/aggregate.ts`

## Aggregation Functions
- Group by dimensions (projectId, period, method, platform, etc.)
- Calculate metrics (count, avg, max, p50, p95, sum)
- Upsert aggregates (update if exists, insert if new)

## Related Documentation
- `/docs/performance/AGGREGATE_TABLES_DESIGN.md` - Aggregation Logic
- `/docs/performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md` - Step 8""",
            "labels": ["data", "aggregation", "local", "p1", "seq-agg-local-08", "aggregation-logic"]
        },
        {
            "step": 9,
            "title": "[DATA] Local: Step 9 - Add Package.json Scripts",
            "body": """## Objective
Add convenient scripts for running workers and cron.

## Tasks
- [ ] Add `worker:aggregation` script
- [ ] Add `cron:scheduler` script
- [ ] Add `test:enqueue` script
- [ ] Add `check:queue` script

## Files to Update
- `dashboard/package.json`

## Scripts
\`\`\`json
{
  "scripts": {
    "worker:aggregation": "tsx scripts/workers/aggregation-worker.ts",
    "cron:scheduler": "tsx scripts/cron/scheduler.ts",
    "test:enqueue": "tsx scripts/test-enqueue.ts",
    "check:queue": "tsx scripts/check-queue.ts"
  }
}
\`\`\`

## Related Documentation
- `/docs/performance/AGGREGATE_TABLES_DESIGN.md` - Step 6: Running Locally
- `/docs/performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md` - Step 9""",
            "labels": ["data", "aggregation", "local", "p2", "seq-agg-local-09", "scripts"]
        },
        {
            "step": 10,
            "title": "[DATA] Local: Step 10 - Testing & Verification",
            "body": """## Objective
Test the complete aggregation pipeline.

## Tasks
- [ ] Test Redis connection
- [ ] Test enqueue function
- [ ] Test worker processing
- [ ] Test cron scheduler
- [ ] Verify aggregates in database
- [ ] Test incremental updates
- [ ] Test error handling
- [ ] Performance testing
- [ ] Create test scripts

## Test Commands
\`\`\`bash
# Test enqueue manually
pnpm test:enqueue

# Check queue status
pnpm check:queue

# Start worker
pnpm worker:aggregation

# Start cron
pnpm cron:scheduler
\`\`\`

## Related Documentation
- `/docs/performance/AGGREGATE_TABLES_DESIGN.md` - Testing Locally
- `/docs/performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md` - Step 10""",
            "labels": ["data", "aggregation", "local", "p1", "seq-agg-local-10", "testing"]
        }
    ]
    
    print("📋 Creating GitHub issues for local aggregation implementation...\n")
    
    created_issues = []
    for step in steps:
        print(f"🔄 Creating issue for Step {step['step']}: {step['title']}")
        issue = create_issue(token, step['title'], step['body'], step['labels'])
        
        if issue:
            created_issues.append(issue)
            print(f"   ✅ Created issue #{issue['number']}: {issue['html_url']}\n")
        else:
            print(f"   ❌ Failed to create issue\n")
    
    print(f"\n✅ Created {len(created_issues)} issues")
    print("\n📊 Summary:")
    for issue in created_issues:
        print(f"   #{issue['number']}: {issue['title']}")

if __name__ == "__main__":
    main()

