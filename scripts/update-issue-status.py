#!/usr/bin/env python3
"""
Update Issue Status in Tracker

Updates the status of an issue in the tracker file.
"""

import re
import sys
from pathlib import Path

TRACKER_FILE = "docs/TRACKER_TESTING_UI.md"

STATUS_MAP = {
    "done": ":green_circle: Done",
    "complete": ":green_circle: Done",
    "finished": ":green_circle: Done",
    "in progress": ":large_blue_circle: In Progress",
    "working": ":large_blue_circle: In Progress",
    "blocked": ":red_circle: Blocked",
    "not started": ":white_circle: Not Started",
}

def update_status(item_id, new_status):
    """Update status of an issue in the tracker."""
    tracker_path = Path(TRACKER_FILE)
    if not tracker_path.exists():
        print(f"❌ Tracker file not found: {TRACKER_FILE}")
        return False
    
    # Normalize status
    status_lower = new_status.lower()
    if status_lower in STATUS_MAP:
        status_emoji = STATUS_MAP[status_lower]
    else:
        # Try to match partial
        for key, value in STATUS_MAP.items():
            if key in status_lower:
                status_emoji = value
                break
        else:
            print(f"❌ Unknown status: {new_status}")
            return False
    
    # Read tracker file
    with open(tracker_path, 'r') as f:
        lines = f.readlines()
    
    # Find and update the line
    updated = False
    for i, line in enumerate(lines):
        if f"| {item_id} |" in line:
            # Update status (5th column)
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 6:
                parts[5] = status_emoji
                new_line = "| " + " | ".join(parts[1:-1]) + " |\n"
                lines[i] = new_line
                updated = True
                break
    
    if updated:
        # Write back
        with open(tracker_path, 'w') as f:
            f.writelines(lines)
        print(f"✅ Updated {item_id} status to {status_emoji}")
        return True
    else:
        print(f"❌ Could not find {item_id} in tracker")
        return False

def main():
    """Main function."""
    if len(sys.argv) < 3:
        print("Usage: update-issue-status.py <item_id> <status>")
        print("  item_id: TEST-XXX or UI-XXX or #issue_number")
        print("  status: done|in progress|blocked|not started")
        sys.exit(1)
    
    item_id = sys.argv[1]
    status = sys.argv[2]
    
    # If item_id is an issue number, find the corresponding item
    if item_id.startswith("#"):
        issue_number = item_id[1:]
        # Read tracker to find item with this issue number
        tracker_path = Path(TRACKER_FILE)
        with open(tracker_path, 'r') as f:
            content = f.read()
        
        # Find line with this issue number
        for line in content.split('\n'):
            if f"| #{issue_number} |" in line:
                # Extract item ID
                parts = [p.strip() for p in line.split('|')]
                if len(parts) >= 2:
                    item_id = parts[1]
                    break
        else:
            print(f"❌ Could not find issue #{issue_number} in tracker")
            sys.exit(1)
    
    update_status(item_id, status)

if __name__ == "__main__":
    main()

