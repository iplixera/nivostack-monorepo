# Team Invitations - Testing Guide

## Overview

This document outlines the testing procedures for the team invitations feature.

## Test Scenarios

### 1. Invitation Flow

#### Test: Send Invitation
1. **Setup**: Log in as project owner/admin
2. **Action**: Navigate to Project → Team tab → Click "Invite Member"
3. **Input**: Enter email address and select role (admin/member/viewer)
4. **Expected**: 
   - Invitation created successfully
   - Notification created for invited user (if user exists)
   - Invitation appears in "Pending Invitations" list
   - Success message displayed

#### Test: Accept Invitation (Existing User)
1. **Setup**: User with account exists, invitation sent
2. **Action**: Log in as invited user → Click notification → Accept invitation
3. **Expected**:
   - User added to project members
   - Invitation status changed to "accepted"
   - Notification removed
   - Project appears in user's project list

#### Test: Accept Invitation (New User)
1. **Setup**: Invitation sent to email without account
2. **Action**: User registers → Logs in → Accesses invitation link
3. **Expected**:
   - User can accept invitation after registration
   - User added to project members

#### Test: Invitation Expiry
1. **Setup**: Create invitation (default: 7 days expiry)
2. **Action**: Wait for expiry or manually set expiresAt to past date
3. **Expected**:
   - Invitation status changes to "expired"
   - User cannot accept expired invitation
   - Error message displayed

### 2. Team Management

#### Test: View Team Members
1. **Setup**: Project with multiple members
2. **Action**: Navigate to Team tab
3. **Expected**:
   - All members displayed with roles
   - Owner listed first
   - Members sorted by role, then join date

#### Test: Remove Member
1. **Setup**: Project with multiple members (owner/admin logged in)
2. **Action**: Click "Remove" next to member
3. **Expected**:
   - Confirmation dialog appears
   - Member removed from project
   - Cannot remove owner
   - Cannot remove yourself

#### Test: Update Member Role
1. **Setup**: Project with members (owner/admin logged in)
2. **Action**: Change member role via API
3. **Expected**:
   - Role updated successfully
   - Cannot change owner role (use transfer ownership)
   - Only owners can assign owner role

#### Test: Transfer Ownership
1. **Setup**: Project with owner and admin member
2. **Action**: Owner transfers ownership to admin
3. **Expected**:
   - Old owner becomes admin
   - New owner has owner role
   - Project userId updated

### 3. Access Control

#### Test: Permission Checks
1. **Test Cases**:
   - Viewer cannot invite members
   - Member cannot remove members
   - Admin cannot delete project
   - Owner can perform all actions

#### Test: Seat Limits
1. **Setup**: Plan with maxTeamMembers limit
2. **Action**: Try to invite member when limit reached
3. **Expected**:
   - Error message displayed
   - Invitation not created
   - Current count and limit shown

### 4. Notifications

#### Test: Notification Creation
1. **Setup**: Invitation sent to existing user
2. **Expected**:
   - Notification created in database
   - Notification appears in bell dropdown
   - Unread count incremented

#### Test: Mark as Read
1. **Action**: Click notification or mark as read button
2. **Expected**:
   - Notification marked as read
   - Unread count decremented
   - Visual indicator updated

#### Test: Notification Navigation
1. **Action**: Click notification with actionUrl
2. **Expected**:
   - Navigates to invitation/project page
   - Notification marked as read
   - Dropdown closes

### 5. Edge Cases

#### Test: Duplicate Invitation
1. **Action**: Send invitation to email with pending invitation
2. **Expected**:
   - Error: "A pending invitation already exists"
   - Original invitation remains

#### Test: Invite Existing Member
1. **Action**: Send invitation to email of existing member
2. **Expected**:
   - Error: "User is already a member"
   - Invitation not created

#### Test: Accept Own Invitation
1. **Setup**: Owner sends invitation to themselves
2. **Action**: Accept invitation
3. **Expected**:
   - Handled gracefully (already member)
   - Invitation marked as accepted

#### Test: Email Mismatch
1. **Setup**: Invitation sent to email A
2. **Action**: User with email B tries to accept
3. **Expected**:
   - Error: "This invitation was sent to a different email"
   - Invitation not accepted

### 6. Project Deletion

#### Test: Delete Project with Members
1. **Setup**: Project with team members
2. **Action**: Owner deletes project
3. **Expected**:
   - All ProjectMembers deleted
   - All ProjectInvitations deleted
   - Project deleted successfully

## API Testing

### Endpoints to Test

1. **POST /api/projects/[id]/invitations**
   - Valid invitation
   - Invalid email
   - Duplicate invitation
   - Seat limit reached
   - Unauthorized access

2. **GET /api/projects/[id]/invitations**
   - List all invitations
   - Filter by status
   - Unauthorized access

3. **POST /api/invitations/[token]/accept**
   - Valid acceptance
   - Expired invitation
   - Already accepted
   - Email mismatch
   - Seat limit reached

4. **GET /api/projects/[id]/members**
   - List members
   - Unauthorized access

5. **DELETE /api/projects/[id]/members/[id]**
   - Remove member
   - Remove owner (should fail)
   - Remove yourself (should fail)
   - Unauthorized access

## UI Testing

### Components to Test

1. **TeamTab**
   - Loading states
   - Error handling
   - Empty states
   - Modal interactions
   - Role badges display

2. **NotificationBell**
   - Unread count badge
   - Dropdown open/close
   - Notification list
   - Mark as read
   - Navigation

3. **Project List**
   - Role display
   - Member projects appear
   - Owner projects appear

## Performance Testing

1. **Large Teams**: Test with 100+ members
2. **Many Invitations**: Test with 50+ pending invitations
3. **Notification Polling**: Verify 30s polling doesn't cause issues

## Security Testing

1. **Authorization**: Verify all endpoints check permissions
2. **Token Validation**: Verify invitation tokens are secure
3. **Role Escalation**: Verify users cannot escalate their own roles
4. **CSRF Protection**: Verify API endpoints are protected

## Regression Testing

1. **Existing Features**: Verify team invitations don't break existing functionality
2. **Project Creation**: Verify new projects create owner ProjectMember
3. **Legacy Projects**: Verify backward compatibility with old projects

## Checklist

- [ ] Invitation flow works end-to-end
- [ ] Team management works correctly
- [ ] Access control enforced
- [ ] Notifications work properly
- [ ] Edge cases handled
- [ ] Error messages clear
- [ ] UI responsive and intuitive
- [ ] Performance acceptable
- [ ] Security verified
- [ ] No regressions introduced

