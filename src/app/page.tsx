import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { store } from '@/lib/store';
import connectDB from '@/lib/mongodb';
import NewsArticle from '@/models/NewsArticle';
import { DiscoveryCard } from '@/components/DiscoveryCard';
import { EmptyState } from '@/components/vice/EmptyState';
import { 
  Search, 
  MapPin, 
  Compass, 
  ArrowRight,
  ExternalLink,
  Car,
  Eye,
  Calendar,
  Sparkles,
  Layers,
  Flame,
  Radio,
  FileText
} from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering

export default async function HomePage() {
  await connectDB();

  // 1. Fetch 3 newest real discoveries
  const discoveriesResult = await store.getDiscoveries({ limit: 3 });
  const recentDiscoveries = discoveriesResult.items || [];

  // 2. Fetch 3 newest real news articles
  let recentNews: any[] = [];
  try {
    recentNews = await NewsArticle.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();
  } catch (err) {
    console.warn('[HomePage] Failed to fetch news:', err);
  }

  // 3. Simple categories grid (Section 5)
  const categories = [
    {
      id: 'hidden-location',
      title: 'Hidden Locations',
      description: 'Secret interiors, bunkers, and submerged wrecks.',
      icon: MapPin,
      color: 'text-orange',
    },
    {
      id: 'rare-vehicle',
      title: 'Rare Vehicles',
      description: 'Prototype rides, exotic aircraft, and rare spawns.',
      icon: Car,
      color: 'text-hot-pink',
    },
    {
      id: 'easter-egg',
      title: 'Easter Eggs',
      description: 'Lore tributes, cryptic signals, and historical callbacks.',
      icon: Sparkles,
      color: 'text-sun',
    },
    {
      id: 'encounter',
      title: 'Encounters',
      description: 'Unusual NPC events, highway incidents, and oddities.',
      icon: Flame,
      color: 'text-teal',
    },
    {
      id: 'unusual-event',
      title: 'Activities',
      description: 'Secret side jobs, night races, and contraband runs.',
      icon: Radio,
      color: 'text-orange',
    },
    {
      id: 'wildlife',
      title: 'Wildlife',
      description: 'Apex predators, wetland fauna, and rare sightings.',
      icon: Eye,
      color: 'text-teal',
    },
  ];

  return (
    <div className="flex flex-col w-full bg-[#111114] text-[#F4F0E8] min-h-screen">
      
      {/* 1. HERO SECTION (Clean, single background artwork, Section 5) */}
      <section className="relative overflow-hidden border-b border-[#28272F]">
        {/* Single background visual artwork */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero/vice-city-hero.webp"
            alt="Vice City Leonida Skyline"
            fill
            priority
            className="object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-[#111114]/85 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center space-y-6">
          <div className="inline-block">
            <span className="font-mono text-xs uppercase tracking-widest px-3 py-1 bg-[#1C1B20] border border-[#28272F] rounded-sm text-orange font-bold">
              VICEPULSE
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl tracking-tight uppercase leading-[0.95] text-[#F4F0E8]">
            LEONIDA HAS <br />
            <span className="text-orange">MORE TO HIDE.</span>
          </h1>

          <p className="font-body text-base sm:text-lg text-[#9B969F] max-w-2xl mx-auto leading-relaxed">
            Discover hidden locations, rare vehicles, easter eggs and things players are finding across GTA VI.
          </p>

          {/* One Search Bar */}
          <div className="pt-2 max-w-xl mx-auto">
            <form action="/feed" method="GET" className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-[#9B969F] pointer-events-none" />
              <input
                type="text"
                name="search"
                placeholder="Search discoveries, vehicles, easter eggs, coordinates..."
                className="w-full pl-11 pr-24 py-3.5 bg-[#1C1B20] text-[#F4F0E8] border border-[#28272F] rounded-sm font-mono text-xs sm:text-sm placeholder-[#9B969F]/60 focus:outline-none focus:border-orange transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-orange text-ink font-mono text-xs uppercase font-bold rounded-sm hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </form>
          </div>

          {/* Two Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/feed"
              className="px-6 py-3 bg-[#1C1B20] hover:bg-[#28272F] border border-[#28272F] rounded-sm font-mono text-xs uppercase font-bold text-[#F4F0E8] transition-colors flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-orange" />
              <span>Explore Discoveries</span>
            </Link>

            <Link
              href="/map"
              className="px-6 py-3 bg-orange text-ink font-mono text-xs uppercase font-bold rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Open Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. RECENTLY DISCOVERED (3 newest real discoveries, Section 5) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-8 border-b border-[#28272F]">
        <div className="flex items-end justify-between border-b border-[#28272F] pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-orange font-bold">
              Field Reports
            </span>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-[#F4F0E8] pt-1">
              Recently Discovered
            </h2>
          </div>
          <Link
            href="/feed"
            className="font-mono text-xs uppercase font-bold text-[#9B969F] hover:text-[#F4F0E8] transition-colors flex items-center gap-1.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDiscoveries.length === 0 ? (
          <EmptyState
            title="Nothing discovered yet."
            description="VicePulse is scanning the internet for new discoveries. Reports will appear here when real information is collected."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentDiscoveries.map((discovery) => (
              <DiscoveryCard key={discovery.id || discovery.slug} discovery={discovery} />
            ))}
          </div>
        )}
      </section>

      {/* 3. EXPLORE CATEGORIES (Simple clean grid, Section 5) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-8 border-b border-[#28272F]">
        <div className="border-b border-[#28272F] pb-4">
          <span className="font-mono text-xs uppercase tracking-wider text-orange font-bold">
            Classification
          </span>
          <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-[#F4F0E8] pt-1">
            Explore Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/feed?category=${cat.id}`}
                className="group p-5 bg-[#1C1B20] border border-[#28272F] hover:border-[#9B969F]/40 rounded-sm transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xs bg-[#111114] border border-[#28272F] ${cat.color}`}>
                    <Icon className="w-5 h-5 stroke-[1.75px]" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#9B969F]/60 group-hover:text-orange transition-colors" />
                </div>
                <div>
                  <h3 className="font-display text-xl uppercase tracking-tight text-[#F4F0E8] group-hover:text-orange transition-colors">
                    {cat.title}
                  </h3>
                  <p className="font-body text-xs text-[#9B969F] mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. MAP PREVIEW (One clean preview with real pins, Section 5) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-6 border-b border-[#28272F]">
        <div className="flex items-end justify-between border-b border-[#28272F] pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-orange font-bold">
              Cartography
            </span>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-[#F4F0E8] pt-1">
              Interactive Map
            </h2>
          </div>
          <Link
            href="/map"
            className="font-mono text-xs uppercase font-bold text-orange hover:text-[#F4F0E8] transition-colors flex items-center gap-1.5"
          >
            <span>Explore Leonida</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Clean map preview banner */}
        <div className="relative w-full h-80 bg-[#1C1B20] border border-[#28272F] rounded-sm overflow-hidden flex items-center justify-center p-8 text-center">
          <Image
            src="/images/hero/vice-city-hero.webp"
            alt="Tactical Map Preview"
            fill
            className="object-cover opacity-20 filter grayscale"
          />
          <div className="relative z-10 max-w-lg space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#111114] border border-[#28272F] flex items-center justify-center text-orange">
              <MapPin className="w-5 h-5 stroke-[2px]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
                Leonida Tactical Grid
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#9B969F] leading-relaxed">
                Displaying real discoveries with verified coordinate provenance across Vice City, Key Chicas, Grassrivers, and Port Gellhorn.
              </p>
            </div>
            <div>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange text-ink font-mono text-xs uppercase font-bold rounded-sm hover:opacity-90 transition-opacity"
              >
                <span>Explore Leonida</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. LATEST NEWS (3 latest real news articles, Section 5) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-8">
        <div className="flex items-end justify-between border-b border-[#28272F] pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-orange font-bold">
              Newswire
            </span>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-[#F4F0E8] pt-1">
              Latest News
            </h2>
          </div>
          <Link
            href="/news"
            className="font-mono text-xs uppercase font-bold text-[#9B969F] hover:text-[#F4F0E8] transition-colors flex items-center gap-1.5"
          >
            <span>All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentNews.length === 0 ? (
          <EmptyState
            title="No news articles yet."
            description="VicePulse is actively monitoring official Rockstar channels and verified gaming wire feeds."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentNews.map((article: any) => {
              const pubDate = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              const sourceName = article.sources?.[0]?.title || article.sources?.[0]?.platform || 'Newswire';
              const articleHref = article.slug ? `/news/${article.slug}` : `/news`;

              return (
                <article
                  key={article._id?.toString() || article.slug}
                  className="bg-[#1C1B20] border border-[#28272F] hover:border-[#9B969F]/40 rounded-sm p-5 flex flex-col justify-between space-y-4 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-[#9B969F]">
                      <span className="uppercase font-bold text-orange text-[10px] px-1.5 py-0.5 bg-[#111114] border border-[#28272F] rounded-xs">
                        {article.category || 'Official'}
                      </span>
                      <span>{pubDate}</span>
                    </div>

                    <Link href={articleHref}>
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
                    <span className="truncate max-w-[150px]">{sourceName}</span>
                    <Link
                      href={articleHref}
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
      </section>

    </div>
  );
}
