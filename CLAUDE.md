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

## Development Commands

This documentation site is built with **Mintlify**, a modern documentation platform. Here are the essential commands:

### Setup
```bash
npm i -g mint  # Install Mintlify CLI globally
```

### Local Development
```bash
mint dev  # Start local development server at http://localhost:3000
```

The development server provides:
- Hot reload for instant preview of changes
- Live error detection for MDX syntax issues
- Local preview of navigation and theming

### Maintenance
```bash
mint update  # Update Mintlify CLI to latest version
```

### Deployment
- **Automatic deployment** via Mintlify GitHub app
- Push changes to `main` branch to trigger deployment
- No manual build or deploy commands needed
- Monitor deployment status in Mintlify dashboard

### Configuration Files
- `mint.json` - Theme, navigation, and site configuration
- `docs.json` - Additional documentation settings
- Both files control sidebar navigation, branding, and feature flags

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

## MDX Best Practices

### Critical MDX Syntax Rules

**Blank Lines Required**: MDX requires blank lines between HTML block elements and markdown content. Missing blank lines cause parsing errors.

**Correct Pattern**:
```mdx
</div>

This is markdown text that follows.

<div align="center">
```

**Incorrect Pattern** (will cause parsing errors):
```mdx
</div> This text is too close
<div align="center">
```

### Image Formatting

Always center images and add captions using this pattern:

```mdx
<div align="center">
  <img src="https://t3837933.p.clickup-attachments.com/t3837933/..." alt="image" width="600" />
</div>

<p><em>Caption text describing the image</em></p>
```

**Important**:
- Self-closing `<img />` tags
- Blank line after `</div>`
- Use `<p><em>` for captions, not `_italic_` markdown syntax after images
- Standard width: 600px

### Permission Blocks

Use the `<Note>` component for permission requirements:

```mdx
<Note>
Required permission:
- View User
- Edit User
- View Role
</Note>
```

**Important**:
- Use "Required permission:" (lowercase "p", singular)
- Use markdown list format (with `-`), not escaped asterisks `\*`
- Blank line after `</Note>` before next content

### Lists After Images

When adding numbered or bulleted lists after images:

```mdx
<div align="center">
  <img src="..." alt="image" width="600" />
</div>

1. **First Item**

Description of first item.

2. **Second Item**

Description of second item.
```

## Documentation Guidelines

### When Adding/Editing Documentation

1. **Use MDX format** - All documentation is in `.mdx` files
2. **Maintain frontmatter** - Always include the `title` field in YAML frontmatter
3. **Use ClickUp CDN for images** - Images are hosted at `https://t3837933.p.clickup-attachments.com/t3837933/...`
4. **Follow hierarchical structure** - Place files in appropriate feature directories
5. **Link to related docs** - Reference related features and cross-link when relevant
6. **Include permission requirements** - Document required permissions for features when applicable
7. **Follow MDX syntax rules** - Always use proper blank line separation (see MDX Best Practices above)

### Naming Conventions

- Use kebab-case for file names: `how-to-create-automation.mdx`
- Use descriptive names that match the content purpose
- Introduction pages: `introduction.mdx` or `introduction-to-{feature}.mdx`

## Documentation Workflow

### Adding New Documentation Pages

1. **Create MDX file** in appropriate feature directory under `pages/`
2. **Add frontmatter** with title field
3. **Update navigation** in `mint.json` if the page should appear in sidebar:
   ```json
   {
     "group": "Feature Name",
     "pages": [
       "pages/feature/existing-page",
       "pages/feature/new-page"
     ]
   }
   ```
4. **Test locally** with `mint dev` to verify:
   - MDX syntax is correct
   - Images load properly
   - Navigation works
   - Page renders without errors

### Image Management

All images are hosted on **ClickUp CDN**:
- Pattern: `https://t3837933.p.clickup-attachments.com/t3837933/{uuid}/image.png`
- Images are uploaded to ClickUp and referenced by URL
- Do not commit images to the repository
- Standard image width in documentation: 600px

### Navigation Structure

The sidebar navigation is controlled by `mint.json`:
- Organized into groups by feature area
- Each group contains a list of page paths
- Pages must exist before adding to navigation
- Order in config determines display order in sidebar

### Content Reuse

Use the `snippets/` directory for reusable content:
- Create `.mdx` files in `snippets/` for repeated content
- Import snippets with `<Snippet file="snippet-name.mdx" />`
- Useful for common warnings, instructions, or tables

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

## Common Issues and Solutions

### MDX Parsing Errors

**Problem**: "Failed to parse page content" errors during `mint dev`

**Common Causes**:
1. **Missing blank lines** between HTML and markdown
   ```mdx
   <!-- Wrong -->
   </div> 1. First item

   <!-- Correct -->
   </div>

   1. First item
   ```

2. **Escaped asterisks** in lists (`\*` instead of `-`)
   ```mdx
   <!-- Wrong -->
   \*   First item
   \*   Second item

   <!-- Correct -->
   - First item
   - Second item
   ```

3. **Text immediately after closing tags**
   ```mdx
   <!-- Wrong -->
   </div> **Bold text** starts here

   <!-- Correct -->
   </div>

   **Bold text** starts here
   ```

**Solution**: Always ensure blank lines separate HTML block elements from markdown content.

### Image Centering

**Problem**: Images not centered on the page

**Solution**: Wrap all images in centered div:
```mdx
<div align="center">
  <img src="..." alt="image" width="600" />
</div>
```

**Note**: Do not use markdown image syntax `![](url)` for documentation - always use HTML with centered div wrapper.

### Permission Block Formatting

**Problem**: Permission lists not rendering correctly

**Correct Format**:
```mdx
<Note>
Required permission:
- View User
- Edit User
</Note>
```

**Common Mistakes**:
- Using "Required Permission:" (capital P)
- Using "Required Permissions:" (plural)
- Using escaped asterisks `\*` instead of `-`
- Missing blank line after `</Note>`

### Link Formatting

Internal links should use relative paths:
```mdx
[routing configuration](https://web.mile.app/route/visit)  <!-- External link to app -->
[flow configuration](/flow/building-flow)                   <!-- Internal doc link -->
```

### Git Merge Conflicts in Documentation

When resolving merge conflicts:
- Accept incoming changes if they have proper formatting (centered images, blank lines)
- Verify all changes with `mint dev` before committing
- Check for duplicate or conflicting content
