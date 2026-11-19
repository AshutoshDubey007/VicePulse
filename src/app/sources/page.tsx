import React from 'react';
import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import ResearchSource from '@/models/ResearchSource';
import { SourcesClient } from './SourcesClient';
import { siteConfig } from '@/lib/seo/constants';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Monitored Sources & Research Origin Network – VicePulse',
  description:
    'Transparency directory of all YouTube channels, Reddit gaming communities, and news RSS feeds polled by the VicePulse autonomous research engine.',
  alternates: {
    canonical: `${siteConfig.url}/sources`,
  },
  openGraph: {
    title: 'Monitored Sources Directory – VicePulse',
    description:
      'Transparency directory of all YouTube channels, Reddit gaming communities, and news RSS feeds polled by the VicePulse autonomous research engine.',
    url: `${siteConfig.url}/sources`,
  },
};

export default async function SourcesPage() {
  await connectDB();

  let sources: any[] = [];
  try {
    const docs = await ResearchSource.find().sort({ yieldCount: -1 }).lean();
    sources = docs.map((d: any) => ({
      id: String(d._id),
      name: d.name,
      platform: d.platform,
      url: d.url,
      yieldCount: d.yieldCount || 0,
      reliabilityScore: d.reliabilityScore || 4,
      lastPolledAt: d.lastPolledAt ? new Date(d.lastPolledAt).toISOString() : null,
      status: d.active ? 'active' : 'paused',
    }));
  } catch (err) {
    console.warn('Failed to load sources from DB:', err);
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Monitored Sources', url: '/sources' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SourcesClient sources={sources} />
    </>
  );
}
