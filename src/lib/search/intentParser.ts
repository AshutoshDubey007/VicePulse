/**
 * VicePulse Search Intent & Category Normalization Engine
 * 
 * Provides deterministic and semantic intent recognition for GTA VI queries,
 * mapping natural language and common user search patterns to canonical categories,
 * entity types, and multi-tiered relevance scoring.
 */

export interface SearchIntent {
  rawQuery: string;
  normalizedQuery: string;
  detectedCategory: string | null;
  detectedEntityType: 'character' | 'vehicle' | 'location' | 'weapon' | null;
  categoryConfidence: number; // 0 to 1
  keywords: string[];
  isBroadCategorySearch: boolean;
}

// Canonical category mappings with synonyms, plurals, and common colloquialisms
const CATEGORY_INTENT_MAP: Record<string, { category: string; weight: number }> = {
  // Easter eggs & secrets
  'easter egg': { category: 'easter-egg', weight: 1.0 },
  'easter eggs': { category: 'easter-egg', weight: 1.0 },
  'easteregg': { category: 'easter-egg', weight: 1.0 },
  'eastereggs': { category: 'easter-egg', weight: 1.0 },
  'easter': { category: 'easter-egg', weight: 0.9 },
  'egg': { category: 'easter-egg', weight: 0.8 },
  'eggs': { category: 'easter-egg', weight: 0.8 },
  'secret': { category: 'easter-egg', weight: 0.85 },
  'secrets': { category: 'easter-egg', weight: 0.85 },
  'hidden secret': { category: 'easter-egg', weight: 0.95 },
  'hidden secrets': { category: 'easter-egg', weight: 0.95 },
  'mystery': { category: 'easter-egg', weight: 0.85 },
  'mysteries': { category: 'easter-egg', weight: 0.85 },
  'ufo': { category: 'easter-egg', weight: 0.9 },
  'myth': { category: 'easter-egg', weight: 0.8 },
  'myths': { category: 'easter-egg', weight: 0.8 },
  'homage': { category: 'easter-egg', weight: 0.85 },
  'reference': { category: 'easter-egg', weight: 0.85 },

  // Rare vehicles & spawns
  'vehicle': { category: 'rare-vehicle', weight: 1.0 },
  'vehicles': { category: 'rare-vehicle', weight: 1.0 },
  'rare vehicle': { category: 'rare-vehicle', weight: 1.0 },
  'rare vehicles': { category: 'rare-vehicle', weight: 1.0 },
  'car': { category: 'rare-vehicle', weight: 0.95 },
  'cars': { category: 'rare-vehicle', weight: 0.95 },
  'supercar': { category: 'rare-vehicle', weight: 0.95 },
  'supercars': { category: 'rare-vehicle', weight: 0.95 },
  'spawn': { category: 'rare-vehicle', weight: 0.85 },
  'spawns': { category: 'rare-vehicle', weight: 0.85 },
  'spawn location': { category: 'rare-vehicle', weight: 0.95 },
  'spawn locations': { category: 'rare-vehicle', weight: 0.95 },
  'rare car': { category: 'rare-vehicle', weight: 1.0 },
  'rare cars': { category: 'rare-vehicle', weight: 1.0 },
  'ride': { category: 'rare-vehicle', weight: 0.8 },
  'rides': { category: 'rare-vehicle', weight: 0.8 },
  'boat': { category: 'rare-vehicle', weight: 0.9 },
  'boats': { category: 'rare-vehicle', weight: 0.9 },
  'plane': { category: 'rare-vehicle', weight: 0.9 },
  'planes': { category: 'rare-vehicle', weight: 0.9 },
  'helicopter': { category: 'rare-vehicle', weight: 0.9 },
  'helicopters': { category: 'rare-vehicle', weight: 0.9 },
  'chopper': { category: 'rare-vehicle', weight: 0.9 },
  'motorcycle': { category: 'rare-vehicle', weight: 0.9 },
  'motorcycles': { category: 'rare-vehicle', weight: 0.9 },
  'bike': { category: 'rare-vehicle', weight: 0.85 },
  'bikes': { category: 'rare-vehicle', weight: 0.85 },

  // Hidden locations & interiors
  'hidden location': { category: 'hidden-location', weight: 1.0 },
  'hidden locations': { category: 'hidden-location', weight: 1.0 },
  'secret location': { category: 'hidden-location', weight: 1.0 },
  'secret locations': { category: 'hidden-location', weight: 1.0 },
  'bunker': { category: 'hidden-location', weight: 0.95 },
  'bunkers': { category: 'hidden-location', weight: 0.95 },
  'interior': { category: 'hidden-location', weight: 0.95 },
  'interiors': { category: 'hidden-location', weight: 0.95 },
  'secret interior': { category: 'hidden-location', weight: 1.0 },
  'underground': { category: 'hidden-location', weight: 0.9 },
  'tunnel': { category: 'hidden-location', weight: 0.9 },
  'tunnels': { category: 'hidden-location', weight: 0.9 },
  'hideout': { category: 'hidden-location', weight: 0.9 },
  'hideouts': { category: 'hidden-location', weight: 0.9 },
  'secret room': { category: 'hidden-location', weight: 0.95 },
  'abandoned': { category: 'hidden-location', weight: 0.85 },

  // Random encounters & dynamic events
  'encounter': { category: 'encounter', weight: 1.0 },
  'encounters': { category: 'encounter', weight: 1.0 },
  'random encounter': { category: 'encounter', weight: 1.0 },
  'random encounters': { category: 'encounter', weight: 1.0 },
  'stranger': { category: 'encounter', weight: 0.9 },
  'strangers': { category: 'encounter', weight: 0.9 },
  'npc encounter': { category: 'encounter', weight: 0.95 },
  'npc': { category: 'encounter', weight: 0.8 },
  'dynamic event': { category: 'encounter', weight: 0.95 },
  'dynamic events': { category: 'encounter', weight: 0.95 },
  'event': { category: 'encounter', weight: 0.75 },
  'events': { category: 'encounter', weight: 0.75 },

  // Wildlife & fauna
  'wildlife': { category: 'wildlife', weight: 1.0 },
  'animal': { category: 'wildlife', weight: 0.95 },
  'animals': { category: 'wildlife', weight: 0.95 },
  'alligator': { category: 'wildlife', weight: 0.95 },
  'alligators': { category: 'wildlife', weight: 0.95 },
  'gator': { category: 'wildlife', weight: 0.95 },
  'gators': { category: 'wildlife', weight: 0.95 },
  'croc': { category: 'wildlife', weight: 0.9 },
  'crocodile': { category: 'wildlife', weight: 0.9 },
  'shark': { category: 'wildlife', weight: 0.95 },
  'sharks': { category: 'wildlife', weight: 0.95 },
  'flamingo': { category: 'wildlife', weight: 0.9 },
  'flamingos': { category: 'wildlife', weight: 0.9 },
  'deer': { category: 'wildlife', weight: 0.9 },
  'panther': { category: 'wildlife', weight: 0.95 },
  'fauna': { category: 'wildlife', weight: 0.95 },
  'creature': { category: 'wildlife', weight: 0.85 },

  // Activities & unusual gameplay
  'activity': { category: 'unusual-event', weight: 0.95 },
  'activities': { category: 'unusual-event', weight: 0.95 },
  'unusual event': { category: 'unusual-event', weight: 1.0 },
  'unusual events': { category: 'unusual-event', weight: 1.0 },
  'secret mission': { category: 'unusual-event', weight: 1.0 },
  'secret missions': { category: 'unusual-event', weight: 1.0 },
  'side mission': { category: 'unusual-event', weight: 0.9 },
  'side missions': { category: 'unusual-event', weight: 0.9 },
  'minigame': { category: 'unusual-event', weight: 0.9 },
  'minigames': { category: 'unusual-event', weight: 0.9 },
  'mini game': { category: 'unusual-event', weight: 0.9 },
  'mini games': { category: 'unusual-event', weight: 0.9 },
  'mini-game': { category: 'unusual-event', weight: 0.9 },
  'mini-games': { category: 'unusual-event', weight: 0.9 },
  'stunt': { category: 'unusual-event', weight: 0.85 },
  'stunts': { category: 'unusual-event', weight: 0.85 },
  'robbery': { category: 'unusual-event', weight: 0.85 },
};

// Known GTA VI character names
const CHARACTER_KEYWORDS = new Set([
  'lucia',
  'jason',
  'cal',
  'hampton',
  'boobie',
  'drek',
  'stefanie',
  'brian',
  'kai',
  'raul',
]);

// Known vehicle model names
const VEHICLE_KEYWORDS = new Set([
  'cheetah',
  'infernus',
  'banshee',
  'comet',
  'coquette',
  'sultan',
  'dominator',
  'gauntlet',
  'oceanic',
  'voodoo',
  'buccaneer',
  'stallion',
  'torero',
  'faggio',
  'squalo',
  'maverick',
]);

/**
 * Parse and normalize user query to detect intent
 */
export function parseSearchIntent(query: string): SearchIntent {
  const rawQuery = (query || '').trim();
  const normalizedQuery = rawQuery.toLowerCase().replace(/[^\w\s-]/g, ' ').replace(/\s+/g, ' ').trim();

  if (!normalizedQuery) {
    return {
      rawQuery,
      normalizedQuery: '',
      detectedCategory: null,
      detectedEntityType: null,
      categoryConfidence: 0,
      keywords: [],
      isBroadCategorySearch: false,
    };
  }

  // Tokenize
  const tokens = normalizedQuery.split(' ').filter(Boolean);

  let bestCategory: string | null = null;
  let bestWeight = 0;
  let isBroad = false;

  // Check multi-word phrases first
  for (let len = Math.min(3, tokens.length); len >= 1; len--) {
    for (let i = 0; i <= tokens.length - len; i++) {
      const phrase = tokens.slice(i, i + len).join(' ');
      const match = CATEGORY_INTENT_MAP[phrase];
      if (match && match.weight > bestWeight) {
        bestCategory = match.category;
        bestWeight = match.weight;
        // If the entire query was this phrase or very close, it's a broad category search
        if (tokens.length <= len + 1) {
          isBroad = true;
        }
      }
    }
  }

  // Detect Entity Type
  let detectedEntityType: 'character' | 'vehicle' | 'location' | 'weapon' | null = null;
  for (const token of tokens) {
    if (CHARACTER_KEYWORDS.has(token)) {
      detectedEntityType = 'character';
      break;
    }
    if (VEHICLE_KEYWORDS.has(token)) {
      detectedEntityType = 'vehicle';
      break;
    }
  }

  return {
    rawQuery,
    normalizedQuery,
    detectedCategory: bestCategory,
    detectedEntityType,
    categoryConfidence: bestWeight,
    keywords: tokens,
    isBroadCategorySearch: isBroad,
  };
}

/**
 * Multi-tiered discovery relevance scoring
 * 
 * Scores a discovery against the query and recognized intent:
 * - 100+: Exact title match or starts with query
 * - 80+: Intent category match
 * - 60+: Tag matches
 * - 40+: Description matches
 * - 20+: District or location name match
 * - Penalty (-60): Mismatched category when query explicitly targets a different category
 */
export function scoreDiscoveryRelevance(
  discovery: {
    title: string;
    category: string;
    description?: string;
    district?: string;
    locationName?: string;
    tags?: string[];
  },
  intent: SearchIntent
): number {
  if (!intent.normalizedQuery) return 0;

  const titleLower = (discovery.title || '').toLowerCase();
  const descLower = (discovery.description || '').toLowerCase();
  const locLower = (discovery.locationName || '').toLowerCase();
  const distLower = (discovery.district || '').toLowerCase();
  const tagsLower = (discovery.tags || []).map((t) => t.toLowerCase());

  let score = 0;

  // 1. Exact or Prefix Title Match (Tier 1: 100-150 pts)
  if (titleLower === intent.normalizedQuery) {
    score += 150;
  } else if (titleLower.startsWith(intent.normalizedQuery)) {
    score += 120;
  } else if (titleLower.includes(intent.normalizedQuery)) {
    score += 90;
  } else {
    // Check individual keyword matches in title
    let keywordTitleHits = 0;
    for (const kw of intent.keywords) {
      if (titleLower.includes(kw)) keywordTitleHits++;
    }
    if (keywordTitleHits > 0) {
      score += (keywordTitleHits / intent.keywords.length) * 60;
    }
  }

  // 2. Category Match vs Intent (Tier 2: 80 pts or Penalty)
  if (intent.detectedCategory) {
    if (discovery.category === intent.detectedCategory) {
      score += 80 * intent.categoryConfidence;
      if (intent.isBroadCategorySearch) {
        // Boost for broad category exploration
        score += 40;
      }
    } else {
      // PENALTY: User asked for "Easter eggs" or "Vehicles" — strongly penalize other categories
      score -= 75 * intent.categoryConfidence;
    }
  }

  // 3. Tag Matches (Tier 3: 50 pts)
  for (const tag of tagsLower) {
    if (tag === intent.normalizedQuery || intent.normalizedQuery.includes(tag)) {
      score += 40;
    }
    for (const kw of intent.keywords) {
      if (tag.includes(kw)) score += 15;
    }
  }

  // 4. Description Content (Tier 4: 30 pts)
  if (descLower.includes(intent.normalizedQuery)) {
    score += 30;
  } else {
    let kwDescHits = 0;
    for (const kw of intent.keywords) {
      if (descLower.includes(kw)) kwDescHits++;
    }
    if (kwDescHits > 0) {
      score += (kwDescHits / intent.keywords.length) * 20;
    }
  }

  // 5. Location / District Matches (Tier 5: 25 pts)
  if (locLower.includes(intent.normalizedQuery)) {
    score += 25;
  }
  if (distLower.includes(intent.normalizedQuery)) {
    score += 20;
  }

  return score;
}
