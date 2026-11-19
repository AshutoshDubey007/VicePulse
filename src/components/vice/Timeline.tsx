'use client';

import React from 'react';
import { VerificationStamp } from './VerificationStamp';
import { VerificationStatus } from '@/types';

export interface TimelineEvent {
  id: string;
  status: VerificationStatus;
  title: string;
  timestamp: string;
  author: string;
  notes: string;
  sourceUrl?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  className = '',
}) => {
  return (
    <div className={`space-y-4 font-mono ${className}`}>
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-ink">
        {events.map((event) => (
          <div key={event.id} className="relative group">
            {/* Square Node Marker */}
            <span className="absolute -left-6 sm:-left-8 top-1.5 w-3.5 h-3.5 bg-orange border-2 border-ink shadow-[1px_1px_0px_#1A0B2E]" />

            {/* Event Box */}
            <div className="bg-ink border-2 border-ink p-3.5 space-y-2 shadow-[2px_2px_0px_#1A0B2E]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/40 pb-2">
                <VerificationStamp status={event.status} size="sm" />
                <span className="text-[10px] text-cream/60">
                  {new Date(event.timestamp).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs uppercase font-black text-cream">
                  {event.title}
                </h4>
                <p className="text-[11px] font-body text-cream/80 normal-case leading-relaxed">
                  {event.notes}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-cream/50 pt-1">
                <span>LOGGED BY: {event.author.toUpperCase()}</span>
                {event.sourceUrl && (
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange hover:underline font-bold"
                  >
                    VIEW CITATION &rarr;
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
