const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Read MONGODB_URI from .env.local
function getMongoUri() {
  const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
  for (const line of envContent.split('\n')) {
    if (line.startsWith('MONGODB_URI=')) {
      return line.substring('MONGODB_URI='.length).trim().replace(/^["']|["']$/g, '');
    }
  }
  return 'mongodb://localhost:27017/vicepulse';
}

// Coordinate conversion from in-game (x, y) to map (lng, lat)
const REFERENCE_ORIGIN = {
  lng: -80.1918,
  lat: 25.7617,
  degPerMeterLng: 0.0000104,
  degPerMeterLat: 0.0000095,
};

function gameToMap(x, y) {
  const lng = REFERENCE_ORIGIN.lng + x * REFERENCE_ORIGIN.degPerMeterLng;
  const lat = REFERENCE_ORIGIN.lat + y * REFERENCE_ORIGIN.degPerMeterLat;
  return { lng: Number(lng.toFixed(6)), lat: Number(lat.toFixed(6)) };
}

// Primary category extractor from tags
function extractCategory(tags = []) {
  const knownCategories = [
    'hotel',
    'residential',
    'retail',
    'transportation',
    'industrial',
    'leisure',
    'natural',
    'commercial',
    'emergency',
    'government',
    'entertainment',
    'food',
    'automotive',
    'education',
    'religion',
    'infrastructure'
  ];
  for (const cat of knownCategories) {
    if (tags.includes(cat)) return cat;
  }
  if (tags.includes('enterable')) return 'interior';
  if (tags.length > 0 && !tags[0].startsWith('//') && !tags[0].startsWith('l')) return tags[0];
  return 'landmark';
}

async function run() {
  const dataPath = path.join(__dirname, '../scratch/gtadb_repo/map/data/6/landmarks.json');
  if (!fs.existsSync(dataPath)) {
    console.error('landmarks.json not found at:', dataPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(raw);
  const entries = Object.entries(data);
  console.log(`Loaded ${entries.length} GTADB landmarks.`);

  const uri = getMongoUri();
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const collection = db.collection('gtadblandmarks');

  // Verify discoveries count first for safety check
  const discoveriesCount = await db.collection('discoveries').countDocuments();
  console.log(`[SAFETY CHECK] Existing VicePulse discoveries count: ${discoveriesCount} (will remain untouched)`);

  const photosDir = path.join(__dirname, '../public/maps/photos/6');
  const hasPhotosDir = fs.existsSync(photosDir);

  const bulkOps = [];
  let withIgCoords = 0;
  let withRlCoords = 0;

  for (const [id, item] of entries) {
    const [
      igAddress,
      igCoords,
      igPhotoSize,
      rlAddress,
      rlCoords,
      rlPhotoSize,
      tags = [],
      color,
      edited = [],
    ] = item;

    const inGame = igCoords && igCoords.length === 2 ? {
      x: Number(igCoords[0]),
      y: Number(igCoords[1]),
    } : null;

    if (inGame) withIgCoords++;

    const realWorld = rlCoords && rlCoords.length === 2 ? {
      lat: Number(rlCoords[0]),
      lng: Number(rlCoords[1]),
    } : null;

    if (realWorld) withRlCoords++;

    const mapCoords = inGame ? gameToMap(inGame.x, inGame.y) : null;

    const igPhotoFile = `${id},ig.jpg`;
    const rlPhotoFile = `${id},rl.jpg`;

    const hasIgPhoto = hasPhotosDir && fs.existsSync(path.join(photosDir, igPhotoFile));
    const hasRlPhoto = hasPhotosDir && fs.existsSync(path.join(photosDir, rlPhotoFile));

    const photos = {
      inGame: hasIgPhoto ? {
        filename: igPhotoFile,
        url: `/maps/photos/6/${igPhotoFile}`,
        width: igPhotoSize && igPhotoSize.length ? igPhotoSize[0] : undefined,
        height: igPhotoSize && igPhotoSize.length ? igPhotoSize[1] : undefined,
      } : null,
      realWorld: hasRlPhoto ? {
        filename: rlPhotoFile,
        url: `/maps/photos/6/${rlPhotoFile}`,
        width: rlPhotoSize && rlPhotoSize.length ? rlPhotoSize[0] : undefined,
        height: rlPhotoSize && rlPhotoSize.length ? rlPhotoSize[1] : undefined,
      } : null,
    };

    const isEnterable = tags.includes('enterable');
    const status = (rlAddress === '' || rlAddress === '?') ? 'unknown' : tags.includes('unconfirmed') ? 'unconfirmed' : 'confirmed';

    const doc = {
      gtadbId: id,
      name: igAddress || `Landmark ${id}`,
      category: extractCategory(tags),
      tags: tags,
      inGameCoordinates: inGame,
      mapCoordinates: mapCoords,
      realWorldName: rlAddress ? rlAddress.replace(/(?<=.)\?$/, '') : '',
      realWorldCoordinates: realWorld,
      photos: photos,
      color: color || '',
      edited: edited || [],
      attribution: 'GTA VI Landmarks Data (CC BY 4.0) — https://map.gtadb.org',
      isEnterable: isEnterable,
      status: status,
      updatedAt: new Date(),
    };

    bulkOps.push({
      updateOne: {
        filter: { gtadbId: id },
        update: {
          $set: doc,
          $setOnInsert: { createdAt: new Date() }
        },
        upsert: true,
      }
    });
  }

  console.log(`Prepared ${bulkOps.length} bulk operations. Writing to 'gtadblandmarks' collection in batches...`);

  const batchSize = 500;
  let processed = 0;
  for (let i = 0; i < bulkOps.length; i += batchSize) {
    const batch = bulkOps.slice(i, i + batchSize);
    await collection.bulkWrite(batch);
    processed += batch.length;
    console.log(`  Processed ${processed}/${bulkOps.length} records...`);
  }

  // Create indexes
  console.log('Ensuring indexes...');
  await collection.createIndex({ gtadbId: 1 }, { unique: true });
  await collection.createIndex({ category: 1 });
  await collection.createIndex({ isEnterable: 1 });
  await collection.createIndex({ 'inGameCoordinates.x': 1, 'inGameCoordinates.y': 1 });

  const finalGtadbCount = await collection.countDocuments();
  const finalDiscoveriesCount = await db.collection('discoveries').countDocuments();

  console.log('\n=== IMPORT SUMMARY ===');
  console.log(`GTADB Landmarks imported: ${finalGtadbCount}`);
  console.log(`Landmarks with in-game coordinates: ${withIgCoords}`);
  console.log(`Landmarks with real-world coordinates: ${withRlCoords}`);
  console.log(`VicePulse Discoveries count (preserved): ${finalDiscoveriesCount}`);
  console.log('======================\n');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
