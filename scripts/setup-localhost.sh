#!/bin/bash

# Setup Localhost Development Environment
# This script ensures all required environment variables are set for local development

set -e

echo "🚀 Setting up Localhost Development Environment"
echo "=============================================="
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
fi

# Check for required variables
MISSING_VARS=()

if ! grep -q "POSTGRES_PRISMA_URL" .env.local 2>/dev/null; then
    MISSING_VARS+=("POSTGRES_PRISMA_URL")
fi

if ! grep -q "POSTGRES_URL_NON_POOLING" .env.local 2>/dev/null; then
    MISSING_VARS+=("POSTGRES_URL_NON_POOLING")
fi

if ! grep -q "JWT_SECRET" .env.local 2>/dev/null; then
    MISSING_VARS+=("JWT_SECRET")
fi

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "✅ All required environment variables are set"
    echo ""
else
    echo "⚠️  Missing environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    
    # Use localhost database for local development
    echo "📋 Adding localhost database credentials for local development..."
    echo ""
    
    # Check if docker-compose.yml exists
    if [ -f "docker-compose.yml" ]; then
        echo "   ✅ Found docker-compose.yml for local database"
        echo "   📋 Using localhost PostgreSQL (port 5433)"
        echo ""
        
        # Check if variables already exist (commented out)
        if grep -q "^#.*POSTGRES_PRISMA_URL" .env.local 2>/dev/null; then
            echo "   Found commented POSTGRES_PRISMA_URL, uncommenting..."
            sed -i.bak 's/^#.*POSTGRES_PRISMA_URL/POSTGRES_PRISMA_URL/' .env.local 2>/dev/null || true
        else
            echo "   Adding localhost database URLs..."
            cat >> .env.local << 'EOF'

# Database Configuration (Localhost for local development)
# Using Docker PostgreSQL from docker-compose.yml
POSTGRES_PRISMA_URL=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
POSTGRES_URL_NON_POOLING=postgresql://postgres:devbridge_local_password@localhost:5433/devbridge
EOF
        fi
    else
        echo "   ⚠️  docker-compose.yml not found"
        echo "   📋 Using localhost PostgreSQL (assuming default port 5432)"
        echo ""
        cat >> .env.local << 'EOF'

# Database Configuration (Localhost for local development)
# Update these if your local PostgreSQL uses different credentials
POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5432/nivostack
POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5432/nivostack
EOF
    fi
    
    # Generate JWT_SECRET if missing
    if ! grep -q "^JWT_SECRET" .env.local 2>/dev/null; then
        echo "   Generating JWT_SECRET..."
        JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
        echo "JWT_SECRET=$JWT_SECRET" >> .env.local
        echo "   ✅ Generated JWT_SECRET"
    fi
    
    echo ""
    echo "✅ Environment variables added to .env.local"
    echo ""
fi

# Check if Prisma client is generated
echo "🔍 Checking Prisma setup..."
cd dashboard

if [ ! -f "node_modules/.prisma/client/index.js" ]; then
    echo "   Generating Prisma client..."
    bash scripts/run-prisma-safe.sh generate
    echo "   ✅ Prisma client generated"
else
    echo "   ✅ Prisma client already generated"
fi

echo ""
echo "🔍 Checking local database..."
if [ -f "../docker-compose.yml" ]; then
    echo "   Found docker-compose.yml"
    echo ""
    echo "   📋 To start local database:"
    echo "      cd .. && docker-compose up -d"
    echo ""
    echo "   ⏳ Waiting for database to be ready..."
    sleep 2
    
    # Check if docker is running
    if docker ps > /dev/null 2>&1; then
        # Check if postgres container is running
        if docker ps | grep -q "devbridge-postgres\|postgres"; then
            echo "   ✅ PostgreSQL container is running"
        else
            echo "   ⚠️  PostgreSQL container not running"
            echo "   💡 Start it with: docker-compose up -d"
        fi
    else
        echo "   ⚠️  Docker is not running"
        echo "   💡 Start Docker Desktop and run: docker-compose up -d"
    fi
else
    echo "   ⚠️  docker-compose.yml not found"
    echo "   💡 Make sure PostgreSQL is running on localhost"
fi

echo ""
echo "🧪 Testing database connection..."
if bash scripts/run-prisma-safe.sh push --skip-generate 2>&1 | grep -q "Database connection successful\|Pushed\|Everything is now in sync"; then
    echo "   ✅ Database connection successful"
else
    echo "   ⚠️  Database connection failed"
    echo "   💡 Make sure:"
    echo "      1. Local PostgreSQL is running"
    echo "      2. Or start Docker: docker-compose up -d"
    echo "      3. Check .env.local has correct credentials"
fi

echo ""
echo "✅ Localhost setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start local database: docker-compose up -d (if using Docker)"
echo "   2. Review .env.local file (in project root)"
echo "   3. Run: cd dashboard && pnpm dev"
echo "   4. Open: http://localhost:3000"
echo ""
echo "📝 Environment Configuration:"
echo "   - Localhost: Uses local PostgreSQL database"
echo "   - Vercel Production: Uses production Supabase database"
echo "   - Vercel Preview: Uses staging Supabase database"
echo ""

