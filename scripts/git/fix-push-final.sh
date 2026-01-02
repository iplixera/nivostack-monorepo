#!/bin/bash
set -e

cd /Users/karim-f/Code/devbridge

echo "🔧 Fixing large files and pushing..."
echo ""

# Ensure on clean-main
git checkout clean-main 2>/dev/null || git checkout --orphan clean-main

# Remove the specific large file that's blocking
echo "Removing large .node file..."
git rm -f "node_modules/.pnpm/@next+swc-darwin-arm64@16.0.8/node_modules/@next/swc-darwin-arm64/next-swc.darwin-arm64.node" 2>/dev/null || true

# Remove all node_modules
echo "Removing all node_modules..."
git rm -rf node_modules 2>/dev/null || true
git rm -rf dashboard/node_modules 2>/dev/null || true

# Remove build directories
echo "Removing build directories..."
git rm -rf dashboard/.next 2>/dev/null || true
git rm -rf packages/sdk-flutter/example/.dart_tool 2>/dev/null || true
git rm -rf packages/sdk-flutter/example/build 2>/dev/null || true

# Remove APK files
echo "Removing APK files..."
git rm -f packages/sdk-flutter/example/build/app/outputs/apk/debug/app-debug.apk 2>/dev/null || true

# Ensure .gitignore
cat > .gitignore << 'EOF'
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
*.so
*.dylib
EOF

git add .gitignore
git add -A

# Commit
git commit --amend -m "Initial commit - NivoStack monorepo" --author="iplixera <iplixera@iplixera.com>" 2>&1 || \
git commit -m "Initial commit - NivoStack monorepo" --author="iplixera <iplixera@iplixera.com>" 2>&1

# Push
echo ""
echo "📤 Pushing..."
git push iplixera clean-main:main --force 2>&1

echo ""
echo "✅ Done! Check: https://github.com/iplixera/nivostack-monorepo"

