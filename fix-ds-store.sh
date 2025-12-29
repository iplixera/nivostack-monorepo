#!/bin/bash
# Fix .DS_Store files blocking checkout

cd /Users/karim-f/Code/nivostack-monorepo-checkout

echo "Removing .DS_Store files from git tracking..."

# Remove from git cache
git rm --cached docs/.DS_Store 2>/dev/null || true
git rm --cached src/.DS_Store 2>/dev/null || true
git rm --cached .DS_Store 2>/dev/null || true

# Remove all .DS_Store files recursively
find . -name .DS_Store -type f -delete 2>/dev/null || true

# Ensure .gitignore has .DS_Store
if ! grep -q "\.DS_Store" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# macOS" >> .gitignore
    echo ".DS_Store" >> .gitignore
    echo ".DS_Store?" >> .gitignore
    echo "._*" >> .gitignore
fi

# Stage .gitignore
git add .gitignore

# Now checkout main
echo "Switching to main branch..."
git checkout main

echo "✅ Done! You're now on main branch"


