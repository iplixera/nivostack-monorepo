# Tracker Quick Start Guide

Quick reference for using the GitHub Issues tracker integration.

---

## Quick Commands

### 1. Add items to tracker
```bash
code docs/TRACKER_TESTING_UI.md
# Add items to the tables
```

### 2. Sync to GitHub Issues
```bash
./scripts/sync-tracker-to-github.sh
```

### 3. Create issue directly
```bash
./scripts/create-github-issue.sh "Title" "Description" "labels"
```

---

## Example Workflow

### Adding a Testing Task

1. **Edit tracker** (`docs/TRACKER_TESTING_UI.md`):
```markdown
| TEST-001 | Test login flow | Integration | P1 | :white_circle: Not Started | - | Need to test login with invalid credentials |
```

2. **Sync to GitHub**:
```bash
./scripts/sync-tracker-to-github.sh
```

3. **Result**: Issue created and tracker updated:
```markdown
| TEST-001 | Test login flow | Integration | P1 | :white_circle: Not Started | #123 | Need to test login with invalid credentials |
```

### Adding a UI Change

1. **Edit tracker**:
```markdown
| UI-001 | Fix button spacing | Dashboard | P1 | :white_circle: Not Started | - | Buttons are too close together |
```

2. **Sync**:
```bash
./scripts/sync-tracker-to-github.sh
```

---

## Status Emojis

- `:white_circle:` Not Started
- `:large_blue_circle:` In Progress
- `:green_circle:` Done
- `:red_circle:` Blocked

---

## Priority Levels

- **P0**: Critical (fix immediately)
- **P1**: High (fix soon)
- **P2**: Medium (fix when possible)
- **P3**: Low (nice to have)

---

## Troubleshooting

**GitHub CLI not installed?**
```bash
brew install gh
gh auth login
```

**Script fails?**
- Make sure you're in the repo root
- Check that `docs/TRACKER_TESTING_UI.md` exists
- Verify table format is correct (pipe-separated)

**Need help?**
See full documentation: `docs/GITHUB_ISSUES_TRACKER.md`

