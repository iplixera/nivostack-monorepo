# Team Invitations & Role-Based Access Control - Implementation Plan

## Overview

Enable team collaboration by allowing project owners to invite team members with different roles. Support both email invitations and invitation links for easy onboarding.

## Goals

1. **Simple Onboarding**: Invite team members via email or shareable link
2. **Role-Based Access**: Control what team members can do (Owner, Admin, Member, Viewer)
3. **In-App Notifications**: Users see pending invitations in Studio
4. **Email Integration**: Send invitation emails via email service
5. **Multi-Project Support**: Users can be members of multiple projects

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
  expiresAt DateTime // Invitation expiry (default: 7 days)
  
  // Status: "pending" | "accepted" | "expired" | "cancelled"
  status    String   @default("pending")
  
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
    status: string
  }>
}
```

#### `DELETE /api/projects/[id]/invitations/[invitationId]`
**Cancel invitation**

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

## Email Service Integration

### Email Templates

#### 1. Invitation Email
**Subject**: `You've been invited to join {projectName} on NivoStack`

**Content**:
```
Hi there,

{inviterName} ({inviterEmail}) has invited you to join the "{projectName}" project on NivoStack as a {role}.

Click the link below to accept the invitation:
{acceptLink}

This invitation will expire on {expiresAt}.

If you don't have a NivoStack account, you'll be prompted to create one.

Best regards,
The NivoStack Team
```

#### 2. Invitation Accepted Email (to inviter)
**Subject**: `{inviteeEmail} accepted your invitation to {projectName}`

### Email Service Options

**Option 1: Resend (Recommended)**
- Simple API
- Good free tier
- Easy integration

**Option 2: SendGrid**
- More features
- Better analytics
- Requires setup

**Option 3: AWS SES**
- Cost-effective at scale
- More complex setup

**Implementation**: Start with Resend, can switch later.

---

## Implementation Phases

### Phase 1: Database & Core Models (Week 1)
- [ ] Add `ProjectMember` model
- [ ] Add `ProjectInvitation` model
- [ ] Add `UserNotification` model
- [ ] Update `User` and `Project` models
- [ ] Run migrations
- [ ] Create seed data for testing

### Phase 2: API Endpoints (Week 1-2)
- [ ] Invitation CRUD endpoints
- [ ] Team member management endpoints
- [ ] Notification endpoints
- [ ] Update project access checks
- [ ] Add role-based authorization middleware

### Phase 3: Email Integration (Week 2)
- [ ] Set up Resend account
- [ ] Create email templates
- [ ] Implement email sending service
- [ ] Send invitation emails
- [ ] Send acceptance notification emails

### Phase 4: UI Components (Week 2-3)
- [ ] Team management page
- [ ] Invitation modals
- [ ] Invitation acceptance page
- [ ] Notification bell component
- [ ] Update project list with roles

### Phase 5: Authorization & Access Control (Week 3)
- [ ] Role-based access middleware
- [ ] Update all API endpoints with role checks
- [ ] Update UI to hide/disable based on role
- [ ] Add role badges throughout UI

### Phase 6: Testing & Polish (Week 3-4)
- [ ] Test invitation flows
- [ ] Test role-based access
- [ ] Test email delivery
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

## Questions to Resolve

1. **Email Service**: Confirm Resend vs SendGrid vs AWS SES
2. **Invitation Expiry**: Default 7 days - is this acceptable?
3. **Role Limits**: Should there be limits on number of admins/members?
4. **Notification Preferences**: Allow users to disable email notifications?
5. **Invitation Resend**: Allow resending expired invitations?

---

## Next Steps

1. Review and approve this plan
2. Set up Resend account and get API key
3. Start Phase 1: Database schema changes
4. Create feature branch: `feature/team-invitations`
5. Begin implementation following phases above

