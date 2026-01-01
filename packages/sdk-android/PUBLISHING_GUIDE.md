# NivoStack Android SDK Publishing Guide

## Version: 1.0.0

This guide covers how to publish the NivoStack Android SDK to JitPack or Maven Central.

---

## Prerequisites

1. **GitHub Repository**: The SDK code must be in a GitHub repository
2. **Git Access**: Ability to create tags and push to GitHub
3. **Version Confirmed**: Version is set to `1.0.0` in `nivostack-core/gradle.properties`

---

## Option 1: Publish to JitPack (Recommended for Quick Start)

JitPack is the easiest way to publish Android libraries. It automatically builds from GitHub tags.

### Step 1: Verify Version Configuration

Ensure `nivostack-core/gradle.properties` has:
```properties
version=1.0.0
```

### Step 2: Enable Publishing Configuration

Uncomment the publishing configuration in `nivostack-core/build.gradle.kts`:

```kotlin
// Change this:
// apply(from = "publish.gradle.kts")

// To this:
apply(from = "publish.gradle.kts")
```

### Step 3: Update GitHub Username

Update `nivostack-core/gradle.properties` with your GitHub username:

```properties
github.user=your-github-username
version=1.0.0
```

### Step 4: Create JitPack Configuration (for Monorepo)

Since the SDK is in a monorepo, create `jitpack.yml` at the repository root:

```yaml
jdk:
  - openjdk17
before_install:
  - cd packages/sdk-android/nivostack-core
```

**Note**: If your repository root is different, adjust the path accordingly.

### Step 5: Commit and Push Changes

```bash
# From repository root
git add packages/sdk-android/nivostack-core/build.gradle.kts
git add packages/sdk-android/nivostack-core/gradle.properties
git add jitpack.yml  # If created
git commit -m "Configure SDK for publishing v1.0.0"
git push origin main  # or your default branch
```

### Step 6: Create Git Tag

```bash
# From repository root
git tag -a v1.0.0 -m "Release NivoStack Android SDK v1.0.0"
git push origin v1.0.0
```

### Step 7: Publish on JitPack

1. Go to https://jitpack.io
2. Enter your repository URL: `https://github.com/yourusername/your-repo-name`
3. Click "Look up"
4. Wait for JitPack to detect the tag (may take a few minutes)
5. Click "Get it" next to the `v1.0.0` tag
6. JitPack will build and publish automatically

### Step 8: Verify Publication

After JitPack builds successfully (usually 5-10 minutes), verify:

1. Check build logs: `https://jitpack.io/com/github/yourusername/your-repo-name/v1.0.0/`
2. Test in a sample project (see Usage below)

---

## Option 2: Publish to Maven Central (For Production)

Maven Central is more reliable and professional but requires more setup.

### Prerequisites for Maven Central

1. **Sonatype Account**: Sign up at https://issues.sonatype.org
2. **GPG Key**: Generate for signing artifacts
3. **Domain Verification**: Verify ownership of your domain (or use GitHub)

### Step 1: Create Sonatype Account

1. Go to https://issues.sonatype.org
2. Create an account
3. Create a new ticket to request repository access
4. Wait for approval (usually 1-2 business days)

### Step 2: Generate GPG Key

```bash
gpg --gen-key
# Follow prompts, use your email
gpg --list-secret-keys --keyid-format LONG
# Copy the key ID (after "sec rsa4096/")
gpg --keyserver keyserver.ubuntu.com --send-keys YOUR_KEY_ID
```

### Step 3: Configure Signing

Add to `nivostack-core/gradle.properties`:

```properties
signing.keyId=YOUR_KEY_ID
signing.password=YOUR_GPG_PASSPHRASE
signing.secretKeyRingFile=/path/to/.gnupg/secring.gpg

sonatypeUsername=your-sonatype-username
sonatypePassword=your-sonatype-password
```

### Step 4: Update publish.gradle.kts

Modify `publish.gradle.kts` to use Maven Central coordinates:

```kotlin
groupId = "com.plixera"
artifactId = "nivostack-android"
version = project.findProperty("version") as? String ?: "1.0.0"

// Add signing configuration
signing {
    sign(publishing.publications["release"])
}
```

### Step 5: Publish

```bash
cd packages/sdk-android/nivostack-core
./gradlew publishReleasePublicationToMavenCentralRepository
```

---

## Usage After Publishing

### JitPack Usage

**Step 1**: Add JitPack repository to your project's `settings.gradle.kts`:

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

**Step 2**: Add dependency in your app's `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.github.yourusername:your-repo-name:v1.0.0")
}
```

**Note**: For monorepo, JitPack uses the repository name, not the module name. You may need to specify the subdirectory:

```kotlin
implementation("com.github.yourusername:your-repo-name:nivostack-core-v1.0.0")
```

Check JitPack build logs for the exact artifact ID.

### Maven Central Usage

**Step 1**: Add Maven Central (already included by default)

**Step 2**: Add dependency:

```kotlin
dependencies {
    implementation("com.plixera:nivostack-android:1.0.0")
}
```

---

## Versioning Strategy

- **Semantic Versioning**: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)
- **MAJOR**: Breaking API changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Updating Version

1. Update `version` in `nivostack-core/gradle.properties`
2. Commit changes
3. Create new git tag: `git tag -a v1.0.1 -m "Release v1.0.1"`
4. Push tag: `git push origin v1.0.1`
5. JitPack will automatically build the new version

---

## Troubleshooting

### JitPack Build Fails

1. **Check Build Logs**: https://jitpack.io/com/github/yourusername/repo-name/
2. **Common Issues**:
   - Missing `jitpack.yml` for monorepo
   - Incorrect path in `jitpack.yml`
   - Missing dependencies
   - Android SDK version mismatch

3. **Fix**: Update `jitpack.yml` with correct paths and JDK version

### Library Not Found After Publishing

1. **Wait**: JitPack can take 5-10 minutes to build
2. **Check Repository**: Ensure repository is public
3. **Verify Tag**: Tag must be pushed to GitHub
4. **Check Artifact ID**: For monorepo, artifact ID may differ

### Maven Central Sync Issues

1. **Check Sonatype Status**: https://status.sonatype.com/
2. **Verify GPG Key**: Ensure key is published to keyserver
3. **Check Credentials**: Verify username/password in `gradle.properties`

---

## Current Configuration

- **Version**: `1.0.0`
- **Group ID** (JitPack): `com.github.yourusername`
- **Group ID** (Maven Central): `com.plixera`
- **Artifact ID**: `nivostack-android`
- **Package**: `com.plixera.nivostack`

---

## Next Steps

1. ✅ Version set to `1.0.0`
2. ⏳ Update `github.user` in `gradle.properties`
3. ⏳ Enable `publish.gradle.kts` in `build.gradle.kts`
4. ⏳ Create `jitpack.yml` at repository root (if using JitPack)
5. ⏳ Commit and push changes
6. ⏳ Create git tag `v1.0.0`
7. ⏳ Publish on JitPack or Maven Central

---

## Support

For issues or questions:
- Check JitPack logs: https://jitpack.io
- Check Maven Central: https://central.sonatype.org
- Contact: support@nivostack.com

