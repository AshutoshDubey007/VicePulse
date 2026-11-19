import connectDB from '@/lib/mongodb';
import { executeAutonomousReconPipeline } from './pipeline';
import { expandResearchQueriesFromDiscovery, penalizeLowYieldQueries } from './queryGenerator';
import { runViceCityApiSync } from '@/lib/viceCityApi/syncService';
import EngineConfig, { getEngineConfig } from '@/models/EngineConfig';
import ResearchJob from '@/models/ResearchJob';
import ProcessingLog from '@/models/ProcessingLog';
import Discovery from '@/models/Discovery';
import ApiSyncState, { getOrCreateSyncState } from '@/models/ApiSyncState';

class AutonomousResearchScheduler {
  private timer: NodeJS.Timeout | null = null;
  private isJobRunning = false;
  private isApiSyncRunning = false;
  private lastRunTime?: Date;
  private nextRunTime?: Date;
  private consecutiveFailures = 0;

  constructor() {
    // Initialized as a singleton
  }

  public init() {
    if (this.timer) return;

    console.log('[AutonomousScheduler] Initializing unified background research & API sync scheduler daemon...');
    
    // Check every 60 seconds whether a scheduled job is due
    this.timer = setInterval(() => {
      this.tick().catch((err) => {
        console.error('[AutonomousScheduler] Error in scheduler tick:', err);
      });
    }, 60 * 1000);

    // Initial check after 10s warmup
    setTimeout(() => {
      this.tick().catch(() => {});
    }, 10000);
  }

  public async getStatus() {
    await connectDB();
    const config = await getEngineConfig();
    const syncState = await getOrCreateSyncState();

    const apiIntervalMs = (config.apiSyncIntervalHours || 12) * 60 * 60 * 1000;
    const discoveryIntervalMs = (config.discoverySearchIntervalHours || 3) * 60 * 60 * 1000;

    const nextApiSync = syncState.lastSuccessfulSync
      ? new Date(new Date(syncState.lastSuccessfulSync).getTime() + apiIntervalMs)
      : new Date(Date.now() + 60000);

    return {
      isRunning: Boolean(this.timer),
      isJobCurrentlyExecuting: this.isJobRunning,
      isApiSyncExecuting: this.isApiSyncRunning,
      isPaused: config.researchEnginePaused,
      lastRunAt: this.lastRunTime,
      nextScheduledRunAt: this.nextRunTime || new Date(Date.now() + discoveryIntervalMs),
      lastApiSyncAt: syncState.lastSuccessfulSync,
      nextScheduledApiSyncAt: nextApiSync,
      apiPlan: syncState.plan,
      totalApiRecords: syncState.totalApiRecords,
      intervals: {
        apiSyncHours: config.apiSyncIntervalHours || 12,
        newsSearchHours: config.newsSearchIntervalHours || 2,
        discoverySearchHours: config.discoverySearchIntervalHours || 3,
        redditMonitoringHours: config.redditMonitoringIntervalHours || 4,
        queryExpansionHours: config.queryExpansionIntervalHours || 6,
        corroborationHours: config.corroborationIntervalHours || 12,
      },
      consecutiveFailures: this.consecutiveFailures,
    };
  }

  public async triggerManualRun(triggerName: string = 'manual') {
    if (this.isJobRunning) {
      throw new Error('A research sweep is already actively executing. Please wait for completion.');
    }

    console.log(`[AutonomousScheduler] Manual recon trigger invoked (${triggerName}).`);
    return this.executePipeline('manual');
  }

  public async triggerManualApiSync() {
    if (this.isApiSyncRunning) {
      throw new Error('An API synchronization is already in progress.');
    }

    console.log('[AutonomousScheduler] Manual API Sync trigger invoked.');
    this.isApiSyncRunning = true;
    try {
      const report = await runViceCityApiSync();
      return report;
    } finally {
      this.isApiSyncRunning = false;
    }
  }

  private async tick() {
    await connectDB();
    const config = await getEngineConfig();

    if (config.researchEnginePaused) {
      return;
    }

    // Task 1: Check GTA VI API Synchronization schedule (Every 12-24h)
    await this.checkAndExecuteApiSync(config);

    // Task 2: Check Reconnaissance & News Pipeline schedule (Every 2-4h)
    await this.checkAndExecuteReconPipeline(config);
  }

  private async checkAndExecuteApiSync(config: any) {
    if (this.isApiSyncRunning) return;

    const syncState = await getOrCreateSyncState();
    const intervalMs = (config.apiSyncIntervalHours || 12) * 60 * 60 * 1000;
    const now = Date.now();

    if (syncState.lastSuccessfulSync) {
      const elapsed = now - new Date(syncState.lastSuccessfulSync).getTime();
      if (elapsed < intervalMs) {
        return;
      }
    }

    console.log('[AutonomousScheduler] Scheduled GTA VI API synchronization due. Launching sync...');
    this.isApiSyncRunning = true;
    try {
      await runViceCityApiSync();
      config.lastApiSyncRun = new Date();
      await config.save();
    } catch (syncErr: any) {
      console.warn('[AutonomousScheduler] Scheduled API sync warning:', syncErr.message);
    } finally {
      this.isApiSyncRunning = false;
    }
  }

  private async checkAndExecuteReconPipeline(config: any) {
    if (this.isJobRunning) return;

    // Determine when the last scheduled/manual job ran
    const lastJob: any = await ResearchJob.findOne({ status: { $in: ['completed', 'running'] } })
      .sort({ startedAt: -1 })
      .lean();

    const intervalMs = (config.discoverySearchIntervalHours || 3) * 60 * 60 * 1000;
    const now = Date.now();

    if (lastJob) {
      const lastRunMs = new Date(lastJob.startedAt).getTime();
      const elapsed = now - lastRunMs;

      this.lastRunTime = new Date(lastJob.startedAt);
      this.nextRunTime = new Date(lastRunMs + intervalMs);

      // Check if interval has passed
      if (elapsed < intervalMs) {
        return;
      }
    } else {
      this.nextRunTime = new Date(now + intervalMs);
    }

    // Execute scheduled pipeline
    await this.executePipeline('scheduled');
  }

  private async executePipeline(trigger: 'scheduled' | 'manual'): Promise<any> {
    this.isJobRunning = true;
    this.lastRunTime = new Date();

    try {
      console.log(`[AutonomousScheduler] Launching Autonomous Recon Pipeline (trigger: ${trigger})...`);
      const result = await executeAutonomousReconPipeline(trigger);

      this.consecutiveFailures = 0;

      // Periodically trigger query expansion based on newly created discoveries
      try {
        const recentDiscoveries: any[] = await Discovery.find()
          .sort({ createdAt: -1 })
          .limit(2)
          .lean();

        for (const disc of recentDiscoveries) {
          await expandResearchQueriesFromDiscovery(disc.title, disc.category, disc.district);
        }

        await penalizeLowYieldQueries();
      } catch (expErr) {
        console.warn('[AutonomousScheduler] Post-sweep query expansion notice:', expErr);
      }

      return result;
    } catch (err: unknown) {
      this.consecutiveFailures++;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[AutonomousScheduler] Execution error (Attempt #${this.consecutiveFailures}):`, errorMsg);

      // Backoff schedule calculation on error
      const backoffMinutes = Math.min(60, Math.pow(2, this.consecutiveFailures) * 5);
      this.nextRunTime = new Date(Date.now() + backoffMinutes * 60 * 1000);

      await ProcessingLog.create({
        level: 'error',
        phase: 'search',
        message: `Scheduler job failure backoff (${backoffMinutes} min): ${errorMsg}`,
      });

      throw err;
    } finally {
      this.isJobRunning = false;
    }
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[AutonomousScheduler] Scheduler daemon stopped.');
    }
  }
}

// Export global singleton instance
export const autonomousScheduler = new AutonomousResearchScheduler();

// Automatically start scheduler in production or server environment
if (typeof window === 'undefined') {
  autonomousScheduler.init();
}
