import type { Discovery } from '@/types';

export type IndexabilityStatus =
  | 'INDEXABLE'
  | 'NOINDEX'
  | 'DRAFT'
  | 'DUPLICATE'
  | 'LOW_VALUE'
  | 'UNPUBLISHED';

export interface IndexabilityEvaluation {
  status: IndexabilityStatus;
  isIndexable: boolean;
  reasons: string[];
  score: number; // 0 to 100 quality indicator
}

/**
 * Evaluates whether a discovery record has sufficient quality, uniqueness,
 * and substance to be indexed by search engines.
 *
 * Implements strict Section 9 Content Quality & Indexing Gate rules:
 * - Prevents indexing of thin, empty, duplicate, or unverified records.
 * - Ensures indexable pages have valid titles, meaningful context, valid source provenance.
 */
export function evaluateIndexability(discovery: Partial<Discovery>): IndexabilityEvaluation {
  const reasons: string[] = [];
  let score = 100;

  if (!discovery) {
    return {
      status: 'NOINDEX',
      isIndexable: false,
      reasons: ['Discovery record is missing or null'],
      score: 0,
    };
  }

  // 1. Title verification
  const title = (discovery.title || '').trim();
  if (!title || title.length < 10) {
    reasons.push('Title is missing or too short (< 10 chars)');
    score -= 35;
  }
  if (title.toLowerCase().startsWith('untitled') || title.toLowerCase() === 'new discovery') {
    reasons.push('Title uses generic placeholder text');
    score -= 30;
  }

  // 2. Description substance
  const desc = (discovery.description || '').trim();
  if (!desc || desc.length < 30) {
    reasons.push('Description lacks meaningful substance (< 30 chars)');
    score -= 35;
  }

  // 3. Source & Provenance
  const sourceUrl = discovery.source?.url;
  const sourceAuthor = discovery.source?.author;
  if (!sourceUrl || !sourceAuthor) {
    reasons.push('Missing verifiable external source reference or creator attribution');
    score -= 20;
  }

  // 4. Verification & Dispute State
  if (discovery.verificationStatus === 'disputed') {
    reasons.push('Discovery is actively disputed by community consensus');
    score -= 40;
  }

  // 5. Evidence Images
  const hasEvidence = Array.isArray(discovery.evidenceImages) && discovery.evidenceImages.length > 0;
  if (!hasEvidence) {
    // Minor penalty, still could be corroborated by text report
    score -= 10;
  }

  // 6. Category validity
  const validCategories = ['hidden-location', 'rare-vehicle', 'easter-egg', 'encounter', 'unusual-event', 'wildlife'];
  if (!discovery.category || !validCategories.includes(discovery.category)) {
    reasons.push('Invalid or unassigned category');
    score -= 25;
  }

  // Determine status
  if (score >= 60 && !discovery.verificationStatus?.includes('disputed')) {
    return {
      status: 'INDEXABLE',
      isIndexable: true,
      reasons: reasons.length ? reasons : ['Meets editorial and provenance criteria for indexing'],
      score: Math.max(0, score),
    };
  }

  if (discovery.verificationStatus === 'disputed') {
    return {
      status: 'NOINDEX',
      isIndexable: false,
      reasons,
      score: Math.max(0, score),
    };
  }

  if (score < 40) {
    return {
      status: 'LOW_VALUE',
      isIndexable: false,
      reasons,
      score: Math.max(0, score),
    };
  }

  return {
    status: 'NOINDEX',
    isIndexable: false,
    reasons,
    score: Math.max(0, score),
  };
}
