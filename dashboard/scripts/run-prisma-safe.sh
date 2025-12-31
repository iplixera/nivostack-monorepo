#!/bin/bash
set +e  # Don't exit on error for db push

# Safe Prisma script that prevents Prisma from installing itself
# Workaround for Prisma's internal install check in pnpm workspaces
# Usage: bash scripts/run-prisma-safe.sh generate|push

cd "$(dirname "$0")/.."

COMMAND=${1:-generate}

echo "Running Prisma $COMMAND..."

# Set environment variables
export PRISMA_SKIP_POSTINSTALL_GENERATE=true
export SKIP_ENV_VALIDATION=true

# Find Prisma binary
PRISMA_BIN=""
if [ -f "node_modules/.bin/prisma" ]; then
  PRISMA_BIN="node_modules/.bin/prisma"
elif [ -f "../node_modules/.bin/prisma" ]; then
  PRISMA_BIN="../node_modules/.bin/prisma"
else
  echo "⚠️  Prisma binary not found"
  exit 1
fi

# Workaround: Create a fake pnpm that Prisma can use
# This prevents Prisma from trying to install itself
FAKE_PNPM_DIR=$(mktemp -d)

# Find real pnpm first (before we modify PATH)
REAL_PNPM=$(command -v pnpm 2>/dev/null || echo "/usr/local/bin/pnpm")

cat > "$FAKE_PNPM_DIR/pnpm" << 'EOF'
#!/bin/bash
# Fake pnpm that makes Prisma think packages are already installed
if [[ "$*" == *"add prisma"* ]] || [[ "$*" == *"add @prisma/client"* ]]; then
  # Check if package already exists in package.json
  if grep -q "\"prisma\"" package.json 2>/dev/null || grep -q "\"@prisma/client\"" package.json 2>/dev/null; then
    echo "Package already installed (workaround)"
    exit 0
  fi
  # Even if not found, return success to fool Prisma
  echo "Package install simulated (workaround)"
  exit 0
fi
# For other commands, use real pnpm (use full path to avoid recursion)
exec "$REAL_PNPM" "$@"
EOF
chmod +x "$FAKE_PNPM_DIR/pnpm"

# Temporarily add fake pnpm to PATH (before real pnpm)
export PATH="$FAKE_PNPM_DIR:$PATH"

# Run Prisma command
if [ "$COMMAND" = "generate" ]; then
  echo "Generating Prisma client..."
  "$PRISMA_BIN" generate --schema=../prisma/schema.prisma
  EXIT_CODE=$?
elif [ "$COMMAND" = "push" ]; then
  echo "Pushing schema to database..."
  "$PRISMA_BIN" db push --schema=../prisma/schema.prisma --accept-data-loss --skip-generate
  EXIT_CODE=$?
else
  echo "❌ Unknown command: $COMMAND (use 'generate' or 'push')"
  EXIT_CODE=1
fi

# Cleanup
rm -rf "$FAKE_PNPM_DIR"

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Prisma $COMMAND completed successfully"
else
  echo "⚠️  Prisma $COMMAND failed (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE

