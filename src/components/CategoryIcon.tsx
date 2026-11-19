import React from 'react';
import { Category } from '@/types';

interface CategoryIconProps {
  category: Category | 'sources' | 'all' | 'verified';
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = 'w-5 h-5',
  size = 20,
}) => {
  switch (category) {
    case 'rare-vehicle':
      // Bold flat hot rod / sports coupe silhouette mark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M2 13L4 7h16l2 6v5h-2.5a2.5 2.5 0 0 1-5 0h-5a2.5 2.5 0 0 1-5 0H2v-5zm4.5-4L5 12h14l-1.5-3h-11z" />
          <circle cx="6.5" cy="18" r="1.5" fill="#1A0B2E" />
          <circle cx="17.5" cy="18" r="1.5" fill="#1A0B2E" />
        </svg>
      );

    case 'hidden-location':
      // Bold flat bunker / keyhole / secret door mark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M12 2L2 7v13h20V7L12 2zm0 4l6 3v9H6V9l6-3zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-1 5h2v3h-2v-3z" />
        </svg>
      );

    case 'easter-egg':
      // Retro 80s arcade / mystery cassette tape mark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M3 5h18v14H3V5zm3 3v8h12V8H6zm2 2h3v4H8v-4zm5 0h3v4h-3v-4z" />
          <circle cx="9.5" cy="12" r="1" fill="#1A0B2E" />
          <circle cx="14.5" cy="12" r="1" fill="#1A0B2E" />
        </svg>
      );

    case 'encounter':
      // Florida gator tooth / lightning strike bolt mark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M13 2L3 14h8l-2 8 12-13h-8l2-7z" />
        </svg>
      );

    case 'unusual-event':
      // Surveillance radar dish / anomaly beacon
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M12 2a10 10 0 0 0-10 10h3a7 7 0 0 1 14 0h3A10 10 0 0 0 12 2zm0 5a5 5 0 0 0-5 5h2a3 3 0 0 1 6 0h2a5 5 0 0 0-5-5zm-1 8h2v7h-2v-7z" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      );

    case 'wildlife':
      // Florida alligator / predatory swamp fauna flat silhouette mark
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M22 10l-4-3-3 1-5-2-4 2-4-1v4l3 2v4l3 2 4-1 5 2 3-1 2-4v-4zM7 14H5v-2h2v2zm6 1h-2v-2h2v2zm5-2h-2v-2h2v2z" />
        </svg>
      );

    case 'sources':
      // Tabloid megaphone / press leak tape
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      );

    case 'verified':
      // Serrated audit shield
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 15l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z" />
        </svg>
      );

    default:
      // Diamond compass target
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <polygon points="12 2 15 9 22 12 15 15 12 22 9 15 2 12 9 9" />
        </svg>
      );
  }
};
