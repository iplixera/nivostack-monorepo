#!/bin/bash
set -e

# Generate Prisma client without Prisma trying to install itself
# This script ensures Prisma CLI is available and generates the client

cd "$(dirname "$0")/.."

# Check if Prisma is installed
if [ ! -f "node_modules/.bin/prisma" ]; then
  echo "Prisma CLI not found, installing..."
  pnpm add -D prisma@5.22.0 --silent
fi

# Generate Prisma client
echo "Generating Prisma client..."
node_modules/.bin/prisma generate --schema=../prisma/schema.prisma

echo "Prisma client generated successfully"

