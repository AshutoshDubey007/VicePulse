import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { store } from '@/lib/store';
import { DiscoveryCard } from '@/components/DiscoveryCard';
import { EmptyState } from '@/components/vice/EmptyState';
import { siteConfig, CATEGORY_SEO_DATA } from '@/lib/seo/constants';
import { generateCollectionSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { ChevronRight, Radio } from 'lucide-react';

export const revalidate = 0;

const seoData = CATEGORY_SEO_DATA['unusual-event'];

export const metadata: Metadata = {
  title: seoData.title,
  description: seoData.description,
  alternates: {
    canonical: `${siteConfig.url}/discoveries/secret-activities`,
  },
  openGraph: {
    title: seoData.title,
    description: seoData.description,
    url: `${siteConfig.url}/discoveries/secret-activities`,
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('Secret Activities & Events in GTA VI')}&category=unusual-event`],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoData.title,
    description: seoData.description,
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('Secret Activities & Events in GTA VI')}&category=unusual-event`],
  },
};

export default async function SecretActivitiesPage() {
  const result = await store.getDiscoveries({ category: 'unusual-event', limit: 30 });
  const hasItems = result.items.length > 0;

  const collectionSchema = generateCollectionSchema(
    seoData.h1,
    seoData.description,
    '/discoveries/secret-activities',
    result.items.map((d) => ({
      title: d.title,
      url: `/discoveries/${d.slug || d.id}`,
      image: d.evidenceImages?.[0]?.url,
    }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Discoveries', url: '/discoveries' },
    { name: 'Secret Activities', url: '/discoveries/secret-activities' },
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-body text-[#F4F0E8] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-mono text-[#9B969F]">
        <Link href="/" className="hover:text-[#F4F0E8] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/discoveries" className="hover:text-[#F4F0E8] transition-colors">Discoveries</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#F4F0E8] font-bold" aria-current="page">Secret Activities</span>
      </nav>

      <header className="border-b border-[#28272F] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-orange font-mono text-xs uppercase font-bold tracking-wider">
          <Radio className="w-4 h-4" />
          <span>UNDERGROUND OPERATIONS & MISSIONS</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8] leading-none">
          {seoData.h1}
        </h1>
        <p className="font-body text-xs sm:text-sm text-[#9B969F] max-w-3xl leading-relaxed">
          {seoData.intro} Nighttime drag strips, contraband air-drops, and covert gameplay loops.
        </p>
      </header>

      {!hasItems ? (
        <EmptyState
          title="No secret activities logged yet."
          description="Reports will appear here as side operations are discovered."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {result.items.map((disc) => (
            <DiscoveryCard key={disc.id || disc.slug} discovery={disc} />
          ))}
        </div>
      )}
    </div>
  );
}
