'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ViceImage } from '@/components/vice/ViceImage';
import { NewsArticle, Discovery } from '@/types';
import { 
  ArrowLeft, 
  ExternalLink, 
  Share2, 
  Check, 
  Calendar, 
  MapPin,
  ArrowRight
} from 'lucide-react';

interface ArticleClientProps {
  article: NewsArticle;
  relatedDiscoveries: Discovery[];
}

export const ArticleClient: React.FC<ArticleClientProps> = ({ article, relatedDiscoveries }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const paragraphs = article.content ? article.content.split('\n\n') : [];

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-body text-[#F4F0E8] min-h-screen">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-[#28272F] pb-4">
        <Link
          href="/news"
          className="font-mono text-xs uppercase font-bold text-[#9B969F] hover:text-[#F4F0E8] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Newswire</span>
        </Link>

        <button
          onClick={handleCopyLink}
          className="px-3 py-1.5 bg-[#1C1B20] border border-[#28272F] rounded-sm font-mono text-xs text-[#9B969F] hover:text-[#F4F0E8] flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-teal" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Share'}</span>
        </button>
      </div>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="uppercase font-bold text-orange px-2 py-0.5 bg-[#1C1B20] border border-[#28272F] rounded-xs">
            {article.category}
          </span>
          <span className="text-[#9B969F] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-orange" />
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#F4F0E8] leading-tight">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="font-body text-base sm:text-lg text-[#F4F0E8]/90 leading-relaxed font-medium">
            {article.excerpt}
          </p>
        )}
      </header>

      {/* Banner Image */}
      {article.bannerImage && (
        <div className="relative h-64 sm:h-96 w-full bg-[#111114] border border-[#28272F] rounded-sm overflow-hidden">
          <ViceImage
            src={article.bannerImage}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-5 text-sm sm:text-base text-[#F4F0E8]/90 leading-relaxed border-t border-[#28272F] pt-6 font-body">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      {/* Real Source Provenance */}
      {article.sources && article.sources.length > 0 && (
        <div className="p-4 bg-[#1C1B20] border border-[#28272F] rounded-sm space-y-2 font-mono text-xs">
          <span className="text-[#9B969F] block text-[10px] uppercase font-bold">
            Cited Sources & Wire Feeds
          </span>
          <div className="space-y-1.5">
            {article.sources.map((src, i) => (
              <div key={i} className="flex items-center justify-between text-[#F4F0E8]">
                <span>{src.title || src.platform}</span>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>View Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Discoveries (Only if real) */}
      {relatedDiscoveries && relatedDiscoveries.length > 0 && (
        <div className="space-y-4 border-t border-[#28272F] pt-8">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
            Referenced Discoveries
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedDiscoveries.map((disc) => (
              <Link
                key={disc.id || disc.slug}
                href={`/discoveries/${disc.id || disc.slug}`}
                className="p-4 bg-[#1C1B20] border border-[#28272F] hover:border-[#9B969F]/40 rounded-sm transition-colors space-y-1 block"
              >
                <span className="font-mono text-[10px] uppercase text-orange font-bold">
                  {disc.category.replace('-', ' ')}
                </span>
                <h3 className="font-display text-lg text-[#F4F0E8] leading-snug">
                  {disc.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

    </article>
  );
};
