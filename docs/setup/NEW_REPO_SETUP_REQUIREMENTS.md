# 🚀 New Repository Setup Checklist

## What I Need From You

### 1️⃣ GitHub Personal Access Token (PAT)

**Create here**: https://github.com/settings/tokens/new

**Token Settings**:
- **Note**: `DevBridge New Repo Setup`
- **Expiration**: `No expiration` (or 90 days minimum)

**Required Permissions** (check these boxes):

```
✅ repo (Full control of repositories)
   ✅ repo:status
   ✅ repo_deployment
   ✅ public_repo
   ✅ repo:invite
   ✅ security_events

✅ workflow (Update GitHub Action workflows)

✅ admin:repo_hook (Full control of repository hooks)
   ✅ write:repo_hook
   ✅ read:repo_hook

✅ delete_repo (Delete repositories - optional but useful)

✅ If using GitHub Organization:
   ✅ admin:org → read:org
   ✅ admin:org → write:org
```

**After creation**: Copy the token (starts with `ghp_`)

---

### 2️⃣ Repository Details

**Please provide**:

1. **Repository Name**: 
   - Current suggestion: `devbridge` or `dev-bridge`
   - Your choice: `_________________`

2. **GitHub Account/Organization**:
   - Personal account: `your-username`
   - Organization: `your-org-name`
   - Your choice: `_________________`

3. **Repository Visibility**:
   - [ ] Private (recommended for proprietary code)
   - [ ] Public (if open source)

4. **Repository Description**:
   - Suggestion: "Mobile app monitoring and configuration platform with Flutter SDK"
   - Your choice: `_________________`

---

### 3️⃣ Vercel Configuration

**I need from Vercel Dashboard**:

1. **Vercel Token**: ✅ Already have in `vercel.properties`
   ```bash
   # Verify it's there:
   cat vercel.properties | grep VERCEL_TOKEN
   ```

2. **Vercel Organization/Team ID**:
   - Get from: https://vercel.com/account
   - Or run: `vercel teams list`
   - Format: `team_xxxxxxxxxxxxxxxxxxxx`
   - Your Team ID: `_________________`

3. **Vercel Project ID**:
   - Get from: https://vercel.com/flooss-bridge-hub/devbridge/settings
   - Or the project settings page
   - Format: `prj_xxxxxxxxxxxxxxxxxxxx`
   - Your Project ID: `_________________`

4. **Current Git Integration** (to disconnect):
   - Current repo: `https://github.com/pie-int/dev-bridge`
   - Confirm we should disconnect this: [ ] Yes

---

### 4️⃣ Branch Strategy Confirmation

**I will set up**:

```
main branch       → Production environment
  ↓
develop branch    → Staging/Preview environment
  ↓
feature/* branches → Preview deployments
```

**Vercel Deployment Configuration**:
- `main` → Auto-deploy to Production
- `develop` → Auto-deploy to Preview (labeled as "Staging")
- `feature/*` → Create preview deployment on PR

**Confirm this is what you want**: [ ] Yes

---

### 5️⃣ Environment Variables

**I will migrate these from current setup**:

```env
# From your current Vercel project
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
JWT_SECRET
(any other environment variables you have)
```

**Confirm**: [ ] Yes, migrate all environment variables

**Or specify which ones**: `_________________`

---

## What I Will Do Automatically

### Step 1: Create New Repository
✅ Create new GitHub repository with your settings
✅ Initialize with README
✅ Set default branch to `develop`
✅ Add .gitignore for Node.js/Next.js

### Step 2: Push Code
✅ Add new remote to local project
✅ Push all current code to new repo
✅ Create `main` and `develop` branches
✅ Push both branches to new repo
✅ Create baseline tag `v1.5.1-baseline`

### Step 3: Configure Branch Protection
✅ Protect `main` branch:
  - Require pull request reviews (1 approval)
  - Require status checks to pass
  - No force pushes
  - No deletions
  
✅ Protect `develop` branch:
  - Require pull request reviews (1 approval)
  - No force pushes

### Step 4: Connect to Vercel
✅ Disconnect old repository from Vercel project
✅ Connect new repository to Vercel project
✅ Configure deployment branches:
  - Production: `main`
  - Preview: `develop` + all branches

### Step 5: Migrate Environment Variables
✅ Copy all environment variables to new deployment
✅ Verify production environment works
✅ Verify staging environment works

### Step 6: Create GitHub Actions Workflows
✅ CI/CD pipeline for automated testing
✅ Auto-deployment triggers
✅ Build verification

---

## Quick Fill Form

**Copy and fill this, then provide it to me**:

```yaml
GitHub Token: ghp_your_token_here
Repository Name: devbridge
GitHub Account/Org: your-username-or-org
Repository Visibility: Private
Repository Description: Mobile app monitoring and configuration platform

Vercel Team ID: team_xxxxxxxxxxxx
Vercel Project ID: prj_xxxxxxxxxxxx

Disconnect old repo: Yes
Environment Strategy: main=Production, develop=Staging
Migrate all env vars: Yes
```

---

## Alternative: Guided Setup

If you prefer, I can guide you step-by-step:

1. You create the GitHub token with required permissions
2. You provide the token + repo details
3. I create the repository via API
4. I push all code
5. I configure Vercel connection
6. I set up branch protection
7. I verify everything works

---

## Security Notes

🔒 **Important**:
- I will store the GitHub token temporarily to execute setup
- After setup is complete, you should rotate the token
- All tokens will be stored securely in GitHub Secrets
- Environment variables will be migrated securely

---

## Estimated Time

- Repository creation: 1 minute
- Code push: 2-3 minutes
- Vercel configuration: 2-3 minutes
- Branch protection: 1 minute
- Verification: 2 minutes

**Total**: ~10 minutes for complete setup

---

## What You Get After Setup

✅ New GitHub repository with all your code
✅ Clean git history (or preserved if you want)
✅ Branch protection enabled
✅ Connected to Vercel with auto-deployments
✅ Separate environments (production/staging)
✅ CI/CD ready
✅ All environment variables migrated
✅ Ready for team collaboration

---

## Next Step

**Provide me with**:
1. GitHub Personal Access Token
2. Repository name and organization
3. Vercel Team ID and Project ID

**I can find the Vercel IDs for you if you give me the Vercel token** (which you already have in `vercel.properties`)

---

Ready when you are! 🚀

