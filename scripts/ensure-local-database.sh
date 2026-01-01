#!/bin/bash

# Ensure Local Database Configuration
# This script ensures .env.local ALWAYS uses local database for development
# Called automatically during setup and can be run manually

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🔒 Ensuring local database configuration..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
fi

# Check current configuration
CURRENT_DB=$(grep "^POSTGRES_PRISMA_URL" .env.local 2>/dev/null | head -1 || echo "")

if [ -n "$CURRENT_DB" ]; then
    # Check if it's pointing to localhost
    if echo "$CURRENT_DB" | grep -q "localhost\|127.0.0.1"; then
        echo "✅ Already configured for local database"
        echo "   $CURRENT_DB"
    else
        echo "⚠️  Found remote database configuration!"
        echo "   Current: $CURRENT_DB"
        echo ""
        echo "🔄 Switching to local database..."
        
        # Backup current config
        cp .env.local .env.local.remote-backup
        
        # Remove remote database config
        sed -i.bak '/^POSTGRES_PRISMA_URL/d' .env.local 2>/dev/null || true
        sed -i.bak '/^POSTGRES_URL_NON_POOLING/d' .env.local 2>/dev/null || true
        
        # Add local database config
        if [ -f "docker-compose.yml" ]; then
            cat >> .env.local << 'EOF'

# Database Configuration (Localhost for local development)
# ALWAYS uses local Docker PostgreSQL - DO NOT use remote databases for localhost
POSTGRES_PRISMA_URL=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
POSTGRES_URL_NON_POOLING=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
EOF
        else
            cat >> .env.local << 'EOF'

# Database Configuration (Localhost for local development)
# ALWAYS uses local PostgreSQL - DO NOT use remote databases for localhost
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/nivostack
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5432/nivostack
EOF
        fi
        
        echo "✅ Switched to local database"
        echo "   Backup saved to: .env.local.remote-backup"
    fi
else
    echo "📝 Adding local database configuration..."
    
    if [ -f "docker-compose.yml" ]; then
        cat >> .env.local << 'EOF'

# Database Configuration (Localhost for local development)
# ALWAYS uses local Docker PostgreSQL - DO NOT use remote databases for localhost
POSTGRES_PRISMA_URL=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
POSTGRES_URL_NON_POOLING=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
EOF
    else
        cat >> .env.local << 'EOF'

# Database Configuration (Localhost for local development)
# ALWAYS uses local PostgreSQL - DO NOT use remote databases for localhost
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/nivostack
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5432/nivostack
EOF
    fi
    
    echo "✅ Added local database configuration"
fi

echo ""
echo "✅ Local database configuration ensured!"

