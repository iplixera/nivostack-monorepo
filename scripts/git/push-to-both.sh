#!/bin/bash
B=$(git branch --show-current)
echo "Pushing $B to both remotes..."
echo "→ origin (ikarimmagdy/devbridge)..."
git push origin $B
echo "→ flooss (pie-int/dev-bridge)..."
git push flooss $B 2>&1 || echo "⚠️  Flooss push failed (might need access)"
echo "✅ Done!"

