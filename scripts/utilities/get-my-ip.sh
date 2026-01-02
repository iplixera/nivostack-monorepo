#!/bin/bash

# Get your current IP address for Supabase whitelisting

echo "🌐 Your Current IP Address"
echo "=========================="
echo ""

IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null)

if [ -z "$IP" ]; then
    echo "❌ Could not determine IP address"
    exit 1
fi

echo "Your IP: $IP"
echo ""
echo "📋 To whitelist this IP in Supabase:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/djyqtlxjpzlncppmazzz/settings/database"
echo "2. Find 'Connection Pooling' or 'Database Settings'"
echo "3. Look for 'Allowed IPs' or 'IP Restrictions'"
echo "4. Click 'Add IP' or 'Allow IP'"
echo "5. Enter: $IP"
echo "6. Save"
echo ""
echo "⏱️  Wait 1-2 minutes for changes to propagate"
echo ""
echo "Then run: bash scripts/migrate-production-now.sh"
echo ""


