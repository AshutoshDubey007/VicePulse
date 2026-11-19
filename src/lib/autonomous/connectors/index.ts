import { RawContentItem, ISourceConnector } from '../types';
import { youtubeConnector } from './youtube';
import { redditConnector } from './reddit';
import { rssConnector } from './rss';
import { socialConnector } from './social';
import connectDB from '@/lib/mongodb';
import ResearchSource from '@/models/ResearchSource';
import ResearchQuery from '@/models/ResearchQuery';
import EngineConfig, { getEngineConfig } from '@/models/EngineConfig';

export interface IngestionReport {
  totalItems: number;
  sourcesQueried: number;
  sourcesFailed: number;
  items: RawContentItem[];
  errors: string[];
}

export const ALL_CONNECTORS: ISourceConnector[] = [
  youtubeConnector,
  redditConnector,
  rssConnector,
  socialConnector,
];

export async function runIngestionSweep(): Promise<IngestionReport> {
  const errors: string[] = [];
  const allItems: RawContentItem[] = [];
  let sourcesQueried = 0;
  let sourcesFailed = 0;

  try {
    await connectDB();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[runIngestionSweep] DB connection error:', errorMsg);
  }

  // Check Engine Global Settings
  let config;
  try {
    config = await getEngineConfig();
    if (config.researchEnginePaused) {
      console.log('[runIngestionSweep] Autonomous research engine is currently PAUSED via Admin Dashboard.');
      return {
        totalItems: 0,
        sourcesQueried: 0,
        sourcesFailed: 0,
        items: [],
        errors: ['Research engine is paused'],
      };
    }
  } catch (err) {
    console.warn('[runIngestionSweep] Unable to load engine config, proceeding with defaults:', err);
  }

  // Load highest priority queries from ResearchQuery collection
  let activeQueries: string[] = ['GTA 6 hidden locations', 'GTA VI easter eggs', 'GTA 6 rare vehicles'];
  try {
    const dbQueries = await ResearchQuery.find({ enabled: true })
      .sort({ priority: -1, lastRunAt: 1 })
      .limit(3)
      .lean();
    if (dbQueries && dbQueries.length > 0) {
      activeQueries = dbQueries.map((q: any) => q.query);
      // Touch lastRunAt
      await ResearchQuery.updateMany(
        { _id: { $in: dbQueries.map((q: any) => q._id) } },
        { $set: { lastRunAt: new Date() } }
      );
    }
  } catch (err) {
    console.warn('[runIngestionSweep] Could not fetch queries from DB:', err);
  }

  const primaryQuery = activeQueries[0] || 'GTA 6 hidden locations secrets';

  // 1. YouTube Data API Connector
  if (!config || config.enabledConnectors?.youtube !== false) {
    sourcesQueried++;
    try {
      const ytItems = await youtubeConnector.fetchIntel(primaryQuery);
      allItems.push(...ytItems);
      await updateSourceTelemetry(
        youtubeConnector.name,
        'youtube',
        true,
        ytItems.length,
        youtubeConnector.getStatus().status === 'degraded' ? 'Running in verified community mode (set YOUTUBE_API_KEY for live searches)' : undefined
      );
    } catch (err: unknown) {
      sourcesFailed++;
      const msg = `YouTube connector error: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      await updateSourceTelemetry(youtubeConnector.name, 'youtube', false, 0, msg);
    }
  }

  // 2. Reddit Community Connector
  if (!config || config.enabledConnectors?.reddit !== false) {
    sourcesQueried++;
    try {
      const redditItems = await redditConnector.fetchIntel(primaryQuery);
      allItems.push(...redditItems);
      await updateSourceTelemetry(redditConnector.name, 'reddit', true, redditItems.length);
    } catch (err: unknown) {
      sourcesFailed++;
      const msg = `Reddit connector error: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      await updateSourceTelemetry(redditConnector.name, 'reddit', false, 0, msg);
    }
  }

  // 3. Gaming Press & Rockstar Newswire RSS
  if (!config || config.enabledConnectors?.rss !== false) {
    sourcesQueried++;
    try {
      const rssItems = await rssConnector.fetchIntel();
      allItems.push(...rssItems);
      await updateSourceTelemetry(rssConnector.name, 'rss', true, rssItems.length);
    } catch (err: unknown) {
      sourcesFailed++;
      const msg = `RSS connector error: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      await updateSourceTelemetry(rssConnector.name, 'rss', false, 0, msg);
    }
  }

  // 4. Social Media & Web Recon
  if (!config || config.enabledConnectors?.social !== false) {
    sourcesQueried++;
    try {
      const socialItems = await socialConnector.fetchIntel(primaryQuery);
      allItems.push(...socialItems);
      await updateSourceTelemetry(
        socialConnector.name,
        'web',
        true,
        socialItems.length,
        socialConnector.getStatus().status === 'unavailable' ? 'Connector idle (X_BEARER_TOKEN or SOCIAL_SEARCH_API_KEY not set)' : undefined
      );
    } catch (err: unknown) {
      sourcesFailed++;
      const msg = `Social connector error: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      await updateSourceTelemetry(socialConnector.name, 'web', false, 0, msg);
    }
  }

  // Deduplicate items in this batch by canonical URL or hash
  const seenUrls = new Set<string>();
  const uniqueItems: RawContentItem[] = [];

  for (const item of allItems) {
    const key = item.canonicalUrl || item.url;
    if (!seenUrls.has(key)) {
      seenUrls.add(key);
      uniqueItems.push(item);
    }
  }

  return {
    totalItems: uniqueItems.length,
    sourcesQueried,
    sourcesFailed,
    items: uniqueItems,
    errors,
  };
}

async function updateSourceTelemetry(
  name: string,
  platform: 'reddit' | 'youtube' | 'rss' | 'community_forum' | 'rockstar_official' | 'web',
  success: boolean,
  itemCount: number,
  lastError?: string
) {
  try {
    await ResearchSource.findOneAndUpdate(
      { name },
      {
        $set: {
          platform,
          lastFetchedAt: new Date(),
          ...(lastError ? { lastError } : { lastError: undefined }),
        },
        $inc: {
          itemsFoundTotal: itemCount,
          errorCount: success ? 0 : 1,
        },
        $setOnInsert: {
          name,
          url: 'https://vicepulse.gg/sources',
          feedUrl: 'https://vicepulse.gg/feed',
          enabled: true,
          reliabilityScore: success ? 5 : 3,
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.warn('[updateSourceTelemetry] Telemetry update failed:', err);
  }
}
