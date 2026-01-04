# Production Deployment Guide

Complete guide for deploying the aggregation system to production.

## ✅ Completed (Phase 2)

All production deployment components are ready:

### 1. ✅ Upstash Redis Configuration
- Updated queue and worker to support Upstash Redis
- TLS encryption enabled by default
- Environment variable configuration ready

### 2. ✅ Vercel Cron Jobs
- Created `/api/cron/hourly-aggregation` endpoint
- Created `/api/cron/daily-aggregation` endpoint
- Configured `vercel.json` with cron schedules:
  - Hourly: `"0 * * * *"` (every hour)
  - Daily: `"0 0 * * *"` (midnight daily)

### 3. ✅ External Worker Service
- Created complete worker service in `worker-service/` directory
- Docker containerization ready
- TypeScript/Node.js setup
- Production-ready configuration

## 🚀 Deployment Steps

### Step 1: Setup Upstash Redis

1. **Create Upstash Account**
   - Go to [upstash.com](https://upstash.com)
   - Sign up and create a Redis database
   - Choose your preferred region (close to your users)

2. **Get Connection Details**
   - Copy the Redis URL (format: `redis://:...@host:port`)
   - Extract host, port, and password

3. **Environment Variables**
   ```bash
   REDIS_HOST=your-host.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password
   REDIS_TLS=true
   ```

### Step 2: Deploy Worker Service

Choose one of these platforms:

#### Option A: Railway (Recommended)

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Connect your GitHub repository
   - Select the `worker-service` directory

2. **Set Environment Variables**
   ```
   REDIS_HOST=your-upstash-host
   REDIS_PORT=6379
   REDIS_PASSWORD=your-upstash-password
   REDIS_TLS=true
   DATABASE_URL=your-production-db-url
   WORKER_CONCURRENCY=20
   ```

3. **Deploy**
   - Railway will auto-deploy on git push
   - Monitor logs in Railway dashboard

#### Option B: Render

1. **Create Render Service**
   - Go to [render.com](https://render.com)
   - Create "Web Service"
   - Connect GitHub repository
   - Set root directory: `worker-service`

2. **Configure Build & Start**
   ```
   Build Command: npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables** (same as Railway)

#### Option C: Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Initialize App**
   ```bash
   cd worker-service
   fly launch
   ```

3. **Set Secrets**
   ```bash
   fly secrets set REDIS_HOST=your-host
   fly secrets set REDIS_PASSWORD=your-password
   # ... other env vars
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

### Step 3: Deploy Dashboard to Vercel

1. **Push Code to GitHub**
   - Ensure all Phase 1 & 2 code is committed and pushed

2. **Deploy to Vercel**
   - Vercel will automatically detect the cron jobs from `vercel.json`
   - Cron jobs will start running on schedule

3. **Set Environment Variables in Vercel**
   ```
   REDIS_HOST=your-upstash-host
   REDIS_PORT=6379
   REDIS_PASSWORD=your-upstash-password
   REDIS_TLS=true
   # ... other existing env vars
   ```

### Step 4: Verify Deployment

1. **Check Cron Jobs**
   ```bash
   # Check Vercel function logs
   # Cron jobs should trigger hourly/daily
   ```

2. **Monitor Queue**
   ```bash
   # Check worker service logs
   # Should show job processing
   ```

3. **Test Aggregation**
   ```bash
   # Visit dashboard - should show aggregated stats
   # Check aggregate API endpoints
   ```

## 📊 Environment Variables Summary

### Dashboard (Vercel)
```bash
# Redis (Upstash)
REDIS_HOST=xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=xxx
REDIS_TLS=true

# Database (existing)
DATABASE_URL=xxx
POSTGRES_PRISMA_URL=xxx

# Other existing variables...
```

### Worker Service
```bash
# Redis (Upstash)
REDIS_HOST=xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=xxx
REDIS_TLS=true

# Database
DATABASE_URL=xxx

# Worker
WORKER_CONCURRENCY=20
```

## 🔍 Monitoring & Troubleshooting

### Queue Monitoring
- Check worker service logs for job processing
- Monitor Redis queue length via Upstash dashboard
- Set up alerts for failed jobs

### Cron Job Monitoring
- Check Vercel function logs
- Cron jobs run automatically - monitor success/failure

### Performance Tuning
- Adjust `WORKER_CONCURRENCY` based on load
- Scale worker instances if needed
- Monitor database performance

## 🚨 Common Issues

### Worker Not Connecting to Redis
- Verify Upstash credentials
- Check `REDIS_TLS=true` setting
- Ensure Upstash region allows connections

### Cron Jobs Not Running
- Check Vercel deployment status
- Verify `vercel.json` configuration
- Check Vercel function timeouts (default 10s may be too short)

### Database Connection Issues
- Ensure worker service has database access
- Check connection string format
- Verify SSL requirements

## 📈 Scaling Considerations

### Vertical Scaling
- Increase `WORKER_CONCURRENCY` (start with 20, max ~50)
- Upgrade worker instance size (CPU/memory)

### Horizontal Scaling
- Deploy multiple worker instances
- Use load balancer if needed
- Monitor queue depth for scaling decisions

### Database Scaling
- Monitor aggregation query performance
- Consider read replicas for aggregation queries
- Optimize aggregate table indexes

## 🎯 Next Steps

After successful deployment:

1. **Phase 3**: Dashboard UI Updates (add mode toggles, aggregate views)
2. **Phase 4**: Performance Optimization (tune concurrency, caching)
3. **Phase 5**: Monitoring & Alerts (health checks, admin dashboard)
4. **Phase 6**: Documentation & Testing

## 📚 Related Documentation

- [Local Implementation Guide](../performance/LOCAL_AGGREGATION_IMPLEMENTATION_STEPS.md)
- [Production Scenario Analysis](../performance/PRODUCTION_SCENARIO_1000_PROJECTS.md)
- [API Integration Guide](../performance/NEXT_STEPS_AGGREGATION.md)
