# Smart User Tracking Options for API Traces

**Date:** 2026-01-19
**Goal:** Identify which user made which API request with minimal client code
**Philosophy:** Zero-configuration, automatic tracking like Firebase/Sentry

---

## 🎯 Requirements

1. Track logged-in user information (name, ID, email)
2. Associate API traces with specific users
3. Filter traces by user in dashboard
4. Minimal/zero client code required
5. Automatic tracking when user logs in

---

## 📊 Smart Options (Ranked by Automation Level)

### Option 1: Automatic Token Interception (SMARTEST ✨)

**Philosophy:** SDK automatically detects and extracts user info from API requests

**How It Works:**
1. Interceptor monitors authorization headers in API requests
2. Extracts JWT token or Bearer token automatically
3. Decodes JWT to get user ID, name, email
4. Associates all subsequent traces with that user
5. Clears user when logout API is detected

**Implementation:**

```kotlin
// In NivoStackInterceptor.kt
override fun intercept(chain: Interceptor.Chain): Response {
    val request = chain.request()

    // Auto-detect user from Authorization header
    val authHeader = request.header("Authorization")
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        val token = authHeader.substring(7)
        instance.autoDetectUserFromToken(token)
    }

    // Rest of interceptor logic...
}

// In NivoStack.kt
internal fun autoDetectUserFromToken(token: String) {
    try {
        // Decode JWT (without verification - just for display)
        val payload = decodeJwtPayload(token)
        val userId = payload["sub"] ?: payload["user_id"] ?: payload["id"]
        val email = payload["email"]
        val name = payload["name"] ?: payload["username"]

        // Auto-set user if not already set
        if (userId != null && userProperties["userId"] != userId) {
            setUserProperties(mapOf(
                "userId" to userId,
                "email" to email,
                "name" to name,
                "lastToken" to token.takeLast(8) // Last 8 chars for debugging
            ))
        }
    } catch (e: Exception) {
        // Silent fail - not all tokens are JWTs
    }
}
```

**Pros:**
- ✅ Zero client code required
- ✅ Completely automatic
- ✅ Works with any authentication scheme using JWTs
- ✅ Clears automatically when token changes
- ✅ Most Firebase/Sentry-like approach

**Cons:**
- ⚠️ Only works with JWT tokens
- ⚠️ Assumes standard JWT claims (sub, email, name)
- ⚠️ May need customization for non-standard JWTs

**Client Code Required:** ZERO ✨

---

### Option 2: Smart Login/Logout Detection (VERY SMART 🎯)

**Philosophy:** SDK monitors common login/logout endpoints and auto-extracts user info

**How It Works:**
1. Interceptor monitors for common login endpoints (e.g., `/auth/login`, `/login`, `/signin`)
2. When successful login detected (2xx response), extracts user info from response body
3. Automatically calls `setUser()` with extracted info
4. Monitors logout endpoints to call `clearUser()`

**Implementation:**

```kotlin
// In NivoStackInterceptor.kt
override fun intercept(chain: Interceptor.Chain): Response {
    val request = chain.request()
    val response = chain.proceed(request)

    // Auto-detect login
    if (isLoginEndpoint(request.url.toString()) && response.isSuccessful) {
        val responseBody = response.peekBody(Long.MAX_VALUE).string()
        instance.autoDetectUserFromLoginResponse(responseBody)
    }

    // Auto-detect logout
    if (isLogoutEndpoint(request.url.toString()) && response.isSuccessful) {
        instance.clearUser()
    }

    return response
}

// In NivoStack.kt
private fun isLoginEndpoint(url: String): Boolean {
    val loginPatterns = listOf("/auth/login", "/login", "/signin", "/authenticate", "/token")
    return loginPatterns.any { url.contains(it, ignoreCase = true) }
}

internal fun autoDetectUserFromLoginResponse(responseBody: String) {
    try {
        val json = JSONObject(responseBody)
        // Try common response structures
        val userId = json.optString("userId") ?: json.optString("id") ?: json.optString("user_id")
        val email = json.optString("email")
        val name = json.optString("name") ?: json.optString("username")

        if (userId.isNotEmpty()) {
            setUser(userId, email, name)
        }
    } catch (e: Exception) {
        // Silent fail
    }
}
```

**Pros:**
- ✅ Zero client code required
- ✅ Automatic on login/logout
- ✅ Works with any auth scheme
- ✅ Covers most common patterns

**Cons:**
- ⚠️ Depends on endpoint naming conventions
- ⚠️ May need configuration for custom endpoints
- ⚠️ Response body structure varies

**Client Code Required:** ZERO (with common patterns) or ONE line for custom endpoints ✨

---

### Option 3: Manual with Smart Defaults (SEMI-AUTOMATIC 🔧)

**Philosophy:** Client calls `setUser()` once after login, SDK handles the rest

**How It Works:**
1. Client calls `NivoStack.instance.setUser()` after successful login
2. SDK stores user info in memory AND SharedPreferences (persists across app restarts)
3. Automatically includes user info in all traces
4. Auto-clears on explicit `clearUser()` call or app uninstall

**Implementation:**

```kotlin
// Current implementation (already exists!)
fun setUser(userId: String, email: String? = null, name: String? = null) {
    // Store in memory
    userProperties["userId"] = userId
    if (email != null) userProperties["email"] = email
    if (name != null) userProperties["name"] = name

    // Persist to SharedPreferences (survives app restart)
    prefs.edit().apply {
        putString("user_id", userId)
        putString("user_email", email)
        putString("user_name", name)
        apply()
    }

    // Sync to backend
    if (registeredDeviceId != null) {
        scope.launch {
            try {
                apiClient.setUser(registeredDeviceId!!, userId, email, name)
            } catch (e: Exception) {
                // Ignore errors
            }
        }
    }
}

// Add to traces automatically
private fun queueTrace(trace: Map<String, Any>) {
    val enrichedTrace = trace.toMutableMap()

    // Auto-add user info to every trace
    val userId = userProperties["userId"] as? String
    if (userId != null) {
        enrichedTrace["userId"] = userId
        userProperties["email"]?.let { enrichedTrace["userEmail"] = it }
        userProperties["name"]?.let { enrichedTrace["userName"] = it }
    }

    traceQueue.offer(enrichedTrace)
}
```

**Client Code Example:**

```kotlin
// After successful login
val loginResponse = api.login(username, password)
if (loginResponse.isSuccessful) {
    NivoStack.instance.setUser(
        userId = loginResponse.userId,
        email = loginResponse.email,
        name = loginResponse.name
    )
}

// On logout
NivoStack.instance.clearUser()
```

**Pros:**
- ✅ Simple and explicit
- ✅ Works with any auth scheme
- ✅ Full control over user data
- ✅ Already implemented!

**Cons:**
- ⚠️ Requires 2 lines of client code (setUser + clearUser)
- ⚠️ Developer must remember to call it

**Client Code Required:** 2 lines (one-time per login/logout)

---

### Option 4: Hybrid Automatic + Manual Override (BEST OF BOTH 🎖️)

**Philosophy:** SDK tries automatic detection, allows manual override

**How It Works:**
1. SDK automatically detects user from JWT (Option 1)
2. If JWT detection fails, falls back to login endpoint detection (Option 2)
3. Client can manually call `setUser()` to override (Option 3)
4. Manual call takes precedence over auto-detection

**Implementation:**

```kotlin
// In NivoStack.kt
private var userSource: String = "none" // "auto-jwt", "auto-login", "manual"

fun setUser(userId: String, email: String? = null, name: String? = null) {
    userSource = "manual"
    _setUserInternal(userId, email, name)
}

internal fun autoDetectUserFromToken(token: String) {
    // Only auto-detect if not manually set
    if (userSource != "manual") {
        userSource = "auto-jwt"
        // ... extraction logic
        _setUserInternal(userId, email, name)
    }
}

internal fun autoDetectUserFromLoginResponse(responseBody: String) {
    // Only auto-detect if not manually set
    if (userSource != "manual") {
        userSource = "auto-login"
        // ... extraction logic
        _setUserInternal(userId, email, name)
    }
}

private fun _setUserInternal(userId: String, email: String? = null, name: String? = null) {
    userProperties["userId"] = userId
    userProperties["email"] = email
    userProperties["name"] = name
    userProperties["userSource"] = userSource // For debugging

    // Persist and sync...
}
```

**Pros:**
- ✅ Best of all worlds
- ✅ Automatic for most cases
- ✅ Manual override when needed
- ✅ Fallback mechanisms
- ✅ Production-ready

**Cons:**
- ⚠️ More complex implementation
- ⚠️ Need to handle precedence carefully

**Client Code Required:** ZERO (automatic) or 1 line (manual override)

---

## 📱 Dashboard Integration

### Trace Model Update

Add user fields to traces:

```typescript
// database schema
model ApiTrace {
  // ... existing fields
  userId     String?
  userEmail  String?
  userName   String?
}
```

### Dashboard Filters

Add user filter to API Traces tab:

```tsx
<div className="flex items-center gap-2">
  <label className="text-gray-400 text-sm">User:</label>
  <select
    value={selectedUserId}
    onChange={(e) => setSelectedUserId(e.target.value)}
    className="bg-gray-800 text-gray-300 text-sm rounded px-3 py-1.5..."
  >
    <option value="">All Users</option>
    {uniqueUsers.map((user) => (
      <option key={user.id} value={user.id}>
        {user.name || user.email || user.id}
      </option>
    ))}
  </select>
</div>
```

### User Statistics Widget

```tsx
<div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
  <div className="text-gray-400 text-xs mb-1">Active Users</div>
  <div className="text-2xl font-bold text-purple-400">{uniqueUsersCount}</div>
</div>
```

---

## 🏆 Recommendation

**Use Option 4: Hybrid Automatic + Manual Override**

**Why:**
1. **Zero-config for 90% of apps** - JWT auto-detection works for most
2. **Fallback for edge cases** - Login endpoint detection catches the rest
3. **Manual override available** - For custom auth schemes
4. **Production-ready** - Firebase/Sentry level automation
5. **Future-proof** - Handles any auth pattern

**Implementation Priority:**

### Phase 1 (Quick Win) - Option 3 Enhancement
1. ✅ `setUser()` already exists
2. Add auto-inclusion in traces (5 minutes)
3. Persist to SharedPreferences (5 minutes)
4. Add dashboard filter (30 minutes)

**Total: 40 minutes**

### Phase 2 (Smart Automation) - Add Option 1
1. Add JWT decoding (30 minutes)
2. Auto-detect from Authorization header (15 minutes)
3. Test with Flooss BH app (15 minutes)

**Total: 1 hour**

### Phase 3 (Complete Solution) - Add Option 2
1. Add login endpoint detection (30 minutes)
2. Add response body parsing (30 minutes)
3. Test with various auth flows (30 minutes)

**Total: 1.5 hours**

**Complete Hybrid Solution: ~3 hours**

---

## 🔧 Flooss BH Specific Implementation

### Current Auth Flow Analysis

Based on typical fintech apps:

```kotlin
// Flooss BH likely has:
POST /auth/login
Response: { "userId": "...", "token": "...", "email": "...", "name": "..." }

// After login:
All API calls include: Authorization: Bearer <JWT>
```

### Recommended Approach

**Quick Start (TODAY):**
```kotlin
// In login success callback (ONE LINE)
NivoStack.instance.setUser(loginResponse.userId, loginResponse.email, loginResponse.name)

// In logout (ONE LINE)
NivoStack.instance.clearUser()
```

**Future (AUTOMATIC):**
- Phase 1: JWT auto-detection (no client code)
- Phase 2: Login endpoint detection (no client code)
- Result: Remove the manual `setUser()` call ✨

---

## 📊 Trace Display Example

**Before:**
```
API Traces:
├─ GET /api/accounts (200ms) - Device: Pixel 6
├─ POST /api/transfer (450ms) - Device: Pixel 6
```

**After:**
```
API Traces:
├─ GET /api/accounts (200ms) - User: Ahmed (ahmed@example.com)
├─ POST /api/transfer (450ms) - User: Ahmed (ahmed@example.com)
├─ GET /api/balance (180ms) - User: Fatima (fatima@example.com)
```

---

## ✅ Summary

**Immediate Action (2 lines of code):**
```kotlin
// After login
NivoStack.instance.setUser(userId, email, name)

// On logout
NivoStack.instance.clearUser()
```

**Future Enhancement (automatic):**
- SDK auto-detects user from JWT tokens
- SDK auto-detects login/logout endpoints
- Zero client code required

**Dashboard Features:**
- Filter traces by user
- Show active users count
- User-specific analytics
- Multi-user session tracking

---

**Status:** Ready to implement
**Effort:** 40 minutes (manual) to 3 hours (fully automatic)
**Value:** High - Essential for multi-user apps
