# Unified Link Management Platform - Bitly + Branch.io Integration PRD

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Planning  
**Combines:** Bitly URL Shortening + Branch.io Deep Linking & Attribution

---

## Executive Summary

This PRD outlines a unified link management platform that combines the best features from Bitly (URL shortening, QR codes, link analytics) and Branch.io (deep linking, attribution, mobile marketing) into a single, integrated solution within NivoStack. This unified approach eliminates feature conflicts and provides a comprehensive link management and attribution platform.

---

## Product Vision

**"A unified platform for link management, deep linking, and attribution that seamlessly integrates with mobile app analytics"**

This unified platform provides:
- **Link Shortening**: Create short, trackable links (Bitly)
- **Deep Linking**: Seamless web-to-app experiences (Branch.io)
- **QR Codes**: Generate QR codes for any link (Bitly)
- **Attribution**: Comprehensive marketing attribution (Branch.io)
- **Analytics**: Unified analytics across all link types (Both)
- **Integration**: Deep integration with NivoStack's device tracking and analytics

---

## Feature Comparison & Conflict Resolution

### Common Features

| Feature | Bitly Approach | Branch.io Approach | Unified Approach |
|---------|---------------|-------------------|------------------|
| **Link Shortening** | Simple URL shortening | Deep link creation (also shortened) | **Unified**: Single link type that supports both |
| **QR Codes** | Static/Dynamic QR codes | QR codes for deep links | **Unified**: QR codes work with all link types |
| **Analytics** | Click tracking, geographic, device | Attribution, installs, conversions | **Unified**: Combined analytics dashboard |
| **Mobile Links** | Platform-specific redirects | Deep linking with fallbacks | **Unified**: Deep linking with URL shortening fallback |
| **Campaign Tracking** | UTM parameters | Channel/campaign/feature tags | **Unified**: Support both UTM and Branch-style tags |
| **Custom Domains** | Branded links | Universal Links/App Links | **Unified**: Single domain for all link types |

### Conflict Resolution Strategy

#### 1. Link Type Unification

**Problem**: Bitly creates simple shortened URLs, Branch.io creates deep links.

**Solution**: Create a unified `Link` model that supports both use cases:

```prisma
model Link {
  id            String   @id @default(cuid())
  linkId        String   @unique // Short identifier (e.g., "abc123")
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  
  // Link Type
  linkType      String   @default("short") // short, deep, qr_only
  isDeepLink    Boolean  @default(false)
  
  // URL Configuration (Bitly-style)
  longUrl       String?  @db.Text // Original URL (for short links)
  
  // Deep Link Configuration (Branch.io-style)
  deepLinkData  Json?    // Custom data for deep linking
  screen        String?  // Target screen in app
  fallbackUrl   String?  @db.Text // Web fallback
  
  // App Store URLs (Both)
  iosUrl        String?
  androidUrl    String?
  desktopUrl    String?
  
  // Campaign Tracking (Unified)
  // Bitly-style UTM parameters
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  utmTerm       String?
  utmContent    String?
  
  // Branch.io-style tags
  channel       String?
  feature       String?
  tags          String[]
  
  // Settings (Both)
  expiresAt     DateTime?
  passwordHash  String?
  isActive      Boolean  @default(true)
  redirectType  String   @default("302") // 301 or 302
  
  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  clicks        LinkClick[]
  qrCodes       QrCode[]
  installs      Install[]
  conversions   Conversion[]
}
```

#### 2. Analytics Unification

**Problem**: Bitly tracks clicks, Branch.io tracks attribution and conversions.

**Solution**: Unified analytics model that supports both:

```prisma
model LinkClick {
  id            String    @id @default(cuid())
  linkId        String
  link          Link      @relation(fields: [linkId], references: [id])
  
  // Click Metadata (Bitly-style)
  ipAddress     String
  userAgent     String?   @db.Text
  referrer      String?   @db.Text
  country       String?
  city          String?
  deviceType    String?
  os            String?
  browser       String?
  
  // Attribution (Branch.io-style)
  clickId       String    @unique // Unique click identifier
  fingerprint   String?   // For install matching
  fingerprintData Json?
  
  // Campaign Data (Unified)
  channel       String?
  campaign      String?
  feature       String?
  tags          String[]
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  
  // NivoStack Integration
  deviceId      String?
  device        Device?   @relation(fields: [deviceId], references: [id])
  sessionId     String?
  session       Session?  @relation(fields: [sessionId], references: [id])
  
  clickedAt     DateTime  @default(now())
  
  // Relations
  install       Install?
  conversions   Conversion[]
  
  @@index([linkId])
  @@index([clickId])
  @@index([fingerprint])
  @@index([deviceId])
}
```

#### 3. QR Code Unification

**Problem**: Both platforms support QR codes but with different use cases.

**Solution**: QR codes work with any link type:

```prisma
model QrCode {
  id            String    @id @default(cuid())
  linkId        String?   // Can be null for standalone QR codes
  link          Link?     @relation(fields: [linkId], references: [id])
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  // QR Code Type
  type          String    @default("url") // url, vcard, wifi, sms, email, deep_link
  data          Json?     // Type-specific data
  
  // Design (Bitly-style)
  foregroundColor String  @default("#000000")
  backgroundColor String  @default("#FFFFFF")
  logoUrl        String?
  errorCorrectionLevel String @default("M")
  size           Int      @default(300)
  
  // Settings
  isDynamic     Boolean   @default(true) // Can change destination
  
  // Analytics
  scanCount     Int       @default(0)
  lastScannedAt DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([projectId])
  @@index([linkId])
}
```

#### 4. Domain Management Unification

**Problem**: Bitly uses custom domains for branded links, Branch.io uses domains for Universal Links/App Links.

**Solution**: Single domain management system:

```prisma
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
  
  // Domain Purpose
  purposes      String[]   // ["short_links", "deep_links", "universal_links", "app_links"]
  
  // Settings
  isDefault     Boolean    @default(false)
  
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  
  links          Link[]
  
  @@index([projectId])
}
```

---

## Unified Feature Set

### Core Features (Combined)

#### 1. Link Creation (Unified)

**Use Cases:**
- **Simple URL Shortening**: `https://links.example.com/abc123` → `https://long-url.com`
- **Deep Link**: `https://links.example.com/xyz789` → Opens app to specific screen
- **QR Code Link**: QR code that points to any link type

**API:**
```typescript
POST /api/links
{
  // Link Type
  linkType: "short" | "deep" | "qr_only",
  isDeepLink: boolean,
  
  // For short links
  longUrl?: string,
  
  // For deep links
  deepLinkData?: {
    screen: string,
    customData: Record<string, any>
  },
  fallbackUrl?: string,
  
  // App Store URLs (both)
  iosUrl?: string,
  androidUrl?: string,
  desktopUrl?: string,
  
  // Campaign Tracking (both)
  utmSource?: string,
  utmMedium?: string,
  utmCampaign?: string,
  channel?: string,
  feature?: string,
  tags?: string[],
  
  // Settings
  expiresAt?: Date,
  password?: string,
  customBackHalf?: string,
}
```

#### 2. Link Redirection (Unified)

**Flow:**
```
1. User clicks link: https://links.example.com/abc123
2. System detects link type:
   - If short link: Redirect to longUrl (with UTM params)
   - If deep link: Check if app installed
     - If installed: Open app with deep link data
     - If not installed: Redirect to app store, then open app after install
3. Track click with unified analytics
```

**Implementation:**
```typescript
export async function GET(request: NextRequest, { params }) {
  const link = await prisma.link.findUnique({
    where: { linkId: params.linkId },
  });

  // Track click
  const click = await trackClick(link.id, request);

  // Determine destination based on link type
  if (link.linkType === 'short') {
    // Bitly-style: Redirect to long URL
    const destinationUrl = buildDestinationUrl(link, request);
    return NextResponse.redirect(destinationUrl, link.redirectType === '301' ? 301 : 302);
  } else if (link.linkType === 'deep' || link.isDeepLink) {
    // Branch.io-style: Deep link handling
    const userAgent = request.headers.get('user-agent') || '';
    const device = detectDevice(userAgent);
    
    if (device.os === 'iOS') {
      // Universal Link - iOS will handle
      return NextResponse.redirect(`https://${link.domain.domain}/${link.linkId}`, 302);
    } else if (device.os === 'Android') {
      // App Link - Android will handle
      return NextResponse.redirect(`https://${link.domain.domain}/${link.linkId}`, 302);
    } else {
      // Desktop - redirect to fallback
      return NextResponse.redirect(link.fallbackUrl || link.desktopUrl, 302);
    }
  }
}
```

#### 3. QR Code Generation (Unified)

**Use Cases:**
- QR code for short link
- QR code for deep link
- QR code for vCard, WiFi, SMS, etc.

**Implementation:**
```typescript
POST /api/qr-codes
{
  linkId?: string, // Optional - can create QR without link
  type: "url" | "vcard" | "wifi" | "sms" | "email" | "deep_link",
  data?: Record<string, any>, // Type-specific data
  design: {
    foregroundColor: string,
    backgroundColor: string,
    logoUrl?: string,
    size: number,
  }
}
```

#### 4. Analytics Dashboard (Unified)

**Metrics:**
- **Clicks**: Total clicks, unique clicks, clicks over time (Bitly)
- **Attribution**: Installs, conversions, attribution models (Branch.io)
- **Geographic**: Country, city, region (Both)
- **Device**: Device type, OS, browser (Both)
- **Campaign**: Performance by channel, campaign, feature (Both)
- **Journey**: User journey from click to conversion (Branch.io)

**Dashboard Views:**
1. **Overview**: Total clicks, installs, conversions, revenue
2. **Links**: Performance by link
3. **Campaigns**: Performance by campaign/channel
4. **Attribution**: Attribution analysis
5. **Journeys**: User journey visualization

#### 5. Attribution (Branch.io)

**Attribution Models:**
- First-touch
- Last-touch
- Linear
- Time-decay
- Position-based

**Implementation:**
```typescript
GET /api/attribution/calculate
{
  conversionId: string,
  model: "first_touch" | "last_touch" | "linear" | "time_decay" | "position_based"
}
```

#### 6. Link-in-Bio Pages (Bitly)

**Implementation:**
```prisma
model LinkInBioPage {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  title         String
  description   String?
  profileImageUrl String?
  
  // Design
  theme         String    @default("light")
  backgroundColor String?
  textColor     String?
  
  // Custom Domain
  customDomain  String?
  domainId      String?
  domain        Domain?   @relation(fields: [domainId], references: [id])
  
  // Links (can be short links or deep links)
  links         LinkInBioPageLink[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model LinkInBioPageLink {
  id            String         @id @default(cuid())
  pageId        String
  page          LinkInBioPage  @relation(fields: [pageId], references: [id])
  linkId        String
  link          Link           @relation(fields: [linkId], references: [id])
  
  title         String
  iconUrl       String?
  order         Int
  
  clickCount    Int            @default(0)
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}
```

---

## Database Schema (Unified)

```prisma
// Unified Link Model
model Link {
  id            String   @id @default(cuid())
  linkId        String   @unique
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  
  // Link Type
  linkType      String   @default("short") // short, deep, qr_only
  isDeepLink    Boolean  @default(false)
  
  // URL Configuration
  longUrl       String?  @db.Text
  customBackHalf String? @unique
  domainId      String?
  domain        Domain?  @relation(fields: [domainId], references: [id])
  
  // Deep Link Configuration
  deepLinkData  Json?
  screen        String?
  fallbackUrl   String?  @db.Text
  
  // App Store URLs
  iosUrl        String?
  androidUrl    String?
  desktopUrl    String?
  
  // Campaign Tracking (Unified)
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  utmTerm       String?
  utmContent    String?
  channel       String?
  feature       String?
  tags          String[]
  
  // Settings
  expiresAt     DateTime?
  passwordHash  String?
  isActive      Boolean  @default(true)
  redirectType  String   @default("302")
  clickLimit    Int?
  
  // Metadata
  title         String?
  description   String?
  notes         String?  @db.Text
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  clicks        LinkClick[]
  qrCodes       QrCode[]
  installs      Install[]
  conversions   Conversion[]
  linkInBioPages LinkInBioPageLink[]
  
  @@index([projectId])
  @@index([linkId])
  @@index([customBackHalf])
  @@index([channel, campaign])
}

// Unified Click Model
model LinkClick {
  id            String    @id @default(cuid())
  linkId        String
  link          Link      @relation(fields: [linkId], references: [id])
  
  // Click Metadata
  clickId       String    @unique
  ipAddress     String
  userAgent     String?   @db.Text
  referrer      String?   @db.Text
  country       String?
  city          String?
  region        String?
  deviceType    String?
  os            String?
  browser       String?
  
  // Attribution (Branch.io)
  fingerprint   String?
  fingerprintData Json?
  
  // Campaign Data (Unified)
  channel       String?
  campaign      String?
  feature       String?
  tags          String[]
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  utmTerm       String?
  utmContent    String?
  
  // NivoStack Integration
  deviceId      String?
  device        Device?   @relation(fields: [deviceId], references: [id])
  sessionId     String?
  session       Session?  @relation(fields: [sessionId], references: [id])
  
  clickedAt     DateTime  @default(now())
  
  // Relations
  install       Install?
  conversions   Conversion[]
  touchpoints   AttributionTouchpoint[]
  
  @@index([linkId])
  @@index([clickId])
  @@index([fingerprint])
  @@index([clickedAt])
  @@index([deviceId])
  @@index([channel, campaign])
}

// Install Model (Branch.io)
model Install {
  id            String    @id @default(cuid())
  linkId        String?
  link          Link?     @relation(fields: [linkId], references: [id])
  clickId       String?   @unique
  click         LinkClick? @relation(fields: [clickId], references: [id])
  
  deviceId      String
  device        Device    @relation(fields: [deviceId], references: [id])
  platform      String
  osVersion     String?
  appVersion    String?
  
  channel       String?
  campaign      String?
  feature       String?
  tags          String[]
  
  attributionModel String?
  attributedClickId String?
  
  isOrganic     Boolean   @default(false)
  fingerprint   String?
  installedAt   DateTime  @default(now())
  
  conversions   Conversion[]
  
  @@index([deviceId])
  @@index([linkId])
  @@index([clickId])
  @@index([fingerprint])
}

// Conversion Model (Branch.io)
model Conversion {
  id            String    @id @default(cuid())
  linkId        String?
  link          Link?     @relation(fields: [linkId], references: [id])
  clickId       String?
  click         LinkClick? @relation(fields: [clickId], references: [id])
  installId     String?
  install       Install?  @relation(fields: [installId], references: [id])
  
  eventName     String
  eventValue    Float?
  eventData     Json?
  
  channel       String?
  campaign      String?
  feature       String?
  
  convertedAt   DateTime  @default(now())
  
  touchpoints   AttributionTouchpoint[]
  
  @@index([linkId])
  @@index([clickId])
  @@index([installId])
  @@index([eventName])
  @@index([convertedAt])
}

// Attribution Touchpoint (Branch.io)
model AttributionTouchpoint {
  id            String    @id @default(cuid())
  conversionId  String
  conversion    Conversion @relation(fields: [conversionId], references: [id])
  clickId       String?
  click         LinkClick? @relation(fields: [clickId], references: [id])
  
  channel       String
  campaign      String?
  timestamp     DateTime
  credit        Float
  attributionModel String
  
  @@index([conversionId])
  @@index([clickId])
}

// QR Code Model (Bitly + Branch.io)
model QrCode {
  id            String    @id @default(cuid())
  linkId        String?
  link          Link?     @relation(fields: [linkId], references: [id])
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  type          String    @default("url")
  data          Json?
  
  foregroundColor String  @default("#000000")
  backgroundColor String  @default("#FFFFFF")
  logoUrl        String?
  errorCorrectionLevel String @default("M")
  size           Int      @default(300)
  
  isDynamic     Boolean   @default(true)
  
  scanCount     Int       @default(0)
  lastScannedAt DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([projectId])
  @@index([linkId])
}

// Domain Model (Unified)
model Domain {
  id            String     @id @default(cuid())
  projectId     String
  project       Project    @relation(fields: [projectId], references: [id])
  
  domain        String     @unique
  isVerified    Boolean    @default(false)
  verificationToken String @unique
  verifiedAt    DateTime?
  
  sslEnabled    Boolean    @default(true)
  sslCertificate String?   @db.Text
  
  purposes      String[]   // ["short_links", "deep_links", "universal_links", "app_links"]
  
  isDefault     Boolean    @default(false)
  
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  
  links          Link[]
  linkInBioPages LinkInBioPage[]
  
  @@index([projectId])
}

// Link-in-Bio Page (Bitly)
model LinkInBioPage {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  title         String
  description   String?
  profileImageUrl String?
  
  theme         String    @default("light")
  backgroundColor String?
  textColor     String?
  
  customDomain  String?
  domainId      String?
  domain        Domain?   @relation(fields: [domainId], references: [id])
  
  viewCount     Int       @default(0)
  lastViewedAt DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  links         LinkInBioPageLink[]
  
  @@index([projectId])
}

model LinkInBioPageLink {
  id            String         @id @default(cuid())
  pageId        String
  page          LinkInBioPage  @relation(fields: [pageId], references: [id])
  linkId        String
  link          Link           @relation(fields: [linkId], references: [id])
  
  title         String
  iconUrl       String?
  order         Int
  
  clickCount    Int            @default(0)
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  @@index([pageId])
  @@index([linkId])
}

// A/B Test (Branch.io)
model ABTest {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  name          String
  description   String?
  isActive      Boolean   @default(true)
  
  startDate     DateTime
  endDate       DateTime?
  trafficSplit  Int       @default(50)
  
  primaryMetric String
  secondaryMetrics String[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  variants      ABTestVariant[]
  
  @@index([projectId])
}

model ABTestVariant {
  id            String    @id @default(cuid())
  testId        String
  test          ABTest    @relation(fields: [testId], references: [id])
  linkId        String
  link          Link      @relation(fields: [linkId], references: [id])
  
  name          String
  weight        Int
  
  clicks        Int       @default(0)
  installs      Int       @default(0)
  conversions   Int       @default(0)
  conversionValue Float   @default(0)
  
  @@index([testId])
  @@index([linkId])
}

// Referral Program (Branch.io)
model Referral {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  referrerId    String
  referredId    String?
  linkId        String
  link          Link      @relation(fields: [linkId], references: [id])
  
  status        String    @default("pending")
  installId     String?
  install       Install?  @relation(fields: [installId], references: [id])
  
  rewardType    String?
  rewardAmount  Float?
  rewardedAt   DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([projectId])
  @@index([referrerId])
  @@index([referredId])
  @@index([linkId])
}
```

---

## API Endpoints (Unified)

### Link Management

```
POST   /api/links                    Create link (short or deep)
GET    /api/links                    List links (paginated, filterable)
GET    /api/links/:id                Get link details
PUT    /api/links/:id                Update link
DELETE /api/links/:id                Delete link
POST   /api/links/bulk               Bulk create links
GET    /api/links/:id/analytics       Get link analytics
```

### Link Redirection

```
GET    /:linkId                      Redirect (handles both short and deep links)
GET    /:linkId/info                 Get link info (for preview)
POST   /:linkId/password             Verify password (if protected)
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

### Attribution & Analytics

```
GET    /api/analytics/overview       Get overview metrics
GET    /api/analytics/clicks         Get click analytics
GET    /api/analytics/installs       Get install analytics
GET    /api/analytics/conversions    Get conversion analytics
GET    /api/analytics/journey/:clickId Get user journey
GET    /api/analytics/campaigns      Get campaign performance
GET    /api/analytics/channels       Get channel performance
GET    /api/analytics/geographic     Get geographic analytics
GET    /api/analytics/devices        Get device analytics
GET    /api/analytics/timeseries     Get time-series data
POST   /api/attribution/calculate    Calculate attribution (custom model)
```

### Domains

```
POST   /api/domains                  Add custom domain
GET    /api/domains                  List domains
GET    /api/domains/:id              Get domain details
DELETE /api/domains/:id              Remove domain
POST   /api/domains/:id/verify       Verify domain ownership
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

### A/B Testing

```
POST   /api/ab-tests                 Create A/B test
GET    /api/ab-tests                 List A/B tests
GET    /api/ab-tests/:id              Get A/B test details
PUT    /api/ab-tests/:id              Update A/B test
DELETE /api/ab-tests/:id              Delete A/B test
GET    /api/ab-tests/:id/results     Get A/B test results
```

### Referral Program

```
POST   /api/referrals                Create referral link
GET    /api/referrals                List referrals
GET    /api/referrals/:id            Get referral details
GET    /api/referrals/user/:userId   Get user's referrals
POST   /api/referrals/:id/reward     Reward referral
```

---

## Implementation Plan

### Phase 1: Foundation (Weeks 1-4)

**Week 1-2: Database & Core API**
- Create unified Prisma schema
- Implement link creation API (supports both short and deep)
- Implement link redirect API (handles both types)
- Basic link management (CRUD)

**Week 3: Click Tracking**
- Implement unified click tracking
- Geographic analytics
- Device/browser analytics
- Basic analytics dashboard

**Week 4: QR Codes**
- QR code generation API
- QR code customization
- QR code analytics

### Phase 2: Deep Linking & Attribution (Weeks 5-8)

**Week 5-6: Deep Linking**
- Deep link creation and routing
- iOS Universal Links support
- Android App Links support
- App store redirects
- Deferred deep linking

**Week 7: Install Tracking**
- Install detection
- Fingerprinting
- Install-to-click matching
- Install analytics

**Week 8: Attribution**
- Attribution models (first-touch, last-touch, etc.)
- Conversion tracking
- Attribution dashboard

### Phase 3: Advanced Features (Weeks 9-12)

**Week 9: Branded Links**
- Custom domain support
- Domain verification
- SSL certificate management
- Universal Links/App Links configuration

**Week 10: Link-in-Bio Pages**
- Page creation API
- Page rendering
- Page analytics

**Week 11: A/B Testing**
- A/B test creation
- Variant assignment
- Test results

**Week 12: Referral Program**
- Referral link generation
- Referral tracking
- Reward system

### Phase 4: Integration & Polish (Weeks 13-14)

**Week 13: NivoStack Integration**
- Link clicks → Device registration
- Link clicks → Session creation
- Attribution → Analytics integration
- Unified dashboard

**Week 14: Testing & Documentation**
- End-to-end testing
- Performance optimization
- Documentation
- SDK updates

---

## Technical Implementation Details

### Unified Link Creation

```typescript
async function createLink(data: CreateLinkData): Promise<Link> {
  const linkId = data.customBackHalf || generateLinkId();
  
  // Determine link type
  const linkType = data.isDeepLink ? 'deep' : (data.longUrl ? 'short' : 'qr_only');
  
  const link = await prisma.link.create({
    data: {
      linkId,
      projectId: project.id,
      linkType,
      isDeepLink: data.isDeepLink || false,
      longUrl: data.longUrl,
      customBackHalf: data.customBackHalf,
      domainId: data.domainId,
      deepLinkData: data.deepLinkData,
      screen: data.screen,
      fallbackUrl: data.fallbackUrl,
      iosUrl: data.iosUrl,
      androidUrl: data.androidUrl,
      desktopUrl: data.desktopUrl,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      channel: data.channel,
      feature: data.feature,
      tags: data.tags || [],
      expiresAt: data.expiresAt,
      passwordHash: data.password ? await hashPassword(data.password) : null,
      redirectType: data.redirectType || '302',
    },
  });
  
  return link;
}
```

### Unified Link Redirect

```typescript
export async function GET(request: NextRequest, { params }) {
  const link = await prisma.link.findUnique({
    where: { linkId: params.linkId },
    include: { domain: true },
  });

  if (!link || !link.isActive) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  // Track click
  const click = await trackClick(link.id, request);

  // Handle based on link type
  if (link.linkType === 'short' || link.longUrl) {
    // Bitly-style: Redirect to long URL
    const destinationUrl = buildDestinationUrl(link, request);
    return NextResponse.redirect(destinationUrl, link.redirectType === '301' ? 301 : 302);
  } else if (link.linkType === 'deep' || link.isDeepLink) {
    // Branch.io-style: Deep link handling
    return handleDeepLinkRedirect(link, request, click);
  }
}

async function handleDeepLinkRedirect(
  link: Link,
  request: NextRequest,
  click: LinkClick
) {
  const userAgent = request.headers.get('user-agent') || '';
  const device = detectDevice(userAgent);
  
  // Check if app installed (via fingerprinting)
  const isInstalled = await checkAppInstalled(click.fingerprint);
  
  if (device.os === 'iOS') {
    if (isInstalled) {
      // Universal Link - iOS will handle
      const domain = link.domain?.domain || defaultDomain;
      return NextResponse.redirect(`https://${domain}/${link.linkId}`, 302);
    } else {
      // Redirect to App Store
      return NextResponse.redirect(link.iosUrl || defaultAppStoreUrl, 302);
    }
  } else if (device.os === 'Android') {
    if (isInstalled) {
      // App Link - Android will handle
      const domain = link.domain?.domain || defaultDomain;
      return NextResponse.redirect(`https://${domain}/${link.linkId}`, 302);
    } else {
      // Redirect to Play Store
      return NextResponse.redirect(link.androidUrl || defaultPlayStoreUrl, 302);
    }
  } else {
    // Desktop - redirect to fallback
    return NextResponse.redirect(link.fallbackUrl || link.desktopUrl || defaultWebUrl, 302);
  }
}
```

### Unified Analytics

```typescript
async function getUnifiedAnalytics(linkId: string, filters: AnalyticsFilters) {
  const link = await prisma.link.findUnique({
    where: { id: linkId },
    include: {
      clicks: {
        where: {
          clickedAt: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        },
      },
      installs: {
        where: {
          installedAt: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        },
      },
      conversions: {
        where: {
          convertedAt: {
            gte: filters.startDate,
            lte: filters.endDate,
          },
        },
      },
    },
  });
  
  return {
    // Overview
    totalClicks: link.clicks.length,
    uniqueClicks: new Set(link.clicks.map(c => c.ipAddress)).size,
    totalInstalls: link.installs.length,
    totalConversions: link.conversions.length,
    totalRevenue: link.conversions.reduce((sum, c) => sum + (c.eventValue || 0), 0),
    
    // Geographic (Bitly-style)
    byCountry: groupBy(link.clicks, 'country'),
    byCity: groupBy(link.clicks, 'city'),
    
    // Device (Both)
    byDeviceType: groupBy(link.clicks, 'deviceType'),
    byOS: groupBy(link.clicks, 'os'),
    byBrowser: groupBy(link.clicks, 'browser'),
    
    // Campaign (Unified)
    byChannel: groupBy(link.clicks, 'channel'),
    byCampaign: groupBy(link.clicks, 'campaign'),
    byUTMSource: groupBy(link.clicks, 'utmSource'),
    
    // Attribution (Branch.io-style)
    installRate: link.clicks.length > 0 ? link.installs.length / link.clicks.length : 0,
    conversionRate: link.clicks.length > 0 ? link.conversions.length / link.clicks.length : 0,
    averageTimeToInstall: calculateAverageTimeToInstall(link.clicks, link.installs),
    averageTimeToConversion: calculateAverageTimeToConversion(link.clicks, link.conversions),
    
    // Time-series (Both)
    clicksOverTime: groupByTime(link.clicks, 'clickedAt'),
    installsOverTime: groupByTime(link.installs, 'installedAt'),
    conversionsOverTime: groupByTime(link.conversions, 'convertedAt'),
  };
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Link creation time | < 1 second |
| Redirect latency | < 150ms |
| Install matching accuracy | > 95% |
| Attribution calculation time | < 500ms |
| Dashboard load time | < 2 seconds |
| QR code generation | < 500ms |
| API response time | < 200ms |

---

## Security Considerations

1. **Link Validation**: Validate all link data
2. **Deep Link Security**: Validate deep link data before routing
3. **Fingerprinting Privacy**: Anonymize fingerprints for GDPR
4. **Click Fraud Prevention**: Detect and filter bot traffic
5. **Rate Limiting**: Prevent abuse of link creation
6. **Data Encryption**: Encrypt sensitive attribution data
7. **Domain Verification**: Secure domain verification process

---

## Future Enhancements

1. **Machine Learning Attribution**: ML-based attribution models
2. **Real-Time Analytics**: Live analytics updates
3. **Webhooks**: Notify on clicks, installs, conversions
4. **API Rate Limits**: Per-project API quotas
5. **Advanced A/B Testing**: Multi-variant tests, statistical significance
6. **Social Sharing**: Enhanced social media integration
7. **Email Deep Linking**: Advanced email campaign tracking
8. **Universal Links Auto-Config**: Automatic apple-app-site-association setup
9. **App Links Auto-Config**: Automatic assetlinks.json setup

---

## Related Documents

- [Main PRD](./PRD.md)
- [URL Shortener PRD](./URL_SHORTENER_PRD.md)
- [Branch.io PRD](./BRANCH_IO_PRD.md)
- [Bitly Feature Analysis](./BITLY_FEATURE_ANALYSIS.md)

---

*Document Owner: NivoStack Product Team*  
*Review Cycle: Bi-weekly*

