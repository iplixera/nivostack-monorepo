# Testing & UI Changes Tracker

**Purpose**: Track testing tasks and UI changes that need to be fixed or implemented later.

**Last Updated**: 2025-01-XX

---

## How to Use

1. Add items to the sections below
2. Run `./scripts/sync-tracker-to-github.sh` to create GitHub issues
3. Update status as you work on items
4. Issues will be synced back to this tracker

---

## Testing Tasks

| ID | Title | Category | Priority | Status | GitHub Issue | Notes |
|----|-------|----------|----------|--------|--------------|-------|

**Status Legend**:
- :white_circle: Not Started
- :large_blue_circle: In Progress  
- :green_circle: Done
- :red_circle: Blocked

---

## UI Changes

| ID | Title | Component | Priority | Status | GitHub Issue | Notes |
|----|-------|-----------|----------|--------|--------------|-------|

**Status Legend**:
- :white_circle: Not Started
- :large_blue_circle: In Progress
- :green_circle: Done
- :red_circle: Blocked

---

## Quick Add Template

### Testing Task
```markdown
| TEST-XXX | [Title] | [Category] | [P0/P1/P2] | :white_circle: Not Started | - | [Description] |
```

### UI Change
```markdown
| UI-XXX | [Title] | [Component] | [P0/P1/P2] | :white_circle: Not Started | - | [Description] |
```

---

## Notes

- Items without a GitHub Issue number will be created as new issues when syncing
- Update the GitHub Issue column after syncing
- Use the sync script to keep GitHub Issues in sync with this tracker

