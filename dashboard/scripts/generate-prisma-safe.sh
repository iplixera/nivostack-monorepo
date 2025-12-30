#!/bin/bash
set -e

# Safe Prisma generation script that prevents Prisma from installing itself
# This script ensures Prisma CLI is available before generating

cd "$(dirname "$0")/.."

echo "Checking Prisma CLI availability..."

# Try to find Prisma binary
PRISMA_BIN=""
if [ -f "node_modules/.bin/prisma" ]; then
  PRISMA_BIN="node_modules/.bin/prisma"
elif [ -f "../node_modules/.bin/prisma" ]; then
  PRISMA_BIN="../node_modules/.bin/prisma"
elif command -v prisma &> /dev/null; then
  PRISMA_BIN="prisma"
else
  echo "Prisma CLI not found. Attempting to use pnpm exec..."
  PRISMA_BIN="pnpm exec prisma"
fi

echo "Using Prisma: $PRISMA_BIN"
echo "Generating Prisma client..."

# Set environment variable to prevent Prisma from trying to install
export PRISMA_SKIP_POSTINSTALL_GENERATE=true
export SKIP_ENV_VALIDATION=true

# Generate Prisma client
if [ -f "$PRISMA_BIN" ]; then
  "$PRISMA_BIN" generate --schema=../prisma/schema.prisma
else
  $PRISMA_BIN generate --schema=../prisma/schema.prisma
fi

echo "Prisma client generated successfully"

