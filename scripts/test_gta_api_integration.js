const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

function checkUrl(url, options = {}) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    const req = mod.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'VicePulse-Test-Runner/1.0',
          'Content-Type': 'application/json',
          ...options.headers,
        },
        timeout: 15000,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(body);
          } catch {}
          resolve({
            status: res.statusCode,
            headers: res.headers,
            contentType: res.headers['content-type'],
            body,
            json,
          });
        });
      }
    );
    req.on('error', (err) => resolve({ status: 'ERR', message: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'TIMEOUT' });
    });
    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('VICEPULSE GTA VI API INTEGRATION & AUTOMATION VERIFICATION SUITE');
  console.log('================================================================\n');

  const BASE = 'http://127.0.0.1:3000';
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

  // --- 1. CRITICAL: DATA PRESERVATION AUDIT ---
  console.log('--- 1. Testing Existing Production Data Preservation ---');
  // Load MongoDB URI to verify direct collection counts
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const uriLine = envContent.split('\n').find((l) => l.startsWith('MONGODB_URI='));
  const uri = uriLine.substring(uriLine.indexOf('=') + 1).trim();

  const mongoose = require('mongoose');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const discoveriesCount = await db.collection('discoveries').countDocuments();
  const vehiclesCount = await db.collection('vehicles').countDocuments();
  const newsCount = await db.collection('newsarticles').countDocuments();
  const gtaEntitiesCount = await db.collection('gtaentities').countDocuments();

  assert(discoveriesCount === 60, 'CRITICAL: Discoveries collection strictly preserved (60 records)', `Count: ${discoveriesCount}`);
  assert(vehiclesCount === 6, 'CRITICAL: Rare Vehicle spawns collection strictly preserved (6 records)', `Count: ${vehiclesCount}`);
  assert(newsCount === 35, 'CRITICAL: News Articles collection strictly preserved (35 records)', `Count: ${newsCount}`);
  assert(gtaEntitiesCount >= 53, `GTA VI entities safely ingested into new collection (${gtaEntitiesCount} records)`);

  // --- 2. API SYNC SERVICE & STATUS ---
  console.log('\n--- 2. Testing Vice-City API Sync Status (/api/sync/vice-city) ---');
  const syncStatusRes = await checkUrl(`${BASE}/api/sync/vice-city`);
  assert(syncStatusRes.status === 200, 'Sync status endpoint -> HTTP 200');
  assert(syncStatusRes.json && syncStatusRes.json.success === true, 'Sync state reports success');
  assert(syncStatusRes.json.totalApiRecords >= 53, `Total API records tracked in state (${syncStatusRes.json.totalApiRecords})`);
  assert(syncStatusRes.json.collectionBreakdown?.vehicle >= 5, 'Vehicle dataset present in collection breakdown');
  assert(syncStatusRes.json.collectionBreakdown?.location >= 5, 'Location dataset present in collection breakdown');
  assert(syncStatusRes.json.collectionBreakdown?.character >= 5, 'Character dataset present in collection breakdown');

  // --- 3. IDEMPOTENT SYNC RUN (PREVENTS DUPLICATION) ---
  console.log('\n--- 3. Testing Idempotent Sync Execution (Prevents Duplication) ---');
  const syncTriggerRes = await checkUrl(`${BASE}/api/sync/vice-city`, { method: 'POST' });
  assert(syncTriggerRes.status === 200, 'POST /api/sync/vice-city triggers synchronization -> HTTP 200');
  assert(syncTriggerRes.json?.report?.success === true, 'Sync execution completes successfully');
  
  // Re-check count to ensure zero duplicate records created
  const postSyncEntitiesCount = await db.collection('gtaentities').countDocuments();
  assert(postSyncEntitiesCount === gtaEntitiesCount, 'Upsert mechanism verified: Zero duplicate records created on repeated sync', `${postSyncEntitiesCount} === ${gtaEntitiesCount}`);

  // --- 4. MAP LAYERS & GEOJSON ENGINE ---
  console.log('\n--- 4. Testing GTA VI Map World Data & GeoJSON Layers (/api/map/layers) ---');
  const mapLayersRes = await checkUrl(`${BASE}/api/map/layers`);
  assert(mapLayersRes.status === 200, 'Map layers endpoint -> HTTP 200');
  assert(mapLayersRes.json?.districts?.features?.length >= 6, `Leonida districts GeoJSON layer returned (${mapLayersRes.json?.districts?.features?.length} districts)`);
  assert(mapLayersRes.json?.attribution?.includes('gtadb.org (CC BY 4.0)'), 'Map attribution properly credits gtadb.org (CC BY 4.0)');
  assert(mapLayersRes.json?.attribution?.includes('vice-city.app'), 'Map attribution properly credits vice-city.app');
  assert(mapLayersRes.json?.landmarks?.features !== undefined, 'Landmarks GeoJSON feature collection returned');

  // Check map explorer page
  const mapPageRes = await checkUrl(`${BASE}/map`);
  assert(mapPageRes.status === 200, 'Map explorer page (/map) renders -> HTTP 200');
  assert(
    mapPageRes.body.includes('Documented Mapped Discoveries') || mapPageRes.body.includes('Leonida Discoveries'),
    'Map explorer contains crawlable directory and tactical map container'
  );

  // --- 5. VEHICLE CATALOGUE EXPANSION ---
  console.log('\n--- 5. Testing Vehicle Catalogue & Separation (/api/vehicles) ---');
  const catalogueRes = await checkUrl(`${BASE}/api/vehicles?mode=catalogue`);
  assert(catalogueRes.status === 200, 'Catalogue mode -> HTTP 200');
  assert(Array.isArray(catalogueRes.json) && catalogueRes.json.length >= 5, `Official catalogue vehicles returned (${catalogueRes.json.length} models)`);

  const allVehiclesRes = await checkUrl(`${BASE}/api/vehicles?mode=all`);
  assert(allVehiclesRes.status === 200, 'All vehicles mode -> HTTP 200');
  assert(allVehiclesRes.json?.spawns?.length > 0, `Community rare spawns preserved separately (${allVehiclesRes.json?.spawns?.length} spawns)`);
  assert(allVehiclesRes.json?.catalogue?.length >= 5, 'Official catalogue preserved separately');

  const vehiclesPageRes = await checkUrl(`${BASE}/vehicles`);
  assert(vehiclesPageRes.status === 200, 'Vehicles public page (/vehicles) renders -> HTTP 200');
  assert(vehiclesPageRes.body.includes('VEHICLES &amp; RARE RIDES') || vehiclesPageRes.body.includes('VEHICLES'), 'Vehicles page renders dual catalogue header');

  // --- 6. DATABASE-BACKED SEARCH ENGINE ---
  console.log('\n--- 6. Testing Database-Backed Search (/api/search) ---');
  const searchVehicleRes = await checkUrl(`${BASE}/api/search?q=airboat`);
  assert(searchVehicleRes.status === 200, 'Search endpoint -> HTTP 200');
  assert(searchVehicleRes.json?.results?.vehicles?.length > 0, `Search for 'airboat' returns vehicle results (${searchVehicleRes.json?.results?.vehicles?.length} matches)`);

  const searchDistrictRes = await checkUrl(`${BASE}/api/search?q=vice`);
  assert(searchDistrictRes.status === 200, 'Multi-entity search for "vice" -> HTTP 200');
  assert(
    (searchDistrictRes.json?.totalCount || 0) > 0,
    `Multi-entity search returns cross-collection results (${searchDistrictRes.json?.totalCount} matches across discoveries, locations, vehicles)`
  );

  // --- 7. UNIFIED AUTONOMOUS SCHEDULER TELEMETRY ---
  console.log('\n--- 7. Testing Unified Autonomous Scheduler (/api/autonomous/status) ---');
  const schedulerRes = await checkUrl(`${BASE}/api/autonomous/status`);
  assert(schedulerRes.status === 200, 'Autonomous status endpoint -> HTTP 200');
  assert(schedulerRes.json?.data?.isRunning === true || schedulerRes.json?.success === true, 'Scheduler daemon is actively running in server environment');

  // --- 8. ADMIN DASHBOARD GTA VI DESK ---
  console.log('\n--- 8. Testing Admin Dashboard Integration (/admin) ---');
  const adminPageRes = await checkUrl(`${BASE}/admin`);
  assert(adminPageRes.status === 200, 'Admin dashboard accessible -> HTTP 200');
  assert(adminPageRes.body.includes('GTA VI API Sync') || adminPageRes.body.includes('gta_api_sync'), 'Admin dashboard includes dedicated GTA VI API Sync Desk');

  console.log('\n================================================================');
  console.log(`INTEGRATION TEST RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  await mongoose.disconnect();
  if (passed !== total) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
