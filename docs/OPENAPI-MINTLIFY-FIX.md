# Fixing OpenAPI Spec for Mintlify Compatibility

This document describes the issues encountered when integrating a modular OpenAPI spec with Mintlify and how to resolve them.

## Problem

When using `openapi` property at tab level in `docs.json`, Mintlify reported:
```
erro Openapi file openapi-mileapp.json defined in tab in your docs.json does not exist
```

Even though the file existed, the real issue was **invalid OpenAPI 3.0 schema**.

## Root Causes

### 1. Invalid Data Types

Mintlify strictly validates OpenAPI 3.0 specs. Invalid types like `datetime` or `quantity` are not recognized.

**Invalid:**
```json
{
  "type": "datetime"
}
```

**Valid:**
```json
{
  "type": "string",
  "format": "date-time"
}
```

### 2. Invalid Security Scheme

Security schemes must use proper OpenAPI 3.0 format.

**Invalid:**
```json
{
  "AccessToken": {
    "type": "string",
    "name": "Authorization",
    "in": "header"
  }
}
```

**Valid:**
```json
{
  "bearerAuth": {
    "type": "http",
    "scheme": "bearer",
    "bearerFormat": "JWT",
    "description": "Use a valid Bearer token to authenticate."
  }
}
```

### 3. Broken `$ref` Links

References to non-existent paths cause validation failures.

**Broken patterns found:**
- `#/components/parameters/responses/badRequest/schema`
- `#/components/parameters/descriptions/hubId`

These custom reference paths don't exist in OpenAPI 3.0 standard structure.

### 4. Invalid Parameter Keys

Custom keys in `components.parameters` that aren't valid parameter definitions:
- `string`
- `integer`
- `responses`
- `descriptions`

### 5. Description as Object

Descriptions must be strings, not objects with `$ref`.

**Invalid:**
```json
{
  "description": {
    "$ref": "#/components/parameters/descriptions/hubId"
  }
}
```

**Valid:**
```json
{
  "description": "Hub ID description here"
}
```

## Solution

### Step 1: Validate OpenAPI Spec

Use Mintlify's built-in validator:
```bash
mint openapi-check openapi-mileapp.json
```

### Step 2: Fix Invalid Types

Create a mapping for invalid types:
```python
TYPE_MAP = {
    'datetime': 'string',      # Add format: date-time
    'dateTime': 'string',
    'quantity': 'number',
    'numeric': 'number',
    'float': 'number',
    'text': 'string',
    'url': 'string',
    'primaryKey': 'string',
}
```

### Step 3: Fix Security Schemes

Replace with proper OpenAPI 3.0 bearer auth:
```python
d['components']['securitySchemes'] = {
    "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Use a valid Bearer token to authenticate."
    }
}
d['security'] = [{"bearerAuth": []}]
```

### Step 4: Remove Invalid Parameter Keys

```python
invalid_keys = ['string', 'integer', 'responses', 'descriptions']
for key in invalid_keys:
    if key in d['components']['parameters']:
        del d['components']['parameters'][key]
```

### Step 5: Fix Broken References

Replace broken `$ref` with inline schemas:
```python
def fix_refs(obj):
    if isinstance(obj, dict):
        if '$ref' in obj:
            ref = obj['$ref']
            if '/parameters/responses/' in ref or '/parameters/descriptions/' in ref:
                return {
                    "type": "object",
                    "properties": {
                        "status": {"type": "boolean"},
                        "message": {"type": "string"}
                    }
                }
        if 'description' in obj and isinstance(obj['description'], dict):
            obj['description'] = "See documentation"
        for key, val in obj.items():
            result = fix_refs(val)
            if result:
                obj[key] = result
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            result = fix_refs(item)
            if result:
                obj[i] = result
```

## Build Script Integration

All fixes are now integrated directly into the Node.js build script:

```bash
# Build and fix in one command
node scripts/build-openapi.js public

# Validate the result
mint openapi-check openapi-public.json
```

The `scripts/build-openapi.js` includes `applyMintlifyFixes()` which handles:
- Type fixes (datetime → string with format, quantity → number, etc.)
- Security scheme fixes (proper bearer auth format)
- Broken $ref replacements (inline schemas)
- Invalid parameter key removal
- Description object-to-string conversion

## Validation Checklist

Before deploying, ensure:

- [ ] `mint openapi-check openapi-public.json` returns `success`
- [ ] All `type` values are valid: `string`, `number`, `integer`, `boolean`, `array`, `object`
- [ ] Security schemes use `type: http` with `scheme: bearer` or `type: apiKey`
- [ ] No broken `$ref` links
- [ ] No custom keys in `components.parameters`
- [ ] All `description` fields are strings
- [ ] `servers` block is present

## Files Modified

| File | Purpose |
|------|---------|
| `scripts/build-openapi.js` | Builds OpenAPI spec from modular JSON with all fixes integrated |
| `openapi-public.json` | Final validated output |
| `docs.json` | Tab-level openapi config (references `openapi-public.json`) |

## References

- [Mintlify Troubleshooting](https://www.mintlify.com/docs/api-playground/troubleshooting)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Swagger Editor Validator](https://editor.swagger.io)
