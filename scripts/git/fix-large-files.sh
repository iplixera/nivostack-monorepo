#!/bin/bash

# Fix large files and push

cd /Users/karim-f/Code/devbridge

echo "🔧 Removing large files..."

# Checkout clean-main
git checkout clean-main 2>/dev/null || git checkout --orphan clean-main

# Remove all large files and build artifacts
echo "Removing node_modules..."
find . -name "node_modules" -type d -exec git rm -rf {} + 2>/dev/null || true

echo "Removing .next directories..."
find . -name ".next" -type d -exec git rm -rf {} + 2>/dev/null || true

echo "Removing Flutter build files..."
find . -name ".dart_tool" -type d -exec git rm -rf {} + 2>/dev/null || true
find . -name "build" -type d -exec git rm -rf {} + 2>/dev/null || true
find . -name "*.apk" -exec git rm -f {} + 2>/dev/null || true

echo "Removing large .node files..."
find . -name "*.node" -size +10M -exec git rm -f {} + 2>/dev/null || true

# Ensure .gitignore exists
if [ ! -f .gitignore ] || ! grep -q "node_modules" .gitignore; then
    echo "Updating .gitignore..."
    cat >> .gitignore << 'EOF'

# Dependencies
node_modules/
.pnpm-store/

# Build outputs  
.next/
build/
*.apk
*.aab

# Flutter
.dart_tool/
.flutter-plugins
.flutter-plugins.dependencies
build/

# Large binaries
*.node
EOF
fi

# Add .gitignore
git add .gitignore

# Add all files (respecting .gitignore)
git add -A

# Verify no large files
echo ""
echo "Checking for remaining large files..."
LARGE=$(find . -type f -size +50M 2>/dev/null | grep -v ".git" | head -5)
if [ -n "$LARGE" ]; then
    echo "⚠️  Still found large files, removing..."
    echo "$LARGE"
    echo "$LARGE" | xargs git rm -f 2>/dev/null || true
fi

# Commit
echo ""
echo "📝 Committing..."
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
echo "📤 Pushing..."
git push iplixera clean-main:main --force 2>&1

echo ""
echo "✅ Complete!"

