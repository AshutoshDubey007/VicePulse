'use client';

import React from 'react';

interface SectionDividerProps {
  variant?: 'skyline' | 'palms' | 'combo';
  fillColor?: string;
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = 'combo',
  fillColor = '#1A0B2E',
  className = '',
}) => {
  return (
    <div className={`w-full overflow-hidden leading-none select-none pointer-events-none ${className}`} aria-hidden="true">
      {variant === 'skyline' && (
        <svg
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 block"
          fill={fillColor}
        >
          {/* Flat 80s/90s Miami/Vice City Art Deco highrises and antennas */}
          <polygon points="0,80 0,55 35,55 35,40 50,40 50,25 65,25 65,40 80,40 80,55 120,55 120,30 160,30 160,80" />
          <polygon points="160,80 160,45 190,45 190,15 220,15 220,80" />
          <polygon points="220,80 220,50 270,50 270,80" />
          <polygon points="270,80 270,35 300,20 330,35 330,80" />
          <polygon points="330,80 330,60 380,60 380,80" />
          <polygon points="380,80 380,25 410,25 410,10 415,10 415,0 418,0 418,10 425,10 425,25 450,25 450,80" />
          <polygon points="450,80 450,45 510,45 510,80" />
          <polygon points="510,80 510,30 550,18 590,30 590,80" />
          <polygon points="590,80 590,55 640,55 640,80" />
          <polygon points="640,80 640,20 670,20 670,80" />
          <polygon points="670,80 670,40 730,40 730,80" />
          <polygon points="730,80 730,15 760,15 760,5 763,5 763,0 766,0 766,5 770,5 770,15 800,15 800,80" />
          <polygon points="800,80 800,50 850,50 850,80" />
          <polygon points="850,80 850,30 890,30 890,80" />
          <polygon points="890,80 890,45 940,45 940,80" />
          <polygon points="940,80 940,22 970,10 1000,22 1000,80" />
          <polygon points="1000,80 1000,50 1060,50 1060,80" />
          <polygon points="1060,80 1060,35 1100,35 1100,80" />
          <polygon points="1100,80 1100,55 1200,55 1200,80" />
        </svg>
      )}

      {variant === 'palms' && (
        <svg
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 block"
          fill={fillColor}
        >
          {/* Flat silhouette palm trees */}
          <path d="M0,80 L1200,80 L1200,75 C1080,75 1060,50 1045,35 C1070,30 1090,20 1080,10 C1060,15 1045,25 1035,32 C1030,15 1015,5 995,8 C1005,20 1015,30 1025,36 C1000,32 980,35 970,45 C990,46 1010,42 1025,40 C1015,55 1010,75 990,80 Z" />
          <path d="M150,80 C165,65 170,45 160,30 C140,25 120,30 110,40 C130,42 145,38 155,34 C145,20 130,10 115,12 C125,22 135,28 148,32 C135,15 125,5 105,8 C115,18 125,25 142,32 C155,50 150,65 140,80 Z" />
        </svg>
      )}

      {variant === 'combo' && (
        <svg
          viewBox="0 0 1200 90"
          preserveAspectRatio="none"
          className="w-full h-14 sm:h-20 block"
          fill={fillColor}
        >
          {/* Skyline backdrop with foreground palm crowns */}
          <polygon points="0,90 0,65 50,65 50,45 80,45 80,30 110,30 110,65 170,65 170,40 210,40 210,20 240,20 240,90" />
          <polygon points="240,90 240,55 290,55 290,35 340,35 340,90" />
          <polygon points="340,90 340,25 370,10 400,25 400,90" />
          <polygon points="400,90 400,50 480,50 480,90" />
          <polygon points="480,90 480,30 520,30 520,15 523,15 523,5 526,5 526,15 530,15 530,30 560,30 560,90" />
          <polygon points="560,90 560,60 630,60 630,90" />
          <polygon points="630,90 630,40 680,40 680,20 720,20 720,90" />
          <polygon points="720,90 720,55 790,55 790,90" />
          <polygon points="790,90 790,30 820,15 850,30 850,90" />
          <polygon points="850,90 850,45 920,45 920,90" />
          <polygon points="920,90 920,25 960,25 960,90" />
          <polygon points="960,90 960,60 1040,60 1040,90" />
          <polygon points="1040,90 1040,40 1100,40 1100,90" />
          <polygon points="1100,90 1100,60 1200,60 1200,90" />
          {/* Overlapping stylized palm fronds */}
          <path d="M180,90 C190,65 200,40 185,25 C165,22 145,28 135,38 C155,38 172,32 180,27 C170,15 150,5 130,8 C145,18 160,24 175,27 C160,10 145,0 120,4 C135,14 150,22 170,27 C185,45 180,70 170,90 Z" />
          <path d="M980,90 C995,65 1010,40 995,20 C970,18 950,25 940,35 C960,35 980,28 990,22 C980,10 960,0 940,4 C955,14 970,20 985,22 C1000,42 995,68 980,90 Z" />
        </svg>
      )}
    </div>
  );
};
