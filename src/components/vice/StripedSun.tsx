'use client';

import React from 'react';

interface StripedSunProps {
  size?: number;
  className?: string;
}

export const StripedSun: React.FC<StripedSunProps> = ({
  size = 360,
  className = '',
}) => {
  return (
    <div
      className={`relative select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <clipPath id="sun-circle">
            <circle cx="200" cy="200" r="190" />
          </clipPath>
        </defs>

        {/* Circular Sun Mask with Flat Horizontal Bands */}
        <g clipPath="url(#sun-circle)">
          {/* Top band: Hot Pink */}
          <rect x="0" y="0" width="400" height="130" fill="#FF4FA0" />
          
          {/* Middle band: Orange */}
          <rect x="0" y="130" width="400" height="120" fill="#FF7A3D" />
          
          {/* Bottom band: Sun Yellow */}
          <rect x="0" y="250" width="400" height="150" fill="#FFE066" />

          {/* Retro Horizontal Slices (Masked in Ink) */}
          <rect x="0" y="200" width="400" height="6" fill="#1A0B2E" />
          <rect x="0" y="220" width="400" height="9" fill="#1A0B2E" />
          <rect x="0" y="244" width="400" height="12" fill="#1A0B2E" />
          <rect x="0" y="272" width="400" height="16" fill="#1A0B2E" />
          <rect x="0" y="304" width="400" height="22" fill="#1A0B2E" />
          <rect x="0" y="342" width="400" height="28" fill="#1A0B2E" />
        </g>

        {/* Hard 4px Ink Outline */}
        <circle cx="200" cy="200" r="190" stroke="#1A0B2E" strokeWidth="5" />
      </svg>
    </div>
  );
};
