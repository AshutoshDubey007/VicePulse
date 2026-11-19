const http = require('http');
const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    const req = mod.get(
      url,
      {
        headers: { 'User-Agent': 'VicePulse-Map-Verification/1.0' },
        timeout: 8000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            contentType: res.headers['content-type'],
            contentLength: res.headers['content-length'],
            body,
          })
        );
      }
    );
    req.on('error', (err) => resolve({ status: 'ERR', message: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'TIMEOUT' });
    });
  });
}

async function runMapTests() {
  console.log('================================================================');
  console.log('VICEPULSE MAP EXPLORER & TILE PROVIDER VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      console.log(`[PASS] ${name} ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${details}`);
    }
  }

  // 1. Check Map Route
  const mapPage = await checkUrl('http://127.0.0.1:3000/map');
  assert(mapPage.status === 200, 'Map Explorer Page (/map) accessible', `-> HTTP ${mapPage.status}`);
  assert(mapPage.body.includes('INITIALIZING MAPLIBRE GL') || mapPage.body.includes('MapContainer'), 'MapLibre GL Container initialized on page');

  // 2. Check Discoveries API
  const discRes = await checkUrl('http://127.0.0.1:3000/api/discoveries');
  assert(discRes.status === 200, 'Discoveries API (/api/discoveries) -> HTTP 200');
  let data;
  try {
    data = JSON.parse(discRes.body);
    const discoveries = data.items || data.data || [];
    assert(Array.isArray(discoveries) && discoveries.length > 0, `Discoveries loaded from DB (${discoveries.length} records, total: ${data.total})`);
    data.discoveries = discoveries;
  } catch (e) {
    assert(false, 'Parse discoveries JSON', e.message);
  }

  // 3. Coordinate validation on all loaded discoveries
  if (data && data.discoveries) {
    let validCoords = 0;
    let missingCoords = 0;
    data.discoveries.forEach((d) => {
      if (
        d.coordinates &&
        typeof d.coordinates.lat === 'number' &&
        typeof d.coordinates.lng === 'number' &&
        !isNaN(d.coordinates.lat) &&
        !isNaN(d.coordinates.lng) &&
        ((d.coordinates.lat !== 0 && d.coordinates.lng !== 0) || d.coordinates.inGameGrid === 'LOCATION_PENDING')
      ) {
        validCoords++;
      } else {
        missingCoords++;
      }
    });
    assert(validCoords > 0, `All active discoveries have valid numeric coordinates (${validCoords} valid)`);
    assert(missingCoords === 0, `Zero discoveries with corrupt or missing coordinates (${missingCoords} invalid)`);
  }

  // 4. Test Primary Tile Provider: Esri World Dark Gray Base (No Labels, Zero Watermark)
  console.log('\n--- Testing Esri Dark Gray Base Tile Provider (Zero Watermark) ---');
  // Coordinates for South Florida / Leonida at zoom 10
  const darkTile = await checkUrl('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/10/447/283');
  assert(
    darkTile.status === 200,
    'Esri Dark Gray Base tile streams successfully (No API key, Zero Watermark)',
    `-> HTTP ${darkTile.status}`
  );
  assert(
    darkTile.contentType && darkTile.contentType.includes('image'),
    'Esri Dark Gray Base tile returns valid image data'
  );

  // 5. Test Secondary Tile Provider: Esri World Imagery (Satellite)
  console.log('\n--- Testing Esri Satellite Orthophoto Tile Provider ---');
  const esriTile = await checkUrl(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/443/284'
  );
  assert(
    esriTile.status === 200,
    'Esri Satellite tile streams successfully',
    `-> HTTP ${esriTile.status}`
  );
  assert(
    esriTile.contentType && esriTile.contentType.includes('image/jpeg'),
    'Esri Satellite tile returns valid image/jpeg'
  );

  console.log('\n================================================================');
  console.log(`MAP VERIFICATION RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed !== total) process.exit(1);
}

runMapTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
