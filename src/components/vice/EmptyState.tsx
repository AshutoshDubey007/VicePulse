'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing discovered yet.',
  description = 'VicePulse is scanning the internet for new discoveries. Reports will appear here when real information is collected.',
  actionText,
  actionHref,
  onAction,
  className = '',
}) => {
  return (
    <div
      role="status"
      className={`bg-[#1C1B20] border border-[#28272F] rounded-sm p-8 sm:p-12 text-center space-y-5 max-w-lg mx-auto ${className}`}
    >
      <div className="w-12 h-12 mx-auto rounded-full bg-[#111114] border border-[#28272F] flex items-center justify-center text-orange">
        <Compass className="w-6 h-6 stroke-[1.75px]" />
      </div>

      <div className="space-y-2">
        <h3 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
          {title}
        </h3>
        <p className="font-body text-sm text-[#9B969F] max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      {actionText && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange text-ink font-mono text-xs uppercase font-bold rounded-sm hover:opacity-90 transition-opacity"
            >
              <span>{actionText}</span>
            </Link>
          ) : onAction ? (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange text-ink font-mono text-xs uppercase font-bold rounded-sm hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{actionText}</span>
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
