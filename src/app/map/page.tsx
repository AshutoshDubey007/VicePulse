import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { store } from '@/lib/store';
import { MapContainer } from '@/components/Map/MapContainer';
import { siteConfig } from '@/lib/seo/constants';
import { generateCollectionSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { MapPin, Compass, ArrowRight } from 'lucide-react';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Interactive GTA VI Leonida Map – Locations, Vehicles & Secrets',
  description:
    'Explore the interactive GTA VI tactical map of Leonida and Vice City. Discover verified coordinates for hidden bunkers, easter eggs, rare vehicle spawns, and dynamic events.',
  alternates: {
    canonical: `${siteConfig.url}/map`,
  },
  openGraph: {
    title: 'Interactive GTA VI Leonida Map – VicePulse',
    description:
      'Explore the interactive GTA VI tactical map of Leonida and Vice City. Discover verified coordinates for hidden bunkers, easter eggs, rare vehicle spawns, and dynamic events.',
    url: `${siteConfig.url}/map`,
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('Interactive GTA VI Leonida Map')}&category=MAP&badge=LEONIDA%20CARTOGRAPHY`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive GTA VI Leonida Map – VicePulse',
    description:
      'Explore the interactive GTA VI tactical map of Leonida and Vice City. Discover verified coordinates for hidden bunkers, easter eggs, rare vehicle spawns, and dynamic events.',
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('Interactive GTA VI Leonida Map')}&category=MAP&badge=LEONIDA%20CARTOGRAPHY`],
  },
};

export default async function MapPage() {
  const result = await store.getDiscoveries({ limit: 100 });
  const mappedDiscoveries = result.items.filter(
    (d) =>
      d.coordinates &&
      typeof d.coordinates.lat === 'number' &&
      d.coordinates.lat !== 0 &&
      d.coordinates.inGameGrid !== 'LOCATION_PENDING'
  );

  const collectionSchema = generateCollectionSchema(
    'Interactive GTA VI Leonida Map Directory',
    'Catalog of verified coordinate locations discovered across the State of Leonida in GTA VI.',
    '/map',
    mappedDiscoveries.map((d) => ({
      title: d.title,
      url: `/discoveries/${d.slug || d.id}`,
      image: d.evidenceImages?.[0]?.url,
    }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Interactive Map', url: '/map' },
  ]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-hidden relative flex flex-col bg-[#111114]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Main Interactive Map Canvas */}
      <MapContainer initialDiscoveries={result.items} />

      {/* Crawlable, Semantic Discovery Index for Search Engine Bots & Screen Readers (Section 15) */}
      <section
        aria-label="Crawlable Directory of Mapped Leonida Discoveries"
        className="sr-only focus-within:not-sr-only bg-[#1C1B20] text-[#F4F0E8] p-6 border-t border-[#28272F]"
      >
        <h2 className="font-display text-2xl uppercase">
          Documented Mapped Discoveries Across Leonida ({mappedDiscoveries.length})
        </h2>
        <p className="text-sm text-[#9B969F]">
          Index of verified coordinates, districts, and tactical grid sectors documented by the VicePulse intelligence network.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {mappedDiscoveries.map((disc) => (
            <li key={disc.id || disc.slug} className="p-2 border border-[#28272F] rounded-xs">
              <Link
                href={`/discoveries/${disc.slug || disc.id}`}
                className="text-orange hover:underline font-bold text-sm block"
              >
                {disc.title}
              </Link>
              <span className="text-xs text-[#9B969F] block">
                {disc.district} • Grid {disc.coordinates?.inGameGrid || 'TACTICAL'} ({disc.coordinates.lat.toFixed(4)}°N, {disc.coordinates.lng.toFixed(4)}°W)
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
