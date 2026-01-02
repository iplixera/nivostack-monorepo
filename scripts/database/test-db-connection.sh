#!/bin/bash

# Test database connections to diagnose issues

set -e

echo "🔍 Testing Database Connections"
echo "================================"
echo ""

# Production Database
PROD_URL="postgresql://postgres:7ReIOt1GU4ZGsfgo@db.djyqtlxjpzlncppmazzz.supabase.co:5432/postgres?sslmode=require"

# Staging Database
STAGING_URL="postgresql://postgres:Staging@db.ngsgfvrntmjakzednles.supabase.co:5432/postgres?sslmode=require"

test_connection() {
    local name=$1
    local url=$2
    
    echo "Testing $name connection..."
    echo "URL: ${url%%@*}@***"
    
    # Test with psql if available
    if command -v psql &> /dev/null; then
        echo "  Testing with psql..."
        if PGPASSWORD=$(echo "$url" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p') psql "$url" -c "SELECT 1;" > /dev/null 2>&1; then
            echo "  ✅ Connection successful!"
            return 0
        else
            echo "  ❌ Connection failed!"
            return 1
        fi
    fi
    
    # Test with Prisma
    echo "  Testing with Prisma..."
    if POSTGRES_PRISMA_URL="$url" POSTGRES_URL_NON_POOLING="$url" pnpm dlx prisma@5.22.0 db execute --stdin --schema=prisma/schema.prisma <<< "SELECT 1;" > /dev/null 2>&1; then
        echo "  ✅ Connection successful!"
        return 0
    else
        echo "  ❌ Connection failed!"
        echo "  Error details:"
        POSTGRES_PRISMA_URL="$url" POSTGRES_URL_NON_POOLING="$url" pnpm dlx prisma@5.22.0 db execute --stdin --schema=prisma/schema.prisma <<< "SELECT 1;" 2>&1 | head -10
        return 1
    fi
}

echo "=== Production Database ==="
test_connection "Production" "$PROD_URL"

echo ""
echo "=== Staging Database ==="
test_connection "Staging" "$STAGING_URL"

echo ""
echo "📋 If connections fail, check:"
echo "   1. IP whitelisting in Supabase Dashboard"
echo "   2. Network firewall settings"
echo "   3. Database credentials"
echo ""

