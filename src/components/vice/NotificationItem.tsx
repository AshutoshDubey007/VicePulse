'use client';

import React from 'react';
import Link from 'next/link';
import { InAppNotification } from '@/types';
import { Bell, CheckCircle2, MessageSquare, ShieldCheck, DollarSign, ArrowRight } from 'lucide-react';

interface NotificationItemProps {
  notification: InAppNotification;
  onMarkRead?: (id: string) => void;
  className?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  className = '',
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'confirmation':
        return <CheckCircle2 className="w-4 h-4 text-teal stroke-[2.5px]" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-orange stroke-[2.5px]" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-hot-pink stroke-[2.5px]" />;
      case 'discovery_status':
      default:
        return <ShieldCheck className="w-4 h-4 text-sun stroke-[2.5px]" />;
    }
  };

  return (
    <div
      className={`p-3.5 border-2 font-mono text-xs transition-colors relative ${
        notification.read
          ? 'bg-ink border-ink/40 text-cream/70'
          : 'bg-ink-card border-orange text-cream shadow-[2px_2px_0px_#FF7A3D]'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-ink border border-ink shrink-0">
            {getIcon(notification.type)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cream uppercase">{notification.title}</span>
              {!notification.read && (
                <span className="w-2 h-2 bg-hot-pink rounded-full shrink-0" />
              )}
            </div>
            <p className="font-body text-xs text-cream/80 normal-case leading-snug">
              {notification.message}
            </p>
            <span className="text-[10px] text-cream/40 block pt-0.5">
              {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {notification.link && (
          <Link
            href={notification.link}
            onClick={() => onMarkRead && onMarkRead(notification.id)}
            className="p-1.5 text-orange hover:text-cream hover:bg-ink shrink-0"
            title="Inspect"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
          </Link>
        )}
      </div>
    </div>
  );
};
