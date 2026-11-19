import React from 'react';
import { Metadata } from 'next';
import { store } from '@/lib/store';
import connectDB from '@/lib/mongodb';
import GtaEntity from '@/models/GtaEntity';
import { VehiclesClient } from './VehiclesClient';
import { siteConfig, CATEGORY_SEO_DATA } from '@/lib/seo/constants';
import { generateCollectionSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';

export const revalidate = 0;

const seoData = CATEGORY_SEO_DATA['rare-vehicle'];

export const metadata: Metadata = {
  title: seoData.title,
  description: seoData.description,
  alternates: {
    canonical: `${siteConfig.url}/vehicles`,
  },
  openGraph: {
    title: seoData.title,
    description: seoData.description,
    url: `${siteConfig.url}/vehicles`,
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('GTA VI Vehicles & Rare Spawns')}&category=rare-vehicle`],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoData.title,
    description: seoData.description,
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('GTA VI Vehicles & Rare Spawns')}&category=rare-vehicle`],
  },
};

export default async function VehiclesPage() {
  await connectDB();
  const vehicles = await store.getVehicles();
  const rawCatalogue = await GtaEntity.find({ type: 'vehicle' }).lean();
  const catalogueVehicles = JSON.parse(JSON.stringify(rawCatalogue));

  const collectionSchema = generateCollectionSchema(
    seoData.h1,
    seoData.description,
    '/vehicles',
    vehicles.map((v) => ({
      title: v.name,
      url: `/discoveries/${v.id}`,
      image: v.evidenceImage,
    }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Discoveries', url: '/discoveries' },
    { name: 'Rare Vehicles', url: '/vehicles' },
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
      <VehiclesClient
        initialVehicles={vehicles}
        catalogueVehicles={catalogueVehicles}
      />
    </>
  );
}
