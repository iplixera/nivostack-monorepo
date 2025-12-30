# SDK Publishing Guide

**Last Updated**: December 29, 2024  
**Status**: Active

---

## Overview

This guide explains how to publish NivoStack SDKs to their respective package repositories. Each platform has its own publishing process and requirements.

---

## Prerequisites

### General Requirements

- ✅ All tests passing
- ✅ CHANGELOG.md updated
- ✅ Version bumped in all SDK files
- ✅ Documentation updated
- ✅ Example apps tested
- ✅ Git tag created

### Platform-Specific Accounts

- **Flutter**: [pub.dev](https://pub.dev) account (Google account)
- **Android**: Maven Central account (Sonatype OSSRH)
- **iOS**: CocoaPods account (future)
- **Web**: npm account (future)

---

## Flutter SDK Publishing

### 1. Prerequisites

- [pub.dev](https://pub.dev) account
- `pub` CLI installed: `dart pub global activate pub`
- Verified publisher account

### 2. Pre-Publish Checklist

```bash
cd packages/sdk-flutter

# ✅ Check version
grep "version:" pubspec.yaml

# ✅ Run tests
flutter test

# ✅ Analyze code
flutter analyze

# ✅ Check for issues
flutter pub publish --dry-run
```

### 3. Publish to pub.dev

```bash
cd packages/sdk-flutter

# Dry run first
flutter pub publish --dry-run

# Publish (requires confirmation)
flutter pub publish
```

### 4. Verify Publication

- Check [pub.dev/packages/nivostack_core](https://pub.dev/packages/nivostack_core)
- Verify version appears
- Test installation: `flutter pub add nivostack_core`

### 5. Post-Publish

- ✅ Create GitHub release
- ✅ Update documentation links
- ✅ Announce on social media/forums

---

## Android SDK Publishing

### 1. Prerequisites

- Sonatype OSSRH account (for Maven Central)
- GPG key for signing
- Maven credentials configured

### 2. Setup Maven Publishing

**File**: `packages/sdk-android/nivostack-core/build.gradle.kts`

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

            from(components["release"])

            pom {
                name.set("NivoStack Core SDK")
                description.set("NivoStack Core SDK for Android")
                url.set("https://github.com/nivostack/nivostack-monorepo")
                
                licenses {
                    license {
                        name.set("Proprietary")
                        url.set("https://nivostack.com/license")
                    }
                }
                
                developers {
                    developer {
                        id.set("nivostack")
                        name.set("NivoStack Team")
                        email.set("support@nivostack.com")
                    }
                }
                
                scm {
                    connection.set("scm:git:git://github.com/nivostack/nivostack-monorepo.git")
                    developerConnection.set("scm:git:ssh://github.com:nivostack/nivostack-monorepo.git")
                    url.set("https://github.com/nivostack/nivostack-monorepo")
                }
            }
        }
    }
    
    repositories {
        maven {
            name = "sonatype"
            url = uri("https://s01.oss.sonatype.org/service/local/staging/deploy/maven2/")
            credentials {
                username = project.findProperty("sonatypeUsername") as String?
                password = project.findProperty("sonatypePassword") as String?
            }
        }
    }
}

signing {
    sign(publishing.publications["release"])
}
```

### 3. Configure Credentials

**File**: `~/.gradle/gradle.properties`

```properties
sonatypeUsername=your-username
sonatypePassword=your-password
signing.keyId=your-gpg-key-id
signing.password=your-gpg-password
signing.secretKeyRingFile=/path/to/secring.gpg
```

### 4. Build and Publish

```bash
cd packages/sdk-android/nivostack-core

# Build release AAR
./gradlew clean build

# Publish to staging
./gradlew publishReleasePublicationToSonatypeRepository

# Close and release staging repository
# (Use Sonatype web UI or Nexus REST API)
```

### 5. Verify Publication

- Check [Maven Central](https://search.maven.org/search?q=g:com.plixera.nivostack)
- Verify coordinates: `com.plixera.nivostack:core:1.0.0`
- Test installation in a sample project

---

## GitHub Releases

### Creating a Release

1. Go to [GitHub Releases](https://github.com/nivostack/nivostack-monorepo/releases)
2. Click "Draft a new release"
3. Fill in:
   - **Tag**: `v1.0.0` (create new tag)
   - **Title**: `v1.0.0 - Initial Public Release`
   - **Description**: Copy from CHANGELOG.md
   - **Assets**: Attach SDK artifacts (optional)

### Release Notes Template

```markdown
## 🎉 Release v1.0.0

### What's New
- Feature X
- Feature Y
- Improvement Z

### Bug Fixes
- Fixed issue A
- Fixed issue B

### Documentation
- [Flutter SDK Release Notes](docs/RELEASE_NOTES_FLUTTER_v1.0.0.md)
- [Android SDK Release Notes](docs/RELEASE_NOTES_ANDROID_v1.0.0.md)

### Installation

**Flutter**:
```yaml
dependencies:
  nivostack_core: ^1.0.0
```

**Android**:
```kotlin
implementation("com.plixera.nivostack:core:1.0.0")
```

### Full Changelog
See [CHANGELOG.md](packages/sdk-flutter/CHANGELOG.md)
```

---

## Publishing Checklist

### Pre-Publish

- [ ] All tests passing
- [ ] Code analyzed (no warnings)
- [ ] Version bumped in all SDK files
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] Example apps tested
- [ ] Release notes prepared

### Publish

- [ ] Flutter SDK published to pub.dev
- [ ] Android SDK published to Maven Central
- [ ] Git tag created
- [ ] GitHub release created

### Post-Publish

- [ ] Verify packages are available
- [ ] Test installation in fresh project
- [ ] Update documentation links
- [ ] Announce release
- [ ] Monitor for issues

---

## Troubleshooting

### Flutter: "Package already exists"

- Check if version already published
- Bump version if needed
- Verify you own the package

### Android: "GPG signing failed"

- Verify GPG key is configured
- Check `gradle.properties` credentials
- Ensure key is in keyring

### Android: "Staging repository not found"

- Check Sonatype web UI
- Verify credentials
- Check repository status

---

## Automation (Future)

### GitHub Actions Workflow

Create `.github/workflows/publish.yml`:

```yaml
name: Publish SDKs

on:
  release:
    types: [created]

jobs:
  publish-flutter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: |
          cd packages/sdk-flutter
          flutter pub publish --dry-run
          flutter pub publish

  publish-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
      - run: |
          cd packages/sdk-android/nivostack-core
          ./gradlew publishReleasePublicationToSonatypeRepository
```

---

## Support

For publishing issues:
- Check platform-specific documentation
- Review error messages
- Contact the team lead
- Check GitHub Issues

