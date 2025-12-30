# Localization Phase 1 - Technical Design Document

**Version**: 1.0  
**Date**: December 2024  
**Phase**: Phase 1 - Foundation  
**Status**: Design

---

## Overview

This document provides detailed technical specifications for Phase 1 features:
1. Import/Export System
2. Machine Translation Integration
3. Translation Statistics Dashboard
4. Bulk Operations UI

---

## Feature 1: Import/Export System

### 1.1 Import Functionality

#### API Endpoint
```
POST /api/localization/import
```

#### Authentication
- Dashboard: JWT token (Bearer)
- SDK: API key (X-API-Key) - for future programmatic imports

#### Request Format
```typescript
interface ImportRequest {
  projectId: string
  format: 'csv' | 'json' | 'android_xml' | 'ios_strings' | 'xliff'
  languageCode?: string // Optional, required for single-language formats
  file: File | string // Base64 encoded or multipart/form-data
  options: {
    createMissingKeys: boolean // Create keys if they don't exist
    updateExisting: boolean // Update existing translations
    dryRun: boolean // Preview without saving
    category?: string // Assign category to imported keys
  }
}
```

#### Response Format
```typescript
interface ImportResponse {
  success: boolean
  stats: {
    keysCreated: number
    keysUpdated: number
    keysSkipped: number
    translationsCreated: number
    translationsUpdated: number
    errors: Array<{
      row?: number
      key?: string
      message: string
    }>
  }
  preview?: {
    keys: Array<{
      key: string
      value: string
      action: 'create' | 'update' | 'skip'
    }>
  }
}
```

#### File Format Parsers

**CSV Format**:
```csv
key,value,description,category
welcome_message,"Welcome to our app","Welcome screen message",screens
button.submit,Submit,Submit button,buttons
```

**JSON Format**:
```json
{
  "welcome_message": "Welcome to our app",
  "button": {
    "submit": "Submit"
  }
}
```

**Android XML Format**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="welcome_message">Welcome to our app</string>
    <string name="button_submit">Submit</string>
</resources>
```

**iOS Strings Format**:
```
"welcome_message" = "Welcome to our app";
"button.submit" = "Submit";
```

**XLIFF Format**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0">
  <file original="app" source-language="en" target-language="ar">
    <unit id="welcome_message">
      <segment>
        <source>Welcome to our app</source>
        <target>مرحباً بكم في تطبيقنا</target>
      </segment>
    </unit>
  </file>
</xliff>
```

#### Implementation Details

**File**: `src/app/api/localization/import/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { parseCSV, parseJSON, parseAndroidXML, parseIOSStrings, parseXLIFF } from '@/lib/localization/parsers'

export async function POST(request: NextRequest) {
  // 1. Authentication & authorization
  // 2. Parse request body (multipart or JSON with base64)
  // 3. Validate file format
  // 4. Parse file based on format
  // 5. Validate parsed data
  // 6. If dryRun, return preview
  // 7. Otherwise, save to database in transaction
  // 8. Return statistics
}
```

**Parser Functions**: `src/lib/localization/parsers.ts`

- `parseCSV(fileContent: string): ParsedTranslation[]`
- `parseJSON(fileContent: string): ParsedTranslation[]`
- `parseAndroidXML(fileContent: string): ParsedTranslation[]`
- `parseIOSStrings(fileContent: string): ParsedTranslation[]`
- `parseXLIFF(fileContent: string): ParsedTranslation[]`

**Database Operations**:
- Use Prisma transactions for atomicity
- Batch inserts for performance
- Handle duplicate keys gracefully

### 1.2 Export Functionality

#### API Endpoint
```
GET /api/localization/export
```

#### Query Parameters
- `projectId`: Required
- `format`: csv | json | android_xml | ios_strings | xliff
- `languageCode`: Optional (export all languages if not specified)
- `category`: Optional filter
- `includeEmpty`: Include keys without translations (default: false)

#### Response
- Content-Type based on format
- Content-Disposition: attachment; filename="translations.{ext}"

#### Implementation

**File**: `src/app/api/localization/export/route.ts`

```typescript
export async function GET(request: NextRequest) {
  // 1. Authentication
  // 2. Fetch translations from database
  // 3. Format based on requested format
  // 4. Return file download
}
```

**Formatter Functions**: `src/lib/localization/formatters.ts`

- `formatCSV(translations: Translation[]): string`
- `formatJSON(translations: Translation[]): string`
- `formatAndroidXML(translations: Translation[]): string`
- `formatIOSStrings(translations: Translation[]): string`
- `formatXLIFF(translations: Translation[]): string`

---

## Feature 2: Machine Translation Integration

### 2.1 Database Schema

```prisma
model TranslationProvider {
  id            String   @id @default(cuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  provider      String   // "google" | "deepl" | "azure" | "manual"
  apiKey        String?  // Encrypted
  isEnabled     Boolean  @default(true)
  autoTranslate Boolean  @default(false) // Auto-translate on key creation
  defaultSourceLanguageId String? // Default source language for translation
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([projectId, provider])
  @@index([projectId])
}

model TranslationMetadata {
  id              String   @id @default(cuid())
  translationId   String   @unique
  translation     Translation @relation(fields: [translationId], references: [id], onDelete: Cascade)
  provider        String?  // "google" | "deepl" | "azure" | "manual"
  confidence       Float?   // 0.0 - 1.0
  cost             Float?   // Cost in USD
  translatedAt     DateTime?
  createdAt        DateTime @default(now())
  
  @@index([translationId])
}
```

### 2.2 Translation API

#### Endpoint
```
POST /api/localization/translate
```

#### Request
```typescript
interface TranslateRequest {
  keyId: string
  targetLanguageId: string
  sourceLanguageId?: string // Optional, defaults to project default language
  provider?: 'google' | 'deepl' | 'azure' // Optional, uses project default
  force?: boolean // Force re-translation even if exists
}
```

#### Response
```typescript
interface TranslateResponse {
  translation: {
    id: string
    value: string
    provider: string
    confidence?: number
    cost?: number
  }
}
```

### 2.3 Provider Implementations

**File**: `src/lib/localization/translators/`

- `google.ts` - Google Cloud Translation API
- `deepl.ts` - DeepL API
- `azure.ts` - Azure Translator API
- `base.ts` - Base translator interface

**Base Translator Interface**:
```typescript
interface Translator {
  translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<{
    text: string
    confidence?: number
    cost?: number
  }>
  
  getSupportedLanguages(): Promise<string[]>
  estimateCost(text: string, sourceLang: string, targetLang: string): number
}
```

### 2.4 Configuration UI

**Dashboard Component**: `src/components/TranslationProviderSettings.tsx`

- Provider selection dropdown
- API key input (masked)
- Enable/disable toggle
- Auto-translate toggle
- Cost tracking display
- Test translation button

---

## Feature 3: Translation Statistics Dashboard

### 3.1 Statistics API

#### Endpoint
```
GET /api/localization/statistics?projectId=X
```

#### Response
```typescript
interface StatisticsResponse {
  overview: {
    totalKeys: number
    totalLanguages: number
    totalTranslations: number
    completionRate: number // Overall completion percentage
  }
  languages: Array<{
    id: string
    code: string
    name: string
    totalKeys: number
    translatedKeys: number
    completionRate: number
    missingKeys: number
    reviewedCount: number
    reviewedRate: number
  }>
  categories: Array<{
    category: string
    totalKeys: number
    translatedKeys: number
    completionRate: number
  }>
  recentActivity: Array<{
    type: 'translation_created' | 'translation_updated' | 'key_created' | 'language_added'
    timestamp: string
    user?: string
    details: Record<string, any>
  }>
}
```

### 3.2 Dashboard Component

**File**: `src/components/LocalizationStatistics.tsx`

**Features**:
- Overview cards (total keys, languages, completion rate)
- Language completion chart
- Category breakdown
- Missing translations list
- Recent activity timeline
- Export statistics button

---

## Feature 4: Bulk Operations

### 4.1 Bulk Edit API

#### Endpoint
```
PATCH /api/localization/bulk
```

#### Request
```typescript
interface BulkEditRequest {
  projectId: string
  operation: 'update_translations' | 'delete_keys' | 'assign_category' | 'enable_languages' | 'disable_languages'
  filters: {
    keyIds?: string[]
    languageIds?: string[]
    category?: string
    hasTranslation?: boolean
    isReviewed?: boolean
  }
  updates: {
    category?: string
    translations?: Array<{
      keyId: string
      languageId: string
      value: string
    }>
    isEnabled?: boolean
  }
}
```

#### Response
```typescript
interface BulkEditResponse {
  success: boolean
  affected: {
    keys: number
    translations: number
  }
  errors: Array<{
    key?: string
    message: string
  }>
}
```

### 4.2 Bulk Operations UI

**Component**: `src/components/BulkOperationsModal.tsx`

**Features**:
- Multi-select interface for keys
- Filter options (category, language, translation status)
- Bulk edit form
- Preview changes
- Confirmation dialog
- Progress indicator

---

## Database Migrations

### Migration 1: Translation Provider
```prisma
// Add to schema.prisma
model TranslationProvider {
  id            String   @id @default(cuid())
  projectId     String
  project       Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  provider      String   // "google" | "deepl" | "azure" | "manual"
  apiKey        String?  // Encrypted
  isEnabled     Boolean  @default(true)
  autoTranslate Boolean  @default(false)
  defaultSourceLanguageId String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([projectId, provider])
  @@index([projectId])
}
```

### Migration 2: Translation Metadata
```prisma
model TranslationMetadata {
  id              String   @id @default(cuid())
  translationId   String   @unique
  translation     Translation @relation(fields: [translationId], references: [id], onDelete: Cascade)
  provider        String?
  confidence      Float?
  cost            Float?
  translatedAt    DateTime?
  createdAt       DateTime @default(now())
  
  @@index([translationId])
}

// Update Translation model
model Translation {
  // ... existing fields
  metadata TranslationMetadata?
}
```

---

## API Client Updates

### Frontend API Client
**File**: `src/lib/api.ts`

Add methods:
```typescript
localization: {
  // ... existing methods
  import: (projectId: string, token: string, data: ImportRequest) => Promise<ImportResponse>
  export: (projectId: string, token: string, params: ExportParams) => Promise<Blob>
  translate: (token: string, data: TranslateRequest) => Promise<TranslateResponse>
  getStatistics: (projectId: string, token: string) => Promise<StatisticsResponse>
  bulkEdit: (token: string, data: BulkEditRequest) => Promise<BulkEditResponse>
  getProviders: (projectId: string, token: string) => Promise<TranslationProvider[]>
  updateProvider: (token: string, providerId: string, data: Partial<TranslationProvider>) => Promise<TranslationProvider>
}
```

---

## Error Handling

### Error Codes
- `IMPORT_INVALID_FORMAT` - Unsupported file format
- `IMPORT_PARSE_ERROR` - File parsing failed
- `IMPORT_VALIDATION_ERROR` - Data validation failed
- `TRANSLATE_PROVIDER_ERROR` - Translation provider error
- `TRANSLATE_QUOTA_EXCEEDED` - API quota exceeded
- `TRANSLATE_INVALID_LANGUAGE` - Unsupported language pair
- `BULK_OPERATION_FAILED` - Bulk operation partial failure

### Error Response Format
```typescript
interface ErrorResponse {
  error: string
  code: string
  details?: Record<string, any>
  errors?: Array<{
    field?: string
    message: string
  }>
}
```

---

## Performance Considerations

### Import Performance
- Use batch inserts (100-500 records per batch)
- Use database transactions
- Stream large files instead of loading into memory
- Progress updates for long-running imports

### Export Performance
- Generate files on-demand
- Consider background job for large exports
- Stream response for large files
- Cache formatted exports temporarily

### Translation Performance
- Rate limiting per provider
- Batch translation requests when possible
- Cache translations to avoid re-translation
- Async processing for bulk translations

---

## Security Considerations

### API Key Encryption
- Encrypt provider API keys at rest
- Use environment-specific encryption keys
- Never log API keys
- Mask API keys in UI

### File Upload Security
- Validate file types
- Limit file size (e.g., 10MB)
- Sanitize file content
- Scan for malicious content

### Rate Limiting
- Limit translation requests per project
- Limit import/export operations
- Prevent abuse with rate limiting middleware

---

## Testing Strategy

### Unit Tests
- Parser functions (CSV, JSON, XML, etc.)
- Formatter functions
- Translator implementations
- Statistics calculations

### Integration Tests
- Import/export endpoints
- Translation endpoints
- Bulk operations
- Error handling

### E2E Tests
- Full import workflow
- Translation workflow
- Statistics display
- Bulk operations UI

---

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured (translation provider API keys)
- [ ] File upload limits configured
- [ ] Rate limiting configured
- [ ] Error monitoring set up
- [ ] Performance monitoring set up
- [ ] Documentation updated
- [ ] SDK updated (if needed)

---

## Timeline Estimate

- **Import/Export**: 2-3 weeks
- **Machine Translation**: 2-3 weeks
- **Statistics Dashboard**: 1 week
- **Bulk Operations**: 1-2 weeks

**Total**: 6-9 weeks for Phase 1

---

## Dependencies

### External Services
- Google Cloud Translation API (optional)
- DeepL API (optional)
- Azure Translator API (optional)

### Internal Dependencies
- Existing localization API endpoints
- Build system (for versioning)
- Authentication system
- File storage (for exports)

---

## Future Enhancements

- Translation Memory integration (Phase 2)
- OTA updates (Phase 3)
- GitHub integration (Phase 4)
- Webhook notifications (Phase 4)
- Translation comments (Phase 4)

