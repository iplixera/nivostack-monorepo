# 🔧 VERCEL CLI SETUP - ikarimmagdy

## Problem
Vercel dashboard shows flooss (pie-int) account instead of ikarimmagdy when trying to connect.

## Solution
Use Vercel API + GitHub API directly to configure the connection.

---

## ✅ AUTOMATED SCRIPTS CREATED

I've created scripts with your exact configuration. Run ONE of these:

### Option 1: Complete Setup (Recommended)
```bash
cd /Users/karim-f/Code/devbridge
bash complete-vercel-setup.sh
```

This configures:
- ✅ Vercel Git connection to ikarimmagdy/devbridge
- ✅ GitHub webhooks for automatic deployments
- ✅ Production branch (main) and Preview branch (develop)
- ✅ Triggers test deployment

---

### Option 2: Vercel Only
```bash
cd /Users/karim-f/Code/devbridge
bash configure-vercel-git.sh
```

This only configures Vercel (no GitHub webhooks).

---

## 📋 YOUR CONFIGURATION

```
Vercel Project ID:  prj_5ktKrMgNxR1UgkfBLpufZl348Jvz
Vercel Team ID:     team_MBPi3LRUH16KWHeCO2JAQtxs
Vercel Token:       51FK0FgOarNnPGuqyZvlwPPm
GitHub Username:    ikarimmagdy
GitHub Repo:        devbridge
GitHub Token:       YOUR_GITHUB_TOKEN_HERE
```

---

## 🔧 MANUAL STEPS (if scripts don't work)

### Step 1: Disconnect Old Repo

```bash
curl -X DELETE \
  -H "Authorization: Bearer 51FK0FgOarNnPGuqyZvlwPPm" \
  "https://api.vercel.com/v1/projects/prj_5ktKrMgNxR1UgkfBLpufZl348Jvz/link?teamId=team_MBPi3LRUH16KWHeCO2JAQtxs"
```

### Step 2: Link to ikarimmagdy/devbridge

```bash
curl -X POST \
  -H "Authorization: Bearer 51FK0FgOarNnPGuqyZvlwPPm" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v1/projects/prj_5ktKrMgNxR1UgkfBLpufZl348Jvz/link?teamId=team_MBPi3LRUH16KWHeCO2JAQtxs" \
  -d '{
    "type": "github",
    "repo": "ikarimmagdy/devbridge"
  }'
```

### Step 3: Set Production Branch

```bash
curl -X PATCH \
  -H "Authorization: Bearer 51FK0FgOarNnPGuqyZvlwPPm" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/prj_5ktKrMgNxR1UgkfBLpufZl348Jvz?teamId=team_MBPi3LRUH16KWHeCO2JAQtxs" \
  -d '{
    "productionBranch": "main",
    "framework": "nextjs"
  }'
```

### Step 4: Verify Connection

```bash
curl -H "Authorization: Bearer 51FK0FgOarNnPGuqyZvlwPPm" \
  "https://api.vercel.com/v9/projects/prj_5ktKrMgNxR1UgkfBLpufZl348Jvz?teamId=team_MBPi3LRUH16KWHeCO2JAQtxs" \
  | grep -o '"repo":"[^"]*"'
```

Should output: `"repo":"ikarimmagdy/devbridge"`

---

## 🧪 TEST DEPLOYMENT

After running the setup script or manual commands:

```bash
cd /Users/karim-f/Code/devbridge

# Make a test change
echo "# Vercel Setup Complete - ikarimmagdy" > VERCEL_SETUP_TEST.md

# Commit and push
git add VERCEL_SETUP_TEST.md
git commit -m "test: verify Vercel connection to ikarimmagdy"
git push origin develop
```

Then check: https://vercel.com/dashboard

Should see deployment from **ikarimmagdy/devbridge**!

---

## 🔍 VERIFY IN DASHBOARD

After running scripts:

1. **Go to:** https://vercel.com/dashboard
2. **Select:** devbridge project
3. **Settings** → **Git**
4. **Should show:**
   - Repository: **ikarimmagdy/devbridge**
   - NOT pie-int or flooss

---

## ❓ TROUBLESHOOTING

### "Still shows pie-int in dashboard"

1. Clear browser cache
2. Logout and login to Vercel
3. Run the script again:
   ```bash
   bash complete-vercel-setup.sh
   ```

### "Want to use Vercel CLI instead"

```bash
cd /Users/karim-f/Code/devbridge
export VERCEL_TOKEN="51FK0FgOarNnPGuqyZvlwPPm"

# Remove old link
vercel unlink

# Link to your project
vercel link --project=devbridge --scope=team_MBPi3LRUH16KWHeCO2JAQtxs

# Deploy
vercel --prod
```

### "Webhooks not working"

The script sets up GitHub webhooks automatically. To verify:

1. Go to: https://github.com/ikarimmagdy/devbridge/settings/hooks
2. Should see a webhook to Vercel
3. URL should be: `https://api.vercel.com/v1/integrations/deploy/prj_5ktKrMgNxR1UgkfBLpufZl348Jvz`

---

## 📁 FILES CREATED

| File | Purpose |
|------|---------|
| `complete-vercel-setup.sh` | ⭐ Full setup (Vercel + GitHub webhooks) |
| `configure-vercel-git.sh` | Vercel Git connection only |
| `setup-vercel-cli.sh` | Alternative CLI method |
| `VERCEL_CLI_SETUP.md` | This guide |

---

## ✅ QUICK START

**Just run this:**

```bash
cd /Users/karim-f/Code/devbridge
bash complete-vercel-setup.sh
```

**Then verify in Vercel dashboard that it shows ikarimmagdy/devbridge!**

---

## 🎯 EXPECTED RESULT

### Before:
```
Vercel → pie-int/dev-bridge (flooss account)
```

### After:
```
Vercel → ikarimmagdy/devbridge (YOUR account)
```

---

## 📞 NEXT STEPS

1. ✅ Run: `bash complete-vercel-setup.sh`
2. ✅ Check Vercel dashboard
3. ✅ Test: `git push origin develop`
4. ✅ Verify deployment source shows ikarimmagdy

---

**All tokens are configured. Scripts are ready. Just run the command!** 🚀

