'use client';

import React from 'react';

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`bg-ink-card border-3 border-ink p-4 space-y-4 shadow-[4px_4px_0px_#1A0B2E] animate-pulse ${className}`}
      aria-busy="true"
      aria-label="Loading content..."
    >
      <div className="h-44 bg-ink border-2 border-ink" />
      <div className="space-y-2">
        <div className="h-4 bg-orange/40 w-1/3 border border-ink" />
        <div className="h-6 bg-cream/20 w-3/4 border border-ink" />
        <div className="h-3 bg-cream/10 w-full" />
        <div className="h-3 bg-cream/10 w-4/5" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t-2 border-ink/40">
        <div className="h-5 bg-teal/30 w-24 border border-ink" />
        <div className="h-5 bg-sun/30 w-16 border border-ink" />
      </div>
    </div>
  );
};

export const DetailSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 animate-pulse ${className}`} aria-busy="true">
      <div className="h-80 bg-ink border-3 border-ink shadow-[5px_5px_0px_#1A0B2E]" />
      <div className="h-10 bg-cream/20 w-2/3 border-2 border-ink" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="h-32 bg-ink-card border-3 border-ink" />
          <div className="h-48 bg-ink-card border-3 border-ink" />
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-ink-card border-3 border-ink" />
        </div>
      </div>
    </div>
  );
};
