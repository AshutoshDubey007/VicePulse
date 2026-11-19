'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Discovery } from '@/types';
import { DiscoveryCard } from '@/components/DiscoveryCard';
import { EmptyState } from '@/components/vice/EmptyState';
import { Flame, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';

interface TrendingClientProps {
  initialDiscoveries: Discovery[];
}

type TrendingTab = 'confirmed' | 'new' | 'disputed';

export const TrendingClient: React.FC<TrendingClientProps> = ({ initialDiscoveries }) => {
  const [activeTab, setActiveTab] = useState<TrendingTab>('confirmed');

  const tabs: Array<{ id: TrendingTab; label: string }> = [
    { id: 'confirmed', label: 'Most Confirmed' },
    { id: 'new', label: 'Recently Added' },
    { id: 'disputed', label: 'Disputed' },
  ];

  const sortedDiscoveries = useMemo(() => {
    const list = [...initialDiscoveries];
    switch (activeTab) {
      case 'new':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'disputed':
        return list.filter((d) => (d.disputeCount || 0) > 0).sort((a, b) => (b.disputeCount || 0) - (a.disputeCount || 0));
      case 'confirmed':
      default:
        return list.sort((a, b) => (b.confirmationsCount || 0) - (a.confirmationsCount || 0));
    }
  }, [initialDiscoveries, activeTab]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-body text-[#F4F0E8] min-h-screen">
      
      {/* Header */}
      <div className="border-b border-[#28272F] pb-6">
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8] leading-none">
          Trending Discoveries
        </h1>
        <p className="font-body text-xs sm:text-sm text-[#9B969F] mt-1">
          Real discoveries ranked by independent community confirmations and field reports.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs uppercase">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors border text-xs ${
                isSelected
                  ? 'bg-[#1C1B20] text-orange border-orange font-bold'
                  : 'bg-[#111114] text-[#9B969F] border-[#28272F] hover:text-[#F4F0E8]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {sortedDiscoveries.length === 0 ? (
        <EmptyState
          title="No trending discoveries yet."
          description="Reports will appear here as field confirmations are logged."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedDiscoveries.map((discovery) => (
            <DiscoveryCard key={discovery.id || discovery.slug} discovery={discovery} />
          ))}
        </div>
      )}

    </div>
  );
};
