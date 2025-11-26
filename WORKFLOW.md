# API Documentation Workflow

This document describes the modular API documentation workflow for MileApp Mintlify docs.

## Overview

The workflow mirrors Laravel's API documentation system:
- **Modular JSON files** for API endpoints (source of truth)
- **YAML files** for base specs and wording (Introduction, Rate Limits, etc.)
- **Build script** merges modules into single OpenAPI spec
- **Public/Internal separation** with override mechanism

## Folder Structure

```
mintlify-mileapp/
├── api-specs/
│   ├── base/
│   │   ├── initial.yaml           # Public API base (intro, rate limits, tags)
│   │   ├── initial_internal.yaml  # Internal API base
│   │   └── params.yaml            # Shared parameters (hubId, limit, page)
│   ├── public/
│   │   ├── 1_Task/
│   │   │   └── 1_Task.json        # Task endpoints
│   │   ├── 2_Routing/
│   │   │   └── 1_Vehicle.json
│   │   └── ...
│   ├── internal/
│   │   ├── 6_Billing/
│   │   │   └── 1_Billing.json     # Internal-only module
│   │   └── 1_Task/
│   │       └── 1_Task.json        # Override public Task
│   └── Models/
│       └── shared-models.json     # Shared schema definitions
├── scripts/
│   └── build-openapi.js           # Build script
├── openapi-public.json            # Generated (for public docs)
└── openapi-internal.json          # Generated (for internal docs)
```

## File Types

| Type | Location | Purpose |
|------|----------|---------|
| **YAML** | `api-specs/base/` | Wording pages (Introduction, Rate Limits, Data Formats) |
| **JSON** | `api-specs/public/` | Public API endpoints (source of truth) |
| **JSON** | `api-specs/internal/` | Internal-only OR override public endpoints |
| **JSON** | `api-specs/Models/` | Shared schema definitions |

## Build Commands

```bash
# Build both public and internal
node scripts/build-openapi.js

# Build public only
node scripts/build-openapi.js public

# Build internal only
node scripts/build-openapi.js internal
```

## Build Logic

### Public API Build
```
1. Load base/initial.yaml
2. Load base/params.yaml
3. Merge all public/**/*.json
4. Merge all Models/*.json
5. Output → openapi-public.json
```

### Internal API Build
```
1. Load base/initial_internal.yaml
2. Load base/params.yaml
3. Merge all internal/**/*.json (register submodules)
4. Merge public/**/*.json (SKIP if internal version exists)
5. Merge all Models/*.json
6. Output → openapi-internal.json
```

### Override Mechanism

Internal files take precedence over public files with the same submodule name:

| Scenario | Public Build | Internal Build |
|----------|--------------|----------------|
| `public/1_Task/1_Task.json` only | ✅ Included | ✅ Included |
| `internal/1_Task/1_Task.json` only | ❌ Not included | ✅ Included |
| Both exist | ✅ Public version | ✅ Internal version (public skipped) |
| `internal/6_Billing/1_Billing.json` | ❌ Not included | ✅ Included |

## Developer Workflow

### Adding a New Endpoint

1. **Identify the module** (Task, Routing, Flow, etc.)

2. **Edit the JSON file:**
   ```bash
   # Public endpoint
   vim api-specs/public/1_Task/1_Task.json

   # Internal-only endpoint
   vim api-specs/internal/6_Billing/1_Billing.json
   ```

3. **Add the path and operation:**
   ```json
   {
     "paths": {
       "/your-endpoint": {
         "get": {
           "summary": "Your endpoint",
           "tags": ["Task"],
           "parameters": [...],
           "responses": {...}
         }
       }
     }
   }
   ```

4. **Build:**
   ```bash
   node scripts/build-openapi.js
   ```

5. **Test locally:**
   ```bash
   mint dev
   ```

6. **Commit:**
   ```bash
   git add api-specs/ openapi-*.json
   git commit -m "feat(api): add your-endpoint"
   ```

### Modifying an Existing Endpoint

1. **Find the file:**
   ```bash
   grep -r "your-endpoint" api-specs/
   ```

2. **Edit the JSON file**

3. **Build and test:**
   ```bash
   node scripts/build-openapi.js
   mint dev
   ```

4. **Commit changes**

### Creating a New Module

1. **Create folder:**
   ```bash
   mkdir -p api-specs/public/7_NewModule
   ```

2. **Create JSON file:**
   ```bash
   cat > api-specs/public/7_NewModule/1_NewFeature.json << 'EOF'
   {
     "swagger": "2.0",
     "info": { "title": "New Feature" },
     "paths": {
       "/new-feature": {
         "get": {
           "summary": "Get new feature",
           "tags": ["New Module"],
           "responses": {
             "200": { "description": "Success" }
           }
         }
       }
     }
   }
   EOF
   ```

3. **Build and test**

### Moving Internal to Public

When an internal endpoint is ready for public release:

```bash
# Option 1: Move the file
mv api-specs/internal/1_Task/1_NewEndpoint.json api-specs/public/1_Task/

# Option 2: Delete internal override (if public base exists)
rm api-specs/internal/1_Task/1_Task.json

# Rebuild
node scripts/build-openapi.js
```

## Naming Conventions

### Folders
```
[order]_[ModuleName]/
```
- Order determines sidebar position
- Examples: `1_Task/`, `2_Routing/`, `6_Billing/`

### Files
```
[order]_[FeatureName].json
```
- Order determines position within module
- Examples: `1_Task.json`, `2_LocationHistory.json`

### Submodule Matching
Files are matched by submodule name (after the order prefix):
- `1_Task.json` → submodule: `Task.json`
- `2_LocationHistory.json` → submodule: `LocationHistory.json`

## Comparison with Laravel

| Aspect | Laravel | Mintlify |
|--------|---------|----------|
| Base specs | `initial.yaml`, `params.yaml` | Same |
| API endpoints | JSON files in `public/`, `internal/` | Same |
| Build | Runtime (PHP) | Build script (Node.js) |
| Output | JSON response | Static JSON files |
| Preview | Instant refresh | `mint dev` (~3 sec) |

## Troubleshooting

### JSON Parse Error
Laravel's JSON files may have unescaped newlines in strings. The build script handles this automatically.

### Missing Paths
Check that:
1. JSON file is in correct folder
2. File has `.json` extension
3. `paths` key exists and is not null
4. Run build script after changes

### Override Not Working
Ensure the submodule names match:
- `public/1_Task/1_Task.json` (submodule: `Task.json`)
- `internal/1_Task/1_Task.json` (submodule: `Task.json`) ✅ Match
- `internal/1_Task/Task.json` (submodule: `Task.json`) ✅ Match
- `internal/1_Task/2_Task.json` (submodule: `Task.json`) ✅ Match

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Build OpenAPI specs
  run: node scripts/build-openapi.js

- name: Deploy to Mintlify
  run: mintlify deploy
```
