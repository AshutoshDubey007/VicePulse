import React from 'react';
import { Metadata } from 'next';
import { store } from '@/lib/store';
import { FeedClient } from '@/app/feed/FeedClient';
import { siteConfig } from '@/lib/seo/constants';
import { generateCollectionSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'GTA VI Discoveries Directory – Locations, Secrets & Vehicles',
  description:
    'Complete directory of verified GTA VI discoveries across the State of Leonida, including hidden locations, rare vehicles, easter eggs, and random encounters.',
  alternates: {
    canonical: `${siteConfig.url}/discoveries`,
  },
  openGraph: {
    title: 'GTA VI Discoveries Directory – Locations, Secrets & Vehicles',
    description:
      'Complete directory of verified GTA VI discoveries across the State of Leonida, including hidden locations, rare vehicles, easter eggs, and random encounters.',
    url: `${siteConfig.url}/discoveries`,
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('GTA VI Discoveries Directory')}&category=DIRECTORY`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTA VI Discoveries Directory – Locations, Secrets & Vehicles',
    description:
      'Complete directory of verified GTA VI discoveries across the State of Leonida, including hidden locations, rare vehicles, easter eggs, and random encounters.',
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('GTA VI Discoveries Directory')}&category=DIRECTORY`],
  },
};

export default async function DiscoveriesDirectoryPage() {
  const result = await store.getDiscoveries({ limit: 50 });

  const collectionSchema = generateCollectionSchema(
    'GTA VI Discoveries Directory',
    'Complete directory of verified GTA VI discoveries across the State of Leonida.',
    '/discoveries',
    result.items.map((d) => ({
      title: d.title,
      url: `/discoveries/${d.slug || d.id}`,
      image: d.evidenceImages?.[0]?.url,
    }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Discoveries', url: '/discoveries' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FeedClient initialDiscoveries={result.items} />
    </>
  );
}
