# Team Invitations - Key Decisions & Configuration

## Implementation Approach

### Phase 1: In-App Notifications Only ✅
- **No email sending** in initial phase
- Users see invitations in Studio notification bell
- Invitation links work without email
- Faster to implement and test

### Phase 2: AWS SES Integration (Later)
- Domain registered in GoDaddy
- Mail service configured there
- See `AWS_SES_SETUP_GUIDE.md` for detailed steps

---

## Configuration Settings

### 1. Invitation Expiry
- **Default**: 7 days
- **Configurable**: NivoStack Admin can change in System Configuration
- **Key**: `notifications.invitation_expiry_days`
- **UI**: Admin → Configurations → Notifications

### 2. Seat Limits (Per Plan)
- **Free Plan**: 1 seat (owner only)
- **Pro Plan**: 5 seats
- **Team Plan**: 20 seats
- **Enterprise**: Unlimited (null)
- **Enforcement**: Check before inviting new members
- **Error**: "Plan limit reached. Upgrade to invite more team members."

### 3. User Notification Preferences
Users can control:
- ✅ **Email Invitations**: Enable/disable email invitations
- ✅ **Email Project Updates**: Enable/disable project update emails
- ✅ **Email Alerts**: Enable/disable alert emails
- ✅ **Email Weekly Digest**: Enable/disable weekly digest
- ✅ **In-App Invitations**: Enable/disable in-app notifications
- ✅ **In-App Project Updates**: Enable/disable project update notifications
- ✅ **In-App Alerts**: Enable/disable alert notifications

**Default**: All enabled except weekly digest

---

## Invitation Resend Feature

### Status Tracking
When resending invitations, track:
- **Sent**: Email sent successfully
- **Delivered**: Email delivered to recipient
- **Opened**: Email opened by recipient (if tracking enabled)
- **Clicked**: Invitation link clicked (if tracking enabled)
- **Pending**: No email sent (in-app notification only)

### Resend Endpoint
```
POST /api/projects/[id]/invitations/[invitationId]/resend
```

### UI Display
Show status badges in invitation list:
- 🟢 **Sent** - Email sent
- 🟡 **Delivered** - Email delivered
- 🔵 **Opened** - Email opened
- 🟣 **Clicked** - Link clicked
- ⚪ **Pending** - In-app notification only

### Resend Count
- Track `resendCount` in `ProjectInvitation`
- Show "Resent X times" in UI
- Last resent date and user shown

---

## Database Schema Updates

### New Models
1. **ProjectMember** - Links users to projects with roles
2. **ProjectInvitation** - Tracks invitations with email tracking
3. **UserNotification** - In-app notifications
4. **UserNotificationPreferences** - User notification settings

### Updated Models
1. **Plan** - Added `maxTeamMembers` / `maxSeats`
2. **User** - Added relations for memberships and preferences
3. **Project** - Added relations for members and invitations

### System Configuration
Add to `SystemConfiguration`:
- `category: "notifications"`
- `key: "invitation_expiry_days"` → Default: 7
- `key: "email_enabled"` → Default: false (Phase 1)
- `key: "email_from_address"` → Default: noreply@nivostack.com
- `key: "email_from_name"` → Default: NivoStack

---

## API Endpoints Summary

### Invitations
- `POST /api/projects/[id]/invitations` - Send email invitation
- `POST /api/projects/[id]/invitations/link` - Generate invitation link
- `GET /api/projects/[id]/invitations` - List invitations (with status)
- `POST /api/projects/[id]/invitations/[id]/resend` - Resend invitation
- `DELETE /api/projects/[id]/invitations/[id]` - Cancel invitation
- `GET /api/invitations/[token]` - Get invitation details
- `POST /api/invitations/[token]/accept` - Accept invitation

### Team Management
- `GET /api/projects/[id]/members` - List team members
- `PATCH /api/projects/[id]/members/[id]` - Update role
- `DELETE /api/projects/[id]/members/[id]` - Remove member
- `POST /api/projects/[id]/members/[id]/transfer-ownership` - Transfer ownership

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `GET /api/notification-preferences` - Get preferences
- `PATCH /api/notification-preferences` - Update preferences

---

## Implementation Checklist

### Phase 1: Core (Week 1-2)
- [x] Plan documentation
- [ ] Database schema changes
- [ ] API endpoints
- [ ] In-app notifications
- [ ] UI components
- [ ] Role-based access

### Phase 2: AWS SES (Week 4+)
- [ ] Verify domain in AWS SES
- [ ] Request production access
- [ ] Set up SMTP credentials
- [ ] Implement email sending
- [ ] Email tracking
- [ ] Email templates

---

## Next Steps

1. ✅ Plan approved
2. ⏭️ Start Phase 1: Database schema changes
3. ⏭️ Implement API endpoints
4. ⏭️ Build UI components
5. ⏭️ Test with in-app notifications
6. ⏭️ Later: Set up AWS SES

