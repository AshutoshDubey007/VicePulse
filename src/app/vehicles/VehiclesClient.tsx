'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ViceImage } from '@/components/vice/ViceImage';
import { RareVehicle } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { EmptyState } from '@/components/vice/EmptyState';
import { 
  Car, 
  Search, 
  MapPin, 
  Clock, 
  CloudRain, 
  X,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers
} from 'lucide-react';

interface VehiclesClientProps {
  initialVehicles: RareVehicle[];
  catalogueVehicles?: any[];
}

export const VehiclesClient: React.FC<VehiclesClientProps> = ({ 
  initialVehicles,
  catalogueVehicles = []
}) => {
  const [vehicles] = useState<RareVehicle[]>(initialVehicles);
  const [catalogue] = useState<any[]>(catalogueVehicles);
  const [activeTab, setActiveTab] = useState<'all' | 'spawns' | 'catalogue'>('all');
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Compute unique classes across all vehicles
  const vehicleClasses = useMemo(() => {
    const classes = new Set<string>();
    vehicles.forEach((v) => {
      if (v.vehicleClass) classes.add(v.vehicleClass.toLowerCase());
    });
    catalogue.forEach((c) => {
      const cls = c.attributes?.class?.en || c.attributes?.class;
      if (cls) classes.add(String(cls).toLowerCase());
    });
    return Array.from(classes).sort();
  }, [vehicles, catalogue]);

  // Filter spawns
  const filteredSpawns = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch = !search.trim() ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        (v.reportedLocation && v.reportedLocation.toLowerCase().includes(search.toLowerCase())) ||
        (v.district && v.district.toLowerCase().includes(search.toLowerCase())) ||
        (v.description && v.description.toLowerCase().includes(search.toLowerCase()));

      const matchesClass = selectedClass === 'all' || v.vehicleClass.toLowerCase() === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [vehicles, search, selectedClass]);

  // Filter catalogue
  const filteredCatalogue = useMemo(() => {
    return catalogue.filter((c) => {
      const name = typeof c.name === 'object' ? c.name?.en : c.name;
      const manufacturer = typeof c.attributes?.manufacturer === 'object' ? c.attributes?.manufacturer?.en : c.attributes?.manufacturer;
      const cls = typeof c.attributes?.class === 'object' ? c.attributes?.class?.en : c.attributes?.class;
      const inspiration = typeof c.attributes?.inspiration === 'object' ? c.attributes?.inspiration?.en : c.attributes?.inspiration;

      const fullText = `${name} ${manufacturer || ''} ${cls || ''} ${inspiration || ''} ${c.slug}`.toLowerCase();
      const matchesSearch = !search.trim() || fullText.includes(search.toLowerCase());
      const matchesClass = selectedClass === 'all' || (cls && String(cls).toLowerCase() === selectedClass);
      return matchesSearch && matchesClass;
    });
  }, [catalogue, search, selectedClass]);

  const showSpawns = activeTab === 'all' || activeTab === 'spawns';
  const showCatalogue = activeTab === 'all' || activeTab === 'catalogue';
  const totalCount = (showSpawns ? filteredSpawns.length : 0) + (showCatalogue ? filteredCatalogue.length : 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-body text-[#F4F0E8] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#28272F] pb-6">
        <div>
          <div className="flex items-center gap-2 text-orange text-xs font-mono font-bold tracking-widest uppercase mb-1">
            <Car className="w-4 h-4" />
            <span>LEONIDA MOTOR REGISTRY // RECON ARCHIVE</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8] leading-none">
            VEHICLES &amp; RARE RIDES
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#9B969F] mt-1 max-w-2xl">
            Official GTA VI vehicle database cross-referenced with community discovered rare spawns, prototypes, and clandestine vehicle locations.
          </p>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-[#9B969F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search make, model, class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-7 py-2.5 bg-[#1C1B20] border border-[#28272F] rounded-sm text-xs font-mono text-[#F4F0E8] placeholder-[#9B969F]/60 focus:outline-none focus:border-orange transition-colors"
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

      {/* Tabs & Class Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#28272F]/60 pb-4">
        {/* Source Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#1C1B20] border border-[#28272F] rounded-sm font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xs transition-colors font-bold uppercase text-[11px] ${
              activeTab === 'all'
                ? 'bg-[#111114] text-orange border border-orange/40 shadow-sm'
                : 'text-[#9B969F] hover:text-[#F4F0E8]'
            }`}
          >
            All Rides ({vehicles.length + catalogue.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spawns')}
            className={`px-3 py-1.5 rounded-xs transition-colors font-bold uppercase text-[11px] flex items-center gap-1.5 ${
              activeTab === 'spawns'
                ? 'bg-[#111114] text-orange border border-orange/40 shadow-sm'
                : 'text-[#9B969F] hover:text-[#F4F0E8]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-orange" />
            <span>Rare Spawns ({vehicles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('catalogue')}
            className={`px-3 py-1.5 rounded-xs transition-colors font-bold uppercase text-[11px] flex items-center gap-1.5 ${
              activeTab === 'catalogue'
                ? 'bg-[#111114] text-teal border border-teal/40 shadow-sm'
                : 'text-[#9B969F] hover:text-[#F4F0E8]'
            }`}
          >
            <Layers className="w-3 h-3 text-teal" />
            <span>Official Catalogue ({catalogue.length})</span>
          </button>
        </div>

        {/* Class Filter Pills */}
        {vehicleClasses.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap font-mono text-[11px]">
            <span className="text-[#9B969F] mr-1 uppercase">Class:</span>
            <button
              type="button"
              onClick={() => setSelectedClass('all')}
              className={`px-2.5 py-1 rounded-xs uppercase ${
                selectedClass === 'all'
                  ? 'bg-orange text-[#111114] font-bold'
                  : 'bg-[#1C1B20] text-[#9B969F] hover:text-[#F4F0E8]'
              }`}
            >
              All
            </button>
            {vehicleClasses.slice(0, 6).map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`px-2.5 py-1 rounded-xs uppercase ${
                  selectedClass === cls
                    ? 'bg-orange text-[#111114] font-bold'
                    : 'bg-[#1C1B20] text-[#9B969F] hover:text-[#F4F0E8]'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zero State */}
      {totalCount === 0 && (
        <EmptyState
          title="No vehicles match your criteria."
          description={
            search
              ? 'Try searching with different make, model, or class terms.'
              : 'The vehicle registry is being synced automatically from vice-city.app and player discovery logs.'
          }
          actionText={search || selectedClass !== 'all' ? 'Reset Filters' : undefined}
          onAction={() => {
            setSearch('');
            setSelectedClass('all');
          }}
        />
      )}

      {/* SECTION 1: COMMUNITY RARE SPAWNS */}
      {showSpawns && filteredSpawns.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl uppercase tracking-wide text-[#F4F0E8] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
              <span>CONFIRMED RARE VEHICLE SPAWNS</span>
              <span className="text-xs font-mono text-[#9B969F] font-normal">({filteredSpawns.length} LOCATIONS)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSpawns.map((vehicle) => {
              const image = vehicle.evidenceImage;
              return (
                <div
                  key={vehicle.id}
                  className="bg-[#1C1B20] border border-[#28272F] hover:border-orange/60 rounded-sm overflow-hidden flex flex-col justify-between transition-all group"
                >
                  <div>
                    {image ? (
                      <div className="relative w-full h-44 bg-[#111114]">
                        <ViceImage
                          src={image}
                          alt={vehicle.name}
                          category="rare-vehicle"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <VerificationBadge status={vehicle.verificationStatus} size="sm" />
                        </div>
                        {vehicle.rarity && (
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#111114]/90 border border-orange text-orange font-mono text-[10px] uppercase font-bold rounded-xs">
                            {vehicle.rarity}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-24 bg-[#111114] flex items-center justify-center text-[#9B969F]/40">
                        <Car className="w-8 h-8 stroke-[1.5px]" />
                      </div>
                    )}

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-orange uppercase font-bold text-[10px]">
                          {vehicle.vehicleClass}
                        </span>
                        {vehicle.district && (
                          <span className="text-[#9B969F] flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-orange" />
                            <span className="truncate max-w-[120px]">{vehicle.district}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-xl text-[#F4F0E8] leading-tight">
                        {vehicle.name}
                      </h3>

                      {vehicle.description && (
                        <p className="font-body text-xs text-[#9B969F] line-clamp-2 leading-relaxed">
                          {vehicle.description}
                        </p>
                      )}

                      {vehicle.spawnConditions && (
                        <div className="pt-2 text-[10px] font-mono text-[#9B969F] space-y-0.5 border-t border-[#28272F]/60">
                          {vehicle.spawnConditions.time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-orange" />
                              <span>{vehicle.spawnConditions.time}</span>
                            </div>
                          )}
                          {vehicle.spawnConditions.weather && (
                            <div className="flex items-center gap-1.5">
                              <CloudRain className="w-3 h-3 text-teal" />
                              <span>{vehicle.spawnConditions.weather}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 pt-3 border-t border-[#28272F] flex items-center justify-between text-xs font-mono text-[#9B969F]">
                    <span className="truncate max-w-[150px] text-[11px]">
                      {vehicle.reportedLocation}
                    </span>
                    <Link
                      href={`/discoveries/${vehicle.id}`}
                      className="text-xs font-mono uppercase font-bold text-orange hover:text-[#F4F0E8] transition-colors flex items-center gap-1"
                    >
                      <span>Coordinates</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: OFFICIAL GTA VI VEHICLE CATALOGUE */}
      {showCatalogue && filteredCatalogue.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#28272F]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl uppercase tracking-wide text-[#F4F0E8] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal" />
                <span>OFFICIAL GTA VI VEHICLE CATALOGUE</span>
                <span className="text-xs font-mono text-[#9B969F] font-normal">({filteredCatalogue.length} MODELS)</span>
              </h2>
              <p className="font-mono text-[11px] text-[#9B969F] mt-0.5">
                Officially confirmed vehicles, manufacturers, and real-world inspirations via vice-city.app.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalogue.map((item) => {
              const name = typeof item.name === 'object' ? item.name?.en : item.name;
              const manufacturer = typeof item.attributes?.manufacturer === 'object' ? item.attributes?.manufacturer?.en : item.attributes?.manufacturer;
              const cls = typeof item.attributes?.class === 'object' ? item.attributes?.class?.en : item.attributes?.class;
              const inspiration = typeof item.attributes?.inspiration === 'object' ? item.attributes?.inspiration?.en : item.attributes?.inspiration;
              const seenIn = typeof item.attributes?.seen_in === 'object' ? item.attributes?.seen_in?.en : item.attributes?.seen_in;
              const sourceUrl = item.sources?.[0]?.url;

              return (
                <div
                  key={item.externalId || item.id}
                  className="bg-[#1C1B20] border border-[#28272F] hover:border-teal/60 rounded-sm p-4 space-y-3 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-teal uppercase font-bold text-[10px]">
                        {cls || 'VEHICLE'}
                      </span>
                      <span className="px-1.5 py-0.5 bg-teal/10 border border-teal/30 text-teal text-[9px] uppercase font-bold rounded-xs flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>OFFICIAL</span>
                      </span>
                    </div>

                    <h3 className="font-display text-lg text-[#F4F0E8] leading-tight">
                      {name}
                    </h3>

                    <div className="space-y-1 text-xs font-mono text-[#9B969F]">
                      {manufacturer && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Manufacturer:</span>
                          <span className="text-[#F4F0E8] font-bold">{manufacturer}</span>
                        </div>
                      )}
                      {inspiration && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Inspiration:</span>
                          <span className="text-orange truncate max-w-[150px]">{inspiration}</span>
                        </div>
                      )}
                      {seenIn && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Seen In:</span>
                          <span className="text-[#F4F0E8] truncate max-w-[150px]">{seenIn}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#28272F] flex items-center justify-between text-[10px] font-mono text-[#9B969F]">
                    <span>SRC: vice-city.app</span>
                    {sourceUrl ? (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal hover:text-[#F4F0E8] transition-colors flex items-center gap-1"
                      >
                        <span>Evidence</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-teal">Dossier Synced</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attribution Footer Notice */}
      <div className="mt-8 pt-6 border-t border-[#28272F] text-[10px] font-mono text-[#9B969F] flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>GTA VI vehicle catalogue data synchronized from vice-city.app (Developer &amp; Community terms).</span>
        <span>Map and game coordinates courtesy of gtadb.org (CC BY 4.0).</span>
      </div>

    </div>
  );
};
