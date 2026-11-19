import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/seo/constants';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { ShieldCheck, Compass, Radio, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About VicePulse – Autonomous GTA VI Intelligence Network',
  description:
    'Learn about VicePulse: our mission to catalog verified GTA VI discoveries across Leonida, our autonomous research architecture, and community verification standards.',
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: {
    title: 'About VicePulse – GTA VI Intelligence Network',
    description:
      'Learn about VicePulse: our mission to catalog verified GTA VI discoveries across Leonida, our autonomous research architecture, and community verification standards.',
    url: `${siteConfig.url}/about`,
  },
};

export default function AboutPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About', url: '/about' },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 font-body text-[#F4F0E8] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <header className="border-b border-[#28272F] pb-8 space-y-3">
        <span className="font-mono text-xs uppercase font-bold text-orange tracking-widest">
          ORGANIZATION & INTELLIGENCE MISSION
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F0E8] leading-none">
          ABOUT VICEPULSE
        </h1>
        <p className="font-body text-base text-[#9B969F] max-w-2xl leading-relaxed">
          VicePulse is an autonomous discovery and research platform dedicated to Grand Theft Auto VI and the State of Leonida.
        </p>
      </header>

      {/* Core Mission */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          What We Do
        </h2>
        <p className="font-body text-sm sm:text-base text-[#F4F0E8]/90 leading-relaxed">
          The GTA VI community is vast, producing thousands of clips, discussions, screenshots, and theories every day across YouTube, Reddit, gaming outlets, and forums. VicePulse aggregates, verifies, and maps this scattered information into a structured, searchable knowledge base.
        </p>
        <p className="font-body text-sm sm:text-base text-[#F4F0E8]/90 leading-relaxed">
          We catalog verified hidden locations, rare vehicles, secret activities, lore easter eggs, dynamic encounters, and ecological wildlife discoveries — with in-game coordinate triangulation and source attribution.
        </p>
      </section>

      {/* Transparency & AI Research Architecture */}
      <section className="space-y-4 border-t border-[#28272F] pt-8">
        <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          How Our Autonomous Engine Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-2">
            <Radio className="w-5 h-5 text-orange" />
            <h3 className="font-bold text-[#F4F0E8] text-sm uppercase">1. Continuous Ingestion</h3>
            <p className="text-[#9B969F] leading-relaxed">
              Our multi-connector engine monitors public YouTube community guides, Reddit threads, RSS feeds from gaming publications, and public posts for new discovery reports.
            </p>
          </div>
          <div className="p-4 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-2">
            <Eye className="w-5 h-5 text-teal" />
            <h3 className="font-bold text-[#F4F0E8] text-sm uppercase">2. AI Entity Extraction</h3>
            <p className="text-[#9B969F] leading-relaxed">
              AI models extract specific entities: in-game districts, vehicle models, time/weather prerequisites, and location clues without fabricating or halluncinating details.
            </p>
          </div>
          <div className="p-4 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-2">
            <Compass className="w-5 h-5 text-sun" />
            <h3 className="font-bold text-[#F4F0E8] text-sm uppercase">3. Coordinate Calibration</h3>
            <p className="text-[#9B969F] leading-relaxed">
              Coordinates are calculated against the reference Leonida cartography system. Reports without coordinate evidence are marked as Location Pending rather than invented.
            </p>
          </div>
          <div className="p-4 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-2">
            <ShieldCheck className="w-5 h-5 text-teal" />
            <h3 className="font-bold text-[#F4F0E8] text-sm uppercase">4. Transparent Verification</h3>
            <p className="text-[#9B969F] leading-relaxed">
              Every entry carries an honest verification status: Reported, Corroborated, Community Verified, or Disputed.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Standards & Source Attribution */}
      <section className="space-y-4 border-t border-[#28272F] pt-8">
        <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          Editorial & Attribution Integrity
        </h2>
        <ul className="space-y-3 font-body text-sm text-[#F4F0E8]/90">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-orange shrink-0 mt-0.5" />
            <span><strong>Full Source Attribution:</strong> Every aggregated discovery identifies its originating creator, channel, or community post with direct external links.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-orange shrink-0 mt-0.5" />
            <span><strong>Zero Fabricated Intelligence:</strong> We never generate fake discoveries, placeholder coordinates, or mock confirmation counts.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-orange shrink-0 mt-0.5" />
            <span><strong>Community Dispute Protocol:</strong> If an easter egg or location report proves false or patched, users can dispute it and trigger editorial re-examination.</span>
          </li>
        </ul>
      </section>

      {/* Legal Disclaimer */}
      <section className="p-6 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-2 font-mono text-xs text-[#9B969F]">
        <h3 className="font-bold uppercase text-[#F4F0E8]">Fan Project Disclaimer</h3>
        <p className="leading-relaxed">
          VicePulse is an unofficial fan and research project. We are not affiliated with, authorized, maintained, or endorsed by Rockstar Games, Take-Two Interactive, or any of their affiliates or subsidiaries. All game imagery, trademarks, and intellectual property remain the property of their respective owners.
        </p>
      </section>
    </div>
  );
}
