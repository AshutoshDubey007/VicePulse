const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

async function run() {
  console.log('================================================================');
  console.log('VICEPULSE GTA VI API SYNCHRONIZATION & PRESERVATION TEST');
  console.log('================================================================\n');

  const { runViceCityApiSync } = await import('../src/lib/viceCityApi/syncService.ts');
  const GtaEntity = (await import('../src/models/GtaEntity.ts')).default;
  const Vehicle = (await import('../src/models/Vehicle.ts')).default;
  const Discovery = (await import('../src/models/Discovery.ts')).default;
  const ApiSyncState = (await import('../src/models/ApiSyncState.ts')).default;

  // 1. Check existing counts prior to sync
  const initialDiscoveryCount = await Discovery.countDocuments();
  const initialVehicleCount = await Vehicle.countDocuments();
  console.log(`Initial Discovery count: ${initialDiscoveryCount} (MUST BE PRESERVED)`);
  console.log(`Initial Vehicle spawn count: ${initialVehicleCount} (MUST BE PRESERVED)`);

  // 2. Run API Sync
  console.log('\n--- Running API Synchronization ---');
  const report = await runViceCityApiSync();
  console.log('Sync Report:', JSON.stringify(report, null, 2));

  // 3. Verify counts after sync
  const postDiscoveryCount = await Discovery.countDocuments();
  const postVehicleCount = await Vehicle.countDocuments();
  const gtaEntityCount = await GtaEntity.countDocuments();
  const syncState = await ApiSyncState.findOne({ service: 'vice-city.app' });

  console.log('\n--- Verification Assertions ---');
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

  assert(report.success === true, 'API Sync executed successfully');
  assert(gtaEntityCount > 0, `GTA VI entities stored in database (${gtaEntityCount} records)`);
  assert(postDiscoveryCount === initialDiscoveryCount, 'CRITICAL: Existing Discoveries count strictly preserved', `${postDiscoveryCount} === ${initialDiscoveryCount}`);
  assert(postVehicleCount === initialVehicleCount, 'CRITICAL: Existing Vehicle spawns count strictly preserved', `${postVehicleCount} === ${initialVehicleCount}`);
  assert(syncState && syncState.status === 'completed', 'ApiSyncState status marked as completed');
  assert(syncState && syncState.totalApiRecords > 0, `ApiSyncState records tracked (${syncState?.totalApiRecords})`);

  // 4. Test Sample Entity
  const sampleVehicle = await GtaEntity.findOne({ type: 'vehicle' });
  assert(sampleVehicle && sampleVehicle.externalId, `Vehicle catalogue item verified (${sampleVehicle?.name?.en})`);
  assert(sampleVehicle?.source === 'vice-city.app', 'Source properly attributed to vice-city.app');

  const sampleLocation = await GtaEntity.findOne({ type: 'location' });
  assert(sampleLocation && sampleLocation.name?.en, `Location entity verified (${sampleLocation?.name?.en})`);

  console.log(`\n================================================================`);
  console.log(`TEST RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  await mongoose.disconnect();
  if (passed !== total) process.exit(1);
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
