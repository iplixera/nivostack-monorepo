# DevBridge Release Notes

## v1.0.0 - Initial Release

**Release Date:** December 2024

DevBridge is a comprehensive BFF (Backend For Frontend) monitoring and debugging platform for mobile applications. This initial release includes all core features for API tracing, device management, error monitoring, and analytics.

---

### Core Features

#### Device Management
- Automatic device registration with platform detection (iOS/Android)
- Device metadata tracking (OS version, app version, model, manufacturer)
- Last seen timestamps for device activity monitoring
- Device-specific filtering across all features

#### API Traces
- Full HTTP request/response capture with headers and bodies
- Status code and duration tracking
- Screen context tracking (which screen triggered the request)
- Network type, carrier, and geo-location metadata
- Grouping by screen, endpoint, or device
- Quick enable monitoring directly from any trace
- Clear traces functionality

#### Console Logs
- Capture all log levels: verbose, debug, info, warn, error, assert
- Tag-based organization (e.g., "NetworkManager", "AuthService")
- Source code location tracking (file, line, function, class)
- Screen and thread context
- Full-text search across messages, tags, and source info
- Level-based filtering with count badges
- Expandable log entries with full details
- Clear logs by level or all at once
- Batch log submission support

#### Error Monitoring & Alerts
- Create alert rules for specific endpoints and HTTP methods
- Monitor standard error codes (4xx, 5xx) or custom status codes
- Body-based error detection (JSON field matching)
- Auto-create alerts from trace errors with one click
- Edit and reconfigure alerts inline
- Track affected devices and sessions per error
- Occurrence counting and timeline
- Resolution workflow with notes

#### Cost Analytics
- Define cost per API endpoint
- Track total cost across all requests
- Cost breakdown by endpoint, device, and session
- Average cost per request calculations
- Wildcard endpoint pattern support (e.g., `/api/users/*`)

#### User Flow Visualization
- Interactive flow diagram of screen-to-screen navigation
- API calls between screens with success/error rates
- Session-based flow filtering
- Draggable nodes for custom layout
- Cost tracking per user journey

#### Notification Settings
- Email notifications with multiple addresses
- Push notification support
- SMS alerts configuration
- Webhook integration with custom headers and secrets

#### Session Tracking
- Automatic session creation on app launch
- Session duration and activity tracking
- Request count and cost per session
- Active/inactive session status

---

### SDK Integration

#### Supported Platforms
- **iOS** (Swift)
- **Android** (Kotlin)

#### SDK Features
- Device registration
- API trace capture (with OkHttp Interceptor support)
- Console log forwarding with source location
- Session management
- Crash reporting
- Batch submission for logs

#### Sample SDK Code
See [README.md](README.md) for complete integration examples including:
- `DevBridge` - Core SDK for device registration and API tracing
- `DevBridgeLogger` - Console log capture with automatic caller info
- `DevBridgeInterceptor` - OkHttp interceptor for automatic API tracing

---

### API Reference

#### SDK Endpoints (X-API-Key auth)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/devices` | POST | Register a device |
| `/api/traces` | POST | Log an API trace |
| `/api/logs` | POST | Send log messages (single or batch) |
| `/api/crashes` | POST | Report a crash |
| `/api/sessions` | POST | Start/end a session |

#### Dashboard Endpoints (JWT auth)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET/POST | List/create projects |
| `/api/devices` | GET | List devices |
| `/api/traces` | GET/DELETE | List/clear traces |
| `/api/logs` | GET/DELETE | List/clear logs with search |
| `/api/analytics` | GET | Get cost analytics |
| `/api/flow` | GET | Get user flow data |
| `/api/alerts` | GET/POST/PUT/DELETE | Manage alert rules |
| `/api/monitor` | GET/PUT/DELETE | View/resolve errors |
| `/api/settings` | GET/PUT | Notification settings |
| `/api/config` | GET/POST/PUT/DELETE | API cost config |

---

### Tech Stack

- **Framework:** Next.js 16 with App Router
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT-based auth
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

### Database Schema Highlights

- **Project** - Multi-tenant support with API keys
- **Device** - Platform-specific device tracking
- **Log** - Enhanced with tag, source info, screen context
- **ApiTrace** - Full request/response with metadata
- **ApiConfig** - Cost configuration per endpoint
- **ApiAlert** - Monitoring rules configuration
- **MonitoredError** - Tracked errors with occurrence data
- **Session** - App session lifecycle tracking
- **NotificationSettings** - Per-project notification config

---

### Known Limitations

- Notification sending (email, SMS, push, webhook) is configured but not yet implemented
- Real-time updates require manual refresh
- Large response bodies may be truncated

---

### What's Next

Planned for future releases:
- Real-time log streaming with WebSocket
- Advanced analytics with charts and trends
- Team collaboration features
- Custom dashboards
- Export functionality (CSV, JSON)
- Retention policies for data management

---

### Links

- **Live Demo:** https://devbridge-eta.vercel.app
- **GitHub:** https://github.com/pie-int/dev-bridge
- **Documentation:** See README.md

---

*Built with Next.js, Prisma, and Tailwind CSS*
