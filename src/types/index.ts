export type Category = 
  | 'hidden-location' 
  | 'rare-vehicle' 
  | 'easter-egg' 
  | 'encounter' 
  | 'unusual-event'
  | 'wildlife';

export type VerificationStatus = 
  | 'unverified' 
  | 'reported'
  | 'under_investigation' 
  | 'corroborated'
  | 'community_verified' 
  | 'personally_verified' 
  | 'disputed';

export type SourcePlatform = 
  | 'reddit' 
  | 'youtube' 
  | 'tiktok' 
  | 'instagram' 
  | 'discord' 
  | 'gaming-press' 
  | 'x-twitter';

export type SourceStatus = 
  | 'new' 
  | 'processing' 
  | 'extracted' 
  | 'duplicate' 
  | 'needs_review' 
  | 'published' 
  | 'rejected';

export interface EvidenceImage {
  url: string;
  caption?: string;
  type: 'screenshot' | 'clip' | 'map_crop';
}

export interface DiscoverySource {
  platform: SourcePlatform;
  url: string;
  author: string;
  timestamp?: string;
}

export interface DisputeRecord {
  id: string;
  reason: string;
  reportedBy: string;
  createdAt: string;
}

export interface Discovery {
  id: string;
  title: string;
  slug: string;
  category: Category;
  subcategory?: string;
  locationName: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
    inGameGrid?: string;
  };
  inGameCoordinates?: {
    x: number;
    y: number;
    z?: number;
  };
  coordinateProvenance?: {
    system: 'gtadb_v6' | 'in_game_gps' | 'vicepulse_recon';
    originalCoords: [number, number];
    source: string;
    importedAt?: string;
  };
  description: string;
  stepsToFind: string[];
  inGameTime?: string;
  weather?: string;
  requirements?: string[];
  evidenceImages: EvidenceImage[];
  source: DiscoverySource;
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  confirmationsCount: number;
  confirmedBy: string[];
  disputeCount: number;
  disputes: DisputeRecord[];
  tags: string[];
  submittedBy: {
    id: string;
    username: string;
    role: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

export interface RareVehicle {
  id: string;
  name: string;
  modelName: string;
  vehicleClass: 'super' | 'sports' | 'muscle' | 'classic' | 'offroad' | 'watercraft' | 'aircraft' | 'special';
  description: string;
  reportedLocation: string;
  district: string;
  coordinates: {
    lat: number;
    lng: number;
    inGameGrid?: string;
  };
  inGameCoordinates?: {
    x: number;
    y: number;
    z?: number;
  };
  coordinateProvenance?: {
    system: 'gtadb_v6' | 'in_game_gps' | 'vicepulse_recon';
    originalCoords: [number, number];
    source: string;
    importedAt?: string;
  };
  spawnConditions: {
    time?: string;
    weather?: string;
    storyProgression?: string;
  };
  evidenceImage: string;
  verificationStatus: VerificationStatus;
  confirmationsCount: number;
  rarity: 'Legendary' | 'Rare' | 'Uncommon' | 'Secret';
  speedRating?: number;
  accelerationRating?: number;
}

export interface SourceRecord {
  id: string;
  originalUrl: string;
  platform: SourcePlatform;
  author: string;
  contentTitle: string;
  dateDiscovered: string;
  datePublished?: string;
  extractedDiscoveries: string[];
  status: SourceStatus;
  reliabilityNotes: string;
  reliabilityScore: number; // 1 to 5
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  awardedAt?: string;
}

export type SubscriptionPlanId = 'free' | 'scout_pro' | 'syndicate_elite';
export type SubscriptionBillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'expired' | 'trialing';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded' | 'cancelled';
export type PaymentProviderType = 'razorpay' | 'stripe';

export interface UserSubscription {
  id: string;
  userId: string;
  planId: SubscriptionPlanId;
  billingCycle: SubscriptionBillingCycle;
  status: SubscriptionStatus;
  provider: PaymentProviderType;
  providerSubscriptionId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  features: string[];
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  paymentId?: string;
  userId: string;
  amount: number;
  currency: string;
  provider: PaymentProviderType;
  status: PaymentStatus;
  planId: SubscriptionPlanId;
  billingCycle: SubscriptionBillingCycle;
  signatureVerified: boolean;
  paymentMethod?: string;
  receiptUrl?: string;
  failureReason?: string;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  userId: string;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  discoveryUpdates: boolean;
  commentReplies: boolean;
  securityAndTransactional: boolean; // Always true
  updatedAt?: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'discovery_status' | 'confirmation' | 'comment' | 'payment' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'scout' | 'investigator' | 'moderator' | 'admin';
  tier?: 'free' | 'pro' | 'elite';
  avatar: string;
  bio: string;
  reputation: number;
  badges: UserBadge[];
  contributionsCount: number;
  verifiedCount: number;
  joinedDate: string;
  submittedDiscoveryIds: string[];
  confirmedDiscoveryIds: string[];
  subscription?: UserSubscription;
  notificationPreferences?: NotificationPreferences;
}

export interface Comment {
  id: string;
  discoveryId: string;
  username: string;
  userRole: string;
  avatar: string;
  content: string;
  createdAt: string;
  isFieldScoutNote: boolean;
  evidenceUrl?: string;
}

export interface PlanConfig {
  id: SubscriptionPlanId;
  name: string;
  tagline: string;
  badge: string;
  prices: {
    monthly: { amount: number; currency: string; formatted: string };
    yearly: { amount: number; currency: string; formatted: string; savings: string };
  };
  features: string[];
  exclusivePerks: string[];
  highlight?: boolean;
}

// -------------------------------------------------------------
// Autonomous Research & News Intelligence Engine Types
// -------------------------------------------------------------

export type NewsCategory = 'official' | 'community' | 'leak' | 'analysis';

export interface NewsArticleSource {
  title: string;
  url: string;
  platform: string;
  publishedAt?: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  tags: string[];
  bannerImage: string;
  sources: NewsArticleSource[];
  relatedDiscoveryIds?: string[];
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  confidenceScore: number;
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchQueryItem {
  id: string;
  query: string;
  category: Category | 'all';
  priority: 'high' | 'normal' | 'low';
  frequencyHours: number;
  enabled: boolean;
  lastRunAt?: string;
  itemsFoundCount: number;
}

export interface SourceContentRecord {
  id: string;
  url: string;
  hash: string;
  title: string;
  platform: SourcePlatform;
  author: string;
  rawContent?: string;
  cleanText?: string;
  processingStatus: 'pending' | 'processed' | 'discarded' | 'failed';
  extractedDiscoveryId?: string;
  extractedNewsId?: string;
  error?: string;
  ingestedAt: string;
}

export interface ResearchJobRecord {
  id: string;
  jobId: string;
  trigger: 'scheduled' | 'manual' | 'webhook';
  status: 'running' | 'completed' | 'failed';
  sourcesChecked: number;
  itemsIngested: number;
  discoveriesCreated: number;
  discoveriesUpdated: number;
  newsArticlesCreated: number;
  tokenUsage?: number;
  durationMs?: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface VerificationRecordItem {
  id: string;
  discoveryId: string;
  claimsCorroborated: string[];
  corroboratingSources: Array<{
    sourceUrl: string;
    platform: string;
    corroboratedAt: string;
    reliabilityWeight: number;
  }>;
  statusAssigned: VerificationStatus;
  previousStatus: VerificationStatus;
  confidenceScore: number;
  reasoning: string;
  createdAt: string;
}

// ==========================================
// GTA VI VICE-CITY.APP API ENTITY TYPES
// ==========================================

export type GtaEntityType =
  | 'location'
  | 'business'
  | 'character'
  | 'manufacturer'
  | 'vehicle'
  | 'weapon'
  | 'activity'
  | 'radio-station'
  | 'trailer'
  | 'edition'
  | 'event';

export interface GtaLocalizedText {
  en: string;
  fr?: string;
}

export interface GtaEntitySourceRef {
  url: string;
  site?: string;
}

export interface GtaEntityRelation {
  id: string;
  type: string;
  role?: string;
}

export interface GtaEntityRecord {
  id: string;
  source: 'vice-city.app';
  externalId: string;
  type: GtaEntityType;
  slug: string;
  name: GtaLocalizedText | string;
  summary?: GtaLocalizedText | string | null;
  attributes: Record<string, any>;
  relations?: GtaEntityRelation[];
  reliability?: string;
  spoiler?: boolean;
  verifiedInGame?: boolean;
  sources?: GtaEntitySourceRef[];
  lastSyncedAt: string;
  sourceUpdatedAt?: string;
  syncStatus: 'synced' | 'pending' | 'deprecated';
}

export interface GtaVehicleCatalogueItem extends GtaEntityRecord {
  type: 'vehicle';
  manufacturer?: string | null;
  vehicleClass?: string;
  modelName?: string;
  realInspiration?: string | null;
  seenIn?: string | null;
  speedRating?: number;
  accelerationRating?: number;
}

export interface GtaLocationItem extends GtaEntityRecord {
  type: 'location';
  kind?: 'region' | 'district' | 'town';
  slogan?: string | null;
  inspiration?: string | null;
  inGameCoordinates?: {
    x?: number;
    y?: number;
  };
}

export interface GtaMapFeatureRecord {
  id: string;
  layer: 'districts' | 'landmarks' | 'boundaries';
  featureId?: string | number;
  featureType?: string;
  properties: {
    name?: string;
    slug?: string;
    kind?: string;
    region?: string;
    tag?: string;
    description?: string;
    [key: string]: any;
  };
  geometry: {
    type: 'Point' | 'Polygon' | 'MultiPolygon' | 'LineString';
    coordinates: any;
  };
  lastSyncedAt: string;
}

export interface ApiSyncStateRecord {
  service: 'vice-city.app';
  status: 'idle' | 'syncing' | 'completed' | 'failed';
  plan: 'demo' | 'developer';
  lastSuccessfulSync?: string;
  nextScheduledSync?: string;
  totalApiRecords: number;
  importedRecords: number;
  updatedRecords: number;
  collectionCounts: Record<string, number>;
  rateLimitLimit?: number;
  rateLimitRemaining?: number;
  error?: string;
  syncDurationMs?: number;
}


