# Team Invitations Feature - Quick Summary

## What We're Building

A simple team collaboration system that allows project owners to invite team members with different roles (Owner, Admin, Member, Viewer) via email or shareable links.

## Key Features

✅ **Email Invitations**: Send invitations via email with custom message  
✅ **Invitation Links**: Generate shareable links for easy onboarding  
✅ **Role-Based Access**: 4 roles (Owner, Admin, Member, Viewer) with different permissions  
✅ **In-App Notifications**: Users see pending invitations in Studio  
✅ **Multi-Project Support**: Users can be members of multiple projects  

## User Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full control: Delete project, manage billing, transfer ownership, manage team |
| **Admin** | Management: Invite members, manage settings, manage builds |
| **Member** | Contributor: Edit configs, view data, create mock environments |
| **Viewer** | Read-only: View everything but cannot edit |

## Implementation Approach

**Simple & Non-Complicated**:
- Use existing User/Project models
- Add 3 new models: `ProjectMember`, `ProjectInvitation`, `UserNotification`
- Email service: Resend (simple API, good free tier)
- Invitation links: `/invite/{token}` page
- In-app notifications: Bell icon in header

## Database Changes

1. **ProjectMember** - Links users to projects with roles
2. **ProjectInvitation** - Tracks pending invitations (email + token)
3. **UserNotification** - In-app notifications for users

## API Endpoints

- `POST /api/projects/[id]/invitations` - Send email invitation
- `POST /api/projects/[id]/invitations/link` - Generate invitation link
- `GET /api/invitations/[token]` - Get invitation details
- `POST /api/invitations/[token]/accept` - Accept invitation
- `GET /api/projects/[id]/members` - List team members
- `PATCH /api/projects/[id]/members/[id]` - Update role
- `DELETE /api/projects/[id]/members/[id]` - Remove member

## UI Pages

1. **Team Tab** (`/projects/[id]?tab=team`) - Manage team members
2. **Invitation Page** (`/invite/[token]`) - Accept invitations
3. **Notification Bell** (Header) - Show pending invitations

## Implementation Timeline

- **Week 1**: Database models + API endpoints
- **Week 2**: Email integration + UI components
- **Week 3**: Role-based access + Testing
- **Week 4**: Polish + Edge cases

## Next Steps

1. Review plan: `docs/features/TEAM_INVITATIONS_PLAN.md`
2. Approve approach
3. Start Phase 1: Database schema changes

