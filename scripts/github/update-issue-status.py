#!/usr/bin/env python3
"""
Update GitHub Issue Status

Usage:
  python3 scripts/github/update-issue-status.py <issue_number> <status>
  
Status options:
  - in-progress: Mark issue as in progress
  - done: Mark issue as done (closes it)
"""

import sys
import subprocess
import os
from pathlib import Path

def get_github_token():
    """Get GitHub token from environment or config file."""
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        return token
    
    tokens_file = Path.home() / ".devbridge_tokens"
    if tokens_file.exists():
        try:
            with open(tokens_file, 'r') as f:
                for line in f:
                    if line.startswith("GITHUB_TOKEN="):
                        token = line.split("=", 1)[1].strip().strip('"\'')
                        if token and token != "ghp_your_token_here":
                            return token
        except Exception:
            pass
    
    return None

def update_issue_status(issue_number, status):
    """Update GitHub issue status."""
    repo = "iplixera/nivostack-monorepo"
    
    if status == "in-progress":
        # Add comment and add label if needed
        comment = "🔄 **Status: In Progress**\n\nStarting implementation..."
        subprocess.run([
            "gh", "issue", "comment", str(issue_number),
            "--repo", repo,
            "--body", comment
        ], check=False)
        print(f"✅ Issue #{issue_number} marked as in progress")
        
    elif status == "done":
        # Close the issue
        comment = "✅ **Status: Done**\n\nImplementation complete and merged to main."
        subprocess.run([
            "gh", "issue", "close", str(issue_number),
            "--repo", repo,
            "--comment", comment
        ], check=False)
        print(f"✅ Issue #{issue_number} marked as done (closed)")
    else:
        print(f"❌ Unknown status: {status}")
        print("Valid statuses: in-progress, done")
        sys.exit(1)

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 update-issue-status.py <issue_number> <status>")
        print("Status: in-progress | done")
        sys.exit(1)
    
    issue_number = sys.argv[1]
    status = sys.argv[2]
    
    token = get_github_token()
    if not token:
        # Try using gh CLI directly
        try:
            subprocess.run(["gh", "--version"], capture_output=True, check=True)
        except:
            print("❌ No GitHub token found and gh CLI not available")
            sys.exit(1)
    
    update_issue_status(issue_number, status)

if __name__ == "__main__":
    main()
