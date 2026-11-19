'use client';

import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { CategoryTag } from './CategoryTag';

interface FilterPanelProps {
  categories: Array<{ id: string; label: string }>;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;

  statuses: Array<{ id: string; label: string }>;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;

  districts: string[];
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;

  sortBy: string;
  onSelectSort: (sort: any) => void;

  onClear: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  statuses,
  selectedStatus,
  onSelectStatus,
  districts,
  selectedDistrict,
  onSelectDistrict,
  sortBy,
  onSelectSort,
  onClear,
  isOpenMobile = false,
  onCloseMobile,
  className = '',
}) => {
  const content = (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-ink pb-3">
        <div className="flex items-center gap-2 text-orange font-black uppercase text-sm">
          <Filter className="w-4 h-4 stroke-[2.5px]" />
          <span>FILTER RADAR</span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[10px] uppercase font-bold text-cream/70 hover:text-orange flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3 stroke-[2.5px]" />
          <span>RESET</span>
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-black text-sun block">
          CATEGORY SECTORS
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-2.5 py-1 text-[11px] uppercase font-bold border-2 transition-all ${
                  isSelected
                    ? 'bg-orange text-ink border-ink shadow-[2px_2px_0px_#1A0B2E]'
                    : 'bg-ink text-cream/80 border-ink/40 hover:border-ink hover:text-cream'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Verification Status */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-black text-teal block">
          VERIFICATION LEVEL
        </label>
        <div className="space-y-1">
          {statuses.map((st) => {
            const isSelected = selectedStatus === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => onSelectStatus(st.id)}
                className={`w-full text-left px-2.5 py-1.5 text-[11px] uppercase font-bold border-2 transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-teal text-ink border-ink shadow-[2px_2px_0px_#1A0B2E]'
                    : 'bg-ink text-cream/80 border-ink/40 hover:border-ink hover:text-cream'
                }`}
              >
                <span>{st.label}</span>
                {isSelected && <span className="w-2 h-2 bg-ink rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* District / County */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-black text-hot-pink block">
          LEONIDA DISTRICT
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => onSelectDistrict(e.target.value)}
          className="w-full bg-ink border-2 border-ink text-xs font-mono text-cream p-2 font-bold focus:border-orange outline-none"
        >
          <option value="all">ALL DISTRICTS</option>
          {districts.filter((d) => d !== 'all').map((d) => (
            <option key={d} value={d}>
              {d.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Direction */}
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-black text-cream/80 block">
          SORT SEQUENCE
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSelectSort(e.target.value)}
          className="w-full bg-ink border-2 border-ink text-xs font-mono text-cream p-2 font-bold focus:border-orange outline-none"
        >
          <option value="newest">NEWEST SIGHTINGS</option>
          <option value="confirmed">MOST CONFIRMED</option>
          <option value="trending">SURGING / TRENDING</option>
          <option value="disputed">RECENTLY DISPUTED</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block w-72 shrink-0 bg-ink-card border-3 border-ink p-5 shadow-[4px_4px_0px_#1A0B2E] ${className}`}>
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter Discoveries Mobile Drawer"
          className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/80 backdrop-blur-none p-0 sm:p-4 animate-fade-in"
        >
          <div className="w-full max-w-md bg-ink-card border-t-3 sm:border-3 border-ink p-6 max-h-[85vh] overflow-y-auto shadow-[6px_6px_0px_#1A0B2E]">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 bg-hot-pink text-ink border-2 border-ink"
              >
                <X className="w-5 h-5 stroke-[2.5px]" />
              </button>
            </div>
            {content}
            <div className="pt-6">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 bg-orange text-ink font-mono text-xs uppercase font-black border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]"
              >
                APPLY RADAR FILTERS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
