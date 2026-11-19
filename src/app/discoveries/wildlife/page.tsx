import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { store } from '@/lib/store';
import { DiscoveryCard } from '@/components/DiscoveryCard';
import { EmptyState } from '@/components/vice/EmptyState';
import { siteConfig, CATEGORY_SEO_DATA } from '@/lib/seo/constants';
import { generateCollectionSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { ChevronRight, Eye } from 'lucide-react';

export const revalidate = 0;

const seoData = CATEGORY_SEO_DATA['wildlife'];

export const metadata: Metadata = {
  title: seoData.title,
  description: seoData.description,
  alternates: {
    canonical: `${siteConfig.url}/discoveries/wildlife`,
  },
  openGraph: {
    title: seoData.title,
    description: seoData.description,
    url: `${siteConfig.url}/discoveries/wildlife`,
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('GTA VI Wildlife Discoveries')}&category=wildlife`],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoData.title,
    description: seoData.description,
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('GTA VI Wildlife Discoveries')}&category=wildlife`],
  },
};

export default async function WildlifePage() {
  const result = await store.getDiscoveries({ category: 'wildlife', limit: 30 });
  const hasItems = result.items.length > 0;

  const collectionSchema = generateCollectionSchema(
    seoData.h1,
    seoData.description,
    '/discoveries/wildlife',
    result.items.map((d) => ({
      title: d.title,
      url: `/discoveries/${d.slug || d.id}`,
      image: d.evidenceImages?.[0]?.url,
    }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Discoveries', url: '/discoveries' },
    { name: 'Wildlife', url: '/discoveries/wildlife' },
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
        <span className="text-[#F4F0E8] font-bold" aria-current="page">Wildlife</span>
      </nav>

      <header className="border-b border-[#28272F] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-teal font-mono text-xs uppercase font-bold tracking-wider">
          <Eye className="w-4 h-4" />
          <span>LEONIDA FAUNA & WILDLIFE SURVEY</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8] leading-none">
          {seoData.h1}
        </h1>
        <p className="font-body text-xs sm:text-sm text-[#9B969F] max-w-3xl leading-relaxed">
          {seoData.intro} Habitat zones, apex predator behaviors, and swamp sightings.
        </p>
      </header>

      {!hasItems ? (
        <EmptyState
          title="No wildlife discoveries logged yet."
          description="Reports will appear here as animal sightings and behaviors are documented."
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
