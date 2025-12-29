# SDK Versioning Strategy

**Last Updated**: December 29, 2024  
**Status**: Active

---

## Overview

This document outlines the versioning strategy for all NivoStack SDKs in the monorepo. We use **Semantic Versioning (SemVer)** with a unified versioning approach across all platforms.

---

## Version Format

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR** (X.0.0): Breaking API changes that require code changes
- **MINOR** (x.Y.0): New features, backward compatible
- **PATCH** (x.y.Z): Bug fixes, backward compatible

**Examples**:
- `1.0.0` → `1.0.1`: Bug fix (backward compatible)
- `1.0.0` → `1.1.0`: New feature (backward compatible)
- `1.0.0` → `2.0.0`: Breaking change (requires migration)

---

## Unified Versioning Strategy

### Core Principle

**All SDKs share the same version number** for major and minor releases. This ensures:
- ✅ Consistent documentation
- ✅ Easier compatibility tracking
- ✅ Simplified support
- ✅ Unified release cycles

### Version Synchronization

```
v1.0.0 - All SDKs release together
├── Flutter SDK v1.0.0
├── Android SDK v1.0.0
├── iOS SDK v1.0.0 (future)
└── Web SDK v1.0.0 (future)
```

### Exception: Platform-Specific Hotfixes

Platform-specific critical bugs can use patch versions independently:

```
v1.0.0 → v1.0.1 (Android hotfix only)
v1.0.0 → v1.0.2 (Flutter hotfix only)
v1.1.0 → v1.1.1 (All SDKs sync to v1.1.1)
```

**Rule**: After a platform-specific hotfix, all SDKs should sync to the same patch version in the next release.

---

## Version File Locations

### Flutter SDK
- **File**: `packages/sdk-flutter/pubspec.yaml`
- **Field**: `version: 1.0.0`

### Android SDK
- **File**: `packages/sdk-android/nivostack-core/build.gradle.kts`
- **Field**: `version = "1.0.0"` (in `defaultConfig` or `version` block)

### Future SDKs
- **iOS**: `packages/sdk-ios/DevBridgeSDK.podspec` → `s.version = "1.0.0"`
- **Web**: `packages/sdk-web/package.json` → `"version": "1.0.0"`

---

## Version Bumping Process

### 1. Update Version Files

Update version in all SDK package files:

**Flutter** (`packages/sdk-flutter/pubspec.yaml`):
```yaml
version: 1.0.0
```

**Android** (`packages/sdk-android/nivostack-core/build.gradle.kts`):
```kotlin
version = "1.0.0"
```

### 2. Update CHANGELOG.md

Add a new section to `CHANGELOG.md`:

```markdown
## [1.0.0] - 2024-12-29

### Added
- Initial public release
- Feature X
- Feature Y

### Changed
- Improvement Z

### Fixed
- Bug fix A
```

### 3. Create Git Tag

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 4. Create GitHub Release

Create a release on GitHub with:
- **Tag**: `v1.0.0`
- **Title**: `v1.0.0 - Initial Public Release`
- **Description**: Copy from CHANGELOG.md
- **Assets**: Attach SDK artifacts (if applicable)

---

## Version Compatibility Matrix

| SDK Version | Dashboard Version | Breaking Changes |
|-------------|-------------------|------------------|
| 1.0.0       | 1.0.0+           | Initial release  |
| 1.1.0       | 1.1.0+           | None             |
| 2.0.0       | 2.0.0+           | Yes (see migration guide) |

---

## Pre-Release Versions

### Development Versions

For development/testing, use pre-release versions:

- **Alpha**: `1.0.0-alpha.1`, `1.0.0-alpha.2`
- **Beta**: `1.0.0-beta.1`, `1.0.0-beta.2`
- **RC**: `1.0.0-rc.1`, `1.0.0-rc.2`

**Example**:
```yaml
# Flutter
version: 1.0.0-beta.1

# Android
version = "1.0.0-beta.1"
```

### Snapshot Versions

For continuous integration builds:

- **Snapshot**: `1.0.0-SNAPSHOT`

**Note**: Snapshots are not published to public repositories.

---

## Release Schedule

### Major Releases (X.0.0)
- **Frequency**: As needed (breaking changes)
- **Process**: Full migration guide required
- **Support**: Previous major version supported for 6 months

### Minor Releases (x.Y.0)
- **Frequency**: Monthly or as features are ready
- **Process**: Feature documentation required
- **Support**: All minor versions within a major version supported

### Patch Releases (x.y.Z)
- **Frequency**: As bugs are fixed
- **Process**: Bug fix documentation required
- **Support**: Immediate release

---

## Versioning Scripts

### Automated Version Bump (Future)

Create `scripts/bump-version.sh`:

```bash
#!/bin/bash
# Usage: ./scripts/bump-version.sh 1.0.0

VERSION=$1

# Update Flutter
sed -i '' "s/version:.*/version: $VERSION/" packages/sdk-flutter/pubspec.yaml

# Update Android
sed -i '' "s/version =.*/version = \"$VERSION\"/" packages/sdk-android/nivostack-core/build.gradle.kts

# Update CHANGELOG.md (manual step)
echo "Don't forget to update CHANGELOG.md!"

# Create git tag
git add packages/sdk-flutter/pubspec.yaml packages/sdk-android/nivostack-core/build.gradle.kts
git commit -m "chore: bump version to $VERSION"
git tag -a v$VERSION -m "Release v$VERSION"
```

---

## Best Practices

### ✅ Do

- Always update CHANGELOG.md before releasing
- Test all SDKs before releasing
- Create GitHub releases with release notes
- Tag releases in git
- Document breaking changes in migration guides

### ❌ Don't

- Skip version numbers (1.0.0 → 1.0.2 without 1.0.1)
- Release without updating all SDK versions
- Forget to update documentation
- Release without testing

---

## Version History

| Version | Release Date | SDKs Released | Notes |
|---------|--------------|--------------|-------|
| 1.0.0   | 2024-12-29   | Flutter, Android | Initial public release |

---

## Questions?

For questions about versioning:
- Check this document
- Review [Semantic Versioning](https://semver.org/)
- Contact the team lead

