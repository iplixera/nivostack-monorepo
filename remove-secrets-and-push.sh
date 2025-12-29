#!/bin/bash
set -e

cd /Users/karim-f/Code/devbridge

echo "🔒 Removing secrets and pushing..."
echo ""

# Ensure on clean-main
git checkout clean-main 2>/dev/null || git checkout --orphan clean-main

# Remove files with secrets or redact them
echo "Step 1: Removing/redacting files with secrets..."

# Remove or update files with tokens
if [ -f ".dual-remote-config" ]; then
    echo "Removing .dual-remote-config (contains tokens)..."
    git rm -f .dual-remote-config 2>/dev/null || true
fi

# Redact tokens in documentation files (already done, but ensure they're updated)
if [ -f "EXECUTE_PUSH.md" ]; then
    sed -i '' 's/ghp_[A-Za-z0-9]*/YOUR_GITHUB_TOKEN/g' EXECUTE_PUSH.md 2>/dev/null || \
    sed -i 's/ghp_[A-Za-z0-9]*/YOUR_GITHUB_TOKEN/g' EXECUTE_PUSH.md 2>/dev/null || true
fi

if [ -f "PUSH_STATUS.md" ]; then
    sed -i '' 's/ghp_[A-Za-z0-9]*/YOUR_GITHUB_TOKEN/g' PUSH_STATUS.md 2>/dev/null || \
    sed -i 's/ghp_[A-Za-z0-9]*/YOUR_GITHUB_TOKEN/g' PUSH_STATUS.md 2>/dev/null || true
fi

# Remove any other files that might contain tokens
find . -type f -name "*.sh" -exec grep -l "ghp_" {} \; 2>/dev/null | while read file; do
    echo "Redacting tokens in $file..."
    sed -i '' 's/ghp_[A-Za-z0-9]*/YOUR_GITHUB_TOKEN/g' "$file" 2>/dev/null || \
    sed -i 's/ghp_[A-Za-z0-9]*/YOUR_GITHUB_TOKEN/g' "$file" 2>/dev/null || true
done

# Add .gitignore to prevent future commits of secrets
if ! grep -q "\.dual-remote-config" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Secret files" >> .gitignore
    echo ".dual-remote-config" >> .gitignore
    echo "*.token" >> .gitignore
    echo "*.key" >> .gitignore
fi

# Stage changes
echo "Step 2: Staging changes..."
git add -A

# Commit
echo "Step 3: Committing..."
git commit --amend -m "Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects" \
  --author="iplixera <iplixera@iplixera.com>" 2>&1 || \
git commit -m "Initial commit - NivoStack monorepo" --author="iplixera <iplixera@iplixera.com>" 2>&1

# Push
echo ""
echo "Step 4: Pushing..."
git push iplixera clean-main:main --force 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Repository pushed!"
    echo "📋 https://github.com/iplixera/nivostack-monorepo"
else
    echo ""
    echo "❌ Push failed. Check output above."
    exit 1
fi

