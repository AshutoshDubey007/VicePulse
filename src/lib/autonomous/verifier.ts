import { VerificationStatus, SourcePlatform } from '@/types';
import VerificationRecord from '@/models/VerificationRecord';
import Discovery, { IDiscoveryDocument } from '@/models/Discovery';
import { getDistanceInMeters } from '@/lib/coordinates';

export interface VerificationResult {
  isDuplicate: boolean;
  matchedDiscoveryId?: string;
  status: VerificationStatus;
  reasoning: string;
  confirmationsCount: number;
}

export async function verifyAndCrossCorroborate(
  title: string,
  category: string,
  sourceUrl: string,
  platform: SourcePlatform,
  coordinates?: { lat: number; lng: number },
  inGameCoordinates?: { x?: number; y?: number }
): Promise<VerificationResult> {
  // Check for duplicates in MongoDB Atlas
  const existingDiscoveries = await Discovery.find({ category }).limit(100);

  let matched: IDiscoveryDocument | null = null;
  const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, ' ');

  for (const doc of existingDiscoveries) {
    // 1. Text similarity
    const docTitle = doc.title.toLowerCase().replace(/[^a-z0-9]/g, ' ');
    const sharedWords = normalizedTitle
      .split(/\s+/)
      .filter((w: string) => w.length > 3 && docTitle.includes(w));

    if (sharedWords.length >= 3) {
      matched = doc;
      break;
    }

    // 2. Spatial proximity (<250m)
    if (
      coordinates &&
      doc.coordinates &&
      typeof coordinates.lat === 'number' &&
      typeof doc.coordinates.lat === 'number'
    ) {
      const dist = getDistanceInMeters(
        { x: inGameCoordinates?.x, y: inGameCoordinates?.y, lng: coordinates.lng, lat: coordinates.lat },
        { x: doc.inGameCoordinates?.x, y: doc.inGameCoordinates?.y, lng: doc.coordinates.lng, lat: doc.coordinates.lat }
      );

      if (dist > 0 && dist < 250) {
        matched = doc;
        break;
      }
    }
  }

  if (matched) {
    // Update existing discovery with cross-corroboration
    const prevStatus = matched.verificationStatus;
    let newStatus = prevStatus;
    let reasoning = `Corroborated by independent intelligence source: ${platform} (${sourceUrl})`;

    if (prevStatus === 'unverified' || prevStatus === 'under_investigation') {
      newStatus = 'community_verified';
      reasoning = `Promoted to community_verified following cross-platform corroboration from ${platform}.`;
    }

    const updatedConfirmations = (matched.confirmationsCount || 1) + 1;

    await Discovery.findByIdAndUpdate(matched._id, {
      $set: {
        verificationStatus: newStatus,
        verificationReason: reasoning,
      },
      $inc: { confirmationsCount: 1 },
      $addToSet: {
        tags: 'cross-corroborated',
      },
    });

    // Record audit ledger
    try {
      await VerificationRecord.create({
        discoveryId: matched._id,
        claimsCorroborated: [title],
        corroboratingSources: [
          {
            sourceUrl,
            platform,
            corroboratedAt: new Date(),
            reliabilityWeight: platform === 'gaming-press' ? 3 : 2,
          },
        ],
        statusAssigned: newStatus,
        previousStatus: prevStatus,
        confidenceScore: 92,
        reasoning,
      });
    } catch {
      // Non-blocking audit record error
    }

    return {
      isDuplicate: true,
      matchedDiscoveryId: String(matched._id),
      status: newStatus,
      reasoning,
      confirmationsCount: updatedConfirmations,
    };
  }

  // New discovery status assignment
  const initialStatus: VerificationStatus =
    platform === 'gaming-press' ? 'community_verified' : 'under_investigation';
  const initialReasoning =
    platform === 'gaming-press'
      ? 'Initial intelligence validated by verified gaming press reporting.'
      : 'Initial intelligence report ingested via autonomous scout. Pending secondary field corroboration.';

  return {
    isDuplicate: false,
    status: initialStatus,
    reasoning: initialReasoning,
    confirmationsCount: 1,
  };
}
