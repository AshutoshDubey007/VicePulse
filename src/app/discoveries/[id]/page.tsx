import React from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { store } from '@/lib/store';
import { DiscoveryDetailClient } from './DiscoveryDetailClient';
import { siteConfig } from '@/lib/seo/constants';
import { evaluateIndexability } from '@/lib/seo/indexingGate';
import { generateDiscoverySchema, generateBreadcrumbSchema } from '@/lib/seo/schema';

export const revalidate = 0; // Dynamic server rendering

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const discovery = await store.getDiscoveryById(params.id);

  if (!discovery) {
    return {
      title: 'Discovery Not Found – VicePulse',
      description: 'The requested GTA VI discovery could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const evalResult = evaluateIndexability(discovery);
  const cleanTitle = `${discovery.title} – GTA 6 Discovery | ${siteConfig.name}`;
  const cleanDesc = discovery.description
    ? `${discovery.description.slice(0, 155)}... Reported in ${discovery.district}, GTA VI State of Leonida.`
    : `Investigate the reported ${discovery.title} in GTA VI, including location coordinates, verification status, and player evidence.`;

  const canonicalUrl = `${siteConfig.url}/discoveries/${discovery.slug || discovery.id}`;
  const ogImage = discovery.evidenceImages?.[0]?.url
    ? (discovery.evidenceImages[0].url.startsWith('http')
        ? discovery.evidenceImages[0].url
        : `${siteConfig.url}${discovery.evidenceImages[0].url}`)
    : `${siteConfig.url}/api/og?title=${encodeURIComponent(discovery.title)}&category=${encodeURIComponent(discovery.category)}&badge=${encodeURIComponent(discovery.verificationStatus.replace('_', ' ').toUpperCase())}`;

  return {
    title: cleanTitle,
    description: cleanDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: cleanTitle,
      description: cleanDesc,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: discovery.title,
        },
      ],
      publishedTime: discovery.createdAt ? new Date(discovery.createdAt).toISOString() : undefined,
      modifiedTime: discovery.updatedAt ? new Date(discovery.updatedAt).toISOString() : undefined,
      section: discovery.category.replace('-', ' '),
      tags: discovery.tags || ['GTA 6', 'GTA VI', 'Leonida', discovery.category],
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanDesc,
      images: [ogImage],
      creator: '@VicePulseHQ',
    },
    robots: {
      index: evalResult.isIndexable,
      follow: true,
      googleBot: {
        index: evalResult.isIndexable,
        follow: true,
        'max-image-preview': 'large',
      },
    },
  };
}

export default async function DiscoveryPage({ params }: PageProps) {
  const discovery = await store.getDiscoveryById(params.id);

  if (!discovery) {
    notFound();
  }

  // Canonical Permanent 308 Redirect: If accessed via raw 24-hex Mongo ID, redirect to clean slug
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(params.id);
  if (isMongoId && discovery.slug && params.id !== discovery.slug) {
    permanentRedirect(`/discoveries/${discovery.slug}`);
  }

  const [comments, similarResult] = await Promise.all([
    store.getComments(discovery.id),
    store.getDiscoveries({ district: discovery.district, limit: 4 }),
  ]);

  const similarDiscoveries = similarResult.items.filter((d) => d.id !== discovery.id).slice(0, 3);

  // Generate Schemas
  const discoverySchema = generateDiscoverySchema(discovery);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Discoveries', url: '/discoveries' },
    { name: discovery.category.replace('-', ' '), url: `/discoveries/${discovery.category}` },
    { name: discovery.title, url: `/discoveries/${discovery.slug || discovery.id}` },
  ]);

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(discoverySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <DiscoveryDetailClient
        discovery={discovery}
        comments={comments}
        similarDiscoveries={similarDiscoveries}
      />
    </>
  );
}
