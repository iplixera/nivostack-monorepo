# Release Tag Management Guide

This guide explains how to safely create and manage release tags for NivoStack projects.

## Quick Start

Use the helper script to manage release tags:

```bash
# Create or update a release tag
bash scripts/manage-release-tag.sh v1.0.0 "Release Android SDK v1.0.0"
```

## Manual Tag Management

### Creating a New Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release message"

# Push to remote
git push origin v1.0.0
```

### Updating an Existing Tag

**Important**: Git doesn't allow overwriting tags automatically. You must delete first.

#### Option 1: Delete and Recreate (Recommended for Releases)

```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Create new tag
git tag -a v1.0.0 -m "Updated release message"

# Push new tag
git push origin v1.0.0
```

#### Option 2: Force Overwrite (Use with Caution)

```bash
# Force overwrite local tag
git tag -f -a v1.0.0 -m "Updated release message"

# Force push to remote (⚠️ Dangerous if others are using the tag)
git push -f origin v1.0.0
```

## Best Practices

### ✅ Do:
- Use semantic versioning (v1.0.0, v1.1.0, v2.0.0)
- Use annotated tags (`-a` flag) for releases
- Write descriptive tag messages
- Delete and recreate tags for releases (don't force push)
- Tag from the correct branch (usually `main`)

### ❌ Don't:
- Force push tags that others might be using
- Create tags with uncommitted changes (unless intentional)
- Use lightweight tags for releases (use annotated tags)
- Tag from feature branches (tag from `main` or `develop`)

## Current Workflow

Since we've been fixing issues directly on `main`:

1. **Make fixes on main branch**
2. **Commit changes**
3. **Use the script to manage tags**:
   ```bash
   bash scripts/manage-release-tag.sh v1.0.0 "Release Android SDK v1.0.0"
   ```
4. **The script will**:
   - Check for uncommitted changes
   - Ask before deleting existing tags
   - Create the tag safely
   - Push to remote

## Tag Naming Convention

- **Format**: `v<major>.<minor>.<patch>`
- **Examples**:
  - `v1.0.0` - Initial release
  - `v1.1.0` - Minor feature release
  - `v1.0.1` - Patch release
  - `v2.0.0` - Major release

## Checking Tags

```bash
# List all tags
git tag

# Show tag details
git show v1.0.0

# List tags with messages
git tag -l -n9

# Check if tag exists
git rev-parse v1.0.0
```

## Troubleshooting

### "Tag already exists" Error

If you get `fatal: tag 'v1.0.0' already exists`:

1. Delete the local tag: `git tag -d v1.0.0`
2. Delete the remote tag: `git push origin :refs/tags/v1.0.0`
3. Create new tag: `git tag -a v1.0.0 -m "Message"`

### "Failed to push tag" Error

If remote tag exists:

1. Delete remote tag: `git push origin :refs/tags/v1.0.0`
2. Push again: `git push origin v1.0.0`

Or use force push (⚠️ only if safe):
```bash
git push -f origin v1.0.0
```

## Related Files

- `scripts/manage-release-tag.sh` - Helper script for tag management
- `jitpack.yml` - JitPack configuration (uses tags for builds)
- `packages/sdk-android/nivostack-core/gradle.properties` - SDK version

