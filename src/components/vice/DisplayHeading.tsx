'use client';

import React from 'react';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
export type HeadingSize = 'sm' | 'md' | 'lg' | 'xl' | 'giant';
export type ShadowColor = 'ink' | 'pink' | 'orange' | 'cream' | 'none';

interface DisplayHeadingProps {
  as?: HeadingLevel;
  size?: HeadingSize;
  shadow?: ShadowColor;
  children: React.ReactNode;
  className?: string;
}

export const DisplayHeading: React.FC<DisplayHeadingProps> = ({
  as: Component = 'h2',
  size = 'lg',
  shadow = 'ink',
  children,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl lg:text-4xl',
    lg: 'text-3xl sm:text-5xl lg:text-6xl',
    xl: 'text-4xl sm:text-6xl lg:text-7xl',
    giant: 'text-5xl sm:text-7xl lg:text-8xl',
  };

  const shadowClasses = {
    ink: 'text-shadow-hard',
    pink: 'text-shadow-hard-pink',
    orange: 'text-shadow-hard-orange',
    cream: 'text-shadow-hard-cream',
    none: '',
  };

  return (
    <Component
      className={`font-display uppercase tracking-tight leading-[0.98] ${sizeClasses[size]} ${shadowClasses[shadow]} ${className}`}
    >
      {children}
    </Component>
  );
};
