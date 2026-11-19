'use client';

import React from 'react';

export type VehicleRarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Secret';

interface RarityStampProps {
  rarity: VehicleRarity | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const RarityStamp: React.FC<RarityStampProps> = ({
  rarity,
  size = 'md',
  className = '',
}) => {
  const norm = (rarity || 'uncommon').toLowerCase();

  const getConfig = (r: string) => {
    switch (r) {
      case 'legendary':
        return { label: 'LEGENDARY TIER', bg: 'bg-[#FF4FA0]', text: 'text-ink' };
      case 'secret':
        return { label: 'SECRET VEHICLE', bg: 'bg-[#FFE066]', text: 'text-ink' };
      case 'rare':
        return { label: 'RARE SPEC', bg: 'bg-[#FF7A3D]', text: 'text-ink' };
      case 'common':
        return { label: 'COMMON SIGHTING', bg: 'bg-[#FFF1DC]', text: 'text-ink' };
      case 'uncommon':
      default:
        return { label: 'UNCOMMON RIDE', bg: 'bg-[#19C7B8]', text: 'text-ink' };
    }
  };

  const config = getConfig(norm);
  const sizeClasses = size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';

  return (
    <span
      className={`font-mono uppercase font-black tracking-widest border-2 border-ink ${config.bg} ${config.text} shadow-[2px_2px_0px_#1A0B2E] ${sizeClasses} inline-flex items-center select-none ${className}`}
    >
      {config.label}
    </span>
  );
};
