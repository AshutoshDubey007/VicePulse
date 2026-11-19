'use client';

import React, { useState, useEffect } from 'react';
import { ViceImage } from './ViceImage';
import { X, ChevronLeft, ChevronRight, Maximize2, Play } from 'lucide-react';

export interface MediaItem {
  url: string;
  caption?: string;
  type: 'screenshot' | 'clip' | 'map_crop' | string;
  videoUrl?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  className?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  className = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeItem = items[selectedIndex] || items[0];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setSelectedIndex((prev) => (prev + 1) % items.length);
      if (e.key === 'ArrowLeft') setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, items.length]);

  if (!items || items.length === 0) {
    return (
      <div className="bg-ink border-3 border-ink h-64 flex items-center justify-center font-mono text-xs uppercase text-cream/40">
        NO RECON MEDIA ATTACHED
      </div>
    );
  }

  return (
    <div className={`space-y-3 font-mono ${className}`}>
      {/* Featured Main Preview */}
      <div className="relative h-72 sm:h-96 w-full bg-ink border-3 border-ink shadow-[5px_5px_0px_#1A0B2E] overflow-hidden group">
        <ViceImage
          src={activeItem.url}
          alt={activeItem.caption || 'Field evidence visual'}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent pointer-events-none" />

        {/* Action Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-black">
          <span className="bg-ink/90 border border-ink text-cream px-2.5 py-1">
            {activeItem.caption || `EVIDENCE ITEM ${selectedIndex + 1}/${items.length}`}
          </span>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="p-1.5 bg-orange text-ink border-2 border-ink shadow-[2px_2px_0px_#1A0B2E] hover:bg-orange-hover"
            title="Expand Full Lightbox"
          >
            <Maximize2 className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>
      </div>

      {/* Thumbnails Row */}
      {items.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-16 shrink-0 border-2 overflow-hidden transition-all ${
                idx === selectedIndex
                  ? 'border-orange shadow-[2px_2px_0px_#FF7A3D] scale-105'
                  : 'border-ink opacity-70 hover:opacity-100'
              }`}
            >
              <ViceImage src={item.url} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
              {item.type === 'clip' && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                  <Play className="w-3.5 h-3.5 text-sun fill-sun" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Accessible Full Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Evidence Lightbox View"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 animate-fade-in"
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 bg-hot-pink text-ink border-2 border-ink shadow-[3px_3px_0px_#FFE066] hover:bg-hot-pink-hover z-50"
            title="Close Lightbox (Esc)"
          >
            <X className="w-6 h-6 stroke-[3px]" />
          </button>

          {/* Navigation Controls */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)}
                className="absolute left-4 p-3 bg-sun text-ink border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] hover:bg-sun-hover z-50"
                title="Previous Image (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6 stroke-[3px]" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedIndex((prev) => (prev + 1) % items.length)}
                className="absolute right-4 p-3 bg-sun text-ink border-2 border-ink shadow-[3px_3px_0px_#1A0B2E] hover:bg-sun-hover z-50"
                title="Next Image (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6 stroke-[3px]" />
              </button>
            </>
          )}

          <div className="relative max-w-4xl max-h-[85vh] w-full h-[70vh] bg-ink border-3 border-cream shadow-[8px_8px_0px_#FF4FA0] overflow-hidden">
            <ViceImage
              src={activeItem.url}
              alt={activeItem.caption || 'Enlarged field evidence'}
              fill
              className="object-contain"
            />
            <div className="absolute bottom-0 inset-x-0 bg-ink border-t-2 border-cream p-3 flex items-center justify-between text-xs text-cream font-mono">
              <span>{activeItem.caption || `EVIDENCE DOSSIER #${selectedIndex + 1}`}</span>
              <span>{selectedIndex + 1} OF {items.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
