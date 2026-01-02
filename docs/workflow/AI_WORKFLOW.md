# AI Assistant Workflow - Issue Tracking

**Purpose**: This document explains how the AI assistant handles issue tracking automatically.

---

## Workflow Overview

When you mention issues to the AI assistant, it will:

1. ✅ **Add to local tracker** (`docs/TRACKER_TESTING_UI.md`)
2. ✅ **Create GitHub issue** automatically
3. ✅ **Update tracker** with issue number
4. ✅ **Report back** with issue ID and GitHub link

**You don't need to run any scripts** - just tell the AI about issues!

---

## How It Works

### For Testing Tasks

When you say something like:
- "I need to test the login API"
- "Add a test for URL shortener endpoints"
- "We should test QR code generation"

The AI will:
1. Add entry to tracker: `TEST-XXX`
2. Create GitHub issue with label `testing,integration`
3. Update tracker with issue number
4. Report: "Added TEST-004 to tracker and created GitHub issue #8"

### For UI Changes

When you say something like:
- "The button needs better styling"
- "Add a dashboard page for short links"
- "Improve the analytics visualization"

The AI will:
1. Add entry to tracker: `UI-XXX`
2. Create GitHub issue with label `ui,frontend`
3. Update tracker with issue number
4. Report: "Added UI-004 to tracker and created GitHub issue #9"

---

## What You Need to Do

### 1. Just Mention Issues

Simply tell the AI about issues in natural language:

```
"I need to test the new API endpoint"
"The dashboard page needs better mobile responsiveness"
"Add tests for the authentication flow"
```

### 2. Update Status When Done

When you fix an issue, just tell the AI:

```
"TEST-004 is done"
"UI-005 is complete"
"I finished issue #12"
```

The AI will update the tracker status to `:green_circle: Done`

---

## Issue Format

The AI automatically extracts:

- **Title**: From your description
- **Category/Component**: Inferred or defaults
- **Priority**: P1 (default), or you can specify P0/P2/P3
- **Notes**: Your full description

---

## Examples

### Example 1: Testing Task

**You say:**
> "I need to test the URL shortener API endpoints with various scenarios"

**AI does:**
- Adds `TEST-004` to tracker
- Creates GitHub issue #8: "[Testing] Test URL shortener API endpoints"
- Updates tracker with issue number
- Reports: "✅ Added TEST-004 to tracker and created GitHub issue #8"

### Example 2: UI Change

**You say:**
> "The dashboard needs a new page for managing short links"

**AI does:**
- Adds `UI-004` to tracker
- Creates GitHub issue #9: "[UI] Add short links management page"
- Updates tracker with issue number
- Reports: "✅ Added UI-004 to tracker and created GitHub issue #9"

### Example 3: Status Update

**You say:**
> "TEST-004 is done"

**AI does:**
- Updates tracker: Changes status to `:green_circle: Done`
- Reports: "✅ Updated TEST-004 status to Done"

---

## Priority Levels

- **P0**: Critical (fix immediately)
- **P1**: High (fix soon) - **Default**
- **P2**: Medium (fix when possible)
- **P3**: Low (nice to have)

You can specify priority:
- "This is a P0 issue - critical bug"
- "Low priority, P3"

---

## Status Updates

The AI can update status when you mention:

- "Done" / "Complete" / "Finished" → `:green_circle: Done`
- "In Progress" / "Working on" → `:large_blue_circle: In Progress`
- "Blocked" / "Can't proceed" → `:red_circle: Blocked`
- "Not Started" → `:white_circle: Not Started`

---

## Tracker File Location

All issues are tracked in:
- `docs/TRACKER_TESTING_UI.md`

The AI maintains this file automatically.

---

## GitHub Issues

All issues are created at:
- https://github.com/iplixera/nivostack-monorepo/issues

Issues are automatically labeled:
- Testing tasks: `testing`, `integration`
- UI changes: `ui`, `frontend`

---

## What the AI Handles

✅ Adding issues to tracker  
✅ Creating GitHub issues  
✅ Updating tracker with issue numbers  
✅ Updating status when you mention completion  
✅ Maintaining tracker file format  
✅ Generating unique IDs (TEST-XXX, UI-XXX)

---

## What You Do

✅ Mention issues in natural language  
✅ Tell the AI when issues are done  
✅ That's it! No scripts to run.

---

## Behind the Scenes

The AI uses:
- `scripts/add-issue-to-tracker.py` - Adds issues and creates GitHub issues
- `scripts/sync-tracker-to-github.py` - Syncs tracker to GitHub (fallback)
- `docs/TRACKER_TESTING_UI.md` - Local tracker file
- GitHub API - Creates issues via token authentication

---

## Summary

**You**: Just mention issues  
**AI**: Handles everything automatically  
**Result**: Issues tracked locally and on GitHub

No scripts to run, no manual steps - just tell the AI what needs to be done!

