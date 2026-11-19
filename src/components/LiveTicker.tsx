'use client';

import React from 'react';
import Link from 'next/link';

export const LiveTicker: React.FC = () => {
  const tickerItems = [
    { tag: 'HOT WIRE', text: 'LEONIDA HIGHWAY PATROL CHASING STOLEN CHEETAH RETRO ALONG OCEAN DRIVE', link: '/vehicles' },
    { tag: 'NEW INTEL', text: 'SUBMERGED 1982 SMUGGLER CESSNA FOUND AT KEY CHICAS SHOALS', link: '/discoveries/disc-1' },
    { tag: 'ANOMALY', text: 'RADIO INTERFERENCE DETECTED AT 88.4 FM NEAR GRASSRIVERS RADAR DISH', link: '/easter-eggs' },
    { tag: 'TABLOID LEAK', text: 'FLORIDA MAN WRESTLES 14-FOOT ALLIGATOR OUTSIDE PORT GELLHORN STRIP MALL', link: '/encounters' },
    { tag: 'GARAGE DROP', text: 'INFERNUS PROTOTYPE SPOTTED IN DOWNTOWN UNDERGROUND PARKING P3', link: '/vehicles' },
    { tag: 'MYSTERY', text: 'ABANDONED BREEZE HOTEL ROOM 214 REPORTEDLY BOARDED UP FROM INSIDE', link: '/locations' },
  ];

  return (
    <div className="bg-sun text-ink border-b-3 border-ink overflow-hidden py-1.5 select-none relative z-30 font-mono">
      <div className="flex items-center">
        {/* Fixed Front Tabloid Stamp */}
        <div className="shrink-0 bg-ink text-sun px-3 py-0.5 border-r-3 border-ink font-display text-sm tracking-wider flex items-center gap-1.5 z-10 shadow-[3px_0px_0px_#FF4FA0]">
          <span className="w-2 h-2 bg-hot-pink animate-pulse" />
          <span>LEONIDA WIRE</span>
        </div>

        {/* Continuous Scrolling Strip */}
        <div className="overflow-hidden flex-1 relative">
          <div className="ticker-strip-track flex items-center space-x-8 text-xs font-bold tracking-wider uppercase">
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 shrink-0">
                <span className="bg-ink text-cream text-[10px] px-1.5 py-0.5 border border-ink rotate-[-2deg] font-extrabold shadow-[1px_1px_0px_#FF7A3D]">
                  {item.tag}
                </span>
                <Link
                  href={item.link}
                  className="hover:text-hot-pink transition-colors underline decoration-ink decoration-2 underline-offset-4"
                >
                  {item.text}
                </Link>
                <span className="text-ink font-black text-sm">///</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Surveillance Time readout */}
        <div className="hidden md:flex items-center gap-2 shrink-0 bg-ink text-cream px-3 py-0.5 border-l-3 border-ink text-[11px] font-mono z-10">
          <span className="text-teal font-bold">VC TIME: 03:42 AM</span>
          <span className="text-hot-pink">|</span>
          <span className="text-sun font-bold">88°F HUMID</span>
        </div>
      </div>
    </div>
  );
};
