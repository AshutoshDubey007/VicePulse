import React from 'react';

export const RetroHeroArt: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 500 500"
        className="w-full h-auto max-w-[460px] drop-shadow-[5px_5px_0px_#1A0B2E]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Retro Striped Sun - Solid Flat Color Bands with Horizontal Cuts */}
        <g id="retro-striped-sun">
          <clipPath id="sun-circle">
            <circle cx="250" cy="230" r="180" />
          </clipPath>

          <g clipPath="url(#sun-circle)">
            {/* Band 1 - Hot Pink Top Dome */}
            <rect x="50" y="50" width="400" height="70" fill="#FF4FA0" />
            
            {/* Band 2 - Vivid Hot Pink / Orange */}
            <rect x="50" y="126" width="400" height="36" fill="#FF4FA0" />
            
            {/* Band 3 - Sunset Orange */}
            <rect x="50" y="168" width="400" height="32" fill="#FF7A3D" />
            
            {/* Band 4 - Sunset Orange */}
            <rect x="50" y="206" width="400" height="26" fill="#FF7A3D" />
            
            {/* Band 5 - Golden Sun Yellow */}
            <rect x="50" y="238" width="400" height="22" fill="#FFE066" />
            
            {/* Band 6 - Golden Sun Yellow */}
            <rect x="50" y="266" width="400" height="18" fill="#FFE066" />
            
            {/* Band 7 - Sun Yellow */}
            <rect x="50" y="290" width="400" height="14" fill="#FFE066" />
            
            {/* Band 8 - Lower Sun Bar */}
            <rect x="50" y="310" width="400" height="12" fill="#FFE066" />
            
            {/* Band 9 - Bottom Slice */}
            <rect x="50" y="328" width="400" height="10" fill="#FFE066" />
            
            {/* Band 10 - Lowest Slice */}
            <rect x="50" y="344" width="400" height="8" fill="#FFE066" />
          </g>
        </g>

        {/* Ocean Horizon Solid Band */}
        <rect x="40" y="370" width="420" height="16" fill="#19C7B8" stroke="#1A0B2E" strokeWidth="3" />
        <rect x="40" y="392" width="420" height="10" fill="#FF4FA0" stroke="#1A0B2E" strokeWidth="3" />
        <rect x="40" y="408" width="420" height="6" fill="#FFE066" stroke="#1A0B2E" strokeWidth="2" />

        {/* Flat Vice City Skyline Silhouettes (Ink #1A0B2E) */}
        <g id="skyline-silhouettes" fill="#1A0B2E">
          {/* Skyscraper 1 */}
          <rect x="110" y="240" width="36" height="130" />
          <polygon points="110,240 128,210 146,240" />
          <rect x="126" y="195" width="4" height="20" />

          {/* Skyscraper 2 with Antenna */}
          <rect x="154" y="210" width="48" height="160" />
          <rect x="176" y="170" width="4" height="40" />

          {/* Stepped Art Deco Tower */}
          <rect x="210" y="260" width="50" height="110" />
          <rect x="218" y="235" width="34" height="25" />
          <rect x="228" y="215" width="14" height="20" />
          <rect x="234" y="190" width="2" height="25" />

          {/* Highrise 4 */}
          <rect x="268" y="230" width="40" height="140" />
          <polygon points="268,230 308,250 308,230" />

          {/* Crane / Port Docks */}
          <line x1="318" y1="270" x2="318" y2="370" stroke="#1A0B2E" strokeWidth="4" />
          <line x1="300" y1="280" x2="350" y2="280" stroke="#1A0B2E" strokeWidth="3" />
          <line x1="330" y1="280" x2="360" y2="300" stroke="#1A0B2E" strokeWidth="2" />

          {/* Condominiums */}
          <rect x="70" y="290" width="34" height="80" />
          <rect x="350" y="280" width="44" height="90" />
        </g>

        {/* Flat Palm Tree Silhouettes (#1A0B2E with thick stroke) */}
        <g id="palm-trees" fill="#1A0B2E">
          {/* Left Palm Trunk */}
          <path
            d="M80 370 Q70 310 95 240 Q98 240 96 370 Z"
            fill="#1A0B2E"
          />
          {/* Left Palm Fronds */}
          <path d="M95 240 Q60 215 30 235 Q65 235 95 240 Z" />
          <path d="M95 240 Q75 195 45 200 Q80 215 95 240 Z" />
          <path d="M95 240 Q105 180 85 170 Q100 200 95 240 Z" />
          <path d="M95 240 Q130 190 145 185 Q125 210 95 240 Z" />
          <path d="M95 240 Q145 225 160 245 Q125 235 95 240 Z" />

          {/* Right Palm Trunk (Taller, leaning) */}
          <path
            d="M400 370 Q420 290 380 200 Q376 200 395 370 Z"
            fill="#1A0B2E"
          />
          {/* Right Palm Fronds */}
          <path d="M380 200 Q430 170 465 190 Q425 195 380 200 Z" />
          <path d="M380 200 Q415 145 440 145 Q405 165 380 200 Z" />
          <path d="M380 200 Q365 130 380 120 Q375 155 380 200 Z" />
          <path d="M380 200 Q325 140 305 145 Q335 170 380 200 Z" />
          <path d="M380 200 Q315 185 295 210 Q340 195 380 200 Z" />
        </g>
      </svg>
    </div>
  );
};
