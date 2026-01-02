#!/bin/bash

# Remove large files and push to iplixera/nivostack-monorepo

cd /Users/karim-f/Code/devbridge

echo "🔧 Fixing large files issue..."
echo ""

# Ensure on clean-main
git checkout clean-main 2>/dev/null || git checkout --orphan clean-main

# Remove problematic files/directories
echo "Step 1: Removing node_modules..."
git rm -rf node_modules 2>/dev/null || true
git rm -rf dashboard/node_modules 2>/dev/null || true
git rm -rf packages/*/node_modules 2>/dev/null || true

echo "Step 2: Removing build directories..."
git rm -rf dashboard/.next 2>/dev/null || true
git rm -rf packages/*/example/build 2>/dev/null || true
git rm -rf packages/*/example/.dart_tool 2>/dev/null || true

echo "Step 3: Removing large .node files..."
find . -name "*.node" -size +10M -exec git rm -f {} + 2>/dev/null || true
find . -path "*/node_modules/@next/swc-*/*.node" -exec git rm -f {} + 2>/dev/null || true

echo "Step 4: Removing APK files..."
find . -name "*.apk" -exec git rm -f {} + 2>/dev/null || true

# Create/update .gitignore
echo "Step 5: Ensuring .gitignore is correct..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/
.pnpm-debug.log

# Build outputs
.next/
out/
dist/
build/
*.apk
*.aab
*.ipa

# Flutter
.dart_tool/
.flutter-plugins
.flutter-plugins.dependencies
.packages
.pub-cache/
.pub/
build/

# Android
*.apk
*.aab
*.dex
*.class
bin/
gen/
out/
.gradle/
local.properties

# Large binary files
*.node
*.so
*.dylib
*.dll

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Vercel
.vercel

# Testing
coverage/
EOF

# Add .gitignore
git add .gitignore

# Add all files (respecting .gitignore)
echo "Step 6: Staging files..."
git add -A

# Check for any remaining large files
echo "Step 7: Checking for remaining large files..."
LARGE_FILES=$(find . -type f -size +50M 2>/dev/null | grep -v ".git" | head -10)
if [ -n "$LARGE_FILES" ]; then
    echo "⚠️  Found large files, removing:"
    echo "$LARGE_FILES"
    echo "$LARGE_FILES" | xargs git rm -f 2>/dev/null || true
    git add -A
fi

# Commit
echo ""
echo "Step 8: Creating commit..."
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
echo "Step 9: Pushing to repository..."
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

