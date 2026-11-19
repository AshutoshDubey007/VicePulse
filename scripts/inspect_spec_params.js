const fs = require('fs');
const spec = JSON.parse(fs.readFileSync('scripts/vice_city_openapi.json', 'utf8'));

console.log('Collection path details:');
console.log(JSON.stringify(spec.paths['/{collection}'], null, 2));

console.log('\nEntity path details:');
console.log(JSON.stringify(spec.paths['/{collection}/{slug}'], null, 2));

console.log('\nMap path details:');
console.log(JSON.stringify(spec.paths['/map/{layer}'], null, 2));
