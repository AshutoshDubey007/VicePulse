'use client';

import React from 'react';

export type PosterCardSurface = 'cream' | 'ink' | 'card';
export type PosterCardAccent = 'ink' | 'pink' | 'orange' | 'teal' | 'sun';

interface PosterCardProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: PosterCardSurface;
  accent?: PosterCardAccent;
  interactive?: boolean;
  borderWidth?: 2 | 3;
  children: React.ReactNode;
  className?: string;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  surface = 'card',
  accent = 'ink',
  interactive = false,
  borderWidth = 3,
  children,
  className = '',
  ...props
}) => {
  const surfaceClasses = {
    cream: 'bg-cream text-ink',
    ink: 'bg-ink text-cream',
    card: 'bg-ink-card text-cream',
  };

  const shadowClasses = {
    ink: 'shadow-[5px_5px_0px_#1A0B2E]',
    pink: 'shadow-[5px_5px_0px_#FF4FA0]',
    orange: 'shadow-[5px_5px_0px_#FF7A3D]',
    teal: 'shadow-[5px_5px_0px_#19C7B8]',
    sun: 'shadow-[5px_5px_0px_#FFE066]',
  };

  const borderClass = borderWidth === 2 ? 'border-2 border-ink' : 'border-3 border-ink';

  const hoverClass = interactive
    ? 'transition-transform duration-120 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#1A0B2E] cursor-pointer'
    : '';

  return (
    <div
      className={`${surfaceClasses[surface]} ${borderClass} ${shadowClasses[accent]} ${hoverClass} relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
