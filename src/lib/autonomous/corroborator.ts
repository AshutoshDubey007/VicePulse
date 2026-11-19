import connectDB from '@/lib/mongodb';
import Discovery from '@/models/Discovery';
import VerificationRecord from '@/models/VerificationRecord';
import { redditConnector } from './connectors/reddit';
import { youtubeConnector } from './connectors/youtube';
import { rssConnector } from './connectors/rss';
import { RawContentItem } from './types';

export interface CorroborationReport {
  discoveryId: string;
  queryExecuted: string;
  independentSourcesFound: number;
  repostsIgnored: number;
  corroborated: boolean;
  newEvidenceUrls: string[];
}

export async function runCorroborationSweepForDiscovery(
  discoveryId: string,
  discoveryTitle: string,
  originalUrl: string
): Promise<CorroborationReport> {
  await connectDB();

  const searchQuery = `GTA 6 ${discoveryTitle.replace(/[^a-zA-Z0-9 ]/g, '')}`;
  const candidates: RawContentItem[] = [];

  // Search across independent connectors
  try {
    const redditItems = await redditConnector.fetchIntel(searchQuery);
    candidates.push(...redditItems);
  } catch {}

  try {
    const ytItems = await youtubeConnector.fetchIntel(searchQuery);
    candidates.push(...ytItems);
  } catch {}

  try {
    const rssItems = await rssConnector.fetchIntel();
    candidates.push(...rssItems);
  } catch {}

  // Filter out original URL and obvious domain reposts
  const originalDomain = getDomain(originalUrl);
  let independentCount = 0;
  let repostCount = 0;
  const newEvidenceUrls: string[] = [];

  for (const item of candidates) {
    if (item.url === originalUrl) continue;

    const itemDomain = getDomain(item.url);
    if (itemDomain === originalDomain) {
      repostCount++;
      continue;
    }

    // Check if content genuinely discusses this discovery
    const titleMatch = item.title.toLowerCase().includes(discoveryTitle.toLowerCase().slice(0, 20));
    if (titleMatch || computeWordOverlap(item.content, discoveryTitle) >= 0.4) {
      independentCount++;

      // Append new corroborating source to the Discovery document
      await Discovery.findByIdAndUpdate(discoveryId, {
        $addToSet: {
          sources: {
            platform: item.platform,
            url: item.url,
            author: item.author,
            timestamp: item.publishedAt || new Date().toISOString(),
          },
        },
        $inc: { confirmationsCount: 1 },
      });

      if (item.mediaUrls && item.mediaUrls[0]) {
        newEvidenceUrls.push(item.mediaUrls[0]);
        await Discovery.findByIdAndUpdate(discoveryId, {
          $addToSet: {
            evidenceImages: {
              url: item.mediaUrls[0],
              caption: `Corroborating proof found on ${item.sourceName}`,
              type: 'screenshot',
            },
          },
        });
      }

      // Log verification record
      await VerificationRecord.create({
        discoveryId,
        verifiedBy: 'VicePulse Corroboration Engine',
        sourceUrl: item.url,
        platform: item.platform,
        status: 'corroborated',
        reasoning: `Found independent corroborating report from ${item.author} (${item.sourceName})`,
        createdAt: new Date(),
      });
    }
  }

  // If >= 2 independent sources, upgrade status to 'corroborated'
  const isCorroborated = independentCount >= 2;
  if (isCorroborated) {
    await Discovery.findByIdAndUpdate(discoveryId, {
      $set: {
        verificationStatus: 'corroborated',
        verificationReason: `Independently corroborated across ${independentCount} distinct platforms/channels without circular reposting.`,
      },
    });
  }

  return {
    discoveryId,
    queryExecuted: searchQuery,
    independentSourcesFound: independentCount,
    repostsIgnored: repostCount,
    corroborated: isCorroborated,
    newEvidenceUrls,
  };
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function computeWordOverlap(textA: string, textB: string): number {
  const setA = new Set(textA.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const setB = new Set(textB.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  if (setB.size === 0) return 0;
  let matches = 0;
  setB.forEach((w) => {
    if (setA.has(w)) matches++;
  });
  return matches / setB.size;
}
