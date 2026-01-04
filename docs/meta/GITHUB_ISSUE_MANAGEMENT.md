# GitHub Issue Management Guide

## Overview

This guide explains how to manage GitHub issues for the NivoStack project, including labeling, status tracking, and automation.

---

## Issue Status Workflow

### Status Rules

**Done = Merged to Main**
- When a PR is merged to `main`, associated issues are automatically closed
- Use PR body/title to link issues: `Closes #123` or `Fixes #456`
- GitHub Actions workflow handles automatic closing

### Status Labels (Optional)

You can add custom status labels to the project:
- `status:todo` - Not started
- `status:in-progress` - Currently being worked on
- `status:review` - In code review
- `status:done` - Merged to main (auto-closed)

---

## Labeling System

### Primary Labels

#### Type Labels
- `ui-ux` - UI/UX related work
- `data` - Data/backend/aggregation work
- `database` - Database schema/migrations
- `performance` - Performance optimization
- `feature` - New feature
- `bug` - Bug fix
- `documentation` - Documentation updates

#### Priority Labels
- `p0` - Critical (must fix immediately)
- `p1` - High priority
- `p2` - Medium priority
- `p3` - Low priority

#### Environment Labels
- `local` - Local development
- `production` - Production deployment
- `vercel` - Vercel-specific
- `infrastructure` - Infrastructure setup

#### Sequence Labels
- `seq-01`, `seq-02`, etc. - Implementation sequence
- `seq-agg-local-01` - Aggregation local step 1
- `seq-agg-prod-01` - Aggregation production step 1

#### Epic Labels
- `epic-foundation` - Foundation work
- `epic-components` - Component work
- `epic-dashboard` - Dashboard work
- `epic-runtime` - Runtime/observability work
- `epic-control` - Control plane work
- `epic-aggregation` - Aggregation work

#### Touchpoint Labels
- `touchpoint:devices` - Devices page
- `touchpoint:api-traces` - API Traces page
- `touchpoint:dashboard` - Dashboard page
- `touchpoint:live-debug` - Live Debug page

---

## Creating Issues

### From CSV Files

Use the script to create issues from CSV:
```bash
python3 scripts/github/create-aggregate-tickets.py <csv-file>
```

### Manually

Use GitHub CLI:
```bash
gh issue create \
  --title "[DATA] Local: Step 1 - Add Redis" \
  --body "Description here" \
  --label "data,aggregation,local,p1,seq-agg-local-01"
```

### Linking to Project Board

Issues are automatically added to Project #3 when created via the script.

---

## Updating Issue Status

### Automatic (Recommended)

When merging a PR, include in PR body:
```
Closes #123
Fixes #456
```

The GitHub Actions workflow will automatically:
1. Extract issue numbers from PR
2. Add comment to issues
3. Close the issues

### Manual

```bash
# Close issue with comment
gh issue close 123 \
  --comment "Completed and merged to main"

# Or use the script
./scripts/github/update-issue-on-merge.sh 123 456 "https://github.com/..."
```

---

## Implementation Sequence

### UI/UX First (Steps 1-6)
1. ✅ Global Design System + IA
2. ✅ Data UX Contract
3. ✅ Theme Tokens
4. ✅ Reusable Components
5. ✅ Devices Page
6. ✅ Live Debug Page

### Then Aggregation (Steps 7+)
7. ✅ Database schemas
8. ✅ Aggregation layer
9. ✅ Dashboard integration

### Local Development First
- Complete all local aggregation steps (#86-#97)
- Test thoroughly
- Then move to production steps (#98-#103)

---

## Project Board Organization

### Columns (Recommended)
1. **Backlog** - New issues
2. **To Do** - Ready to start
3. **In Progress** - Currently being worked on
4. **Review** - In code review
5. **Done** - Merged to main

### Filtering
- Filter by label: `label:data` or `label:ui-ux`
- Filter by priority: `label:p1`
- Filter by sequence: `label:seq-01`

---

## Best Practices

1. **Always Link PRs to Issues**
   - Use `Closes #123` in PR body
   - This ensures automatic status updates

2. **Use Descriptive Labels**
   - Multiple labels are fine
   - Helps filtering and organization

3. **Follow Sequence Labels**
   - Work in order (seq-01, seq-02, etc.)
   - Prevents blocking dependencies

4. **Update Status Regularly**
   - Move issues across board columns
   - Add comments for progress

5. **Close When Done**
   - Issues auto-close on merge
   - Or manually close when complete

---

## Automation

### GitHub Actions Workflow

The `.github/workflows/close-issue-on-merge.yml` workflow:
- Triggers on PR merge
- Extracts issue numbers from PR
- Adds comment to issues
- Closes issues automatically

### Manual Scripts

- `scripts/github/create-aggregate-tickets.py` - Create issues from CSV
- `scripts/github/update-issue-on-merge.sh` - Manually update issue status

---

## Summary

✅ **Issue Status**: Done = Merged to main (automatic)
✅ **Labeling**: Use multiple labels (type, priority, environment, sequence)
✅ **Sequence**: Follow implementation order (UI first, then aggregation)
✅ **Automation**: GitHub Actions handles status updates
✅ **Project Board**: Organize by columns and filter by labels

