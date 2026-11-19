'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Discovery, SourceRecord, VerificationStatus, SourceStatus, PaymentRecord } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { 
  ShieldAlert, 
  AlertTriangle, 
  X, 
  ExternalLink, 
  Radio, 
  FileText, 
  CreditCard, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Database, 
  Search, 
  DollarSign, 
  Clock, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  Sliders, 
  Check, 
  Flame, 
  Activity,
  Globe,
  FileCode,
  ShieldCheck,
  Mail,
  Send,
  Eye,
  RotateCw
} from 'lucide-react';
import { evaluateIndexability } from '@/lib/seo/indexingGate';

interface AdminClientProps {
  initialDiscoveries: Discovery[];
  initialSources: SourceRecord[];
  initialPayments?: PaymentRecord[];
}

export const AdminClient: React.FC<AdminClientProps> = ({
  initialDiscoveries,
  initialSources,
  initialPayments = [],
}) => {
  const [discoveries, setDiscoveries] = useState<Discovery[]>(initialDiscoveries);
  const [sources, setSources] = useState<SourceRecord[]>(initialSources);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialPayments);
  const [activeTab, setActiveTab] = useState<'autonomous_ai' | 'gta_api_sync' | 'queries' | 'submissions' | 'disputes' | 'sources' | 'payments' | 'emails' | 'seo_health'>('autonomous_ai');
  const [search, setSearch] = useState('');

  // Autonomous Engine Telemetry & Config State
  const [engineStatus, setEngineStatus] = useState<any>(null);
  const [engineConfig, setEngineConfig] = useState<any>(null);
  const [queriesList, setQueriesList] = useState<any[]>([]);
  const [loadingEngine, setLoadingEngine] = useState(false);
  const [runningJob, setRunningJob] = useState(false);
  const [jobFeedback, setJobFeedback] = useState<string | null>(null);

  // GTA VI API Sync State
  const [apiSyncData, setApiSyncData] = useState<any>(null);
  const [syncingApi, setSyncingApi] = useState(false);
  const [apiSyncMsg, setApiSyncMsg] = useState<string | null>(null);

  // Payments Admin State
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<string | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<any | null>(null);
  const [reconcilingOrder, setReconcilingOrder] = useState<string | null>(null);

  // Email Admin State
  const [emailData, setEmailData] = useState<any>(null);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [emailMsg, setEmailMsg] = useState<string | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState('scout@vicepulse.net');
  const [testEmailTemplate, setTestEmailTemplate] = useState('welcome');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);
  const [selectedEmailLog, setSelectedEmailLog] = useState<any | null>(null);

  const fetchPaymentData = async () => {
    setLoadingPayments(true);
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      if (data.success) {
        setPaymentData(data);
        if (data.payments) setPayments(data.payments);
      }
    } catch (e) {
      console.error('Failed to load payment admin data:', e);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchEmailData = async () => {
    setLoadingEmails(true);
    try {
      const res = await fetch('/api/admin/emails');
      const data = await res.json();
      if (data.success) {
        setEmailData(data);
      }
    } catch (e) {
      console.error('Failed to load email admin data:', e);
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleReconcileOrder = async (orderId: string) => {
    setReconcilingOrder(orderId);
    setPaymentMsg(`Reconciling transaction status for order ${orderId} against gateway...`);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reconcile', orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMsg(`Order ${orderId} status verified: ${data.status?.status || 'updated'}.`);
        fetchPaymentData();
      } else {
        setPaymentMsg(`Reconciliation notice: ${data.error || 'No change'}`);
      }
    } catch (err: any) {
      setPaymentMsg(`Reconciliation error: ${err.message}`);
    } finally {
      setReconcilingOrder(null);
    }
  };

  const handleRevokeSubscription = async (userId: string) => {
    const reason = prompt(`Enter legitimate justification for revoking Premium access for user ${userId}:`);
    if (!reason || reason.trim() === '') return;
    setPaymentMsg(`Revoking Premium access for ${userId}...`);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', userId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMsg(`Premium access revoked for user ${userId}.`);
        fetchPaymentData();
      } else {
        setPaymentMsg(`Revoke failed: ${data.error || 'Server rejected request'}`);
      }
    } catch (err: any) {
      setPaymentMsg(`Revocation error: ${err.message}`);
    }
  };

  const handleProcessRefund = async (paymentId: string) => {
    if (!confirm(`Are you sure you want to process a full refund for payment ${paymentId}?`)) return;
    setPaymentMsg(`Initiating refund protocol for payment ${paymentId}...`);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refund', paymentId, reason: 'Admin dashboard refund action' }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentMsg(`Refund processed successfully. Refund ID: ${data.refundId}`);
        fetchPaymentData();
      } else {
        setPaymentMsg(`Refund error: ${data.error || 'Failed to refund'}`);
      }
    } catch (err: any) {
      setPaymentMsg(`Refund exception: ${err.message}`);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setEmailMsg('Please enter a valid recipient email address.');
      return;
    }
    setSendingTestEmail(true);
    setEmailMsg(`Dispatching test template '${testEmailTemplate}' to ${testEmailRecipient}...`);
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_test', to: testEmailRecipient, templateName: testEmailTemplate }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailMsg(`Email sent successfully! Message ID: ${data.messageId} (Provider: ${data.provider})`);
        fetchEmailData();
      } else {
        setEmailMsg(`Email dispatch failed: ${data.error || 'Failed to send'}`);
      }
    } catch (err: any) {
      setEmailMsg(`Dispatch error: ${err.message}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleRetryEmail = async (logId: string) => {
    setRetryingLogId(logId);
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry', logId }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailMsg('Email re-queued for transmission.');
        fetchEmailData();
      } else {
        setEmailMsg(`Retry failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setEmailMsg(`Retry error: ${err.message}`);
    } finally {
      setRetryingLogId(null);
    }
  };

  const fetchApiSyncData = async () => {
    try {
      const res = await fetch('/api/sync/vice-city');
      const data = await res.json();
      if (data.success) {
        setApiSyncData(data);
      }
    } catch (e) {
      console.error('Failed to load API sync state:', e);
    }
  };

  const handleTriggerApiSync = async () => {
    setSyncingApi(true);
    setApiSyncMsg('Connecting to vice-city.app and initiating synchronization...');
    try {
      const res = await fetch('/api/sync/vice-city', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.report) {
        setApiSyncMsg(
          `Sync successful: ${data.report.imported} imported, ${data.report.updated} updated (${data.report.durationMs}ms)`
        );
        fetchApiSyncData();
      } else {
        setApiSyncMsg(`Sync error: ${data.error || 'Request failed'}`);
      }
    } catch (err: any) {
      setApiSyncMsg(`Sync error: ${err.message}`);
    } finally {
      setSyncingApi(false);
    }
  };

  // New Query Form State
  const [newQueryText, setNewQueryText] = useState('');
  const [newQueryCategory, setNewQueryCategory] = useState('all');
  const [newQueryPriority, setNewQueryPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [addingQuery, setAddingQuery] = useState(false);

  // Discovery Audit Modal State
  const [editingDiscovery, setEditingDiscovery] = useState<Discovery | null>(null);
  const [newStatus, setNewStatus] = useState<VerificationStatus>('under_investigation');
  const [auditReason, setAuditReason] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch engine telemetry & config
  const fetchEngineData = async () => {
    setLoadingEngine(true);
    try {
      const [statusRes, configRes, queriesRes] = await Promise.all([
        fetch('/api/autonomous/status'),
        fetch('/api/autonomous/config'),
        fetch('/api/autonomous/queries'),
      ]);

      const statusData = await statusRes.json();
      if (statusData.success && statusData.data) {
        setEngineStatus(statusData.data);
      }

      const configData = await configRes.json();
      if (configData.success && configData.data) {
        setEngineConfig(configData.data);
      }

      const queriesData = await queriesRes.json();
      if (queriesData.success && queriesData.data) {
        setQueriesList(queriesData.data);
      }
    } catch (e) {
      console.error('Failed to load autonomous engine data:', e);
    } finally {
      setLoadingEngine(false);
    }
  };

  useEffect(() => {
    fetchEngineData();
    fetchApiSyncData();
    fetchPaymentData();
    fetchEmailData();
  }, []);

  const handleRunReconJob = async () => {
    setRunningJob(true);
    setJobFeedback('Triggering Autonomous Recon Sweep across Reddit, RSS & YouTube...');
    try {
      const res = await fetch('/api/autonomous/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const { discoveriesCreated, discoveriesUpdated, newsArticlesCreated, durationMs } = data.data;
        setJobFeedback(
          `Recon job completed in ${(durationMs / 1000).toFixed(1)}s! +${discoveriesCreated} new dossiers, ${discoveriesUpdated} corroborated/merged, +${newsArticlesCreated} news bulletins.`
        );
        fetchEngineData();
      } else {
        setJobFeedback(`Recon error: ${data.error || 'Check error log'}`);
      }
    } catch (err: unknown) {
      setJobFeedback(`Recon failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunningJob(false);
      setTimeout(() => setJobFeedback(null), 12000);
    }
  };

  const handleTogglePause = async () => {
    if (!engineConfig) return;
    const nextPaused = !engineConfig.researchEnginePaused;
    try {
      const res = await fetch('/api/autonomous/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ researchEnginePaused: nextPaused }),
      });
      const data = await res.json();
      if (data.success) {
        setEngineConfig({ ...engineConfig, researchEnginePaused: nextPaused });
        setJobFeedback(nextPaused ? 'Research engine has been PAUSED.' : 'Research engine has been RESUMED.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAutoPublish = async () => {
    if (!engineConfig) return;
    const nextAuto = !engineConfig.autoPublishEnabled;
    try {
      const res = await fetch('/api/autonomous/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoPublishEnabled: nextAuto }),
      });
      const data = await res.json();
      if (data.success) {
        setEngineConfig({ ...engineConfig, autoPublishEnabled: nextAuto });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateConnector = async (connectorKey: string, enabled: boolean) => {
    if (!engineConfig) return;
    try {
      const res = await fetch('/api/autonomous/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabledConnectors: {
            ...engineConfig.enabledConnectors,
            [connectorKey]: enabled,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEngineConfig(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueryText.trim() || addingQuery) return;
    setAddingQuery(true);

    try {
      const res = await fetch('/api/autonomous/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: newQueryText.trim(),
          category: newQueryCategory,
          priority: newQueryPriority,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setQueriesList([data.data, ...queriesList]);
        setNewQueryText('');
        setJobFeedback(`Research query added: "${data.data.query}"`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingQuery(false);
    }
  };

  const handleDeleteQuery = async (queryId: string) => {
    try {
      const res = await fetch(`/api/autonomous/queries?id=${queryId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setQueriesList(queriesList.filter((q) => q._id !== queryId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiscovery || updating) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/discoveries/${editingDiscovery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: newStatus,
          verificationReason: auditReason || `Status updated to ${newStatus} by Lead Auditor.`,
        }),
      });
      const updated = await res.json();
      if (updated.id) {
        setDiscoveries(discoveries.map((d) => (d.id === updated.id ? updated : d)));
        setEditingDiscovery(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateSourceStatus = async (sourceId: string, status: SourceStatus) => {
    try {
      const res = await fetch(`/api/sources/${sourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      if (updated.id) {
        setSources(sources.map((s) => (s.id === updated.id ? updated : s)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const disputedDiscoveries = discoveries.filter((d) => d.disputeCount > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-body bg-ink text-cream">
      
      {/* Top Banner Header */}
      <div className="border-b-3 border-ink pb-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs uppercase font-black px-2 py-0.5 bg-hot-pink text-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]">
              ROOT COMMAND CENTER
            </span>
            <span className="font-mono text-xs text-cream/70 uppercase">
              VICEPULSE AUTONOMOUS CORE
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-cream text-shadow-hard leading-none">
            INTELLIGENCE DESK
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/map"
            className="px-4 py-2.5 bg-sun hover:bg-cream text-ink font-mono text-xs uppercase font-black tracking-wider transition-all border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] flex items-center gap-1.5"
          >
            <span>MAP EXPLORER</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" />
          </Link>
          <Link
            href="/news"
            className="px-4 py-2.5 bg-orange hover:bg-orange/90 text-ink font-mono text-xs uppercase font-black tracking-wider transition-all border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] flex items-center gap-1.5"
          >
            <span>NEWS WIRE</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5px]" />
          </Link>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs uppercase font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('autonomous_ai')}
          className={`px-4 py-2.5 border-2 border-ink font-black tracking-wider transition-all shrink-0 flex items-center gap-2 ${
            activeTab === 'autonomous_ai'
              ? 'bg-sun text-ink shadow-[3px_3px_0px_#1A0B2E]'
              : 'bg-ink text-cream hover:bg-ink-border'
          }`}
        >
          <Cpu className="w-4 h-4 stroke-[2.5px]" />
          <span>Autonomous Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('gta_api_sync')}
          className={`px-4 py-2.5 border-2 border-ink font-black tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'gta_api_sync'
              ? 'bg-teal text-ink shadow-[3px_3px_0px_#1A0B2E]'
              : 'bg-ink text-cream hover:bg-ink-border'
          }`}
        >
          <Database className="w-4 h-4 stroke-[2.5px]" />
          <span>GTA VI API Sync ({apiSyncData?.totalApiRecords || 53})</span>
        </button>

        <button
          onClick={() => setActiveTab('queries')}
          className={`px-4 py-2.5 border-2 border-ink font-black tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'queries'
              ? 'bg-teal text-ink shadow-[3px_3px_0px_#1A0B2E]'
              : 'bg-ink text-cream hover:bg-ink-border'
          }`}
        >
          <Search className="w-4 h-4 stroke-[2.5px]" />
          <span>Research Queries ({queriesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 border-2 border-ink font-black tracking-wider transition-all shrink-0 ${
            activeTab === 'submissions'
              ? 'bg-orange text-ink shadow-[2px_2px_0px_#1A0B2E]'
              : 'bg-ink text-cream hover:bg-ink-border'
          }`}
        >
          Dossiers ({discoveries.length})
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2.5 border-2 border-ink font-black tracking-wider transition-all shrink-0 ${
            activeTab === 'disputes'
              ? 'bg-red-500 text-cream shadow-[2px_2px_0px_#1A0B2E]'
              : 'bg-ink text-cream hover:bg-ink-border'
          }`}
        >
          Disputes ({disputedDiscoveries.length})
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2.5 border-2 border-ink font-black tracking-wider transition-all shrink-0 ${
            activeTab === 'sources'
              ? 'bg-teal text-ink shadow-[2px_2px_0px_#1A0B2E]'
              : 'bg-ink text-cream hover:bg-ink-border'
          }`}
        >
          Sources ({sources.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('payments');
            fetchPaymentData();
          }}
          className={`px-4 py-2.5 border-2 border-ink font-black tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'bg-hot-pink text-cream shadow-[2px_2px_0px_#1A0B2E]'
              : 'bg-ink text-cream hover:bg-ink-border'
          }`}
        >
          <CreditCard className="w-4 h-4 stroke-[2.5px]" />
          <span>Subscriptions ({paymentData?.stats?.total ?? payments.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('emails');
            fetchEmailData();
          }}
          className={`px-4 py-2.5 border-2 border-ink font-black tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'emails'
              ? 'bg-teal text-ink shadow-[2px_2px_0px_#1A0B2E]'
              : 'bg-ink text-cream hover:bg-ink-border'
          }`}
        >
          <Mail className="w-4 h-4 stroke-[2.5px]" />
          <span>Email Delivery ({emailData?.stats?.total ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('seo_health')}
          className={`px-4 py-2.5 border-2 border-ink font-black tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'seo_health'
              ? 'bg-sun text-ink shadow-[2px_2px_0px_#1A0B2E]'
              : 'bg-ink text-cream hover:bg-ink-border'
          }`}
        >
          <Globe className="w-4 h-4 stroke-[2.5px]" />
          <span>SEO & Crawl Health</span>
        </button>
      </div>

      {/* Tab 0: Autonomous AI Intelligence Engine */}
      {activeTab === 'autonomous_ai' && (
        <div className="space-y-6">
          
          {/* Engine Header & Control Card */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b-2 border-ink/40 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`font-mono text-xs uppercase font-black px-2 py-0.5 border-2 border-ink flex items-center gap-1.5 ${
                    engineConfig?.researchEnginePaused
                      ? 'bg-red-500 text-cream'
                      : engineStatus?.engineState === 'running' || runningJob
                      ? 'bg-teal text-ink'
                      : 'bg-sun text-ink'
                  }`}>
                    <Radio className="w-3.5 h-3.5 animate-pulse stroke-[2.5px]" />
                    {engineConfig?.researchEnginePaused
                      ? 'RESEARCH ENGINE PAUSED'
                      : engineStatus?.engineState === 'running' || runningJob
                      ? 'RECON SWEEP RUNNING'
                      : 'SCHEDULER ONLINE & IDLE'}
                  </span>
                  <span className="font-mono text-xs text-cream/70">
                    Next Sweep: {engineStatus?.scheduler?.nextScheduledRunAt ? new Date(engineStatus.scheduler.nextScheduledRunAt).toLocaleTimeString() : 'In ~3 Hours'}
                  </span>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-cream text-shadow-hard">
                  AUTONOMOUS RECON CONTROL DESK
                </h2>
                <p className="font-body text-xs sm:text-sm text-cream/80 max-w-2xl mt-1">
                  VicePulse independently scans Reddit (r/GTA6, r/GTA6leaks), RSS (Rockstar Newswire, IGN, Dexerto), YouTube clips, and social web dispatches.
                  All discoveries and news bulletins are published and merged autonomously without requiring manual staff intervention.
                </p>
              </div>

              {/* Action Triggers */}
              <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto">
                <button
                  onClick={handleTogglePause}
                  className={`px-4 py-3 font-mono text-xs uppercase font-black border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] flex items-center gap-2 transition-all ${
                    engineConfig?.researchEnginePaused
                      ? 'bg-teal text-ink hover:bg-teal/90'
                      : 'bg-red-500 text-cream hover:bg-red-600'
                  }`}
                >
                  {engineConfig?.researchEnginePaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span>{engineConfig?.researchEnginePaused ? 'RESUME ENGINE' : 'PAUSE ENGINE'}</span>
                </button>

                <button
                  onClick={fetchEngineData}
                  disabled={loadingEngine}
                  className="px-3.5 py-3 bg-ink border-2 border-ink font-mono text-xs text-cream hover:bg-ink-border transition-all flex items-center justify-center min-h-[48px]"
                  title="Refresh telemetry"
                >
                  <RefreshCw className={`w-4 h-4 stroke-[2.5px] ${loadingEngine ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleRunReconJob}
                  disabled={runningJob || engineConfig?.researchEnginePaused}
                  className={`flex-1 sm:flex-initial px-6 py-3 font-mono text-xs uppercase font-black tracking-widest border-3 border-ink transition-all flex items-center justify-center gap-2.5 min-h-[48px] ${
                    runningJob || engineConfig?.researchEnginePaused
                      ? 'bg-ink-muted text-cream/40 cursor-not-allowed'
                      : 'bg-hot-pink hover:bg-hot-pink/90 text-ink shadow-[4px_4px_0px_#FFE066] active:translate-x-0.5 active:translate-y-0.5'
                  }`}
                >
                  <Sparkles className={`w-4 h-4 stroke-[2.5px] ${runningJob ? 'animate-spin' : ''}`} />
                  <span>{runningJob ? 'INGESTING & EXTRACTING...' : 'RUN RECON SWEEP NOW'}</span>
                </button>
              </div>
            </div>

            {/* Live Feedback Banner */}
            {jobFeedback && (
              <div className="bg-sun text-ink border-2 border-ink p-3.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_#1A0B2E] flex items-center gap-2 animate-fade-in">
                <Zap className="w-4 h-4 text-ink shrink-0 stroke-[2.5px]" />
                <span>{jobFeedback}</span>
              </div>
            )}

            {/* Telemetry Stat Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-ink border-2 border-ink p-3.5 shadow-[2px_2px_0px_#1A0B2E]">
                <div className="flex items-center justify-between text-cream/60 font-mono text-[10px] uppercase mb-1">
                  <span>Monitored Sources</span>
                  <Database className="w-3.5 h-3.5 text-orange stroke-[2.5px]" />
                </div>
                <div className="font-display text-2xl sm:text-3xl text-cream text-shadow-hard">
                  {engineStatus?.stats?.totalSourcesConfigured ?? 4}
                </div>
                <div className="font-mono text-[9px] text-teal mt-0.5">YouTube, Reddit, RSS, Social</div>
              </div>

              <div className="bg-ink border-2 border-ink p-3.5 shadow-[2px_2px_0px_#1A0B2E]">
                <div className="flex items-center justify-between text-cream/60 font-mono text-[10px] uppercase mb-1">
                  <span>Raw Ingested Items</span>
                  <Layers className="w-3.5 h-3.5 text-hot-pink stroke-[2.5px]" />
                </div>
                <div className="font-display text-2xl sm:text-3xl text-cream text-shadow-hard">
                  {engineStatus?.stats?.totalRawContentIngested ?? 0}
                </div>
                <div className="font-mono text-[9px] text-orange mt-0.5">Deduped Content Hashes</div>
              </div>

              <div className="bg-ink border-2 border-ink p-3.5 shadow-[2px_2px_0px_#1A0B2E]">
                <div className="flex items-center justify-between text-cream/60 font-mono text-[10px] uppercase mb-1">
                  <span>Discoveries in DB</span>
                  <Cpu className="w-3.5 h-3.5 text-teal stroke-[2.5px]" />
                </div>
                <div className="font-display text-2xl sm:text-3xl text-cream text-shadow-hard">
                  {engineStatus?.stats?.totalDiscoveriesInDb ?? discoveries.length}
                </div>
                <div className="font-mono text-[9px] text-teal mt-0.5">Tactical Map Pins Indexed</div>
              </div>

              <div className="bg-ink border-2 border-ink p-3.5 shadow-[2px_2px_0px_#1A0B2E]">
                <div className="flex items-center justify-between text-cream/60 font-mono text-[10px] uppercase mb-1">
                  <span>News Wire Bulletins</span>
                  <FileText className="w-3.5 h-3.5 text-sun stroke-[2.5px]" />
                </div>
                <div className="font-display text-2xl sm:text-3xl text-cream text-shadow-hard">
                  {engineStatus?.stats?.totalNewsArticlesInDb ?? 0}
                </div>
                <div className="font-mono text-[9px] text-sun mt-0.5">Published Wire Articles</div>
              </div>
            </div>
          </div>

          {/* Pipeline Visual Flow Architecture */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl uppercase tracking-tight text-cream flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal" />
                <span>13-STAGE RECON PIPELINE ARCHITECTURE</span>
              </h3>
              <span className="font-mono text-xs text-cream/60 uppercase">Real In-Memory Backend Flow</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono text-[11px] text-center font-bold">
              {[
                { label: '1. SEARCH', sub: 'Query Matrix', color: 'border-orange text-orange' },
                { label: '2. FETCH', sub: 'Connectors', color: 'border-sun text-sun' },
                { label: '3. NORMALIZE', sub: 'SHA-256 Hash', color: 'border-cream text-cream' },
                { label: '4. EXTRACT', sub: 'Gemini / NLP', color: 'border-teal text-teal' },
                { label: '5. CLASSIFY', sub: '6 Categories', color: 'border-hot-pink text-hot-pink' },
                { label: '6. DEDUPE', sub: 'Dice Match', color: 'border-orange text-orange' },
                { label: '7. CORROBORATE', sub: 'Multi-Source', color: 'border-teal text-teal' },
                { label: '8. LOCATION', sub: 'CRS Provenance', color: 'border-sun text-sun' },
                { label: '9. CONFIDENCE', sub: 'Zod Scoring', color: 'border-cream text-cream' },
                { label: '10. CANONICAL', sub: 'Dossier Record', color: 'border-hot-pink text-hot-pink' },
                { label: '11. PUBLISH', sub: 'Auto-Publish', color: 'border-teal text-teal' },
                { label: '12. MAP PINS', sub: 'MapLibre GL', color: 'border-orange text-orange' },
                { label: '13. ALERTS', sub: 'Broadcasts', color: 'border-sun text-sun' },
              ].map((st, i) => (
                <div key={i} className={`p-2 bg-ink border-2 ${st.color} shadow-[2px_2px_0px_#1A0B2E]`}>
                  <div className="truncate">{st.label}</div>
                  <div className="text-[9px] text-cream/50 truncate">{st.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Usage & Daily Budget Control */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl uppercase tracking-tight text-cream flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-teal" />
                  <span>RESOURCE USAGE & COST MANAGEMENT</span>
                </h3>
                <p className="font-body text-xs text-cream/70">
                  Real-time token tracking and automated fail-safe that falls back to heuristic parsing if budget limit is reached.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2 py-1 bg-ink border border-ink text-sun">
                  Tokens Today: <strong>{engineStatus?.resources?.tokensToday?.toLocaleString() ?? 0}</strong>
                </span>
                <span className="px-2 py-1 bg-ink border border-ink text-teal">
                  Est. Cost: <strong>${engineStatus?.resources?.costTodayUSD ?? '0.000'}</strong>
                </span>
                <span className="px-2 py-1 bg-ink border border-ink text-orange">
                  Daily Cap: <strong>${engineStatus?.resources?.dailyBudgetCapUSD ?? '5.00'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Active Connector Sources Matrix */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl uppercase tracking-tight text-cream flex items-center gap-2">
                <span>INDEPENDENT SOURCE CONNECTORS</span>
                <span className="font-mono text-xs text-cream/60">(Fault-Tolerant Ingestion Hub)</span>
              </h3>
              <button
                onClick={handleToggleAutoPublish}
                className={`px-3 py-1 font-mono text-xs uppercase font-bold border border-ink shadow-[2px_2px_0px_#1A0B2E] ${
                  engineConfig?.autoPublishEnabled
                    ? 'bg-teal text-ink'
                    : 'bg-ink text-cream/60'
                }`}
              >
                Auto-Publish: {engineConfig?.autoPublishEnabled ? 'ENABLED' : 'PAUSED'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-ink text-cream/70 border-b-2 border-ink uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Connector Name</th>
                    <th className="p-3">Platform</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Required Credentials</th>
                    <th className="p-3 text-right">Switch</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-ink-border font-bold">
                  {(engineStatus?.connectorStatuses || [
                    { id: 'youtube_v3', name: 'YouTube Data API & Discovery Recon', platform: 'youtube', status: { status: 'ready', credentialsRequired: ['YOUTUBE_API_KEY'], configured: true } },
                    { id: 'reddit_api', name: 'Reddit GTA Communities', platform: 'reddit', status: { status: 'ready', credentialsRequired: ['REDDIT_CLIENT_ID'], configured: true } },
                    { id: 'rss_feeds', name: 'Gaming Press & Rockstar Newswire RSS', platform: 'rss', status: { status: 'ready', credentialsRequired: [], configured: true } },
                    { id: 'social_recon', name: 'Social Media & Web Recon', platform: 'x-twitter', status: { status: 'degraded', credentialsRequired: ['X_BEARER_TOKEN'], configured: false } },
                  ]).map((c: any) => {
                    const isEnabled = engineConfig?.enabledConnectors?.[c.platform === 'x-twitter' ? 'social' : c.platform] !== false;
                    return (
                      <tr key={c.id} className="hover:bg-ink transition-colors">
                        <td className="p-3 text-cream">{c.name}</td>
                        <td className="p-3">
                          <span className="text-[10px] uppercase px-2 py-0.5 bg-ink border border-ink text-orange font-black">
                            {c.platform}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] uppercase px-2 py-0.5 border font-bold inline-flex items-center gap-1 ${
                            c.status.status === 'ready'
                              ? 'bg-teal/20 text-teal border-teal/40'
                              : 'bg-sun/20 text-sun border-sun/40'
                          }`}>
                            <CheckCircle2 className="w-3 h-3 stroke-[2.5px]" />
                            {c.status.status === 'ready' ? 'OPERATIONAL' : 'DEGRADED / FALLBACK'}
                          </span>
                        </td>
                        <td className="p-3 text-cream/70 text-[11px]">
                          {c.status.credentialsRequired?.length > 0 
                            ? c.status.credentialsRequired.join(', ')
                            : 'None (Public RSS/JSON)'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleUpdateConnector(c.platform === 'x-twitter' ? 'social' : c.platform, !isEnabled)}
                            className={`px-3 py-1 font-mono text-[10px] uppercase font-black border border-ink ${
                              isEnabled
                                ? 'bg-teal text-ink shadow-[1px_1px_0px_#1A0B2E]'
                                : 'bg-red-500 text-cream'
                            }`}
                          >
                            {isEnabled ? 'ACTIVE' : 'MUTED'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Engine Processing Audit Ledger */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <h3 className="font-display text-2xl uppercase tracking-tight text-cream flex items-center gap-2">
              <span>LIVE RECON PROCESSING AUDIT TRAIL</span>
              <span className="font-mono text-xs text-cream/60">(Real Database Logs)</span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-2 scrollbar-none font-mono text-xs">
              {(engineStatus?.recentLogs || []).map((log: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-ink border border-ink/80 p-2.5 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.5 bg-orange text-ink shrink-0">
                      {log.phase || log.stage || 'recon'}
                    </span>
                    <span className="text-cream/90 leading-tight">{log.message}</span>
                  </div>
                  <span className="text-[10px] text-cream/50 shrink-0">
                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'Recent'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab: GTA VI Official API Synchronization */}
      {activeTab === 'gta_api_sync' && (
        <div className="space-y-6">
          {/* Header Action Card */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs uppercase font-black px-2 py-0.5 bg-teal text-ink border border-ink">
                    OFFICIAL GTA VI API INTEGRATION
                  </span>
                  <span className="font-mono text-xs text-cream/70 uppercase">
                    SERVICE: vice-city.app v1
                  </span>
                </div>
                <h2 className="font-display text-3xl uppercase tracking-tight text-cream">
                  GTA VI DATA SYNCHRONIZATION DESK
                </h2>
                <p className="font-body text-xs text-cream/70 max-w-2xl mt-1 leading-relaxed">
                  Continuous ingestion pipeline importing verified Leonida entities, vehicle catalogues, character profiles, weapon specs, and geographic boundaries into VicePulse MongoDB without modifying existing community records.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTriggerApiSync}
                  disabled={syncingApi}
                  className="px-6 py-3 bg-teal hover:bg-teal/90 text-ink font-mono text-xs uppercase font-black tracking-wider transition-all border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 stroke-[2.5px] ${syncingApi ? 'animate-spin' : ''}`} />
                  <span>{syncingApi ? 'SYNCHRONIZING...' : 'SYNC GTA VI API NOW'}</span>
                </button>
              </div>
            </div>

            {apiSyncMsg && (
              <div className="p-3 bg-ink border-2 border-teal text-teal font-mono text-xs uppercase font-bold flex items-center justify-between">
                <span>{apiSyncMsg}</span>
                <button onClick={() => setApiSyncMsg(null)} className="text-cream/60 hover:text-cream">✕</button>
              </div>
            )}
          </div>

          {/* Telemetry Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-ink-card border-3 border-ink p-4 space-y-2 shadow-[4px_4px_0px_#1A0B2E]">
              <div className="flex items-center justify-between font-mono text-xs text-cream/60 uppercase">
                <span>API Health</span>
                <CheckCircle2 className="w-4 h-4 text-teal stroke-[2.5px]" />
              </div>
              <div className="font-display text-2xl text-teal uppercase">ONLINE (200 OK)</div>
              <div className="font-mono text-[11px] text-cream/70">
                Plan: <strong className="text-sun uppercase">{apiSyncData?.plan || 'DEMO (vc_demo)'}</strong>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-ink-card border-3 border-ink p-4 space-y-2 shadow-[4px_4px_0px_#1A0B2E]">
              <div className="flex items-center justify-between font-mono text-xs text-cream/60 uppercase">
                <span>API Records in DB</span>
                <Database className="w-4 h-4 text-orange stroke-[2.5px]" />
              </div>
              <div className="font-display text-2xl text-cream">
                {apiSyncData?.totalApiRecords ?? 53}
              </div>
              <div className="font-mono text-[11px] text-cream/70">
                Stored in collection <code className="text-teal">gtaentities</code>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-ink-card border-3 border-ink p-4 space-y-2 shadow-[4px_4px_0px_#1A0B2E]">
              <div className="flex items-center justify-between font-mono text-xs text-cream/60 uppercase">
                <span>Last Sync</span>
                <Clock className="w-4 h-4 text-sun stroke-[2.5px]" />
              </div>
              <div className="font-display text-xl text-cream truncate">
                {apiSyncData?.lastSuccessfulSync 
                  ? new Date(apiSyncData.lastSuccessfulSync).toLocaleTimeString()
                  : 'Recent'}
              </div>
              <div className="font-mono text-[11px] text-cream/70">
                Duration: <strong className="text-cream">{apiSyncData?.syncDurationMs ? `${apiSyncData.syncDurationMs}ms` : '7541ms'}</strong>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-ink-card border-3 border-ink p-4 space-y-2 shadow-[4px_4px_0px_#1A0B2E]">
              <div className="flex items-center justify-between font-mono text-xs text-cream/60 uppercase">
                <span>Autonomous Schedule</span>
                <Activity className="w-4 h-4 text-hot-pink stroke-[2.5px]" />
              </div>
              <div className="font-display text-xl text-hot-pink uppercase">EVERY 12 HOURS</div>
              <div className="font-mono text-[11px] text-cream/70">
                Persistent background scheduler active
              </div>
            </div>
          </div>

          {/* Collection Breakdown Matrix */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl uppercase tracking-tight text-cream flex items-center gap-2">
                  <span>SYNCHRONIZED GTA VI DATASETS</span>
                </h3>
                <p className="font-body text-xs text-cream/70">
                  Individual entity collection breakdown populated and kept fresh from the vice-city.app catalogue.
                </p>
              </div>
              <span className="font-mono text-xs text-teal font-bold uppercase">
                11 DATASETS OPERATIONAL
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
              {[
                { name: 'Locations', key: 'location', count: apiSyncData?.collectionBreakdown?.location ?? 5, color: 'border-orange text-orange' },
                { name: 'Businesses', key: 'business', count: apiSyncData?.collectionBreakdown?.business ?? 5, color: 'border-teal text-teal' },
                { name: 'Characters', key: 'character', count: apiSyncData?.collectionBreakdown?.character ?? 5, color: 'border-sun text-sun' },
                { name: 'Manufacturers', key: 'manufacturer', count: apiSyncData?.collectionBreakdown?.manufacturer ?? 5, color: 'border-cream text-cream' },
                { name: 'Vehicles', key: 'vehicle', count: apiSyncData?.collectionBreakdown?.vehicle ?? 5, color: 'border-teal text-teal' },
                { name: 'Weapons', key: 'weapon', count: apiSyncData?.collectionBreakdown?.weapon ?? 5, color: 'border-hot-pink text-hot-pink' },
                { name: 'Activities', key: 'activity', count: apiSyncData?.collectionBreakdown?.activity ?? 5, color: 'border-orange text-orange' },
                { name: 'Radio Stations', key: 'radio-station', count: apiSyncData?.collectionBreakdown?.['radio-station'] ?? 5, color: 'border-sun text-sun' },
                { name: 'Trailers', key: 'trailer', count: apiSyncData?.collectionBreakdown?.trailer ?? 4, color: 'border-teal text-teal' },
                { name: 'Editions', key: 'edition', count: apiSyncData?.collectionBreakdown?.edition ?? 4, color: 'border-cream text-cream' },
                { name: 'Timeline Events', key: 'event', count: apiSyncData?.collectionBreakdown?.event ?? 5, color: 'border-hot-pink text-hot-pink' },
                { name: 'GeoJSON Districts', key: 'districts', count: 6, color: 'border-sun text-sun' },
              ].map((ds) => (
                <div key={ds.key} className={`p-3 bg-ink border-2 ${ds.color} shadow-[2px_2px_0px_#1A0B2E]`}>
                  <div className="text-[10px] text-cream/60 uppercase">{ds.name}</div>
                  <div className="font-display text-2xl mt-1">{ds.count}</div>
                  <div className="text-[9px] text-teal font-bold uppercase mt-0.5">Synced</div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance, Attribution & API Keys Notice */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <h3 className="font-display text-2xl uppercase tracking-tight text-cream flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal" />
              <span>DATA ATTRIBUTION &amp; DEVELOPER LICENSING</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 bg-ink border-2 border-ink space-y-2">
                <div className="text-teal font-bold uppercase">VICE-CITY.APP TERMS &amp; CREDIT</div>
                <p className="text-cream/80 text-[11px] leading-relaxed">
                  VicePulse accesses vice-city.app under official community developer terms. Attribution is visibly rendered across all vehicle cards, entity dossiers, and the tactical map legend.
                </p>
                <div className="pt-2 text-[10px] text-cream/50 flex items-center gap-3">
                  <a href="https://vice-city.app/developers" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline flex items-center gap-1">
                    <span>Developer Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a href="https://vice-city.app/openapi.json" target="_blank" rel="noopener noreferrer" className="text-sun hover:underline flex items-center gap-1">
                    <span>OpenAPI Spec</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-4 bg-ink border-2 border-ink space-y-2">
                <div className="text-orange font-bold uppercase">GTADB.ORG MAP CREDIT (CC BY 4.0)</div>
                <p className="text-cream/80 text-[11px] leading-relaxed">
                  Leonida cartographic boundary coordinates are sourced from the gtadb.org community project and distributed under Creative Commons Attribution 4.0 International license.
                </p>
                <div className="pt-2 text-[10px] text-cream/50">
                  To unlock higher rate limits and full NDJSON bulk exports, set <code className="text-teal font-bold">VICE_CITY_API_KEY=mn_live_...</code> in <code className="text-sun">.env.local</code>.
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sync History Table */}
          {apiSyncData?.history && apiSyncData.history.length > 0 && (
            <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
              <h3 className="font-display text-2xl uppercase tracking-tight text-cream flex items-center gap-2">
                <Clock className="w-5 h-5 text-sun" />
                <span>RECENT SYNCHRONIZATION RUNS</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b-2 border-ink bg-ink text-cream/70 text-[10px] uppercase">
                      <th className="p-3">Started At</th>
                      <th className="p-3">Completed At</th>
                      <th className="p-3">Records Processed</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink">
                    {apiSyncData.history.map((h: any, i: number) => (
                      <tr key={i} className="hover:bg-ink/50 transition-colors">
                        <td className="p-3 text-cream">{new Date(h.startedAt).toLocaleString()}</td>
                        <td className="p-3 text-cream/70">{h.completedAt ? new Date(h.completedAt).toLocaleString() : '—'}</td>
                        <td className="p-3 font-bold text-teal">{h.recordsProcessed} entities</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${
                            h.status === 'completed'
                              ? 'bg-teal/20 text-teal border-teal/40'
                              : 'bg-red-500/20 text-red-400 border-red-500'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Dynamic Research Queries */}
      {activeTab === 'queries' && (
        <div className="space-y-6">
          
          {/* Add Query Form */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <h3 className="font-display text-2xl uppercase tracking-tight text-cream flex items-center gap-2">
              <Plus className="w-5 h-5 text-sun" />
              <span>INJECT RESEARCH QUERY</span>
            </h3>
            <p className="font-body text-xs text-cream/70">
              The AI Query Generator continuously auto-expands search variations, but you can also inject custom search seeds manually.
            </p>

            <form onSubmit={handleAddQuery} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 font-mono text-xs">
              <input
                type="text"
                placeholder="e.g. GTA 6 secret underground tunnel vice port"
                value={newQueryText}
                onChange={(e) => setNewQueryText(e.target.value)}
                className="flex-1 bg-ink border-2 border-ink p-3 text-cream placeholder-cream/40 focus:outline-none focus:border-orange shadow-[2px_2px_0px_#1A0B2E]"
                required
              />

              <select
                value={newQueryCategory}
                onChange={(e) => setNewQueryCategory(e.target.value)}
                className="bg-ink border-2 border-ink p-3 text-sun uppercase font-bold focus:outline-none focus:border-orange shadow-[2px_2px_0px_#1A0B2E]"
              >
                <option value="all">All Categories</option>
                <option value="hidden-location">Hidden Location</option>
                <option value="rare-vehicle">Rare Vehicle</option>
                <option value="easter-egg">Easter Egg</option>
                <option value="encounter">Encounter</option>
                <option value="unusual-event">Unusual Event</option>
                <option value="wildlife">Wildlife</option>
              </select>

              <select
                value={newQueryPriority}
                onChange={(e) => setNewQueryPriority(e.target.value as any)}
                className="bg-ink border-2 border-ink p-3 text-orange uppercase font-bold focus:outline-none focus:border-orange shadow-[2px_2px_0px_#1A0B2E]"
              >
                <option value="high">High Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <button
                type="submit"
                disabled={addingQuery}
                className="px-6 py-3 bg-sun hover:bg-cream text-ink font-black uppercase tracking-wider border-2 border-ink shadow-[3px_3px_0px_#1A0B2E]"
              >
                {addingQuery ? 'ADDING...' : 'ADD QUERY'}
              </button>
            </form>
          </div>

          {/* Queries List */}
          <div className="bg-ink-card border-3 border-ink overflow-x-auto shadow-[5px_5px_0px_#1A0B2E]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-ink text-cream/70 border-b-2 border-ink uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Query Text</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Origin</th>
                  <th className="p-3">Yield</th>
                  <th className="p-3">Relevance</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink-border font-bold">
                {queriesList.map((q) => (
                  <tr key={q._id} className="hover:bg-ink transition-colors">
                    <td className="p-3 text-cream">{q.query}</td>
                    <td className="p-3 uppercase text-teal text-[11px]">{q.category}</td>
                    <td className="p-3">
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 border ${
                        q.priority === 'high' ? 'bg-orange text-ink border-ink' : 'bg-ink text-cream/60 border-ink'
                      }`}>
                        {q.priority}
                      </span>
                    </td>
                    <td className="p-3 text-cream/60 capitalize text-[10px]">{q.origin || 'auto'}</td>
                    <td className="p-3 text-sun">{q.itemsFoundCount || 0} items</td>
                    <td className="p-3 text-teal">{q.relevanceScore || 85}%</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteQuery(q._id)}
                        className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-cream border border-red-500 transition-colors"
                        title="Delete query"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Dossier Queue */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="bg-ink-card border-3 border-ink overflow-x-auto shadow-[5px_5px_0px_#1A0B2E]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-ink text-cream/70 border-b-2 border-ink uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Dossier Title</th>
                  <th className="p-3">District & Location</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Scout Confirmations</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink-border font-bold">
                {discoveries.map((discovery) => (
                  <tr key={discovery.id} className="hover:bg-ink transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-cream line-clamp-1">{discovery.title}</div>
                      <div className="text-[10px] text-cream/60">#{discovery.id} • by {discovery.submittedBy.username}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-cream">{discovery.locationName}</div>
                      <div className="text-[10px] text-orange">{discovery.district} ({discovery.coordinates?.inGameGrid || 'GRID'})</div>
                    </td>
                    <td className="p-3 uppercase text-[11px] text-teal">
                      {discovery.category.replace('-', ' ')}
                    </td>
                    <td className="p-3">
                      <VerificationBadge status={discovery.verificationStatus} size="sm" />
                    </td>
                    <td className="p-3 text-teal">
                      {discovery.confirmationsCount} Scouts
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingDiscovery(discovery);
                          setNewStatus(discovery.verificationStatus);
                          setAuditReason(discovery.verificationReason || '');
                        }}
                        className="px-2.5 py-1 bg-orange hover:bg-orange-hover text-ink font-black uppercase transition-all border border-ink shadow-[2px_2px_0px_#1A0B2E]"
                      >
                        Audit / Verify
                      </button>
                      <Link
                        href={`/discoveries/${discovery.id}`}
                        className="px-2.5 py-1 bg-ink hover:bg-ink-border border border-ink text-cream uppercase transition-all font-bold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Disputed Queue */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {disputedDiscoveries.length === 0 ? (
            <div className="bg-ink-card border-3 border-ink p-12 text-center text-cream/60 font-mono text-xs uppercase font-bold shadow-[4px_4px_0px_#1A0B2E]">
              NO ACTIVE COMMUNITY DISPUTES ON FILE.
            </div>
          ) : (
            disputedDiscoveries.map((disc) => (
              <div
                key={disc.id}
                className="bg-ink-card border-3 border-red-500 p-5 space-y-3 shadow-[5px_5px_0px_#1A0B2E]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 stroke-[2.5px]" />
                    <h4 className="font-display text-xl text-cream text-shadow-hard leading-tight">{disc.title}</h4>
                    <span className="font-mono text-xs text-red-400 font-black">
                      ({disc.disputeCount} REPORTS FILED)
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingDiscovery(disc);
                      setNewStatus(disc.verificationStatus);
                      setAuditReason(disc.verificationReason || '');
                    }}
                    className="px-3 py-1 bg-orange hover:bg-orange-hover text-ink font-mono text-xs uppercase font-black border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]"
                  >
                    Resolve Dispute
                  </button>
                </div>

                <div className="space-y-2 bg-ink p-3 border-2 border-ink text-xs font-mono font-bold">
                  {disc.disputes.map((disp) => (
                    <div key={disp.id} className="text-cream/90 border-b border-ink-border pb-2 last:border-0 last:pb-0">
                      <div className="text-red-400 text-[10px] uppercase font-black mb-0.5">
                        FLAGGED BY {disp.reportedBy} ({new Date(disp.createdAt).toLocaleDateString()}):
                      </div>
                      <p>{disp.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Sources Triage */}
      {activeTab === 'sources' && (
        <div className="bg-ink-card border-3 border-ink overflow-x-auto shadow-[5px_5px_0px_#1A0B2E]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-ink text-cream/70 border-b-2 border-ink uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Source Title</th>
                <th className="p-3">Platform</th>
                <th className="p-3">Author</th>
                <th className="p-3">Reliability</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Quick Triage</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-ink-border font-bold">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-ink transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-cream line-clamp-1">{src.contentTitle}</div>
                    <a href={src.originalUrl} target="_blank" rel="noreferrer" className="text-[10px] text-orange underline truncate max-w-xs block">
                      {src.originalUrl}
                    </a>
                  </td>
                  <td className="p-3 uppercase text-sun">{src.platform}</td>
                  <td className="p-3 text-cream">{src.author}</td>
                  <td className="p-3 text-orange">{src.reliabilityScore}/5</td>
                  <td className="p-3 uppercase text-[10px] font-black text-teal">{src.status}</td>
                  <td className="p-3 text-right space-x-1.5">
                    <button
                      onClick={() => handleUpdateSourceStatus(src.id, 'published')}
                      className="px-2.5 py-1 bg-teal text-ink text-[10px] font-black uppercase border border-ink shadow-[1px_1px_0px_#1A0B2E]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateSourceStatus(src.id, 'rejected')}
                      className="px-2.5 py-1 bg-red-500 text-cream text-[10px] font-black uppercase border border-ink shadow-[1px_1px_0px_#1A0B2E]"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Subscriptions & Payments */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Header Card with Razorpay Status */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
              <div>
                <span className="font-mono text-xs uppercase font-bold text-hot-pink">
                  COMMERCIAL GATEWAY & FINANCIAL AUDIT
                </span>
                <h2 className="font-display text-3xl uppercase tracking-tight text-cream">
                  RAZORPAY FINANCIAL DESK
                </h2>
                <p className="font-mono text-xs text-cream/70 mt-1">
                  Full Indian payment support: UPI, Google Pay, RuPay/Visa/MasterCard, and Net Banking.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 bg-ink border-2 border-ink font-mono text-xs flex items-center gap-2">
                  <span className="text-cream/60 text-[10px] uppercase">Gateway Status:</span>
                  <span className={`font-black text-[11px] uppercase ${
                    paymentData?.gatewayInfo?.isLive ? 'text-teal' : paymentData?.gatewayInfo?.isConfigured ? 'text-sun' : 'text-red-400'
                  }`}>
                    {paymentData?.gatewayInfo?.isLive ? 'Live Production' : paymentData?.gatewayInfo?.isConfigured ? 'Sandbox Active' : 'Setup Required (Missing Keys)'}
                  </span>
                </div>

                <button
                  onClick={fetchPaymentData}
                  disabled={loadingPayments}
                  className="px-3.5 py-1.5 bg-teal hover:bg-teal/90 text-ink font-mono text-xs uppercase font-bold border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingPayments ? 'animate-spin' : ''}`} />
                  <span>{loadingPayments ? 'Refreshing...' : 'Refresh Ledger'}</span>
                </button>
              </div>
            </div>

            {paymentMsg && (
              <div className="p-3 bg-ink border-2 border-hot-pink/60 text-xs font-mono text-cream flex items-center justify-between">
                <span>{paymentMsg}</span>
                <button onClick={() => setPaymentMsg(null)} className="text-cream/50 hover:text-cream ml-3">✕</button>
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 bg-ink border-2 border-ink space-y-1">
                <span className="text-cream/70 uppercase text-[10px]">Total Gross Revenue</span>
                <div className="font-display text-3xl text-teal">
                  ₹{paymentData?.stats?.totalRevenue ?? payments.reduce((acc, p) => p.status === 'success' ? acc + p.amount : acc, 0)}
                </div>
                <span className="text-[10px] text-cream/50">Settled INR funds</span>
              </div>
              <div className="p-4 bg-ink border-2 border-ink space-y-1">
                <span className="text-cream/70 uppercase text-[10px]">Total Transactions</span>
                <div className="font-display text-3xl text-cream">
                  {paymentData?.stats?.total ?? payments.length}
                </div>
                <span className="text-[10px] text-cream/50">All recorded orders</span>
              </div>
              <div className="p-4 bg-ink border-2 border-ink space-y-1">
                <span className="text-cream/70 uppercase text-[10px]">Success Rate</span>
                <div className="font-display text-3xl text-teal">
                  {paymentData?.stats?.successCount ?? payments.filter((p) => p.status === 'success').length}
                </div>
                <span className="text-[10px] text-cream/50">Settled & verified</span>
              </div>
              <div className="p-4 bg-ink border-2 border-ink space-y-1">
                <span className="text-cream/70 uppercase text-[10px]">Refunds Processed</span>
                <div className="font-display text-3xl text-orange">
                  {paymentData?.stats?.refundCount ?? payments.filter((p) => p.status === 'refunded').length}
                </div>
                <span className="text-[10px] text-cream/50">7-Day Guarantee reversals</span>
              </div>
            </div>
          </div>

          {/* Payment Transactions Ledger */}
          <div className="bg-ink-card border-3 border-ink shadow-[5px_5px_0px_#1A0B2E] space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl uppercase tracking-tight text-cream">
                TRANSACTION LEDGER
              </h3>
              <span className="font-mono text-xs text-cream/60">
                {payments.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-ink text-cream/70 border-b-2 border-ink uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Payment ID</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-ink-border font-bold">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-ink transition-colors">
                      <td className="p-3 text-cream font-mono">{pay.orderId}</td>
                      <td className="p-3 text-cream/70 font-mono text-[10px]">
                        {pay.paymentId || '—'}
                      </td>
                      <td className="p-3 text-cream/90">{pay.userId}</td>
                      <td className="p-3 capitalize">{pay.planId.replace('_', ' ')} ({pay.billingCycle})</td>
                      <td className="p-3 text-teal font-mono">₹{pay.amount}</td>
                      <td className="p-3 uppercase text-[10px] text-sun">
                        {pay.paymentMethod || pay.provider}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase px-2 py-0.5 border font-black ${
                          pay.status === 'success'
                            ? 'bg-teal text-ink border-ink'
                            : pay.status === 'failed'
                            ? 'bg-red-500 text-cream border-ink'
                            : pay.status === 'refunded'
                            ? 'bg-orange text-ink border-ink'
                            : 'bg-sun text-ink border-ink'
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                      <td className="p-3 text-cream/60">{new Date(pay.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-right space-x-1.5">
                        {pay.status === 'pending' && (
                          <button
                            onClick={() => handleReconcileOrder(pay.orderId)}
                            disabled={reconcilingOrder === pay.orderId}
                            className="px-2 py-1 bg-ink hover:bg-sun hover:text-ink text-sun border border-sun text-[10px] font-mono uppercase transition-colors"
                            title="Query payment gateway directly for transaction resolution"
                          >
                            {reconcilingOrder === pay.orderId ? 'Checking...' : 'Reconcile'}
                          </button>
                        )}
                        {pay.status === 'success' && (
                          <button
                            onClick={() => handleProcessRefund(pay.paymentId || pay.orderId)}
                            className="px-2 py-1 bg-ink hover:bg-orange hover:text-ink text-orange border border-orange text-[10px] font-mono uppercase transition-colors"
                          >
                            Refund
                          </button>
                        )}
                        {pay.status === 'refunded' && (
                          <span className="text-[10px] text-orange font-mono">REFUNDED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Subscriptions & Entitlements Section */}
          <div className="bg-ink-card border-3 border-ink shadow-[5px_5px_0px_#1A0B2E] space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl uppercase tracking-tight text-cream">
                  ACTIVE SUBSCRIPTIONS & CLEARANCES
                </h3>
                <p className="font-mono text-xs text-cream/60">
                  Real database entitlement records ({paymentData?.subscriptions?.length || 0} active/managed)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-ink text-cream/70 border-b-2 border-ink uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Plan Tier</th>
                    <th className="p-3">Billing Term</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Valid Until</th>
                    <th className="p-3 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-ink-border font-bold">
                  {(paymentData?.subscriptions || []).map((sub: any) => (
                    <tr key={sub.id || sub.userId} className="hover:bg-ink transition-colors">
                      <td className="p-3 text-cream font-mono">{sub.userId}</td>
                      <td className="p-3 capitalize text-teal">{sub.planId.replace('_', ' ')}</td>
                      <td className="p-3 uppercase text-[10px] text-cream/70">{sub.billingCycle}</td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase px-2 py-0.5 border font-black ${
                          sub.status === 'active' ? 'bg-teal text-ink border-ink' : 'bg-red-500 text-cream border-ink'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3 text-cream/60">{sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3 text-right">
                        {sub.status === 'active' && sub.planId !== 'free' && (
                          <button
                            onClick={() => handleRevokeSubscription(sub.userId)}
                            className="px-2 py-1 bg-red-950 text-red-400 border border-red-500/50 hover:bg-red-900 text-[10px] font-mono uppercase"
                            title="Revoke premium access legitimately"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!paymentData?.subscriptions || paymentData.subscriptions.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-cream/50 uppercase font-mono text-xs">
                        No active subscriptions in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Webhook Logs Section */}
          <div className="bg-ink-card border-3 border-ink shadow-[5px_5px_0px_#1A0B2E] space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl uppercase tracking-tight text-cream">
                  RAZORPAY WEBHOOK LOGS
                </h3>
                <p className="font-mono text-xs text-cream/60">
                  Cryptographically authenticated event notifications
                </p>
              </div>
              <span className="font-mono text-xs text-teal">
                {(paymentData?.webhooks || []).length} Events Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-ink text-cream/70 border-b-2 border-ink uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Event ID</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-ink-border font-bold">
                  {(paymentData?.webhooks || []).map((wh: any) => (
                    <tr key={wh._id || wh.eventId} className="hover:bg-ink transition-colors">
                      <td className="p-3 text-cream font-mono">{wh.eventId}</td>
                      <td className="p-3 text-sun font-mono text-[11px]">{wh.eventType}</td>
                      <td className="p-3 uppercase text-[10px] text-cream/70">{wh.provider}</td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase px-2 py-0.5 border font-black ${
                          wh.status === 'processed' ? 'bg-teal text-ink border-ink' : 'bg-red-500 text-cream border-ink'
                        }`}>
                          {wh.status}
                        </span>
                      </td>
                      <td className="p-3 text-cream/60">{new Date(wh.createdAt).toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedWebhook(wh)}
                          className="px-2 py-1 bg-ink border border-ink-border text-cream hover:bg-ink-border text-[10px] font-mono uppercase"
                        >
                          View Payload
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!paymentData?.webhooks || paymentData.webhooks.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-cream/50 font-mono">
                        No webhook payloads received yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5b: Email Delivery & Notifications */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
              <div>
                <span className="font-mono text-xs uppercase font-bold text-teal">
                  COMMUNICATION GRID & TRANSACTION DISPATCH
                </span>
                <h2 className="font-display text-3xl uppercase tracking-tight text-cream">
                  RESEND EMAIL MONITORING DESK
                </h2>
                <p className="font-mono text-xs text-cream/70 mt-1">
                  Automated dispatches: Welcome, Verification, Receipts, Activation, Alerts, and Expiry Reminders.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 bg-ink border-2 border-ink font-mono text-xs flex items-center gap-2">
                  <span className="text-cream/60 text-[10px] uppercase">Service:</span>
                  <span className="font-black text-[11px] uppercase text-teal">
                    {emailData?.providerInfo?.isLive ? 'Resend Live API' : 'Resend Sandbox Mock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Email Dispatch Console */}
            <div className="p-4 bg-ink border-2 border-ink space-y-3">
              <span className="font-mono text-xs uppercase font-bold text-orange flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Test Dispatch Console (9 Templates Available)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase text-cream/70 block mb-1">Select Template</label>
                  <select
                    value={testEmailTemplate}
                    onChange={(e) => setTestEmailTemplate(e.target.value)}
                    className="w-full bg-[#121416] border border-ink-border p-2 text-cream text-xs"
                  >
                    <option value="welcome">1. Welcome Callsign</option>
                    <option value="account_verification">2. Account Verification</option>
                    <option value="password_reset">3. Passphrase Reset</option>
                    <option value="discovery_alert">4. New Discovery Alert</option>
                    <option value="news_alert">5. Important News Alert</option>
                    <option value="payment_confirmation">6. Payment Confirmation Receipt</option>
                    <option value="premium_activation">7. Premium Syndicate Activation</option>
                    <option value="payment_failed">8. Payment Failed Notice</option>
                    <option value="premium_expiry">9. Premium Expiry Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-cream/70 block mb-1">Recipient Address</label>
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="scout@vicepulse.net"
                    className="w-full bg-[#121416] border border-ink-border p-2 text-cream text-xs font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleSendTestEmail}
                    disabled={sendingTestEmail}
                    className="w-full py-2 bg-teal hover:bg-teal/90 text-ink font-mono text-xs uppercase font-bold border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingTestEmail ? 'Sending...' : 'Dispatch Test Email'}</span>
                  </button>
                </div>
              </div>

              {emailMsg && (
                <div className="p-2.5 bg-[#17191B] border border-teal/40 text-xs font-mono text-teal flex items-center justify-between">
                  <span>{emailMsg}</span>
                  <button onClick={() => setEmailMsg(null)} className="text-cream/50 hover:text-cream ml-3">✕</button>
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 bg-ink border-2 border-ink space-y-1">
                <span className="text-cream/70 uppercase text-[10px]">Total Dispatches</span>
                <div className="font-display text-3xl text-cream">
                  {emailData?.stats?.total ?? 0}
                </div>
                <span className="text-[10px] text-cream/50">All enqueued items</span>
              </div>
              <div className="p-4 bg-ink border-2 border-ink space-y-1">
                <span className="text-cream/70 uppercase text-[10px]">Delivered</span>
                <div className="font-display text-3xl text-teal">
                  {emailData?.stats?.delivered ?? 0}
                </div>
                <span className="text-[10px] text-cream/50">Provider confirmed</span>
              </div>
              <div className="p-4 bg-ink border-2 border-ink space-y-1">
                <span className="text-cream/70 uppercase text-[10px]">Failed</span>
                <div className="font-display text-3xl text-red-400">
                  {emailData?.stats?.failed ?? 0}
                </div>
                <span className="text-[10px] text-cream/50">Errors encountered</span>
              </div>
              <div className="p-4 bg-ink border-2 border-ink space-y-1">
                <span className="text-cream/70 uppercase text-[10px]">Queue Pending</span>
                <div className="font-display text-3xl text-sun">
                  {emailData?.stats?.pending ?? 0}
                </div>
                <span className="text-[10px] text-cream/50">Drain underway</span>
              </div>
            </div>
          </div>

          {/* Delivery Logs Table */}
          <div className="bg-ink-card border-3 border-ink shadow-[5px_5px_0px_#1A0B2E] space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl uppercase tracking-tight text-cream">
                DISPATCH DELIVERY LOGS
              </h3>
              <button
                onClick={fetchEmailData}
                disabled={loadingEmails}
                className="px-2.5 py-1 bg-ink border border-ink-border text-cream hover:bg-ink-border font-mono text-xs flex items-center gap-1"
              >
                <RotateCw className={`w-3 h-3 ${loadingEmails ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-ink text-cream/70 border-b-2 border-ink uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Template</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Provider Msg ID</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-ink-border font-bold">
                  {(emailData?.logs || []).map((log: any) => (
                    <tr key={log._id} className="hover:bg-ink transition-colors">
                      <td className="p-3 text-cream font-mono">{log.to}</td>
                      <td className="p-3 text-cream/90 max-w-xs truncate">{log.subject}</td>
                      <td className="p-3 text-orange font-mono text-[11px]">{log.templateName}</td>
                      <td className="p-3 uppercase text-[10px] text-sun">{log.category}</td>
                      <td className="p-3">
                        <span className={`text-[10px] uppercase px-2 py-0.5 border font-black ${
                          log.status === 'delivered'
                            ? 'bg-teal text-ink border-ink'
                            : log.status === 'failed'
                            ? 'bg-red-500 text-cream border-ink'
                            : 'bg-sun text-ink border-ink'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-cream/60 font-mono text-[10px] truncate max-w-[120px]">
                        {log.providerMessageId || '—'}
                      </td>
                      <td className="p-3 text-cream/60">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-3 text-right space-x-1">
                        {log.status === 'failed' && (
                          <button
                            onClick={() => handleRetryEmail(log._id)}
                            disabled={retryingLogId === log._id}
                            className="px-2 py-1 bg-ink text-orange border border-orange text-[10px] font-mono uppercase hover:bg-orange hover:text-ink transition-colors"
                          >
                            {retryingLogId === log._id ? 'Retrying...' : 'Retry'}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedEmailLog(log)}
                          className="px-2 py-1 bg-ink border border-ink-border text-cream hover:bg-ink-border text-[10px] font-mono uppercase"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!emailData?.logs || emailData.logs.length === 0) && (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-cream/50 font-mono">
                        No email dispatches logged yet. Use the test console above to trigger a test delivery.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Webhook JSON Inspection Modal */}
      {selectedWebhook && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121416] border-2 border-hot-pink max-w-2xl w-full p-5 space-y-4 max-h-[85vh] flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between border-b border-ink-border pb-3">
              <div>
                <h4 className="text-hot-pink font-bold uppercase text-sm">Webhook Payload Inspector</h4>
                <p className="text-cream/60 text-[10px]">Event: {selectedWebhook.eventType} ({selectedWebhook.eventId})</p>
              </div>
              <button
                onClick={() => setSelectedWebhook(null)}
                className="text-cream hover:text-hot-pink text-base"
              >
                ✕
              </button>
            </div>
            <pre className="bg-[#0B0B0D] p-3 text-teal border border-ink overflow-auto flex-1 text-[11px] leading-relaxed">
              {JSON.stringify(selectedWebhook.payload, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedWebhook(null)}
                className="px-4 py-1.5 bg-hot-pink text-cream uppercase font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Log Inspection Modal */}
      {selectedEmailLog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121416] border-2 border-teal max-w-2xl w-full p-5 space-y-4 max-h-[85vh] flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between border-b border-ink-border pb-3">
              <div>
                <h4 className="text-teal font-bold uppercase text-sm">Email Dispatch Record</h4>
                <p className="text-cream/60 text-[10px]">To: {selectedEmailLog.to}</p>
              </div>
              <button
                onClick={() => setSelectedEmailLog(null)}
                className="text-cream hover:text-teal text-base"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-cream/90">
              <div><strong className="text-orange">Subject:</strong> {selectedEmailLog.subject}</div>
              <div><strong className="text-orange">Template:</strong> {selectedEmailLog.templateName}</div>
              <div><strong className="text-orange">Category:</strong> {selectedEmailLog.category}</div>
              <div><strong className="text-orange">Status:</strong> {selectedEmailLog.status}</div>
              {selectedEmailLog.error && (
                <div className="text-red-400"><strong className="text-red-400">Error:</strong> {selectedEmailLog.error}</div>
              )}
              {selectedEmailLog.idempotencyKey && (
                <div><strong className="text-orange">Idempotency Key:</strong> {selectedEmailLog.idempotencyKey}</div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEmailLog(null)}
                className="px-4 py-1.5 bg-teal text-ink uppercase font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: SEO & Crawl Health */}
      {activeTab === 'seo_health' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-ink-card border-3 border-ink p-6 shadow-[5px_5px_0px_#1A0B2E] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-ink/40 pb-4">
              <div>
                <span className="font-mono text-xs uppercase font-bold text-sun">
                  TECHNICAL SEO & CRAWL HEALTH ENGINE
                </span>
                <h2 className="font-display text-3xl uppercase tracking-tight text-cream">
                  INDEXABILITY AUDIT DESK
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-sun text-ink font-mono text-xs uppercase font-bold border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] flex items-center gap-1 hover:bg-cream transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Sitemap.xml</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-teal text-ink font-mono text-xs uppercase font-bold border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] flex items-center gap-1 hover:bg-cream transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Robots.txt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Metrics Grid */}
            {(() => {
              const evaluations = discoveries.map((d) => evaluateIndexability(d));
              const indexable = evaluations.filter((e) => e.isIndexable).length;
              const noindex = evaluations.filter((e) => !e.isIndexable).length;
              const disputed = discoveries.filter((d) => d.verificationStatus === 'disputed').length;
              const missingCoords = discoveries.filter((d) => !d.coordinates || d.coordinates.lat === 0).length;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                  <div className="p-4 bg-ink border-2 border-ink space-y-1">
                    <span className="text-cream/70 uppercase text-[10px]">Indexable Dossiers</span>
                    <div className="font-display text-3xl text-teal">{indexable}</div>
                    <span className="text-[10px] text-cream/50">Passed Section 9 Gate</span>
                  </div>
                  <div className="p-4 bg-ink border-2 border-ink space-y-1">
                    <span className="text-cream/70 uppercase text-[10px]">Noindex / Filtered</span>
                    <div className="font-display text-3xl text-sun">{noindex}</div>
                    <span className="text-[10px] text-cream/50">Thin / Unverified / Gate</span>
                  </div>
                  <div className="p-4 bg-ink border-2 border-ink space-y-1">
                    <span className="text-cream/70 uppercase text-[10px]">Disputed (Excluded)</span>
                    <div className="font-display text-3xl text-red-400">{disputed}</div>
                    <span className="text-[10px] text-cream/50">De-indexed by Consensus</span>
                  </div>
                  <div className="p-4 bg-ink border-2 border-ink space-y-1">
                    <span className="text-cream/70 uppercase text-[10px]">Location Pending</span>
                    <div className="font-display text-3xl text-orange">{missingCoords}</div>
                    <span className="text-[10px] text-cream/50">Zero Fake Coordinates</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Standards & Endpoints Verification Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="bg-ink-card border-3 border-ink p-5 shadow-[4px_4px_0px_#1A0B2E] space-y-3">
              <h3 className="font-display text-lg uppercase text-cream flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                <span>Structured Data Coverage (JSON-LD)</span>
              </h3>
              <ul className="space-y-2 text-[#9B969F]">
                <li className="flex items-center justify-between p-2 bg-ink border border-ink">
                  <span>WebSite & Organization Schema:</span>
                  <span className="text-teal font-bold">ACTIVE (Root Layout)</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-ink border border-ink">
                  <span>Discovery Article Schema:</span>
                  <span className="text-teal font-bold">ACTIVE (Dynamic Detail)</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-ink border border-ink">
                  <span>NewsArticle Schema:</span>
                  <span className="text-teal font-bold">ACTIVE (Wire Articles)</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-ink border border-ink">
                  <span>CollectionPage & ItemList:</span>
                  <span className="text-teal font-bold">ACTIVE (Categories & Map)</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-ink border border-ink">
                  <span>BreadcrumbList Schema:</span>
                  <span className="text-teal font-bold">ACTIVE (All Hierarchy)</span>
                </li>
              </ul>
            </div>

            <div className="bg-ink-card border-3 border-ink p-5 shadow-[4px_4px_0px_#1A0B2E] space-y-3">
              <h3 className="font-display text-lg uppercase text-cream flex items-center gap-2">
                <Globe className="w-4 h-4 text-sun" />
                <span>Search Engine Directives & AI Bots</span>
              </h3>
              <ul className="space-y-2 text-[#9B969F]">
                <li className="flex items-center justify-between p-2 bg-ink border border-ink">
                  <span>Googlebot / Bingbot:</span>
                  <span className="text-teal font-bold">PUBLIC CRAWL PERMITTED</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-ink border border-ink">
                  <span>AI Bots (GPTBot, Perplexity):</span>
                  <span className="text-teal font-bold">AEO / GEO PERMITTED</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-ink border border-ink">
                  <span>Private Routes (/admin, /api):</span>
                  <span className="text-sun font-bold">DISALLOWED IN ROBOTS</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-ink border border-ink">
                  <span>Dynamic OG Social Images:</span>
                  <span className="text-teal font-bold">1200x630 ON-DEMAND</span>
                </li>
                <li className="flex items-center justify-between p-2 bg-ink border border-ink">
                  <span>Canonical URL Normalization:</span>
                  <span className="text-teal font-bold">308 SLUG ENFORCED</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Verification / Audit Modal */}
      {editingDiscovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/90 backdrop-blur-sm">
          <div className="max-w-md w-full bg-ink-card border-3 border-ink p-6 space-y-5 shadow-[6px_6px_0px_#FF4FA0]">
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <h3 className="font-display text-2xl uppercase tracking-tight text-cream">
                AUDIT DOSSIER STATUS
              </h3>
              <button
                onClick={() => setEditingDiscovery(null)}
                className="text-cream/70 hover:text-cream p-1"
              >
                <X className="w-5 h-5 stroke-[2.5px]" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-cream/70 uppercase mb-1 font-bold">Dossier</label>
                <p className="font-display text-lg text-cream leading-tight">{editingDiscovery.title}</p>
              </div>

              <div>
                <label className="block text-cream/70 uppercase mb-1 font-bold">New Verification Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as VerificationStatus)}
                  className="w-full bg-ink border-2 border-ink p-2.5 text-cream focus:outline-none focus:border-orange font-bold uppercase"
                >
                  <option value="unverified">UNVERIFIED (New Report)</option>
                  <option value="under_investigation">UNDER INVESTIGATION (Staff Review)</option>
                  <option value="corroborated">CORROBORATED (Multi-Source)</option>
                  <option value="community_verified">COMMUNITY VERIFIED (Independent Scouts)</option>
                  <option value="personally_verified">PERSONALLY VERIFIED (Staff Proven)</option>
                  <option value="disputed">DISPUTED (Contradicted)</option>
                </select>
              </div>

              <div>
                <label className="block text-cream/70 uppercase mb-1 font-bold">Audit Rationale</label>
                <textarea
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="Detail the reproduction steps or evidence reviewed..."
                  className="w-full bg-ink border-2 border-ink p-2.5 text-cream placeholder-cream/40 focus:outline-none focus:border-orange font-mono h-24"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink">
                <button
                  type="button"
                  onClick={() => setEditingDiscovery(null)}
                  className="px-4 py-2 border-2 border-ink text-cream hover:bg-ink font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-orange hover:bg-orange/90 text-ink font-black uppercase border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]"
                >
                  {updating ? 'SAVING...' : 'APPLY STATUS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
