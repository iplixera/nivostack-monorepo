#!/bin/bash

# Run Database Migration via API Endpoint
# This calls the /api/migrate endpoint which runs on the deployed server
# No IP whitelisting needed - runs from Vercel server

set -e

echo "🔄 Running Database Migration via API"
echo "======================================"
echo ""

# Get the deployment URL
DEPLOYMENT_URL="${1:-https://studio.nivostack.com}"

echo "📦 Deployment URL: $DEPLOYMENT_URL"
echo ""

# Check if CRON_SECRET is set
if [ -z "$CRON_SECRET" ]; then
    echo "⚠️  CRON_SECRET not set in environment"
    echo ""
    echo "To get your CRON_SECRET:"
    echo "1. Go to: https://vercel.com/plixeras/nivostack-studio/settings/environment-variables"
    echo "2. Find 'CRON_SECRET' variable"
    echo "3. Copy the value"
    echo "4. Run: export CRON_SECRET='your-secret-here'"
    echo "5. Then run this script again"
    echo ""
    echo "Or provide it as second argument:"
    echo "  bash scripts/run-migration-via-api.sh https://studio.nivostack.com YOUR_CRON_SECRET"
    echo ""
    exit 1
fi

echo "🔄 Calling migration API endpoint..."
echo ""

# Call the migration endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DEPLOYMENT_URL}/api/migrate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${CRON_SECRET}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo ""
echo "Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Migration completed successfully!"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ Unauthorized - Check your CRON_SECRET"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ Migration failed - Check the error message above"
else
    echo "❌ Unexpected response - HTTP $HTTP_CODE"
fi


