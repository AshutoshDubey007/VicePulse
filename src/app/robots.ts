import { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/seo/constants';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/',
          '/profile',
          '/profile/*',
          '/settings',
          '/settings/*',
          '/billing',
          '/billing/*',
          '/auth',
          '/auth/*',
          '/submit',
          '/submit/*',
        ],
      },
      // Explicit rules for AI Search & Answer Engine User-Agents (AEO & GEO)
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'],
        allow: [
          '/',
          '/discoveries',
          '/discoveries/*',
          '/discovery/*',
          '/locations',
          '/easter-eggs',
          '/encounters',
          '/vehicles',
          '/map',
          '/news',
          '/news/*',
          '/about',
          '/methodology',
          '/sources',
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/profile/*',
          '/settings/*',
          '/billing/*',
          '/auth/*',
          '/submit/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
