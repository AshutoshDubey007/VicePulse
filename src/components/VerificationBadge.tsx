import React from 'react';
import { VerificationStatus } from '@/types';
import { ShieldCheck, Search, HelpCircle, UserCheck, AlertTriangle } from 'lucide-react';

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  // Flat GTA tabloid stamp configurations
  const configs = {
    unverified: {
      label: 'UNVERIFIED',
      icon: HelpCircle,
      bg: 'bg-sun',
      text: 'text-ink',
      border: 'border-ink',
    },
    reported: {
      label: 'REPORTED',
      icon: HelpCircle,
      bg: 'bg-sun/80',
      text: 'text-ink',
      border: 'border-ink',
    },
    under_investigation: {
      label: 'UNDER INVESTIGATION',
      icon: Search,
      bg: 'bg-orange',
      text: 'text-ink',
      border: 'border-ink',
    },
    corroborated: {
      label: 'CORROBORATED',
      icon: ShieldCheck,
      bg: 'bg-teal/80',
      text: 'text-ink',
      border: 'border-ink',
    },
    community_verified: {
      label: 'COMMUNITY VERIFIED',
      icon: ShieldCheck,
      bg: 'bg-teal',
      text: 'text-ink',
      border: 'border-ink',
    },
    personally_verified: {
      label: 'PERSONALLY VERIFIED',
      icon: UserCheck,
      bg: 'bg-hot-pink',
      text: 'text-cream',
      border: 'border-ink',
    },
    disputed: {
      label: 'DISPUTED',
      icon: AlertTriangle,
      bg: 'bg-red-500',
      text: 'text-cream',
      border: 'border-ink',
    },
  };

  const current = configs[status] || configs.unverified;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 tracking-wider gap-1 border-[1.5px]',
    md: 'text-[11px] px-2 py-0.5 tracking-wider gap-1.5 border-2',
    lg: 'text-xs px-3 py-1 tracking-widest gap-2 border-2',
  }[size];

  const iconSizes = {
    sm: 'w-2.5 h-2.5 stroke-[2.5px]',
    md: 'w-3 h-3 stroke-[2.5px]',
    lg: 'w-3.5 h-3.5 stroke-[2.5px]',
  }[size];

  return (
    <span
      className={`inline-flex items-center uppercase font-mono font-bold select-none rotate-[-2deg] rounded-none shadow-[2px_2px_0px_#1A0B2E] transition-transform hover:rotate-0 ${current.bg} ${current.text} ${current.border} ${sizeClasses} ${className}`}
      title={`Verification status: ${current.label}`}
    >
      <Icon className={iconSizes} />
      {showLabel && <span className="font-mono tracking-wider font-extrabold">{current.label}</span>}
    </span>
  );
};
