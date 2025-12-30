# Switching Vercel User to iplixera@gmail.com

## Issue

Vercel is detecting deployments from `karim.magdy@flooss.com` which doesn't have access to the NivoStack team. We need to switch to `iplixera@gmail.com`.

## Root Causes

1. **Vercel Token**: Current token in `vercel.properties` is from `ikarimconsole` account (karim.magdy@flooss.com)
2. **Git Author**: Git commits are using `karim.magdy@flooss.com` as author email
3. **Team Access**: `karim.magdy@flooss.com` is not a member of the NivoStack team

## Solutions

### Option 1: Get New Vercel Token from iplixera@gmail.com (Recommended)

1. **Login to Vercel with iplixera@gmail.com:**
   ```bash
   vercel logout
   vercel login
   # Login with iplixera@gmail.com
   ```

2. **Create/Get API Token:**
   - Go to: https://vercel.com/account/tokens
   - Create a new token (or copy existing)
   - Copy the token

3. **Update vercel.properties:**
   ```bash
   # Update the token in vercel.properties
   VERCEL_TOKEN=your_new_token_here
   ```

4. **Verify:**
   ```bash
   export VERCEL_TOKEN=$(grep VERCEL_TOKEN vercel.properties | cut -d'=' -f2)
   vercel whoami --token="$VERCEL_TOKEN"
   # Should show: iplixera (or similar)
   ```

### Option 2: Add iplixera@gmail.com to NivoStack Team

1. **Go to Team Settings:**
   - https://vercel.com/nivostack/settings/members

2. **Invite Member:**
   - Click "Invite Member"
   - Enter: `iplixera@gmail.com`
   - Select role (Member or Admin)
   - Send invitation

3. **Accept Invitation:**
   - Check email for `iplixera@gmail.com`
   - Accept the invitation

4. **Switch Vercel Account:**
   ```bash
   vercel logout
   vercel login
   # Login with iplixera@gmail.com
   ```

### Option 3: Update Git Author (Already Done)

Git user has been updated to use `iplixera@gmail.com`:
```bash
git config user.email "iplixera@gmail.com"
git config user.name "iplixera"
```

## Verification Steps

After switching:

1. **Check Vercel User:**
   ```bash
   vercel whoami
   # Should show: iplixera or iplixera@gmail.com
   ```

2. **Check Team Access:**
   ```bash
   vercel teams ls
   # Should show: nivostack team
   ```

3. **Check Git Author:**
   ```bash
   git config user.email
   # Should show: iplixera@gmail.com
   ```

4. **Test Deployment:**
   ```bash
   # Make a small change and commit
   git commit --allow-empty -m "test: verify deployment user"
   git push origin develop
   # Check Vercel Dashboard - should deploy as iplixera@gmail.com
   ```

## Important Notes

- **Vercel Token**: The token in `vercel.properties` determines which account is used for API calls
- **Git Author**: Vercel uses Git commit author email to identify the deployer
- **Team Membership**: The user must be a member of the NivoStack team to deploy
- **Future Commits**: All new commits will use `iplixera@gmail.com` as author

## Troubleshooting

If deployments still fail:

1. **Check Vercel Dashboard:**
   - Go to project → Settings → Members
   - Verify `iplixera@gmail.com` is listed

2. **Check Git Author:**
   ```bash
   git log --format='%ae' -n 1
   # Should show: iplixera@gmail.com
   ```

3. **Check Vercel Token:**
   ```bash
   export VERCEL_TOKEN=$(grep VERCEL_TOKEN vercel.properties | cut -d'=' -f2)
   vercel whoami --token="$VERCEL_TOKEN"
   ```

4. **Re-authenticate:**
   ```bash
   vercel logout
   vercel login
   # Use iplixera@gmail.com
   ```

