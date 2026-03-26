# NivoStack Marketing Website

Static HTML marketing site for NivoStack - mobile app debugging and configuration platform.

## Quick Start

```bash
cd website
python -m http.server 8000
# Open http://localhost:8000
```

Or use any static file server (Live Server VS Code extension, etc.)

## Structure

```
website/
├── assets/
│   ├── style.css          # Complete design system
│   └── app.js             # Theme toggle, nav, forms
├── index.html             # Home page
├── features.html          # Features overview
├── pricing.html           # Plans and pricing
├── security.html          # Security features
├── docs.html              # Documentation hub
├── docs_getting_started.html
├── docs_tracking_modes.html
├── docs_api_reference.html
├── docs_design_system.html
├── about.html             # About us
├── contact.html           # Contact form
├── careers.html           # Job listings
├── status.html            # System status
├── changelog.html         # Release notes
├── privacy.html           # Privacy policy
├── terms.html             # Terms of service
├── dpa.html               # Data processing agreement
├── integrations.html      # SDK and integrations
└── studio_login.html      # Dashboard login
```

## Design System

### Theme Colors

The site supports dark (default) and light themes via CSS variables:

```css
/* Dark theme (default) */
--bg: #0a0a0a;
--card: #151515;
--text: #f2f2f2;
--muted: #999;
--border: #2a2a2a;
--accent: #fbbf24;  /* Yellow/gold accent */

/* Light theme */
--bg: #fafafa;
--card: #fff;
--text: #111;
--muted: #666;
--border: #e5e5e5;
```

### Components

- **Buttons**: `.btn`, `.btn.primary`, `.btn.ghost`
- **Cards**: `.card`, `.card.feature`, `.card.pricing`
- **Pills/Badges**: `.pill`
- **Forms**: `.form-row`, standard inputs
- **Code blocks**: `.code`
- **Notes/Alerts**: `.note`

### Layout

- **Container**: `.container` (max-width: 1200px)
- **Grids**: `.grid-2`, `.grid-3`, `.grid-4`
- **Hero**: `.hero`
- **Sections**: `.section`

## Adding New Pages

1. Copy an existing page as template
2. Update `<title>` and breadcrumb
3. Keep header/footer consistent
4. Add link to navigation if needed

## JavaScript Features

- **Theme toggle**: Persists to localStorage
- **Nav active state**: Auto-highlights current page
- **Docs search**: Filters sidebar links
- **Smooth scroll**: For anchor links
- **Form validation**: Basic client-side validation

## Deployment

Static files - deploy to any static host:
- Vercel: `vercel --prod`
- Netlify: Drag and drop or CLI
- GitHub Pages: Push to gh-pages branch
- S3/CloudFront: Upload to bucket

## Development Notes

- Pure HTML/CSS/JS - no build step required
- Mobile-responsive (breakpoints at 768px, 480px)
- All links are relative for easy deployment
- Forms are placeholder only - wire up to backend as needed
- OAuth buttons in login page need backend integration

## Updating Content

- **Changelog**: Add new entries at the top of `changelog.html`
- **Pricing**: Edit pricing cards in `pricing.html`
- **Status**: Update service status in `status.html`
- **Careers**: Add/remove job listings in `careers.html`

## Related

- Dashboard app: `/dashboard` (Next.js)
- Android SDK: `/packages/sdk-android`
- API backend: `/dashboard/src/app/api`
