# MileApp API Documentation Development Workflow

This document describes how to develop and update the MileApp Mintlify API documentation.

## Quick Reference

```bash
# Build OpenAPI specs from source files
node scripts/build-openapi.js

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
│   │   └── params.yaml           # Shared parameters
│   ├── public/                   # Public API endpoints
│   │   ├── 1_Task/
│   │   ├── 2_Routing/
│   │   ├── 3_Flow/
│   │   ├── 4_Data/
│   │   ├── 5_Setting/
│   │   └── 6_ImportExport/
│   ├── internal/                 # Internal-only endpoints
│   │   └── 7_Activity/
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
│       └── openapi-full.json     # Complete internal API
├── api-reference/                # MDX documentation pages
│   ├── introduction.mdx
│   ├── task/
│   │   └── overview.mdx
│   ├── objects/                  # Schema documentation
│   │   ├── task-object.mdx
│   │   └── ...
│   └── ...
├── scripts/
│   └── build-openapi.js          # Build script
└── docs.json                     # Navigation config
```

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
# Build OpenAPI specs
node scripts/build-openapi.js

# Validate the spec
mint openapi-check openapi/public/openapi-full.json

# Test locally
mint dev
```

**Step 4: Commit changes**

```bash
git add api-specs/ openapi/
git commit -m "feat(api): add GET /your-new-endpoint"
```

---

### 2. Modifying an Existing Endpoint

**Step 1: Find the endpoint**

```bash
# Search in api-specs
grep -r "your-endpoint" api-specs/

# Or search in generated specs
grep "your-endpoint" openapi/public/openapi-full.json
```

**Step 2: Edit, build, and test**

```bash
vim api-specs/public/1_Task/1_Task.json
node scripts/build-openapi.js
mint dev
```

---

### 3. Adding a New Schema/Model

**Step 1: Add to Models directory**

Create or edit `api-specs/Models/YourModel.json`:

```json
{
  "components": {
    "schemas": {
      "YourModel": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier"
          },
          "name": {
            "type": "string",
            "description": "Model name"
          }
        }
      }
    }
  }
}
```

**Step 2: Build to include in OpenAPI spec**

```bash
node scripts/build-openapi.js
```

**Step 3: Create Object page (optional)**

Create `api-reference/objects/your-model-object.mdx`:

```mdx
---
title: "YourModel object"
openapi-schema: openapi/public/openapi-full.json YourModel
---
```

**Step 4: Add to navigation**

Edit `docs.json` and add to Objects group:

```json
{
  "group": "Objects",
  "pages": [
    "api-reference/objects/task-object",
    "api-reference/objects/your-model-object"
  ]
}
```

---

### 4. Adding Internal-Only Endpoints

Internal endpoints are not visible in the public API documentation.

**Step 1: Create in internal directory**

```bash
mkdir -p api-specs/internal/7_Activity
vim api-specs/internal/7_Activity/1_Activity.json
```

**Step 2: Build internal spec**

```bash
node scripts/build-openapi.js internal
```

**Step 3: Configure in docs.json (if needed)**

Internal API pages go under "Internal API" tab with `"hidden": true`.

---

### 5. Creating Overview/Guide Pages

**Step 1: Create MDX file**

```bash
vim api-reference/task/overview.mdx
```

**Step 2: Write content**

```mdx
---
title: "Task API Overview"
---

## Introduction

The Task API allows you to manage tasks...

## Common Use Cases

1. Creating tasks
2. Assigning tasks
3. Tracking task status
```

**Step 3: Add to navigation**

Edit `docs.json`:

```json
{
  "group": "Task",
  "openapi": { "source": "openapi/public/openapi-task.json", "directory": "api-reference/task" },
  "pages": ["api-reference/task/overview"]
}
```

---

## Build Script Details

### Commands

```bash
# Build all (public + internal)
node scripts/build-openapi.js

# Build public only
node scripts/build-openapi.js public

# Build internal only
node scripts/build-openapi.js internal
```

### What the Build Script Does

1. **Loads base YAML** (`initial.yaml`, `params.yaml`)
2. **Merges module JSON files** from `public/` and `internal/`
3. **Merges Models** from `Models/` directory
4. **Converts Swagger 2.0 to OpenAPI 3.0**
5. **Applies Mintlify compatibility fixes**:
   - Fix invalid types (e.g., `datetime` → `string` with `format: date-time`)
   - Fix `type`/`required` keyword collisions
   - Convert HTML descriptions to Markdown
   - Fix security scheme references
   - Remove invalid schema properties
6. **Splits into module-specific files** for navigation
7. **Outputs to `openapi/public/` and `openapi/internal/`**

### Override Mechanism

Internal files override public files with the same submodule name:

| Scenario | Public API | Internal API |
|----------|------------|--------------|
| Only `public/1_Task/1_Task.json` | Included | Included |
| Only `internal/1_Task/1_Task.json` | Not included | Included |
| Both exist | Public version | Internal version |

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

### Test Specific Pages

```bash
# Test API reference pages
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api-reference/introduction
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api-reference/task/get-tasks
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api-reference/objects/task-object
```

### Kill Dev Server

```bash
pkill -f "mint"
# or
lsof -ti:3000 | xargs kill -9
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
            "pages": ["api-reference/task/overview"]
          },
          {
            "group": "Objects",
            "pages": ["api-reference/objects/task-object", "..."]
          }
        ]
      }
    ]
  }
}
```

### Group Types

1. **Static pages** - `"pages": ["path/to/page"]`
2. **OpenAPI auto-generated** - `"openapi": { "source": "...", "directory": "..." }`
3. **Mixed** - Both `"openapi"` and `"pages"` (overview + auto-generated)

---

## Deployment

### Automatic Deployment

Push to `main` branch triggers automatic deployment via Mintlify GitHub app.

### Manual Deployment

```bash
mintlify deploy
```

### Pre-deployment Checklist

- [ ] Build OpenAPI specs: `node scripts/build-openapi.js`
- [ ] Validate specs: `mint openapi-check openapi/public/openapi-full.json`
- [ ] Test locally: `mint dev`
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

---

## File Naming Conventions

### Source Files

```
api-specs/public/[order]_[Module]/[order]_[Feature].json
```

Examples:
- `1_Task/1_Task.json`
- `1_Task/2_LocationHistory.json`
- `2_Routing/1_Vehicle.json`

### MDX Pages

```
api-reference/[module]/[page-name].mdx
```

Examples:
- `api-reference/task/overview.mdx`
- `api-reference/objects/task-object.mdx`

---

## Quick Commands Reference

```bash
# Build
node scripts/build-openapi.js

# Validate
mint openapi-check openapi/public/openapi-full.json

# Dev server
mint dev

# Kill dev server
pkill -f "mint"

# Search endpoints
grep -r "endpoint-name" api-specs/

# Check schema exists
cat openapi/public/openapi-full.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('SchemaName' in d.get('components',{}).get('schemas',{}))"

# Count paths
cat openapi/public/openapi-full.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('paths',{})))"
```

---

*Last Updated: 2025-11-26*
