const fs = require('fs');

const spec = JSON.parse(fs.readFileSync('scripts/vice_city_openapi.json', 'utf8'));

console.log('--- SECURITY SCHEMES ---');
console.log(JSON.stringify(spec.components?.securitySchemes, null, 2));
console.log('--- GLOBAL SECURITY ---');
console.log(JSON.stringify(spec.security, null, 2));

console.log('\n--- PATHS SUMMARY ---');
for (const [p, methods] of Object.entries(spec.paths)) {
  for (const [m, op] of Object.entries(methods)) {
    console.log(`${m.toUpperCase()} ${p} - ${op.summary || op.description}`);
    if (op.parameters) {
      console.log('   Params:', op.parameters.map(param => `${param.name} (${param.in}, req=${param.required})`).join(', '));
    }
  }
}

// Check documentation text for attribution, rate limits, etc.
const docsText = fs.readFileSync('scripts/vice_city_api_docs.txt', 'utf8');
const lines = docsText.split('\n').filter(l => l.trim().length > 0);

console.log('\n--- DOCS SECTIONS FOUND ---');
lines.forEach(line => {
  if (line.toLowerCase().includes('rate limit') || 
      line.toLowerCase().includes('attribution') || 
      line.toLowerCase().includes('authentication') ||
      line.toLowerCase().includes('bearer') ||
      line.toLowerCase().includes('terms') ||
      line.toLowerCase().includes('license') ||
      line.toLowerCase().includes('map') ||
      line.toLowerCase().includes('export')) {
    console.log('DOC LINE:', line.trim());
  }
});
