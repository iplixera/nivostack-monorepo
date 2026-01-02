#!/usr/bin/env python3
"""
Sync Tracker to GitHub Issues

This script reads the tracker file and creates/updates GitHub issues
for items that don't have a GitHub issue number yet.
"""

import re
import subprocess
import sys
import os
import json
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode

# Configuration
TRACKER_FILE = "docs/TRACKER_TESTING_UI.md"
REPO_OWNER = "iplixera"
REPO_NAME = "nivostack-monorepo"
LABELS_TESTING = "testing,integration"
LABELS_UI = "ui,frontend"
GITHUB_API_BASE = "https://api.github.com"

def get_github_token():
    """Get GitHub token from environment variable or config file."""
    # Check environment variable first
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        return token
    
    # Check ~/.devbridge_tokens file
    tokens_file = Path.home() / ".devbridge_tokens"
    if tokens_file.exists():
        try:
            with open(tokens_file, 'r') as f:
                for line in f:
                    if line.startswith("GITHUB_TOKEN="):
                        token = line.split("=", 1)[1].strip()
                        # Remove quotes if present
                        token = token.strip('"\'')
                        if token and token != "ghp_your_token_here":
                            return token
        except Exception as e:
            print(f"⚠️  Could not read token file: {e}")
    
    return None

def check_github_access(dry_run=False):
    """Check if we have access to GitHub (via CLI or token)."""
    if dry_run:
        return True  # Skip check in dry-run mode
    
    # First, try to get token
    token = get_github_token()
    
    # Try GitHub CLI if available
    try:
        result = subprocess.run(["gh", "--version"], capture_output=True, text=True, timeout=2)
        if result.returncode == 0:
            # Check if authenticated
            auth_result = subprocess.run(["gh", "auth", "status"], capture_output=True, text=True, timeout=2)
            if auth_result.returncode == 0:
                print("✅ Using GitHub CLI for authentication")
                return "cli"
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    
    # Try token-based authentication
    if token:
        # Test token by making an API call
        try:
            req = Request(f"{GITHUB_API_BASE}/user")
            req.add_header("Authorization", f"token {token}")
            req.add_header("Accept", "application/vnd.github.v3+json")
            
            with urlopen(req, timeout=5) as response:
                if response.status == 200:
                    user_data = json.loads(response.read().decode())
                    print(f"✅ Using GitHub token (authenticated as: {user_data.get('login', 'unknown')})")
                    return "token"
                else:
                    print(f"⚠️  Token authentication failed: {response.status}")
        except HTTPError as e:
            print(f"⚠️  Token authentication failed: {e.code}")
        except Exception as e:
            print(f"⚠️  Error testing token: {e}")
    
    # No access method found
    print("❌ No GitHub access method found")
    print("\nOptions:")
    print("1. Install GitHub CLI: brew install gh && gh auth login")
    print("2. Set GITHUB_TOKEN environment variable")
    print("3. Add GITHUB_TOKEN to ~/.devbridge_tokens file")
    return None

def create_issue(title, body, labels, auth_method="cli", dry_run=False):
    """Create a GitHub issue and return the issue number."""
    if dry_run:
        # Simulate issue creation in dry-run mode
        import random
        fake_issue_number = str(random.randint(1000, 9999))
        print(f"🔍 [DRY RUN] Would create issue #{fake_issue_number}")
        print(f"   Title: {title}")
        print(f"   Labels: {labels}")
        print(f"   Body preview: {body[:100]}...")
        return fake_issue_number
    
    # Try GitHub API with token first (more reliable)
    token = get_github_token()
    if token and auth_method in ("token", None):
        return create_issue_via_api(title, body, labels, token)
    
    # Fallback to GitHub CLI
    if auth_method == "cli":
        return create_issue_via_cli(title, body, labels)
    
    print("❌ No authentication method available")
    return None

def create_issue_via_api(title, body, labels, token):
    """Create issue using GitHub API."""
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    
    # Parse labels (comma-separated string)
    label_list = [l.strip() for l in labels.split(",")]
    
    data = {
        "title": title,
        "body": body,
        "labels": label_list
    }
    
    try:
        req = Request(url)
        req.add_header("Authorization", f"token {token}")
        req.add_header("Accept", "application/vnd.github.v3+json")
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(data).encode('utf-8')
        req.method = "POST"
        
        with urlopen(req, timeout=10) as response:
            if response.status == 201:
                issue_data = json.loads(response.read().decode())
                issue_number = str(issue_data["number"])
                print(f"✅ Created issue #{issue_number}")
                return issue_number
            else:
                error_body = response.read().decode()
                print(f"❌ Failed to create issue: {response.status}")
                print(f"   Response: {error_body[:200]}")
                return None
    except HTTPError as e:
        error_body = e.read().decode() if hasattr(e, 'read') else str(e)
        print(f"❌ Failed to create issue: {e.code}")
        print(f"   Response: {error_body[:200]}")
        return None
    except Exception as e:
        print(f"❌ Error creating issue via API: {e}")
        return None

def create_issue_via_cli(title, body, labels):
    """Create issue using GitHub CLI."""
    try:
        cmd = [
            "gh", "issue", "create",
            "--repo", f"{REPO_OWNER}/{REPO_NAME}",
            "--title", title,
            "--body", body,
            "--label", labels
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Failed to create issue: {title}")
            print(result.stderr)
            return None
        
        # Extract issue number from output
        output = result.stdout.strip()
        match = re.search(r'/issues/(\d+)', output)
        if match:
            issue_number = match.group(1)
            print(f"✅ Created issue #{issue_number}")
            return issue_number
        else:
            print(f"❌ Could not extract issue number from: {output}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating issue via CLI: {e}")
        return None

def parse_table_line(line):
    """Parse a markdown table line and return fields."""
    # Remove leading/trailing whitespace and split by |
    parts = [p.strip() for p in line.split('|')]
    # Remove empty first/last elements
    if parts and parts[0] == '':
        parts = parts[1:]
    if parts and parts[-1] == '':
        parts = parts[:-1]
    return parts

def update_tracker_file(file_path, item_id, issue_number, item_type):
    """Update the tracker file with the GitHub issue number."""
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
        
        updated = False
        for i, line in enumerate(lines):
            # Check if this is a testing task or UI change line
            if item_type == "testing" and f"| {item_id} |" in line:
                # Replace "| - |" with "| #issue_number |"
                new_line = re.sub(
                    r'\| - \|',
                    f'| #{issue_number} |',
                    line
                )
                if new_line != line:
                    lines[i] = new_line
                    updated = True
                    break
            elif item_type == "ui" and f"| {item_id} |" in line:
                # Replace "| - |" with "| #issue_number |"
                new_line = re.sub(
                    r'\| - \|',
                    f'| #{issue_number} |',
                    line
                )
                if new_line != line:
                    lines[i] = new_line
                    updated = True
                    break
        
        if updated:
            with open(file_path, 'w') as f:
                f.writelines(lines)
            return True
        else:
            print(f"⚠️  Could not update tracker for {item_id}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating tracker file: {e}")
        return False

def main():
    """Main function."""
    # Check for dry-run flag
    dry_run = "--dry-run" in sys.argv or "--test" in sys.argv
    
    if dry_run:
        print("🔍 DRY RUN MODE - No issues will be created")
        print("=" * 50)
    
    print("🚀 Syncing Tracker to GitHub Issues")
    print("=" * 35)
    print(f"\nRepository: {REPO_OWNER}/{REPO_NAME}")
    print(f"Tracker: {TRACKER_FILE}")
    print()
    
    # Check prerequisites (skip in dry-run mode)
    auth_method = check_github_access(dry_run=dry_run)
    if not auth_method and not dry_run:
        sys.exit(1)
    elif not auth_method and dry_run:
        print("⚠️  GitHub access not available, but continuing in dry-run mode...\n")
    
    # Check if tracker file exists
    tracker_path = Path(TRACKER_FILE)
    if not tracker_path.exists():
        print(f"❌ Tracker file not found: {TRACKER_FILE}")
        sys.exit(1)
    
    # Read tracker file
    with open(tracker_path, 'r') as f:
        content = f.read()
    
    # Find testing tasks without GitHub issues
    testing_pattern = r'^\| (TEST-\d+) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| - \| (.+?) \|'
    testing_matches = re.finditer(testing_pattern, content, re.MULTILINE)
    
    # Find UI changes without GitHub issues
    ui_pattern = r'^\| (UI-\d+) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| - \| (.+?) \|'
    ui_matches = re.finditer(ui_pattern, content, re.MULTILINE)
    
    testing_items = list(testing_matches)
    ui_items = list(ui_matches)
    
    print(f"📋 Scanning tracker file...")
    print(f"Found {len(testing_items)} testing tasks without GitHub issues")
    print(f"Found {len(ui_items)} UI changes without GitHub issues")
    print()
    
    if len(testing_items) == 0 and len(ui_items) == 0:
        print("✅ All items already have GitHub issues")
        return
    
    # Process testing tasks
    if testing_items:
        print("📝 Processing testing tasks...")
        for match in testing_items:
            item_id = match.group(1)
            title = match.group(2)
            category = match.group(3)
            priority = match.group(4)
            status = match.group(5)
            notes = match.group(6)
            
            body = f"""**Type**: Testing Task
**Category**: {category}
**Priority**: {priority}
**Status**: {status}

**Description**:
{notes}

---
*Created from tracker: {item_id}*"""
            
            issue_title = f"[Testing] {title}"
            issue_number = create_issue(issue_title, body, LABELS_TESTING, auth_method=auth_method, dry_run=dry_run)
            
            if issue_number:
                if not dry_run:
                    update_tracker_file(tracker_path, item_id, issue_number, "testing")
                    print(f"   Updated tracker with issue #{issue_number}\n")
                else:
                    print(f"   [DRY RUN] Would update tracker with issue #{issue_number}\n")
    
    # Process UI changes
    if ui_items:
        print("🎨 Processing UI changes...")
        for match in ui_items:
            item_id = match.group(1)
            title = match.group(2)
            component = match.group(3)
            priority = match.group(4)
            status = match.group(5)
            notes = match.group(6)
            
            body = f"""**Type**: UI Change
**Component**: {component}
**Priority**: {priority}
**Status**: {status}

**Description**:
{notes}

---
*Created from tracker: {item_id}*"""
            
            issue_title = f"[UI] {title}"
            issue_number = create_issue(issue_title, body, LABELS_UI, auth_method=auth_method, dry_run=dry_run)
            
            if issue_number:
                if not dry_run:
                    update_tracker_file(tracker_path, item_id, issue_number, "ui")
                    print(f"   Updated tracker with issue #{issue_number}\n")
                else:
                    print(f"   [DRY RUN] Would update tracker with issue #{issue_number}\n")
    
    if dry_run:
        print("✅ Dry run complete! No issues were created.")
        print("\nTo create issues for real, run without --dry-run flag:")
        print("  ./scripts/sync-tracker-to-github.sh")
    else:
        print("✅ Sync complete!")
        print(f"\nView issues at: https://github.com/{REPO_OWNER}/{REPO_NAME}/issues")

if __name__ == "__main__":
    main()

