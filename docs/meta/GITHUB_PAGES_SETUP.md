# GitHub Pages Setup for NivoStack Documentation

## Overview

GitHub Pages can be used for **both** internal technical documentation and public developer-facing documentation (like docs.NivoStack.com).

---

## Use Cases

### 1. Internal Technical Documentation ✅
- **Purpose**: Technical analytics, architecture decisions, internal guides
- **Access**: Private repository → Private Pages (GitHub Pro/Team) or Public Pages
- **Examples**:
  - Performance analysis documents
  - Database schema designs
  - API architecture decisions
  - Internal troubleshooting guides
  - Team onboarding materials

### 2. Public Developer Documentation ✅
- **Purpose**: SDK documentation, API guides, tutorials for external developers
- **Access**: Public repository → Public Pages (free)
- **Examples**:
  - SDK installation guides
  - API reference documentation
  - Code examples and tutorials
  - Troubleshooting guides
  - Video tutorials and screenshots
  - Changelog and release notes

---

## GitHub Pages Options

### Option 1: Repository Pages (Recommended for Public Docs)
- **URL**: `https://iplixera.github.io/nivostack-monorepo/`
- **Branch**: `gh-pages` or `/docs` folder
- **Best for**: Public developer documentation
- **Setup**: Simple, automatic deployment

### Option 2: Custom Domain (Recommended for docs.NivoStack.com)
- **URL**: `https://docs.nivostack.com`
- **Branch**: `gh-pages` or `/docs` folder
- **Best for**: Professional developer-facing documentation
- **Setup**: Requires DNS configuration

### Option 3: Organization Pages (For Multiple Projects)
- **URL**: `https://iplixera.github.io/`
- **Repository**: `iplixera/iplixera.github.io`
- **Best for**: Organization-wide documentation hub

---

## Recommended Setup for NivoStack

### Structure

```
nivostack-monorepo/
├── docs/                          # Internal technical docs (current)
│   ├── performance/
│   ├── technical/
│   ├── guides/
│   └── ...
│
└── docs-public/                   # Public developer docs (new)
    ├── sdk/
    │   ├── android/
    │   ├── ios/
    │   └── flutter/
    ├── api/
    ├── guides/
    │   ├── getting-started.md
    │   ├── troubleshooting.md
    │   └── examples/
    ├── videos/
    ├── screenshots/
    └── index.html
```

---

## Implementation Steps

### Step 1: Set Up Public Documentation Site

1. **Create `docs-public/` directory**:
   ```bash
   mkdir -p docs-public/{sdk,api,guides,videos,screenshots}
   ```

2. **Create index page**:
   ```html
   <!-- docs-public/index.html -->
   <!DOCTYPE html>
   <html>
   <head>
       <title>NivoStack Developer Documentation</title>
       <meta name="viewport" content="width=device-width, initial-scale=1">
   </head>
   <body>
       <h1>NivoStack Developer Documentation</h1>
       <nav>
           <a href="/sdk/android">Android SDK</a>
           <a href="/sdk/ios">iOS SDK</a>
           <a href="/sdk/flutter">Flutter SDK</a>
           <a href="/api">API Reference</a>
           <a href="/guides">Guides</a>
       </nav>
   </body>
   </html>
   ```

3. **Enable GitHub Pages**:
   - Go to: Repository → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` → `/docs-public` folder
   - Save

4. **Custom Domain (Optional)**:
   - In Pages settings, add custom domain: `docs.nivostack.com`
   - Add CNAME file: `echo "docs.nivostack.com" > docs-public/CNAME`
   - Configure DNS: Add CNAME record pointing to `iplixera.github.io`

---

### Step 2: Use Static Site Generator (Recommended)

For better documentation, use a static site generator:

#### Option A: MkDocs (Python, Markdown-based)
- **Pros**: Simple, great for Markdown docs
- **Setup**: `pip install mkdocs mkdocs-material`
- **Config**: `mkdocs.yml`
- **Deploy**: GitHub Actions automatically

#### Option B: Docusaurus (React-based)
- **Pros**: Modern, supports React components, search, versioning
- **Setup**: `npx create-docusaurus@latest docs-public classic`
- **Deploy**: GitHub Actions automatically

#### Option C: VitePress (Vue-based, fast)
- **Pros**: Fast, simple, great for docs
- **Setup**: `npm init vitepress@latest docs-public`
- **Deploy**: GitHub Actions automatically

---

### Step 3: GitHub Actions for Auto-Deployment

Create `.github/workflows/deploy-docs.yml`:

```yaml
name: Deploy Documentation

on:
  push:
    branches:
      - main
    paths:
      - 'docs-public/**'
      - '.github/workflows/deploy-docs.yml'

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js (if using Docusaurus/VitePress)
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd docs-public
          npm install
      
      - name: Build documentation
        run: |
          cd docs-public
          npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs-public/dist
```

---

## Content Organization

### SDK Documentation Structure

```
docs-public/
├── sdk/
│   ├── android/
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   ├── api-reference.md
│   │   ├── examples/
│   │   │   ├── basic-usage.md
│   │   │   └── advanced-features.md
│   │   └── troubleshooting.md
│   │
│   ├── ios/
│   │   └── ... (same structure)
│   │
│   └── flutter/
│       └── ... (same structure)
│
├── api/
│   ├── authentication.md
│   ├── endpoints.md
│   └── webhooks.md
│
├── guides/
│   ├── getting-started.md
│   ├── best-practices.md
│   └── migration-guides/
│
├── videos/
│   └── (video files or embeds)
│
└── screenshots/
    └── (image files)
```

---

## Features to Include

### 1. Code Examples
- Syntax highlighting
- Copy-to-clipboard buttons
- Multiple language examples (Android/Kotlin, iOS/Swift, Flutter/Dart)

### 2. Screenshots & Videos
- Embedded videos (YouTube/Vimeo)
- Screenshot galleries
- Animated GIFs for complex flows

### 3. Search
- Full-text search (Docusaurus has built-in)
- Or use Algolia DocSearch (free for open source)

### 4. Versioning
- Support multiple SDK versions
- Show version selector
- Archive old versions

### 5. Interactive Examples
- Code playgrounds (if using React-based generator)
- Live API examples
- Interactive demos

---

## Internal vs Public Documentation

### Internal (`docs/` folder)
- **Access**: Private (or public if repo is public)
- **Content**: Technical deep-dives, architecture decisions
- **Audience**: Internal team, contributors
- **Examples**:
  - `docs/performance/AGGREGATE_TABLES_DESIGN.md`
  - `docs/technical/API_ARCHITECTURE.md`
  - `docs/guides/INTERNAL_SETUP.md`

### Public (`docs-public/` folder)
- **Access**: Public (deployed to GitHub Pages)
- **Content**: Developer guides, SDK docs, tutorials
- **Audience**: External developers using NivoStack
- **Examples**:
  - `docs-public/sdk/android/installation.md`
  - `docs-public/guides/getting-started.md`
  - `docs-public/api/authentication.md`

---

## Best Practices

1. **Separate Concerns**: Keep internal docs separate from public docs
2. **Version Control**: Use Git for all documentation
3. **Automated Deployment**: Use GitHub Actions for auto-deployment
4. **Search**: Implement search for large documentation sites
5. **Mobile-Friendly**: Ensure docs work on mobile devices
6. **Fast Loading**: Optimize images and use CDN if needed
7. **Feedback**: Add "Edit this page" links for community contributions
8. **Analytics**: Add Google Analytics or Plausible for public docs

---

## Next Steps

1. ✅ Decide on static site generator (recommend Docusaurus or VitePress)
2. ✅ Create `docs-public/` directory structure
3. ✅ Set up GitHub Pages deployment
4. ✅ Migrate existing public-facing docs to `docs-public/`
5. ✅ Set up custom domain (docs.nivostack.com)
6. ✅ Add GitHub Actions for auto-deployment
7. ✅ Add search functionality
8. ✅ Add screenshots and videos
9. ✅ Set up analytics

---

## Answer to Your Question

**Yes, GitHub Pages can be used for BOTH:**

1. ✅ **Internal Technical Documentation** (like your current `docs/` folder)
   - Performance analytics
   - Architecture decisions
   - Internal guides

2. ✅ **Public Developer Documentation** (like docs.NivoStack.com)
   - SDK installation guides
   - API references
   - Tutorials with screenshots and videos
   - Troubleshooting guides

**Recommendation**: Use two separate folders:
- `docs/` → Internal technical docs (can be private)
- `docs-public/` → Public developer docs (deployed to GitHub Pages → docs.NivoStack.com)

