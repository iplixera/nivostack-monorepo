# Migration Plan: Admin and Missing Pages

## 📊 Current Status

### ✅ Already Using New Design System
- All 21 mockup pages (complete)
- `/billing` - Already migrated
- `/team` - Already migrated

### ⚠️ Need Migration (Using Old Design)

#### Admin Pages (11 pages)
1. `/admin` - Admin dashboard (uses old layout, needs AppShell)
2. `/admin/plans` - Plans management
3. `/admin/subscriptions` - Subscriptions list
4. `/admin/subscriptions/create` - Create subscription
5. `/admin/subscriptions/[id]` - Subscription details
6. `/admin/users` - Users management
7. `/admin/statistics` - Statistics dashboard
8. `/admin/revenue` - Revenue dashboard
9. `/admin/promo-codes` - Promo codes management
10. `/admin/offers` - Offers management
11. `/admin/configurations` - System configurations

#### User Pages (5 pages)
1. `/profile` - User profile (uses old layout)
2. `/subscription` - Subscription management (uses old layout)
3. `/projects` - Projects list (uses old layout)
4. `/settings` - User settings (needs check)
5. `/invoices` - Invoices (needs check)
6. `/payment-methods` - Payment methods (needs check)

## 🔍 Analysis

### Admin Pages Current State
- **Layout**: Uses old layout pattern (no AppShell)
- **Styling**: Uses Tailwind classes directly (not theme CSS variables)
- **Components**: Custom tables (not DataTable component)
- **Navigation**: No sidebar navigation integration
- **Theme**: No theme toggle integration

### User Pages Current State
- **Layout**: Uses old layout pattern
- **Styling**: Uses Tailwind classes directly
- **Components**: Custom implementations
- **Navigation**: Not integrated with new Navigation component

## 🎯 Migration Strategy

### Phase 1: Admin Pages (Priority)
1. Wrap all admin pages with `AppShell`
2. Replace headers with `PageHeader`
3. Replace tables with `DataTable` component
4. Replace filter sections with `FilterBar` component
5. Update styling to use theme CSS variables
6. Add theme toggle
7. Integrate with Navigation (admin-only section)

### Phase 2: User Pages
1. Migrate `/projects` list page
2. Migrate `/profile` page
3. Migrate `/subscription` page
4. Migrate `/settings` page
5. Migrate `/invoices` page
6. Migrate `/payment-methods` page

## 📝 Implementation Notes

### Admin Navigation
- Admin pages should be in a separate section in Navigation
- Only visible when `user.isAdmin === true`
- Should be at the bottom or in a separate "Admin" section

### Access Control
- Admin layout already checks `user.isAdmin`
- Need to ensure Navigation only shows admin links for admins
- Admin pages should use same AppShell but with admin-specific navigation

## ✅ Next Steps

1. **Update Navigation** - Add admin section (admin-only)
2. **Migrate Admin Dashboard** - Start with main admin page
3. **Migrate Admin List Pages** - Users, Subscriptions, Plans, etc.
4. **Migrate Admin Detail Pages** - Subscription details, etc.
5. **Migrate User Pages** - Projects list, Profile, Subscription, etc.

## 📋 Checklist

### Admin Pages Migration
- [ ] `/admin` - Admin dashboard
- [ ] `/admin/plans` - Plans management
- [ ] `/admin/subscriptions` - Subscriptions list
- [ ] `/admin/subscriptions/create` - Create subscription
- [ ] `/admin/subscriptions/[id]` - Subscription details
- [ ] `/admin/users` - Users management
- [ ] `/admin/statistics` - Statistics dashboard
- [ ] `/admin/revenue` - Revenue dashboard
- [ ] `/admin/promo-codes` - Promo codes management
- [ ] `/admin/offers` - Offers management
- [ ] `/admin/configurations` - System configurations

### User Pages Migration
- [ ] `/projects` - Projects list
- [ ] `/profile` - User profile
- [ ] `/subscription` - Subscription management
- [ ] `/settings` - User settings
- [ ] `/invoices` - Invoices
- [ ] `/payment-methods` - Payment methods

### Navigation Updates
- [ ] Add admin section to Navigation (admin-only)
- [ ] Update Navigation to check `user.isAdmin`
- [ ] Add admin links to Navigation

