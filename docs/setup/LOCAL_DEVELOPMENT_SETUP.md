# Local Development Setup Guide

## Architecture Overview

### Production Setup
```
nivostack.com          → Marketing/Branding Website
studio.nivostack.com   → Dashboard/Console Application
```

### Local Development Setup
```
localhost:3001  → Marketing/Branding Website (website/)
localhost:3000  → Dashboard/Console Application (dashboard/)
```

## Your Understanding ✅

**You are 100% correct!**

- `localhost:3001` = `nivostack.com` (branding website)
- `localhost:3000` = `studio.nivostack.com` (dashboard/studio)
- When users click "Get Started" on the website, they navigate to the studio

## Running Both Services Locally

### Terminal 1: Run the Website
```bash
cd website
pnpm install
pnpm dev
# Website runs on http://localhost:3001
```

### Terminal 2: Run the Studio/Dashboard
```bash
cd dashboard
pnpm install
pnpm dev
# Studio runs on http://localhost:3000
```

## Environment Configuration

### Website (`website/.env.local`)
Already configured! The file contains:
```bash
NEXT_PUBLIC_STUDIO_URL=http://localhost:3000
NEXT_PUBLIC_MARKETING_URL=http://localhost:3001
```

This means:
- All "Get Started" buttons will point to `http://localhost:3000/register`
- The dashboard preview will show `localhost:3000` instead of `studio.nivostack.com`

### How It Works

1. **Website** (`website/src/lib/branding.ts`):
   ```typescript
   studio: process.env.NEXT_PUBLIC_STUDIO_URL || 'https://studio.nivostack.com'
   ```
   - In **local dev**: Uses `http://localhost:3000` from `.env.local`
   - In **production**: Uses `https://studio.nivostack.com` (default)

2. **Navigation Flow**:
   - User visits `localhost:3001` (website)
   - Clicks "Start Free Forever" button
   - Navigates to `localhost:3000/register` (studio)
   - Same behavior as production, just with localhost URLs

## Testing the Flow

1. Start both services (in separate terminals)
2. Open `http://localhost:3001` in your browser
3. Click any "Get Started" or "Start Free Forever" button
4. You should be redirected to `http://localhost:3000/register`

## Production vs Local

| Environment | Website URL | Studio URL | Config File |
|------------|-------------|------------|-------------|
| **Production** | `nivostack.com` | `studio.nivostack.com` | Uses defaults in `branding.ts` |
| **Local Dev** | `localhost:3001` | `localhost:3000` | Uses `.env.local` overrides |

## Notes

- The `.env.local` file is gitignored (won't be committed)
- Each developer can have their own `.env.local` with custom ports if needed
- Production deployments use Vercel environment variables instead of `.env.local`

