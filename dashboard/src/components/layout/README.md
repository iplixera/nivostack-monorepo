# Layout Components

## AppShell

Main application shell component that provides:
- Sidebar navigation
- Topbar with theme toggle
- Project selector
- Responsive layout

## Navigation

Navigation component with new IA structure:
- Overview (Dashboard, Analytics)
- Observe (Runtime) - Devices, Sessions, API Traces, Logs, Crashes, Live Debug
- Control (App Control Plane) - Business Config, Localization, Builds
- Operate (Ops & Reliability) - Alerts, Monitoring
- Developer - SDK Settings, API Keys, Mocking
- Organization - Team, Billing, Settings

## PageHeader

Reusable page header component with:
- Title and subtitle
- Data mode indicator (Aggregated/Raw/Live)
- Environment indicator
- Action buttons area

## Usage

```tsx
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/layout/PageHeader'

export default function MyPage() {
  return (
    <AppShell projectId="proj_123" projectName="My Project">
      <PageHeader 
        title="Page Title"
        subtitle="Page description"
        dataMode="Raw"
      >
        {/* Page content */}
      </AppShell>
    </AppShell>
  )
}
```

