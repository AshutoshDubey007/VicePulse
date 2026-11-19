import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/seo/constants';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { Mail, MessageSquare, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact & Editorial Corrections Desk – VicePulse',
  description:
    'Contact the VicePulse editorial and research desk for discovery correction requests, creator attribution updates, or content removal.',
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
  openGraph: {
    title: 'Contact & Editorial Desk – VicePulse',
    description:
      'Contact the VicePulse editorial and research desk for discovery correction requests, creator attribution updates, or content removal.',
    url: `${siteConfig.url}/contact`,
  },
};

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 font-body text-[#F4F0E8] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <header className="border-b border-[#28272F] pb-8 space-y-3">
        <span className="font-mono text-xs uppercase font-bold text-orange tracking-widest">
          COMMUNICATIONS & DISPUTE RESOLUTION
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F0E8] leading-none">
          CONTACT & CORRECTIONS
        </h1>
        <p className="font-body text-base text-[#9B969F] max-w-2xl leading-relaxed">
          Reach our editorial desk for attribution corrections, content removal, or reporting invalid discoveries.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Creator Attribution & Corrections */}
        <div className="p-6 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-4">
          <div className="flex items-center gap-2.5 text-orange font-mono text-sm uppercase font-bold">
            <MessageSquare className="w-5 h-5" />
            <span>Editorial Corrections</span>
          </div>
          <p className="font-body text-xs text-[#9B969F] leading-relaxed">
            Did our autonomous engine miss important context from your video, guide, or post? Submit a correction with the URL and specific updates needed.
          </p>
          <div className="pt-2">
            <span className="font-mono text-xs text-[#F4F0E8] block">editorial@vicepulse.net</span>
          </div>
        </div>

        {/* Content Removal / Takedown */}
        <div className="p-6 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-4">
          <div className="flex items-center gap-2.5 text-red-400 font-mono text-sm uppercase font-bold">
            <ShieldAlert className="w-5 h-5" />
            <span>Content Removal Requests</span>
          </div>
          <p className="font-body text-xs text-[#9B969F] leading-relaxed">
            If you are the original creator of a video or image featured as evidence and wish to have the link or thumbnail removed, we process requests within 24 hours.
          </p>
          <div className="pt-2">
            <span className="font-mono text-xs text-[#F4F0E8] block">takedowns@vicepulse.net</span>
          </div>
        </div>

        {/* Payment & Subscription Support */}
        <div className="p-6 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-4">
          <div className="flex items-center gap-2.5 text-teal font-mono text-sm uppercase font-bold">
            <Mail className="w-5 h-5" />
            <span>Payments & Billing Support</span>
          </div>
          <p className="font-body text-xs text-[#9B969F] leading-relaxed">
            Need assistance with your Razorpay payment, invoice receipt, subscription cancellation, or 7-day refund guarantee request?
          </p>
          <div className="pt-2 space-y-1">
            <span className="font-mono text-xs text-[#F4F0E8] block">billing@vicepulse.net</span>
            <Link href="/refund-policy" className="text-orange text-xs underline block font-mono">
              View Refund & Cancellation Policy →
            </Link>
          </div>
        </div>
      </div>

      <section className="p-6 bg-[#1C1B20]/60 border border-[#28272F] rounded-sm space-y-3 font-mono text-xs text-[#9B969F]">
        <h3 className="font-bold text-[#F4F0E8] uppercase">Response Time Commitment</h3>
        <p className="leading-relaxed">
          The VicePulse desk reviews all inbound communication within 24-48 business hours. Please include the specific VicePulse discovery URL and supporting evidence links to ensure prompt handling.
        </p>
      </section>
    </div>
  );
}
