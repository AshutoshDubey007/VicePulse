'use client';

import React from 'react';
import Link from 'next/link';
import { ViceImage } from '@/components/vice/ViceImage';
import { Discovery, Category } from '@/types';
import { VerificationBadge } from '@/components/VerificationBadge';
import { MapPin, ExternalLink, Calendar } from 'lucide-react';

interface DiscoveryCardProps {
  discovery: Discovery;
  variant?: 'featured' | 'standard' | 'compact';
  onConfirm?: (id: string) => void;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({
  discovery,
  variant = 'standard',
}) => {
  const categoryLabels: Record<Category, string> = {
    'hidden-location': 'Hidden Location',
    'rare-vehicle': 'Rare Vehicle',
    'easter-egg': 'Easter Egg',
    'encounter': 'Encounter',
    'unusual-event': 'Activity',
    'wildlife': 'Wildlife',
  };

  const primaryImage =
    discovery.evidenceImages && discovery.evidenceImages.length > 0
      ? discovery.evidenceImages[0].url
      : undefined;

  const hasLocation =
    discovery.locationName &&
    discovery.locationName !== 'State of Leonida' &&
    discovery.coordinates?.inGameGrid !== 'LOCATION_PENDING';

  const formattedDate = discovery.createdAt
    ? new Date(discovery.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

  return (
    <article className="group bg-[#1C1B20] border border-[#28272F] hover:border-[#9B969F]/40 rounded-sm overflow-hidden flex flex-col justify-between transition-colors">
      <div>
        {/* Real Image Slot */}
        {primaryImage && (
          <div className="relative w-full h-48 overflow-hidden bg-[#111114]">
            <ViceImage
              src={primaryImage}
              alt={discovery.title}
              category={discovery.category}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            {/* Verification Stamp overlay */}
            <div className="absolute top-2.5 left-2.5">
              <VerificationBadge status={discovery.verificationStatus} size="sm" />
            </div>
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-3">
          {/* Metadata Row: Category & Location if known */}
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <span className="text-orange uppercase font-bold tracking-wider">
              {categoryLabels[discovery.category] || discovery.category}
            </span>

            {hasLocation ? (
              <span className="text-[#9B969F] flex items-center gap-1 truncate max-w-[150px]">
                <MapPin className="w-3 h-3 text-orange shrink-0" />
                <span className="truncate">{discovery.district || discovery.locationName}</span>
              </span>
            ) : (
              <span className="text-[#9B969F]/60 text-[10px]">Location unmapped</span>
            )}
          </div>

          {/* Title */}
          <Link href={`/discoveries/${discovery.id || discovery.slug}`}>
            <h3 className="font-display text-xl sm:text-2xl text-[#F4F0E8] group-hover:text-orange transition-colors leading-tight line-clamp-2">
              {discovery.title}
            </h3>
          </Link>

          {/* Short Description */}
          {discovery.description && (
            <p className="font-body text-xs sm:text-sm text-[#9B969F] line-clamp-2 leading-relaxed">
              {discovery.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Real Source, Date & Status */}
      <div className="p-4 pt-3 border-t border-[#28272F] flex items-center justify-between text-xs font-mono text-[#9B969F]">
        <div className="flex items-center gap-2 truncate">
          {discovery.source?.platform && (
            <span className="uppercase text-[10px] px-1.5 py-0.5 bg-[#111114] border border-[#28272F] rounded-xs font-bold text-[#F4F0E8]">
              {discovery.source.platform}
            </span>
          )}
          {formattedDate && (
            <span className="text-[11px] text-[#9B969F]/80">
              {formattedDate}
            </span>
          )}
        </div>

        <Link
          href={`/discoveries/${discovery.id || discovery.slug}`}
          className="text-xs font-mono uppercase font-bold text-orange hover:text-[#F4F0E8] transition-colors shrink-0 flex items-center gap-1"
        >
          <span>View</span>
          <span>&rarr;</span>
        </Link>
      </div>
    </article>
  );
};
