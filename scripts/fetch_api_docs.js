const fs = require('fs');

async function main() {
  console.log('Fetching https://vice-city.app/openapi.json ...');
  const res = await fetch('https://vice-city.app/openapi.json');
  console.log('Status:', res.status, res.headers.get('content-type'));
  const spec = await res.json();

  fs.writeFileSync('scripts/vice_city_openapi.json', JSON.stringify(spec, null, 2), 'utf8');
  console.log('Saved OpenAPI spec. Title:', spec.info?.title, 'Version:', spec.info?.version);
  console.log('Servers:', spec.servers);
  console.log('Paths:', Object.keys(spec.paths || {}));
  console.log('Components schemas:', Object.keys(spec.components?.schemas || {}));
}

main().catch(console.error);
