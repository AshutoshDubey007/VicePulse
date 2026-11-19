import connectDB from '@/lib/mongodb';
import Discovery from '@/models/Discovery';
import VerificationRecord from '@/models/VerificationRecord';
import { Category, VerificationStatus } from '@/types';

export interface DeduplicationMatchResult {
  isDuplicate: boolean;
  isUncertainMatch: boolean;
  matchedDiscoveryId?: string;
  matchedTitle?: string;
  similarityScore: number;
  reason?: string;
}

export async function detectDuplicateAndMerge(
  incomingTitle: string,
  category: Category,
  district: string,
  locationName: string,
  sourceUrl: string,
  platform: string,
  author: string,
  evidenceUrl?: string
): Promise<DeduplicationMatchResult> {
  await connectDB();

  // Find discoveries in the same category or district
  const candidates = await Discovery.find({
    $or: [{ category }, { district }],
  })
    .select('title category district locationName sources evidenceImages confirmationsCount verificationStatus')
    .lean();

  let highestScore = 0;
  let bestMatch: any = null;

  const normalizedIncoming = normalizeText(incomingTitle);
  const incomingTokens = new Set(tokenize(incomingTitle));

  for (const cand of candidates) {
    const candTitle = String(cand.title);
    const normalizedCand = normalizeText(candTitle);

    // 1. Direct URL Match (same source already added)
    const hasSameUrl = cand.sources?.some((s: any) => s.url === sourceUrl);
    if (hasSameUrl) {
      return {
        isDuplicate: true,
        isUncertainMatch: false,
        matchedDiscoveryId: String(cand._id),
        matchedTitle: candTitle,
        similarityScore: 1.0,
        reason: 'Identical source URL already recorded for this dossier',
      };
    }

    // 2. Token Jaccard Overlap
    const candTokens = new Set(tokenize(candTitle));
    const incomingArr = Array.from(incomingTokens);
    const candArr = Array.from(candTokens);
    const intersection = new Set(incomingArr.filter((x) => candTokens.has(x)));
    const union = new Set(incomingArr.concat(candArr));
    const jaccard = union.size > 0 ? intersection.size / union.size : 0;

    // 3. Substring / Levenshtein Distance Ratio
    const stringSimilarity = computeDiceCoefficient(normalizedIncoming, normalizedCand);

    // 4. Location match bonus
    const locationBonus =
      cand.district && cand.district.toLowerCase() === district.toLowerCase() ? 0.15 : 0;

    const totalScore = Math.max(jaccard, stringSimilarity) + locationBonus;

    if (totalScore > highestScore) {
      highestScore = totalScore;
      bestMatch = cand;
    }
  }

  // Thresholds:
  // >= 0.65 -> High confidence Duplicate, perform Canonical Merge
  // 0.45 - 0.64 -> Uncertain match, flag potential duplicate relationship
  // < 0.45 -> Distinct new discovery

  if (highestScore >= 0.65 && bestMatch) {
    const discoveryId = String(bestMatch._id);

    // Perform Canonical Merge
    await mergeSourceIntoDiscovery(discoveryId, {
      url: sourceUrl,
      platform,
      author,
      title: incomingTitle,
      evidenceUrl,
    });

    return {
      isDuplicate: true,
      isUncertainMatch: false,
      matchedDiscoveryId: discoveryId,
      matchedTitle: bestMatch.title,
      similarityScore: Math.round(highestScore * 100) / 100,
      reason: `Canonical match found with "${bestMatch.title}" (${Math.round(highestScore * 100)}% similarity)`,
    };
  }

  if (highestScore >= 0.45 && bestMatch) {
    return {
      isDuplicate: false,
      isUncertainMatch: true,
      matchedDiscoveryId: String(bestMatch._id),
      matchedTitle: bestMatch.title,
      similarityScore: Math.round(highestScore * 100) / 100,
      reason: `Possible duplicate relationship detected with "${bestMatch.title}" (${Math.round(highestScore * 100)}%)`,
    };
  }

  return {
    isDuplicate: false,
    isUncertainMatch: false,
    similarityScore: Math.round(highestScore * 100) / 100,
  };
}

async function mergeSourceIntoDiscovery(
  discoveryId: string,
  newSource: {
    url: string;
    platform: string;
    author: string;
    title: string;
    evidenceUrl?: string;
  }
) {
  const updateQuery: any = {
    $inc: {
      confirmationsCount: 1,
    },
    $push: {
      sources: {
        platform: newSource.platform,
        url: newSource.url,
        author: newSource.author,
        timestamp: new Date().toISOString(),
      },
    },
  };

  // Add evidence image if novel and provided
  if (newSource.evidenceUrl) {
    updateQuery.$addToSet = {
      evidenceImages: {
        url: newSource.evidenceUrl,
        caption: `Corroborating sighting reported by ${newSource.author} on ${newSource.platform}`,
        type: 'screenshot',
      },
    };
  }

  const updated = await Discovery.findByIdAndUpdate(discoveryId, updateQuery, { new: true });

  // If confirmations reach >= 3, automatically upgrade status to 'corroborated'
  if (updated && updated.confirmationsCount >= 3 && updated.verificationStatus === 'unverified') {
    await Discovery.findByIdAndUpdate(discoveryId, {
      $set: {
        verificationStatus: 'corroborated' as VerificationStatus,
        verificationReason: `Cross-corroborated by ${updated.confirmationsCount} independent community sources across multiple platforms.`,
      },
    });
  }

  // Create audit verification record
  await VerificationRecord.create({
    discoveryId,
    statusAssigned: 'corroborated',
    previousStatus: updated?.verificationStatus || 'unverified',
    confidenceScore: 85,
    corroboratingSources: [
      {
        sourceUrl: newSource.url,
        platform: newSource.platform,
        corroboratedAt: new Date(),
        reliabilityWeight: 1,
      },
    ],
    reasoning: `Merged corroborating source report "${newSource.title}" by ${newSource.author}`,
    createdAt: new Date(),
  });
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b(gta\s*6|gta\s*vi|grand\s*theft\s*auto\s*6|in|the|at|a|an)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter((w) => w.length > 2);
}

function computeDiceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const getBigrams = (str: string) => {
    const s = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      s.add(str.substring(i, i + 2));
    }
    return s;
  };

  const bgA = getBigrams(a);
  const bgB = getBigrams(b);
  let intersection = 0;

  bgA.forEach((bi) => {
    if (bgB.has(bi)) intersection++;
  });

  return (2 * intersection) / (bgA.size + bgB.size);
}
