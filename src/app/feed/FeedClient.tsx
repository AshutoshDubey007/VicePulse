'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Discovery, Category } from '@/types';
import { DiscoveryCard } from '@/components/DiscoveryCard';
import { EmptyState } from '@/components/vice/EmptyState';
import { 
  Search, 
  Filter, 
  X,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { parseSearchIntent, scoreDiscoveryRelevance } from '@/lib/search/intentParser';

interface FeedClientProps {
  initialDiscoveries: Discovery[];
}

export const FeedClient: React.FC<FeedClientProps> = ({ initialDiscoveries }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'confirmed' | 'trending'>('newest');
  const [filterOpen, setFilterOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'hidden-location', label: 'Hidden Locations' },
    { id: 'rare-vehicle', label: 'Rare Vehicles' },
    { id: 'easter-egg', label: 'Easter Eggs' },
    { id: 'encounter', label: 'Encounters' },
    { id: 'unusual-event', label: 'Activities' },
    { id: 'wildlife', label: 'Wildlife' },
  ];

  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'verified_only', label: 'Verified Only' },
    { id: 'under_investigation', label: 'Under Investigation' },
    { id: 'unverified', label: 'Unverified' },
    { id: 'disputed', label: 'Disputed' },
  ];

  const searchIntent = useMemo(() => {
    return search.trim() ? parseSearchIntent(search) : null;
  }, [search]);

  // Client-side filtering & multi-tiered sorting
  const filteredList = useMemo(() => {
    let result = [...initialDiscoveries];

    // Category filtering: explicit category selection, or broad search intent
    let targetCategory = selectedCategory;
    if (targetCategory === 'all' && searchIntent?.detectedCategory && searchIntent.isBroadCategorySearch) {
      targetCategory = searchIntent.detectedCategory;
    }

    if (targetCategory !== 'all') {
      result = result.filter((d) => d.category === targetCategory);
    }

    // Status filter
    if (selectedStatus === 'verified_only') {
      result = result.filter(
        (d) =>
          d.verificationStatus === 'community_verified' ||
          d.verificationStatus === 'personally_verified' ||
          d.verificationStatus === 'corroborated'
      );
    } else if (selectedStatus !== 'all') {
      result = result.filter((d) => d.verificationStatus === selectedStatus);
    }

    // Search intent & relevance scoring
    if (searchIntent && search.trim()) {
      let scored = result.map((d) => ({
        d,
        score: scoreDiscoveryRelevance(d, searchIntent),
      }));

      // Filter out items that have zero or negative relevance to the user's intent
      scored = scored.filter((item) => item.score > 0);

      // Sort strictly by relevance score descending
      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (sortBy === 'confirmed') {
          return (b.d.confirmationsCount || 0) - (a.d.confirmationsCount || 0);
        }
        return new Date(b.d.createdAt).getTime() - new Date(a.d.createdAt).getTime();
      });

      result = scored.map((s) => s.d);
    } else {
      // Normal Sort
      if (sortBy === 'confirmed') {
        result.sort((a, b) => (b.confirmationsCount || 0) - (a.confirmationsCount || 0));
      } else if (sortBy === 'trending') {
        result.sort((a, b) => ((b.confirmationsCount || 0) * 2 + (b.featured ? 40 : 0)) - ((a.confirmationsCount || 0) * 2));
      } else {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return result;
  }, [initialDiscoveries, selectedCategory, selectedStatus, search, searchIntent, sortBy]);

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'all' ||
    selectedStatus !== 'all' ||
    sortBy !== 'newest';

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('newest');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 font-body text-[#F4F0E8] min-h-screen">
      
      {/* 1. TOP BAR: Title, Search & Filter Button (Section 6) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#28272F] pb-6">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8] leading-none">
            Discoveries
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#9B969F] mt-1">
            Real GTA VI discoveries, secret spots, and rare rides collected across Leonida.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#9B969F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-[#1C1B20] border border-[#28272F] rounded-sm text-xs font-mono text-[#F4F0E8] placeholder-[#9B969F]/60 focus:outline-none focus:border-orange transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9B969F] hover:text-[#F4F0E8]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className={`px-3 py-2 border rounded-sm font-mono text-xs uppercase font-bold flex items-center gap-1.5 transition-colors ${
              filterOpen || hasActiveFilters
                ? 'bg-orange text-ink border-orange'
                : 'bg-[#1C1B20] text-[#9B969F] border-[#28272F] hover:text-[#F4F0E8]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER CONTROLS: Category selector, Verification filter, Sort option (Section 6) */}
      <div className="space-y-3">
        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs uppercase">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors border text-xs ${
                  isSelected
                    ? 'bg-[#1C1B20] text-orange border-orange font-bold'
                    : 'bg-[#111114] text-[#9B969F] border-[#28272F] hover:text-[#F4F0E8]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Expandable Secondary Filter Bar (Verification & Sort) */}
        {(filterOpen || hasActiveFilters) && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#1C1B20] border border-[#28272F] rounded-sm font-mono text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Verification Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#9B969F] text-[11px] uppercase">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-[#111114] border border-[#28272F] text-[#F4F0E8] text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-orange"
                >
                  {statuses.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Option */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#9B969F] text-[11px] uppercase">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#111114] border border-[#28272F] text-[#F4F0E8] text-xs px-2 py-1 rounded-sm focus:outline-none focus:border-orange"
                >
                  <option value="newest">Newest First</option>
                  <option value="confirmed">Most Confirmed</option>
                  <option value="trending">Trending Velocity</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-orange hover:text-[#F4F0E8] text-[11px] font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. DISCOVERY GRID: Maximum 2 columns on desktop, 1 column on mobile (Section 6) */}
      <div>
        {filteredList.length === 0 ? (
          <div className="space-y-4">
            <EmptyState
              title={
                searchIntent?.detectedCategory
                  ? `No matching ${categories.find((c) => c.id === searchIntent.detectedCategory)?.label || searchIntent.detectedCategory} discoveries found yet.`
                  : search.trim()
                  ? `No matching discoveries found for "${search}".`
                  : 'Nothing discovered yet.'
              }
              description={
                hasActiveFilters
                  ? 'No verified discoveries match your current filter parameters. Reports will appear here when real evidence is confirmed.'
                  : 'VicePulse is scanning the internet for new discoveries. Reports will appear here when real information is collected.'
              }
              actionText={hasActiveFilters ? 'Clear All Filters' : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-xs text-[#9B969F] uppercase font-mono">Explore other categories:</span>
                {categories
                  .filter((c) => c.id !== 'all' && c.id !== searchIntent?.detectedCategory)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setSelectedCategory(cat.id);
                      }}
                      className="px-2.5 py-1 bg-[#1C1B20] border border-[#28272F] hover:border-orange text-xs text-[#F4F0E8] font-mono rounded-xs transition-colors"
                    >
                      {cat.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredList.map((discovery) => (
              <DiscoveryCard key={discovery.id || discovery.slug} discovery={discovery} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
