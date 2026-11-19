import { Discovery, NewsArticle } from '@/types';
import { siteConfig } from './constants';

/**
 * Schema.org Structured Data Generator (JSON-LD)
 * Fully compliant with Google Rich Results and Schema.org standards.
 */

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    alternateName: siteConfig.legalName,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/feed?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/images/hero/vice-city-hero.webp`,
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/hero/vice-city-hero.webp`,
    description: siteConfig.description,
    sameAs: [
      siteConfig.social.x,
      siteConfig.social.youtube,
      siteConfig.social.reddit,
    ].filter(Boolean),
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generateDiscoverySchema(discovery: Discovery) {
  const publishedDate = discovery.createdAt || new Date().toISOString();
  const modifiedDate = discovery.updatedAt || publishedDate;
  const canonicalUrl = `${siteConfig.url}/discoveries/${discovery.slug || discovery.id}`;
  const images = (discovery.evidenceImages && discovery.evidenceImages.length > 0)
    ? discovery.evidenceImages.map((img) => img.url.startsWith('http') ? img.url : `${siteConfig.url}${img.url}`)
    : [`${siteConfig.url}/api/og?title=${encodeURIComponent(discovery.title)}&category=${encodeURIComponent(discovery.category)}`];

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: discovery.title,
    description: discovery.description,
    image: images,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: discovery.source?.author || discovery.submittedBy?.username || 'VicePulse Scout',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/hero/vice-city-hero.webp`,
      },
    },
    about: {
      '@type': 'Thing',
      name: 'Grand Theft Auto VI',
      sameAs: 'https://en.wikipedia.org/wiki/Grand_Theft_Auto_VI',
    },
    contentLocation: {
      '@type': 'Place',
      name: discovery.district || discovery.locationName || 'State of Leonida',
      geo: (discovery.coordinates && discovery.coordinates.lat !== 0)
        ? {
            '@type': 'GeoCoordinates',
            latitude: discovery.coordinates.lat,
            longitude: discovery.coordinates.lng,
          }
        : undefined,
    },
  };
}

export function generateNewsArticleSchema(article: NewsArticle) {
  const publishedDate = article.publishedAt || new Date().toISOString();
  const canonicalUrl = `${siteConfig.url}/news/${article.slug || article.id}`;
  const imageUrl = article.bannerImage
    ? (article.bannerImage.startsWith('http') ? article.bannerImage : `${siteConfig.url}${article.bannerImage}`)
    : `${siteConfig.url}/api/og?title=${encodeURIComponent(article.title)}&category=news`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: article.title,
    description: article.excerpt || article.content?.slice(0, 160) || '',
    image: [imageUrl],
    datePublished: publishedDate,
    dateModified: article.updatedAt || publishedDate,
    author: {
      '@type': 'Organization',
      name: article.author?.name || article.sources?.[0]?.platform || 'VicePulse Wire Desk',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/hero/vice-city-hero.webp`,
      },
    },
  };
}

export function generateCollectionSchema(
  title: string,
  description: string,
  url: string,
  items: Array<{ title: string; url: string; image?: string }>
) {
  const canonicalUrl = url.startsWith('http') ? url : `${siteConfig.url}${url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.slice(0, 30).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.title,
        url: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
        image: item.image,
      })),
    },
  };
}
