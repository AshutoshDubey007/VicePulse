import connectDB from '@/lib/mongodb';
import Discovery from '@/models/Discovery';

export interface DiscoveryRankingScores {
  discoveryId: string;
  trendingScore: number;
  corroborationScore: number;
  evidenceScore: number;
  freshnessScore: number;
}

/**
 * Section 13: Dynamic Ranking Engine
 * Evaluates recency, independent sources, confirmations, and evidence quality.
 * Strictly separates popularity score from verification status.
 */
export async function calculateDiscoveryRankings(): Promise<DiscoveryRankingScores[]> {
  await connectDB();

  const discoveries = await Discovery.find().lean();
  const now = Date.now();
  const results: DiscoveryRankingScores[] = [];

  for (const disc of discoveries) {
    const createdAt = new Date(disc.createdAt || now).getTime();
    const ageInHours = Math.max(1, (now - createdAt) / (1000 * 3600));

    // Freshness decay score (100 for brand new, decays over 14 days)
    const freshnessScore = Math.max(10, Math.round(100 * Math.exp(-ageInHours / 72)));

    // Independent sources count
    const sourcesCount = disc.sources?.length || 1;
    const confirmationsCount = disc.confirmationsCount || 1;

    // Evidence quality (number of verified photos/clips)
    const evidenceCount = disc.evidenceImages?.length || 1;
    const evidenceScore = Math.min(100, evidenceCount * 25);

    // Corroboration score (multi-source proof)
    const corroborationScore = Math.min(100, sourcesCount * 30 + confirmationsCount * 10);

    // Trending score (velocity of confirmations relative to age)
    const confirmationVelocity = (confirmationsCount * 20) / Math.sqrt(ageInHours);
    const trendingScore = Math.round(freshnessScore * 0.4 + confirmationVelocity * 0.4 + corroborationScore * 0.2);

    results.push({
      discoveryId: String(disc._id),
      trendingScore,
      corroborationScore,
      evidenceScore,
      freshnessScore,
    });

    // Update discovery featured flag if trending score is high
    if (trendingScore > 85 && !disc.featured) {
      await Discovery.findByIdAndUpdate(disc._id, { $set: { featured: true } });
    }
  }

  return results;
}
