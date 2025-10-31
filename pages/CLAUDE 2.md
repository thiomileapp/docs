# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **MileApp documentation repository**, containing user-facing documentation written in MDX format. MileApp is a field operations management platform that helps organizations manage tasks, routes, automations, and field workers through web and mobile applications.

The documentation covers all major platform features including:
- **Tasks**: Creating, managing, scheduling, and tracking field operations
- **Flow**: Mobile app workflow builder with customizable components
- **Route Optimization**: TSP-based route planning with multiple constraint types
- **Automation**: Event-driven task automation system
- **Settings**: User management, roles, permissions, and organization configuration
- **Billing**: Subscription and plan management
- **Integrations**: SSO with Azure AD and other third-party integrations

## Repository Structure

```
pages/
├── automation/              # Automation feature documentation
│   ├── automation-event/    # Event triggers
│   ├── automation-type/     # Action types
│   └── managing-automation/ # CRUD operations
├── billing/                 # Subscription and billing
├── configuration/           # App configuration (start/end trip, icons)
├── dashboard/               # Dashboard documentation
├── data-source/             # External data source integration
├── flow/                    # Mobile workflow builder
│   └── flow-builder/        # Individual component docs
├── getting-started/         # Onboarding guides
├── integration/             # Third-party integrations (SSO, etc.)
├── register-and-verification/ # User registration
├── route-optimization/      # Route planning feature
│   ├── configuration/       # Routing parameters
│   ├── result/              # Optimization results
│   ├── vehicle/             # Vehicle management
│   └── visit/               # Visit/stop management
├── setting/                 # Organization settings
│   ├── role-and-permission-management/
│   └── user-management/
└── task/                    # Core task management
    ├── creating-task/
    ├── managing-task/
    ├── schedule/
    └── tracking/
```

## Content Architecture

### MDX File Structure
All documentation files follow this frontmatter pattern:
```mdx
---
title: "Page Title"
---
```

### Key Domain Concepts

**Flow** - Mobile app workflows that define how field workers interact with tasks. Consists of pages with components (view, input, select, photo, signature, bill, list, timer, voice note, capture). Component limits vary by plan: Free (50), Pro (200), Enterprise (unlimited).

**Task** - A unit of work assigned to field workers. Can be created via:
- Web form (single task)
- Excel upload (bulk)
- Field mobile app
- API
- Automation triggers
- Scheduled recurring tasks

**Route Optimization** - TSP-based routing engine with hard and soft constraints including:
- Time windows, visit duration, working hours
- Tags (vehicle/visit matching)
- Capacity constraints (up to 10 types: weight, volume, etc.)
- Cost factors (vehicle priority)
- Multi-trip, clustering, auto-split, auto-merge

**Automation** - Event-driven system with three components:
1. Event (trigger): task creation, task updates, routing finished, etc.
2. Rules (filters): conditional logic for when automation runs
3. Automation Type (action): create task, update task, assign task, send webhook, etc.

## Documentation Guidelines

### When Adding/Editing Documentation

1. **Use MDX format** - All documentation is in `.mdx` files
2. **Maintain frontmatter** - Always include the `title` field in YAML frontmatter
3. **Use ClickUp CDN for images** - Images are hosted at `https://t3837933.p.clickup-attachments.com/t3837933/...`
4. **Follow hierarchical structure** - Place files in appropriate feature directories
5. **Link to related docs** - Reference related features and cross-link when relevant
6. **Include permission requirements** - Document required permissions for features when applicable

### Naming Conventions

- Use kebab-case for file names: `how-to-create-automation.mdx`
- Use descriptive names that match the content purpose
- Introduction pages: `introduction.mdx` or `introduction-to-{feature}.mdx`

## External References

- API Documentation: https://apidoc.mile.app/
- Web Application: https://web.mile.app/
- Support Email: support@mile.app
- Support WhatsApp: +62 878-0878-3630

## Common Documentation Patterns

### Feature Introduction Pages
Typically include:
- Feature overview and purpose
- Visual examples with screenshots
- Key concepts and terminology
- Available parameters/options with tables
- Use cases and examples

### How-To Guides
Follow this structure:
1. Required permissions
2. Step-by-step instructions with numbered lists
3. Screenshots showing UI elements
4. Notes and warnings where applicable

### Component/Element Documentation
- Configuration options
- Input/output types
- Constraints and limitations
- Integration with other features
