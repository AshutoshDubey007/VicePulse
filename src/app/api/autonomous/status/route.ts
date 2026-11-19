import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ResearchJob from '@/models/ResearchJob';
import ResearchSource from '@/models/ResearchSource';
import SourceContent from '@/models/SourceContent';
import ProcessingLog from '@/models/ProcessingLog';
import Discovery from '@/models/Discovery';
import NewsArticle from '@/models/NewsArticle';
import { autonomousScheduler } from '@/lib/autonomous/scheduler';
import { getResourceTelemetry } from '@/lib/autonomous/resourceManager';
import { ALL_CONNECTORS } from '@/lib/autonomous/connectors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      latestJob,
      recentJobs,
      sources,
      totalSourcesContent,
      pendingSourcesContent,
      totalDiscoveries,
      totalNews,
      recentLogs,
      jobsToday,
      discoveriesCreatedToday,
      schedulerStatus,
      resourceTelemetry,
    ] = await Promise.all([
      ResearchJob.findOne().sort({ startedAt: -1 }).lean(),
      ResearchJob.find().sort({ startedAt: -1 }).limit(10).lean(),
      ResearchSource.find().lean(),
      SourceContent.countDocuments(),
      SourceContent.countDocuments({ processingStatus: 'pending' }),
      Discovery.countDocuments(),
      NewsArticle.countDocuments(),
      ProcessingLog.find().sort({ createdAt: -1 }).limit(15).lean(),
      ResearchJob.find({ startedAt: { $gte: startOfToday } }).lean(),
      Discovery.countDocuments({ createdAt: { $gte: startOfToday } }),
      autonomousScheduler.getStatus().catch(() => ({})),
      getResourceTelemetry().catch(() => ({})),
    ]);

    const isRunning = (latestJob as any)?.status === 'running' || (schedulerStatus as any)?.isJobCurrentlyExecuting;

    // Calculate today's metrics
    let itemsIngestedToday = 0;
    let discoveriesUpdatedToday = 0;
    let failedJobsToday = 0;

    (jobsToday as any[]).forEach((j) => {
      itemsIngestedToday += j.itemsIngested || 0;
      discoveriesUpdatedToday += j.discoveriesUpdated || 0;
      if (j.status === 'failed') failedJobsToday++;
    });

    const connectorStatuses = ALL_CONNECTORS.map((c) => ({
      id: c.id,
      name: c.name,
      platform: c.platform,
      status: c.getStatus(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        engineState: isRunning ? 'running' : (resourceTelemetry as any)?.enginePaused ? 'paused' : 'idle',
        lastJob: latestJob,
        recentJobs,
        sources,
        connectorStatuses,
        scheduler: schedulerStatus,
        resources: resourceTelemetry,
        stats: {
          totalSourcesConfigured: sources.length || connectorStatuses.length,
          totalRawContentIngested: totalSourcesContent,
          pendingProcessing: pendingSourcesContent,
          totalDiscoveriesInDb: totalDiscoveries,
          totalNewsArticlesInDb: totalNews,
          jobsTodayCount: jobsToday.length,
          itemsIngestedToday,
          discoveriesCreatedToday,
          discoveriesUpdatedToday,
          failedJobsToday,
        },
        recentLogs,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
