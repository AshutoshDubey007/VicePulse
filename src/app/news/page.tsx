import React from 'react';
import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import NewsArticle from '@/models/NewsArticle';
import { NewsClient } from './NewsClient';
import { NewsArticle as NewsArticleType } from '@/types';
import { siteConfig } from '@/lib/seo/constants';
import { generateCollectionSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'GTA VI News & Updates Wire – Rockstar Announcements & Community Reports',
  description:
    'Stay updated with the latest GTA VI official announcements, Rockstar Newswire analysis, community investigative dispatches, and gameplay revelations.',
  alternates: {
    canonical: `${siteConfig.url}/news`,
  },
  openGraph: {
    title: 'GTA VI News & Updates Wire – VicePulse',
    description:
      'Stay updated with the latest GTA VI official announcements, Rockstar Newswire analysis, community investigative dispatches, and gameplay revelations.',
    url: `${siteConfig.url}/news`,
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('GTA VI News & Updates Wire')}&category=news`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTA VI News & Updates Wire – VicePulse',
    description:
      'Stay updated with the latest GTA VI official announcements, Rockstar Newswire analysis, community investigative dispatches, and gameplay revelations.',
    images: [`${siteConfig.url}/api/og?title=${encodeURIComponent('GTA VI News & Updates Wire')}&category=news`],
  },
};

export default async function NewsPage() {
  let articles: NewsArticleType[] = [];

  try {
    await connectDB();
    const docs = await NewsArticle.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(30)
      .lean();

    articles = docs.map((doc: any) => ({
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
    }));
  } catch (err) {
    console.warn('Failed to load news articles from MongoDB:', err);
  }

  const collectionSchema = generateCollectionSchema(
    'GTA VI News & Updates Wire',
    'Stay updated with the latest GTA VI official announcements, Rockstar Newswire analysis, and community investigative dispatches.',
    '/news',
    articles.map((a) => ({
      title: a.title,
      url: `/news/${a.slug}`,
      image: a.bannerImage,
    }))
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'News Wire', url: '/news' },
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
      <NewsClient initialArticles={articles} />
    </>
  );
}
