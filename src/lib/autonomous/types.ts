import { SourcePlatform, Category, VerificationStatus } from '@/types';

export type PipelineStage = 
  | 'search'
  | 'fetch_source'
  | 'normalize_content'
  | 'extract_information'
  | 'detect_discoveries'
  | 'classify'
  | 'duplicate_detection'
  | 'corroboration_search'
  | 'location_analysis'
  | 'confidence_assessment'
  | 'publish_or_update'
  | 'map_update'
  | 'notification';

export interface VideoTimestamp {
  time: string;
  seconds: number;
  label: string;
}

export interface RawContentItem {
  id: string;
  url: string;
  canonicalUrl?: string;
  title: string;
  platform: SourcePlatform;
  author: string;
  content: string;
  publishedAt?: string;
  sourceName: string;
  score?: number;
  commentsCount?: number;
  tags?: string[];
  mediaUrls?: string[];
  transcript?: string;
  transcriptStatus?: 'available' | 'unavailable' | 'pending';
  videoTimestamps?: VideoTimestamp[];
  videoId?: string;
  channelId?: string;
}

export interface ExtractedDiscoveryDraft {
  isRelevant: boolean;
  contentType: 'discovery' | 'news' | 'leak' | 'theory' | 'speculation' | 'irrelevant';
  isNews: boolean;
  confidenceScore: number;
  title: string;
  description: string;
  category: Category;
  subcategory?: string;
  locationName: string;
  district: string;
  inGameTime?: string;
  weather?: string;
  requirements?: string[];
  stepsToFind: string[];
  evidenceImages: Array<{
    url: string;
    caption: string;
    type: 'screenshot' | 'clip' | 'map_crop';
  }>;
  videoTimestamps?: VideoTimestamp[];
  suggestedVerification: VerificationStatus;
  keyClaims: string[];
  tags: string[];
  newsSummary?: {
    headline: string;
    excerpt: string;
    editorialArticle: string;
    category: 'official' | 'community' | 'leak' | 'analysis';
  };
}

export interface PipelineExecutionResult {
  jobId: string;
  success: boolean;
  sourcesChecked: number;
  itemsIngested: number;
  discoveriesCreated: number;
  discoveriesUpdated: number;
  newsArticlesCreated: number;
  tokenUsage?: number;
  estimatedCostUSD?: number;
  errors: string[];
  durationMs: number;
  stageResults?: Record<PipelineStage, { status: 'passed' | 'warning' | 'failed'; count?: number; message?: string }>;
}

export interface ISourceConnector {
  id: string;
  name: string;
  platform: SourcePlatform;
  isEnabled: () => boolean;
  isAvailable: () => boolean;
  getStatus: () => {
    configured: boolean;
    credentialsRequired: string[];
    rateLimitRemaining?: number;
    lastFetchAt?: Date;
    status: 'ready' | 'degraded' | 'unavailable';
  };
  fetchIntel: (query?: string) => Promise<RawContentItem[]>;
}
