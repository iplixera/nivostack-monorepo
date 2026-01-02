# Branch.io Deep Linking & Attribution - Product Requirements Document

**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Planning  
**Reference:** Branch.io Platform Analysis

---

## Executive Summary

This PRD outlines the requirements for implementing Branch.io-like deep linking, attribution, and mobile marketing features within NivoStack. Branch.io is a leading mobile attribution and deep linking platform that enables seamless user experiences across web and mobile, with comprehensive attribution analytics for marketing campaigns.

---

## Product Vision

**"Enable seamless user journeys from web to mobile app with comprehensive attribution and deep linking capabilities"**

This feature extends NivoStack's value proposition by allowing users to:
- Create deep links that work whether app is installed or not
- Track complete user journeys from click to conversion
- Measure marketing campaign effectiveness with multi-touch attribution
- Enable seamless app-to-app and web-to-app experiences
- Provide comprehensive attribution analytics

---

## Target Users

### Primary Users
1. **Marketing Teams** - Track campaign performance, measure ROI, optimize ad spend
2. **Product Managers** - Understand user acquisition sources and conversion funnels
3. **Mobile App Developers** - Implement deep linking and handle app routing
4. **Growth Teams** - Analyze user journeys and optimize conversion paths

### Secondary Users
1. **Analytics Teams** - Deep dive into attribution data and user behavior
2. **Support Teams** - Share deep links for customer support
3. **Business Owners** - Understand marketing ROI and user acquisition costs

---

## Competitive Analysis: Branch.io Features

### Core Features Breakdown

#### 1. Universal Links / Deep Links

**What Branch.io Does:**
- Creates links that work whether app is installed or not
- If app installed: Opens app directly to specific content
- If app not installed: Redirects to app store, then opens app after install
- Supports deferred deep linking (attribution after install)
- Handles iOS Universal Links and Android App Links

**How Branch.io Implements:**

**iOS Universal Links:**
```
1. Configure apple-app-site-association file on domain
2. Link format: https://yourdomain.com/abc123
3. iOS detects Universal Link and opens app
4. App receives deep link data via continueUserActivity
```

**Android App Links:**
```
1. Configure assetlinks.json on domain
2. Link format: https://yourdomain.com/abc123
3. Android detects App Link and opens app
4. App receives deep link data via Intent
```

**Fallback Flow:**
```
1. User clicks link
2. Branch checks if app installed (via fingerprinting)
3. If installed: Open app with deep link data
4. If not installed: Redirect to app store
5. After install: Open app with original deep link data (deferred deep linking)
```

**Technical Implementation:**
```typescript
// Branch link structure
{
  $fallback_url: "https://example.com/web",
  $ios_url: "https://apps.apple.com/app/id123456",
  $android_url: "https://play.google.com/store/apps/details?id=com.app",
  $desktop_url: "https://example.com/web",
  $custom_data: {
    screen: "product",
    product_id: "12345",
    campaign: "summer-sale"
  }
}
```

#### 2. Attribution & Analytics

**What Branch.io Does:**
- Multi-touch attribution (first-touch, last-touch, linear, time-decay)
- Tracks complete user journey from click to conversion
- Measures installs, opens, purchases, and custom events
- Provides LTV (Lifetime Value) and ROI calculations
- Tracks cross-platform user journeys

**Attribution Models:**
- **First-Touch**: Credit to first interaction
- **Last-Touch**: Credit to last interaction before conversion
- **Linear**: Equal credit to all touchpoints
- **Time-Decay**: More credit to recent interactions
- **Position-Based**: 40% first, 40% last, 20% middle

**Technical Implementation:**
```typescript
// Attribution data structure
{
  click_id: "abc123",
  click_timestamp: "2025-01-15T10:30:00Z",
  install_timestamp: "2025-01-15T10:35:00Z",
  first_touch: {
    channel: "facebook",
    campaign: "summer-sale",
    ad_set: "retargeting"
  },
  last_touch: {
    channel: "google",
    campaign: "search-ads",
    keyword: "mobile app"
  },
  touchpoints: [
    { channel: "facebook", timestamp: "...", credit: 0.4 },
    { channel: "google", timestamp: "...", credit: 0.4 },
    { channel: "email", timestamp: "...", credit: 0.2 }
  ],
  conversion: {
    event: "purchase",
    value: 99.99,
    timestamp: "2025-01-15T11:00:00Z"
  }
}
```

#### 3. Smart Banners

**What Branch.io Does:**
- Displays smart banners on web pages
- Promotes app installation
- Tracks banner impressions and clicks
- Customizable design and messaging
- A/B testing support

**Technical Implementation:**
```html
<!-- Branch Smart Banner -->
<div id="branch-banner">
  <img src="app-icon.png" />
  <div>
    <h3>Get our app</h3>
    <p>Open in app for better experience</p>
  </div>
  <button onclick="openBranchLink()">Open App</button>
</div>
```

#### 4. Cross-Platform Tracking

**What Branch.io Does:**
- Tracks users across web, iOS, Android
- Identifies same user across platforms
- Provides unified user journey view
- Tracks web-to-app conversions

**Technical Implementation:**
```typescript
// User identity resolution
{
  user_id: "user-123",
  identities: {
    web: "web-fingerprint-abc",
    ios: "idfv-xyz",
    android: "android-id-123",
    email: "user@example.com"
  },
  journey: [
    { platform: "web", event: "click", timestamp: "..." },
    { platform: "ios", event: "install", timestamp: "..." },
    { platform: "ios", event: "purchase", timestamp: "..." }
  ]
}
```

#### 5. Content Analytics

**What Branch.io Does:**
- Tracks which content users view
- Measures content engagement
- Tracks sharing and referrals
- Provides content performance metrics

**Technical Implementation:**
```typescript
// Content tracking
{
  content_id: "article-123",
  content_type: "article",
  views: 1000,
  shares: 50,
  clicks: 200,
  conversions: 10
}
```

#### 6. A/B Testing

**What Branch.io Does:**
- Test different deep link destinations
- Test different app store pages
- Test different messaging
- Measure conversion rates

**Technical Implementation:**
```typescript
// A/B test configuration
{
  test_id: "test-123",
  variants: [
    {
      id: "variant-a",
      destination: "product-screen",
      weight: 50
    },
    {
      id: "variant-b",
      destination: "home-screen",
      weight: 50
    }
  ],
  metrics: ["install", "purchase"]
}
```

#### 7. Referral Program

**What Branch.io Does:**
- Track referral links
- Credit referrals to users
- Measure referral performance
- Provide referral analytics

**Technical Implementation:**
```typescript
// Referral tracking
{
  referrer_id: "user-123",
  referred_id: "user-456",
  referral_link: "https://app.link/ref-abc",
  install_timestamp: "...",
  conversion_timestamp: "...",
  reward: {
    type: "credit",
    amount: 10.00
  }
}
```

#### 8. Email Deep Linking

**What Branch.io Does:**
- Creates deep links in emails
- Tracks email opens and clicks
- Measures email campaign performance
- Handles email client limitations

**Technical Implementation:**
```html
<!-- Email deep link -->
<a href="https://app.link/email-campaign-123">
  Open in App
</a>
```

#### 9. Social Media Integration

**What Branch.io Does:**
- Creates shareable links for social media
- Tracks social media shares
- Measures social media performance
- Handles social media deep linking

**Technical Implementation:**
```typescript
// Social sharing
{
  platform: "facebook",
  share_url: "https://app.link/share-abc",
  content: {
    title: "Check out this product",
    description: "...",
    image: "https://..."
  }
}
```

#### 10. Web-to-App Handoff

**What Branch.io Does:**
- Seamlessly transfers users from web to app
- Preserves user context
- Tracks handoff success rate
- Handles app not installed scenario

**Technical Implementation:**
```typescript
// Web-to-app handoff
function handoffToApp(deepLinkData) {
  // Try to open app
  window.location = `myapp://screen/${deepLinkData.screen}`;
  
  // Fallback to app store if app not installed
  setTimeout(() => {
    window.location = appStoreUrl;
  }, 2500);
}
```

---

## Feature Requirements

### Phase 1: Core Deep Linking (MVP)

#### 1.1 Universal Links / App Links
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| DL-1 | Create deep links with custom data | P0 | Planned |
| DL-2 | iOS Universal Links support | P0 | Planned |
| DL-3 | Android App Links support | P0 | Planned |
| DL-4 | Fallback to app store if app not installed | P0 | Planned |
| DL-5 | Deferred deep linking (after install) | P0 | Planned |
| DL-6 | Custom domain support for Universal Links | P1 | Planned |
| DL-7 | Link expiration | P1 | Planned |
| DL-8 | Password-protected deep links | P2 | Planned |

#### 1.2 Deep Link Routing
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| DR-1 | Route to specific app screen | P0 | Planned |
| DR-2 | Pass custom data to app | P0 | Planned |
| DR-3 | Handle deep link in SDK | P0 | Planned |
| DR-4 | Deep link validation | P0 | Planned |
| DR-5 | Deep link preview | P1 | Planned |

#### 1.3 App Store Redirects
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| AS-1 | iOS App Store redirect | P0 | Planned |
| AS-2 | Android Play Store redirect | P0 | Planned |
| AS-3 | Custom app store URLs | P1 | Planned |
| AS-4 | App store redirect tracking | P0 | Planned |

### Phase 2: Attribution & Analytics

#### 2.1 Click Tracking
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| AT-1 | Track deep link clicks | P0 | Planned |
| AT-2 | Track click metadata (IP, User-Agent, Referrer) | P0 | Planned |
| AT-3 | Generate unique click ID | P0 | Planned |
| AT-4 | Store click fingerprint | P0 | Planned |
| AT-5 | Track click timestamp | P0 | Planned |

#### 2.2 Install Tracking
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| IT-1 | Detect app install | P0 | Planned |
| IT-2 | Match install to click (fingerprinting) | P0 | Planned |
| IT-3 | Track install timestamp | P0 | Planned |
| IT-4 | Store install attribution | P0 | Planned |
| IT-5 | Handle organic vs attributed installs | P0 | Planned |

#### 2.3 Conversion Tracking
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| CT-1 | Track custom events (purchase, signup, etc.) | P0 | Planned |
| CT-2 | Link conversions to clicks/installs | P0 | Planned |
| CT-3 | Track conversion value | P0 | Planned |
| CT-4 | Track conversion timestamp | P0 | Planned |
| CT-5 | Multi-event conversion tracking | P1 | Planned |

#### 2.4 Attribution Models
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| AM-1 | First-touch attribution | P0 | Planned |
| AM-2 | Last-touch attribution | P0 | Planned |
| AM-3 | Linear attribution | P1 | Planned |
| AM-4 | Time-decay attribution | P1 | Planned |
| AM-5 | Position-based attribution | P2 | Planned |
| AM-6 | Custom attribution models | P2 | Planned |

#### 2.5 Campaign Tracking
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| CA-1 | Track campaign source | P0 | Planned |
| CA-2 | Track campaign medium | P0 | Planned |
| CA-3 | Track campaign name | P0 | Planned |
| CA-4 | Track campaign content | P1 | Planned |
| CA-5 | Track campaign term | P1 | Planned |
| CA-6 | Campaign performance dashboard | P0 | Planned |

### Phase 3: Advanced Features

#### 3.1 Smart Banners
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| SB-1 | Display smart banner on web | P1 | Planned |
| SB-2 | Customizable banner design | P1 | Planned |
| SB-3 | Track banner impressions | P1 | Planned |
| SB-4 | Track banner clicks | P1 | Planned |
| SB-5 | A/B test banner designs | P2 | Planned |

#### 3.2 Cross-Platform Tracking
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| CP-1 | Track users across platforms | P1 | Planned |
| CP-2 | User identity resolution | P1 | Planned |
| CP-3 | Unified user journey view | P1 | Planned |
| CP-4 | Cross-platform analytics | P1 | Planned |

#### 3.3 Content Analytics
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| CN-1 | Track content views | P1 | Planned |
| CN-2 | Track content shares | P1 | Planned |
| CN-3 | Content performance metrics | P1 | Planned |
| CN-4 | Content engagement analytics | P1 | Planned |

#### 3.4 A/B Testing
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| AB-1 | Create A/B tests | P1 | Planned |
| AB-2 | Assign users to variants | P1 | Planned |
| AB-3 | Track variant performance | P1 | Planned |
| AB-4 | Statistical significance testing | P2 | Planned |

#### 3.5 Referral Program
| ID | Requirement | Priority | Status |
|----|------------|----------|--------|
| RF-1 | Generate referral links | P1 | Planned |
| RF-2 | Track referrals | P1 | Planned |
| RF-3 | Credit referrals | P1 | Planned |
| RF-4 | Referral analytics | P1 | Planned |

---

## Database Schema

### Core Tables

```prisma
model DeepLink {
  id            String   @id @default(cuid())
  linkId        String   @unique // Short identifier (e.g., "abc123")
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id])
  
  // Link Configuration
  alias         String?  @unique // Custom alias
  channel       String?  // facebook, google, email, etc.
  campaign      String?  // Campaign name
  feature       String?  // Feature name
  tags          String[] // Tags for organization
  
  // Deep Link Data
  customData    Json?    // Custom data to pass to app
  screen        String?  // Target screen in app
  fallbackUrl   String?  @db.Text // Web fallback URL
  
  // App Store URLs
  iosUrl        String?  // iOS App Store URL
  androidUrl    String?  // Android Play Store URL
  desktopUrl    String?  // Desktop web URL
  
  // Settings
  expiresAt     DateTime?
  passwordHash  String?
  isActive      Boolean  @default(true)
  clickLimit    Int?     // Maximum clicks
  
  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  clicks        DeepLinkClick[]
  installs      Install[]
  conversions   Conversion[]
  aBTestVariants ABTestVariant[]
  
  @@index([projectId])
  @@index([linkId])
  @@index([alias])
  @@index([channel, campaign])
}

model DeepLinkClick {
  id            String    @id @default(cuid())
  deepLinkId    String
  deepLink      DeepLink  @relation(fields: [deepLinkId], references: [id])
  
  // Click Metadata
  clickId       String    @unique // Unique click identifier
  ipAddress     String
  userAgent     String?   @db.Text
  referrer      String?   @db.Text
  country       String?
  city          String?
  deviceType    String?   // mobile, desktop, tablet
  os            String?
  browser       String?
  
  // Fingerprinting (for install matching)
  fingerprint   String?   // Device fingerprint
  fingerprintData Json?    // Detailed fingerprint data
  
  // Attribution
  channel       String?
  campaign      String?
  feature       String?
  tags          String[]
  
  // NivoStack Integration
  deviceId      String?    // Link to Device if available
  sessionId     String?    // Link to Session if available
  
  clickedAt     DateTime  @default(now())
  
  // Relations
  install       Install?
  conversions   Conversion[]
  
  @@index([deepLinkId])
  @@index([clickId])
  @@index([fingerprint])
  @@index([clickedAt])
  @@index([deviceId])
}

model Install {
  id            String    @id @default(cuid())
  deepLinkId    String?
  deepLink      DeepLink? @relation(fields: [deepLinkId], references: [id])
  clickId       String?   @unique
  click         DeepLinkClick? @relation(fields: [clickId], references: [id])
  
  // Device Information
  deviceId      String    // NivoStack device ID
  device        Device    @relation(fields: [deviceId], references: [id])
  platform      String    // ios, android
  osVersion     String?
  appVersion    String?
  
  // Attribution
  channel       String?
  campaign      String?
  feature       String?
  tags          String[]
  
  // Attribution Model Results
  attributionModel String? // first_touch, last_touch, linear, etc.
  attributedClickId String? // Click ID that gets attribution credit
  
  // Install Metadata
  isOrganic     Boolean   @default(false) // No matching click
  fingerprint   String?   // Device fingerprint for matching
  installedAt   DateTime  @default(now())
  
  // Relations
  conversions   Conversion[]
  
  @@index([deviceId])
  @@index([deepLinkId])
  @@index([clickId])
  @@index([fingerprint])
  @@index([installedAt])
}

model Conversion {
  id            String    @id @default(cuid())
  deepLinkId    String?
  deepLink      DeepLink? @relation(fields: [deepLinkId], references: [id])
  clickId       String?
  click         DeepLinkClick? @relation(fields: [clickId], references: [id])
  installId     String?
  install       Install?  @relation(fields: [installId], references: [id])
  
  // Conversion Data
  eventName     String    // purchase, signup, etc.
  eventValue    Float?     // Conversion value
  eventData     Json?      // Additional event data
  
  // Attribution
  channel       String?
  campaign      String?
  feature       String?
  
  // Conversion Metadata
  convertedAt   DateTime  @default(now())
  
  @@index([deepLinkId])
  @@index([clickId])
  @@index([installId])
  @@index([eventName])
  @@index([convertedAt])
}

model AttributionTouchpoint {
  id            String    @id @default(cuid())
  conversionId  String
  conversion    Conversion @relation(fields: [conversionId], references: [id])
  
  // Touchpoint Data
  clickId       String?
  click         DeepLinkClick? @relation(fields: [clickId], references: [id])
  channel       String
  campaign      String?
  timestamp     DateTime
  
  // Attribution Credit
  credit        Float     // 0.0 to 1.0
  attributionModel String  // Which model gave this credit
  
  @@index([conversionId])
  @@index([clickId])
}

model ABTest {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  name          String
  description   String?
  isActive      Boolean   @default(true)
  
  // Test Configuration
  startDate     DateTime
  endDate       DateTime?
  trafficSplit  Int       @default(50) // Percentage for variant A
  
  // Metrics
  primaryMetric String    // install, purchase, etc.
  secondaryMetrics String[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  variants      ABTestVariant[]
  
  @@index([projectId])
  @@index([isActive])
}

model ABTestVariant {
  id            String    @id @default(cuid())
  testId        String
  test          ABTest    @relation(fields: [testId], references: [id])
  deepLinkId    String
  deepLink      DeepLink @relation(fields: [deepLinkId], references: [id])
  
  name          String    // Variant A, Variant B, etc.
  weight        Int       // Percentage (0-100)
  
  // Results
  clicks        Int       @default(0)
  installs      Int       @default(0)
  conversions   Int       @default(0)
  conversionValue Float   @default(0)
  
  @@index([testId])
  @@index([deepLinkId])
}

model Referral {
  id            String    @id @default(cuid())
  projectId     String
  project       Project   @relation(fields: [projectId], references: [id])
  
  referrerId    String    // User ID of referrer
  referredId    String?   // User ID of referred user
  deepLinkId    String
  deepLink      DeepLink @relation(fields: [deepLinkId], references: [id])
  
  // Referral Status
  status        String    @default("pending") // pending, completed, rewarded
  installId     String?
  install       Install?  @relation(fields: [installId], references: [id])
  
  // Reward
  rewardType    String?   // credit, discount, etc.
  rewardAmount  Float?
  rewardedAt    DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([projectId])
  @@index([referrerId])
  @@index([referredId])
  @@index([deepLinkId])
}
```

---

## API Endpoints

### Deep Link Management

```
POST   /api/deep-links                    Create deep link
GET    /api/deep-links                    List deep links (paginated)
GET    /api/deep-links/:id                Get deep link details
PUT    /api/deep-links/:id                Update deep link
DELETE /api/deep-links/:id                Delete deep link
POST   /api/deep-links/bulk               Bulk create deep links
```

### Deep Link Redirection

```
GET    /:linkId                           Redirect to app/web/app store
GET    /:linkId/info                      Get deep link info (for preview)
POST   /:linkId/click                     Track click (API endpoint)
```

### Attribution & Analytics

```
GET    /api/attribution/clicks            Get click analytics
GET    /api/attribution/installs          Get install analytics
GET    /api/attribution/conversions       Get conversion analytics
GET    /api/attribution/journey/:clickId   Get user journey
GET    /api/attribution/campaigns         Get campaign performance
GET    /api/attribution/channels          Get channel performance
POST   /api/attribution/calculate         Calculate attribution (custom model)
```

### A/B Testing

```
POST   /api/ab-tests                      Create A/B test
GET    /api/ab-tests                      List A/B tests
GET    /api/ab-tests/:id                  Get A/B test details
PUT    /api/ab-tests/:id                  Update A/B test
DELETE /api/ab-tests/:id                  Delete A/B test
GET    /api/ab-tests/:id/results          Get A/B test results
```

### Referral Program

```
POST   /api/referrals                     Create referral link
GET    /api/referrals                     List referrals
GET    /api/referrals/:id                 Get referral details
GET    /api/referrals/user/:userId        Get user's referrals
POST   /api/referrals/:id/reward          Reward referral
```

---

## Implementation Plan for NivoStack

### Phase 1: Foundation (Weeks 1-3)

**Database Setup:**
1. Add Prisma models for DeepLink, DeepLinkClick, Install, Conversion
2. Run migrations
3. Create indexes for performance

**Core API:**
1. Implement deep link creation endpoint
2. Implement deep link redirect endpoint
3. Implement click tracking
4. Basic deep link management (CRUD)

**SDK Integration:**
1. Add deep link handling to Flutter SDK
2. Add deep link handling to Android SDK
3. Add deep link handling to iOS SDK
4. Deep link routing in apps

**Dashboard UI:**
1. Deep link creation form
2. Deep links list page
3. Deep link details page

### Phase 2: Attribution (Weeks 4-6)

**Backend:**
1. Install detection and matching
2. Fingerprinting implementation
3. Attribution calculation
4. Conversion tracking

**SDK Integration:**
1. Install tracking in SDKs
2. Conversion event tracking
3. Attribution data reporting

**Dashboard UI:**
1. Attribution dashboard
2. Campaign performance view
3. User journey visualization

### Phase 3: Advanced Features (Weeks 7-9)

**Backend:**
1. A/B testing system
2. Referral program
3. Smart banners
4. Cross-platform tracking

**Dashboard UI:**
1. A/B test management
2. Referral program UI
3. Smart banner configuration

### Phase 4: Integration (Week 10)

**Integration:**
1. Deep links → Device registration
2. Deep links → Session creation
3. Attribution → NivoStack analytics
4. Conversion → Business metrics

**Dashboard UI:**
1. Integrated analytics views
2. Unified attribution dashboard

---

## Technical Architecture

### Deep Link Creation

```typescript
async function createDeepLink(data: DeepLinkData): Promise<DeepLink> {
  const linkId = generateLinkId(); // Short unique ID
  
  const deepLink = await prisma.deepLink.create({
    data: {
      linkId,
      projectId: project.id,
      channel: data.channel,
      campaign: data.campaign,
      feature: data.feature,
      customData: data.customData,
      screen: data.screen,
      fallbackUrl: data.fallbackUrl,
      iosUrl: data.iosUrl,
      androidUrl: data.androidUrl,
      desktopUrl: data.desktopUrl,
    },
  });
  
  return deepLink;
}
```

### Deep Link Redirect

```typescript
// app/api/[linkId]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  const deepLink = await prisma.deepLink.findUnique({
    where: { linkId: params.linkId },
  });

  if (!deepLink || !deepLink.isActive) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  // Track click
  const click = await trackClick(deepLink.id, request);

  // Detect platform and redirect accordingly
  const userAgent = request.headers.get('user-agent') || '';
  const device = detectDevice(userAgent);
  
  let destinationUrl: string;
  
  if (device.os === 'iOS') {
    // Check if app installed (via fingerprinting)
    const isInstalled = await checkAppInstalled(click.fingerprint);
    
    if (isInstalled) {
      // Universal Link - iOS will handle
      destinationUrl = `https://${customDomain}/${deepLink.linkId}`;
    } else {
      // Redirect to App Store
      destinationUrl = deepLink.iosUrl || defaultAppStoreUrl;
    }
  } else if (device.os === 'Android') {
    const isInstalled = await checkAppInstalled(click.fingerprint);
    
    if (isInstalled) {
      // App Link - Android will handle
      destinationUrl = `https://${customDomain}/${deepLink.linkId}`;
    } else {
      // Redirect to Play Store
      destinationUrl = deepLink.androidUrl || defaultPlayStoreUrl;
    }
  } else {
    // Desktop - redirect to web
    destinationUrl = deepLink.desktopUrl || deepLink.fallbackUrl || defaultWebUrl;
  }

  // Redirect
  return NextResponse.redirect(destinationUrl, 302);
}
```

### Click Tracking

```typescript
async function trackClick(deepLinkId: string, request: NextRequest): Promise<DeepLinkClick> {
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const referrer = request.headers.get('referer') || '';
  
  // Generate fingerprint
  const fingerprint = generateFingerprint(ipAddress, userAgent);
  
  // Geolocation
  const geo = await getGeolocation(ipAddress);
  
  // Device detection
  const deviceInfo = parseUserAgent(userAgent);
  
  // Generate unique click ID
  const clickId = generateClickId();
  
  const click = await prisma.deepLinkClick.create({
    data: {
      clickId,
      deepLinkId,
      ipAddress,
      userAgent,
      referrer,
      country: geo.country,
      city: geo.city,
      deviceType: deviceInfo.deviceType,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      fingerprint,
      fingerprintData: {
        screenResolution: extractScreenResolution(userAgent),
        timezone: extractTimezone(userAgent),
        language: extractLanguage(request),
      },
      channel: deepLink.channel,
      campaign: deepLink.campaign,
      feature: deepLink.feature,
      tags: deepLink.tags,
    },
  });
  
  return click;
}
```

### Install Tracking (SDK)

```typescript
// Flutter SDK
class NivoStackDeepLink {
  static Future<void> trackInstall() async {
    // Check if this is first launch
    final prefs = await SharedPreferences.getInstance();
    final isFirstLaunch = prefs.getBool('nivostack_first_launch') ?? true;
    
    if (!isFirstLaunch) return;
    
    // Mark as launched
    await prefs.setBool('nivostack_first_launch', false);
    
    // Get device fingerprint
    final fingerprint = await generateFingerprint();
    
    // Check for matching click
    final install = await apiClient.post('/api/installs', {
      'fingerprint': fingerprint,
      'platform': Platform.isIOS ? 'ios' : 'android',
      'osVersion': await getOSVersion(),
      'appVersion': await getAppVersion(),
    });
    
    // If matched to click, store attribution
    if (install['clickId']) {
      await prefs.setString('nivostack_attributed_click_id', install['clickId']);
    }
  }
  
  static Future<void> handleDeepLink(Uri uri) async {
    // Extract deep link data
    final screen = uri.pathSegments[0];
    final customData = uri.queryParameters;
    
    // Track deep link open
    await apiClient.post('/api/deep-links/open', {
      'linkId': extractLinkId(uri),
      'screen': screen,
      'customData': customData,
    });
    
    // Route to screen in app
    await routeToScreen(screen, customData);
  }
}
```

### Attribution Calculation

```typescript
async function calculateAttribution(
  conversionId: string,
  model: AttributionModel
): Promise<AttributionTouchpoint[]> {
  const conversion = await prisma.conversion.findUnique({
    where: { id: conversionId },
    include: { install: { include: { click: true } } },
  });
  
  // Get all touchpoints for this user
  const touchpoints = await getTouchpoints(conversion.install.deviceId);
  
  let credits: AttributionTouchpoint[];
  
  switch (model) {
    case 'first_touch':
      credits = [{
        clickId: touchpoints[0].clickId,
        credit: 1.0,
      }];
      break;
      
    case 'last_touch':
      credits = [{
        clickId: touchpoints[touchpoints.length - 1].clickId,
        credit: 1.0,
      }];
      break;
      
    case 'linear':
      const creditPerTouchpoint = 1.0 / touchpoints.length;
      credits = touchpoints.map(tp => ({
        clickId: tp.clickId,
        credit: creditPerTouchpoint,
      }));
      break;
      
    case 'time_decay':
      // More credit to recent touchpoints
      const totalWeight = touchpoints.reduce((sum, tp, i) => {
        const daysSince = (Date.now() - tp.timestamp) / (1000 * 60 * 60 * 24);
        return sum + Math.exp(-daysSince / 7); // 7-day half-life
      }, 0);
      
      credits = touchpoints.map(tp => {
        const daysSince = (Date.now() - tp.timestamp) / (1000 * 60 * 60 * 24);
        const weight = Math.exp(-daysSince / 7);
        return {
          clickId: tp.clickId,
          credit: weight / totalWeight,
        };
      });
      break;
  }
  
  // Store attribution
  await prisma.attributionTouchpoint.createMany({
    data: credits.map(c => ({
      conversionId,
      clickId: c.clickId,
      channel: getChannel(c.clickId),
      campaign: getCampaign(c.clickId),
      timestamp: getClickTimestamp(c.clickId),
      credit: c.credit,
      attributionModel: model,
    })),
  });
  
  return credits;
}
```

---

## Integration with NivoStack

### Deep Links → Device Registration

```typescript
async function trackClick(deepLinkId: string, request: NextRequest) {
  // ... existing click tracking ...
  
  // If mobile device, register with NivoStack
  if (deviceInfo.deviceType === 'mobile' && !deviceId) {
    const device = await prisma.device.create({
      data: {
        deviceId: generateDeviceId(),
        platform: deviceInfo.os === 'iOS' ? 'ios' : 'android',
        osVersion: deviceInfo.osVersion,
        projectId: deepLink.projectId,
        source: 'deep_link',
        sourceData: {
          deepLinkId,
          clickId: click.clickId,
        },
      },
    });
    deviceId = device.id;
  }
}
```

### Deep Links → Session Creation

```typescript
// When app opens via deep link
async function handleDeepLinkOpen(deepLinkId: string, customData: Json) {
  // Create session
  const session = await prisma.session.create({
    data: {
      deviceId: device.id,
      sessionToken: generateSessionToken(),
      action: 'start',
      context: {
        source: 'deep_link',
        deepLinkId,
        customData,
      },
    },
  });
  
  // Track deep link open event
  await prisma.conversion.create({
    data: {
      deepLinkId,
      clickId: attributedClickId,
      installId: install.id,
      eventName: 'deep_link_open',
      eventData: customData,
    },
  });
}
```

### Attribution → Analytics

```typescript
// app/api/analytics/attribution/route.ts
export async function GET(request: Request) {
  const { projectId, startDate, endDate } = parseQuery(request);
  
  const conversions = await prisma.conversion.findMany({
    where: {
      deepLink: { projectId },
      convertedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      deepLink: true,
      click: true,
      install: true,
      touchpoints: true,
    },
  });
  
  // Aggregate by channel
  const byChannel = groupBy(conversions, 'click.channel');
  
  // Aggregate by campaign
  const byCampaign = groupBy(conversions, 'click.campaign');
  
  // Calculate ROI
  const roi = calculateROI(conversions);
  
  return Response.json({
    totalConversions: conversions.length,
    totalValue: conversions.reduce((sum, c) => sum + (c.eventValue || 0), 0),
    byChannel,
    byCampaign,
    roi,
  });
}
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Deep link creation time | < 1 second |
| Redirect latency | < 150ms |
| Install matching accuracy | > 95% |
| Attribution calculation time | < 500ms |
| Dashboard load time | < 2 seconds |

---

## Security Considerations

1. **Deep Link Validation**: Validate all deep link data
2. **Fingerprinting Privacy**: Anonymize fingerprints for GDPR
3. **Click Fraud Prevention**: Detect and filter bot traffic
4. **Rate Limiting**: Prevent abuse of deep link creation
5. **Data Encryption**: Encrypt sensitive attribution data

---

## Future Enhancements

1. **Universal Links Configuration**: Automatic apple-app-site-association setup
2. **App Links Configuration**: Automatic assetlinks.json setup
3. **Advanced Fingerprinting**: More accurate install matching
4. **Real-Time Attribution**: Live attribution updates
5. **Machine Learning**: ML-based attribution models
6. **Webhooks**: Notify on installs/conversions
7. **API Rate Limits**: Per-project API quotas

---

## Related Documents

- [Main PRD](./PRD.md)
- [URL Shortener PRD](./URL_SHORTENER_PRD.md)
- [Bitly Feature Analysis](./BITLY_FEATURE_ANALYSIS.md)

---

*Document Owner: NivoStack Product Team*  
*Review Cycle: Bi-weekly*

