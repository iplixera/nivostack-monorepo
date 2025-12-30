#!/bin/bash
# Terminal Diagnostic Script
# Run this and share ALL output

echo "=== CURSOR TERMINAL DIAGNOSTIC ==="
echo ""
echo "Test 1: Direct echo"
echo "SUCCESS_ECHO_12345"
echo ""

echo "Test 2: Current directory"
pwd
echo ""

echo "Test 3: User info"
whoami
echo ""

echo "Test 4: Shell info"
echo "SHELL=$SHELL"
echo "TERM=$TERM"
echo ""

echo "Test 5: Git version"
git --version 2>&1
echo ""

echo "Test 6: Git status (first 5 lines)"
cd /Users/karim-f/Code/devbridge 2>/dev/null || echo "Cannot cd to devbridge"
git status --short 2>&1 | head -5
echo ""

echo "Test 7: File write and read"
echo "FILE_TEST_SUCCESS" > /tmp/cursor-diagnostic-$(date +%s).txt
ls -la /tmp/cursor-diagnostic-*.txt | tail -1
cat /tmp/cursor-diagnostic-*.txt | tail -1
echo ""

echo "Test 8: Error output"
echo "This is stderr" >&2
echo ""

echo "Test 9: Exit code"
echo "Exit code will be: 0"
echo ""

echo "=== END DIAGNOSTIC ==="
echo "Please share ALL output above"

