import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/seo/constants';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export const metadata: Metadata = {
  title: 'Terms of Service – VicePulse',
  description: 'Terms of Service governing the use of the VicePulse platform, research engine, and interactive map.',
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Terms of Service', url: '/terms' },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 font-body text-[#F4F0E8] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <header className="border-b border-[#28272F] pb-8 space-y-2">
        <span className="font-mono text-xs uppercase font-bold text-orange tracking-widest">
          LEGAL AGREEMENT
        </span>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8]">
          TERMS OF SERVICE
        </h1>
        <p className="font-mono text-xs text-[#9B969F]">Last Updated: November 2026</p>
      </header>

      <section className="space-y-4 text-sm text-[#F4F0E8]/90 leading-relaxed">
        <h2 className="font-display text-xl uppercase text-[#F4F0E8]">1. Acceptance of Terms</h2>
        <p>
          By accessing or using VicePulse, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, you must discontinue use immediately.
        </p>

        <h2 className="font-display text-xl uppercase text-[#F4F0E8] pt-4">2. Non-Commercial Fan Project</h2>
        <p>
          VicePulse is an independent, non-affiliated gaming intelligence and discovery directory created by and for the Grand Theft Auto player community. We do not sell official game files, executable software, or copyrighted source assets.
        </p>

        <h2 className="font-display text-xl uppercase text-[#F4F0E8] pt-4">3. User Conduct</h2>
        <p>
          Users agree not to submit fraudulent, abusive, defamatory, or intentionally fabricated discovery reports. Deliberate submission of false coordinates or spam will result in immediate scout session revocation.
        </p>

        <h2 className="font-display text-xl uppercase text-[#F4F0E8] pt-4">4. Limitation of Liability</h2>
        <p>
          All information on VicePulse is provided on an &quot;as is&quot; and &quot;as available&quot; basis for informational and entertainment purposes. We make no representations or warranties regarding in-game availability following game title updates.
        </p>

        <h2 className="font-display text-xl uppercase text-[#F4F0E8] pt-4">5. Premium Subscriptions & Billing</h2>
        <p>
          VicePulse offers optional paid memberships (Scout Pro and Syndicate Elite) that provide extended research tools, classified overlays, and export capabilities. Payments are securely processed via Razorpay supporting UPI, credit/debit cards, and net banking.
        </p>
        <p>
          Subscriptions renew automatically unless cancelled prior to the end of the current billing cycle. Cancellations can be performed anytime from the <Link href="/billing" className="text-orange underline">Billing Desk</Link>. For full refund criteria and 7-day money-back terms, please review our official <Link href="/refund-policy" className="text-teal underline">Refund & Cancellation Policy</Link>.
        </p>

        <h2 className="font-display text-xl uppercase text-[#F4F0E8] pt-4">6. Contact & Support</h2>
        <p>
          For billing inquiries, payment receipts, or technical assistance, contact <a href="mailto:support@vicepulse.net" className="text-orange underline">support@vicepulse.net</a> or visit our <Link href="/contact" className="text-teal underline">Contact Desk</Link>.
        </p>
      </section>
    </div>
  );
}
