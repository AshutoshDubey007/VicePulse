import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Discovery from '@/models/Discovery';
import NewsArticle from '@/models/NewsArticle';
import { siteConfig } from '@/lib/seo/constants';
import { evaluateIndexability } from '@/lib/seo/indexingGate';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const now = new Date();

  // 1. Core static & informational indexable pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/discoveries`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/vehicles`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/sources`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. Category Pages
  const categoryRoutes: MetadataRoute.Sitemap = [
    'hidden-locations',
    'rare-vehicles',
    'easter-eggs',
    'random-encounters',
    'wildlife',
    'secret-activities',
  ].map((catSlug) => ({
    url: `${baseUrl}/discoveries/${catSlug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Legacy category aliases
  const categoryAliasRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/locations`, lastModified: now, changeFrequency: 'daily', priority: 0.75 },
    { url: `${baseUrl}/easter-eggs`, lastModified: now, changeFrequency: 'daily', priority: 0.75 },
    { url: `${baseUrl}/encounters`, lastModified: now, changeFrequency: 'daily', priority: 0.75 },
  ];

  // 3. Dynamic published news articles
  let newsRoutes: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const articles = await NewsArticle.find({ status: 'published' })
      .select('slug publishedAt updatedAt')
      .lean();

    newsRoutes = articles.map((article: any) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : (article.publishedAt ? new Date(article.publishedAt) : now),
      changeFrequency: 'weekly',
      priority: 0.75,
    }));
  } catch (err) {
    console.warn('[Sitemap] Failed to query news:', err);
  }

  // 4. Dynamic published & indexable discoveries (Filtered via Indexing Gate)
  let discoveryRoutes: MetadataRoute.Sitemap = [];
  try {
    const rawDiscoveries = await Discovery.find({})
      .select('title slug category district description source verificationStatus evidenceImages updatedAt createdAt')
      .lean();

    discoveryRoutes = rawDiscoveries
      .filter((d: any) => {
        const evalResult = evaluateIndexability(d);
        return evalResult.isIndexable;
      })
      .map((d: any) => ({
        url: `${baseUrl}/discoveries/${d.slug || d._id}`,
        lastModified: d.updatedAt ? new Date(d.updatedAt) : (d.createdAt ? new Date(d.createdAt) : now),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
  } catch (err) {
    console.warn('[Sitemap] Failed to query discoveries:', err);
  }

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...categoryAliasRoutes,
    ...newsRoutes,
    ...discoveryRoutes,
  ];
}
