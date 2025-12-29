#!/bin/bash

# Fix large files issue and push

set -e

cd /Users/karim-f/Code/devbridge

echo "🔧 Fixing large files issue..."
echo ""

# Ensure we're on clean-main
git checkout clean-main 2>/dev/null || git checkout --orphan clean-main

# Remove large files and directories
echo "Removing node_modules..."
git rm -rf node_modules 2>/dev/null || true

echo "Removing dashboard build files..."
git rm -rf dashboard/.next dashboard/node_modules 2>/dev/null || true

echo "Removing Flutter build files..."
git rm -rf packages/*/example/.dart_tool packages/*/example/build packages/*/example/.flutter-plugins packages/*/example/.flutter-plugins.dependencies 2>/dev/null || true

# Ensure .gitignore exists and is correct
if [ ! -f .gitignore ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
.next/
out/
dist/
build/
*.apk
*.aab

# Flutter
.dart_tool/
.flutter-plugins
.flutter-plugins.dependencies
build/

# Large binary files
*.node
*.so
*.dylib
EOF
fi

# Add .gitignore
git add .gitignore

# Add all other files (respecting .gitignore)
git add -A

# Check for any remaining large files
echo ""
echo "Checking for large files..."
LARGE_FILES=$(find . -type f -size +50M 2>/dev/null | grep -v ".git" | head -10)
if [ -n "$LARGE_FILES" ]; then
    echo "⚠️  Found large files, removing..."
    echo "$LARGE_FILES" | xargs git rm -f 2>/dev/null || true
fi

# Amend commit
echo ""
echo "📝 Updating commit..."
git commit --amend -m "Initial commit - NivoStack monorepo

- Dashboard with Next.js (NivoStack Studio)
- Flutter SDK (nivostack_sdk)
- Android SDK (com.plixera.nivostack)
- Documentation
- Deployment configurations for 4 Vercel projects" \
  --author="iplixera <iplixera@iplixera.com>" 2>&1 || git commit -m "Initial commit - NivoStack monorepo" --author="iplixera <iplixera@iplixera.com>" 2>&1

echo ""
echo "📤 Pushing to repository..."
git push iplixera clean-main:main --force 2>&1

echo ""
echo "✅ Done!"

