# URL Shortener & Link Management - Product Requirements Document

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Planning  
**Reference:** Bitly.com Feature Analysis

---

## Executive Summary

This PRD outlines the requirements for implementing a comprehensive URL shortening and link management platform within NivoStack, similar to Bitly's core functionality. This feature will enable users to create short links, generate QR codes, track link analytics, and manage branded links - all integrated with NivoStack's existing mobile app monitoring capabilities.

---

## Product Vision

**"Empower businesses to create, manage, and track short links with deep integration into mobile app analytics"**

This feature extends NivoStack's value proposition by allowing users to:
- Create short, trackable links for marketing campaigns
- Generate QR codes for offline-to-online conversion tracking
- Track link performance with detailed analytics
- Integrate link clicks with existing device and session tracking
- Manage branded links and link-in-bio pages

---

## Target Users

### Primary Users
1. **Marketing Teams** - Create trackable links for campaigns, social media, and print materials
2. **Product Managers** - Track feature adoption through deep links
3. **Mobile App Developers** - Integrate link tracking with app analytics
4. **Business Owners** - Manage branded links and QR codes for customer engagement

### Secondary Users
1. **Analytics Teams** - Analyze link performance and user journeys
2. **Support Teams** - Share trackable support links with customers

---

## Competitive Analysis: Bitly Features

### Core Features Breakdown

#### 1. URL Shortener
**What Bitly Does:**
- Converts long URLs into short, shareable links (e.g., `bit.ly/abc123`)
- Supports custom back-halves (e.g., `bit.ly/my-custom-link`)
- Automatic link generation or manual customization
- Link expiration and password protection
- Link editing (change destination without changing short URL)

**How Bitly Implements:**
- Uses a base62 encoding algorithm for short code generation
- Stores mapping in database: `short_code → long_url`
- Redirects via HTTP 301/302 based on configuration
- Supports bulk link creation via API
- Link validation and sanitization

**Technical Implementation:**
```
Database Schema:
- short_code (unique, indexed)
- long_url (original destination)
- created_at, expires_at
- click_count, last_clicked_at
- password_hash (optional)
- metadata (tags, notes, etc.)
```

#### 2. QR Code Generator
**What Bitly Does:**
- Generates QR codes for any URL
- Dynamic QR codes (can change destination without regenerating QR)
- Static QR codes (fixed destination)
- Customizable QR code design (colors, logo, error correction)
- Multiple QR code types (URL, vCard, WiFi, SMS, etc.)
- GS1 Digital Link support for packaging

**How Bitly Implements:**
- Uses QR code library (like `qrcode` in Python or `qrcode.js` in JS)
- Stores QR code image as SVG/PNG
- Dynamic QR codes link to Bitly short URL (allows destination changes)
- Static QR codes encode URL directly
- Supports different error correction levels (L, M, Q, H)

**Technical Implementation:**
```
QR Code Generation:
1. Create short link (or use existing)
2. Generate QR code image pointing to short link
3. Apply customization (colors, logo overlay)
4. Return image + short link
```

#### 3. Analytics & Tracking
**What Bitly Does:**
- Click tracking (total clicks, unique clicks)
- Geographic analytics (country, city, region)
- Device analytics (mobile, desktop, tablet)
- Browser analytics (Chrome, Safari, Firefox, etc.)
- Referrer tracking (where clicks came from)
- Time-series analytics (clicks over time)
- Click-through rate (CTR) calculations
- Link performance comparison

**How Bitly Implements:**
- Tracks every click with metadata:
  - IP address (for geolocation)
  - User-Agent (for device/browser detection)
  - Referrer header
  - Timestamp
  - Session ID (for unique visitor tracking)
- Stores click data in analytics database
- Aggregates data for dashboard display
- Uses services like MaxMind for IP geolocation

**Technical Implementation:**
```
Click Tracking Flow:
1. User clicks short link
2. Redirect endpoint logs:
   - IP address
   - User-Agent
   - Referrer
   - Timestamp
   - Short code
3. Perform redirect (301/302)
4. Analytics aggregation job runs periodically
```

#### 4. Branded Links
**What Bitly Does:**
- Custom domain support (e.g., `yourbrand.com/abc123`)
- Domain verification and DNS configuration
- SSL certificate management
- Multiple branded domains per account
- Domain-level analytics

**How Bitly Implements:**
- User adds custom domain via DNS CNAME record
- Bitly verifies domain ownership
- Routes traffic through custom domain
- Manages SSL certificates (Let's Encrypt)
- Stores domain mapping in database

**Technical Implementation:**
```
Domain Setup:
1. User adds CNAME: links.yourbrand.com → bitly.com
2. Bitly verifies domain ownership
3. Creates SSL certificate
4. Routes requests to short link resolver
```

#### 5. Link-in-Bio Pages
**What Bitly Does:**
- Creates mobile-friendly landing pages
- Multiple links on one page
- Customizable design (colors, fonts, images)
- Social media integration
- Analytics per link and overall page
- Custom domain support

**How Bitly Implements:**
- Stores page configuration (links, design, settings)
- Renders page server-side or client-side
- Tracks page views and link clicks
- Supports custom domains

**Technical Implementation:**
```
Link-in-Bio Page:
- Page ID (unique identifier)
- Links array (title, URL, icon)
- Design settings (theme, colors, fonts)
- Analytics (page views, link clicks)
```

#### 6. UTM Campaign Tracking
**What Bitly Does:**
- Automatically appends UTM parameters to destination URLs
- Pre-configured UTM templates
- Campaign tracking integration
- UTM parameter analytics

**How Bitly Implements:**
- Stores UTM parameters with link
- Appends to destination URL on redirect
- Tracks UTM parameters in analytics
- Groups analytics by campaign

#### 7. Mobile Links
**What Bitly Does:**
- Platform-specific redirects (iOS vs Android)
- Deep linking support
- App Store redirects
- Fallback URLs

**How Bitly Implements:**
- Detects user agent/device type
- Redirects to appropriate URL:
  - iOS → App Store or deep link
  - Android → Play Store or deep link
  - Desktop → Web URL
- Stores platform-specific URLs in link configuration

#### 8. Digital Business Cards
**What Bitly Does:**
- Creates shareable digital business cards
- vCard format support
- Contact information management
- QR code generation for cards
- Analytics on card views

**How Bitly Implements:**
- Stores contact information (name, email, phone, etc.)
- Generates vCard file or web page
- Creates QR code pointing to card
- Tracks views and interactions

---

## Feature Requirements

### Phase 1: Core URL Shortening (MVP)

#### 1.1 Link Creation
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| LS-1 | Create short link from long URL | P0 | Planned |
| LS-2 | Generate unique short code (base62) | P0 | Planned |
| LS-3 | Support custom back-halves | P1 | Planned |
| LS-4 | Validate URL format | P0 | Planned |
| LS-5 | Link expiration date support | P1 | Planned |
| LS-6 | Password protection | P2 | Planned |
| LS-7 | Link editing (change destination) | P1 | Planned |
| LS-8 | Bulk link creation via API | P2 | Planned |

#### 1.2 Link Redirection
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| LR-1 | HTTP 301 redirect (permanent) | P0 | Planned |
| LR-2 | HTTP 302 redirect (temporary) | P0 | Planned |
| LR-3 | Handle invalid/expired links | P0 | Planned |
| LR-4 | Redirect with click tracking | P0 | Planned |
| LR-5 | Password-protected link flow | P2 | Planned |

#### 1.3 Link Management
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| LM-1 | List all links with pagination | P0 | Planned |
| LM-2 | Search links by title/URL | P1 | Planned |
| LM-3 | Filter by tags/categories | P1 | Planned |
| LM-4 | Archive/delete links | P0 | Planned |
| LM-5 | Link notes/descriptions | P1 | Planned |
| LM-6 | Link tags for organization | P1 | Planned |

### Phase 2: QR Code Generation

#### 2.1 QR Code Creation
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| QR-1 | Generate QR code for short link | P0 | Planned |
| QR-2 | Dynamic QR codes (changeable destination) | P0 | Planned |
| QR-3 | Static QR codes (fixed URL) | P1 | Planned |
| QR-4 | Customizable colors | P1 | Planned |
| QR-5 | Logo overlay support | P2 | Planned |
| QR-6 | Error correction level selection | P1 | Planned |
| QR-7 | Multiple format export (PNG, SVG, PDF) | P1 | Planned |
| QR-8 | QR code size customization | P1 | Planned |

#### 2.2 QR Code Types
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| QT-1 | URL QR codes | P0 | Planned |
| QT-2 | vCard QR codes | P2 | Planned |
| QT-3 | WiFi QR codes | P2 | Planned |
| QT-4 | SMS QR codes | P2 | Planned |
| QT-5 | Email QR codes | P2 | Planned |

### Phase 3: Analytics & Tracking

#### 3.1 Click Tracking
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| CT-1 | Track total clicks | P0 | Planned |
| CT-2 | Track unique clicks (by IP/cookie) | P0 | Planned |
| CT-3 | Track click timestamp | P0 | Planned |
| CT-4 | Store click metadata (IP, User-Agent, Referrer) | P0 | Planned |
| CT-5 | Real-time click updates | P1 | Planned |

#### 3.2 Geographic Analytics
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| GA-1 | Country-level analytics | P0 | Planned |
| GA-2 | City-level analytics | P1 | Planned |
| GA-3 | Map visualization | P1 | Planned |
| GA-4 | Top countries/cities list | P0 | Planned |

#### 3.3 Device & Browser Analytics
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| DB-1 | Device type (mobile/desktop/tablet) | P0 | Planned |
| DB-2 | Operating system detection | P0 | Planned |
| DB-3 | Browser detection | P0 | Planned |
| DB-4 | Device/browser breakdown charts | P1 | Planned |

#### 3.4 Referrer Analytics
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| RA-1 | Track referrer domains | P0 | Planned |
| RA-2 | Track social media sources | P1 | Planned |
| RA-3 | Direct vs referred traffic | P0 | Planned |
| RA-4 | Top referrers list | P0 | Planned |

#### 3.5 Time-Series Analytics
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| TS-1 | Clicks over time (hourly/daily/weekly) | P0 | Planned |
| TS-2 | Time-series charts | P1 | Planned |
| TS-3 | Peak hours analysis | P1 | Planned |
| TS-4 | Trend analysis | P2 | Planned |

#### 3.6 Integration with NivoStack Analytics
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| NI-1 | Link clicks trigger device registration | P1 | Planned |
| NI-2 | Link clicks create sessions | P1 | Planned |
| NI-3 | Link clicks tracked as API traces | P1 | Planned |
| NI-4 | Link analytics in device dashboard | P1 | Planned |
| NI-5 | Link-to-app conversion tracking | P2 | Planned |

### Phase 4: Branded Links

#### 4.1 Custom Domain Support
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| CD-1 | Add custom domain | P0 | Planned |
| CD-2 | Domain verification (DNS CNAME) | P0 | Planned |
| CD-3 | SSL certificate management | P0 | Planned |
| CD-4 | Multiple domains per project | P1 | Planned |
| CD-5 | Domain-level analytics | P1 | Planned |
| CD-6 | Default domain selection | P1 | Planned |

#### 4.2 Domain Management
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| DM-1 | List all domains | P0 | Planned |
| DM-2 | Domain status (verified/pending) | P0 | Planned |
| DM-3 | Remove domain | P0 | Planned |
| DM-4 | Domain usage statistics | P1 | Planned |

### Phase 5: Link-in-Bio Pages

#### 5.1 Page Creation
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| LB-1 | Create link-in-bio page | P0 | Planned |
| LB-2 | Add multiple links to page | P0 | Planned |
| LB-3 | Customize page design | P1 | Planned |
| LB-4 | Upload profile image | P1 | Planned |
| LB-5 | Custom domain support | P1 | Planned |
| LB-6 | Social media links | P1 | Planned |

#### 5.2 Page Management
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| PM-1 | Edit page links | P0 | Planned |
| PM-2 | Reorder links | P1 | Planned |
| PM-3 | Enable/disable links | P1 | Planned |
| PM-4 | Page analytics | P0 | Planned |
| PM-5 | Link click analytics per page | P0 | Planned |

### Phase 6: Advanced Features

#### 6.1 UTM Campaign Tracking
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| UT-1 | Append UTM parameters to destination | P0 | Planned |
| UT-2 | UTM parameter templates | P1 | Planned |
| UT-3 | UTM analytics grouping | P1 | Planned |
| UT-4 | Campaign performance tracking | P1 | Planned |

#### 6.2 Mobile Links & Deep Linking
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| ML-1 | Platform-specific redirects (iOS/Android) | P1 | Planned |
| ML-2 | Deep link support | P1 | Planned |
| ML-3 | App Store redirects | P1 | Planned |
| ML-4 | Fallback URL support | P1 | Planned |
| ML-5 | Device detection | P0 | Planned |

#### 6.3 Digital Business Cards
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| BC-1 | Create digital business card | P2 | Planned |
| BC-2 | vCard format support | P2 | Planned |
| BC-3 | Contact information management | P2 | Planned |
| BC-4 | QR code for business card | P2 | Planned |
| BC-5 | Card view analytics | P2 | Planned |

---

## Database Schema

### Core Tables

```prisma
model ShortLink {
  id            String   @id @default(cuid())
  shortCode     String   @unique
  longUrl       String   @db.Text
  title         String?
  description   String?
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  
  // Customization
  customBackHalf String?  @unique
  domainId       String?
  domain         Domain?  @relation(fields: [domainId], references: [id])
  
  // Settings
  expiresAt      DateTime?
  passwordHash   String?
  isActive       Boolean  @default(true)
  redirectType   String   @default("302") // 301 or 302
  
  // UTM Parameters
  utmSource      String?
  utmMedium      String?
  utmCampaign    String?
  utmTerm        String?
  utmContent     String?
  
  // Mobile Links
  iosUrl         String?
  androidUrl     String?
  desktopUrl     String?
  fallbackUrl    String?
  
  // Metadata
  tags           String[]
  notes          String?  @db.Text
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  // Relations
  clicks         Click[]
  qrCodes        QrCode[]
  linkInBioPages LinkInBioPageLink[]
  
  @@index([projectId])
  @@index([shortCode])
  @@index([customBackHalf])
}

model Click {
  id            String    @id @default(cuid())
  shortLinkId   String
  shortLink     ShortLink @relation(fields: [shortLinkId], references: [id])
  
  // Click metadata
  ipAddress     String
  userAgent     String?  @db.Text
  referrer      String?  @db.Text
  country       String?
  city          String?
  region        String?
  deviceType    String?  // mobile, desktop, tablet
  os            String?
  browser       String?
  
  // NivoStack Integration
  deviceId      String?   // Link to Device if available
  sessionId     String?   // Link to Session if available
  
  clickedAt     DateTime  @default(now())
  
  @@index([shortLinkId])
  @@index([clickedAt])
  @@index([country])
  @@index([deviceId])
}

model QrCode {
  id            String    @id @default(cuid())
  shortLinkId   String?
  shortLink     ShortLink? @relation(fields: [shortLinkId], references: [id])
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  // QR Code Type
  type          String    @default("url") // url, vcard, wifi, sms, email
  data          Json      // Type-specific data
  
  // Design
  foregroundColor String  @default("#000000")
  backgroundColor String  @default("#FFFFFF")
  logoUrl        String?
  errorCorrectionLevel String @default("M") // L, M, Q, H
  
  // Settings
  isDynamic     Boolean   @default(true) // Can change destination
  size          Int       @default(300)
  
  // Analytics
  scanCount     Int       @default(0)
  lastScannedAt DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([projectId])
  @@index([shortLinkId])
}

model Domain {
  id            String     @id @default(cuid())
  projectId     String
  project       Project    @relation(fields: [projectId], references: [id])
  
  domain        String     @unique // e.g., links.example.com
  isVerified    Boolean    @default(false)
  verificationToken String @unique
  verifiedAt    DateTime?
  
  // SSL
  sslEnabled    Boolean    @default(true)
  sslCertificate String?   @db.Text
  
  // Settings
  isDefault     Boolean    @default(false)
  
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  
  shortLinks    ShortLink[]
  
  @@index([projectId])
}

model LinkInBioPage {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  title         String
  description   String?
  profileImageUrl String?
  
  // Design
  theme         String     @default("light") // light, dark, custom
  backgroundColor String?
  textColor     String?
  fontFamily    String?
  
  // Custom Domain
  customDomain  String?
  domainId      String?
  domain        Domain?    @relation(fields: [domainId], references: [id])
  
  // Analytics
  viewCount     Int        @default(0)
  lastViewedAt  DateTime?
  
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  
  links         LinkInBioPageLink[]
  
  @@index([projectId])
}

model LinkInBioPageLink {
  id            String         @id @default(cuid())
  pageId        String
  page          LinkInBioPage  @relation(fields: [pageId], references: [id])
  shortLinkId   String?
  shortLink     ShortLink?     @relation(fields: [shortLinkId], references: [id])
  
  title         String
  url           String         @db.Text
  iconUrl       String?
  order         Int
  
  clickCount    Int            @default(0)
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  @@index([pageId])
  @@index([shortLinkId])
}

model BusinessCard {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  // Contact Info
  firstName     String
  lastName      String
  email         String?
  phone         String?
  company       String?
  jobTitle      String?
  website       String?
  address       String?   @db.Text
  
  // Social Media
  linkedin      String?
  twitter       String?
  instagram     String?
  facebook      String?
  
  // QR Code
  qrCodeId      String?
  qrCode        QrCode?   @relation(fields: [qrCodeId], references: [id])
  
  // Analytics
  viewCount     Int       @default(0)
  lastViewedAt  DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([projectId])
}
```

---

## API Endpoints

### Link Management

```
POST   /api/links                    Create short link
GET    /api/links                    List links (paginated)
GET    /api/links/:id                Get link details
PUT    /api/links/:id                Update link
DELETE /api/links/:id                Delete link
POST   /api/links/bulk               Bulk create links
GET    /api/links/:id/analytics      Get link analytics
```

### Link Redirection

```
GET    /:shortCode                   Redirect to destination
GET    /:shortCode/info              Get link info (for preview)
POST   /:shortCode/password          Verify password (if protected)
```

### QR Codes

```
POST   /api/qr-codes                 Create QR code
GET    /api/qr-codes                 List QR codes
GET    /api/qr-codes/:id             Get QR code details
PUT    /api/qr-codes/:id             Update QR code
DELETE /api/qr-codes/:id             Delete QR code
GET    /api/qr-codes/:id/image       Get QR code image
GET    /api/qr-codes/:id/analytics   Get QR code analytics
```

### Domains

```
POST   /api/domains                   Add custom domain
GET    /api/domains                   List domains
GET    /api/domains/:id               Get domain details
DELETE /api/domains/:id               Remove domain
POST   /api/domains/:id/verify        Verify domain ownership
```

### Link-in-Bio Pages

```
POST   /api/link-in-bio              Create page
GET    /api/link-in-bio              List pages
GET    /api/link-in-bio/:id          Get page details
PUT    /api/link-in-bio/:id          Update page
DELETE /api/link-in-bio/:id          Delete page
GET    /api/link-in-bio/:id/analytics Get page analytics
GET    /:pageSlug                    Render page (public)
```

### Analytics

```
GET    /api/analytics/clicks          Get click analytics
GET    /api/analytics/geographic     Get geographic analytics
GET    /api/analytics/devices         Get device analytics
GET    /api/analytics/referrers       Get referrer analytics
GET    /api/analytics/timeseries      Get time-series data
```

---

## Implementation Plan for NivoStack

### Phase 1: Foundation (Weeks 1-2)

**Database Setup:**
1. Add Prisma models for ShortLink, Click, QrCode
2. Run migrations
3. Create indexes for performance

**Core API:**
1. Implement short code generation (base62)
2. Create link creation endpoint
3. Implement redirect endpoint with click tracking
4. Basic link management (CRUD)

**Dashboard UI:**
1. Link creation form
2. Links list page
3. Link details page with basic analytics

### Phase 2: QR Codes (Week 3)

**Backend:**
1. Integrate QR code generation library
2. Create QR code API endpoints
3. Store QR code metadata

**Dashboard UI:**
1. QR code generation UI
2. QR code customization options
3. QR code download/export

### Phase 3: Analytics (Weeks 4-5)

**Backend:**
1. Enhanced click tracking with metadata
2. IP geolocation integration (MaxMind or similar)
3. User-Agent parsing
4. Analytics aggregation endpoints

**Dashboard UI:**
1. Analytics dashboard
2. Geographic maps
3. Device/browser charts
4. Time-series charts

### Phase 4: Branded Links (Week 6)

**Backend:**
1. Domain management API
2. Domain verification system
3. SSL certificate management (Let's Encrypt)
4. Multi-domain routing

**Dashboard UI:**
1. Domain management UI
2. Domain verification flow
3. Domain settings

### Phase 5: Link-in-Bio (Week 7)

**Backend:**
1. Link-in-bio page API
2. Page rendering endpoint
3. Page analytics

**Dashboard UI:**
1. Page builder UI
2. Design customization
3. Preview functionality

### Phase 6: Advanced Features (Week 8)

**Backend:**
1. UTM parameter support
2. Mobile link detection
3. Deep linking integration
4. Business card feature

**Dashboard UI:**
1. UTM parameter UI
2. Mobile link configuration
3. Business card builder

### Phase 7: NivoStack Integration (Week 9)

**Integration:**
1. Link clicks → Device registration
2. Link clicks → Session creation
3. Link analytics in device dashboard
4. Link-to-app conversion tracking

**Dashboard UI:**
1. Integrated analytics views
2. Link performance in device context

---

## Technical Architecture

### Short Code Generation

```typescript
// Base62 encoding for short codes
const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateShortCode(length: number = 7): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += BASE62_CHARS[Math.floor(Math.random() * BASE62_CHARS.length)];
  }
  return code;
}

async function createShortLink(longUrl: string, customCode?: string): Promise<ShortLink> {
  const shortCode = customCode || await generateUniqueShortCode();
  
  return await prisma.shortLink.create({
    data: {
      shortCode,
      longUrl,
      projectId: project.id,
    },
  });
}
```

### Redirect Endpoint

```typescript
// app/api/[shortCode]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  const shortLink = await prisma.shortLink.findUnique({
    where: { shortCode: params.shortCode },
  });

  if (!shortLink || !shortLink.isActive) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  if (shortLink.expiresAt && shortLink.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Link expired' }, { status: 410 });
  }

  // Track click
  await trackClick(shortLink.id, request);

  // Build destination URL with UTM parameters
  const destinationUrl = buildDestinationUrl(shortLink, request);

  // Redirect
  return NextResponse.redirect(destinationUrl, {
    status: shortLink.redirectType === '301' ? 301 : 302,
  });
}
```

### Click Tracking

```typescript
async function trackClick(shortLinkId: string, request: NextRequest) {
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const referrer = request.headers.get('referer') || '';
  
  // Geolocation (using MaxMind or similar)
  const geo = await getGeolocation(ipAddress);
  
  // Device detection
  const deviceInfo = parseUserAgent(userAgent);
  
  // NivoStack Integration: Try to link to device/session
  const deviceId = await findDeviceByIP(ipAddress);
  const sessionId = await getCurrentSession(deviceId);
  
  await prisma.click.create({
    data: {
      shortLinkId,
      ipAddress,
      userAgent,
      referrer,
      country: geo.country,
      city: geo.city,
      deviceType: deviceInfo.deviceType,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      deviceId,
      sessionId,
    },
  });
  
  // Update link click count
  await prisma.shortLink.update({
    where: { id: shortLinkId },
    data: {
      clickCount: { increment: 1 },
      lastClickedAt: new Date(),
    },
  });
}
```

### QR Code Generation

```typescript
import QRCode from 'qrcode';

async function generateQRCode(shortLink: ShortLink, options: QROptions) {
  const shortUrl = `${options.domain || 'https://nivostack.com'}/${shortLink.shortCode}`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    width: options.size || 300,
    color: {
      dark: options.foregroundColor || '#000000',
      light: options.backgroundColor || '#FFFFFF',
    },
  });
  
  // If logo, overlay it
  if (options.logoUrl) {
    qrCodeDataUrl = await overlayLogo(qrCodeDataUrl, options.logoUrl);
  }
  
  return qrCodeDataUrl;
}
```

---

## Integration with NivoStack

### Link Clicks → Device Registration

When a link is clicked from a mobile device, automatically register the device:

```typescript
async function trackClick(shortLinkId: string, request: NextRequest) {
  // ... existing tracking code ...
  
  // If mobile device and not registered, create device
  if (deviceInfo.deviceType === 'mobile' && !deviceId) {
    const device = await prisma.device.create({
      data: {
        deviceId: generateDeviceId(),
        platform: deviceInfo.os === 'iOS' ? 'ios' : 'android',
        osVersion: deviceInfo.osVersion,
        // ... other device info ...
        projectId: shortLink.projectId,
      },
    });
    deviceId = device.id;
  }
  
  // Create session if device exists
  if (deviceId) {
    const session = await prisma.session.create({
      data: {
        deviceId,
        sessionToken: generateSessionToken(),
        action: 'start',
        // ... session context ...
      },
    });
    sessionId = session.id;
  }
}
```

### Link Analytics in Device Dashboard

Add link performance to device details:

```typescript
// app/api/devices/[id]/links/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const device = await prisma.device.findUnique({
    where: { id: params.id },
    include: {
      clicks: {
        include: {
          shortLink: true,
        },
        orderBy: {
          clickedAt: 'desc',
        },
      },
    },
  });
  
  return NextResponse.json({
    device,
    linkStats: {
      totalClicks: device.clicks.length,
      uniqueLinks: new Set(device.clicks.map(c => c.shortLinkId)).size,
      topLinks: getTopLinks(device.clicks),
    },
  });
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Link creation time | < 1 second |
| Redirect latency | < 100ms |
| Analytics accuracy | > 99% |
| QR code generation | < 500ms |
| Dashboard load time | < 2 seconds |
| API response time | < 200ms |

---

## Security Considerations

1. **Rate Limiting**: Prevent abuse of link creation and redirect endpoints
2. **URL Validation**: Sanitize and validate all URLs
3. **Password Protection**: Secure password hashing for protected links
4. **Domain Verification**: Prevent domain hijacking
5. **Click Fraud Prevention**: Detect and filter bot traffic
6. **Privacy**: IP address anonymization for GDPR compliance

---

## Future Enhancements

1. **A/B Testing**: Test different destination URLs
2. **Link Expiration**: Automatic link expiration and cleanup
3. **Link Preview**: Generate link preview cards
4. **Bulk Operations**: Bulk link management
5. **API Rate Limits**: Per-project API quotas
6. **Webhooks**: Notify on link clicks
7. **Custom Redirect Pages**: Branded redirect pages
8. **Link Retargeting**: Change destination based on user segment

---

## Related Documents

- [Main PRD](./PRD.md)
- [Business Configuration PRD](./BUSINESS_CONFIGURATION_PRD.md)
- [Analytics Documentation](../features/ANALYTICS.md)

---

*Document Owner: NivoStack Product Team*  
*Review Cycle: Bi-weekly*

