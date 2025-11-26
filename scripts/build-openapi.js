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
const OUTPUT_DIR = PROJECT_ROOT;

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

// Main function to apply all Mintlify compatibility fixes
function applyMintlifyFixes(spec) {
  console.log('  🔧 Applying Mintlify compatibility fixes...');

  // Fix broken $ref links first
  fixBrokenRefs(spec);

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

async function main() {
  console.log('='.repeat(50));
  console.log('MileApp OpenAPI Build');
  console.log('='.repeat(50));

  const target = process.argv[2] || 'all';

  if (target === 'all' || target === 'public') {
    const swagger2Spec = buildPublic();
    console.log(`  Paths (Swagger 2.0): ${Object.keys(swagger2Spec.paths || {}).length}`);

    console.log('\n🔄 Converting to OpenAPI 3.0...');
    const openapi3Spec = await convertToOpenAPI3(swagger2Spec);
    saveJson(path.join(OUTPUT_DIR, 'openapi-public.json'), openapi3Spec);
    console.log(`  Paths (OpenAPI 3.0): ${Object.keys(openapi3Spec.paths || {}).length}`);
  }

  if (target === 'all' || target === 'internal') {
    const swagger2Spec = buildInternal();
    console.log(`  Paths (Swagger 2.0): ${Object.keys(swagger2Spec.paths || {}).length}`);

    console.log('\n🔄 Converting to OpenAPI 3.0...');
    const openapi3Spec = await convertToOpenAPI3(swagger2Spec);
    saveJson(path.join(OUTPUT_DIR, 'openapi-internal.json'), openapi3Spec);
    console.log(`  Paths (OpenAPI 3.0): ${Object.keys(openapi3Spec.paths || {}).length}`);
  }

  console.log('\n✅ Build complete!');
}

main().catch(e => {
  console.error('Build failed:', e);
  process.exit(1);
});
