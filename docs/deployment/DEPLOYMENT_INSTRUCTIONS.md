# 🚀 DevBridge Deployment Instructions

## ✅ Setup Complete

All CLI tools and deployment infrastructure are now installed and configured:

- ✅ **pnpm** v10.26.1 - Package manager
- ✅ **Node.js** v24.12.0 - JavaScript runtime
- ✅ **Vercel CLI** v50.1.3 - Deployment tool
- ✅ **Deployment Script** - `deploy.sh` ready to use
- ✅ **Git Security** - `vercel.properties` excluded from version control

---

## 🔐 Step 1: Get Your Vercel Token

1. **Go to:** https://vercel.com/account/tokens

2. **Click:** "Create Token"

3. **Configure:**
   - **Name:** CLI Deployment
   - **Scope:** Full Account (or select specific team/project)
   - **Expiration:** Never (or set as needed)

4. **Copy the token** - You'll need it in the next step

---

## 📝 Step 2: Add Token to Properties File

1. **Open the properties file:**
   ```bash
   code vercel.properties
   # or
   nano vercel.properties
   # or
   open -e vercel.properties
   ```

2. **Replace the placeholder:**
   ```properties
   # Before:
   VERCEL_TOKEN=your_vercel_token_here
   
   # After (example - use YOUR actual token):
   VERCEL_TOKEN=HYG_1a2b3c4d5e6f7g8h9i0j...
   ```

3. **Save the file**

4. **Verify it's ignored by git:**
   ```bash
   git status
   # vercel.properties should NOT appear in the list
   ```

---

## 🚀 Step 3: Deploy to Production

### Option A: Use the Deployment Script (Recommended)

```bash
cd /Users/karim-f/Code/devbridge
./deploy.sh
```

The script will:
- ✅ Load your token from `vercel.properties`
- ✅ Validate the token is set
- ✅ Deploy to Vercel production
- ✅ Show deployment status

### Option B: Manual Deployment

```bash
cd /Users/karim-f/Code/devbridge

# Load token
export $(grep -v '^#' vercel.properties | xargs)

# Deploy
export PNPM_HOME="/Users/karim-f/Library/pnpm"
export PATH="$PNPM_HOME:$PATH"
vercel deploy --prod --yes --token="$VERCEL_TOKEN"
```

---

## ⏱️ Deployment Timeline

- **Upload:** ~10-20 seconds
- **Build:** ~1-2 minutes
- **Deploy:** ~20-30 seconds
- **Total:** ~2-3 minutes

---

## ✅ Verify Deployment

### 1. Check Vercel Dashboard

Go to: https://vercel.com/mobile-teams-projects/devbridge

Look for:
- ✅ New deployment with commit `eb2bf4b` or `0d386bc`
- ✅ Status: "Ready"
- ✅ Production URL: https://devbridge-eta.vercel.app

### 2. Test the Fix

```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://devbridge-eta.vercel.app/api/sdk-init?deviceId=TEST_DEVICE"
```

Check the response:
```json
{
  "deviceConfig": {
    "trackingEnabled": false  // ✅ Should respect your settings
  }
}
```

### 3. Test in Mobile App

1. **Force close** your mobile app
2. **Clear app data** (optional but recommended)
3. **Restart** the app
4. SDK will fetch the new config with correct `trackingEnabled` value

---

## 🔒 Security Notes

### ✅ What's Protected

- ✅ `vercel.properties` - In `.gitignore`, never committed
- ✅ Token is loaded from file, not hardcoded
- ✅ Token not visible in git history
- ✅ Token not pushed to GitHub

### ⚠️ Important

- **Never commit** `vercel.properties` to git
- **Never share** your Vercel token publicly
- **Rotate tokens** periodically for security
- **Use limited scope** tokens when possible

---

## 🐛 Troubleshooting

### Error: "Please set your Vercel token"

**Cause:** Token not set in `vercel.properties`

**Fix:**
```bash
# Edit the file
nano vercel.properties

# Make sure it contains:
VERCEL_TOKEN=your_actual_token_here

# NOT:
VERCEL_TOKEN=your_vercel_token_here
```

### Error: "Vercel CLI not found"

**Cause:** PATH not set correctly

**Fix:**
```bash
export PNPM_HOME="/Users/karim-f/Library/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Verify
vercel --version
```

### Error: "Invalid token"

**Cause:** Token expired or incorrect

**Fix:**
1. Go to https://vercel.com/account/tokens
2. Delete old token
3. Create new token
4. Update `vercel.properties`
5. Try again

### Deployment Stuck or Failed

**Check:**
1. Vercel Dashboard → Deployments → Click the failed deployment
2. View build logs for error messages
3. Common issues:
   - Build errors (check `npm run build` locally)
   - Environment variables missing
   - Database connection issues

---

## 📂 File Structure

```
/Users/karim-f/Code/devbridge/
├── deploy.sh                 ← Deployment script
├── vercel.properties         ← Your token (NOT in git)
├── .gitignore               ← Protects vercel.properties
├── src/app/api/sdk-init/    ← Fixed endpoint
└── DEPLOYMENT_INSTRUCTIONS.md ← This file
```

---

## 🎯 Quick Reference

### Deploy Command
```bash
./deploy.sh
```

### Check Deployment Status
```bash
export PNPM_HOME="/Users/karim-f/Library/pnpm"
export PATH="$PNPM_HOME:$PATH"
vercel ls
```

### View Production URL
```bash
vercel ls --prod
```

### Roll Back (if needed)
```bash
# Via Vercel Dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"
```

---

## 📝 What Was Fixed

**Bug:** `trackingEnabled` was always `true` regardless of settings

**Fix:** `/api/sdk-init` now correctly computes `trackingEnabled` based on:
- `sdkEnabled` flag (master kill switch)
- `trackingMode` setting (`all`, `debug_only`, `none`)
- Device `debugModeEnabled` status

**Commits:**
- `34e4124` - The bug fix
- `eb2bf4b` - Deployment trigger
- `0d386bc` - Deployment infrastructure

---

## 🆘 Need Help?

1. **Check Vercel Docs:** https://vercel.com/docs
2. **Check deployment logs** in Vercel Dashboard
3. **Review this file** for common solutions
4. **Check GitHub commit:** https://github.com/pie-int/dev-bridge/commit/34e4124

---

**Ready to deploy? Run `./deploy.sh` after adding your token to `vercel.properties`!** 🚀

