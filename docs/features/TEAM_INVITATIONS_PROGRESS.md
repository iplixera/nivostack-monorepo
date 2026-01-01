# Team Invitations - Implementation Progress

## Phase 1: Database Schema ✅ COMPLETE

### Models Added

1. **ProjectMember** ✅
   - Links users to projects with roles
   - Roles: owner, admin, member, viewer
   - Tracks invitation and join dates

2. **ProjectInvitation** ✅
   - Pending invitations
   - Email tracking fields (for future SES)
   - Resend tracking
   - Token-based invitation links

3. **UserNotification** ✅
   - In-app notifications
   - Read/unread status
   - Action URLs

4. **UserNotificationPreferences** ✅
   - Email notification preferences
   - In-app notification preferences

### Schema Updates

- ✅ Updated `User` model with new relations
- ✅ Updated `Project` model with members and invitations
- ✅ Updated `Plan` model with `maxTeamMembers` / `maxSeats`

### Migration

- ✅ Existing projects migrated to ProjectMember
- ✅ System configuration added:
  - `invitation_expiry_days` = 7
  - `email_enabled` = false (Phase 1: in-app only)
  - `email_from_address` = noreply@nivostack.com
  - `email_from_name` = NivoStack

---

## Phase 2: API Endpoints ⏳ IN PROGRESS

### Endpoints to Create

#### Invitation Management
- [ ] `POST /api/projects/[id]/invitations` - Send email invitation
- [ ] `POST /api/projects/[id]/invitations/link` - Generate invitation link
- [ ] `GET /api/projects/[id]/invitations` - List invitations
- [ ] `POST /api/projects/[id]/invitations/[id]/resend` - Resend invitation
- [ ] `DELETE /api/projects/[id]/invitations/[id]` - Cancel invitation
- [ ] `GET /api/invitations/[token]` - Get invitation details (public)
- [ ] `POST /api/invitations/[token]/accept` - Accept invitation (public)

#### Team Management
- [ ] `GET /api/projects/[id]/members` - List team members
- [ ] `PATCH /api/projects/[id]/members/[id]` - Update member role
- [ ] `DELETE /api/projects/[id]/members/[id]` - Remove member
- [ ] `POST /api/projects/[id]/members/[id]/transfer-ownership` - Transfer ownership

#### Notifications
- [ ] `GET /api/notifications` - Get user notifications
- [ ] `PATCH /api/notifications/[id]/read` - Mark as read
- [ ] `POST /api/notifications/read-all` - Mark all as read
- [ ] `GET /api/notification-preferences` - Get preferences
- [ ] `PATCH /api/notification-preferences` - Update preferences

#### Project Access Updates
- [ ] Update `GET /api/projects` to include user's role
- [ ] Add role-based access checks to existing endpoints

---

## Phase 3: In-App Notifications ⏳ PENDING

- [ ] Notification bell component
- [ ] Notification dropdown
- [ ] Create notifications when invitations sent
- [ ] Mark notifications as read
- [ ] Notification preferences UI

---

## Phase 4: UI Components ⏳ PENDING

- [ ] Team management page
- [ ] Invitation modals
- [ ] Invitation acceptance page
- [ ] Invitation status indicators
- [ ] Update project list with roles

---

## Phase 5: Authorization & Access Control ⏳ PENDING

- [ ] Role-based access middleware
- [ ] Update all API endpoints with role checks
- [ ] Update UI to hide/disable based on role
- [ ] Add role badges throughout UI
- [ ] Seat limit enforcement

---

## Phase 6: AWS SES Integration ⏳ PENDING (Optional)

- [ ] Verify domain in AWS SES
- [ ] Request production access
- [ ] Set up SMTP credentials
- [ ] Implement email sending
- [ ] Email tracking

---

## Next Steps

1. ✅ Phase 1 Complete
2. ⏭️ Start Phase 2: API Endpoints
   - Create invitation endpoints
   - Create team management endpoints
   - Create notification endpoints
   - Update project access logic

