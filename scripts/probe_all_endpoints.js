async function probeEndpoints() {
  const headers = { 'x-api-key': 'vc_demo' };
  const endpoints = [
    '/locations',
    '/businesses',
    '/characters',
    '/manufacturers',
    '/vehicles',
    '/weapons',
    '/activities',
    '/radio-stations',
    '/trailers',
    '/editions',
    '/events',
    '/search?q=vice',
    '/changes?since=2026-01-01',
    '/export/vehicles',
    '/export/locations',
    '/map/landmarks',
    '/map/districts'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`https://vice-city.app/api/v1${ep}`, { headers });
      console.log(`${ep.padEnd(30)} -> Status: ${res.status}`);
      if (res.status === 200) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('json')) {
          const data = await res.json();
          const count = Array.isArray(data.data) ? data.data.length : (data.count || (data.features ? data.features.length : 'obj'));
          console.log(`   Count/Preview: ${count}`);
        } else {
          const text = await res.text();
          console.log(`   Text bytes: ${text.length}`);
        }
      } else {
        const err = await res.text();
        console.log(`   Detail: ${err.slice(0, 120)}`);
      }
    } catch (e) {
      console.log(`${ep.padEnd(30)} -> Error: ${e.message}`);
    }
  }
}

probeEndpoints().catch(console.error);
