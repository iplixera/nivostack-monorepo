# Team Invitations - Subscription Model

## Overview

This document explains how subscriptions work with team invitations and seat limits.

## Current Architecture

### Subscription Model: **Per-User** (Not Per-Project)

- Each user has their own subscription
- Subscription determines the user's plan (free, pro, team, etc.)
- Plans have feature limits including `maxTeamMembers` / `maxSeats`

### Team Invitations Model: **Per-Project**

- Projects have team members (via `ProjectMember`)
- Seat limits are checked against the **project owner's subscription**
- Team members don't need their own team plan to join

## How It Works

### Scenario 1: User1 (Free Plan) Invites User2 (Free Plan)

```
User1 (Free Plan)
  └─ Project A (Owner)
      └─ Invites User2
          └─ User2 joins (Free Plan, but member of Project A)
```

**Seat Limit Check**: 
- Checks User1's plan (`maxTeamMembers`)
- Free plan typically has limit (e.g., 1-2 seats)
- User2 can join if limit not reached

**User2's Subscription**:
- User2 keeps their own subscription (Free Plan)
- User2 doesn't need to upgrade to join
- User2 can be a member of multiple projects

### Scenario 2: User1 Upgrades to Team Plan

```
User1 (Team Plan - 10 seats)
  └─ Project A (Owner)
      └─ Has User2, User3, User4... (up to 10 members)
```

**What Happens**:
1. User1 upgrades their subscription to Team Plan
2. User1's plan now has `maxTeamMembers = 10`
3. Seat limit check now allows up to 10 members
4. User2, User3, etc. can still join (they keep their own subscriptions)

**User2's Subscription**:
- User2 remains on Free Plan (or whatever they had)
- User2 doesn't need to upgrade
- User2 can join projects based on **owner's** seat limits

## Key Principles

### 1. Subscription is Per-User
- Each user manages their own subscription
- Subscription determines:
  - How many projects they can create
  - How many team members they can invite (as owner)
  - Feature access (API tracking, business config, etc.)

### 2. Seat Limits are Per-Project (Based on Owner's Plan)
- When inviting members, check the **project owner's** plan
- Owner's `maxTeamMembers` determines how many can join
- Team members don't need matching plans

### 3. Team Members Keep Their Own Subscriptions
- User2 can be on Free Plan
- User2 can join User1's Team Plan project
- User2's subscription only affects:
  - Projects they create themselves
  - Features they can use in their own projects

## Current Implementation

### Seat Limit Check (`checkSeatLimit`)

```typescript
// Gets project owner's subscription
const project = await prisma.project.findUnique({
  include: {
    user: {
      include: {
        subscription: {
          include: { plan: true }
        }
      }
    }
  }
})

// Checks owner's plan limit
const maxSeats = plan?.maxTeamMembers ?? plan?.maxSeats ?? null
```

### When Inviting

1. Check if inviter can invite (owner/admin role)
2. Check seat limit against **project owner's** plan
3. Create invitation
4. User accepts (no subscription check needed)

## Example Scenarios

### Example 1: Free Plan Owner
- **User1**: Free Plan (maxTeamMembers: 2)
- **Project A**: Owned by User1
- **Can invite**: Up to 2 team members
- **User2**: Free Plan - Can join ✅

### Example 2: Team Plan Owner
- **User1**: Team Plan (maxTeamMembers: 10)
- **Project A**: Owned by User1
- **Can invite**: Up to 10 team members
- **User2, User3...**: Any plan - Can join ✅

### Example 3: Multiple Projects
- **User1**: Team Plan (10 seats)
- **User2**: Free Plan
- **Project A**: User1 owns, User2 is member ✅
- **Project B**: User2 owns (Free Plan, 2 seats max)
- **User2 can invite**: Up to 2 members to Project B

## Benefits of This Model

1. **Flexible**: Team members don't need to upgrade
2. **Scalable**: Owner upgrades benefit entire team
3. **Fair**: Each user pays for their own features
4. **Simple**: Clear ownership and limits

## Potential Issues & Solutions

### Issue: Owner downgrades plan
- **Problem**: What if owner downgrades and exceeds seat limit?
- **Solution**: 
  - Prevent downgrade if seats exceed new limit
  - Or: Allow downgrade but prevent new invitations
  - Or: Grandfather existing members

### Issue: Multiple owners
- **Problem**: Who's plan determines seat limit?
- **Solution**: Use project's `userId` (original owner) or highest plan among owners

### Issue: Seat limits across projects
- **Problem**: Should seat limits be per-project or total?
- **Current**: Per-project (each project has its own limit based on owner)
- **Alternative**: Total across all owned projects

## Recommended Approach

**Current implementation is correct**:
- ✅ Seat limits based on project owner's plan
- ✅ Team members keep their own subscriptions
- ✅ Owner upgrades benefit the team
- ✅ Simple and flexible

**Considerations**:
- May want to add "grandfathering" for existing members when owner downgrades
- May want to show seat usage across all projects in subscription page
- May want to allow team members to contribute to seat costs (future feature)

