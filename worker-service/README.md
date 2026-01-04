# Aggregation Worker Service

External worker service for processing aggregation jobs in production.

## Overview

This service runs continuously and processes aggregation jobs from a Redis queue. It's designed to be deployed separately from the main dashboard application to handle the computational load of data aggregation.

## Architecture

- **Queue**: BullMQ with Redis (Upstash in production)
- **Database**: PostgreSQL (same as main application)
- **Deployment**: Docker container on Railway/Render/Fly.io
- **Scaling**: Multiple instances can run concurrently

## Environment Variables

```bash
# Redis (Upstash)
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password
REDIS_TLS=true

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Worker Configuration
WORKER_CONCURRENCY=20  # Number of concurrent jobs
```

## Deployment Options

### Railway (Recommended)

1. Create a new project on Railway
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Set environment variables
6. Deploy

### Docker

```bash
# Build the image
docker build -t aggregation-worker .

# Run locally
docker run -e REDIS_HOST=... -e DATABASE_URL=... aggregation-worker
```

## Monitoring

The worker logs all job processing activity. Monitor for:
- Job completion rates
- Error rates
- Processing times
- Queue backlog

## Health Checks

- The service responds to `GET /health` (if you add a simple HTTP server)
- Redis connection health
- Database connectivity

## Scaling

- Increase `WORKER_CONCURRENCY` for more parallel processing
- Deploy multiple instances
- Monitor Redis queue length to determine scaling needs

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev

# Run in production
npm start
```
