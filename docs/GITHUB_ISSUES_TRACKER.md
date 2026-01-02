# GitHub Issues Tracker Integration

This document explains how to use the GitHub Issues tracker integration for managing testing tasks and UI changes.

---

## Overview

The tracker system allows you to:
1. Maintain a local markdown tracker file (`docs/TRACKER_TESTING_UI.md`)
2. Automatically sync items to GitHub Issues
3. Keep track of testing tasks and UI changes in one place

---

## Setup

### 1. Install GitHub CLI

If you haven't already, install GitHub CLI:

```bash
# macOS
brew install gh

# Or use the setup script
./setup-github-cli.sh
```

### 2. Authenticate

```bash
gh auth login
```

Follow the prompts to authenticate with GitHub.

### 3. Verify Access

```bash
gh repo view iplixera/nivostack-monorepo
```

---

## Usage

### Adding Items to Tracker

Edit `docs/TRACKER_TESTING_UI.md` and add items to the tables:

#### Testing Task Example:
```markdown
| TEST-002 | Fix API endpoint timeout | Integration | P1 | :white_circle: Not Started | - | The /api/sessions endpoint times out after 30s |
```

#### UI Change Example:
```markdown
| UI-002 | Improve button contrast | Dashboard | P1 | :white_circle: Not Started | - | Submit buttons need better color contrast for accessibility |
```

### Syncing to GitHub Issues

Run the sync script to create GitHub issues for items without issue numbers:

```bash
./scripts/sync-tracker-to-github.sh
```

This will:
- Scan the tracker file for items without GitHub issue numbers
- Create GitHub issues for those items
- Update the tracker file with the issue numbers
- Add appropriate labels (testing, ui, etc.)

### Creating Issues Directly

You can also create issues directly without adding to the tracker first:

```bash
# Interactive mode
./scripts/create-github-issue.sh

# With arguments
./scripts/create-github-issue.sh "Fix button styling" "The submit button needs better contrast" "ui,frontend"
```

---

## Tracker File Format

The tracker file uses markdown tables with the following columns:

### Testing Tasks Table
- **ID**: Unique identifier (TEST-XXX)
- **Title**: Brief description
- **Category**: Type of test (Integration, Unit, E2E, etc.)
- **Priority**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Status**: :white_circle: Not Started, :large_blue_circle: In Progress, :green_circle: Done, :red_circle: Blocked
- **GitHub Issue**: Issue number (auto-filled after sync) or `-` if not created yet
- **Notes**: Detailed description

### UI Changes Table
- **ID**: Unique identifier (UI-XXX)
- **Title**: Brief description
- **Component**: Affected component/page
- **Priority**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Status**: :white_circle: Not Started, :large_blue_circle: In Progress, :green_circle: Done, :red_circle: Blocked
- **GitHub Issue**: Issue number (auto-filled after sync) or `-` if not created yet
- **Notes**: Detailed description

---

## Workflow

### Recommended Workflow

1. **Add items to tracker** as you discover them
   ```bash
   # Edit tracker file
   code docs/TRACKER_TESTING_UI.md
   ```

2. **Sync to GitHub** periodically
   ```bash
   ./scripts/sync-tracker-to-github.sh
   ```

3. **Work on items** and update status in tracker
   ```markdown
   | TEST-001 | ... | ... | P1 | :large_blue_circle: In Progress | #123 | ... |
   ```

4. **Mark as done** when complete
   ```markdown
   | TEST-001 | ... | ... | P1 | :green_circle: Done | #123 | ... |
   ```

5. **Close GitHub issue** when done
   ```bash
   gh issue close 123 --comment "Completed"
   ```

---

## GitHub Labels

The sync script automatically adds labels:
- **Testing tasks**: `testing`, `integration`
- **UI changes**: `ui`, `frontend`

You can customize labels in `scripts/sync-tracker-to-github.sh`:
```bash
LABELS_TESTING="testing,integration"
LABELS_UI="ui,frontend"
```

---

## Troubleshooting

### GitHub CLI not found
```bash
brew install gh
gh auth login
```

### Authentication failed
```bash
gh auth login
# Follow prompts
```

### Repository access denied
Make sure you have access to `iplixera/nivostack-monorepo`:
```bash
gh repo view iplixera/nivostack-monorepo
```

### Sync script fails
- Check that the tracker file exists: `docs/TRACKER_TESTING_UI.md`
- Verify the table format is correct (pipe-separated)
- Check that items without issues have `-` in the GitHub Issue column

---

## Examples

### Example: Adding a Testing Task

1. Edit `docs/TRACKER_TESTING_UI.md`:
```markdown
| TEST-003 | Test session creation API | Integration | P1 | :white_circle: Not Started | - | Need to test POST /api/sessions with various payloads |
```

2. Run sync:
```bash
./scripts/sync-tracker-to-github.sh
```

3. Tracker is updated:
```markdown
| TEST-003 | Test session creation API | Integration | P1 | :white_circle: Not Started | #456 | Need to test POST /api/sessions with various payloads |
```

4. View issue:
```bash
gh issue view 456
```

### Example: Quick Issue Creation

```bash
./scripts/create-github-issue.sh \
  "Fix mobile responsive layout" \
  "The dashboard breaks on mobile devices below 768px width" \
  "ui,frontend,bug"
```

---

## Tips

- **Keep tracker updated**: Sync regularly to keep GitHub Issues in sync
- **Use consistent IDs**: Follow TEST-XXX and UI-XXX format
- **Add context**: Include enough detail in Notes column for future reference
- **Update status**: Keep status emojis updated as you work
- **Link related issues**: Reference related issues in Notes column

---

## Scripts Reference

### `sync-tracker-to-github.sh`
Syncs tracker file to GitHub Issues. Creates issues for items without issue numbers.

**Usage:**
```bash
./scripts/sync-tracker-to-github.sh
```

### `create-github-issue.sh`
Creates a GitHub issue directly from command line.

**Usage:**
```bash
./scripts/create-github-issue.sh "Title" "Description" "labels"
```

---

## Related Files

- `docs/TRACKER_TESTING_UI.md` - Main tracker file
- `scripts/sync-tracker-to-github.sh` - Sync script
- `scripts/create-github-issue.sh` - Direct issue creation script
- `setup-github-cli.sh` - GitHub CLI setup script

