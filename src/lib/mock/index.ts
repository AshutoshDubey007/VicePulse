import { 
  mockDiscoveries, 
  mockRareVehicles, 
  mockSources, 
  mockUsers, 
  mockComments 
} from '@/data/mockData';
import { Discovery, RareVehicle, SourceRecord, UserProfile, Comment } from '@/types';

/**
 * Development-only fixtures flag.
 * Sample fixtures are NEVER enabled unless explicitly enabled via process.env.ENABLE_DEV_FIXTURES === 'true'.
 * Default is strictly FALSE.
 */
export const SHOW_SAMPLE_DATA = process.env.ENABLE_DEV_FIXTURES === 'true';

export const sampleDiscoveries: Discovery[] = SHOW_SAMPLE_DATA ? mockDiscoveries : [];
export const sampleVehicles: RareVehicle[] = SHOW_SAMPLE_DATA ? mockRareVehicles : [];
export const sampleSources: SourceRecord[] = SHOW_SAMPLE_DATA ? mockSources : [];
export const sampleUsers: UserProfile[] = SHOW_SAMPLE_DATA ? mockUsers : [];
export const sampleComments: Comment[] = SHOW_SAMPLE_DATA ? mockComments : [];

export const sampleStats = {
  totalDiscoveries: 0,
  verifiedDiscoveries: 0,
  activeHunters: 0,
  sightingsToday: 0,
};

export const sampleTickerItems = [
  'NEW INTEL: Jack of Hearts underground VIP suite access sequence logged by u/LeonidaScout_99',
  'CONFIRMED: WWII twin-prop airframe fuselage spotted south of Key Chicas reef (-14m depth)',
  'RADAR HIT: 1986 Pegassi Infernus Classic spawned at Ocean Beach garage (2:15 AM)',
  'VERIFIED: Florida Panther territory documented in Lake Leonida pine glades at heavy twilight fog',
  'DISPUTED: Alleged Mt. Chiliad UFO antenna beacon flagged for inconclusive field evidence',
  'FIELD DROP: 3 operational airfields verified by community cartographers across Leonida',
];
