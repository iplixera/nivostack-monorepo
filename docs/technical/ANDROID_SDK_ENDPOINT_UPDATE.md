# Android SDK Endpoint Update Plan

## Current State

The Android SDK currently uses a single `baseUrl` parameter for all API calls:

```kotlin
NivoStack.init(
    context = this,
    baseUrl = "https://ingest.nivostack.com",  // Single URL
    apiKey = "your-api-key",
    projectId = "your-project-id"
)
```

## Required Changes

### Separate Ingest and Control URLs

The SDK should support separate endpoints:

- **Ingest URL**: `https://ingest.nivostack.com` - For data ingestion (POST operations)
- **Control URL**: `https://api.nivostack.com` - For configuration (GET operations)

### API Endpoint Mapping

| Endpoint | Current | Should Use | Type |
|----------|---------|-----------|------|
| `/api/devices` (POST) | baseUrl | ingestUrl | Ingest |
| `/api/traces` (POST) | baseUrl | ingestUrl | Ingest |
| `/api/logs` (POST) | baseUrl | ingestUrl | Ingest |
| `/api/crashes` (POST) | baseUrl | ingestUrl | Ingest |
| `/api/sessions` (POST/PUT/PATCH) | baseUrl | ingestUrl | Ingest |
| `/api/sdk-init` (GET) | baseUrl | controlUrl | Control |
| `/api/business-config` (GET) | baseUrl | controlUrl | Control |
| `/api/localization/translations` (GET) | baseUrl | controlUrl | Control |
| `/api/feature-flags` (GET) | baseUrl | controlUrl | Control |

### Implementation Plan

1. Update `NivoStack.init()` to accept both URLs:
   ```kotlin
   fun init(
       context: Context,
       ingestUrl: String = "https://ingest.nivostack.com",
       controlUrl: String = "https://api.nivostack.com",
       apiKey: String,
       projectId: String,
       enabled: Boolean = true
   )
   ```

2. Update `ApiClient` to use appropriate URL per operation
3. Update `BusinessConfigClient` to use controlUrl
4. Update `LocalizationClient` to use controlUrl
5. Keep backward compatibility (default to ingestUrl if only one provided)

### Timeline

- **Phase 1** (Now): Use `https://ingest.nivostack.com` for all operations (works but not optimal)
- **Phase 2** (Next release): Add separate URL support
- **Phase 3**: Update documentation and examples

---

**Status**: Documented for future implementation  
**Priority**: Medium (current setup works, but separation improves performance)

