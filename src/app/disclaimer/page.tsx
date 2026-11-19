import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/seo/constants';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer & Trademark Notice – VicePulse',
  description:
    'Official trademark and non-affiliation disclaimer for VicePulse: unofficial fan-created research platform not affiliated with Rockstar Games or Take-Two Interactive.',
  alternates: {
    canonical: `${siteConfig.url}/disclaimer`,
  },
};

export default function DisclaimerPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Disclaimer', url: '/disclaimer' },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 font-body text-[#F4F0E8] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <header className="border-b border-[#28272F] pb-8 space-y-2">
        <span className="font-mono text-xs uppercase font-bold text-orange tracking-widest">
          LEGAL & INTELLECTUAL PROPERTY NOTICE
        </span>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8]">
          DISCLAIMER & NON-AFFILIATION
        </h1>
        <p className="font-mono text-xs text-[#9B969F]">Notice to Users, Creators & Search Engines</p>
      </header>

      <section className="space-y-6 text-sm text-[#F4F0E8]/90 leading-relaxed">
        <div className="p-5 bg-orange/10 border border-orange/30 rounded-sm space-y-2">
          <div className="flex items-center gap-2 text-orange font-mono text-xs font-bold uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>UNOFFICIAL FAN & RESEARCH PROJECT</span>
          </div>
          <p className="font-body text-xs text-[#F4F0E8]">
            VicePulse is an unofficial fan project and research resource created by independent gaming enthusiasts. VicePulse is not affiliated with, endorsed by, sponsored by, or associated in any way with Rockstar Games, Take-Two Interactive Software, Inc., or any of their subsidiaries or affiliates.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-xl uppercase text-[#F4F0E8]">Trademark & Copyright Acknowledgement</h2>
          <p>
            &quot;Grand Theft Auto&quot;, &quot;GTA 6&quot;, &quot;GTA VI&quot;, &quot;Vice City&quot;, &quot;Rockstar Games&quot;, the Rockstar Games R* logo, and associated titles, characters, names, logos, and imagery are registered trademarks and/or copyrights of Take-Two Interactive Software, Inc. and Rockstar Games.
          </p>
          <p>
            All game screenshots, video crops, and references displayed on VicePulse are reproduced under Fair Use principles solely for the purposes of news reporting, commentary, research synthesis, and educational community assistance.
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#28272F]">
          <h2 className="font-display text-xl uppercase text-[#F4F0E8]">Accuracy of Information</h2>
          <p>
            Grand Theft Auto VI is an active entertainment development. Content, features, locations, and gameplay mechanics depicted or discussed on VicePulse are subject to change by the game&apos;s developers at any time. We make no guarantees that discoveries or vehicle spawns will remain permanent across official title updates.
          </p>
        </div>
      </section>
    </div>
  );
}
