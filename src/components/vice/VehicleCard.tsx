'use client';

import React from 'react';
import Link from 'next/link';
import { ViceImage } from './ViceImage';
import { RareVehicle } from '@/types';
import { RarityStamp } from './RarityStamp';
import { MapPin, Clock, Camera, ArrowRight } from 'lucide-react';

interface VehicleCardProps {
  vehicle: RareVehicle;
  className?: string;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, className = '' }) => {
  return (
    <article
      className={`bg-cream text-ink border-3 border-ink shadow-[5px_5px_0px_#FF4FA0] card-hover-snap flex flex-col justify-between overflow-hidden font-body ${className}`}
    >
      <div>
        {/* Image Slot */}
        <div className="relative h-48 bg-ink border-b-3 border-ink overflow-hidden group">
          <ViceImage
            src={vehicle.evidenceImage}
            alt={vehicle.name}
            category="rare-vehicle"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />

          {/* Rarity Stamp */}
          <div className="absolute top-3 left-3">
            <RarityStamp rarity={vehicle.rarity} size="sm" />
          </div>

          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-cream">
            <span className="bg-ink px-2 py-0.5 border border-ink uppercase font-bold text-orange">
              CLASS: {vehicle.vehicleClass}
            </span>
            <span className="bg-ink px-2 py-0.5 border border-ink font-bold">
              {vehicle.coordinates.inGameGrid || 'GRID'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] uppercase font-black text-orange tracking-wider block">
                {vehicle.modelName}
              </span>
              <h3 className="font-display text-2xl uppercase tracking-tight text-ink leading-none pt-0.5">
                {vehicle.name}
              </h3>
            </div>
          </div>

          <p className="font-body text-xs text-ink/80 line-clamp-2 leading-relaxed">
            {vehicle.description}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-ink/20 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 text-ink/80">
              <MapPin className="w-3.5 h-3.5 text-orange stroke-[2.5px]" />
              <span className="truncate">{vehicle.district}</span>
            </div>
            <div className="flex items-center gap-1.5 text-ink/80">
              <Clock className="w-3.5 h-3.5 text-teal stroke-[2.5px]" />
              <span>{vehicle.spawnConditions?.time || 'Anytime'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-4 pt-0">
        <Link
          href={`/vehicles`}
          className="w-full py-2.5 bg-ink text-cream hover:bg-orange hover:text-ink font-mono text-xs uppercase font-black tracking-widest border-2 border-ink flex items-center justify-center gap-2 transition-colors shadow-[2px_2px_0px_#1A0B2E]"
        >
          <span>RADAR DOSSIER</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5px]" />
        </Link>
      </div>
    </article>
  );
};
