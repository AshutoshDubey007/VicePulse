import { IEmailProvider, SendEmailOptions, EmailSendResult } from './types';
import { ResendEmailProvider } from './resend';
import { connectToDatabase } from '@/lib/mongodb';
import EmailLogModel from '@/models/EmailLog';
import NotificationSettingsModel from '@/models/NotificationSettings';

interface QueueJob {
  id: string;
  dbLogId?: string;
  options: SendEmailOptions;
  retriesLeft: number;
  createdAt: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

class EmailQueueService {
  private provider: IEmailProvider;
  private jobs: QueueJob[] = [];
  private sentIdempotencyKeys: Set<string> = new Set();
  private isProcessing = false;
  private maxRetries = 3;

  constructor(provider?: IEmailProvider) {
    this.provider = provider || new ResendEmailProvider();
  }

  isNotificationsEnabled(): boolean {
    const flag = process.env.EMAIL_NOTIFICATIONS_ENABLED;
    if (flag === 'false') return false;
    return true;
  }

  setProvider(provider: IEmailProvider) {
    this.provider = provider;
  }

  getProvider(): IEmailProvider {
    return this.provider;
  }

  // Check user preferences before enqueueing
  async checkUserPreferences(userId: string, category?: string): Promise<boolean> {
    // Transactional, account, and security emails can NEVER be unsubscribed
    if (!category || category === 'security' || category === 'account' || category === 'transactional' || category === 'payment') {
      return true;
    }

    try {
      const conn = await connectToDatabase();
      if (!conn) return true;

      const settings = await NotificationSettingsModel.findOne({ userId }).lean();
      if (!settings) return true;

      if (category === 'marketing' && !(settings as any).marketingEmails) return false;
      if (category === 'community' && !(settings as any).weeklyDigest && !(settings as any).commentReplies) return false;
      if (category === 'discovery' && !(settings as any).discoveryUpdates) return false;
      if (category === 'news' && !(settings as any).discoveryUpdates && !(settings as any).marketingEmails) return false;

      return true;
    } catch (err) {
      console.warn('[EmailQueue] Preference check error, defaulting to allowed:', err);
      return true;
    }
  }

  // Non-blocking enqueue
  async enqueue(options: SendEmailOptions): Promise<{ jobId: string; queued: boolean; duplicateIgnored?: boolean; preferenceBlocked?: boolean }> {
    // 1. Idempotency check: in-memory + database
    if (options.idempotencyKey) {
      if (this.sentIdempotencyKeys.has(options.idempotencyKey)) {
        console.log(`[EmailQueue] Duplicate send ignored (in-memory): ${options.idempotencyKey}`);
        return { jobId: '', queued: false, duplicateIgnored: true };
      }

      try {
        const conn = await connectToDatabase();
        if (conn) {
          const existing = await EmailLogModel.findOne({ idempotencyKey: options.idempotencyKey });
          if (existing && (existing.status === 'delivered' || existing.status === 'sending')) {
            console.log(`[EmailQueue] Duplicate send ignored (database): ${options.idempotencyKey}`);
            this.sentIdempotencyKeys.add(options.idempotencyKey);
            return { jobId: existing._id.toString(), queued: false, duplicateIgnored: true };
          }
        }
      } catch (err) {
        console.warn('[EmailQueue] DB idempotency check error:', err);
      }

      this.sentIdempotencyKeys.add(options.idempotencyKey);
    }

    // 2. Check user notification preferences if userId provided
    if (options.userId) {
      const isAllowed = await this.checkUserPreferences(options.userId, options.category);
      if (!isAllowed) {
        console.log(`[EmailQueue] Notification skipped per user preferences for user ${options.userId} (${options.category})`);
        return { jobId: '', queued: false, preferenceBlocked: true };
      }
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let dbLogId: string | undefined;

    // 3. Persist initial queued log in DB
    try {
      const conn = await connectToDatabase();
      if (conn) {
        const recipient = Array.isArray(options.to) ? options.to.join(', ') : options.to;
        const logDoc = await EmailLogModel.create({
          to: recipient,
          userId: options.userId,
          subject: options.subject,
          templateName: options.templateName || 'custom',
          category: options.category || 'transactional',
          status: 'queued',
          provider: this.provider.name,
          idempotencyKey: options.idempotencyKey,
          retries: 0,
        });
        dbLogId = logDoc._id.toString();
      }
    } catch (err) {
      console.warn('[EmailQueue] Failed to record email log in DB:', err);
    }

    const job: QueueJob = {
      id: jobId,
      dbLogId,
      options,
      retriesLeft: this.maxRetries,
      createdAt: Date.now(),
      status: 'pending',
    };

    this.jobs.push(job);

    // Trigger process in next tick asynchronously
    setTimeout(() => {
      this.processNext();
    }, 40);

    return { jobId, queued: true };
  }

  private async processNext() {
    if (this.isProcessing) return;

    const job = this.jobs.find((j) => j.status === 'pending');
    if (!job) return;

    this.isProcessing = true;
    job.status = 'processing';

    // Update DB status to sending
    if (job.dbLogId) {
      try {
        await EmailLogModel.findByIdAndUpdate(job.dbLogId, { status: 'sending' });
      } catch (e) {
        // ignore
      }
    }

    try {
      const result: EmailSendResult = await this.provider.sendEmail(job.options);

      if (result.success) {
        job.status = 'completed';

        // Update DB status to delivered
        if (job.dbLogId) {
          await EmailLogModel.findByIdAndUpdate(job.dbLogId, {
            status: 'delivered',
            provider: result.provider,
            providerMessageId: result.messageId,
          });
        }
      } else {
        throw new Error(result.error || 'Provider rejected email dispatch');
      }
    } catch (err: any) {
      console.warn(`[EmailQueue] Attempt failed for job ${job.id}: ${err.message}. Retries left: ${job.retriesLeft}`);
      job.retriesLeft -= 1;

      if (job.retriesLeft > 0) {
        job.status = 'pending';
        // Backoff retry: 1s, 2s, 3s
        setTimeout(() => {
          this.processNext();
        }, 1000 * (4 - job.retriesLeft));
      } else {
        job.status = 'failed';
        job.error = err.message;

        if (job.dbLogId) {
          try {
            await EmailLogModel.findByIdAndUpdate(job.dbLogId, {
              status: 'failed',
              error: err.message,
              retries: this.maxRetries,
            });
          } catch (e) {
            // ignore
          }
        }
      }
    } finally {
      this.isProcessing = false;
      // Continue draining queue
      if (this.jobs.some((j) => j.status === 'pending')) {
        setTimeout(() => this.processNext(), 80);
      }
    }
  }

  // Admin Manual Retry for a Failed Email Log
  async retryEmail(logId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const conn = await connectToDatabase();
      if (!conn) return { success: false, error: 'Database unavailable' };

      const log = await EmailLogModel.findById(logId);
      if (!log) return { success: false, error: 'Email log not found' };

      const options: SendEmailOptions = {
        to: log.to,
        subject: log.subject,
        html: `<p>${log.subject}</p>`,
        templateName: log.templateName,
        category: log.category,
        userId: log.userId,
      };

      const { jobId, queued } = await this.enqueue(options);
      if (queued) {
        await EmailLogModel.findByIdAndUpdate(logId, { status: 'queued', error: undefined });
        return { success: true };
      }
      return { success: false, error: 'Failed to re-queue email' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // Get delivery statistics
  async getStats() {
    try {
      const conn = await connectToDatabase();
      if (conn) {
        const [total, delivered, failed, queued] = await Promise.all([
          EmailLogModel.countDocuments(),
          EmailLogModel.countDocuments({ status: 'delivered' }),
          EmailLogModel.countDocuments({ status: 'failed' }),
          EmailLogModel.countDocuments({ status: { $in: ['queued', 'sending'] } }),
        ]);

        return {
          total,
          delivered,
          failed,
          pending: queued,
          inMemoryQueueLength: this.jobs.filter((j) => j.status === 'pending').length,
          idempotencyKeysCount: this.sentIdempotencyKeys.size,
        };
      }
    } catch (e) {
      console.warn('[EmailQueue] Failed to query DB stats, falling back to in-memory:', e);
    }

    return {
      total: this.jobs.length,
      delivered: this.jobs.filter((j) => j.status === 'completed').length,
      failed: this.jobs.filter((j) => j.status === 'failed').length,
      pending: this.jobs.filter((j) => j.status === 'pending').length,
      inMemoryQueueLength: this.jobs.filter((j) => j.status === 'pending').length,
      idempotencyKeysCount: this.sentIdempotencyKeys.size,
    };
  }

  // Query recent email logs
  async getRecentLogs(limit = 50) {
    try {
      const conn = await connectToDatabase();
      if (conn) {
        return await EmailLogModel.find().sort({ createdAt: -1 }).limit(limit).lean();
      }
    } catch (e) {
      console.warn('[EmailQueue] DB log query error:', e);
    }
    return [];
  }

  // Direct synchronous send
  async sendDirect(options: SendEmailOptions): Promise<EmailSendResult> {
    return this.provider.sendEmail(options);
  }
}

// Global Singleton
const globalQueue = global as unknown as { emailQueueService?: EmailQueueService };
export const emailQueue = globalQueue.emailQueueService || new EmailQueueService();
if (process.env.NODE_ENV !== 'production') {
  globalQueue.emailQueueService = emailQueue;
}
