#!/usr/bin/env python3
"""
Add Issue to Tracker and Create GitHub Issue

This script adds an issue to the tracker file and creates a GitHub issue automatically.
Designed for AI assistant to use when user mentions issues.
"""

import re
import sys
import os
from pathlib import Path
from datetime import datetime

# Import functions from sync script
# We need to import the module directly since it has dashes in filename
import importlib.util
sync_script_path = Path(__file__).parent / "sync-tracker-to-github.py"
spec = importlib.util.spec_from_file_location("sync_tracker_to_github", sync_script_path)
sync_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync_module)

# Import what we need
get_github_token = sync_module.get_github_token
check_github_access = sync_module.check_github_access
create_issue = sync_module.create_issue
REPO_OWNER = sync_module.REPO_OWNER
REPO_NAME = sync_module.REPO_NAME
LABELS_TESTING = sync_module.LABELS_TESTING
LABELS_UI = sync_module.LABELS_UI

TRACKER_FILE = "docs/TRACKER_TESTING_UI.md"

def get_next_id(tracker_path, prefix):
    """Get the next available ID for TEST-XXX or UI-XXX."""
    with open(tracker_path, 'r') as f:
        content = f.read()
    
    # Find all existing IDs
    pattern = rf'{prefix}-(\d+)'
    matches = re.findall(pattern, content)
    
    if matches:
        max_id = max(int(m) for m in matches)
        return f"{prefix}-{max_id + 1:03d}"
    else:
        return f"{prefix}-001"

def add_testing_task(title, category, priority, notes):
    """Add a testing task to tracker and create GitHub issue."""
    tracker_path = Path(TRACKER_FILE)
    if not tracker_path.exists():
        print(f"❌ Tracker file not found: {TRACKER_FILE}")
        return None
    
    # Get next ID
    item_id = get_next_id(tracker_path, "TEST")
    
    # Read tracker file
    with open(tracker_path, 'r') as f:
        lines = f.readlines()
    
    # Find the testing tasks table
    insert_line = None
    for i, line in enumerate(lines):
        if "| TEST-001 |" in line or "| TEST-002 |" in line:
            # Find the last TEST-XXX line
            for j in range(i, len(lines)):
                if lines[j].startswith("| TEST-") and "|" in lines[j]:
                    insert_line = j + 1
                elif insert_line and not lines[j].startswith("| TEST-") and "|" in lines[j] and not lines[j].startswith("|----"):
                    break
    
    if insert_line is None:
        # Find the table header and insert after first data row
        for i, line in enumerate(lines):
            if "| ID | Title | Category | Priority | Status | GitHub Issue | Notes |" in line:
                # Find first TEST- line
                for j in range(i+2, len(lines)):
                    if lines[j].startswith("| TEST-"):
                        insert_line = j + 1
                        break
                break
    
    if insert_line is None:
        print("❌ Could not find insertion point in tracker file")
        return None
    
    # Create new line
    status = ":white_circle: Not Started"
    new_line = f"| {item_id} | {title} | {category} | {priority} | {status} | - | {notes} |\n"
    
    # Insert line
    lines.insert(insert_line, new_line)
    
    # Write back
    with open(tracker_path, 'w') as f:
        f.writelines(lines)
    
    print(f"✅ Added {item_id} to tracker")
    
    # Create GitHub issue
    auth_method = check_github_access(dry_run=False)
    if auth_method:
        body = f"""**Type**: Testing Task
**Category**: {category}
**Priority**: {priority}
**Status**: {status}

**Description**:
{notes}

---
*Created from tracker: {item_id}*"""
        
        issue_title = f"[Testing] {title}"
        issue_number = create_issue(issue_title, body, LABELS_TESTING, auth_method=auth_method, dry_run=False)
        
        if issue_number:
            # Update tracker with issue number
            update_tracker_with_issue(tracker_path, item_id, issue_number, "testing")
            print(f"✅ Created GitHub issue #{issue_number}")
            return {"id": item_id, "issue_number": issue_number, "type": "testing"}
        else:
            print("⚠️  Added to tracker but failed to create GitHub issue")
            return {"id": item_id, "issue_number": None, "type": "testing"}
    else:
        print("⚠️  Added to tracker but no GitHub access (issue will be created on next sync)")
        return {"id": item_id, "issue_number": None, "type": "testing"}

def add_ui_change(title, component, priority, notes):
    """Add a UI change to tracker and create GitHub issue."""
    tracker_path = Path(TRACKER_FILE)
    if not tracker_path.exists():
        print(f"❌ Tracker file not found: {TRACKER_FILE}")
        return None
    
    # Get next ID
    item_id = get_next_id(tracker_path, "UI")
    
    # Read tracker file
    with open(tracker_path, 'r') as f:
        lines = f.readlines()
    
    # Find the UI changes table
    insert_line = None
    for i, line in enumerate(lines):
        if "| UI-001 |" in line or "| UI-002 |" in line:
            # Find the last UI-XXX line
            for j in range(i, len(lines)):
                if lines[j].startswith("| UI-") and "|" in lines[j]:
                    insert_line = j + 1
                elif insert_line and not lines[j].startswith("| UI-") and "|" in lines[j] and not lines[j].startswith("|----"):
                    break
    
    if insert_line is None:
        # Find the table header
        for i, line in enumerate(lines):
            if "| ID | Title | Component | Priority | Status | GitHub Issue | Notes |" in line:
                # Find first UI- line
                for j in range(i+2, len(lines)):
                    if lines[j].startswith("| UI-"):
                        insert_line = j + 1
                        break
                break
    
    if insert_line is None:
        print("❌ Could not find insertion point in tracker file")
        return None
    
    # Create new line
    status = ":white_circle: Not Started"
    new_line = f"| {item_id} | {title} | {component} | {priority} | {notes} | {status} | - |\n"
    
    # Fix: UI table has different column order
    new_line = f"| {item_id} | {title} | {component} | {priority} | {status} | - | {notes} |\n"
    
    # Insert line
    lines.insert(insert_line, new_line)
    
    # Write back
    with open(tracker_path, 'w') as f:
        f.writelines(lines)
    
    print(f"✅ Added {item_id} to tracker")
    
    # Create GitHub issue
    auth_method = check_github_access(dry_run=False)
    if auth_method:
        body = f"""**Type**: UI Change
**Component**: {component}
**Priority**: {priority}
**Status**: {status}

**Description**:
{notes}

---
*Created from tracker: {item_id}*"""
        
        issue_title = f"[UI] {title}"
        issue_number = create_issue(issue_title, body, LABELS_UI, auth_method=auth_method, dry_run=False)
        
        if issue_number:
            # Update tracker with issue number
            update_tracker_with_issue(tracker_path, item_id, issue_number, "ui")
            print(f"✅ Created GitHub issue #{issue_number}")
            return {"id": item_id, "issue_number": issue_number, "type": "ui"}
        else:
            print("⚠️  Added to tracker but failed to create GitHub issue")
            return {"id": item_id, "issue_number": None, "type": "ui"}
    else:
        print("⚠️  Added to tracker but no GitHub access (issue will be created on next sync)")
        return {"id": item_id, "issue_number": None, "type": "ui"}

def update_tracker_with_issue(tracker_path, item_id, issue_number, item_type):
    """Update tracker file with GitHub issue number."""
    with open(tracker_path, 'r') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if f"| {item_id} |" in line:
            # Replace "| - |" with "| #issue_number |"
            new_line = re.sub(r'\| - \|', f'| #{issue_number} |', line)
            lines[i] = new_line
            break
    
    with open(tracker_path, 'w') as f:
        f.writelines(lines)

def main():
    """Main function - can be called from command line or imported."""
    if len(sys.argv) < 2:
        print("Usage: add-issue-to-tracker.py <type> <title> [options]")
        print("  type: testing|ui")
        print("  title: Issue title")
        print("  options:")
        print("    --category <cat> (for testing)")
        print("    --component <comp> (for ui)")
        print("    --priority <P0|P1|P2|P3>")
        print("    --notes <description>")
        sys.exit(1)
    
    issue_type = sys.argv[1].lower()
    title = sys.argv[2] if len(sys.argv) > 2 else ""
    
    # Parse arguments
    category = "Integration"
    component = "Dashboard"
    priority = "P1"
    notes = ""
    
    i = 3
    while i < len(sys.argv):
        if sys.argv[i] == "--category" and i + 1 < len(sys.argv):
            category = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--component" and i + 1 < len(sys.argv):
            component = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--priority" and i + 1 < len(sys.argv):
            priority = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--notes" and i + 1 < len(sys.argv):
            notes = sys.argv[i + 1]
            i += 2
        else:
            i += 1
    
    if not title:
        print("❌ Title is required")
        sys.exit(1)
    
    if issue_type == "testing":
        result = add_testing_task(title, category, priority, notes)
    elif issue_type == "ui":
        result = add_ui_change(title, component, priority, notes)
    else:
        print(f"❌ Unknown issue type: {issue_type}")
        sys.exit(1)
    
    if result:
        print(f"\n✅ Issue added: {result['id']}")
        if result['issue_number']:
            print(f"   GitHub Issue: #{result['issue_number']}")
            print(f"   URL: https://github.com/{REPO_OWNER}/{REPO_NAME}/issues/{result['issue_number']}")

if __name__ == "__main__":
    main()

