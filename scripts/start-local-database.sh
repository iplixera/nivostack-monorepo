#!/bin/bash

# Start Local PostgreSQL Database
# This script starts the Docker PostgreSQL container for local development

set -e

echo "🐳 Starting Local PostgreSQL Database"
echo "======================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop and try again."
    echo ""
    echo "On macOS:"
    echo "  1. Open Docker Desktop application"
    echo "  2. Wait for it to start (whale icon in menu bar)"
    echo "  3. Run this script again"
    echo ""
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Navigate to project root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Start PostgreSQL container
echo "🚀 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for database to be ready
echo ""
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is running
if docker ps | grep -q "devbridge-postgres"; then
    echo "✅ PostgreSQL container is running"
    echo ""
    
    # Test connection
    echo "🔍 Testing database connection..."
    if docker exec devbridge-postgres psql -U postgres -d devbridge -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Database connection successful!"
        echo ""
        echo "📋 Connection Details:"
        echo "   Host: localhost"
        echo "   Port: 5433"
        echo "   Database: devbridge"
        echo "   User: postgres"
        echo "   Password: devbridge_local_password"
        echo ""
        echo "🔗 Connection String:"
        echo "   postgresql://postgres:devbridge_local_password@localhost:5433/devbridge"
        echo ""
        echo "✅ Ready to use!"
    else
        echo "⚠️  Database container is running but connection test failed"
        echo "   This might be normal if the database is still initializing"
        echo "   Wait a few seconds and try connecting again"
    fi
else
    echo "❌ Failed to start PostgreSQL container"
    echo ""
    echo "Check logs with:"
    echo "   docker-compose logs postgres"
    exit 1
fi

