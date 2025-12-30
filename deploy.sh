#!/bin/bash

# Vercel Deployment Script
# This script deploys the DevBridge project to Vercel production

set -e

echo "🚀 DevBridge Deployment Script"
echo "================================"
echo ""

# Set up pnpm and node paths
export PNPM_HOME="/Users/karim-f/Library/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Load Vercel token from properties file
if [ -f "vercel.properties" ]; then
    echo "📄 Loading Vercel token from vercel.properties..."
    export $(grep -v '^#' vercel.properties | xargs)
    
    if [ "$VERCEL_TOKEN" = "your_vercel_token_here" ]; then
        echo "❌ ERROR: Please set your Vercel token in vercel.properties"
        echo ""
        echo "Steps:"
        echo "1. Go to: https://vercel.com/account/tokens"
        echo "2. Create a new token"
        echo "3. Edit vercel.properties and replace 'your_vercel_token_here' with your token"
        echo "4. Run this script again"
        exit 1
    fi
else
    echo "❌ ERROR: vercel.properties not found"
    echo "Please create vercel.properties with your VERCEL_TOKEN"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ ERROR: Vercel CLI not found"
    echo "Run: pnpm add -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found: $(vercel --version)"
echo ""

# Deploy to production
echo "🚀 Deploying to Vercel production..."
echo ""

vercel deploy --prod --yes --token="$VERCEL_TOKEN"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app should be live at: https://devbridge-eta.vercel.app"
echo ""
