'use client';

import React from 'react';
import Link from 'next/link';

export type PosterButtonVariant = 'sun' | 'pink' | 'orange' | 'teal' | 'outline' | 'ghost';
export type PosterButtonSize = 'sm' | 'md' | 'lg';

interface PosterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PosterButtonVariant;
  size?: PosterButtonSize;
  href?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PosterButton: React.FC<PosterButtonProps> = ({
  variant = 'sun',
  size = 'md',
  href,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-mono uppercase font-black tracking-widest border-3 transition-transform duration-100 ease-out select-none active:translate-x-0.5 active:translate-y-0.5 focus-visible:outline-3 focus-visible:outline-sun focus-visible:outline-offset-2';

  const sizeClasses = {
    sm: 'text-[11px] px-3 py-1.5 min-h-[36px]',
    md: 'text-xs px-5 py-2.5 min-h-[44px]',
    lg: 'text-sm px-7 py-3.5 min-h-[52px]',
  };

  const variantClasses = {
    sun: 'bg-sun hover:bg-sun-hover text-ink border-ink shadow-[4px_4px_0px_#1A0B2E]',
    pink: 'bg-hot-pink hover:bg-hot-pink-hover text-ink border-ink shadow-[4px_4px_0px_#FFE066]',
    orange: 'bg-orange hover:bg-orange-hover text-ink border-ink shadow-[4px_4px_0px_#1A0B2E]',
    teal: 'bg-teal hover:bg-teal-hover text-ink border-ink shadow-[4px_4px_0px_#1A0B2E]',
    outline: 'bg-transparent text-cream hover:bg-cream hover:text-ink border-cream shadow-[4px_4px_0px_#FF7A3D]',
    ghost: 'bg-transparent text-cream/80 hover:text-cream hover:bg-ink-card border-transparent shadow-none',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed shadow-none active:translate-x-0 active:translate-y-0' : '';

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClasses}>
        {icon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button disabled={disabled} className={combinedClasses} {...props}>
      {icon}
      <span>{children}</span>
    </button>
  );
};
