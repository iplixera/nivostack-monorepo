#!/bin/bash
set -e

# Safe Prisma generation script that prevents Prisma from installing itself
# Workaround for Prisma's internal install check in pnpm workspaces

cd "$(dirname "$0")/.."

echo "Generating Prisma client..."

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
  # Fallback: use pnpm exec
  PRISMA_BIN="pnpm exec prisma"
fi

# Workaround: Create a fake pnpm that Prisma can use
# This prevents Prisma from trying to install itself
FAKE_PNPM_DIR=$(mktemp -d)

# Find real pnpm first (before we modify PATH)
REAL_PNPM=$(command -v pnpm 2>/dev/null || echo "/usr/local/bin/pnpm")

cat > "$FAKE_PNPM_DIR/pnpm" << EOF
#!/bin/bash
# Fake pnpm that makes Prisma think packages are already installed
if [[ "\$*" == *"add prisma"* ]] || [[ "\$*" == *"add @prisma/client"* ]]; then
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
exec "$REAL_PNPM" "\$@"
EOF
chmod +x "$FAKE_PNPM_DIR/pnpm"

# Temporarily add fake pnpm to PATH (before real pnpm)
export PATH="$FAKE_PNPM_DIR:$PATH"

# Generate Prisma client
echo "Running Prisma generate..."
if [ -f "$PRISMA_BIN" ]; then
  "$PRISMA_BIN" generate --schema=../prisma/schema.prisma || {
    echo "Direct binary failed, trying pnpm exec..."
    pnpm exec prisma generate --schema=../prisma/schema.prisma
  }
else
  $PRISMA_BIN generate --schema=../prisma/schema.prisma
fi

# Cleanup
rm -rf "$FAKE_PNPM_DIR"

echo "Prisma client generated successfully"
