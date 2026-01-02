#!/bin/bash

# Switch Vercel User to iplixera@gmail.com
# This script helps switch Vercel authentication to the correct user

set -e

echo "🔐 Switching Vercel User"
echo "======================="
echo ""
echo "Current issue: karim.magdy@flooss.com is attempting deployments"
echo "Target user: iplixera@gmail.com"
echo ""

# Check current user
echo "📋 Current Vercel user:"
vercel whoami 2>&1 || echo "Not logged in"
echo ""

# Instructions for switching
echo "⚠️  To switch to iplixera@gmail.com:"
echo ""
echo "Option 1: Logout and login with correct account"
echo "  1. Run: vercel logout"
echo "  2. Run: vercel login"
echo "  3. Login with: iplixera@gmail.com"
echo ""

echo "Option 2: Use Vercel token from iplixera@gmail.com account"
echo "  1. Go to: https://vercel.com/account/tokens"
echo "  2. Create a new token (or use existing)"
echo "  3. Update vercel.properties with new token"
echo ""

echo "Option 3: Add iplixera@gmail.com to NivoStack team"
echo "  1. Go to: https://vercel.com/nivostack/settings/members"
echo "  2. Invite: iplixera@gmail.com"
echo "  3. Accept invitation"
echo ""

echo "After switching, verify with:"
echo "  vercel whoami"
echo "  vercel teams ls"

