const spec = require('../openapi/public/openapi-flow.json');
const schema = spec.components.schemas.postRequestFlow;

// Check for patterns that might cause the error
function findProblems(obj, path = '') {
  if (!obj || typeof obj !== 'object') return;

  // Check for type alongside $ref
  if (obj.type && obj['$ref']) {
    console.log('PROBLEM: type + $ref at', path);
  }

  // Check for additionalProperties=true without type:object
  if (obj.additionalProperties === true && obj.type !== 'object' && !obj['$ref']) {
    console.log('POTENTIAL ISSUE: additionalProperties without type:object at', path);
  }

  // Check for objects that have 'type' as a property key where the value is also an object with 'type'
  if (obj.type && typeof obj.type === 'object' && obj.type.type) {
    console.log('NESTED TYPE ISSUE at', path, ':', JSON.stringify(obj.type));
  }

  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'object' && val !== null) {
      findProblems(val, path + '.' + key);
    }
  }
}

findProblems(schema, 'postRequestFlow');
console.log('\nDone checking.');
