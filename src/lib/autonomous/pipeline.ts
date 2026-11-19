import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import { runIngestionSweep } from './connectors';
import { extractIntelligenceWithAI } from './aiExtractor';
import { resolveLocationFromText } from './locationResolver';
import { detectDuplicateAndMerge } from './deduplicator';
import { runCorroborationSweepForDiscovery } from './corroborator';
import { expandResearchQueriesFromDiscovery } from './queryGenerator';
import { getResourceTelemetry } from './resourceManager';
import { PipelineExecutionResult, RawContentItem, PipelineStage } from './types';
import SourceContent from '@/models/SourceContent';
import Discovery from '@/models/Discovery';
import NewsArticle from '@/models/NewsArticle';
import ResearchJob from '@/models/ResearchJob';
import ProcessingLog from '@/models/ProcessingLog';
import Notification from '@/models/Notification';
import EngineConfig, { getEngineConfig } from '@/models/EngineConfig';

export async function executeAutonomousReconPipeline(
  trigger: 'scheduled' | 'manual' | 'webhook' = 'manual'
): Promise<PipelineExecutionResult> {
  const startTime = Date.now();
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const errors: string[] = [];

  let sourcesChecked = 0;
  let itemsIngested = 0;
  let discoveriesCreated = 0;
  let discoveriesUpdated = 0;
  let newsArticlesCreated = 0;

  await connectDB();
  const config = await getEngineConfig();

  if (config.researchEnginePaused && trigger !== 'manual') {
    return {
      jobId,
      success: true,
      sourcesChecked: 0,
      itemsIngested: 0,
      discoveriesCreated: 0,
      discoveriesUpdated: 0,
      newsArticlesCreated: 0,
      errors: ['Engine paused via admin dashboard'],
      durationMs: 0,
    };
  }

  // Create active Job record in DB
  const jobDoc = await ResearchJob.create({
    jobId,
    trigger,
    jobType: 'recon_sweep',
    status: 'running',
    currentStage: 'search',
    startedAt: new Date(),
  });

  const stageResults: Record<string, any> = {};

  const logStage = async (stage: PipelineStage, message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    try {
      await ProcessingLog.create({
        stage,
        jobId,
        level,
        phase: stage,
        message,
        timestamp: new Date(),
      });
      await ResearchJob.findByIdAndUpdate(jobDoc._id, { $set: { currentStage: stage } });
    } catch {}
  };

  try {
    // ----------------------------------------------------
    // STAGE 1: SEARCH & FETCH SOURCE
    // ----------------------------------------------------
    await logStage('search', `Stage 1 & 2: Executing search and collecting sources across YouTube, Reddit, RSS & Web...`);
    const sweep = await runIngestionSweep();
    sourcesChecked = sweep.sourcesQueried;
    itemsIngested = sweep.totalItems;
    errors.push(...sweep.errors);

    stageResults['search'] = { status: 'passed', count: sourcesChecked };
    stageResults['fetch_source'] = { status: 'passed', count: itemsIngested };

    await logStage(
      'fetch_source',
      `Gathered ${itemsIngested} items across ${sourcesChecked} sources (${sweep.sourcesFailed} failed/unconfigured).`
    );

    // ----------------------------------------------------
    // STAGE 3-13: ITEM-BY-ITEM PIPELINE EXECUTION
    // ----------------------------------------------------
    for (const item of sweep.items) {
      try {
        await processSingleItem(item, {
          jobId,
          autoPublish: config.autoPublishEnabled,
          onDiscoveryCreated: () => discoveriesCreated++,
          onDiscoveryUpdated: () => discoveriesUpdated++,
          onNewsCreated: () => newsArticlesCreated++,
          logStage,
        });
      } catch (itemErr: unknown) {
        const msg = `Item error (${item.url}): ${itemErr instanceof Error ? itemErr.message : String(itemErr)}`;
        console.warn(msg);
        errors.push(msg);
      }
    }

    const durationMs = Date.now() - startTime;
    const telemetry = await getResourceTelemetry();

    // Mark Job Completed
    await ResearchJob.findByIdAndUpdate(jobDoc._id, {
      $set: {
        status: 'completed',
        currentStage: 'completed',
        sourcesChecked,
        itemsIngested,
        discoveriesCreated,
        discoveriesUpdated,
        newsArticlesCreated,
        tokenUsage: telemetry.tokensToday,
        estimatedCostUSD: telemetry.costTodayUSD,
        durationMs,
        completedAt: new Date(),
      },
    });

    await logStage(
      'publish_or_update',
      `Pipeline complete: +${discoveriesCreated} new dossiers, ${discoveriesUpdated} corroborated/merged, +${newsArticlesCreated} news articles (${durationMs}ms)`
    );

    return {
      jobId,
      success: true,
      sourcesChecked,
      itemsIngested,
      discoveriesCreated,
      discoveriesUpdated,
      newsArticlesCreated,
      tokenUsage: telemetry.tokensToday,
      estimatedCostUSD: telemetry.costTodayUSD,
      errors,
      durationMs,
      stageResults,
    };
  } catch (fatalErr: unknown) {
    const errorMsg = fatalErr instanceof Error ? fatalErr.message : String(fatalErr);
    errors.push(`Pipeline fatal: ${errorMsg}`);

    await ResearchJob.findByIdAndUpdate(jobDoc._id, {
      $set: {
        status: 'failed',
        currentStage: 'failed',
        error: errorMsg,
        durationMs: Date.now() - startTime,
        completedAt: new Date(),
      },
    });

    await logStage('publish_or_update', `Pipeline fatal failure: ${errorMsg}`, 'error');

    return {
      jobId,
      success: false,
      sourcesChecked,
      itemsIngested,
      discoveriesCreated,
      discoveriesUpdated,
      newsArticlesCreated,
      errors,
      durationMs: Date.now() - startTime,
    };
  }
}

async function processSingleItem(
  item: RawContentItem,
  ctx: {
    jobId: string;
    autoPublish: boolean;
    onDiscoveryCreated: () => void;
    onDiscoveryUpdated: () => void;
    onNewsCreated: () => void;
    logStage: (stage: PipelineStage, msg: string) => Promise<void>;
  }
) {
  // STAGE 3: NORMALIZE CONTENT
  const hash = crypto
    .createHash('sha256')
    .update(`${item.canonicalUrl || item.url}_${item.title.trim().toLowerCase()}`)
    .digest('hex');

  const existingSource = await SourceContent.findOne({ hash });
  if (existingSource && existingSource.processingStatus === 'processed') {
    return; // Already processed
  }

  const sourceContentDoc = await SourceContent.findOneAndUpdate(
    { hash },
    {
      $set: {
        url: item.url,
        canonicalUrl: item.canonicalUrl,
        title: item.title,
        platform: item.platform,
        author: item.author,
        rawContent: item.content,
        cleanText: item.content.slice(0, 1000),
        transcript: item.transcript,
        transcriptStatus: item.transcriptStatus || 'unavailable',
        mediaUrls: item.mediaUrls || [],
        videoTimestamps: item.videoTimestamps || [],
        processingStatus: 'pending',
      },
      $setOnInsert: {
        ingestedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  // STAGE 4: EXTRACT INFORMATION & STAGE 5: DETECT DISCOVERIES & STAGE 6: CLASSIFY
  const draft = await extractIntelligenceWithAI(item);

  if (!draft.isRelevant) {
    await SourceContent.findByIdAndUpdate(sourceContentDoc._id, {
      $set: { processingStatus: 'discarded' },
    });
    return;
  }

  // STAGE 9: LOCATION ANALYSIS
  const loc = resolveLocationFromText(
    `${draft.title} ${draft.description} ${draft.district || ''}`,
    draft.locationName || undefined
  );

  // STAGE 7: DUPLICATE DETECTION & MERGING
  const dedupeResult = await detectDuplicateAndMerge(
    draft.title,
    draft.category,
    loc.district,
    loc.locationName,
    item.url,
    item.platform,
    item.author,
    draft.evidenceImages?.[0]?.url
  );

  if (dedupeResult.isDuplicate && dedupeResult.matchedDiscoveryId) {
    ctx.onDiscoveryUpdated();
    await SourceContent.findByIdAndUpdate(sourceContentDoc._id, {
      $set: {
        processingStatus: 'processed',
        extractedDiscoveryId: dedupeResult.matchedDiscoveryId,
      },
    });

    // STAGE 8: CORROBORATION SEARCH
    await runCorroborationSweepForDiscovery(
      dedupeResult.matchedDiscoveryId,
      dedupeResult.matchedTitle || draft.title,
      item.url
    );

    return;
  }

  // STAGE 10: CONFIDENCE ASSESSMENT & VERIFICATION
  const isCoordinatesValid = loc.hasCoordinates && loc.coordinates;
  const initialVerification = draft.confidenceScore >= 85 ? 'reported' : 'unverified';

  // STAGE 11: PUBLISH OR UPDATE (CANONICAL RECORD CREATION)
  const baseSlug = draft.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 60);
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  // Store coordinates ONLY if genuinely supported — NEVER fabricate!
  const finalCoordinates = isCoordinatesValid
    ? loc.coordinates
    : { lat: 0, lng: 0, inGameGrid: 'LOCATION_PENDING' };

  const newDiscovery = await Discovery.create({
    title: draft.title,
    slug,
    category: draft.category,
    subcategory: draft.subcategory,
    locationName: loc.locationName,
    district: loc.district,
    coordinates: finalCoordinates,
    inGameCoordinates: isCoordinatesValid ? loc.inGameCoordinates : undefined,
    coordinateProvenance: isCoordinatesValid ? loc.coordinateProvenance : undefined,
    description: draft.description,
    stepsToFind: draft.stepsToFind,
    inGameTime: draft.inGameTime,
    weather: draft.weather,
    requirements: draft.requirements,
    evidenceImages: draft.evidenceImages,
    source: {
      platform: item.platform,
      url: item.url,
      author: item.author,
      timestamp: item.publishedAt || new Date().toISOString(),
    },
    sources: [
      {
        platform: item.platform,
        url: item.url,
        author: item.author,
        timestamp: item.publishedAt || new Date().toISOString(),
      },
    ],
    verificationStatus: initialVerification,
    verificationReason: `Direct intelligence ingest from ${item.author} (${item.sourceName}). AI confidence: ${draft.confidenceScore}%.`,
    confirmationsCount: 1,
    tags: draft.tags,
    submittedBy: {
      id: 'vicepulse_recon_ai',
      username: 'VicePulse Recon AI',
      role: 'Autonomous AI Agent',
      avatar: '/images/avatars/ai-recon.webp',
    },
    featured: draft.confidenceScore > 90,
  });

  ctx.onDiscoveryCreated();

  // STAGE 8: CORROBORATION SEARCH for newly published discovery
  try {
    await runCorroborationSweepForDiscovery(String(newDiscovery._id), draft.title, item.url);
  } catch {}

  // STAGE 12: MAP UPDATE
  // Discoveries with supported coordinates are immediately indexed and available to MapContainer and TacticalMap

  // STAGE 13: NOTIFICATIONS
  try {
    await Notification.create({
      userId: 'system_broadcast',
      title: `New Intel: ${draft.title}`,
      message: `Autonomous intelligence engine logged a new ${draft.category} discovery in ${loc.district}.`,
      type: 'discovery_status',
      link: `/discoveries/${newDiscovery.id || newDiscovery._id}`,
      read: false,
    });
  } catch {}

  // Create News Article if this is an official wire or major news breakdown
  let newsArticleId: string | undefined;
  if (draft.isNews && draft.newsSummary) {
    try {
      const newsSlug = draft.newsSummary.headline
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 70);

      const newsArticle = await NewsArticle.findOneAndUpdate(
        { slug: newsSlug },
        {
          $setOnInsert: {
            slug: newsSlug,
            title: draft.newsSummary.headline,
            excerpt: draft.newsSummary.excerpt,
            content: draft.newsSummary.editorialArticle,
            category: draft.newsSummary.category,
            tags: draft.tags,
            bannerImage: draft.evidenceImages?.[0]?.url || '/images/hero/vice-city-hero.webp',
            sources: [
              {
                title: item.title,
                url: item.url,
                platform: item.platform,
                publishedAt: item.publishedAt,
              },
            ],
            relatedDiscoveryIds: [newDiscovery._id],
            author: {
              name: 'VicePulse Recon AI',
              role: 'Autonomous Wire Intelligence',
              avatar: '/images/avatars/ai-recon.webp',
            },
            confidenceScore: draft.confidenceScore,
            status: 'published',
            publishedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      ctx.onNewsCreated();
      newsArticleId = String(newsArticle._id);
    } catch {}
  }

  // Mark SourceContent as processed
  await SourceContent.findByIdAndUpdate(sourceContentDoc._id, {
    $set: {
      processingStatus: 'processed',
      extractedDiscoveryId: newDiscovery._id,
      ...(newsArticleId ? { extractedNewsId: newsArticleId } : {}),
    },
  });

  // Trigger query expansion
  try {
    await expandResearchQueriesFromDiscovery(draft.title, draft.category, loc.district);
  } catch {}
}
