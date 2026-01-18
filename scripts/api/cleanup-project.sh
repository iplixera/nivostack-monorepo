#!/bin/bash

# Cleanup Project Data Script
#
# This script calls the cleanup API endpoint to delete all test data
# for a specific project.
#
# Usage:
#   ./scripts/api/cleanup-project.sh <API_URL> <PROJECT_ID> <AUTH_COOKIE>
#
# Example:
#   ./scripts/api/cleanup-project.sh https://nivostack.vercel.app cmkiixzic00039krtzw3ynm87 "next-auth.session-token=your-token"

API_URL=$1
PROJECT_ID=$2
AUTH_COOKIE=$3

if [ -z "$API_URL" ] || [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: Missing required arguments"
    echo ""
    echo "Usage: $0 <API_URL> <PROJECT_ID> [AUTH_COOKIE]"
    echo ""
    echo "Example:"
    echo "  $0 https://nivostack.vercel.app cmkiixzic00039krtzw3ynm87 'next-auth.session-token=your-token'"
    echo ""
    echo "Or for localhost:"
    echo "  $0 http://localhost:3000 cmkiixzic00039krtzw3ynm87 'next-auth.session-token=your-token'"
    exit 1
fi

echo "🧹 Cleaning up project data..."
echo "   API URL: $API_URL"
echo "   Project ID: $PROJECT_ID"
echo ""

if [ -n "$AUTH_COOKIE" ]; then
    # With authentication cookie
    curl -X DELETE \
      "${API_URL}/api/admin/cleanup-project-data?projectId=${PROJECT_ID}" \
      -H "Cookie: ${AUTH_COOKIE}" \
      -H "Content-Type: application/json" \
      -v
else
    # Without authentication (will fail if auth required)
    curl -X DELETE \
      "${API_URL}/api/admin/cleanup-project-data?projectId=${PROJECT_ID}" \
      -H "Content-Type: application/json" \
      -v
fi

echo ""
echo ""
