'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ViceImage } from '@/components/vice/ViceImage';
import { Discovery } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { 
  Search, 
  MapPin, 
  X, 
  Filter, 
  ArrowRight, 
  Compass, 
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { CATEGORY_MARKER_CONFIG } from './MapAbstraction';
import { parseSearchIntent, scoreDiscoveryRelevance } from '@/lib/search/intentParser';
import type { GtaDbLandmarkItem } from './TacticalMap';

// Dynamically import TacticalMap (Leaflet GTA VI Community Map, SSR: false)
const TacticalMap = dynamic(
  () => import('./TacticalMap').then((mod) => mod.TacticalMap),
  {
    ssr: false,
    loading: () => (
      <div data-testid="MapContainer" className="w-full h-full flex flex-col items-center justify-center bg-[#111114] text-[#F4F0E8] font-mono text-xs space-y-3">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
        <span className="uppercase tracking-widest text-orange font-bold">
          INITIALIZING GTA VI CARTOGRAPHY // Loading Leonida Map...
        </span>
      </div>
    ),
  }
);

interface MapContainerProps {
  initialDiscoveries: Discovery[];
}

export const MapContainer: React.FC<MapContainerProps> = ({ initialDiscoveries }) => {
  const [discoveries] = useState<Discovery[]>(initialDiscoveries);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscovery, setSelectedDiscovery] = useState<Discovery | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<GtaDbLandmarkItem | null>(null);
  const [showGtadbLayer, setShowGtadbLayer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Parse search intent from user input
  const searchIntent = useMemo(() => {
    return searchQuery.trim() ? parseSearchIntent(searchQuery) : null;
  }, [searchQuery]);

  // Check if a discovery has valid coordinates
  const hasCoordinates = (d: Discovery) =>
    d &&
    d.coordinates &&
    typeof d.coordinates.lat === 'number' &&
    typeof d.coordinates.lng === 'number' &&
    !isNaN(d.coordinates.lat) &&
    !isNaN(d.coordinates.lng) &&
    d.coordinates.lat !== 0 &&
    d.coordinates.lng !== 0 &&
    d.coordinates.inGameGrid !== 'LOCATION_PENDING';

  // Only real discoveries with valid numeric coordinates (strictly no fake pins on map)
  const validMappedDiscoveries = useMemo(() => {
    return discoveries.filter(hasCoordinates);
  }, [discoveries]);

  // Compute live category counts for mapped discoveries
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: validMappedDiscoveries.length };
    for (const d of validMappedDiscoveries) {
      counts[d.category] = (counts[d.category] || 0) + 1;
    }
    return counts;
  }, [validMappedDiscoveries]);

  // Compute live verification counts
  const verificationCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: validMappedDiscoveries.length,
      reported: 0,
      corroborated: 0,
      community_verified: 0,
      disputed: 0,
    };
    for (const d of validMappedDiscoveries) {
      const s = d.verificationStatus;
      if (s === 'reported' || s === 'unverified' || s === 'under_investigation') {
        counts.reported++;
      } else if (s === 'corroborated') {
        counts.corroborated++;
      } else if (s === 'community_verified' || s === 'personally_verified') {
        counts.community_verified++;
      } else if (s === 'disputed') {
        counts.disputed++;
      }
    }
    return counts;
  }, [validMappedDiscoveries]);

  // Filter discoveries based on search intent, category, and verification status
  const filteredDiscoveries = useMemo(() => {
    let result = [...validMappedDiscoveries];

    // Category filter: explicit category selection, or broad search intent
    let targetCategory = selectedCategory;
    if (targetCategory === 'all' && searchIntent?.detectedCategory && searchIntent.isBroadCategorySearch) {
      targetCategory = searchIntent.detectedCategory;
    }

    if (targetCategory !== 'all') {
      result = result.filter((d) => d.category === targetCategory);
    }

    // Verification status filter
    if (selectedVerification !== 'all') {
      if (selectedVerification === 'reported') {
        result = result.filter((d) => d.verificationStatus === 'reported' || d.verificationStatus === 'unverified' || d.verificationStatus === 'under_investigation');
      } else if (selectedVerification === 'corroborated') {
        result = result.filter((d) => d.verificationStatus === 'corroborated');
      } else if (selectedVerification === 'community_verified') {
        result = result.filter((d) => d.verificationStatus === 'community_verified' || d.verificationStatus === 'personally_verified');
      } else if (selectedVerification === 'disputed') {
        result = result.filter((d) => d.verificationStatus === 'disputed');
      }
    }

    // Search intent & relevance scoring
    if (searchIntent && searchQuery.trim()) {
      let scored = result.map((d) => ({
        d,
        score: scoreDiscoveryRelevance(d, searchIntent),
      }));

      // Filter out items that have zero or negative relevance to the user's intent
      scored = scored.filter((item) => item.score > 0);

      // Sort strictly by relevance score descending
      scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.d.confirmationsCount || 0) - (a.d.confirmationsCount || 0);
      });

      result = scored.map((s) => s.d);
    }

    return result;
  }, [validMappedDiscoveries, selectedCategory, selectedVerification, searchQuery, searchIntent]);

  const categories = [
    { id: 'all', label: 'All Discoveries', color: '#F4F0E8' },
    { id: 'hidden-location', label: 'Hidden Locations', color: '#FF8247' },
    { id: 'rare-vehicle', label: 'Rare Vehicles', color: '#FF4FA0' },
    { id: 'easter-egg', label: 'Easter Eggs', color: '#FFE066' },
    { id: 'encounter', label: 'Encounters', color: '#19C7B8' },
    { id: 'unusual-event', label: 'Activities', color: '#FF6384' },
    { id: 'wildlife', label: 'Wildlife', color: '#10B981' },
  ];

  const verificationFilters = [
    { id: 'all', label: 'All Statuses' },
    { id: 'reported', label: 'Reported' },
    { id: 'corroborated', label: 'Corroborated' },
    { id: 'community_verified', label: 'Community Verified' },
    { id: 'disputed', label: 'Disputed' },
  ];

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedVerification('all');
    setSearchQuery('');
  };

  const handleSelectDiscovery = (d: Discovery) => {
    setSelectedDiscovery(d);
    setMobileDrawerOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
    // Notify MapLibre GL to resize smoothly
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('resize'));
      }
    }, 320);
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedVerification !== 'all' || searchQuery.trim().length > 0;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] min-h-[580px] bg-[#111114] overflow-hidden text-[#F4F0E8] font-body">
      
      {/* 1. MAIN FULL-SCREEN EDGE-TO-EDGE MAP CANVAS (100% Viewport below header) */}
      <main className="absolute inset-0 w-full h-full overflow-hidden">
        <TacticalMap
          discoveries={filteredDiscoveries}
          selectedDiscovery={selectedDiscovery}
          onSelectDiscovery={(d) => {
            setSelectedDiscovery(d);
            if (d) setSelectedLandmark(null);
          }}
          selectedLandmark={selectedLandmark}
          onSelectLandmark={(l) => {
            setSelectedLandmark(l);
            if (l) setSelectedDiscovery(null);
          }}
          showGtadbLayer={showGtadbLayer}
          onToggleGtadbLayer={(val) => setShowGtadbLayer(val)}
        />
      </main>

      {/* 2. FLOATING DISCOVERY SIDEBAR (Desktop & Tablet - Overlays map edge-to-edge) */}
      <aside
        className={`hidden md:flex flex-col absolute top-3 left-3 bottom-3 z-30 w-88 sm:w-96 rounded-sm border border-[#28272F] bg-[#1C1B20]/95 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
          sidebarOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-[calc(100%+30px)] opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#28272F] flex items-center justify-between bg-[#111114]/40">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-orange" />
              <h2 className="font-display text-lg uppercase tracking-wider text-[#F4F0E8]">
                LEONIDA RECON
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-teal/10 border border-teal/40 font-mono text-[10px] text-teal font-bold uppercase">
                {validMappedDiscoveries.length} MAPPED
              </span>
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 text-[#9B969F] hover:text-[#F4F0E8] hover:bg-[#111114] rounded-xs transition-colors"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Live Search Input with Intent Recognition */}
          <div className="p-3 border-b border-[#28272F] bg-[#111114]/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9B969F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Easter eggs, rides, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111114] border border-[#28272F] rounded-xs text-xs font-mono text-[#F4F0E8] placeholder-[#9B969F]/60 pl-8 pr-7 py-2 focus:outline-none focus:border-orange transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9B969F] hover:text-[#F4F0E8]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Active Intent Indicator */}
            {searchIntent?.detectedCategory && (
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-orange bg-orange/10 border border-orange/20 px-2 py-1 rounded-xs">
                <span>INTENT: {searchIntent.detectedCategory.toUpperCase().replace('-', ' ')}</span>
                <span className="text-[9px] opacity-70">CONFIDENCE: {Math.round(searchIntent.categoryConfidence * 100)}%</span>
              </div>
            )}
          </div>

          {/* Category Filters Grid */}
          <div className="p-3 border-b border-[#28272F] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#9B969F] font-bold">
              <span>CATEGORIES</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-orange hover:underline font-bold"
                >
                  RESET
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      if (cat.id !== 'all') setSearchQuery('');
                    }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-xs border text-[11px] transition-all text-left ${
                      isSelected
                        ? 'bg-[#111114] text-orange border-orange font-bold shadow-sm'
                        : 'bg-[#1C1B20] text-[#9B969F] border-[#28272F] hover:text-[#F4F0E8] hover:border-[#9B969F]/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span className="text-[10px] opacity-70 ml-1 shrink-0 font-bold">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verification Status Filter Bar */}
          <div className="px-3 py-2 border-b border-[#28272F] bg-[#111114]/40">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
              {verificationFilters.map((vf) => {
                const isSelected = selectedVerification === vf.id;
                const count = verificationCounts[vf.id] || 0;
                return (
                  <button
                    key={vf.id}
                    type="button"
                    onClick={() => setSelectedVerification(vf.id)}
                    className={`px-2 py-1 rounded-xs border text-[10px] font-mono uppercase whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
                      isSelected
                        ? 'bg-orange text-[#111114] border-orange font-bold'
                        : 'bg-[#1C1B20] text-[#9B969F] border-[#28272F] hover:text-[#F4F0E8]'
                    }`}
                  >
                    <span>{vf.label}</span>
                    <span className="text-[9px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discovery List Header */}
          <div className="px-3 py-2 bg-[#111114]/70 border-b border-[#28272F] flex items-center justify-between font-mono text-[10px] text-[#9B969F] uppercase">
            <span>SHOWING {filteredDiscoveries.length} OF {validMappedDiscoveries.length} DISCOVERIES</span>
          </div>

          {/* Scrollable Matching Discoveries List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#28272F]/50 scrollbar-thin">
            {filteredDiscoveries.length === 0 ? (
              <div className="p-6 text-center space-y-3 font-mono">
                <div className="w-10 h-10 rounded-full bg-[#111114] border border-[#28272F] flex items-center justify-center mx-auto text-orange">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-orange font-bold uppercase text-xs">
                  {searchIntent?.detectedCategory
                    ? `No matching ${categories.find((c) => c.id === searchIntent.detectedCategory)?.label || searchIntent.detectedCategory} discoveries found on map.`
                    : 'Nothing discovered here yet.'}
                </div>
                <p className="text-xs text-[#9B969F] leading-relaxed">
                  VicePulse is continuously collecting new discoveries. Locations appear on this map when coordinates are verified by field evidence.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 bg-[#111114] border border-[#28272F] hover:border-orange text-orange font-mono text-[11px] uppercase font-bold rounded-xs transition-colors"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              filteredDiscoveries.map((d) => {
                const isSelected = selectedDiscovery?.id === d.id;
                const config = CATEGORY_MARKER_CONFIG[d.category] || {
                  color: '#FF8247',
                  label: 'Discovery',
                };
                return (
                  <div
                    key={d.id}
                    onClick={() => handleSelectDiscovery(d)}
                    className={`p-3 cursor-pointer transition-all flex gap-3 relative group ${
                      isSelected
                        ? 'bg-[#111114] border-l-4 border-l-orange'
                        : 'hover:bg-[#111114]/70 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Left Category Accent Strip */}
                    <div
                      className="w-1 shrink-0 rounded-full self-stretch"
                      style={{ backgroundColor: config.color }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-xs"
                          style={{
                            backgroundColor: `${config.color}20`,
                            color: config.color,
                          }}
                        >
                          {config.label}
                        </span>
                        <span className="font-mono text-[9px] text-[#9B969F] truncate">
                          {d.coordinates.inGameGrid || 'GRID'} • {d.district}
                        </span>
                      </div>

                      <h4 className="font-display text-sm text-[#F4F0E8] group-hover:text-orange transition-colors truncate">
                        {d.title}
                      </h4>

                      <div className="flex items-center justify-between pt-0.5">
                        <VerificationBadge status={d.verificationStatus} size="sm" />
                        <span className="font-mono text-[10px] text-orange flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Locate</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Small Thumbnail */}
                    {d.evidenceImages?.[0]?.url && (
                      <div className="relative w-12 h-12 rounded-xs overflow-hidden bg-[#111114] shrink-0 border border-[#28272F]/60">
                        <ViceImage
                          src={d.evidenceImages[0].url}
                          alt={d.title}
                          category={d.category}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#28272F] bg-[#111114]/80 flex items-center justify-between text-[10px] font-mono text-[#9B969F]">
            <span>FOUNDATION: GTA VI COMMUNITY MAP</span>
            <span className="text-teal font-bold">GTADB CC BY 4.0</span>
          </div>
        </div>
      </aside>

      {/* 3. FLOATING OPEN SIDEBAR BUTTON (When Sidebar is Collapsed) */}
      {!sidebarOpen && (
        <div className="hidden md:block absolute top-4 left-4 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex items-center gap-2 bg-[#1C1B20]/95 backdrop-blur-md border border-[#28272F] hover:border-orange px-3 py-2 rounded-sm text-xs font-mono font-bold uppercase text-[#F4F0E8] hover:text-orange shadow-2xl transition-all"
            title="Open Discoveries Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 text-orange" />
            <span>DISCOVERIES ({filteredDiscoveries.length})</span>
          </button>
        </div>
      )}

      {/* 4. MOBILE FLOATING SEARCH & FILTER BUTTON */}
      <div className="md:hidden absolute top-4 inset-x-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#1C1B20]/95 backdrop-blur-md border border-[#28272F] p-1.5 rounded-sm shadow-xl">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#9B969F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search discoveries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111114] border border-[#28272F] rounded-xs text-xs font-mono text-[#F4F0E8] placeholder-[#9B969F]/60 pl-8 pr-7 py-1.5 focus:outline-none focus:border-orange"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9B969F]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="px-2.5 py-1.5 bg-[#111114] border border-[#28272F] text-[#F4F0E8] hover:text-orange text-xs font-mono uppercase font-bold rounded-xs flex items-center gap-1"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>({filteredDiscoveries.length})</span>
          </button>
        </div>
      </div>

      {/* 5. COMPACT DISCOVERY PREVIEW CARD (On Marker / Result Click) */}
      {selectedDiscovery && (
        <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-88 z-30 bg-[#1C1B20]/95 backdrop-blur-md border border-[#28272F] rounded-sm shadow-2xl p-4 space-y-3 pointer-events-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: CATEGORY_MARKER_CONFIG[selectedDiscovery.category]?.color || '#FF8247',
                }}
              />
              <span className="font-mono text-[11px] uppercase font-bold text-orange tracking-wider">
                {selectedDiscovery.category.replace('-', ' ')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDiscovery(null)}
              className="text-[#9B969F] hover:text-[#F4F0E8] p-1 rounded-xs transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Evidence Thumbnail */}
          <div className="relative w-full h-36 bg-[#111114] rounded-xs overflow-hidden border border-[#28272F]/60">
            <ViceImage
              src={selectedDiscovery.evidenceImages?.[0]?.url || ''}
              alt={selectedDiscovery.title}
              category={selectedDiscovery.category}
              fill
              className="object-cover"
            />
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h3 className="font-display text-lg text-[#F4F0E8] leading-tight line-clamp-2">
              {selectedDiscovery.title}
            </h3>
            <p className="font-body text-xs text-[#9B969F] line-clamp-2 leading-relaxed">
              {selectedDiscovery.description}
            </p>
          </div>

          {/* Telemetry Grid */}
          <div className="pt-2 border-t border-[#28272F] grid grid-cols-2 gap-2 font-mono text-[10px] text-[#9B969F]">
            <div>
              <span className="block text-[#9B969F]/70 uppercase">DISTRICT</span>
              <span className="text-[#F4F0E8] font-bold">{selectedDiscovery.district || 'Leonida'}</span>
            </div>
            <div>
              <span className="block text-[#9B969F]/70 uppercase">IN-GAME GRID</span>
              <span className="text-orange font-bold">
                {selectedDiscovery.coordinates.inGameGrid || 'TACTICAL'}
              </span>
            </div>
          </div>

          {/* Verification & Action Button */}
          <div className="flex items-center justify-between pt-2 border-t border-[#28272F]">
            <VerificationBadge status={selectedDiscovery.verificationStatus} size="sm" />
            <Link
              href={`/discoveries/${selectedDiscovery.slug || selectedDiscovery.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange hover:bg-orange-hover text-[#111114] font-mono text-xs uppercase font-bold rounded-xs shadow transition-colors"
            >
              <span>View Discovery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 5B. COMPACT GTADB REFERENCE LANDMARK PREVIEW CARD */}
      {selectedLandmark && (
        <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-30 bg-[#1C1B20]/95 backdrop-blur-md border border-cyan-500/40 rounded-sm shadow-2xl p-4 space-y-3 pointer-events-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="font-mono text-[11px] uppercase font-bold text-cyan-400 tracking-wider">
                [GTADB REF {selectedLandmark.gtadbId}] • {selectedLandmark.category}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLandmark(null)}
              className="text-[#9B969F] hover:text-[#F4F0E8] p-1 rounded-xs transition-colors"
              aria-label="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Photo Preview (In-Game and/or Real-World) */}
          {(selectedLandmark.photos?.inGame?.url || selectedLandmark.photos?.realWorld?.url) && (
            <div className="grid grid-cols-2 gap-2">
              {selectedLandmark.photos?.inGame?.url ? (
                <div className="relative h-28 bg-[#111114] rounded-xs overflow-hidden border border-[#28272F]">
                  <img
                    src={selectedLandmark.photos.inGame.url}
                    alt={selectedLandmark.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.2 rounded-xs font-mono text-[8px] text-cyan-300">
                    IN-GAME
                  </span>
                </div>
              ) : (
                <div className="h-28 bg-[#111114] rounded-xs flex items-center justify-center font-mono text-[10px] text-[#9B969F]">
                  No In-Game Photo
                </div>
              )}

              {selectedLandmark.photos?.realWorld?.url ? (
                <div className="relative h-28 bg-[#111114] rounded-xs overflow-hidden border border-[#28272F]">
                  <img
                    src={selectedLandmark.photos.realWorld.url}
                    alt={selectedLandmark.realWorldName || selectedLandmark.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.2 rounded-xs font-mono text-[8px] text-orange">
                    REAL WORLD
                  </span>
                </div>
              ) : (
                <div className="h-28 bg-[#111114] rounded-xs flex items-center justify-center font-mono text-[10px] text-[#9B969F]">
                  No Real-Life Photo
                </div>
              )}
            </div>
          )}

          {/* Title & Real-World Counterpart */}
          <div className="space-y-1">
            <h3 className="font-display text-base text-[#F4F0E8] leading-snug">
              {selectedLandmark.name}
            </h3>
            {selectedLandmark.realWorldName && (
              <p className="font-mono text-xs text-[#9B969F] leading-relaxed">
                <strong className="text-teal font-normal">Analog:</strong> {selectedLandmark.realWorldName}
              </p>
            )}
          </div>

          {/* In-Game Telemetry */}
          <div className="pt-2 border-t border-[#28272F] grid grid-cols-2 gap-2 font-mono text-[10px] text-[#9B969F]">
            <div>
              <span className="block text-[#9B969F]/70 uppercase">IN-GAME COORDS</span>
              <span className="text-cyan-300 font-bold">
                X: {selectedLandmark.inGameCoordinates.x.toFixed(1)}, Y: {selectedLandmark.inGameCoordinates.y.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="block text-[#9B969F]/70 uppercase">STATUS</span>
              <span className="text-teal font-bold uppercase">
                {selectedLandmark.status || 'CONFIRMED'}
              </span>
            </div>
          </div>

          {/* Legal Attribution */}
          <div className="pt-2 border-t border-[#28272F] flex items-center justify-between text-[10px] font-mono text-[#9B969F]">
            <span>CC BY 4.0 Reference Layer</span>
            <a
              href="https://map.gtadb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
            >
              <span>gtadb.org</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* 6. EMPTY STATE OVERLAY (When valid mapped discoveries in DB is 0) */}
      {validMappedDiscoveries.length === 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 bg-[#1C1B20]/95 backdrop-blur-md border border-[#28272F] rounded-sm p-5 text-center max-w-md pointer-events-auto shadow-2xl space-y-2">
          <p className="font-display text-xl uppercase tracking-tight text-[#F4F0E8]">
            Nothing discovered here yet.
          </p>
          <p className="font-body text-xs text-[#9B969F] leading-relaxed">
            VicePulse is continuously collecting new discoveries. Locations will appear on this map when their positions are supported by evidence.
          </p>
        </div>
      )}

      {/* 7. MOBILE BOTTOM DRAWER */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1C1B20] border-t border-[#28272F] rounded-t-lg max-h-[80vh] flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#28272F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-orange" />
                <span className="font-display text-lg uppercase tracking-wide">
                  LEONIDA DISCOVERIES ({filteredDiscoveries.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 text-[#9B969F] hover:text-[#F4F0E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Category Chips */}
            <div className="p-2 border-b border-[#28272F] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    if (cat.id !== 'all') setSearchQuery('');
                  }}
                  className={`px-2.5 py-1 rounded-xs border text-[11px] font-mono uppercase whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-orange text-[#111114] border-orange font-bold'
                      : 'bg-[#111114] text-[#9B969F] border-[#28272F]'
                  }`}
                >
                  {cat.label} ({categoryCounts[cat.id] || 0})
                </button>
              ))}
            </div>

            {/* Mobile List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#28272F]/50 p-2">
              {filteredDiscoveries.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleSelectDiscovery(d)}
                  className="p-3 flex items-center justify-between hover:bg-[#111114] rounded-xs cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-[9px] uppercase text-orange font-bold">
                      {d.category.replace('-', ' ')} • {d.district}
                    </span>
                    <h5 className="font-display text-sm text-[#F4F0E8] line-clamp-1">
                      {d.title}
                    </h5>
                  </div>
                  <VerificationBadge status={d.verificationStatus} size="sm" showLabel={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
