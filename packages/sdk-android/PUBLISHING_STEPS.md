# Quick Publishing Steps - NivoStack Android SDK v1.0.0

## ✅ Current Status
- **Version**: `1.0.0` ✅ (already set in `gradle.properties`)
- **Publishing Config**: Ready (needs to be enabled)

---

## 🚀 Quick Start: Publish to JitPack

### Step 1: Update GitHub Username
Edit `packages/sdk-android/nivostack-core/gradle.properties`:
```properties
github.user=YOUR_GITHUB_USERNAME
version=1.0.0
```

### Step 2: Enable Publishing
Edit `packages/sdk-android/nivostack-core/build.gradle.kts`:
```kotlin
// Change line 9 from:
// apply(from = "publish.gradle.kts")

// To:
apply(from = "publish.gradle.kts")
```

### Step 3: Create JitPack Config (for Monorepo)
Create `jitpack.yml` at **repository root** (`/Users/karim-f/Code/nivostack-monorepo-checkout/jitpack.yml`):
```yaml
jdk:
  - openjdk17
before_install:
  - cd packages/sdk-android/nivostack-core
```

### Step 4: Commit & Push
```bash
cd /Users/karim-f/Code/nivostack-monorepo-checkout
git add packages/sdk-android/nivostack-core/build.gradle.kts
git add packages/sdk-android/nivostack-core/gradle.properties
git add jitpack.yml
git commit -m "Configure Android SDK v1.0.0 for publishing"
git push origin main
```

### Step 5: Create Git Tag
```bash
git tag -a v1.0.0 -m "Release NivoStack Android SDK v1.0.0"
git push origin v1.0.0
```

### Step 6: Publish on JitPack
1. Go to https://jitpack.io
2. Enter your repo: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
3. Click "Look up"
4. Wait for `v1.0.0` to appear (2-5 minutes)
5. Click "Get it" next to `v1.0.0`
6. Wait for build to complete (5-10 minutes)

### Step 7: Verify
Check build status: `https://jitpack.io/com/github/YOUR_USERNAME/YOUR_REPO_NAME/v1.0.0/`

---

## 📦 Usage After Publishing

### Add to Project

**1. Add JitPack repository** (`settings.gradle.kts`):
```kotlin
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
}
```

**2. Add dependency** (`app/build.gradle.kts`):
```kotlin
dependencies {
    implementation("com.github.YOUR_USERNAME:YOUR_REPO_NAME:v1.0.0")
}
```

**Note**: For monorepo, check JitPack build logs for exact artifact ID. It might be:
- `com.github.YOUR_USERNAME:YOUR_REPO_NAME:nivostack-core-v1.0.0`
- Or similar variation

---

## 🔄 Updating Version

For future releases (e.g., `1.0.1`):

1. Update `version` in `gradle.properties`
2. Commit: `git commit -am "Bump version to 1.0.1"`
3. Tag: `git tag -a v1.0.1 -m "Release v1.0.1"`
4. Push: `git push origin v1.0.1`
5. JitPack auto-builds

---

## 📋 Checklist

- [ ] Update `github.user` in `gradle.properties`
- [ ] Enable `publish.gradle.kts` in `build.gradle.kts`
- [ ] Create `jitpack.yml` at repository root
- [ ] Commit and push changes
- [ ] Create git tag `v1.0.0`
- [ ] Push tag to GitHub
- [ ] Publish on JitPack website
- [ ] Verify build succeeds
- [ ] Test in sample project

---

## 📚 Full Documentation

See `PUBLISHING_GUIDE.md` for:
- Detailed explanations
- Maven Central alternative
- Troubleshooting
- Advanced configuration

