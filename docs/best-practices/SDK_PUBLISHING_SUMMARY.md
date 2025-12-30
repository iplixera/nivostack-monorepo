# SDK Publishing Summary

**Quick Reference Guide for Publishing NivoStack SDKs**

---

## 📋 What You Need to Publish Flutter SDK v1.0.0

### 1. Prerequisites Checklist

- [ ] **pub.dev Account**: Sign up at [pub.dev](https://pub.dev) with Google account
- [ ] **Publisher Verification**: Verify your publisher account on pub.dev
- [ ] **Version Updated**: Set version to `1.0.0` in `packages/sdk-flutter/pubspec.yaml`
- [ ] **CHANGELOG Updated**: Add v1.0.0 entry to `packages/sdk-flutter/CHANGELOG.md`
- [ ] **Tests Passing**: Run `flutter test` and ensure all pass
- [ ] **Code Analyzed**: Run `flutter analyze` and fix any issues
- [ ] **Example App Tested**: Verify example app works correctly

### 2. Pre-Publish Steps

```bash
cd packages/sdk-flutter

# Check version
grep "version:" pubspec.yaml  # Should show: version: 1.0.0

# Run tests
flutter test

# Analyze code
flutter analyze

# Dry run (check for issues)
flutter pub publish --dry-run
```

### 3. Publish Command

```bash
cd packages/sdk-flutter

# Publish to pub.dev
flutter pub publish
```

**Note**: You'll be prompted to confirm. Type `y` to proceed.

### 4. Post-Publish Steps

- [ ] Verify package appears on [pub.dev/packages/nivostack_core](https://pub.dev/packages/nivostack_core)
- [ ] Test installation: `flutter pub add nivostack_core`
- [ ] Create GitHub release with tag `v1.0.0`
- [ ] Update documentation links

---

## 📋 What You Need to Publish Android SDK v1.0.0

### 1. Prerequisites Checklist

- [ ] **Maven Central Account**: Sign up at [Sonatype OSSRH](https://central.sonatype.com/)
- [ ] **GPG Key**: Generate GPG key for signing artifacts
- [ ] **Version Updated**: Set version to `1.0.0` in `packages/sdk-android/nivostack-core/build.gradle.kts`
- [ ] **Maven Publishing Configured**: Set up `publishing` block in `build.gradle.kts`
- [ ] **Credentials Configured**: Add Sonatype credentials to `~/.gradle/gradle.properties`

### 2. Setup Maven Publishing

Add to `packages/sdk-android/nivostack-core/build.gradle.kts`:

```kotlin
plugins {
    id("maven-publish")
    id("signing")
}

publishing {
    publications {
        create<MavenPublication>("release") {
            groupId = "com.plixera.nivostack"
            artifactId = "core"
            version = "1.0.0"
            // ... (see SDK_PUBLISHING_GUIDE.md for full config)
        }
    }
}
```

### 3. Configure Credentials

Add to `~/.gradle/gradle.properties`:

```properties
sonatypeUsername=your-username
sonatypePassword=your-password
signing.keyId=your-gpg-key-id
signing.password=your-gpg-password
signing.secretKeyRingFile=/path/to/secring.gpg
```

### 4. Publish Command

```bash
cd packages/sdk-android/nivostack-core

# Build and publish
./gradlew clean build publishReleasePublicationToSonatypeRepository

# Close and release staging repository (via Sonatype web UI)
```

---

## 📚 Documentation Created

All documentation is in the `docs/` directory:

1. **Release Notes**:
   - `docs/RELEASE_NOTES_FLUTTER_v1.0.0.md` - Flutter SDK release notes
   - `docs/RELEASE_NOTES_ANDROID_v1.0.0.md` - Android SDK release notes

2. **Versioning**:
   - `docs/SDK_VERSIONING_STRATEGY.md` - Versioning strategy and process

3. **Publishing**:
   - `docs/SDK_PUBLISHING_GUIDE.md` - Detailed publishing guide for all platforms

4. **Branching**:
   - `docs/BRANCHING_STRATEGY.md` - Branching strategy for long-term development

---

## 🚀 Quick Start: Publishing Flutter SDK

### Step 1: Update Version

```bash
cd packages/sdk-flutter
# Edit pubspec.yaml, set version: 1.0.0
```

### Step 2: Update CHANGELOG

```bash
# Edit CHANGELOG.md, add v1.0.0 section
```

### Step 3: Test

```bash
flutter test
flutter analyze
flutter pub publish --dry-run
```

### Step 4: Publish

```bash
flutter pub publish
```

### Step 5: Create GitHub Release

- Go to GitHub Releases
- Create release from tag `v1.0.0`
- Copy release notes from `docs/RELEASE_NOTES_FLUTTER_v1.0.0.md`

---

## 🔄 Version Management

### Current Versions

- **Flutter SDK**: `1.2.0` (development) → `1.0.0` (for initial public release)
- **Android SDK**: `1.0.0` (ready for release)

### Version Bump Process

1. Update version in `pubspec.yaml` (Flutter) or `build.gradle.kts` (Android)
2. Update `CHANGELOG.md`
3. Commit changes
4. Create release branch: `release/v1.0.0`
5. Tag release: `git tag v1.0.0`
6. Publish SDKs
7. Create GitHub release

See `docs/SDK_VERSIONING_STRATEGY.md` for details.

---

## 🌿 Branching Strategy

### For Long-Term Development

**Current Situation**: Working on `develop` branch for extended period

**Solution**: Use release branches frequently

```
develop (ongoing work)
├── release/v1.0.0 → main (stable release)
├── release/v1.1.0 → main (stable release)
└── release/v1.2.0 → main (stable release)
```

**Process**:
1. Work continuously on `develop`
2. When ready for release, create `release/v1.X.0` branch
3. Stabilize release branch (bug fixes only)
4. Merge to `main` and tag
5. Continue work on `develop`

See `docs/BRANCHING_STRATEGY.md` for complete guide.

---

## 📝 Standardized Release Process

### 1. Create Release Branch

```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
```

### 2. Update Versions

- Flutter: `packages/sdk-flutter/pubspec.yaml`
- Android: `packages/sdk-android/nivostack-core/build.gradle.kts`

### 3. Update CHANGELOG.md

Add release notes for v1.0.0

### 4. Commit and Push

```bash
git add .
git commit -m "chore: prepare release v1.0.0"
git push origin release/v1.0.0
```

### 5. Create PR and Merge

- Create PR: `release/v1.0.0` → `main`
- Review and approve
- Merge to `main`

### 6. Tag Release

```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 7. Publish SDKs

- Flutter: `flutter pub publish`
- Android: `./gradlew publishReleasePublicationToSonatypeRepository`

### 8. Create GitHub Release

- Use tag `v1.0.0`
- Copy release notes from `docs/RELEASE_NOTES_*.md`

### 9. Merge Back to Develop

```bash
git checkout develop
git merge release/v1.0.0
git push origin develop
```

---

## ❓ FAQ

### Q: Why start at v1.0.0 when Flutter SDK is already at 1.2.0?

**A**: v1.0.0 represents the **first public release**. Previous versions (1.1.0, 1.2.0) were internal/development versions. Starting at v1.0.0 for public release is standard practice.

### Q: Can I publish without a pub.dev account?

**A**: No, you need a verified pub.dev publisher account to publish packages.

### Q: How do I handle version conflicts?

**A**: Use release branches to stabilize versions before publishing. This allows continued development on `develop` while preparing stable releases.

### Q: What if I need to fix a bug after publishing?

**A**: Create a hotfix branch from `main`, fix the bug, release as `v1.0.1`, then merge back to `develop`.

---

## 📞 Support

For questions about publishing:
- Check `docs/SDK_PUBLISHING_GUIDE.md`
- Review platform-specific documentation
- Contact the team lead

---

## ✅ Next Steps

1. **Review Documentation**: Read all docs in `docs/` directory
2. **Set Up Accounts**: Create pub.dev and Maven Central accounts
3. **Prepare Release**: Follow standardized release process
4. **Publish**: Publish Flutter SDK first, then Android SDK
5. **Announce**: Create GitHub release and announce

Good luck with your first release! 🚀

