'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Full-viewport map page should not render page footer to preserve 100% viewport canvas
  if (pathname === '/map') {
    return null;
  }

  return (
    <footer className="bg-[#0B0B0D] border-t border-[#28272F] text-xs font-mono text-[#9B969F] select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-orange text-ink flex items-center justify-center font-display text-lg font-black rounded-xs">
                VP
              </div>
              <span className="font-display text-2xl tracking-tight text-[#F4F0E8]">
                VICE<span className="text-orange">PULSE</span>
              </span>
            </div>
            <p className="text-xs text-[#9B969F] leading-relaxed font-body">
              Autonomous discovery & research platform cataloging verified GTA VI hidden locations, rare vehicles, easter eggs, and secrets across Leonida.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="font-mono text-xs uppercase font-bold text-[#F4F0E8] tracking-wider">
              Explore
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/discoveries" className="hover:text-orange transition-colors">All Discoveries</Link></li>
              <li><Link href="/map" className="hover:text-orange transition-colors">Tactical Map</Link></li>
              <li><Link href="/vehicles" className="hover:text-orange transition-colors">Rare Vehicles</Link></li>
              <li><Link href="/news" className="hover:text-orange transition-colors">Newswire</Link></li>
              <li><Link href="/locations" className="hover:text-orange transition-colors">Hidden Locations</Link></li>
              <li><Link href="/easter-eggs" className="hover:text-orange transition-colors">Easter Eggs</Link></li>
              <li><Link href="/encounters" className="hover:text-orange transition-colors">Random Encounters</Link></li>
            </ul>
          </div>

          {/* Col 3: Sectors */}
          <div className="space-y-2.5">
            <h4 className="font-mono text-xs uppercase font-bold text-[#F4F0E8] tracking-wider">
              Sectors & Map
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/feed?district=Vice%20Beach" className="hover:text-orange transition-colors">Vice Beach</Link></li>
              <li><Link href="/feed?district=Port%20Gellhorn" className="hover:text-orange transition-colors">Port Gellhorn</Link></li>
              <li><Link href="/feed?district=The%20Keys" className="hover:text-orange transition-colors">Key Chicas</Link></li>
              <li><Link href="/feed?district=Grassrivers" className="hover:text-orange transition-colors">Grassrivers</Link></li>
              <li><Link href="/sources" className="hover:text-orange transition-colors">Monitored Feeds</Link></li>
              <li><Link href="/trending" className="hover:text-orange transition-colors">Trending Intel</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust & Transparency */}
          <div className="space-y-2.5">
            <h4 className="font-mono text-xs uppercase font-bold text-[#F4F0E8] tracking-wider">
              Trust & Standards
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/about" className="hover:text-orange transition-colors">About VicePulse</Link></li>
              <li><Link href="/methodology" className="hover:text-orange transition-colors">Verification Methodology</Link></li>
              <li><Link href="/contact" className="hover:text-orange transition-colors">Contact & Corrections</Link></li>
              <li><Link href="/privacy" className="hover:text-orange transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-orange transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-orange transition-colors">Refund Policy</Link></li>
              <li><Link href="/billing" className="hover:text-orange transition-colors">Subscriptions & Billing</Link></li>
              <li><Link href="/disclaimer" className="hover:text-orange transition-colors">Legal Disclaimer</Link></li>
              <li><Link href="/submit" className="hover:text-orange transition-colors">Submit Discovery</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Mandatory Disclaimer */}
        <div className="pt-6 border-t border-[#28272F] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#9B969F]">
          <div>
            VICEPULSE LEONIDA INTELLIGENCE ARCHIVE // 2026
          </div>
          <div className="text-center sm:text-right text-[10px] uppercase tracking-wider text-[#9B969F]/70">
            VicePulse is an unofficial fan project and is not affiliated with Rockstar Games or Take-Two Interactive.
          </div>
        </div>
      </div>
    </footer>
  );
};
