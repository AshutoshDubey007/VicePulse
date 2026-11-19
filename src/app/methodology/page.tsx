import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/seo/constants';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { ShieldCheck, HelpCircle, UserCheck, AlertTriangle, Search, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verification Methodology & Intelligence Protocol – VicePulse',
  description:
    'Detailed breakdown of how VicePulse evaluates, verifies, triangulates, and audits GTA VI discoveries, easter eggs, and vehicle spawns.',
  alternates: {
    canonical: `${siteConfig.url}/methodology`,
  },
  openGraph: {
    title: 'Verification Methodology – VicePulse GTA VI Intelligence',
    description:
      'Detailed breakdown of how VicePulse evaluates, verifies, triangulates, and audits GTA VI discoveries, easter eggs, and vehicle spawns.',
    url: `${siteConfig.url}/methodology`,
  },
};

export default function MethodologyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Methodology', url: '/methodology' },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 font-body text-[#F4F0E8] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <header className="border-b border-[#28272F] pb-8 space-y-3">
        <span className="font-mono text-xs uppercase font-bold text-orange tracking-widest">
          EDITORIAL & DATA QUALITY PROTOCOL
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F0E8] leading-none">
          VERIFICATION METHODOLOGY
        </h1>
        <p className="font-body text-base text-[#9B969F] max-w-2xl leading-relaxed">
          How VicePulse ingests, evaluates, corroborates, and flags GTA VI discovery reports without inventing information.
        </p>
      </header>

      {/* 1. Verification Matrix */}
      <section className="space-y-6">
        <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          The Four Verification Tiers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tier 1: Reported */}
          <div className="p-5 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-sun font-mono text-xs font-bold uppercase">
              <HelpCircle className="w-4 h-4" />
              <span>1. REPORTED</span>
            </div>
            <p className="font-body text-xs text-[#F4F0E8]/90 leading-relaxed">
              A preliminary report gathered from a single external creator, forum thread, or scout submission. The discovery is logged in our feed for public awareness, but marked with a dashed telemetry border.
            </p>
          </div>

          {/* Tier 2: Corroborated */}
          <div className="p-5 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-teal font-mono text-xs font-bold uppercase">
              <Search className="w-4 h-4" />
              <span>2. CORROBORATED</span>
            </div>
            <p className="font-body text-xs text-[#F4F0E8]/90 leading-relaxed">
              Two or more independent community sources have reported identical landmarks, vehicle spawns, or audio anomalies. Evidence cross-referencing indicates high probability of authenticity.
            </p>
          </div>

          {/* Tier 3: Community Verified */}
          <div className="p-5 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-teal font-mono text-xs font-bold uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>3. COMMUNITY VERIFIED</span>
            </div>
            <p className="font-body text-xs text-[#F4F0E8]/90 leading-relaxed">
              Multiple verified scouts or platform users have confirmed the finding in-game with timestamped video clips, high-resolution screenshots, or exact coordinate telemetry.
            </p>
          </div>

          {/* Tier 4: Disputed */}
          <div className="p-5 bg-[#1C1B20] border border-red-500/40 rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>4. DISPUTED</span>
            </div>
            <p className="font-body text-xs text-[#F4F0E8]/90 leading-relaxed">
              Community players report that the discovery cannot be replicated, was fabricated by a third party, or has been patched by Rockstar Games. Disputed records are de-indexed from search engines.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Autonomous AI Extraction Boundaries */}
      <section className="space-y-4 border-t border-[#28272F] pt-8">
        <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          How AI Is Used (and What It Never Does)
        </h2>
        <div className="p-6 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-4 font-mono text-xs leading-relaxed">
          <div className="space-y-1">
            <span className="text-teal font-bold uppercase">Permitted AI Actions:</span>
            <p className="text-[#9B969F]">
              Parsing long YouTube descriptions and Reddit threads to extract district names, vehicle models, time-of-day prerequisites, and step-by-step walkthroughs into structured JSON objects.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-red-400 font-bold uppercase">Strict AI Constraints:</span>
            <p className="text-[#9B969F]">
              AI models are strictly prohibited from generating fictional GTA VI discoveries, guessing in-game coordinates when none were stated in the source, or inflating confirmation counts. If coordinates are missing, they remain Location Pending.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Correction & Removal Requests */}
      <section className="space-y-4 border-t border-[#28272F] pt-8">
        <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          Corrections & Content Removal Requests
        </h2>
        <p className="font-body text-sm sm:text-base text-[#F4F0E8]/90 leading-relaxed">
          If you are a content creator whose video or guide was referenced on VicePulse and you would like the link updated, attribution adjusted, or the entry removed, please submit a request through our <Link href="/contact" className="text-orange hover:underline">Contact Desk</Link>.
        </p>
      </section>
    </div>
  );
}
