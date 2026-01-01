# Team Invitations & Role-Based Access Control - Implementation Plan

## Overview

Enable team collaboration by allowing project owners to invite team members with different roles. Support both email invitations and invitation links for easy onboarding.

## Goals

1. **Simple Onboarding**: Invite team members via email or shareable link
2. **Role-Based Access**: Control what team members can do (Owner, Admin, Member, Viewer)
3. **In-App Notifications**: Users see pending invitations in Studio (Phase 1)
4. **Email Integration**: AWS SES integration (Phase 2) - Domain registered in GoDaddy
5. **Multi-Project Support**: Users can be members of multiple projects
6. **Seat Limits**: Plan-based limits on team members
7. **User Preferences**: Users can enable/disable email notifications
8. **Invitation Resend**: Resend invitations with status tracking

---

## Database Schema Changes

### 1. ProjectMember (Many-to-Many: User ↔ Project)

```prisma
model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Role: "owner" | "admin" | "member" | "viewer"
  role      String   @default("member")
  
  // Invitation tracking
  invitedBy String? // User ID who sent the invitation
  invitedAt DateTime @default(now())
  joinedAt  DateTime? // When user accepted invitation
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@index([role])
}
```

### 2. ProjectInvitation (Pending Invitations)

```prisma
model ProjectInvitation {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  // Invitation details
  email     String   // Email of invited user
  role      String   @default("member") // "admin" | "member" | "viewer"
  
  // Invitation token for link-based invitations
  token     String   @unique @default(cuid()) // Unique token for invitation link
  
  // Invitation source
  invitedBy String   // User ID who sent invitation
  invitedAt DateTime @default(now())
  expiresAt DateTime // Invitation expiry (configurable via SystemConfiguration)
  
  // Status: "pending" | "accepted" | "expired" | "cancelled"
  status    String   @default("pending")
  
  // Email tracking
  emailSent      Boolean   @default(false) // Whether email was sent
  emailSentAt    DateTime? // When email was sent
  emailDelivered Boolean   @default(false) // Whether email was delivered (SES)
  emailOpened    Boolean   @default(false) // Whether email was opened (SES)
  emailClicked    Boolean   @default(false) // Whether link was clicked (SES)
  
  // Resend tracking
  resendCount    Int       @default(0) // Number of times invitation was resent
  lastResentAt   DateTime? // Last time invitation was resent
  lastResentBy   String?   // User ID who last resent
  
  // Acceptance tracking
  acceptedAt DateTime?
  acceptedBy String? // User ID who accepted (if user existed)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([projectId])
  @@index([email])
  @@index([token])
  @@index([status])
  @@index([expiresAt])
  @@index([emailSent])
}
```

### 3. UserNotification (In-App Notifications)

```prisma
model UserNotification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Notification type: "invitation" | "project_update" | "alert" | etc.
  type      String
  
  // Notification data
  title     String
  message   String   @db.Text
  data      Json? // Additional data (e.g., invitationId, projectId)
  
  // Status
  read      Boolean  @default(false)
  readAt    DateTime?
  
  // Action link
  actionUrl String? // e.g., "/projects/{id}/invitations/{invitationId}"
  
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([userId, read])
  @@index([type])
  @@index([createdAt])
}
```

### 4. Update Existing Models

**User Model:**
```prisma
model User {
  // ... existing fields ...
  projectMemberships ProjectMember[]
  invitations        ProjectInvitation[] // Invitations sent by this user
  notifications      UserNotification[]
  notificationPreferences UserNotificationPreferences?
}
```

**UserNotificationPreferences:**
```prisma
model UserNotificationPreferences {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Email notification preferences
  emailInvitations      Boolean @default(true) // Receive invitation emails
  emailProjectUpdates   Boolean @default(true) // Receive project update emails
  emailAlerts           Boolean @default(true) // Receive alert emails
  emailWeeklyDigest     Boolean @default(false) // Receive weekly digest
  
  // In-app notification preferences
  inAppInvitations      Boolean @default(true) // Show invitation notifications
  inAppProjectUpdates   Boolean @default(true) // Show project update notifications
  inAppAlerts           Boolean @default(true) // Show alert notifications
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

**Project Model:**
```prisma
model Project {
  // ... existing fields ...
  members      ProjectMember[]
  invitations  ProjectInvitation[]
  
  // Keep userId for backward compatibility (owner)
  // ownerId is now the userId of the ProjectMember with role="owner"
}
```

**Plan Model - Add Seat Limits:**
```prisma
model Plan {
  // ... existing fields ...
  
  // Team & Seats
  maxTeamMembers Int? // Maximum team members (null = unlimited)
  maxSeats        Int? // Alias for maxTeamMembers (for clarity)
  
  // ... rest of fields ...
}
```

---

## Role Definitions

### Owner
- **Full control**: Can delete project, manage billing, transfer ownership
- **Can do**: Everything Admin can do, plus:
  - Delete project
  - Transfer ownership
  - Manage billing/subscription
  - Remove any team member

### Admin
- **Management**: Can manage project settings and team members
- **Can do**: Everything Member can do, plus:
  - Invite/remove team members
  - Change member roles (except Owner)
  - Manage project settings (SDK settings, feature flags, etc.)
  - Manage builds and deployments

### Member
- **Contributor**: Can view and edit project data
- **Can do**: Everything Viewer can do, plus:
  - Create/edit business configs
  - Create/edit localization
  - View devices, logs, traces, sessions
  - Create/edit mock environments

### Viewer
- **Read-only**: Can only view project data
- **Can do**:
  - View project dashboard
  - View devices, logs, traces, sessions (read-only)
  - View business configs and localization (read-only)
  - View builds and deployments (read-only)
  - **Cannot**: Edit anything, invite members, change settings

---

## API Endpoints

### 1. Invitation Management

#### `POST /api/projects/[id]/invitations`
**Send invitation by email**
```typescript
{
  email: string
  role: "admin" | "member" | "viewer"
  message?: string // Optional personal message
}
```

#### `POST /api/projects/[id]/invitations/link`
**Generate invitation link**
```typescript
{
  role: "admin" | "member" | "viewer"
  expiresInDays?: number // Default: 7
}
```
**Response:**
```typescript
{
  link: string // Full URL: https://studio.nivostack.com/invite/{token}
  token: string
  expiresAt: string
}
```

#### `GET /api/projects/[id]/invitations`
**List pending invitations**
```typescript
{
  invitations: Array<{
    id: string
    email: string
    role: string
    invitedBy: { id: string, name: string, email: string }
    invitedAt: string
    expiresAt: string
    status: "pending" | "accepted" | "expired" | "cancelled"
    // Email tracking
    emailSent: boolean
    emailSentAt: string | null
    emailDelivered: boolean
    emailOpened: boolean
    emailClicked: boolean
    // Resend tracking
    resendCount: number
    lastResentAt: string | null
    lastResentBy: { id: string, name: string, email: string } | null
  }>
}
```

#### `DELETE /api/projects/[id]/invitations/[invitationId]`
**Cancel invitation**

#### `POST /api/projects/[id]/invitations/[invitationId]/resend`
**Resend invitation**
```typescript
{
  // Optional: new expiry date
  expiresInDays?: number
}
```
**Response:**
```typescript
{
  invitation: {
    id: string
    email: string
    status: "pending" | "sent" | "delivered" | "opened" | "clicked"
    resendCount: number
    lastResentAt: string
    emailSent: boolean
    emailSentAt: string
    emailDelivered: boolean
    emailOpened: boolean
    emailClicked: boolean
  }
}
```

#### `GET /api/invitations/[token]`
**Get invitation details (public endpoint, no auth)**
```typescript
{
  invitation: {
    id: string
    project: { id: string, name: string }
    role: string
    invitedBy: { name: string, email: string }
    expiresAt: string
  }
}
```

#### `POST /api/invitations/[token]/accept`
**Accept invitation (public endpoint, requires auth after login)**
```typescript
{
  // If user not logged in, redirect to login with ?redirect=/invite/{token}
  // After login, auto-accept invitation
}
```

### 2. Team Management

#### `GET /api/projects/[id]/members`
**List project members**
```typescript
{
  members: Array<{
    id: string
    user: { id: string, name: string, email: string }
    role: string
    joinedAt: string
    invitedBy: { name: string, email: string }
  }>
}
```

#### `PATCH /api/projects/[id]/members/[memberId]`
**Update member role**
```typescript
{
  role: "admin" | "member" | "viewer"
}
```

#### `DELETE /api/projects/[id]/members/[memberId]`
**Remove team member**

#### `POST /api/projects/[id]/members/[memberId]/transfer-ownership`
**Transfer project ownership (Owner only)**

### 3. Notifications

#### `GET /api/notifications`
**Get user notifications**
```typescript
{
  notifications: Array<{
    id: string
    type: string
    title: string
    message: string
    read: boolean
    actionUrl?: string
    createdAt: string
  }>
  unreadCount: number
}
```

#### `PATCH /api/notifications/[id]/read`
**Mark notification as read**

#### `POST /api/notifications/read-all`
**Mark all notifications as read**

### 4. Project Access

#### `GET /api/projects`
**Updated to return projects user is member of (not just owner)**
```typescript
{
  projects: Array<{
    id: string
    name: string
    role: "owner" | "admin" | "member" | "viewer" // User's role in project
    // ... other project fields
  }>
}
```

---

## UI Components & Pages

### 1. Project Settings - Team Tab

**Location**: `/projects/[id]?tab=team`

**Features**:
- List current team members with roles
- Invite by email button
- Generate invitation link button
- Pending invitations list
- Remove member / Change role actions

**Components**:
- `TeamMembersList.tsx` - Display members
- `InviteMemberModal.tsx` - Email invitation form
- `InvitationLinkModal.tsx` - Generate and copy link
- `PendingInvitationsList.tsx` - Show pending invitations
- `MemberRoleDropdown.tsx` - Change member role

### 2. Invitation Acceptance Page

**Location**: `/invite/[token]`

**Flow**:
1. User clicks invitation link
2. If not logged in → Redirect to login with redirect param
3. If logged in → Show invitation details
4. User clicks "Accept" → Create ProjectMember, delete invitation, show success
5. Redirect to project dashboard

**Components**:
- `InvitationAcceptPage.tsx` - Main acceptance page
- `InvitationDetails.tsx` - Show invitation info

### 3. Notification Bell (Header)

**Location**: Header component

**Features**:
- Show unread notification count badge
- Dropdown with recent notifications
- Click notification → Navigate to action URL
- "Mark all as read" button

**Components**:
- `NotificationBell.tsx` - Bell icon with badge
- `NotificationDropdown.tsx` - Notification list dropdown
- `NotificationItem.tsx` - Single notification item

### 4. Dashboard Updates

**Updates**:
- Project list shows user's role badge
- Filter projects by role
- Project access checks based on role
- Hide/disable actions based on role

---

## Email Service Integration - AWS SES

### Phase 1: In-App Notifications Only
- **No email sending** in Phase 1
- Users see invitations in Studio notification bell
- Invitation links work without email

### Phase 2: AWS SES Integration

**Domain Setup**: Domain registered in GoDaddy, mail service configured there.

#### AWS SES Setup Steps

**Step 1: Verify Domain in AWS SES**
1. Go to AWS SES Console → Verified identities
2. Click "Create identity" → Choose "Domain"
3. Enter your domain (e.g., `nivostack.com`)
4. AWS provides DNS records to add:
   - **CNAME records** for domain verification
   - **MX records** (if receiving emails)
   - **TXT record** for SPF
   - **TXT record** for DKIM (3 records)
5. Add these records in **GoDaddy DNS settings**
6. Wait for verification (usually 24-48 hours)

**Step 2: Request Production Access**
1. AWS SES starts in "Sandbox" mode (can only send to verified emails)
2. Request production access:
   - Go to AWS SES → Account dashboard
   - Click "Request production access"
   - Fill out form (use case: Team invitation emails)
   - Wait for approval (usually 24 hours)

**Step 3: Configure SMTP Credentials**
1. Go to AWS SES → SMTP settings
2. Click "Create SMTP credentials"
3. Save credentials securely (IAM user with SES sending permissions)

**Step 4: Set Up Environment Variables**
```env
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your_access_key
AWS_SES_SECRET_ACCESS_KEY=your_secret_key
AWS_SES_FROM_EMAIL=noreply@nivostack.com
AWS_SES_FROM_NAME=NivoStack
```

**Step 5: Install AWS SDK**
```bash
pnpm add @aws-sdk/client-ses
```

**Step 6: Create Email Service**
- Create `src/lib/email/ses.ts` for SES integration
- Create `src/lib/email/templates.ts` for email templates
- Create `src/lib/email/invitation.ts` for invitation emails

**Step 7: Configure Email Tracking**
- Set up SES event publishing to SNS
- Track email delivery, opens, clicks
- Update `ProjectInvitation` model with tracking fields

### Email Templates

#### 1. Invitation Email
**Subject**: `You've been invited to join {projectName} on NivoStack`

**Content**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>You've been invited to join {projectName}</h2>
    <p>Hi there,</p>
    <p>{inviterName} ({inviterEmail}) has invited you to join the "<strong>{projectName}</strong>" project on NivoStack as a <strong>{role}</strong>.</p>
    <p><a href="{acceptLink}" class="button">Accept Invitation</a></p>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #666;">{acceptLink}</p>
    <p>This invitation will expire on <strong>{expiresAt}</strong>.</p>
    <p>If you don't have a NivoStack account, you'll be prompted to create one.</p>
    <div class="footer">
      <p>Best regards,<br>The NivoStack Team</p>
      <p>This email was sent to {email}. If you didn't expect this invitation, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
```

#### 2. Invitation Accepted Email (to inviter)
**Subject**: `{inviteeEmail} accepted your invitation to {projectName}`

**Content**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Invitation Accepted</h2>
    <p>Hi {inviterName},</p>
    <p><strong>{inviteeEmail}</strong> has accepted your invitation to join the "<strong>{projectName}</strong>" project.</p>
    <p><a href="{projectUrl}">View Project</a></p>
  </div>
</body>
</html>
```

#### 3. Invitation Resent Email
**Subject**: `Reminder: You've been invited to join {projectName} on NivoStack`

**Content**: Same as invitation email, with note: "This is a reminder. You previously received this invitation on {originalInvitedAt}."

### System Configuration for Email

Add to `SystemConfiguration`:
- `category: "notifications"`
- `key: "invitation_expiry_days"` → Default: 7 (configurable by admin)
- `key: "email_enabled"` → Enable/disable email sending globally
- `key: "email_from_address"` → Default sender email
- `key: "email_from_name"` → Default sender name

### Email Tracking

**SES Event Types**:
- `send` - Email sent successfully
- `delivery` - Email delivered
- `open` - Email opened (if tracking enabled)
- `click` - Link clicked (if tracking enabled)
- `bounce` - Email bounced
- `complaint` - Marked as spam

**Implementation**:
1. Set up SNS topic for SES events
2. Create webhook endpoint: `/api/webhooks/ses`
3. Update `ProjectInvitation` with tracking data
4. Show status in UI: "Sent", "Delivered", "Opened", "Clicked", "Pending"

---

## Implementation Phases

### Phase 1: Database & Core Models (Week 1)
- [ ] Add `ProjectMember` model
- [ ] Add `ProjectInvitation` model (with email tracking fields)
- [ ] Add `UserNotification` model
- [ ] Add `UserNotificationPreferences` model
- [ ] Update `User` and `Project` models
- [ ] Update `Plan` model with `maxTeamMembers` / `maxSeats`
- [ ] Add SystemConfiguration for invitation expiry (default: 7 days)
- [ ] Run migrations
- [ ] Create seed data for testing

### Phase 2: API Endpoints (Week 1-2)
- [ ] Invitation CRUD endpoints
- [ ] Invitation resend endpoint with status tracking
- [ ] Team member management endpoints
- [ ] Notification endpoints
- [ ] User notification preferences endpoints
- [ ] Seat limit checking (check plan limits before inviting)
- [ ] Update project access checks
- [ ] Add role-based authorization middleware

### Phase 3: In-App Notifications (Week 2)
- [ ] Notification bell component
- [ ] Notification dropdown
- [ ] Create notifications when invitations sent
- [ ] Mark notifications as read
- [ ] Notification preferences UI

### Phase 4: UI Components (Week 2-3)
- [ ] Team management page
- [ ] Invitation modals (with resend option)
- [ ] Invitation acceptance page
- [ ] Invitation status indicators (Sent, Delivered, Opened, Clicked, Pending)
- [ ] Update project list with roles
- [ ] User notification preferences page

### Phase 5: Authorization & Access Control (Week 3)
- [ ] Role-based access middleware
- [ ] Update all API endpoints with role checks
- [ ] Update UI to hide/disable based on role
- [ ] Add role badges throughout UI
- [ ] Seat limit enforcement

### Phase 6: AWS SES Integration (Week 4) - OPTIONAL
- [ ] Verify domain in AWS SES
- [ ] Request production access
- [ ] Set up SMTP credentials
- [ ] Install AWS SDK
- [ ] Create email service (`src/lib/email/ses.ts`)
- [ ] Create email templates
- [ ] Implement invitation email sending
- [ ] Set up SES event tracking (SNS webhook)
- [ ] Update invitation status based on email events
- [ ] Test email delivery

### Phase 7: Testing & Polish (Week 3-4)
- [ ] Test invitation flows (with and without email)
- [ ] Test role-based access
- [ ] Test seat limits
- [ ] Test invitation resend
- [ ] Test notification preferences
- [ ] Test edge cases (expired invitations, etc.)
- [ ] Add loading states and error handling
- [ ] Add analytics tracking

---

## Security Considerations

1. **Invitation Tokens**: Use secure random tokens (cuid)
2. **Token Expiry**: Default 7 days, configurable
3. **Rate Limiting**: Limit invitation sends per user/project
4. **Email Validation**: Validate email format before sending
5. **Role Escalation**: Prevent users from elevating their own role
6. **Owner Protection**: Prevent removing last owner
7. **Access Control**: All endpoints check user's role in project

---

## Migration Strategy

### Existing Projects
- All existing projects have `userId` (owner)
- Migration script:
  1. For each Project, create `ProjectMember` with `role="owner"`
  2. Keep `userId` field for backward compatibility (deprecated)
  3. New code uses `ProjectMember` to determine ownership

### Backward Compatibility
- Keep `Project.userId` field (mark as deprecated)
- Use `ProjectMember` with `role="owner"` for new logic
- Gradually migrate to new system

---

## Testing Checklist

- [ ] Owner can invite team members
- [ ] Owner can generate invitation links
- [ ] Invitation emails are sent correctly
- [ ] Invitation links work for logged-in users
- [ ] Invitation links redirect to login for non-logged-in users
- [ ] Users can accept invitations
- [ ] Users see notifications for invitations
- [ ] Role-based access works correctly
- [ ] Owner can remove members
- [ ] Owner can change member roles
- [ ] Admin can invite members (but not change owner)
- [ ] Member cannot invite others
- [ ] Viewer has read-only access
- [ ] Expired invitations cannot be accepted
- [ ] Cancelled invitations cannot be accepted
- [ ] Project list shows correct projects for each user
- [ ] Project access is enforced in API

---

## Future Enhancements

1. **Bulk Invitations**: Invite multiple users at once
2. **Custom Roles**: Allow custom role definitions per project
3. **Team Workspaces**: Group projects into workspaces
4. **Activity Log**: Track team member actions
5. **SSO Integration**: Single Sign-On for enterprise
6. **Two-Factor Auth**: Enhanced security for team accounts

---

## Success Metrics

- Number of team invitations sent
- Invitation acceptance rate
- Average team size per project
- Time to onboard new team member
- User engagement with notifications

---

## Configuration & Settings

### System Configuration (Admin)

**Category**: `notifications`

| Key | Default | Description |
|-----|---------|-------------|
| `invitation_expiry_days` | `7` | Number of days before invitation expires |
| `email_enabled` | `false` | Enable/disable email sending globally (Phase 1: false) |
| `email_from_address` | `noreply@nivostack.com` | Default sender email |
| `email_from_name` | `NivoStack` | Default sender name |

### Plan Seat Limits

Each plan has `maxTeamMembers` / `maxSeats`:
- **Free Plan**: 1 seat (owner only)
- **Pro Plan**: 5 seats
- **Team Plan**: 20 seats
- **Enterprise**: Unlimited (null)

### User Notification Preferences

Users can control:
- **Email notifications**: Enable/disable email invitations
- **In-app notifications**: Enable/disable in-app notifications
- Per notification type: Invitations, Project Updates, Alerts

## Resolved Decisions

✅ **Email Service**: AWS SES (domain in GoDaddy)  
✅ **Invitation Expiry**: 7 days default, configurable by admin  
✅ **Seat Limits**: Yes, per plan  
✅ **Notification Preferences**: Yes, users can enable/disable  
✅ **Invitation Resend**: Yes, with status tracking (Sent, Delivered, Opened, Clicked, Pending)

---

## Next Steps

1. Review and approve this plan
2. Set up Resend account and get API key
3. Start Phase 1: Database schema changes
4. Create feature branch: `feature/team-invitations`
5. Begin implementation following phases above

