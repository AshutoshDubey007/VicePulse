'use client';

import React, { useState, useEffect } from 'react';
import { NotificationPreferences } from '@/types';
import { 
  Bell, 
  ShieldCheck, 
  Check, 
  Save, 
  Compass, 
  Sparkles
} from 'lucide-react';

export const NotificationSettingsClient: React.FC = () => {
  const [settings, setSettings] = useState<NotificationPreferences>({
    userId: 'usr-1',
    marketingEmails: true,
    weeklyDigest: true,
    discoveryUpdates: true,
    commentReplies: true,
    securityAndTransactional: true,
  });

  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/notifications/settings?userId=usr-1')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(console.error);
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (key === 'securityAndTransactional') return; // Immutable
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSavedSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-body bg-ink text-cream">
      
      {/* Header */}
      <div className="border-b-3 border-ink pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase font-black px-2 py-0.5 bg-orange text-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]">
            COMMUNICATION PROTOCOLS
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-cream text-shadow-hard leading-none pt-1">
          NOTIFICATION WIRE PREFERENCES
        </h1>
        <p className="text-sm text-cream/80 max-w-xl font-body">
          Control which field bulletins, discovery updates, and community telemetry reports are delivered to your scout inbox.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-teal text-ink border-2 border-ink font-mono text-xs flex items-center gap-2 font-black shadow-[3px_3px_0px_#1A0B2E]">
          <Check className="w-5 h-5 shrink-0 stroke-[3px]" />
          <span>Notification preferences successfully updated on the surveillance network.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Recon & Discovery Notifications */}
        <div className="bg-ink-card border-3 border-ink p-6 sm:p-8 space-y-6 shadow-[5px_5px_0px_#1A0B2E]">
          <div className="border-b-2 border-ink pb-3 flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange stroke-[2.5px]" />
            <h3 className="font-display text-2xl uppercase tracking-wider text-cream text-shadow-hard">
              01 // FIELD RECONNAISSANCE UPDATES
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]">
              <div>
                <h4 className="font-bold text-sm text-cream">Discovery Audit Verdicts & Verification</h4>
                <p className="text-xs text-cream/70 font-body mt-0.5">
                  Receive an email when your submitted discovery is approved, rejected, or disputed by Lead Auditors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('discoveryUpdates')}
                className={`w-12 h-6 flex items-center p-0.5 border-2 border-ink transition-all shrink-0 ml-4 ${
                  settings.discoveryUpdates ? 'bg-orange justify-end' : 'bg-ink justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-ink border border-cream shadow-sm" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]">
              <div>
                <h4 className="font-bold text-sm text-cream">Field Notes & Comments on Your Reports</h4>
                <p className="text-xs text-cream/70 font-body mt-0.5">
                  Get notified when fellow scouts leave independent confirmations or reply to your field notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('commentReplies')}
                className={`w-12 h-6 flex items-center p-0.5 border-2 border-ink transition-all shrink-0 ml-4 ${
                  settings.commentReplies ? 'bg-orange justify-end' : 'bg-ink justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-ink border border-cream shadow-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Community Digests & News */}
        <div className="bg-ink-card border-3 border-ink p-6 sm:p-8 space-y-6 shadow-[5px_5px_0px_#1A0B2E]">
          <div className="border-b-2 border-ink pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-hot-pink stroke-[2.5px]" />
            <h3 className="font-display text-2xl uppercase tracking-wider text-cream text-shadow-hard">
              02 // COMMUNITY DIGESTS & SURGE BULLETINS
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]">
              <div>
                <h4 className="font-bold text-sm text-cream">Weekly Leonida Intelligence Digest</h4>
                <p className="text-xs text-cream/70 font-body mt-0.5">
                  A weekly executive summary of the top verified easter eggs, vehicle spawns, and map leaks.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('weeklyDigest')}
                className={`w-12 h-6 flex items-center p-0.5 border-2 border-ink transition-all shrink-0 ml-4 ${
                  settings.weeklyDigest ? 'bg-orange justify-end' : 'bg-ink justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-ink border border-cream shadow-sm" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]">
              <div>
                <h4 className="font-bold text-sm text-cream">Platform Announcements & Syndicate Wire</h4>
                <p className="text-xs text-cream/70 font-body mt-0.5">
                  Product updates, new map overlay releases, and syndicate member invitations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('marketingEmails')}
                className={`w-12 h-6 flex items-center p-0.5 border-2 border-ink transition-all shrink-0 ml-4 ${
                  settings.marketingEmails ? 'bg-orange justify-end' : 'bg-ink justify-start'
                }`}
              >
                <div className="w-4 h-4 bg-ink border border-cream shadow-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Essential Security & Billing (Mandatory / Immutable) */}
        <div className="bg-ink-card border-3 border-ink p-6 sm:p-8 space-y-4 shadow-[5px_5px_0px_#1A0B2E]">
          <div className="border-b-2 border-ink pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal stroke-[2.5px]" />
            <h3 className="font-display text-2xl uppercase tracking-wider text-cream text-shadow-hard">
              03 // ESSENTIAL SECURITY & TRANSACTION RECEIPTS
            </h3>
          </div>

          <div className="p-4 bg-ink border-2 border-ink flex items-center justify-between shadow-[2px_2px_0px_#1A0B2E]">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-cream">Account Security & Payment Invoices</h4>
                <span className="font-mono text-[10px] uppercase bg-teal text-ink px-2 py-0.5 border border-ink font-black">
                  MANDATORY
                </span>
              </div>
              <p className="text-xs text-cream/70 font-body mt-1">
                Password resets, login alerts, payment receipts, and subscription renewal notices cannot be disabled for compliance and security reasons.
              </p>
            </div>
            <div className="w-12 h-6 flex items-center justify-end p-0.5 border-2 border-ink bg-teal opacity-75 cursor-not-allowed shrink-0 ml-4">
              <div className="w-4 h-4 bg-ink border border-cream" />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="bg-ink-card p-6 border-3 border-ink flex items-center justify-between shadow-[4px_4px_0px_#1A0B2E]">
          <span className="text-xs font-mono text-cream/70 font-bold uppercase">
            One-click unsubscribe tokens are included in every non-essential email footer.
          </span>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-orange hover:bg-orange-hover text-ink font-mono text-xs uppercase font-black tracking-widest transition-all border-2 border-ink shadow-[3px_3px_0px_#FF4FA0] flex items-center gap-2"
          >
            <Save className="w-4 h-4 stroke-[2.5px]" />
            <span>{loading ? 'SAVING...' : 'SAVE PREFERENCES'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
