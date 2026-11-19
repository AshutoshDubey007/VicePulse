import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import NewsArticle from '@/models/NewsArticle';
import Discovery from '@/models/Discovery';
import { ArticleClient } from './ArticleClient';
import { NewsArticle as NewsArticleType, Discovery as DiscoveryType } from '@/types';
import { siteConfig } from '@/lib/seo/constants';
import { generateNewsArticleSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';

export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  await connectDB();
  const doc = (await NewsArticle.findOne({ slug, status: 'published' }).lean()) as any;

  if (!doc) {
    return {
      title: 'Article Not Found – VicePulse',
      description: 'The requested GTA VI news report could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const cleanTitle = `${doc.title} – GTA VI News Wire | ${siteConfig.name}`;
  const cleanDesc = doc.excerpt || doc.content?.slice(0, 155) || `Read the latest GTA VI reporting on ${doc.title}.`;
  const canonicalUrl = `${siteConfig.url}/news/${doc.slug}`;
  const ogImage = doc.bannerImage
    ? (doc.bannerImage.startsWith('http') ? doc.bannerImage : `${siteConfig.url}${doc.bannerImage}`)
    : `${siteConfig.url}/api/og?title=${encodeURIComponent(doc.title)}&category=news`;

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
          alt: doc.title,
        },
      ],
      publishedTime: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : undefined,
      modifiedTime: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
      section: doc.category || 'GTA VI News',
      tags: doc.tags || ['GTA 6', 'GTA VI', 'Rockstar Games'],
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanDesc,
      images: [ogImage],
      creator: '@VicePulseHQ',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = params;
  await connectDB();

  const doc = (await NewsArticle.findOne({ slug, status: 'published' }).lean()) as any;

  if (!doc) {
    notFound();
  }

  // Populate related discoveries
  let relatedDiscoveries: DiscoveryType[] = [];
  if (doc?.relatedDiscoveryIds && doc.relatedDiscoveryIds.length > 0) {
    const rawDisc = await Discovery.find({
      _id: { $in: doc.relatedDiscoveryIds },
    }).lean();

    relatedDiscoveries = rawDisc.map((d: any) => ({
      id: String(d._id),
      title: d.title,
      slug: d.slug,
      category: d.category,
      subcategory: d.subcategory,
      locationName: d.locationName,
      district: d.district,
      coordinates: d.coordinates,
      inGameCoordinates: d.inGameCoordinates,
      coordinateProvenance: d.coordinateProvenance,
      description: d.description,
      stepsToFind: d.stepsToFind || [],
      evidenceImages: d.evidenceImages || [],
      source: d.source,
      verificationStatus: d.verificationStatus,
      verificationReason: d.verificationReason,
      confirmationsCount: d.confirmationsCount || 0,
      confirmedBy: d.confirmedBy || [],
      disputeCount: d.disputeCount || 0,
      disputes: d.disputes || [],
      tags: d.tags || [],
      submittedBy: d.submittedBy,
      createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
      featured: d.featured || false,
    }));
  }

  const article: NewsArticleType = {
    id: String(doc._id),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    content: doc.content,
    category: doc.category,
    tags: doc.tags || [],
    bannerImage: doc.bannerImage || '/images/hero/vice-city-hero.webp',
    sources: doc.sources || [],
    relatedDiscoveryIds: doc.relatedDiscoveryIds?.map((id: any) => String(id)) || [],
    author: doc.author || {
      name: 'VicePulse Wire Desk',
      role: 'Autonomous Wire Intelligence',
    },
    confidenceScore: doc.confidenceScore || 90,
    status: doc.status || 'published',
    featured: doc.featured || false,
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).toISOString() : new Date().toISOString(),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };

  const newsArticleSchema = generateNewsArticleSchema(article);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'News Wire', url: '/news' },
    { name: article.title, url: `/news/${article.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ArticleClient article={article} relatedDiscoveries={relatedDiscoveries} />
    </>
  );
}
