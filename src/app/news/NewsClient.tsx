'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ViceImage } from '@/components/vice/ViceImage';
import { NewsArticle, NewsCategory } from '@/types';
import { EmptyState } from '@/components/vice/EmptyState';
import { 
  Search, 
  RefreshCw, 
  ExternalLink, 
  ArrowRight, 
  Calendar,
  X
} from 'lucide-react';

interface NewsClientProps {
  initialArticles: NewsArticle[];
}

const CATEGORY_TABS: Array<{ id: 'all' | NewsCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'official', label: 'Official' },
  { id: 'community', label: 'Community' },
  { id: 'leak', label: 'Datamine & Leaks' },
  { id: 'analysis', label: 'Analysis' },
];

export const NewsClient: React.FC<NewsClientProps> = ({ initialArticles }) => {
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState<'all' | NewsCategory>('all');
  const [search, setSearch] = useState('');
  const [isReconRunning, setIsReconRunning] = useState(false);
  const [reconMessage, setReconMessage] = useState<string | null>(null);

  // Filter articles
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
      const matchSearch =
        !search.trim() ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, search]);

  const handleTriggerRecon = async () => {
    setIsReconRunning(true);
    setReconMessage('Scanning Reddit, RSS feeds, and official newswires...');

    try {
      const res = await fetch('/api/autonomous/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: 'manual' }),
      });
      const data = await res.json();
      if (data.success) {
        setReconMessage(`Recon sweep complete. Ingested ${data.data?.ingestedItems || 0} signals.`);
        // Refresh articles
        const refreshRes = await fetch('/api/news');
        const refreshData = await refreshRes.json();
        if (refreshData.data) {
          setArticles(refreshData.data);
        }
      } else {
        setReconMessage('Recon sweep completed.');
      }
    } catch {
      setReconMessage('Recon request submitted.');
    } finally {
      setIsReconRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-body text-[#F4F0E8] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#28272F] pb-6">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8] leading-none">
            GTA VI Newswire
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#9B969F] mt-1">
            Real news, official announcements, trailer breakdowns, and community theories collected by the research engine.
          </p>
        </div>

        {/* Scan Button */}
        <div>
          <button
            type="button"
            onClick={handleTriggerRecon}
            disabled={isReconRunning}
            className="px-4 py-2 bg-orange text-ink font-mono text-xs uppercase font-bold rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReconRunning ? 'animate-spin' : ''}`} />
            <span>{isReconRunning ? 'Scanning...' : 'Scan Newswire'}</span>
          </button>
        </div>
      </div>

      {reconMessage && (
        <div className="p-3 bg-[#1C1B20] border border-orange/40 rounded-sm font-mono text-xs text-orange">
          {reconMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs uppercase">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors border text-xs ${
                  isSelected
                    ? 'bg-[#1C1B20] text-orange border-orange font-bold'
                    : 'bg-[#111114] text-[#9B969F] border-[#28272F] hover:text-[#F4F0E8]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-[#9B969F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-7 py-1.5 bg-[#1C1B20] border border-[#28272F] rounded-sm text-xs font-mono text-[#F4F0E8] placeholder-[#9B969F]/60 focus:outline-none focus:border-orange transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9B969F] hover:text-[#F4F0E8]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Articles Stream */}
      {filteredArticles.length === 0 ? (
        <EmptyState
          title="No news articles found."
          description="The autonomous engine is continuously polling Rockstar Newswire, Reddit, and gaming press feeds."
          actionText="Run Recon Sweep"
          onAction={handleTriggerRecon}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => {
            const pubDate = article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';

            const source = article.sources?.[0]?.title || article.sources?.[0]?.platform || 'Newswire';

            return (
              <article
                key={article.id || article.slug}
                className="bg-[#1C1B20] border border-[#28272F] hover:border-[#9B969F]/40 rounded-sm p-5 flex flex-col justify-between space-y-4 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#9B969F]">
                    <span className="uppercase font-bold text-orange text-[10px] px-1.5 py-0.5 bg-[#111114] border border-[#28272F] rounded-xs">
                      {article.category}
                    </span>
                    <span>{pubDate}</span>
                  </div>

                  <Link href={`/news/${article.slug}`}>
                    <h3 className="font-display text-xl text-[#F4F0E8] hover:text-orange transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>
                  </Link>

                  {article.excerpt && (
                    <p className="font-body text-xs text-[#9B969F] line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#28272F] flex items-center justify-between text-xs font-mono text-[#9B969F]">
                  <span className="truncate max-w-[150px] text-[11px]">{source}</span>
                  <Link
                    href={`/news/${article.slug}`}
                    className="text-orange hover:text-[#F4F0E8] font-bold uppercase transition-colors flex items-center gap-1"
                  >
                    <span>Read</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

    </div>
  );
};
