'use client';

import React from 'react';

interface TickerStripProps {
  items?: string[];
  className?: string;
}

const DEFAULT_TICKER_ITEMS = [
  'NEW INTEL: Jack of Hearts underground VIP suite access sequence logged by u/LeonidaScout_99',
  'CONFIRMED: Sunken WWII twin-prop airframe spotted south of Key Chicas reef (-14m depth)',
  'RADAR HIT: 1986 Pegassi Infernus Classic spawned at Ocean Beach garage (2:15 AM)',
  'VERIFIED: Florida Panther territory documented in Lake Leonida pine glades at heavy twilight fog',
  'DISPUTED: Alleged Mt. Chiliad UFO antenna beacon flagged for inconclusive field evidence',
  'FIELD DROP: 3 operational airfields verified by community cartographers across Leonida Peninsula',
];

export const TickerStrip: React.FC<TickerStripProps> = ({
  items = DEFAULT_TICKER_ITEMS,
  className = '',
}) => {
  // Duplicate array for infinite scroll loop
  const displayItems = [...items, ...items];

  return (
    <div
      role="region"
      aria-label="Live Intelligence Ticker"
      className={`bg-sun text-ink border-y-3 border-ink overflow-hidden py-2 select-none ${className}`}
    >
      <div className="ticker-strip-track flex items-center gap-8 whitespace-nowrap">
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 shrink-0 font-mono text-xs uppercase font-black tracking-wider">
            <span className="w-2.5 h-2.5 bg-hot-pink border border-ink transform rotate-45 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
