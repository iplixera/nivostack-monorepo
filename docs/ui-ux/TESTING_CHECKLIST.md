# Testing Checklist for UI/UX Implementation

## Issue #62: Global Design System + IA Restructure

### ✅ Pre-Testing Verification

- [x] No linter errors
- [x] All imports resolved correctly
- [x] API method signatures match implementation
- [x] TypeScript types are correct
- [x] Components use theme tokens correctly

### Component Testing

#### 1. Theme System
- [ ] Theme toggle button appears in topbar
- [ ] Clicking theme toggle switches between light/dark
- [ ] Theme preference persists after page reload
- [ ] System theme detection works (if OS preference changes)
- [ ] All components use theme variables correctly
- [ ] No hardcoded colors (all use CSS variables)

#### 2. AppShell Component
- [ ] Sidebar displays correctly (300px width)
- [ ] Brand section shows logo and title
- [ ] Project selector displays current project name
- [ ] Project dropdown works (if multiple projects)
- [ ] Navigation menu displays all categories
- [ ] Active route is highlighted in navigation
- [ ] Topbar displays PageHeader content
- [ ] Content area has correct padding and max-width

#### 3. Navigation Component
- [ ] All navigation categories display:
  - [ ] Overview
  - [ ] Observe (Runtime)
  - [ ] Control (App Control Plane)
  - [ ] Operate (Ops & Reliability)
  - [ ] Developer
  - [ ] Organization
- [ ] Badges display correctly (Agg/Raw/Live)
- [ ] Count badges show (if applicable)
- [ ] Active state highlighting works
- [ ] Hover effects work
- [ ] Links navigate correctly

#### 4. PageHeader Component
- [ ] Title displays correctly
- [ ] Subtitle displays correctly
- [ ] Data mode pill displays (Aggregated/Raw/Live)
- [ ] Environment pill displays
- [ ] Action buttons render correctly
- [ ] Theme toggle button works

### Page Testing

#### 5. Devices Page (`/projects/[id]/devices`)
- [ ] Page loads without errors
- [ ] Note section displays at top
- [ ] Status row chips display correctly
- [ ] Filter bar displays all filters:
  - [ ] Search input
  - [ ] Platform dropdown
  - [ ] Debug dropdown
  - [ ] Last Seen dropdown
  - [ ] More Filters button
  - [ ] Export button
  - [ ] Saved Views button
- [ ] Stats chips display (Total, iOS, Android, Debug Enabled, Active Today)
- [ ] Devices table displays:
  - [ ] Device column (with deviceId and model)
  - [ ] Platform column
  - [ ] App column
  - [ ] OS column
  - [ ] Last Seen column
  - [ ] Debug column (with chips)
  - [ ] Status column (with chips)
  - [ ] Actions column (with buttons)
- [ ] Table rows are clickable/hoverable
- [ ] Pagination works
- [ ] Footer note displays
- [ ] Search filter works
- [ ] Loading state displays correctly
- [ ] Empty state displays correctly

#### 6. API Traces Page (`/projects/[id]/traces`)
- [ ] Page loads without errors
- [ ] Note section displays at top
- [ ] Status row chips display correctly
- [ ] Filter bar displays all filters:
  - [ ] Search input
  - [ ] Time dropdown
  - [ ] Method dropdown
  - [ ] Status dropdown
  - [ ] More Filters button
  - [ ] Export button
- [ ] Status chips display (Capture bodies, Masking, Retention)
- [ ] Traces table displays:
  - [ ] Time column
  - [ ] Method column (with bold styling)
  - [ ] Endpoint column
  - [ ] Status column (with colored chips)
  - [ ] Duration column
  - [ ] Device column
  - [ ] Screen column
  - [ ] Cost column
  - [ ] Actions column
- [ ] Status codes are color-coded correctly:
  - [ ] 2xx = green
  - [ ] 4xx = orange/warning
  - [ ] 5xx = red/danger
- [ ] Table rows are hoverable
- [ ] Pagination works
- [ ] Footer note displays
- [ ] Filters work (method, status)
- [ ] Loading state displays correctly
- [ ] Empty state displays correctly

### Integration Testing

#### 7. Navigation Flow
- [ ] Clicking "Devices" navigates to `/projects/[id]/devices`
- [ ] Clicking "API Traces" navigates to `/projects/[id]/traces`
- [ ] Active state updates when navigating
- [ ] Browser back/forward buttons work
- [ ] Direct URL access works

#### 8. Theme Consistency
- [ ] All pages use same theme
- [ ] Theme persists across navigation
- [ ] Theme applies to all components:
  - [ ] Sidebar
  - [ ] Topbar
  - [ ] Cards
  - [ ] Tables
  - [ ] Buttons
  - [ ] Chips
  - [ ] Inputs

#### 9. Responsive Design
- [ ] Layout works on desktop (1920px+)
- [ ] Layout works on laptop (1366px)
- [ ] Layout works on tablet (768px)
- [ ] Sidebar collapses appropriately (if implemented)
- [ ] Tables scroll horizontally on small screens
- [ ] Filter bars wrap correctly

### Performance Testing

#### 10. Load Performance
- [ ] Initial page load is fast (< 2s)
- [ ] Navigation between pages is instant
- [ ] Theme switching is smooth (no flash)
- [ ] No console errors
- [ ] No console warnings

#### 11. Data Loading
- [ ] Devices load correctly from API
- [ ] Traces load correctly from API
- [ ] Pagination loads next page correctly
- [ ] Filters trigger API calls correctly
- [ ] Loading states display during API calls
- [ ] Error states display on API failures

### Browser Compatibility

#### 12. Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility Testing

#### 13. Accessibility
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Screen reader friendly (if applicable)
- [ ] Color contrast meets WCAG AA
- [ ] Interactive elements are keyboard accessible

### Edge Cases

#### 14. Edge Cases
- [ ] Empty project (no devices/traces)
- [ ] Very long device IDs/URLs (text truncation)
- [ ] Many projects (project dropdown)
- [ ] Theme toggle during data load
- [ ] Navigation during data load
- [ ] Network errors (API failures)

### Manual Testing Steps

1. **Start the development server:**
   ```bash
   cd dashboard
   pnpm dev
   ```

2. **Navigate to Devices page:**
   - Go to `/projects/[projectId]/devices`
   - Verify all elements display correctly
   - Test filters and pagination
   - Test theme toggle

3. **Navigate to API Traces page:**
   - Go to `/projects/[projectId]/traces`
   - Verify all elements display correctly
   - Test filters and pagination
   - Test theme toggle

4. **Test Navigation:**
   - Click between different pages
   - Verify active states update
   - Test browser back/forward

5. **Test Theme:**
   - Toggle theme multiple times
   - Reload page and verify persistence
   - Check all components update correctly

### Known Issues / Notes

- API method signatures have been corrected
- Stats calculation uses API response when available
- Theme toggle simplified to match mockup style
- All components use CSS variables for theming

### Next Steps After Testing

1. Fix any issues found during testing
2. Update documentation if needed
3. Mark Issue #62 as complete
4. Proceed with next issues in sequence

