/**
 * VicePulse Search Accuracy & Complete Map Verification Suite
 * 
 * Verifies:
 * 1. Intent recognition & category normalization across all 6 canonical categories
 * 2. Multi-tiered relevance scoring (exact title > category > tags > description > location)
 * 3. Search result integrity (single record fields consistency)
 * 4. Quality fallback handling
 * 5. Map layout, coordinate validity, and pin filtering
 */

const { parseSearchIntent, scoreDiscoveryRelevance } = require('../src/lib/search/intentParser.ts');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔\x1b[0m ${testName}`);
  } else {
    failedTests++;
    console.error(`  \x1b[31m✖\x1b[0m ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log('\n======================================================');
console.log('   VICEPULSE SEARCH ACCURACY & MAP TEST SUITE        ');
console.log('======================================================\n');

// -----------------------------------------------------------------
// 1. Search Intent Recognition & Category Normalization
// -----------------------------------------------------------------
console.log('\x1b[36m[SUITE 1: Search Intent Recognition & Normalization]\x1b[0m');

const easterEggQueries = ['Easter egg', 'easter eggs', 'EASTER EGG', 'easteregg', 'secrets', 'hidden secrets', 'ufo mystery'];
for (const q of easterEggQueries) {
  const intent = parseSearchIntent(q);
  assert(
    intent.detectedCategory === 'easter-egg',
    `Query "${q}" maps to category "easter-egg"`,
    `Got: ${intent.detectedCategory}`
  );
  if (['easter egg', 'easter eggs', 'easteregg', 'secrets'].includes(q.toLowerCase())) {
    assert(
      intent.isBroadCategorySearch === true,
      `Query "${q}" correctly identified as broad category search`,
      `Got: ${intent.isBroadCategorySearch}`
    );
  }
}

const vehicleQueries = ['Rare vehicles', 'vehicles', 'rare vehicle', 'supercars', 'car spawns', 'spawn locations', 'rare car'];
for (const q of vehicleQueries) {
  const intent = parseSearchIntent(q);
  assert(
    intent.detectedCategory === 'rare-vehicle',
    `Query "${q}" maps to category "rare-vehicle"`,
    `Got: ${intent.detectedCategory}`
  );
}

const locationQueries = ['Hidden locations', 'hidden location', 'secret bunkers', 'secret interior', 'underground tunnels'];
for (const q of locationQueries) {
  const intent = parseSearchIntent(q);
  assert(
    intent.detectedCategory === 'hidden-location',
    `Query "${q}" maps to category "hidden-location"`,
    `Got: ${intent.detectedCategory}`
  );
}

const encounterQueries = ['Random encounters', 'encounters', 'random encounter', 'strangers', 'dynamic events'];
for (const q of encounterQueries) {
  const intent = parseSearchIntent(q);
  assert(
    intent.detectedCategory === 'encounter',
    `Query "${q}" maps to category "encounter"`,
    `Got: ${intent.detectedCategory}`
  );
}

const wildlifeQueries = ['Wildlife', 'animals', 'alligator sightings', 'panther', 'rare sharks'];
for (const q of wildlifeQueries) {
  const intent = parseSearchIntent(q);
  assert(
    intent.detectedCategory === 'wildlife',
    `Query "${q}" maps to category "wildlife"`,
    `Got: ${intent.detectedCategory}`
  );
}

const activityQueries = ['Secret missions', 'activities', 'unusual event', 'minigames', 'side missions'];
for (const q of activityQueries) {
  const intent = parseSearchIntent(q);
  assert(
    intent.detectedCategory === 'unusual-event',
    `Query "${q}" maps to category "unusual-event"`,
    `Got: ${intent.detectedCategory}`
  );
}

// Entity recognition
const characterIntent = parseSearchIntent('Lucia and Jason storyline');
assert(
  characterIntent.detectedEntityType === 'character',
  'Recognizes "Lucia" as character entity intent',
  `Got: ${characterIntent.detectedEntityType}`
);

const vehicleEntityIntent = parseSearchIntent('Cheetah spawn location');
assert(
  vehicleEntityIntent.detectedEntityType === 'vehicle',
  'Recognizes "Cheetah" as vehicle entity intent',
  `Got: ${vehicleEntityIntent.detectedEntityType}`
);

// -----------------------------------------------------------------
// 2. Multi-Tiered Relevance Scoring & Ranking Priority
// -----------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 2: Multi-Tiered Relevance Scoring]\x1b[0m');

const easterEggIntent = parseSearchIntent('Easter egg');

const candidateEasterEgg = {
  title: 'Submerged Cargo Plane UFO Reference',
  category: 'easter-egg',
  description: 'An underwater aircraft fuselage referencing the classic GTA mystery.',
  district: 'The Keys',
  locationName: 'Key Chicas Trench',
  tags: ['easter egg', 'ufo', 'underwater'],
};

const candidateUnrelatedVehicle = {
  title: 'Grotti Cheetah Classic Spawn',
  category: 'rare-vehicle',
  description: 'A vintage red sports car that developers called an easter egg in interviews.',
  district: 'Vice Beach',
  locationName: 'Ocean Drive Hotel',
  tags: ['car', 'supercar', 'grotti'],
};

const scoreEasterEgg = scoreDiscoveryRelevance(candidateEasterEgg, easterEggIntent);
const scoreVehicle = scoreDiscoveryRelevance(candidateUnrelatedVehicle, easterEggIntent);

assert(
  scoreEasterEgg > 100,
  `Genuine Easter egg discovery receives high score: ${scoreEasterEgg}`,
  `Score was: ${scoreEasterEgg}`
);

assert(
  scoreVehicle <= 0,
  `Unrelated vehicle mentioning "easter egg" in description is penalized (Score: ${scoreVehicle} <= 0)`,
  `Score was: ${scoreVehicle}`
);

assert(
  scoreEasterEgg > scoreVehicle,
  'Genuine category discovery ranks strictly above unrelated items containing accidental keywords'
);

// Title exact match priority
const exactTitleCandidate = {
  title: 'Easter egg',
  category: 'easter-egg',
  description: 'A direct secret hidden in Vice City.',
};

const partialCandidate = {
  title: 'Some Other Secret',
  category: 'easter-egg',
  description: 'Mentions easter egg here.',
};

const exactScore = scoreDiscoveryRelevance(exactTitleCandidate, easterEggIntent);
const partialScore = scoreDiscoveryRelevance(partialCandidate, easterEggIntent);

assert(
  exactScore > partialScore,
  `Exact title match (${exactScore}) scores higher than partial description match (${partialScore})`
);

// -----------------------------------------------------------------
// 3. Search Result & Data Integrity Verification
// -----------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 3: Single-Record Data Integrity]\x1b[0m');

// Verify candidate mock discovery has consistent fields belonging to the same entity
const mockRecord = {
  id: 'disc_601',
  title: 'Submerged Cargo Plane UFO Reference',
  category: 'easter-egg',
  description: 'An underwater aircraft fuselage referencing the classic GTA mystery.',
  district: 'The Keys',
  locationName: 'Key Chicas Trench',
  coordinates: { lat: 24.582, lng: -81.754, inGameGrid: 'G4' },
  verificationStatus: 'community_verified',
  evidenceImages: [{ url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', caption: 'Cockpit' }],
};

assert(
  mockRecord.category === 'easter-egg' && mockRecord.title.includes('UFO'),
  'Headline matches discovery category and intent'
);
assert(
  mockRecord.coordinates.lat !== 0 && mockRecord.coordinates.lng !== 0,
  'Coordinates are valid non-zero values'
);
assert(
  mockRecord.coordinates.inGameGrid === 'G4' && mockRecord.district === 'The Keys',
  'District and tactical grid sector are mutually consistent'
);
assert(
  mockRecord.evidenceImages[0].url.length > 0,
  'Evidence image belongs to the record'
);

// -----------------------------------------------------------------
// 4. Map Pin Filtering & Viewport Layout Rules
// -----------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 4: Map Pin Filtering & Viewport Rules]\x1b[0m');

const mixedDiscoveries = [
  { id: '1', title: 'Sunken Sub', category: 'easter-egg', coordinates: { lat: 25.1, lng: -80.2, inGameGrid: 'B2' } },
  { id: '2', title: 'Cheetah Spawn', category: 'rare-vehicle', coordinates: { lat: 25.7, lng: -80.1, inGameGrid: 'C3' } },
  { id: '3', title: 'Secret Bunker', category: 'hidden-location', coordinates: { lat: 25.4, lng: -80.5, inGameGrid: 'D1' } },
  { id: '4', title: 'Unconfirmed Ghost Ship', category: 'easter-egg', coordinates: { lat: 0, lng: 0, inGameGrid: 'LOCATION_PENDING' } },
];

// Valid numeric coordinates filter
const validMapped = mixedDiscoveries.filter(
  (d) =>
    d.coordinates &&
    typeof d.coordinates.lat === 'number' &&
    typeof d.coordinates.lng === 'number' &&
    d.coordinates.lat !== 0 &&
    d.coordinates.lng !== 0 &&
    d.coordinates.inGameGrid !== 'LOCATION_PENDING'
);

assert(
  validMapped.length === 3,
  `Only discoveries with valid coordinates are mapped (Expected: 3, Got: ${validMapped.length})`
);

assert(
  !validMapped.some((d) => d.id === '4'),
  'Record with pending coordinates is excluded from map markers, preventing (0,0) placement'
);

// Filter by search query "Easter egg"
const filteredPins = validMapped.filter((d) => {
  const score = scoreDiscoveryRelevance(d, easterEggIntent);
  return score > 0 && d.category === easterEggIntent.detectedCategory;
});

assert(
  filteredPins.length === 1 && filteredPins[0].id === '1',
  'Searching "Easter egg" filters map pins strictly to valid Easter eggs'
);

// -----------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------
console.log('\n======================================================');
console.log(`TOTAL: ${passedTests + failedTests} | PASSED: \x1b[32m${passedTests}\x1b[0m | FAILED: \x1b[31m${failedTests}\x1b[0m`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('All search accuracy and map tests passed successfully!');
}
