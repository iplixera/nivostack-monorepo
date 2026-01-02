# NivoStack Product Tracker - User Guide

**Project URLs**:
- **Repository Projects**: https://github.com/iplixera/nivostack-monorepo/projects (Recommended)
- **User Projects**: https://github.com/users/iplixera/projects/3

**Note**: The project is linked to the `nivostack-monorepo` repository and appears in the repository's Projects tab.

---

## Overview

This GitHub Project tracks all NivoStack product work in one place:
- ✅ **Features** - Product features and enhancements
- ✅ **Production Bugs** - Bugs reported by customers
- ✅ **Internal Bugs** - Bugs found internally
- ✅ **Ideas** - Product ideas and suggestions

---

## Custom Fields

### Type (Required)
- **Feature** - Product feature or enhancement
- **Production Bug** - Bug reported by customer
- **Internal Bug** - Bug found internally
- **Idea** - Product idea or suggestion

### Category
- **Analytics** - Analytics features
- **Technical** - Technical improvements
- **Database** - Database related
- **Security** - Security features
- **SDKs** - SDK related
- **Platform** - Platform features
- **Dashboard** - Dashboard UI/UX
- **API** - API related
- **Infrastructure** - Infrastructure
- **Documentation** - Documentation
- **Other** - Other category

### Status
- **To Do** - Not started
- **In Development** - Currently being developed
- **In Testing** - Being tested
- **Published** - Released to production
- **Announced** - Publicly announced

### Built-in Fields
- **Title** - Item title
- **Assignee** - Who's working on it
- **Labels** - GitHub labels
- **Milestone** - Target milestone
- **Repository** - Which repo it belongs to

---

## Recommended Views

Create these views in the project for easy filtering:

### 1. Features View
- **Filter**: Type = Feature
- **Group by**: Status
- **Sort by**: Priority (if added)

### 2. Production Bugs View
- **Filter**: Type = Production Bug
- **Group by**: Status
- **Sort by**: Created date (newest first)

### 3. Internal Bugs View
- **Filter**: Type = Internal Bug
- **Group by**: Status
- **Sort by**: Created date

### 4. Ideas View
- **Filter**: Type = Idea
- **Group by**: Category
- **Sort by**: Created date

### 5. By Category View
- **Group by**: Category
- **Filter**: Status != Published

---

## Adding Items

### Via GitHub UI

1. Go to: https://github.com/users/iplixera/projects/3
2. Click "Add item" or "+"
3. Select "Create draft issue" or link existing issue
4. Fill in:
   - **Title**: Brief description
   - **Type**: Feature/Bug/Idea
   - **Category**: Select appropriate category
   - **Status**: To Do (default)
   - **Assignee**: Who's working on it
   - **Description**: Full details

### Via AI Assistant

Just tell the AI:
- "Add a feature: URL shortener with analytics"
- "Customer reported a bug: login fails on mobile"
- "Internal bug: database query timeout"
- "Idea: Add dark mode to dashboard"

The AI will:
1. Create GitHub issue
2. Add to project with proper fields
3. Set Type, Category, Status

---

## Workflow

### For Features

1. **To Do** → Idea or planned feature
2. **In Development** → Currently being built
3. **In Testing** → QA/testing phase
4. **Published** → Released to production
5. **Announced** → Publicly announced

### For Bugs

1. **To Do** → Bug reported, not started
2. **In Development** → Being fixed
3. **In Testing** → Fix being tested
4. **Published** → Fix deployed
5. **Announced** → Fix communicated to users

---

## Best Practices

### Features
- Use clear, descriptive titles
- Include category for easy filtering
- Update status as you progress
- Link to related issues/PRs

### Production Bugs
- Include customer details (if appropriate)
- Add reproduction steps
- Set priority via labels
- Update status when fixed

### Internal Bugs
- Document how it was found
- Include technical details
- Link to related code/PRs
- Update when resolved

### Ideas
- Describe the problem it solves
- Include potential impact
- Add category for organization
- Update status when implemented

---

## Integration with Issues

All project items are linked to GitHub Issues, so you can:
- Comment and discuss
- Link PRs
- Add labels
- Set milestones
- Track progress

---

## Quick Reference

**Project**: https://github.com/users/iplixera/projects/3

**Types**:
- Feature
- Production Bug
- Internal Bug
- Idea

**Categories**:
- Analytics, Technical, Database, Security, SDKs, Platform, Dashboard, API, Infrastructure, Documentation, Other

**Status**:
- To Do → In Development → In Testing → Published → Announced

---

## Need Help?

- View project: https://github.com/users/iplixera/projects/3
- Create views for different filters
- Use AI assistant to add items automatically
- Update status as you work

