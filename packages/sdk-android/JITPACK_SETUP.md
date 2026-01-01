# JitPack Publishing Setup

## Overview
This guide explains how to publish the NivoStack Android SDK to JitPack for easy distribution.

## Prerequisites
1. GitHub repository containing the SDK code
2. Git tags for versioning

## Setup Steps

### 1. Create GitHub Repository
If not already created, create a GitHub repository for the Android SDK:
- Repository name: `nivostack-android-sdk` (or your preferred name)
- Make it public (required for JitPack free tier)

### 2. Update build.gradle.kts
The `publish.gradle.kts` file is already configured. Update the `github.user` property in `gradle.properties`:

```properties
github.user=your-github-username
version=1.0.0
```

### 3. Create Git Tag
Tag your release:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### 4. Publish to JitPack
JitPack automatically builds from GitHub tags. After pushing a tag:

1. Go to https://jitpack.io
2. Enter your repository URL: `https://github.com/yourusername/nivostack-android-sdk`
3. Click "Look up"
4. Select the tag/version you want to build
5. Click "Get it"

JitPack will build and publish your library automatically.

## Usage

After publishing, users can add the SDK to their project:

### Step 1: Add JitPack repository
In your project's `build.gradle` (project level):

```gradle
allprojects {
    repositories {
        maven { url 'https://jitpack.io' }
    }
}
```

Or in `settings.gradle.kts`:

```kotlin
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
}
```

### Step 2: Add dependency
In your app's `build.gradle`:

```gradle
dependencies {
    implementation 'com.github.yourusername:nivostack-android-sdk:v1.0.0'
}
```

Or in `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.github.yourusername:nivostack-android-sdk:v1.0.0")
}
```

## Versioning

- Use semantic versioning: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)
- Create a git tag for each release
- Update `version` in `gradle.properties` before tagging

## Troubleshooting

### Build fails on JitPack
1. Check JitPack build logs: https://jitpack.io/com/github/yourusername/nivostack-android-sdk/
2. Ensure `build.gradle.kts` is correct
3. Check that all dependencies are available
4. Verify Android SDK version compatibility

### Library not found
1. Wait a few minutes after tagging (JitPack needs time to build)
2. Check repository is public
3. Verify tag name format (should start with `v` or be a version number)

## Alternative: Maven Central

For production use, consider publishing to Maven Central instead:
- More reliable and faster
- Better for enterprise use
- Requires Sonatype account and GPG signing

See: https://central.sonatype.org/publish/publish-guide/

