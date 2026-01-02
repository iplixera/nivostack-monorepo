#!/bin/bash

# Setup Database Environment Variables in Vercel using API
# This script configures production and staging database connections

set -e

TEAM_ID="team_MBPi3LRUH16KWHeCO2JAQtxs"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load Vercel token
if [ -f "$ROOT_DIR/vercel.properties" ]; then
    export VERCEL_TOKEN=$(grep VERCEL_TOKEN "$ROOT_DIR/vercel.properties" | cut -d'=' -f2)
else
    echo "❌ vercel.properties not found"
    exit 1
fi

echo "🔐 Database Environment Variables Setup (via Vercel API)"
echo "======================================================"
echo ""

# Production Database Configuration
PROD_REF="djyqtlxjpzlncppmazzz"
PROD_PASSWORD="7ReIOt1GU4ZGsfgo"

# Staging Database Configuration
STAGING_REF="ngsgfvrntmjakzednles"
STAGING_PASSWORD="Staging"

# Production Database Connection Strings
PROD_POOLED="postgresql://postgres.${PROD_REF}:${PROD_PASSWORD}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
PROD_DIRECT="postgresql://postgres:${PROD_PASSWORD}@db.${PROD_REF}.supabase.co:5432/postgres"
PROD_READ_REPLICA="postgresql://postgres:${PROD_PASSWORD}@db.${PROD_REF}.supabase.co:5432/postgres"

# Staging Database Connection Strings
STAGING_POOLED="postgresql://postgres.${STAGING_REF}:${STAGING_PASSWORD}@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
STAGING_DIRECT="postgresql://postgres:${STAGING_PASSWORD}@db.${STAGING_REF}.supabase.co:5432/postgres"

# Generate JWT secrets
PROD_JWT_SECRET=$(openssl rand -base64 32)
STAGING_JWT_SECRET=$(openssl rand -base64 32)

echo "📦 Projects to configure:"
PROJECTS=("nivostack-studio" "nivostack-ingest-api" "nivostack-control-api")

# Function to get project ID
get_project_id() {
    local project_name=$1
    cd "$ROOT_DIR/dashboard"
    vercel link --project "$project_name" --scope "$TEAM_ID" --token="$VERCEL_TOKEN" --yes > /dev/null 2>&1 || true
    cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4
}

# Function to set env var via Vercel API
set_env_var_api() {
    local project_id=$1
    local key=$2
    local value=$3
    local environment=$4
    
    echo "  Setting $key for $environment..."
    
    # URL encode the value
    local encoded_value=$(printf '%s' "$value" | jq -sRr @uri)
    
    # Create environment variable via API
    local response=$(curl -s -X POST \
        "https://api.vercel.com/v10/projects/${project_id}/env" \
        -H "Authorization: Bearer ${VERCEL_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "{
            \"key\": \"${key}\",
            \"value\": \"${value}\",
            \"type\": \"encrypted\",
            \"target\": [\"${environment}\"]
        }")
    
    # Check if already exists
    if echo "$response" | grep -q "already exists"; then
        echo "    (already exists, updating...)"
        # Update existing variable
        local env_id=$(curl -s -X GET \
            "https://api.vercel.com/v9/projects/${project_id}/env" \
            -H "Authorization: Bearer ${VERCEL_TOKEN}" | \
            jq -r ".envs[] | select(.key == \"${key}\" and (.[\"target\"] | index(\"${environment}\") != null)) | .id" | head -1)
        
        if [ -n "$env_id" ] && [ "$env_id" != "null" ]; then
            curl -s -X PATCH \
                "https://api.vercel.com/v10/projects/${project_id}/env/${env_id}" \
                -H "Authorization: Bearer ${VERCEL_TOKEN}" \
                -H "Content-Type: application/json" \
                -d "{
                    \"value\": \"${value}\",
                    \"target\": [\"${environment}\"]
                }" > /dev/null
            echo "    ✅ Updated"
        else
            echo "    ⚠️  Exists but couldn't update"
        fi
    elif echo "$response" | grep -q "\"id\""; then
        echo "    ✅ Created"
    else
        echo "    ⚠️  Response: $response"
    fi
}

# Configure Production Environment Variables
echo ""
echo "=== Production Environment (Production) ==="
for project in "${PROJECTS[@]}"; do
    echo "📦 Configuring $project..."
    PROJECT_ID=$(get_project_id "$project")
    if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
        echo "  ⚠️  Could not get project ID for $project"
        continue
    fi
    
    set_env_var_api "$PROJECT_ID" "POSTGRES_PRISMA_URL" "$PROD_POOLED" "production"
    set_env_var_api "$PROJECT_ID" "POSTGRES_URL_NON_POOLING" "$PROD_DIRECT" "production"
    set_env_var_api "$PROJECT_ID" "JWT_SECRET" "$PROD_JWT_SECRET" "production"
done

# Configure Read Replica for Studio
echo ""
echo "📦 Configuring Read Replica for nivostack-studio..."
STUDIO_ID=$(get_project_id "nivostack-studio")
if [ -n "$STUDIO_ID" ] && [ "$STUDIO_ID" != "null" ]; then
    set_env_var_api "$STUDIO_ID" "POSTGRES_READ_REPLICA_URL" "$PROD_READ_REPLICA" "production"
fi

# Configure Staging Environment Variables
echo ""
echo "=== Staging Environment (Preview + Development) ==="
for project in "${PROJECTS[@]}"; do
    echo "📦 Configuring $project (staging)..."
    PROJECT_ID=$(get_project_id "$project")
    if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
        echo "  ⚠️  Could not get project ID for $project"
        continue
    fi
    
    set_env_var_api "$PROJECT_ID" "POSTGRES_PRISMA_URL" "$STAGING_POOLED" "preview"
    set_env_var_api "$PROJECT_ID" "POSTGRES_URL_NON_POOLING" "$STAGING_DIRECT" "preview"
    set_env_var_api "$PROJECT_ID" "JWT_SECRET" "$STAGING_JWT_SECRET" "preview"
    
    set_env_var_api "$PROJECT_ID" "POSTGRES_PRISMA_URL" "$STAGING_POOLED" "development"
    set_env_var_api "$PROJECT_ID" "POSTGRES_URL_NON_POOLING" "$STAGING_DIRECT" "development"
    set_env_var_api "$PROJECT_ID" "JWT_SECRET" "$STAGING_JWT_SECRET" "development"
done

echo ""
echo "✅ Database environment variables configured!"
echo ""
echo "📋 Summary:"
echo "  Production Database: $PROD_REF"
echo "  Staging Database: $STAGING_REF"
echo "  Production JWT Secret: $PROD_JWT_SECRET"
echo "  Staging JWT Secret: $STAGING_JWT_SECRET"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Run migrations on production database"
echo "  2. Run migrations on staging database"
echo "  3. Verify connections in Vercel Dashboard"
echo ""
echo "To run migrations:"
echo "  ./scripts/run-migrations.sh"

