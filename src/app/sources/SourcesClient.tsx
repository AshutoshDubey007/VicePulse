'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Radio, ExternalLink, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { EmptyState } from '@/components/vice/EmptyState';

interface SourceItem {
  id: string;
  name: string;
  platform: string;
  url: string;
  yieldCount: number;
  reliabilityScore: number;
  lastPolledAt: string | null;
  status: string;
}

interface SourcesClientProps {
  sources: SourceItem[];
}

export const SourcesClient: React.FC<SourcesClientProps> = ({ sources: initialSources }) => {
  const [sources] = useState<SourceItem[]>(initialSources);
  const [search, setSearch] = useState('');

  const filteredSources = sources.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.platform.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-body text-[#F4F0E8] min-h-screen">
      
      {/* Header */}
      <div className="border-b border-[#28272F] pb-6">
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8] leading-none">
          Monitored Sources
        </h1>
        <p className="font-body text-xs sm:text-sm text-[#9B969F] mt-1">
          Active online communities, video channels, and RSS feeds monitored by the autonomous research engine.
        </p>
      </div>

      {/* Sources List */}
      {filteredSources.length === 0 ? (
        <EmptyState
          title="No research sources found."
          description="Autonomous engine sources will appear here once seeded."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="bg-[#1C1B20] border border-[#28272F] rounded-sm p-4 space-y-3"
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="uppercase font-bold text-orange text-[10px] px-1.5 py-0.5 bg-[#111114] border border-[#28272F] rounded-xs">
                  {source.platform}
                </span>
                <span className="text-teal text-[11px] font-bold">
                  {source.yieldCount} Signals Logged
                </span>
              </div>

              <div>
                <h3 className="font-display text-lg uppercase tracking-tight text-[#F4F0E8]">
                  {source.name}
                </h3>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#9B969F] hover:text-orange transition-colors truncate block mt-0.5"
                  >
                    {source.url}
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-[#28272F] flex items-center justify-between text-xs font-mono text-[#9B969F]">
                <span>Reliability: {source.reliabilityScore}/5</span>
                <span className="capitalize text-teal font-bold">{source.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
