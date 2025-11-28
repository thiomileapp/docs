# MileApp API Documentation Development Workflow

This document describes how to develop and update the MileApp Mintlify API documentation.

## Quick Reference

```bash
# Build OpenAPI specs from source files
node scripts/build-openapi.js

# Generate/update overview pages
node scripts/generate-tag-overviews.js --dry-run

# Validate OpenAPI spec
mint openapi-check openapi/public/openapi-full.json

# Start local dev server
mint dev
```

---

## Project Structure

```
mintlify-mileapp/
├── api-specs/                    # Source API specifications
│   ├── base/
│   │   ├── initial.yaml          # Public API base config
│   │   ├── initial_internal.yaml # Internal API base config
│   │   ├── params.yaml           # Shared parameters
│   │   └── tag-descriptions.yaml # Tag descriptions for overview pages
│   ├── public/                   # Public API endpoints
│   │   ├── 1_Task/
│   │   ├── 2_Routing/
│   │   ├── 3_Flow/
│   │   ├── 4_Data/
│   │   ├── 5_Setting/
│   │   └── 6_ImportExport/
│   ├── internal/                 # Internal-only endpoints
│   │   ├── 7_Activity/
│   │   ├── 8_Billing/
│   │   └── ...
│   └── Models/                   # Schema definitions
│       ├── Task.json
│       ├── Route.json
│       └── Plugin.json
├── openapi/                      # Generated OpenAPI specs
│   ├── public/
│   │   ├── openapi-full.json     # Complete public API
│   │   ├── openapi-task.json     # Task module only
│   │   ├── openapi-routing.json
│   │   └── ...
│   └── internal/
│       ├── openapi-full.json     # Complete internal API
│       └── ...                   # Module-specific specs
├── api-reference/                # Public API MDX pages
│   ├── introduction.mdx
│   ├── authentication.mdx
│   ├── status-codes.mdx
│   ├── task/
│   │   ├── overview.mdx
│   │   └── *-overview.mdx        # Sub-tag overview pages
│   ├── objects/                  # Schema documentation
│   │   ├── task-object.mdx
│   │   └── ...
│   └── ...
├── api-reference-internal/       # Internal API MDX pages (noindex)
│   ├── introduction.mdx
│   ├── task/
│   │   └── overview.mdx
│   ├── webhooks/                 # Webhook documentation
│   └── ...
├── scripts/
│   ├── build-openapi.js          # OpenAPI build script
│   └── generate-tag-overviews.js # Overview page generator
└── docs.json                     # Navigation config
```

---

## Scripts

### 1. build-openapi.js

Compiles modular JSON files into OpenAPI 3.0 specs for Mintlify.

```bash
# Build all (public + internal)
node scripts/build-openapi.js

# Build public only
node scripts/build-openapi.js public

# Build internal only
node scripts/build-openapi.js internal
```

**What it does:**
1. Loads base YAML configs (`initial.yaml`, `params.yaml`)
2. Merges module JSON files from `public/` and `internal/`
3. Merges Models from `Models/` directory
4. Converts Swagger 2.0 to OpenAPI 3.0
5. Applies Mintlify compatibility fixes:
   - Fix invalid types (`datetime` → `string` with format)
   - Fix `type`/`required` keyword collisions
   - Convert HTML descriptions to Markdown
   - Fix security scheme references
6. Adds `noindex` metadata to internal API endpoints
7. Splits into module-specific files for navigation
8. Outputs to `openapi/public/` and `openapi/internal/`

### 2. generate-tag-overviews.js

Generates MDX overview pages from `tag-descriptions.yaml`.

```bash
# Preview without writing (recommended first step)
node scripts/generate-tag-overviews.js --dry-run

# Generate all (public + internal)
node scripts/generate-tag-overviews.js

# Generate public API only
node scripts/generate-tag-overviews.js --public

# Generate internal API only
node scripts/generate-tag-overviews.js --internal

# Generate specific tag
node scripts/generate-tag-overviews.js --tag "Workflow"

# Overwrite existing files
node scripts/generate-tag-overviews.js --force
```

**What it does:**
1. Reads tag descriptions from `api-specs/base/tag-descriptions.yaml`
2. Reads endpoints from generated OpenAPI specs
3. Generates MDX files with:
   - Frontmatter (title, description, noindex for internal)
   - Tag description content
   - Card links to key endpoints
   - Related resources links
4. Skips existing files unless `--force` is used

**Safety:** The script won't overwrite existing pages by default. Use `--dry-run` first to preview.

---

## SEO Configuration

### Public API Pages
- Indexed by search engines (default)
- No special frontmatter needed

### Internal API Pages
Two layers of noindex protection:

1. **MDX Frontmatter** (for manually created pages):
   ```yaml
   ---
   title: 'Page Title'
   noindex: true
   ---
   ```

2. **OpenAPI Metadata** (for auto-generated endpoint pages):
   The `build-openapi.js` script adds `x-mint.metadata.noindex: true` to all internal API operations.

---

## Development Workflows

### 1. Adding a New API Endpoint

**Step 1: Edit the source JSON file**

```bash
# Find the right module directory
ls api-specs/public/

# Edit the JSON file
vim api-specs/public/1_Task/1_Task.json
```

**Step 2: Add the endpoint definition**

```json
{
  "paths": {
    "/your-new-endpoint": {
      "get": {
        "summary": "Get something",
        "tags": ["Task"],
        "parameters": [
          {
            "name": "hubId",
            "in": "query",
            "required": true,
            "type": "string",
            "description": "Hub ID"
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "schema": {
              "type": "object",
              "properties": {
                "status": { "type": "boolean" },
                "data": { "type": "object" }
              }
            }
          }
        }
      }
    }
  }
}
```

**Step 3: Build and validate**

```bash
node scripts/build-openapi.js
mint openapi-check openapi/public/openapi-full.json
mint dev
```

**Step 4: Commit changes**

```bash
git add api-specs/ openapi/
git commit -m "feat(api): add GET /your-new-endpoint"
```

---

### 2. Adding a New Tag/Module

**Step 1: Add tag description**

Edit `api-specs/base/tag-descriptions.yaml`:

```yaml
YourNewTag: |
  Description of your new tag/module.
  This will appear in the overview page.

  **To see the details, please follow [this link](#tag/your_model)**
```

**Step 2: Create endpoints**

Create JSON file in appropriate module directory.

**Step 3: Build and generate overview**

```bash
node scripts/build-openapi.js
node scripts/generate-tag-overviews.js --tag "YourNewTag" --dry-run
node scripts/generate-tag-overviews.js --tag "YourNewTag"
```

**Step 4: Update navigation**

Edit `docs.json` to add the new group.

---

### 3. Adding Internal-Only Endpoints

Internal endpoints are not visible in public API documentation and are excluded from SEO.

**Step 1: Create in internal directory**

```bash
mkdir -p api-specs/internal/7_Activity
vim api-specs/internal/7_Activity/1_Activity.json
```

**Step 2: Build internal spec**

```bash
node scripts/build-openapi.js internal
```

**Step 3: Generate overview (with noindex)**

```bash
node scripts/generate-tag-overviews.js --internal --tag "Activity"
```

The generated MDX will automatically include `noindex: true`.

---

### 4. Creating/Updating Overview Pages

**Option A: Use the generator script (recommended)**

```bash
# Preview first
node scripts/generate-tag-overviews.js --dry-run --tag "TaskSchedule"

# Generate
node scripts/generate-tag-overviews.js --tag "TaskSchedule"
```

**Option B: Manual creation**

```bash
vim api-reference/task/task-schedule-overview.mdx
```

```mdx
---
title: 'Task Schedule Overview'
description: 'Schedule recurring tasks'
---

## What is Task Schedule?

Task Schedule is a mechanism to generate tasks...

<CardGroup cols={2}>
  <Card title="Create Schedule" icon="plus" href="/api-reference/task/task-schedule/create-task-schedule">
    POST /task-schedules
  </Card>
</CardGroup>
```

---

### 5. Fixing Broken Card Links

Card links in overview pages must match Mintlify's generated URLs.

**Step 1: Find the correct URL**

1. Run `mint dev`
2. Navigate to the sidebar
3. Click the endpoint to see the actual URL
4. URL pattern: `/api-reference/{group}/{tag}/{endpoint-slug}`

**Step 2: Update the MDX file**

```mdx
<!-- Wrong -->
<Card href="/api-reference/task/get-tasks">

<!-- Correct -->
<Card href="/api-reference/task/task/read-tasks">
```

---

## Navigation Configuration

### docs.json Structure

```json
{
  "navigation": {
    "tabs": [
      {
        "tab": "API Reference",
        "groups": [
          {
            "group": "Getting Started",
            "pages": ["api-reference/introduction", "..."]
          },
          {
            "group": "Task",
            "openapi": {
              "source": "openapi/public/openapi-task.json",
              "directory": "api-reference/task"
            },
            "pages": [
              {
                "group": "Overview",
                "pages": [
                  "api-reference/task/overview",
                  "api-reference/task/location-history-overview"
                ]
              }
            ]
          }
        ]
      },
      {
        "tab": "Internal API",
        "groups": [...]
      }
    ]
  }
}
```

### Group Types

1. **Static pages** - `"pages": ["path/to/page"]`
2. **OpenAPI auto-generated** - `"openapi": { "source": "...", "directory": "..." }`
3. **Mixed** - Both `"openapi"` and `"pages"` (overview + auto-generated)
4. **Nested groups** - `"pages": [{ "group": "...", "pages": [...] }]`

---

## Validation

### Validate Single Spec

```bash
mint openapi-check openapi/public/openapi-full.json
```

### Validate All Specs

```bash
for f in openapi/public/*.json; do
  echo "Checking $f..."
  mint openapi-check "$f"
done
```

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Invalid type | Non-standard types like `datetime` | Build script auto-fixes |
| Missing required | Empty required array | Build script removes |
| Invalid $ref | Reference to non-existent schema | Add schema or fix reference |
| Duplicate paths | Same path in multiple files | Remove duplicate |

---

## Local Development

### Start Dev Server

```bash
mint dev
# Server runs at http://localhost:3000
```

### Kill Dev Server

```bash
pkill -f "mint"
# or
lsof -ti:3000 | xargs kill -9
```

---

## Deployment

### Automatic Deployment

Push to `main` branch triggers automatic deployment via Mintlify GitHub app.

### Pre-deployment Checklist

- [ ] Build OpenAPI specs: `node scripts/build-openapi.js`
- [ ] Validate specs: `mint openapi-check openapi/public/openapi-full.json`
- [ ] Test locally: `mint dev`
- [ ] Check card links work (no 404s)
- [ ] Commit all changes (api-specs, openapi, docs.json)

---

## Troubleshooting

### JSON Parse Error

Laravel source files may have unescaped control characters. The build script handles this automatically.

### Missing Endpoints

1. Check file is in correct directory
2. Check file has `.json` extension
3. Check `paths` key exists and is not null
4. Run `node scripts/build-openapi.js`

### Card Links Return 404

1. Run `mint dev`
2. Navigate sidebar to find actual URL
3. Update href in MDX file
4. Common pattern: `/api-reference/{module}/{tag}/{endpoint-slug}`

### Schema Not Showing in Object Page

1. Check schema name matches exactly (case-sensitive)
2. Check schema exists in `openapi/public/openapi-full.json`
3. Check MDX frontmatter syntax:
   ```mdx
   openapi-schema: openapi/public/openapi-full.json SchemaName
   ```

### Sidebar Not Updating

1. Check `docs.json` syntax (valid JSON)
2. Restart `mint dev`
3. Clear browser cache

### Internal Pages Indexed by Search Engines

1. Add `noindex: true` to MDX frontmatter
2. Rebuild OpenAPI specs to add x-mint metadata
3. Use `--internal` flag with generate script

---

## File Naming Conventions

### Source Files

```
api-specs/public/[order]_[Module]/[order]_[Feature].json
api-specs/internal/[order]_[Module]/[order]_[Feature].json
```

Examples:
- `1_Task/1_Task.json`
- `1_Task/2_LocationHistory.json`
- `2_Routing/1_Vehicle.json`

### MDX Pages

```
api-reference/[module]/overview.mdx           # Main module overview
api-reference/[module]/[tag]-overview.mdx     # Sub-tag overview
api-reference/objects/[name]-object.mdx       # Schema documentation
```

Examples:
- `api-reference/task/overview.mdx`
- `api-reference/task/location-history-overview.mdx`
- `api-reference/objects/task-object.mdx`

---

## Quick Commands Reference

```bash
# Build
node scripts/build-openapi.js
node scripts/build-openapi.js public
node scripts/build-openapi.js internal

# Generate overview pages
node scripts/generate-tag-overviews.js --dry-run
node scripts/generate-tag-overviews.js --public
node scripts/generate-tag-overviews.js --internal
node scripts/generate-tag-overviews.js --tag "Workflow" --force

# Validate
mint openapi-check openapi/public/openapi-full.json

# Dev server
mint dev
pkill -f "mint"

# Search
grep -r "endpoint-name" api-specs/
grep -r "TagName" api-specs/base/tag-descriptions.yaml

# Count paths
cat openapi/public/openapi-full.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('paths',{})))"
```

---

*Last Updated: 2025-11-28*
