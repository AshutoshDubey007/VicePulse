'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, MapPin, Car, Sparkles, Compass, ArrowRight, Radio, Users, Building, ShieldCheck } from 'lucide-react';

interface QuickLink {
  title: string;
  category: string;
  href: string;
  icon: React.ReactNode;
}

const QUICK_ACTIONS: QuickLink[] = [
  { title: 'Explore Leonida Tactical Map', category: 'Navigation', href: '/map', icon: <MapPin className="w-4 h-4 text-teal stroke-[2.5px]" /> },
  { title: 'Rare Vehicle Radar & Catalogue', category: 'Database', href: '/vehicles', icon: <Car className="w-4 h-4 text-hot-pink stroke-[2.5px]" /> },
  { title: 'Surge & Trending Discoveries', category: 'Feed', href: '/trending', icon: <Sparkles className="w-4 h-4 text-sun stroke-[2.5px]" /> },
  { title: 'GTA VI Intelligence Wire', category: 'News', href: '/news', icon: <Radio className="w-4 h-4 text-orange stroke-[2.5px]" /> },
  { title: 'Submit Field Intel / Location', category: 'Submission', href: '/submit', icon: <Compass className="w-4 h-4 text-cream stroke-[2.5px]" /> },
];

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchFallback, setSearchFallback] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Live database search with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults(null);
      setSearchFallback(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setSearchResults(data.results || null);
        setSearchFallback(data.fallback || null);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  const hasLiveResults =
    searchResults &&
    (searchResults.discoveries?.length > 0 ||
      searchResults.vehicles?.length > 0 ||
      searchResults.news?.length > 0 ||
      searchResults.characters?.length > 0 ||
      searchResults.locations?.length > 0);

  return (
    <>
      {/* Trigger Button in Navbar */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-ink-card border-2 border-ink text-cream/80 hover:text-cream hover:border-orange font-mono text-xs uppercase shadow-[2px_2px_0px_#1A0B2E] transition-all"
        title="Command Palette (Ctrl+K / Cmd+K)"
      >
        <Search className="w-3.5 h-3.5 text-orange stroke-[2.5px]" />
        <span className="hidden xl:inline">Search...</span>
        <kbd className="px-1.5 py-0.5 bg-ink border border-ink text-[10px] text-cream/60 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Accessible Dialog Backdrop */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="VicePulse Global Command Palette"
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-ink/80 backdrop-blur-none animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-ink-card border-3 border-ink shadow-[8px_8px_0px_#FF7A3D] overflow-hidden font-body"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center border-b-3 border-ink p-3 bg-ink">
              <Search className={`w-5 h-5 text-orange stroke-[2.5px] ml-2 mr-3 ${isSearching ? 'animate-spin' : ''}`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search secrets, rides, sectors, characters, news..."
                autoFocus
                className="w-full bg-transparent text-cream placeholder-cream/40 font-mono text-sm uppercase focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-cream/60 hover:text-cream"
              >
                <X className="w-5 h-5 stroke-[2.5px]" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-2 font-mono text-xs">
              
              {/* LIVE DATABASE RESULTS */}
              {query.trim().length >= 2 ? (
                <>
                  {!hasLiveResults && !isSearching && (
                    <div className="p-6 text-center space-y-3 font-mono">
                      <div className="text-orange font-bold uppercase text-xs">
                        {searchFallback?.message || `NO DATABASE MATCHES FOR "${query.toUpperCase()}" IN LEONIDA ARCHIVE`}
                      </div>
                      <p className="text-[11px] text-cream/50 max-w-sm mx-auto">
                        VicePulse queries only authentic, verified database records. Explore active verified categories below:
                      </p>
                      {searchFallback?.suggestedCategories && (
                        <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                          {searchFallback.suggestedCategories.map((cat: any) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleSelect(`/discoveries?category=${cat.id}`)}
                              className="px-2.5 py-1 bg-ink border border-ink text-cream hover:border-orange hover:text-orange text-[10px] uppercase font-bold transition-colors"
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discoveries */}
                  {searchResults?.discoveries?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-black text-orange px-3 py-0.5">
                        DISCOVERIES ({searchResults.discoveries.length})
                      </div>
                      {searchResults.discoveries.map((d: any) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => handleSelect(d.url)}
                          className="w-full flex items-center justify-between p-2.5 bg-ink hover:bg-orange hover:text-ink text-cream transition-colors text-left border border-ink/40 group shadow-[1px_1px_0px_#1A0B2E]"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Sparkles className="w-4 h-4 text-orange group-hover:text-ink shrink-0" />
                            <div className="truncate">
                              <div className="font-bold uppercase truncate">{d.title}</div>
                              <div className="text-[10px] text-cream/50 group-hover:text-ink/80">{d.category} • {d.district}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 stroke-[2.5px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Vehicles */}
                  {searchResults?.vehicles?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-black text-teal px-3 py-0.5">
                        VEHICLES &amp; RARE SPANS ({searchResults.vehicles.length})
                      </div>
                      {searchResults.vehicles.map((v: any) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelect(v.url)}
                          className="w-full flex items-center justify-between p-2.5 bg-ink hover:bg-teal hover:text-ink text-cream transition-colors text-left border border-ink/40 group shadow-[1px_1px_0px_#1A0B2E]"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Car className="w-4 h-4 text-teal group-hover:text-ink shrink-0" />
                            <div className="truncate">
                              <div className="font-bold uppercase truncate">{v.title}</div>
                              <div className="text-[10px] text-cream/50 group-hover:text-ink/80">{v.vehicleClass || 'RIDE'} {v.district ? `• ${v.district}` : ''}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 stroke-[2.5px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Characters */}
                  {searchResults?.characters?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-black text-sun px-3 py-0.5">
                        CHARACTERS &amp; FIGURES ({searchResults.characters.length})
                      </div>
                      {searchResults.characters.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelect(c.url)}
                          className="w-full flex items-center justify-between p-2.5 bg-ink hover:bg-sun hover:text-ink text-cream transition-colors text-left border border-ink/40 group shadow-[1px_1px_0px_#1A0B2E]"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Users className="w-4 h-4 text-sun group-hover:text-ink shrink-0" />
                            <div className="truncate">
                              <div className="font-bold uppercase truncate">{c.title}</div>
                              <div className="text-[10px] text-cream/50 group-hover:text-ink/80">{c.group || 'Leonida Figure'}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 stroke-[2.5px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Locations & Landmarks */}
                  {searchResults?.locations?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-black text-hot-pink px-3 py-0.5">
                        DISTRICTS &amp; LANDMARKS ({searchResults.locations.length})
                      </div>
                      {searchResults.locations.map((l: any) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => handleSelect(l.url)}
                          className="w-full flex items-center justify-between p-2.5 bg-ink hover:bg-hot-pink hover:text-ink text-cream transition-colors text-left border border-ink/40 group shadow-[1px_1px_0px_#1A0B2E]"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Building className="w-4 h-4 text-hot-pink group-hover:text-ink shrink-0" />
                            <div className="truncate">
                              <div className="font-bold uppercase truncate">{l.title}</div>
                              <div className="text-[10px] text-cream/50 group-hover:text-ink/80">{l.kind || 'Location'} • {l.area || 'Leonida'}</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 stroke-[2.5px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* News Articles */}
                  {searchResults?.news?.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-black text-orange px-3 py-0.5">
                        NEWS WIRE ({searchResults.news.length})
                      </div>
                      {searchResults.news.map((n: any) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => handleSelect(n.url)}
                          className="w-full flex items-center justify-between p-2.5 bg-ink hover:bg-orange hover:text-ink text-cream transition-colors text-left border border-ink/40 group shadow-[1px_1px_0px_#1A0B2E]"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Radio className="w-4 h-4 text-orange group-hover:text-ink shrink-0" />
                            <div className="truncate">
                              <div className="font-bold uppercase truncate">{n.title}</div>
                              <div className="text-[10px] text-cream/50 group-hover:text-ink/80">{n.category} Dispatch</div>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 stroke-[2.5px] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* DEFAULT QUICK ACTIONS */
                <>
                  <div className="text-[10px] uppercase font-black text-orange px-3 py-1">
                    QUICK DIRECTIVES &amp; SECTORS
                  </div>
                  {QUICK_ACTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(item.href)}
                      className="w-full flex items-center justify-between p-3 bg-ink hover:bg-orange hover:text-ink text-cream transition-colors text-left border border-ink/40 group shadow-[1px_1px_0px_#1A0B2E]"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <div>
                          <div className="font-bold uppercase group-hover:text-ink">{item.title}</div>
                          <div className="text-[10px] text-cream/50 group-hover:text-ink/80">{item.category}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 stroke-[2.5px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Footer Strip */}
            <div className="border-t-2 border-ink p-2.5 bg-ink text-[10px] font-mono text-cream/60 flex items-center justify-between">
              <span>REAL DATABASE SEARCH // ZERO DUMMY RECORDS</span>
              <span>ESC TO EXIT</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
