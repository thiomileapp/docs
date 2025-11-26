#!/usr/bin/env node
/**
 * MileApp OpenAPI Build Script
 *
 * Mimics Laravel ResourceController compilation logic.
 * Merges modular JSON files into single OpenAPI specs.
 *
 * Usage:
 *   node scripts/build-openapi.js           # Build both
 *   node scripts/build-openapi.js public    # Build public only
 *   node scripts/build-openapi.js internal  # Build internal only
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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

function buildPublic() {
  console.log('\n📦 Building PUBLIC API...');

  // Load base
  const initialPath = path.join(BASE_DIR, 'initial.yaml');
  let result = fs.existsSync(initialPath) ? loadYaml(initialPath) : {};

  // Ensure paths/definitions are objects (not null)
  result.paths = result.paths || {};
  result.definitions = result.definitions || {};

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
  console.log('\n🔒 Building INTERNAL API...');

  // Load base
  let basePath = path.join(BASE_DIR, 'initial_internal.yaml');
  if (!fs.existsSync(basePath)) {
    basePath = path.join(BASE_DIR, 'initial.yaml');
  }
  let result = fs.existsSync(basePath) ? loadYaml(basePath) : {};

  // Ensure paths/definitions are objects (not null)
  result.paths = result.paths || {};
  result.definitions = result.definitions || {};

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

function main() {
  console.log('='.repeat(50));
  console.log('MileApp OpenAPI Build');
  console.log('='.repeat(50));

  const target = process.argv[2] || 'all';

  if (target === 'all' || target === 'public') {
    const spec = buildPublic();
    saveJson(path.join(OUTPUT_DIR, 'openapi-public.json'), spec);
    console.log(`  Paths: ${Object.keys(spec.paths || {}).length}`);
  }

  if (target === 'all' || target === 'internal') {
    const spec = buildInternal();
    saveJson(path.join(OUTPUT_DIR, 'openapi-internal.json'), spec);
    console.log(`  Paths: ${Object.keys(spec.paths || {}).length}`);
  }

  console.log('\n✅ Build complete!');
}

main();
