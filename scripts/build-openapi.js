#!/usr/bin/env node
/**
 * MileApp OpenAPI Build Script
 *
 * Mimics Laravel ResourceController compilation logic.
 * Merges modular JSON files into single OpenAPI 3.0 specs.
 *
 * Usage:
 *   node scripts/build-openapi.js           # Build both
 *   node scripts/build-openapi.js public    # Build public only
 *   node scripts/build-openapi.js internal  # Build internal only
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const converter = require('swagger2openapi');

// Paths
const PROJECT_ROOT = path.dirname(__dirname);
const API_SPECS = path.join(PROJECT_ROOT, 'api-specs');
const BASE_DIR = path.join(API_SPECS, 'base');
const PUBLIC_DIR = path.join(API_SPECS, 'public');
const INTERNAL_DIR = path.join(API_SPECS, 'internal');
const MODELS_DIR = path.join(API_SPECS, 'Models');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'openapi');
const OUTPUT_PUBLIC = path.join(OUTPUT_DIR, 'public');
const OUTPUT_INTERNAL = path.join(OUTPUT_DIR, 'internal');

// Helper functions
function loadYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content) || {};
  } catch (e) {
    return {};
  }
}

function loadJson(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    // Fix unescaped control characters inside JSON string values
    // Laravel's JSON files have literal newlines in description strings
    content = content.replace(/"([^"\\]|\\.)*"/g, (match) => {
      return match
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
    });
    return JSON.parse(content);
  } catch (e) {
    console.error(`  ⚠ Error loading ${filePath}: ${e.message}`);
    return {};
  }
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ Generated: ${filePath}`);
}

function getSubmoduleName(fileName) {
  // Extract submodule: '1_Task.json' -> 'Task.json'
  const parts = fileName.split('_');
  if (parts.length > 1 && /^\d+$/.test(parts[0])) {
    return parts.slice(1).join('_');
  }
  return fileName;
}

function getSortedDirs(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter(f => fs.statSync(path.join(dirPath, f)).isDirectory())
    .sort();
}

function getJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.json'))
    .sort();
}

function mergeSpec(base, module) {
  // Fix misplaced security in responses BEFORE merging
  if (module.paths) {
    for (const pathKey of Object.keys(module.paths)) {
      const pathItem = module.paths[pathKey];
      for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']) {
        if (pathItem[method] && pathItem[method].responses) {
          // Remove 'security' as a response code key
          if (pathItem[method].responses.security) {
            delete pathItem[method].responses.security;
          }
        }
      }
    }
  }

  // Merge paths
  if (module.paths && Object.keys(module.paths).length > 0) {
    base.paths = base.paths || {};
    Object.assign(base.paths, module.paths);
  }
  // Merge definitions (Swagger 2.0)
  if (module.definitions && Object.keys(module.definitions).length > 0) {
    base.definitions = base.definitions || {};
    Object.assign(base.definitions, module.definitions);
  }
  // Merge components.schemas (OpenAPI 3.0)
  if (module.components?.schemas && Object.keys(module.components.schemas).length > 0) {
    base.components = base.components || {};
    base.components.schemas = base.components.schemas || {};
    Object.assign(base.components.schemas, module.components.schemas);
  }
  // Merge x-webhooks
  if (module['x-webhooks'] && Object.keys(module['x-webhooks']).length > 0) {
    base['x-webhooks'] = base['x-webhooks'] || {};
    Object.assign(base['x-webhooks'], module['x-webhooks']);
  }
  // Merge x-components.schemas into definitions (non-standard extension used by some files)
  // Also fix $ref paths from #/x-components/schemas/ to #/definitions/
  if (module['x-components']?.schemas && Object.keys(module['x-components'].schemas).length > 0) {
    base.definitions = base.definitions || {};
    Object.assign(base.definitions, module['x-components'].schemas);
    // Fix $ref paths in the module's paths to point to definitions instead of x-components
    const fixXComponentRefs = (obj) => {
      if (typeof obj !== 'object' || obj === null) return;
      if (Array.isArray(obj)) {
        obj.forEach(fixXComponentRefs);
        return;
      }
      for (const [key, value] of Object.entries(obj)) {
        if (key === '$ref' && typeof value === 'string' && value.startsWith('#/x-components/schemas/')) {
          obj[key] = value.replace('#/x-components/schemas/', '#/definitions/');
        } else if (typeof value === 'object') {
          fixXComponentRefs(value);
        }
      }
    };
    fixXComponentRefs(module.paths);
  }
}

// Valid OpenAPI 3.0 types
const VALID_TYPES = new Set(['string', 'number', 'integer', 'boolean', 'array', 'object']);

// Type mappings for invalid types
const TYPE_MAP = {
  'String': 'string',
  'text': 'string',
  'url': 'string',
  'URL': 'string',
  'primaryKey': 'string',
  'dropdown': 'string',
  'datasource': 'string',
  'Address': 'string',
  'PhoneNumber': 'string',
  'phoneNumber': 'string',
  'file': 'string',
  'WEB': 'string',
  'http': 'string',
  'task': 'string',
  'checkbox': 'string',
  'option': 'string',
  'geolocation': 'string',
  'Geolocation': 'string',
  'numeric': 'number',
  'Numeric': 'number',
  'float': 'number',
  'discount': 'number',
  'cost': 'number',
  'quantity': 'number',
  'time': 'string',
  'Time': 'string',
  'date': 'string',
  'Date': 'string',
  'datetime': 'string',
  'dateTime': 'string',
  'Datetime': 'string',
  'bolean': 'boolean',
  'Object': 'object',
  'array of string': 'array',
  'array of object': 'array',
  'array of objects': 'array',
};

// Laravel-style reference definitions (from params.yaml)
const LARAVEL_REFS = {
  // Descriptions
  '#/parameters/descriptions/hubId': "Fundamental entity within an organization, serving as the central point for managing various operational components. Use **GET /hubs** endpoint to get the list of Hub IDs. **Example:** `634e98498ce07d29474a7e29`",
  '#/parameters/descriptions/limit': "Specifies the maximum number of items to retrieve in a single request. **Example:** `10`",
  '#/parameters/descriptions/page': "The page number of results to retrieve. **Example:** `2`",
  '#/parameters/descriptions/statusResponse': "Shows if the request was successful.",
  '#/parameters/descriptions/messageResponse': "A short message explaining what went wrong.",

  // Response schemas
  '#/parameters/responses/badRequest/schema': {
    type: 'object',
    properties: {
      status: { type: 'boolean', description: 'Shows if the request was successful.' },
      message: { type: 'string', description: 'A short message explaining what went wrong.' }
    },
    example: {
      status: false,
      message: 'Bad request - invalid parameters provided.'
    }
  },
  '#/parameters/responses/notFound/schema': {
    type: 'object',
    properties: {
      status: { type: 'boolean', description: 'Shows if the request was successful.' },
      message: { type: 'string', description: 'A short message explaining what went wrong.' }
    },
    example: {
      status: false,
      message: 'Data not found'
    }
  },
  '#/parameters/responses/serverError/schema': {
    type: 'object',
    properties: {
      status: { type: 'boolean', description: 'Shows if the request was successful.' },
      message: { type: 'string', description: 'A short message explaining what went wrong.' }
    },
    example: {
      status: false,
      message: 'Internal server error, please contact support@mile.app.'
    }
  },

  // Component refs that might appear after conversion
  '#/components/parameters/responses/badRequest/schema': {
    type: 'object',
    properties: {
      status: { type: 'boolean', description: 'Shows if the request was successful.' },
      message: { type: 'string', description: 'A short message explaining what went wrong.' }
    },
    example: {
      status: false,
      message: 'Bad request - invalid parameters provided.'
    }
  },
  '#/components/parameters/responses/notFound/schema': {
    type: 'object',
    properties: {
      status: { type: 'boolean', description: 'Shows if the request was successful.' },
      message: { type: 'string', description: 'A short message explaining what went wrong.' }
    },
    example: {
      status: false,
      message: 'Data not found'
    }
  },
  '#/components/parameters/responses/serverError/schema': {
    type: 'object',
    properties: {
      status: { type: 'boolean', description: 'Shows if the request was successful.' },
      message: { type: 'string', description: 'A short message explaining what went wrong.' }
    },
    example: {
      status: false,
      message: 'Internal server error, please contact support@mile.app.'
    }
  },
  '#/components/parameters/descriptions/hubId': "Fundamental entity within an organization, serving as the central point for managing various operational components. Use **GET /hubs** endpoint to get the list of Hub IDs. **Example:** `634e98498ce07d29474a7e29`",
  '#/components/parameters/descriptions/limit': "Specifies the maximum number of items to retrieve in a single request. **Example:** `10`",
  '#/components/parameters/descriptions/page': "The page number of results to retrieve. **Example:** `2`",
  '#/components/parameters/descriptions/statusResponse': "Shows if the request was successful.",
  '#/components/parameters/descriptions/messageResponse': "A short message explaining what went wrong.",
};

// Resolve Laravel-style $ref to actual value
function resolveLaravelRef(ref) {
  // Direct match
  if (LARAVEL_REFS[ref]) {
    return LARAVEL_REFS[ref];
  }

  // Try to match partial patterns
  if (ref.includes('/responses/badRequest')) {
    return LARAVEL_REFS['#/parameters/responses/badRequest/schema'];
  }
  if (ref.includes('/responses/notFound')) {
    return LARAVEL_REFS['#/parameters/responses/notFound/schema'];
  }
  if (ref.includes('/responses/serverError')) {
    return LARAVEL_REFS['#/parameters/responses/serverError/schema'];
  }
  if (ref.includes('/descriptions/hubId')) {
    return LARAVEL_REFS['#/parameters/descriptions/hubId'];
  }
  if (ref.includes('/descriptions/limit')) {
    return LARAVEL_REFS['#/parameters/descriptions/limit'];
  }
  if (ref.includes('/descriptions/page')) {
    return LARAVEL_REFS['#/parameters/descriptions/page'];
  }
  if (ref.includes('/descriptions/statusResponse')) {
    return LARAVEL_REFS['#/parameters/descriptions/statusResponse'];
  }
  if (ref.includes('/descriptions/messageResponse')) {
    return LARAVEL_REFS['#/parameters/descriptions/messageResponse'];
  }

  return null;
}

// Fix broken $ref links by resolving Laravel references
function fixBrokenRefs(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const result = fixBrokenRefs(obj[i]);
      if (result !== obj[i]) obj[i] = result;
    }
    return obj;
  }

  // Check if this is a Laravel-style $ref that needs resolution
  if (obj['$ref']) {
    const ref = obj['$ref'];
    const resolved = resolveLaravelRef(ref);
    if (resolved) {
      // Return the resolved value (could be string or object)
      return typeof resolved === 'string' ? resolved : { ...resolved };
    }
  }

  // Fix description that's an object with $ref (should be string)
  if (obj.description && typeof obj.description === 'object') {
    if (obj.description['$ref']) {
      const resolved = resolveLaravelRef(obj.description['$ref']);
      obj.description = resolved || 'See documentation for details.';
    } else {
      obj.description = String(obj.description);
    }
  }

  // Recurse into dict values
  for (const key of Object.keys(obj)) {
    const result = fixBrokenRefs(obj[key]);
    if (result !== obj[key]) obj[key] = result;
  }

  return obj;
}

// Fix invalid OpenAPI types recursively
function fixInvalidTypes(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(fixInvalidTypes);
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'type' && typeof value === 'string') {
      // Fix invalid types using TYPE_MAP
      if (TYPE_MAP[value]) {
        result.type = TYPE_MAP[value];
        // Add format for datetime types
        if (value === 'datetime' || value === 'dateTime' || value === 'Datetime') {
          result.format = 'date-time';
        }
      } else if (!VALID_TYPES.has(value)) {
        // Default unknown types to string
        result.type = 'string';
      } else {
        result[key] = value;
      }
    } else if (key === 'type' && typeof value === 'object') {
      // Type is incorrectly an object, convert to object type
      result.type = 'object';
    } else {
      result[key] = fixInvalidTypes(value);
    }
  }

  // Fix empty items in arrays
  if (result.type === 'array' && result.items) {
    if (typeof result.items === 'object' && Object.keys(result.items).length === 0) {
      result.items = { type: 'object' };
    }
  }

  // Fix headers arrays to objects
  if (result.headers && Array.isArray(result.headers)) {
    result.headers = {};
  }

  // Fix properties arrays to objects
  if (result.properties && Array.isArray(result.properties)) {
    result.properties = {};
  }

  return result;
}

// Remove invalid keys from components.parameters
function fixParameters(parameters) {
  if (typeof parameters !== 'object' || parameters === null) return parameters;

  // These keys are not valid OpenAPI parameter definitions
  const invalidKeys = ['string', 'integer', 'responses', 'descriptions'];
  for (const key of invalidKeys) {
    if (parameters[key]) {
      delete parameters[key];
    }
  }

  return parameters;
}

// Fix security schemes to use proper OpenAPI 3.0 format
function fixSecuritySchemes(spec) {
  if (!spec.components) spec.components = {};

  // Replace with proper bearer auth
  spec.components.securitySchemes = {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Use a valid Bearer token to authenticate.'
    }
  };

  // Update global security
  spec.security = [{ bearerAuth: [] }];

  // Fix endpoint-level security references (AccessToken -> bearerAuth)
  if (spec.paths) {
    for (const pathKey of Object.keys(spec.paths)) {
      const pathItem = spec.paths[pathKey];
      for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']) {
        if (pathItem[method] && pathItem[method].security) {
          // Replace any AccessToken reference with bearerAuth
          pathItem[method].security = pathItem[method].security.map(secObj => {
            if (secObj.AccessToken !== undefined) {
              return { bearerAuth: [] };
            }
            return secObj;
          });
        }
      }
    }
  }

  return spec;
}

// Convert HTML in descriptions to Markdown (Mintlify uses Markdown, not HTML)
function htmlToMarkdown(text) {
  if (typeof text !== 'string') return text;

  let result = text;

  // Convert <a href='url'>text</a> to [text](url)
  result = result.replace(/<a\s+href=['"]([^'"]+)['"]\s*(?:target=['"][^'"]*['"])?\s*>([^<]+)<\/a>/gi, '[$2]($1)');

  // Convert <br> and <br/> to newline
  result = result.replace(/<br\s*\/?>/gi, '\n');

  // Convert <code>text</code> to `text`
  result = result.replace(/<code>([^<]+)<\/code>/gi, '`$1`');

  // Convert <strong>text</strong> or <b>text</b> to **text**
  result = result.replace(/<(?:strong|b)>([^<]+)<\/(?:strong|b)>/gi, '**$1**');

  // Convert <em>text</em> or <i>text</i> to *text*
  result = result.replace(/<(?:em|i)>([^<]+)<\/(?:em|i)>/gi, '*$1*');

  // Remove any remaining HTML tags
  result = result.replace(/<[^>]+>/g, '');

  return result;
}

// Recursively convert HTML to Markdown in all description fields
function convertDescriptionsToMarkdown(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(convertDescriptionsToMarkdown);
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'description' && typeof value === 'string') {
      result[key] = htmlToMarkdown(value);
    } else {
      result[key] = convertDescriptionsToMarkdown(value);
    }
  }
  return result;
}

// Add missing schemas that might be referenced but not defined
function addMissingSchemas(spec) {
  if (!spec.components) spec.components = {};
  if (!spec.components.schemas) spec.components.schemas = {};

  // Add ErrorResponse if not exists
  if (!spec.components.schemas.ErrorResponse) {
    spec.components.schemas.ErrorResponse = {
      type: 'object',
      properties: {
        status: {
          type: 'boolean',
          description: 'Shows if the request was successful.',
          example: false
        },
        message: {
          type: 'string',
          description: 'A short message explaining what went wrong.',
          example: 'An error occurred while processing your request.'
        }
      }
    };
  }

  return spec;
}

// Remove misplaced security keys from responses
function fixMisplacedSecurity(spec) {
  if (!spec.paths) return spec;

  for (const pathKey of Object.keys(spec.paths)) {
    const pathItem = spec.paths[pathKey];
    for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']) {
      if (pathItem[method]) {
        const operation = pathItem[method];
        // Remove security from responses object (it's not valid there)
        if (operation.responses) {
          // Remove 'security' as a response code key (it should be at operation level)
          if (operation.responses.security) {
            delete operation.responses.security;
          }
          // Also check inside each response
          for (const code of Object.keys(operation.responses)) {
            if (operation.responses[code] && typeof operation.responses[code] === 'object' && operation.responses[code].security) {
              delete operation.responses[code].security;
            }
          }
        }
      }
    }
  }
  return spec;
}

// Remove 'examples' from inside schema objects (OpenAPI 3.0: examples should be at media type level, not schema level)
function fixExamplesInSchemas(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(fixExamplesInSchemas);
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove 'examples' key from schema objects (detected by presence of type/properties)
    if (key === 'examples' && (obj.type || obj.properties || obj.$ref)) {
      // Skip this key - it's misplaced inside schema
      continue;
    }
    result[key] = fixExamplesInSchemas(value);
  }
  return result;
}

// Fix path parameter typos like {param) to {param} and trim whitespace
// Also merges HTTP methods when duplicate paths occur after normalization
function fixPathTypos(spec) {
  if (!spec.paths) return spec;

  const fixedPaths = {};
  for (const pathKey of Object.keys(spec.paths)) {
    // Fix typos: replace ) with } in path parameters, and trim whitespace
    let fixedKey = pathKey.replace(/\{([^}]+)\)/g, '{$1}').trim();

    // If the normalized path already exists, merge HTTP methods instead of overwriting
    if (fixedPaths[fixedKey]) {
      console.log(`    ⚠️  Merging duplicate path after normalization: ${pathKey} -> ${fixedKey}`);
      const existingPathItem = fixedPaths[fixedKey];
      const newPathItem = spec.paths[pathKey];

      // Merge HTTP methods from both path items
      for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'parameters']) {
        if (newPathItem[method] && !existingPathItem[method]) {
          existingPathItem[method] = newPathItem[method];
        }
      }
    } else {
      fixedPaths[fixedKey] = spec.paths[pathKey];
    }
  }
  spec.paths = fixedPaths;
  return spec;
}

// Fix invalid parameter properties
function fixInvalidParameters(spec) {
  if (!spec.paths) return spec;

  // Valid OpenAPI 3.0 parameter properties
  const validParamProps = new Set([
    'name', 'in', 'description', 'required', 'deprecated', 'allowEmptyValue',
    'style', 'explode', 'allowReserved', 'schema', 'example', 'examples',
    'content', '$ref'
  ]);

  function fixParam(param) {
    if (!param || typeof param !== 'object') return param;
    if (param['$ref']) return param; // Don't modify $ref params

    const fixed = {};
    for (const [key, value] of Object.entries(param)) {
      if (validParamProps.has(key)) {
        fixed[key] = value;
      } else if (key === 'min' || key === 'max' || key === 'minimum' || key === 'maximum') {
        // Move min/max to schema
        fixed.schema = fixed.schema || { type: 'integer' };
        if (key === 'min' || key === 'minimum') {
          fixed.schema.minimum = value;
        } else {
          fixed.schema.maximum = value;
        }
      }
      // Skip other invalid properties
    }
    return fixed;
  }

  for (const pathKey of Object.keys(spec.paths)) {
    const pathItem = spec.paths[pathKey];
    for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']) {
      if (pathItem[method] && pathItem[method].parameters) {
        pathItem[method].parameters = pathItem[method].parameters.map(fixParam);
      }
    }
    // Also fix path-level parameters
    if (pathItem.parameters) {
      pathItem.parameters = pathItem.parameters.map(fixParam);
    }
  }
  return spec;
}

// Fix broken $ref links that reference non-existent schemas
function fixBrokenSchemaRefs(spec) {
  const schemas = spec.components?.schemas || {};

  function fixRef(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
      return obj.map(fixRef);
    }

    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string' && value.startsWith('#/components/schemas/')) {
        const schemaName = value.replace('#/components/schemas/', '');
        if (!schemas[schemaName]) {
          // Replace broken ref with generic object schema
          return { type: 'object', description: `See ${schemaName} schema` };
        }
      }
      result[key] = fixRef(value);
    }
    return result;
  }

  // Fix refs in paths
  if (spec.paths) {
    spec.paths = fixRef(spec.paths);
  }
  // Fix refs in schemas themselves
  if (spec.components?.schemas) {
    spec.components.schemas = fixRef(spec.components.schemas);
  }
  return spec;
}

// Fix response objects that are missing schema but have examples
function fixResponseSchemas(spec) {
  if (!spec.paths) return spec;

  for (const pathKey of Object.keys(spec.paths)) {
    const pathItem = spec.paths[pathKey];
    for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']) {
      if (pathItem[method] && pathItem[method].responses) {
        const responses = pathItem[method].responses;
        for (const code of Object.keys(responses)) {
          const response = responses[code];
          if (response && response.content) {
            for (const mediaType of Object.keys(response.content)) {
              const content = response.content[mediaType];
              // If content has examples but no schema, add a generic schema
              if (content && content.examples && !content.schema) {
                content.schema = { type: 'object' };
              }
            }
          }
          // Fix headers that have $ref (should be object, not $ref)
          if (response && response.headers && response.headers['$ref']) {
            delete response.headers;
          }
        }
      }
    }
  }
  return spec;
}

// Fix properties that have string values instead of schema objects
// This happens when source JSON has `"type": "object"` at the wrong level (as a property)
function fixMalformedProperties(obj, parentKey = '') {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => fixMalformedProperties(item, parentKey));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // If we're inside a "properties" object
    if (parentKey === 'properties' && typeof value === 'string') {
      // This is a malformed property - it should be an object but is a string
      // Convert to proper schema based on the string value
      const typeValue = value.toLowerCase();
      if (typeValue === 'object' || typeValue === 'string' || typeValue === 'array' ||
          typeValue === 'number' || typeValue === 'integer' || typeValue === 'boolean') {
        result[key] = { type: typeValue };
      } else {
        // Default to string type
        result[key] = { type: 'string' };
      }
    } else {
      result[key] = fixMalformedProperties(value, key);
    }
  }
  return result;
}

// Fix schemas that are just example data (missing type property)
function fixExampleSchemas(spec) {
  if (spec.components?.schemas) {
    for (const [schemaName, schema] of Object.entries(spec.components.schemas)) {
      // If schema doesn't have a type and doesn't have $ref, it might be example data
      if (typeof schema === 'object' && schema !== null && !schema.type && !schema.$ref && !schema.allOf && !schema.oneOf && !schema.anyOf) {
        // Check if it looks like example data (has data/status/message properties directly as values)
        const keys = Object.keys(schema);
        const looksLikeExample = keys.some(k => {
          const v = schema[k];
          // If properties have direct values (arrays, strings, booleans) instead of schema definitions
          return Array.isArray(v) || typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number' ||
                 (typeof v === 'object' && v !== null && !v.type && !v.$ref && !v.properties);
        });

        if (looksLikeExample) {
          // Convert this to a proper schema with the data as example
          spec.components.schemas[schemaName] = {
            type: 'object',
            example: schema
          };
        }
      }
    }
  }
  return spec;
}

// Fix schema objects with empty required arrays and other invalid schema issues
function fixSchemaIssues(spec) {
  // Track if we're inside a 'properties' object to detect property name collision with 'required' keyword
  function fixSchema(schema, parentKey = null) {
    if (typeof schema !== 'object' || schema === null) return schema;

    if (Array.isArray(schema)) {
      return schema.map(item => fixSchema(item, parentKey));
    }

    const result = {};
    for (const [key, value] of Object.entries(schema)) {
      // Remove empty required arrays (they cause validation errors)
      if (key === 'required' && Array.isArray(value) && value.length === 0) {
        continue; // Skip this property
      }

      // Fix collision: property named 'required' inside 'properties' conflicts with OpenAPI 'required' keyword
      // If 'required' is an object with 'type' key (it's a property definition), rename to 'isRequired'
      if (key === 'required' && typeof value === 'object' && value !== null && !Array.isArray(value) && value.type) {
        console.log(`    ⚠️  Renaming property 'required' to 'isRequired' (keyword collision fix)`);
        result['isRequired'] = fixSchema(value, key);
        continue;
      }

      // Fix collision: property named 'type' inside 'properties' conflicts with OpenAPI 'type' keyword
      // If 'type' is an object with its own 'type' key (it's a nested property schema), rename to 'inputType'
      // This happens in Flow components where 'type' describes the input type (string, number, etc.)
      // ONLY rename when parentKey is 'properties' - this ensures we're in a property definition context
      if (key === 'type' && parentKey === 'properties' && typeof value === 'object' && value !== null && !Array.isArray(value) && value.type) {
        console.log(`    ⚠️  Renaming property 'type' to 'inputType' (keyword collision fix)`);
        // Create a proper schema for inputType - it describes input types like 'string', 'number', 'date', etc.
        const inputTypeSchema = {
          type: 'string',
          description: value.description || 'The input type of the component (e.g., string, number, date, etc.)'
        };
        result['inputType'] = inputTypeSchema;
        continue;
      }

      // Also fix 'required' in example data where it's used as a property name with boolean value
      // This happens when parentKey is 'example' and 'required' is used with a boolean value
      if (key === 'required' && typeof value === 'boolean' && (parentKey === 'example' || parentKey === 'items' || parentKey === 'components')) {
        result['isRequired'] = value;
        continue;
      }

      // Also fix 'type' in example data when it's inside a component object (has 'component' key)
      // This prevents confusion between OpenAPI 'type' keyword and component input type data
      if (key === 'type' && typeof value === 'string' && schema.component) {
        result['inputType'] = value;
        continue;
      }


      // Fix nullable that's not boolean
      if (key === 'nullable' && typeof value !== 'boolean') {
        result[key] = value === 'true' || value === true;
        continue;
      }
      // Fix format values that aren't standard
      if (key === 'format' && typeof value === 'string') {
        const validFormats = ['int32', 'int64', 'float', 'double', 'byte', 'binary', 'date', 'date-time', 'password', 'email', 'uuid', 'uri', 'hostname', 'ipv4', 'ipv6'];
        if (!validFormats.includes(value)) {
          continue; // Remove invalid format
        }
      }
      result[key] = fixSchema(value, key);
    }

    // Fix misplaced properties: if this is an object schema (has type: object and properties),
    // move any sibling property definitions that look like schema properties into properties
    // This fixes issues where 'enabled' is a sibling to 'properties' instead of inside it
    if (result.type === 'object' && result.properties) {
      const validSchemaKeys = ['type', 'properties', 'required', 'additionalProperties', 'description',
        'title', 'example', 'examples', 'allOf', 'anyOf', 'oneOf', '$ref', 'items', 'enum',
        'format', 'nullable', 'readOnly', 'writeOnly', 'deprecated', 'xml', 'externalDocs',
        'discriminator', 'default', 'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum',
        'minLength', 'maxLength', 'pattern', 'minItems', 'maxItems', 'uniqueItems', 'minProperties',
        'maxProperties', 'not', 'if', 'then', 'else', 'const', 'contentMediaType', 'contentEncoding'];

      for (const [key, val] of Object.entries(result)) {
        // If this key is not a valid OpenAPI schema keyword and looks like a property definition
        if (!validSchemaKeys.includes(key) && typeof val === 'object' && val !== null && !Array.isArray(val) && val.type) {
          console.log(`    ⚠️  Moving misplaced property '${key}' into 'properties' (was a sibling)`);
          result.properties[key] = val;
          delete result[key];
        }
      }
    }

    // Fix bare "type: object" schemas that have no properties/additionalProperties
    // Mintlify requires object schemas to have properties, additionalProperties, or be a $ref
    if (result.type === 'object' && !result.properties && !result.additionalProperties && !result.$ref && !result.allOf && !result.oneOf && !result.anyOf) {
      result.additionalProperties = true;
    }

    return result;
  }

  // Fix top-level schemas that have example/title but no type (Mintlify requires type or $ref)
  function fixTopLevelSchema(schema, schemaName) {
    if (typeof schema !== 'object' || schema === null) return schema;

    // If schema has example or title but no type and no $ref, add type: object
    if ((schema.example || schema.title) && !schema.type && !schema.$ref && !schema.allOf && !schema.oneOf && !schema.anyOf) {
      console.log(`    ⚠️  Adding missing 'type: object' to schema: ${schemaName}`);
      schema.type = 'object';
    }

    // Fix schemas that have 'required' array but no 'properties'
    // This is invalid because 'required' should list property names that must be present
    // but without 'properties', there's nothing to require
    if (schema.required && Array.isArray(schema.required) && schema.required.length > 0 && !schema.properties && !schema.allOf && !schema.oneOf && !schema.anyOf && !schema.$ref) {
      console.log(`    ⚠️  Removing 'required' from schema without 'properties': ${schemaName}`);
      delete schema.required;
    }

    return schema;
  }

  // Fix schemas in components
  if (spec.components?.schemas) {
    for (const schemaName of Object.keys(spec.components.schemas)) {
      // First fix top-level schema (add missing type if needed)
      spec.components.schemas[schemaName] = fixTopLevelSchema(spec.components.schemas[schemaName], schemaName);
      // Then apply nested schema fixes
      spec.components.schemas[schemaName] = fixSchema(spec.components.schemas[schemaName]);
    }
  }

  // Fix inline schemas in paths
  if (spec.paths) {
    spec.paths = fixSchema(spec.paths);
  }

  return spec;
}

// Main function to apply all Mintlify compatibility fixes
function applyMintlifyFixes(spec) {
  console.log('  🔧 Applying Mintlify compatibility fixes...');

  // Fix broken $ref links first (Laravel-style refs)
  fixBrokenRefs(spec);

  // Fix x-components refs -> components (non-standard extension)
  const fixXComponentRefs = (obj) => {
    if (typeof obj !== 'object' || obj === null) return;
    if (Array.isArray(obj)) {
      obj.forEach(fixXComponentRefs);
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$ref' && typeof value === 'string' && value.includes('/x-components/')) {
        obj[key] = value.replace('/x-components/', '/components/');
      } else if (typeof value === 'object') {
        fixXComponentRefs(value);
      }
    }
  };
  fixXComponentRefs(spec);

  // Fix misplaced security in responses
  spec = fixMisplacedSecurity(spec);

  // Fix path parameter typos like {param) -> {param} and trim whitespace
  spec = fixPathTypos(spec);

  // Fix invalid parameter properties (min, max, etc.)
  spec = fixInvalidParameters(spec);

  // Fix all types recursively
  spec = fixInvalidTypes(spec);

  // Fix invalid parameter keys in components
  if (spec.components && spec.components.parameters) {
    spec.components.parameters = fixParameters(spec.components.parameters);
  }

  // Fix security schemes
  spec = fixSecuritySchemes(spec);

  // Add missing schemas
  spec = addMissingSchemas(spec);

  // Fix broken schema $ref links (non-existent schema references)
  spec = fixBrokenSchemaRefs(spec);

  // Fix response objects missing schema but having examples, and fix invalid headers
  spec = fixResponseSchemas(spec);

  // Remove misplaced examples from inside schema objects
  spec = fixExamplesInSchemas(spec);

  // Fix malformed properties that have string values instead of schema objects
  spec = fixMalformedProperties(spec);

  // Fix schemas that are just example data (missing type property)
  spec = fixExampleSchemas(spec);

  // Fix schema issues (empty required arrays, invalid formats, etc.)
  spec = fixSchemaIssues(spec);

  // Remove invalid schemas that have header-like properties but no proper schema structure
  // These are malformed schemas that look like response header definitions
  if (spec.components && spec.components.schemas) {
    const invalidSchemas = [];
    for (const [name, schema] of Object.entries(spec.components.schemas)) {
      // Check if schema has no 'type' and no '$ref' and all properties start with 'X-'
      // This indicates a malformed response header definition
      if (schema && typeof schema === 'object' && !schema.type && !schema.$ref && !schema.allOf && !schema.oneOf && !schema.anyOf) {
        const keys = Object.keys(schema);
        const hasOnlyHeaderLikeKeys = keys.length > 0 && keys.every(k => k.startsWith('X-') || k.startsWith('x-'));
        if (hasOnlyHeaderLikeKeys) {
          invalidSchemas.push(name);
        }
      }
    }
    for (const name of invalidSchemas) {
      console.log(`    ⚠️  Removing invalid header-like schema: ${name}`);
      delete spec.components.schemas[name];
    }
  }

  // Convert HTML to Markdown in all descriptions
  spec = convertDescriptionsToMarkdown(spec);

  // Ensure info.description is a simple string
  if (spec.info && spec.info.description) {
    if (typeof spec.info.description !== 'string') {
      spec.info.description = String(spec.info.description);
    }
    // Remove HTML/complex content that might cause issues
    if (spec.info.description.length > 500) {
      spec.info.description = 'MileApp Public API Documentation';
    }
  }

  return spec;
}

// Convert Swagger 2.0 to OpenAPI 3.0
async function convertToOpenAPI3(swagger2Spec) {
  // Add required swagger 2.0 fields if missing
  if (!swagger2Spec.swagger) {
    swagger2Spec.swagger = '2.0';
  }
  if (!swagger2Spec.info) {
    swagger2Spec.info = { title: 'MileApp API', version: '3.0.0' };
  }
  if (!swagger2Spec.host) {
    swagger2Spec.host = 'apiweb.mile.app';
  }
  if (!swagger2Spec.basePath) {
    swagger2Spec.basePath = '/api/v3';
  }

  const options = {
    patch: true,
    warnOnly: true,
  };

  try {
    const result = await converter.convertObj(swagger2Spec, options);
    // Apply all Mintlify compatibility fixes
    const fixed = applyMintlifyFixes(result.openapi);
    return fixed;
  } catch (e) {
    console.error(`  ⚠ Conversion error: ${e.message}`);
    throw e;
  }
}

function buildPublic() {
  console.log('\n📦 Building PUBLIC API (Swagger 2.0)...');

  // Start with Swagger 2.0 base for merging module files
  let result = {
    swagger: '2.0',
    info: {
      title: 'MileApp API Documentation',
      version: '3.0.0',
      description: 'MileApp API Documentation - RESTful API for field operations management.'
    },
    host: 'apiweb.mile.app',
    basePath: '/api/v3',
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      AccessToken: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    },
    tags: [
      { name: 'Task', description: 'Task management endpoints' },
      { name: 'Bulk Operations', description: 'Bulk task operations' }
    ],
    paths: {},
    definitions: {}
  };

  // Load params
  const paramsPath = path.join(BASE_DIR, 'params.yaml');
  if (fs.existsSync(paramsPath)) {
    result.parameters = loadYaml(paramsPath);
  }

  // Merge public modules
  for (const moduleDir of getSortedDirs(PUBLIC_DIR)) {
    const modulePath = path.join(PUBLIC_DIR, moduleDir);
    for (const jsonFile of getJsonFiles(modulePath)) {
      const filePath = path.join(modulePath, jsonFile);
      const module = loadJson(filePath);
      mergeSpec(result, module);
      console.log(`  + ${moduleDir}/${jsonFile}`);
    }
  }

  // Merge Models
  for (const jsonFile of getJsonFiles(MODELS_DIR)) {
    const filePath = path.join(MODELS_DIR, jsonFile);
    const module = loadJson(filePath);
    mergeSpec(result, module);
    console.log(`  + Models/${jsonFile}`);
  }

  return result;
}

function buildInternal() {
  console.log('\n🔒 Building INTERNAL API (Swagger 2.0)...');

  // Start with Swagger 2.0 base
  let result = {
    swagger: '2.0',
    info: {
      title: 'MileApp Internal API Documentation',
      version: '3.0.0',
      description: 'MileApp Internal API Documentation'
    },
    host: 'apiweb.mile.app',
    basePath: '/api/v3',
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      AccessToken: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    },
    paths: {},
    definitions: {}
  };

  // Load params
  const paramsPath = path.join(BASE_DIR, 'params.yaml');
  if (fs.existsSync(paramsPath)) {
    result.parameters = loadYaml(paramsPath);
  }

  // Track registered submodules (internal takes precedence)
  const registered = {};

  // 1. Process INTERNAL first
  for (const moduleDir of getSortedDirs(INTERNAL_DIR)) {
    registered[moduleDir] = registered[moduleDir] || {};
    const modulePath = path.join(INTERNAL_DIR, moduleDir);

    for (const jsonFile of getJsonFiles(modulePath)) {
      const submodule = getSubmoduleName(jsonFile);
      const filePath = path.join(modulePath, jsonFile);
      const module = loadJson(filePath);
      mergeSpec(result, module);
      registered[moduleDir][submodule] = true;
      console.log(`  + (internal) ${moduleDir}/${jsonFile}`);
    }
  }

  // 2. Process PUBLIC (skip if internal exists)
  for (const moduleDir of getSortedDirs(PUBLIC_DIR)) {
    const modulePath = path.join(PUBLIC_DIR, moduleDir);

    for (const jsonFile of getJsonFiles(modulePath)) {
      const submodule = getSubmoduleName(jsonFile);

      // Skip if internal version exists
      if (registered[moduleDir]?.[submodule]) {
        console.log(`  - (skip) ${moduleDir}/${jsonFile}`);
        continue;
      }

      const filePath = path.join(modulePath, jsonFile);
      const module = loadJson(filePath);
      mergeSpec(result, module);
      console.log(`  + (public) ${moduleDir}/${jsonFile}`);
    }
  }

  // Merge Models
  for (const jsonFile of getJsonFiles(MODELS_DIR)) {
    const filePath = path.join(MODELS_DIR, jsonFile);
    const module = loadJson(filePath);
    mergeSpec(result, module);
    console.log(`  + Models/${jsonFile}`);
  }

  return result;
}

// Split OpenAPI spec by tag groups (for separate navigation sections in Mintlify)
function splitByTagGroups(spec, tagGroups) {
  const results = {};

  for (const [groupName, tags] of Object.entries(tagGroups)) {
    const tagSet = new Set(tags);

    // Create a new spec for this group
    const groupSpec = {
      openapi: spec.openapi,
      info: {
        ...spec.info,
        title: `MileApp API - ${groupName}`
      },
      servers: spec.servers,
      security: spec.security,
      components: JSON.parse(JSON.stringify(spec.components || {})),
      paths: {}
    };

    // Filter paths by tags
    for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
      const filteredPath = {};
      let hasMethod = false;

      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method)) {
          const opTags = operation.tags || [];
          if (opTags.some(t => tagSet.has(t))) {
            filteredPath[method] = operation;
            hasMethod = true;
          }
        } else {
          filteredPath[method] = operation;
        }
      }

      if (hasMethod) {
        groupSpec.paths[pathKey] = filteredPath;
      }
    }

    // Filter tags array
    if (spec.tags) {
      groupSpec.tags = spec.tags.filter(t => tagSet.has(t.name));
    }

    results[groupName] = groupSpec;
  }

  return results;
}

async function main() {
  console.log('='.repeat(50));
  console.log('MileApp OpenAPI Build');
  console.log('='.repeat(50));

  const target = process.argv[2] || 'all';

  // Define tag groups to match Laravel menu structure
  const tagGroups = {
    'Task': ['Task', 'Location History', 'Task Schedule'],
    'Routing': ['Vehicle', 'Routing'],
    'Flow': ['Flow', 'Automation'],
    'Data': ['Data Source', 'Data Type'],
    'Setting': ['User', 'Role', 'App Integration', 'Hub', 'Team', 'Plugin'],
    'ImportExport': ['Data Import', 'Export Task', 'Export Config'],
    'File': ['File']
    // Note: Activity is internal-only (not in public Laravel API docs)
  };

  // Ensure output directories exist
  if (!fs.existsSync(OUTPUT_PUBLIC)) {
    fs.mkdirSync(OUTPUT_PUBLIC, { recursive: true });
  }
  if (!fs.existsSync(OUTPUT_INTERNAL)) {
    fs.mkdirSync(OUTPUT_INTERNAL, { recursive: true });
  }

  if (target === 'all' || target === 'public') {
    const swagger2Spec = buildPublic();
    console.log(`  Paths (Swagger 2.0): ${Object.keys(swagger2Spec.paths || {}).length}`);

    console.log('\n🔄 Converting to OpenAPI 3.0...');
    const openapi3Spec = await convertToOpenAPI3(swagger2Spec);

    // Save full spec to openapi/public/
    saveJson(path.join(OUTPUT_PUBLIC, 'openapi-full.json'), openapi3Spec);
    console.log(`  Paths (OpenAPI 3.0): ${Object.keys(openapi3Spec.paths || {}).length}`);

    // Split by tag groups for Mintlify navigation
    console.log('\n📂 Splitting by tag groups...');
    const splitSpecs = splitByTagGroups(openapi3Spec, tagGroups);
    for (const [groupName, groupSpec] of Object.entries(splitSpecs)) {
      const fileName = `openapi-${groupName.toLowerCase()}.json`;
      saveJson(path.join(OUTPUT_PUBLIC, fileName), groupSpec);
      console.log(`  ${groupName}: ${Object.keys(groupSpec.paths || {}).length} paths`);
    }
  }

  if (target === 'all' || target === 'internal') {
    const swagger2Spec = buildInternal();
    console.log(`  Paths (Swagger 2.0): ${Object.keys(swagger2Spec.paths || {}).length}`);

    console.log('\n🔄 Converting to OpenAPI 3.0...');
    const openapi3Spec = await convertToOpenAPI3(swagger2Spec);
    saveJson(path.join(OUTPUT_INTERNAL, 'openapi-full.json'), openapi3Spec);
    console.log(`  Paths (OpenAPI 3.0): ${Object.keys(openapi3Spec.paths || {}).length}`);
  }

  console.log('\n✅ Build complete!');
}

main().catch(e => {
  console.error('Build failed:', e);
  process.exit(1);
});
