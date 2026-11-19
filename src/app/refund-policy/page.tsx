import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/seo/constants';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { ShieldCheck, RefreshCw, Clock, Mail, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy – VicePulse',
  description:
    'Official Refund and Cancellation Policy for VicePulse Scout Pro and Syndicate Elite subscriptions. Transparent 7-day guarantee, cancellation process, and settlement terms.',
  alternates: {
    canonical: `${siteConfig.url}/refund-policy`,
  },
  openGraph: {
    title: 'Refund & Cancellation Policy – VicePulse',
    description:
      'Official Refund and Cancellation Policy for VicePulse Scout Pro and Syndicate Elite subscriptions. Transparent 7-day guarantee, cancellation process, and settlement terms.',
    url: `${siteConfig.url}/refund-policy`,
  },
};

export default function RefundPolicyPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Refund Policy', url: '/refund-policy' },
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 font-body text-[#F4F0E8] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <header className="border-b border-[#28272F] pb-8 space-y-3">
        <span className="font-mono text-xs uppercase font-bold text-orange tracking-widest flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal" />
          COMMERCIAL COMPLIANCE & BILLING PROTOCOLS
        </span>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F0E8] leading-none">
          REFUND & CANCELLATION POLICY
        </h1>
        <p className="font-body text-base text-[#9B969F] max-w-2xl leading-relaxed">
          At VicePulse, we maintain clear, fair, and transparent billing operations for all digital memberships, including Leonida Scout Pro and Syndicate Elite tiers.
        </p>
        <p className="font-mono text-xs text-[#9B969F]">Effective Date: November 2026</p>
      </header>

      {/* Key Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
        <div className="p-5 bg-[#1C1B20] border border-[#28272F] space-y-2">
          <div className="text-teal font-black uppercase text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            7-Day Guarantee
          </div>
          <p className="text-[#9B969F] leading-relaxed">
            Full refund eligibility within 7 calendar days of your initial premium membership upgrade.
          </p>
        </div>
        <div className="p-5 bg-[#1C1B20] border border-[#28272F] space-y-2">
          <div className="text-orange font-black uppercase text-sm flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            Instant Cancellation
          </div>
          <p className="text-[#9B969F] leading-relaxed">
            Cancel automatic recurring renewals with one click from your account billing desk at any time.
          </p>
        </div>
        <div className="p-5 bg-[#1C1B20] border border-[#28272F] space-y-2">
          <div className="text-sun font-black uppercase text-sm flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            5–7 Day Settlement
          </div>
          <p className="text-[#9B969F] leading-relaxed">
            Approved refunds are credited directly back to your original payment method (UPI, cards, or net banking).
          </p>
        </div>
      </div>

      <section className="space-y-8 text-sm text-[#F4F0E8]/90 leading-relaxed font-body">
        <div className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8] border-b border-[#28272F] pb-2">
            1. Scope of Policy
          </h2>
          <p>
            This policy applies to all digital subscription plans purchased through VicePulse, including monthly and annual tiers of <strong>Scout Pro</strong> and <strong>Syndicate Elite</strong>. All transactions are securely routed through authorized payment gateways including Razorpay and partner clearing networks.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8] border-b border-[#28272F] pb-2">
            2. Cancellation Policy
          </h2>
          <p>
            You may cancel your subscription at any time without penalty or cancellation fees. To cancel:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#9B969F]">
            <li>Log in to your VicePulse terminal account.</li>
            <li>Navigate to the <Link href="/billing" className="text-orange underline hover:text-orange-hover">Billing Desk</Link>.</li>
            <li>Click <em>&quot;Cancel Subscription&quot;</em> under your active plan details and confirm.</li>
          </ul>
          <p className="pt-2">
            Upon cancellation:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#9B969F]">
            <li>Your membership will remain fully operational until the end of the current paid billing cycle (e.g. through the remainder of your 30-day or 365-day term).</li>
            <li>No subsequent renewal fees will be charged to your card, UPI account, or digital wallet.</li>
            <li>You will receive an automated email confirmation confirming that renewal has been stopped.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8] border-b border-[#28272F] pb-2">
            3. 7-Day Money-Back Guarantee & Refund Eligibility
          </h2>
          <p>
            We stand behind our intelligence platform. If you are not satisfied with your Scout Pro or Syndicate Elite membership:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#9B969F]">
            <li><strong>First-Time Upgrades:</strong> You are eligible for a 100% full refund if requested within <strong>7 days</strong> of your initial upgrade payment.</li>
            <li><strong>Technical Issues:</strong> If you experienced persistent technical malfunctions preventing access to premium satellite layers or data exports that could not be resolved by our support team, you are eligible for a pro-rated or full refund.</li>
            <li><strong>Billing Errors:</strong> In the unlikely event of duplicate charges, an immediate full reversal is issued upon notification.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8] border-b border-[#28272F] pb-2">
            4. Non-Refundable Scenarios
          </h2>
          <p>Refunds cannot be issued under the following conditions:</p>
          <ul className="list-disc pl-6 space-y-1.5 text-[#9B969F]">
            <li>Refund requests submitted after 7 days from the transaction date on standard monthly renewals.</li>
            <li>Accounts suspended or terminated due to willful terms violations, such as automated data scraping, malicious coordinate fabrication, or harassment.</li>
            <li>Changes in personal preference or in-game storyline progress outside the 7-day guarantee window.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8] border-b border-[#28272F] pb-2">
            5. How to Request a Refund
          </h2>
          <p>
            To submit a refund request, contact our billing desk directly:
          </p>
          <div className="p-5 bg-[#17191B] border border-[#2E333B] font-mono text-xs space-y-2">
            <div><strong className="text-orange">Billing Email:</strong> <a href="mailto:billing@vicepulse.net" className="text-teal underline">billing@vicepulse.net</a></div>
            <div><strong className="text-orange">Support Desk:</strong> <a href="mailto:support@vicepulse.net" className="text-teal underline">support@vicepulse.net</a></div>
            <div><strong className="text-orange">Required Information:</strong> VicePulse Username, Order ID (starts with <code>order_</code>), and Payment ID.</div>
          </div>
          <p className="pt-2 text-[#9B969F]">
            Our finance team processes all valid refund requests within <strong>24 to 48 hours</strong>. Once initiated, funds typically reflect in your bank account, credit card statement, or UPI app within <strong>5 to 7 business days</strong>, subject to your bank&apos;s settlement schedule.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8] border-b border-[#28272F] pb-2">
            6. Statutory Consumer Rights
          </h2>
          <p>
            Nothing in this policy limits or affects your statutory consumer rights under applicable Indian consumer protection regulations (including the Consumer Protection Act, 2019) or relevant international consumer protection statutes.
          </p>
        </div>
      </section>

      <footer className="pt-8 border-t border-[#28272F] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#9B969F]">
        <div>
          Questions? Contact <a href="mailto:support@vicepulse.net" className="text-orange underline">support@vicepulse.net</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-cream">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-cream">Privacy Policy</Link>
          <Link href="/billing" className="hover:text-cream">Billing Terminal</Link>
        </div>
      </footer>
    </div>
  );
}
