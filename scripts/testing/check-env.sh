#!/bin/bash

echo "🔍 Environment Variables Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in Vercel environment
if [ -n "$VERCEL" ]; then
  echo "📍 Running on: Vercel"
  echo "🌍 Environment: $VERCEL_ENV"
  echo "🌿 Git Branch: $VERCEL_GIT_COMMIT_REF"
  echo "📝 Git Commit: ${VERCEL_GIT_COMMIT_SHA:0:7}"
else
  echo "📍 Running on: Local"
  echo "🌿 Git Branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Environment Variables Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check database URL
if [ -n "$POSTGRES_PRISMA_URL" ]; then
  echo "✅ POSTGRES_PRISMA_URL: ${POSTGRES_PRISMA_URL:0:40}..."
else
  echo "❌ POSTGRES_PRISMA_URL: NOT SET"
fi

# Check non-pooling URL
if [ -n "$POSTGRES_URL_NON_POOLING" ]; then
  echo "✅ POSTGRES_URL_NON_POOLING: ${POSTGRES_URL_NON_POOLING:0:40}..."
else
  echo "❌ POSTGRES_URL_NON_POOLING: NOT SET"
fi

# Check JWT secret
if [ -n "$JWT_SECRET" ]; then
  JWT_LENGTH=${#JWT_SECRET}
  if [ $JWT_LENGTH -ge 32 ]; then
    echo "✅ JWT_SECRET: Set (${JWT_LENGTH} chars) - ${JWT_SECRET:0:10}..."
  else
    echo "⚠️  JWT_SECRET: Set but too short (${JWT_LENGTH} chars, minimum 32)"
  fi
else
  echo "❌ JWT_SECRET: NOT SET"
fi

# Check API URL
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  echo "✅ NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
else
  echo "⚠️  NEXT_PUBLIC_API_URL: NOT SET (will use relative URLs)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Return error if critical variables are missing
if [ -z "$POSTGRES_PRISMA_URL" ] || [ -z "$JWT_SECRET" ]; then
  echo ""
  echo "❌ Critical environment variables are missing!"
  echo ""
  echo "To fix this:"
  echo "1. Go to: https://vercel.com/devbridge/devbridge/settings/environment-variables"
  echo "2. Add missing variables for your environment"
  echo "3. Redeploy your application"
  echo ""
  exit 1
fi

echo ""
echo "✅ All critical environment variables are set!"
echo ""

