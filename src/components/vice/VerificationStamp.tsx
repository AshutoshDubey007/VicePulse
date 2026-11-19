'use client';

import React from 'react';
import { VerificationStatus } from '@/types';
import { Check } from 'lucide-react';

interface VerificationStampProps {
  status: VerificationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerificationStamp: React.FC<VerificationStampProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const norm = (status || 'unverified').toLowerCase().replace(/\s+/g, '_');

  const getConfig = (s: string) => {
    switch (s) {
      case 'personally_verified':
        return {
          label: 'PERSONALLY VERIFIED',
          bg: 'bg-[#FF4FA0]',
          text: 'text-[#1A0B2E]',
          border: 'border-[#1A0B2E]',
          shadow: 'shadow-[2px_2px_0px_#1A0B2E]',
          hasCheck: true,
        };
      case 'community_verified':
        return {
          label: 'COMMUNITY VERIFIED',
          bg: 'bg-[#19C7B8]',
          text: 'text-[#1A0B2E]',
          border: 'border-[#1A0B2E]',
          shadow: 'shadow-[2px_2px_0px_#1A0B2E]',
          hasCheck: false,
        };
      case 'under_investigation':
        return {
          label: 'UNDER INVESTIGATION',
          bg: 'bg-[#F59E0B]',
          text: 'text-[#1A0B2E]',
          border: 'border-[#1A0B2E]',
          shadow: 'shadow-[2px_2px_0px_#1A0B2E]',
          hasCheck: false,
        };
      case 'disputed':
        return {
          label: 'DISPUTED / UNRELIABLE',
          bg: 'bg-[#EF4444]',
          text: 'text-[#FFF1DC]',
          border: 'border-[#1A0B2E]',
          shadow: 'shadow-[2px_2px_0px_#1A0B2E]',
          hasCheck: false,
        };
      case 'unverified':
      default:
        return {
          label: 'UNVERIFIED INTEL',
          bg: 'bg-[#8B7E9B]',
          text: 'text-[#1A0B2E]',
          border: 'border-[#1A0B2E]',
          shadow: 'shadow-[2px_2px_0px_#1A0B2E]',
          hasCheck: false,
        };
    }
  };

  const config = getConfig(norm);

  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[11px] px-2.5 py-1',
    lg: 'text-xs px-3.5 py-1.5',
  };

  return (
    <span
      role="status"
      aria-label={`Verification status: ${config.label}`}
      className={`inline-flex items-center gap-1 font-mono uppercase font-black tracking-wider border-2 ${config.border} ${config.bg} ${config.text} ${config.shadow} ${sizeClasses[size]} transform -rotate-2 select-none shrink-0 ${className}`}
    >
      {config.hasCheck && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
      <span>{config.label}</span>
    </span>
  );
};
