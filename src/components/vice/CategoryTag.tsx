'use client';

import React from 'react';
import { Category } from '@/types';

export type ExtendedCategory = 
  | 'hidden-location' 
  | 'rare-vehicle' 
  | 'easter-egg' 
  | 'encounter' 
  | 'unusual-event'
  | 'wildlife'
  | 'hidden-activity';

interface CategoryTagProps {
  category: ExtendedCategory | Category | string;
  size?: 'sm' | 'md';
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CategoryTag: React.FC<CategoryTagProps> = ({
  category,
  size = 'md',
  active = false,
  onClick,
  className = '',
}) => {
  const norm = category.toLowerCase().replace(/\s+/g, '-');

  // Custom flat SVG marks for the 7 categories (NO EMOJI)
  const renderIcon = (cat: string) => {
    switch (cat) {
      case 'hidden-location':
        // Compass / Map marker crosshair
        return (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
            <rect x="3" y="3" width="18" height="18" stroke="currentColor" />
            <path d="M12 7v10M7 12h10" />
          </svg>
        );
      case 'rare-vehicle':
        // High-speed muscle wedge silhouette
        return (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 14h3l3-5h9l4 5h1v4h-2a2 2 0 1 1-4 0H8a2 2 0 1 1-4 0H2v-4zm5 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm12 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          </svg>
        );
      case 'easter-egg':
        // Retro 8-bit mystery star / alien glyph
        return (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8 12 2" />
          </svg>
        );
      case 'encounter':
        // Radio / Surveillance radar ping
        return (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <path d="M6 18a9 9 0 0 1 0-12M18 6a9 9 0 0 1 0 12" />
          </svg>
        );
      case 'hidden-activity':
        // Dice / Secret wager card
        return (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="16" cy="16" r="1.5" fill="currentColor" />
          </svg>
        );
      case 'wildlife':
        // Alligator jaw / apex predator silhouette
        return (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M2 13c3-3 7-5 12-4l6-3v6c-2 2-6 3-9 3l-3 3H2v-5z" />
          </svg>
        );
      case 'unusual-event':
      default:
        // Tropical storm / flash flood warning lightning bolt
        return (
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        );
    }
  };

  const getTheme = (cat: string) => {
    switch (cat) {
      case 'hidden-location':
        return { label: 'Hidden Locations', bg: 'bg-orange', text: 'text-ink', border: 'border-ink' };
      case 'rare-vehicle':
        return { label: 'Rare Vehicles', bg: 'bg-hot-pink', text: 'text-ink', border: 'border-ink' };
      case 'easter-egg':
        return { label: 'Easter Eggs', bg: 'bg-sun', text: 'text-ink', border: 'border-ink' };
      case 'encounter':
        return { label: 'Random Encounters', bg: 'bg-teal', text: 'text-ink', border: 'border-ink' };
      case 'hidden-activity':
        return { label: 'Hidden Activities', bg: 'bg-sand', text: 'text-ink', border: 'border-ink' };
      case 'wildlife':
        return { label: 'Leonida Wildlife', bg: 'bg-emerald-400', text: 'text-ink', border: 'border-ink' };
      case 'unusual-event':
      default:
        return { label: 'Unusual Events', bg: 'bg-amber-300', text: 'text-ink', border: 'border-ink' };
    }
  };

  const theme = getTheme(norm);
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1.5';

  const interactiveClasses = onClick
    ? 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform'
    : '';

  const activeClasses = active
    ? `${theme.bg} ${theme.text} shadow-[2px_2px_0px_#1A0B2E]`
    : 'bg-ink text-cream/80 border-ink hover:text-cream';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`font-mono uppercase font-black tracking-wider border-2 ${theme.border} ${sizeClasses} ${activeClasses} ${interactiveClasses} inline-flex items-center gap-1.5 select-none ${className}`}
    >
      {renderIcon(norm)}
      <span>{theme.label}</span>
    </button>
  );
};
