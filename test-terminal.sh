#!/bin/bash
# Simple test script to verify terminal works

echo "TEST_START"
echo "Current directory: $(pwd)"
echo "Current user: $(whoami)"
echo "Git version: $(git --version)"
echo "Python version: $(python3 --version)"
echo "TEST_END"

# Write to file
echo "Test completed at $(date)" > /tmp/terminal-test.txt
cat /tmp/terminal-test.txt

