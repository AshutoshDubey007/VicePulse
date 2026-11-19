const http = require('http');

function probe(query) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ error: e.message, body });
        }
      });
    });
  });
}

async function run() {
  console.log('--- Probing: "easter egg" ---');
  const r1 = await probe('easter egg');
  console.log('Intent:', r1.intent);
  console.log('Discoveries returned:', r1.results?.discoveries?.length);
  if (r1.results?.discoveries?.length > 0) {
    console.log('Categories:', [...new Set(r1.results.discoveries.map((d) => d.category))]);
    console.log('Titles:', r1.results.discoveries.map((d) => d.title).slice(0, 3));
  }
  console.log('Vehicles returned:', r1.results?.vehicles?.length);
  console.log('News returned:', r1.results?.news?.length);

  console.log('\n--- Probing: "rare vehicles" ---');
  const r2 = await probe('rare vehicles');
  console.log('Intent:', r2.intent);
  console.log('Discoveries returned:', r2.results?.discoveries?.length);
  console.log('Vehicles returned:', r2.results?.vehicles?.length);

  console.log('\n--- Probing: "nonexistent query xyz987" ---');
  const r3 = await probe('nonexistent query xyz987');
  console.log('Fallback:', r3.fallback);
}

run();
