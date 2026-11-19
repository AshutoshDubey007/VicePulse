'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { Category } from '@/types';

interface ViceImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src?: string | null;
  category?: Category | string;
  fallbackSrc?: string;
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  'hidden-location': '/images/categories/hidden-location.webp',
  'rare-vehicle': '/images/categories/rare-vehicle.webp',
  'easter-egg': '/images/categories/easter-egg.webp',
  'encounter': '/images/categories/encounter.webp',
  'wildlife': '/images/categories/wildlife.webp',
  'unusual-event': '/images/categories/unusual-event.webp',
  'hidden-activity': '/images/categories/hidden-activity.webp',
};

const DEFAULT_FALLBACK = '/images/hero/vice-city-hero.webp';

export const ViceImage: React.FC<ViceImageProps> = ({
  src,
  alt = 'VicePulse reconnaissance intelligence capture',
  category,
  fallbackSrc,
  className = '',
  fill,
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...rest
}) => {
  const resolvedFallback =
    fallbackSrc ||
    (category && CATEGORY_FALLBACKS[category]) ||
    DEFAULT_FALLBACK;

  const [currentSrc, setCurrentSrc] = useState<string>(src && src.trim() !== '' ? src : resolvedFallback);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src && src.trim() !== '') {
      setCurrentSrc(src);
      setHasError(false);
    } else {
      setCurrentSrc(resolvedFallback);
    }
  }, [src, resolvedFallback]);

  const handleError = () => {
    if (!hasError && currentSrc !== resolvedFallback) {
      setCurrentSrc(resolvedFallback);
      setHasError(true);
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width || 600 : undefined}
      height={!fill ? height || 400 : undefined}
      priority={priority}
      sizes={fill ? sizes : undefined}
      className={`object-cover transition-opacity duration-300 ${className}`}
      onError={handleError}
      loading={priority ? undefined : 'lazy'}
      {...rest}
    />
  );
};
