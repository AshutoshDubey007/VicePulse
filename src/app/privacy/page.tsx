import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/seo/constants';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Privacy Policy – VicePulse',
  description: 'Our transparent privacy commitment: no invasive trackers, no selling of user data, and minimal data collection.',
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
};

export default function PrivacyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy' },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 font-body text-[#F4F0E8] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <header className="border-b border-[#28272F] pb-8 space-y-2">
        <span className="font-mono text-xs uppercase font-bold text-orange tracking-widest">
          LEGAL & PRIVACY STANDARDS
        </span>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8]">
          PRIVACY POLICY
        </h1>
        <p className="font-mono text-xs text-[#9B969F]">Last Updated: November 2026</p>
      </header>

      <section className="space-y-4 text-sm text-[#F4F0E8]/90 leading-relaxed">
        <h2 className="font-display text-xl uppercase text-[#F4F0E8]">1. Minimal Data Collection Principle</h2>
        <p>
          VicePulse operates on a privacy-first principle. We do not use third-party behavioral ad trackers or cross-site fingerprinting scripts. We do not sell, rent, or trade your personal information.
        </p>

        <h2 className="font-display text-xl uppercase text-[#F4F0E8] pt-4">2. Information We Process</h2>
        <ul className="list-disc pl-5 space-y-2 text-[#9B969F]">
          <li><strong>Authentication Data:</strong> When you log in as a field scout, we store your username, email, and authentication tokens securely via NextAuth.</li>
          <li><strong>User Submissions:</strong> Discoveries, location notes, and comments submitted by registered scouts are publicly attributed to your chosen scout handle.</li>
          <li><strong>Payment Processing:</strong> If you upgrade to a scout membership, transactions are processed directly by our payment processor (Razorpay). VicePulse does not store credit card numbers.</li>
        </ul>

        <h2 className="font-display text-xl uppercase text-[#F4F0E8] pt-4">3. Aggregated Public Data</h2>
        <p>
          VicePulse ingests publicly available content (such as public YouTube video descriptions, Reddit gaming threads, and RSS news feeds) solely for the purpose of research synthesis and attribution under fair use principles.
        </p>

        <h2 className="font-display text-xl uppercase text-[#F4F0E8] pt-4">4. Your Rights & Data Deletion</h2>
        <p>
          You may request deletion of your account and personal data at any time by contacting <span className="font-mono text-orange">privacy@vicepulse.net</span>.
        </p>
      </section>
    </div>
  );
}
