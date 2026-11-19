'use client';

import React from 'react';
import { Category, VerificationStatus } from '@/types';

interface MapPinProps {
  category: Category | string;
  status?: VerificationStatus | string;
  isTrending?: boolean;
  isSelected?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const MapPin: React.FC<MapPinProps> = ({
  category,
  status = 'community_verified',
  isTrending = false,
  isSelected = false,
  size = 36,
  className = '',
  onClick,
}) => {
  const isUnverified = status === 'unverified';

  const getColor = (cat: string) => {
    switch (cat) {
      case 'rare-vehicle':
        return '#FF4FA0'; // Hot Pink
      case 'hidden-location':
        return '#FF7A3D'; // Orange
      case 'easter-egg':
        return '#FFE066'; // Sun Yellow
      case 'encounter':
        return '#19C7B8'; // Teal
      case 'wildlife':
        return '#10B981'; // Emerald
      case 'unusual-event':
      default:
        return '#FFB347'; // Sand
    }
  };

  const pinColor = getColor(category);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${category} pin (${status})`}
      className={`relative inline-flex items-center justify-center transition-transform duration-100 ease-out select-none ${
        isSelected ? 'scale-125 z-30' : 'hover:scale-110'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Stepped pulse animation for trending pins */}
      {isTrending && (
        <span
          className="absolute inset-0 rounded-full border-2 border-sun animate-ping opacity-75"
          style={{ animationDuration: '2s' }}
        />
      )}

      {/* SVG Flat Radar Marker with Cream Border */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[2px_2px_0px_#1A0B2E]"
      >
        <circle
          cx="18"
          cy="18"
          r="15"
          fill={pinColor}
          stroke="#FFF1DC"
          strokeWidth="3"
          strokeDasharray={isUnverified ? '4 3' : 'none'}
          opacity={isUnverified ? 0.75 : 1}
        />
        <circle cx="18" cy="18" r="5" fill="#1A0B2E" />
      </svg>
    </button>
  );
};
