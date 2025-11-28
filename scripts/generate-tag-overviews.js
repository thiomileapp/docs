#!/usr/bin/env node
/**
 * Generate Tag Overview Pages from tag-descriptions.yaml
 *
 * This script reads tag descriptions from the YAML file and generates
 * MDX overview pages for each tag that needs one.
 *
 * Usage:
 *   node scripts/generate-tag-overviews.js              # Generate all (public + internal)
 *   node scripts/generate-tag-overviews.js --dry-run    # Preview without writing
 *   node scripts/generate-tag-overviews.js --public     # Generate public API only
 *   node scripts/generate-tag-overviews.js --internal   # Generate internal API only
 *   node scripts/generate-tag-overviews.js --force      # Overwrite existing files
 *   node scripts/generate-tag-overviews.js --tag "Workflow"  # Generate specific tag
 *
 * Internal API pages are generated with noindex: true in frontmatter.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration: Map tags to their output locations and OpenAPI files
const TAG_CONFIG = {
  // Task module
  'Task': {
    module: 'task',
    outputDir: 'api-reference/task',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/public/openapi-task.json',
    endpointPrefix: '/api-reference/task/task/',
    skip: true // Already exists as module overview
  },
  'Location History': {
    module: 'task',
    outputDir: 'api-reference/task',
    outputFile: 'location-history-overview.mdx',
    openapiFile: 'openapi/public/openapi-task.json',
    endpointPrefix: '/api-reference/task/location-history/',
    objectLink: '/api-reference/objects/location-history-object'
  },
  'Task Schedule': {
    module: 'task',
    outputDir: 'api-reference/task',
    outputFile: 'task-schedule-overview.mdx',
    openapiFile: 'openapi/public/openapi-task.json',
    endpointPrefix: '/api-reference/task/task-schedule/',
    objectLink: '/api-reference/objects/task-schedule-object'
  },

  // Routing module
  'Vehicle': {
    module: 'routing',
    outputDir: 'api-reference/routing',
    outputFile: 'vehicle-overview.mdx',
    openapiFile: 'openapi/public/openapi-routing.json',
    endpointPrefix: '/api-reference/routing/vehicle/',
    objectLink: '/api-reference/objects/vehicle-object'
  },
  'Routing': {
    module: 'routing',
    outputDir: 'api-reference/routing',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/public/openapi-routing.json',
    endpointPrefix: '/api-reference/routing/routing/',
    objectLink: '/api-reference/objects/routing-object',
    skip: true // Already exists as module overview
  },

  // Flow module
  'Flow': {
    module: 'flow',
    outputDir: 'api-reference/flow',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/public/openapi-flow.json',
    endpointPrefix: '/api-reference/flow/flow/',
    objectLink: '/api-reference/objects/flow-object',
    skip: true // Already exists as module overview
  },
  'Automation': {
    module: 'flow',
    outputDir: 'api-reference/flow',
    outputFile: 'automation-overview.mdx',
    openapiFile: 'openapi/public/openapi-flow.json',
    endpointPrefix: '/api-reference/flow/automation/',
    objectLink: '/api-reference/objects/automation-object'
  },

  // Data module
  'Data Source': {
    module: 'data',
    outputDir: 'api-reference/data',
    outputFile: 'data-source-overview.mdx',
    openapiFile: 'openapi/public/openapi-data.json',
    endpointPrefix: '/api-reference/data/data-source/',
    objectLink: '/api-reference/objects/data-source-object'
  },
  'Data Type': {
    module: 'data',
    outputDir: 'api-reference/data',
    outputFile: 'data-type-overview.mdx',
    openapiFile: 'openapi/public/openapi-data.json',
    endpointPrefix: '/api-reference/data/data-type/',
    objectLink: '/api-reference/objects/data-type-object'
  },

  // Setting module
  'User': {
    module: 'setting',
    outputDir: 'api-reference/setting',
    outputFile: 'user-overview.mdx',
    openapiFile: 'openapi/public/openapi-setting.json',
    endpointPrefix: '/api-reference/setting/user/',
    objectLink: '/api-reference/objects/user-object'
  },
  'Team': {
    module: 'setting',
    outputDir: 'api-reference/setting',
    outputFile: 'team-overview.mdx',
    openapiFile: 'openapi/public/openapi-setting.json',
    endpointPrefix: '/api-reference/setting/team/',
    objectLink: '/api-reference/objects/team-object'
  },
  'Role': {
    module: 'setting',
    outputDir: 'api-reference/setting',
    outputFile: 'role-overview.mdx',
    openapiFile: 'openapi/public/openapi-setting.json',
    endpointPrefix: '/api-reference/setting/role/',
    objectLink: '/api-reference/objects/role-object'
  },
  'Hub': {
    module: 'setting',
    outputDir: 'api-reference/setting',
    outputFile: 'hub-overview.mdx',
    openapiFile: 'openapi/public/openapi-setting.json',
    endpointPrefix: '/api-reference/setting/hub/',
    objectLink: '/api-reference/objects/hub-object'
  },
  'App Integration': {
    module: 'setting',
    outputDir: 'api-reference/setting',
    outputFile: 'app-integration-overview.mdx',
    openapiFile: 'openapi/public/openapi-setting.json',
    endpointPrefix: '/api-reference/setting/app-integration/'
  },
  'Plugin': {
    module: 'setting',
    outputDir: 'api-reference/setting',
    outputFile: 'plugin-overview.mdx',
    openapiFile: 'openapi/public/openapi-setting.json',
    endpointPrefix: '/api-reference/setting/plugin/',
    objectLink: '/api-reference/objects/plugin-object'
  },

  // Import/Export module
  'Data Import': {
    module: 'importexport',
    outputDir: 'api-reference/importexport',
    outputFile: 'data-import-overview.mdx',
    openapiFile: 'openapi/public/openapi-importexport.json',
    endpointPrefix: '/api-reference/importexport/data-import/'
  },
  'Export Task': {
    module: 'importexport',
    outputDir: 'api-reference/importexport',
    outputFile: 'export-task-overview.mdx',
    openapiFile: 'openapi/public/openapi-importexport.json',
    endpointPrefix: '/api-reference/importexport/export-task/'
  },
  'Export Config': {
    module: 'importexport',
    outputDir: 'api-reference/importexport',
    outputFile: 'export-config-overview.mdx',
    openapiFile: 'openapi/public/openapi-importexport.json',
    endpointPrefix: '/api-reference/importexport/export-config/',
    objectLink: '/api-reference/objects/export-config-object'
  },

  // File module
  'File': {
    module: 'file',
    outputDir: 'api-reference/file',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/public/openapi-file.json',
    endpointPrefix: '/api-reference/file/file/',
    skip: true // Already exists as module overview
  },

};

// Internal API configuration - uses same tag names but different output paths
// These are processed separately with noindex: true
const INTERNAL_TAG_CONFIG = {
  'Task': {
    module: 'task',
    outputDir: 'api-reference-internal/task',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/internal/openapi-task.json',
    endpointPrefix: '/api-reference-internal/task/task/',
    objectLink: '/api-reference-internal/objects/task-object',
    noindex: true
  },
  'Routing': {
    module: 'routing',
    outputDir: 'api-reference-internal/routing',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/internal/openapi-routing.json',
    endpointPrefix: '/api-reference-internal/routing/',
    objectLink: '/api-reference-internal/objects/vehicle-object',
    noindex: true
  },
  'Flow': {
    module: 'flow',
    outputDir: 'api-reference-internal/flow',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/internal/openapi-flow.json',
    endpointPrefix: '/api-reference-internal/flow/flow/',
    objectLink: '/api-reference-internal/objects/flow-object',
    noindex: true
  },
  'Data': {
    module: 'data',
    outputDir: 'api-reference-internal/data',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/internal/openapi-data.json',
    endpointPrefix: '/api-reference-internal/data/',
    noindex: true,
    descriptionKey: 'Data Source' // Use Data Source description
  },
  'Setting': {
    module: 'setting',
    outputDir: 'api-reference-internal/setting',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/internal/openapi-setting.json',
    endpointPrefix: '/api-reference-internal/setting/',
    noindex: true,
    descriptionKey: 'User' // Use User description as base
  },
  'File': {
    module: 'file',
    outputDir: 'api-reference-internal/file',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/internal/openapi-file.json',
    endpointPrefix: '/api-reference-internal/file/file/',
    noindex: true
  },
  'Workflow': {
    module: 'workflow',
    outputDir: 'api-reference-internal/workflow',
    outputFile: 'overview.mdx',
    openapiFile: 'openapi/internal/openapi-workflow.json',
    endpointPrefix: '/api-reference-internal/workflow/workflow/',
    objectLink: '/api-reference-internal/objects/workflow-object',
    noindex: true
  }
};

// Module display names
const MODULE_NAMES = {
  'task': 'Task',
  'routing': 'Routing',
  'flow': 'Flow',
  'data': 'Data',
  'setting': 'Setting',
  'importexport': 'Import/Export',
  'file': 'File'
};

function loadTagDescriptions(basePath) {
  const yamlPath = path.join(basePath, 'api-specs/base/tag-descriptions.yaml');
  const content = fs.readFileSync(yamlPath, 'utf8');
  return yaml.load(content);
}

function getEndpointsForTag(basePath, openapiFile, tagName) {
  const openapiPath = path.join(basePath, openapiFile);
  if (!fs.existsSync(openapiPath)) {
    console.warn(`  Warning: OpenAPI file not found: ${openapiFile}`);
    return [];
  }

  const openapi = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));
  const endpoints = [];

  for (const [pathKey, pathItem] of Object.entries(openapi.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        if (operation.tags && operation.tags.includes(tagName)) {
          endpoints.push({
            method: method.toUpperCase(),
            path: pathKey,
            summary: operation.summary || '',
            operationId: operation.operationId || ''
          });
        }
      }
    }
  }

  return endpoints;
}

function convertLinksToMintlify(description) {
  // Convert #tag/xxx_model links to /api-reference/objects/xxx-object
  let converted = description.replace(
    /\[([^\]]+)\]\(#tag\/(\w+)_model\)/g,
    (match, text, model) => {
      const objectName = model.replace(/_/g, '-');
      return `[${text}](/api-reference/objects/${objectName}-object)`;
    }
  );

  // Convert #tag/Xxx links to /api-reference/xxx/overview
  converted = converted.replace(
    /\[([^\]]+)\]\(#tag\/([^)]+)\)/g,
    (match, text, tag) => {
      const slug = tag.toLowerCase().replace(/\s+/g, '-');
      return `[${text}](/api-reference/${slug}/overview)`;
    }
  );

  // Convert /v1 links
  converted = converted.replace(
    /\[([^\]]+)\]\(\/v1\)/g,
    '[$1](https://apidoc.mile.app/v1)'
  );

  return converted;
}

function generateShortDescription(description) {
  // Extract first sentence or first 150 chars
  const firstParagraph = description.split('\n\n')[0];
  const firstSentence = firstParagraph.split(/[.!?]/)[0];
  let result = firstSentence;
  if (result.length > 100) {
    result = result.substring(0, 100) + '...';
  }
  // Escape single quotes for YAML frontmatter
  return result.replace(/'/g, "''");
}

function generateOverviewMDX(tagName, config, description, endpoints) {
  const shortDesc = generateShortDescription(description);
  const convertedDesc = convertLinksToMintlify(description);
  const moduleName = MODULE_NAMES[config.module] || config.module;

  // Generate cards for first 4 endpoints
  const cardEndpoints = endpoints.slice(0, 4);
  const cards = cardEndpoints.map(ep => {
    const icon = ep.method === 'GET' ? 'list' :
                 ep.method === 'POST' ? 'plus' :
                 ep.method === 'PUT' ? 'pen' :
                 ep.method === 'PATCH' ? 'pen' :
                 ep.method === 'DELETE' ? 'trash' : 'file';
    const slug = ep.operationId ?
      ep.operationId.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') :
      ep.path.split('/').pop();
    return `  <Card title="${ep.summary || ep.method + ' ' + ep.path}" icon="${icon}" href="${config.endpointPrefix}${slug}">
    ${ep.method} ${ep.path}
  </Card>`;
  }).join('\n');

  // Related resources
  let relatedResources = '';
  if (config.objectLink) {
    const objectName = tagName.toLowerCase().replace(/\s+/g, '-');
    relatedResources += `- [${tagName} Object](${config.objectLink}) - ${tagName} data structure\n`;
  }

  // Add noindex for internal API pages
  const noindexLine = config.noindex ? '\nnoindex: true' : '';

  const mdx = `---
title: '${tagName} Overview'
description: '${shortDesc}'${noindexLine}
---

## What is ${tagName}?

${convertedDesc}

${cardEndpoints.length > 0 ? `## Key Features

<CardGroup cols={2}>
${cards}
</CardGroup>
` : ''}
${relatedResources ? `## Related Resources

${relatedResources}` : ''}
`;

  return mdx;
}

function processConfig(configEntries, tagDescriptions, basePath, args, dryRun, specificTag, results) {
  for (const [tagName, config] of configEntries) {
    if (specificTag && tagName !== specificTag) continue;

    console.log(`Processing: ${tagName}${config.noindex ? ' (internal)' : ''}`);

    if (config.skip) {
      console.log(`  ⏭️  Skipped (module-level overview exists)`);
      results.skipped.push(tagName);
      continue;
    }

    // Use descriptionKey if specified, otherwise use tagName
    const descKey = config.descriptionKey || tagName;
    const description = tagDescriptions[descKey];
    if (!description) {
      console.log(`  ⚠️  No description in tag-descriptions.yaml for "${descKey}"`);
      results.errors.push({ tag: tagName, error: 'No description' });
      continue;
    }

    const outputPath = path.join(basePath, config.outputDir, config.outputFile);

    // Check if file already exists
    if (fs.existsSync(outputPath) && !args.includes('--force')) {
      console.log(`  ⏭️  File exists: ${config.outputFile}`);
      results.skipped.push(tagName);
      continue;
    }

    const endpoints = getEndpointsForTag(basePath, config.openapiFile, tagName);
    console.log(`  📄 Found ${endpoints.length} endpoints`);

    const mdx = generateOverviewMDX(tagName, config, description, endpoints);

    if (dryRun) {
      console.log(`  📝 Would write: ${outputPath}`);
      console.log(`  Preview (first 200 chars):`);
      console.log(`  ${mdx.substring(0, 200).replace(/\n/g, '\n  ')}...`);
    } else {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(outputPath, mdx);
      console.log(`  ✅ Generated: ${outputPath}`);
    }

    results.generated.push(tagName);
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const internalOnly = args.includes('--internal');
  const publicOnly = args.includes('--public');
  const specificTag = args.find(a => a.startsWith('--tag='))?.split('=')[1] ||
                      (args.indexOf('--tag') > -1 ? args[args.indexOf('--tag') + 1] : null);

  const basePath = path.resolve(__dirname, '..');
  const tagDescriptions = loadTagDescriptions(basePath);

  console.log('=== Tag Overview Page Generator ===\n');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'WRITE'}`);
  console.log(`Target: ${internalOnly ? 'INTERNAL ONLY' : publicOnly ? 'PUBLIC ONLY' : 'ALL'}`);
  if (specificTag) console.log(`Specific tag: ${specificTag}`);
  console.log('');

  const results = { generated: [], skipped: [], errors: [] };

  // Process public API config
  if (!internalOnly) {
    console.log('--- PUBLIC API ---\n');
    processConfig(Object.entries(TAG_CONFIG), tagDescriptions, basePath, args, dryRun, specificTag, results);
  }

  // Process internal API config
  if (!publicOnly) {
    console.log('\n--- INTERNAL API ---\n');
    processConfig(Object.entries(INTERNAL_TAG_CONFIG), tagDescriptions, basePath, args, dryRun, specificTag, results);
  }

  console.log('\n=== Summary ===');
  console.log(`Generated: ${results.generated.length}`);
  console.log(`Skipped: ${results.skipped.length}`);
  console.log(`Errors: ${results.errors.length}`);

  if (results.generated.length > 0) {
    console.log('\n📌 Don\'t forget to update docs.json to include new overview pages!');
  }
}

main();
