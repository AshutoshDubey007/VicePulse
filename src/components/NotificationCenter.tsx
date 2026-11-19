'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { InAppNotification } from '@/types';
import { Bell, Check, X, ShieldCheck, CreditCard, MessageSquare, Compass } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?userId=usr-1');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userId: 'usr-1' }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkOneRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, userId: 'usr-1' }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discovery_status':
        return <ShieldCheck className="w-3.5 h-3.5 text-teal stroke-[2.5px]" />;
      case 'payment':
        return <CreditCard className="w-3.5 h-3.5 text-orange stroke-[2.5px]" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-hot-pink stroke-[2.5px]" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-sun stroke-[2.5px]" />;
    }
  };

  return (
    <div className="relative font-body">
      {/* Bell Button with Hard Shadow */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-cream hover:text-sun transition-all flex items-center justify-center bg-ink-card border-2 border-ink shadow-[2px_2px_0px_#1A0B2E]"
        title="Reconnaissance Notifications"
      >
        <Bell className="w-4 h-4 stroke-[2.5px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange text-ink font-mono text-[9px] font-black border border-ink flex items-center justify-center shadow-[1px_1px_0px_#FF4FA0]">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Pane */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-ink-card border-3 border-ink shadow-[6px_6px_0px_#1A0B2E] z-50 overflow-hidden">
          
          {/* Header */}
          <div className="bg-ink px-4 py-3 border-b-2 border-ink flex items-center justify-between font-mono text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-hot-pink animate-pulse" />
              <span className="text-cream uppercase">RECON DISPATCHES</span>
              {unreadCount > 0 && (
                <span className="text-[10px] text-sun font-black">({unreadCount} NEW)</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-teal hover:underline font-black uppercase"
                >
                  Mark All Read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-cream/60 hover:text-cream"
              >
                <X className="w-4 h-4 stroke-[2.5px]" />
              </button>
            </div>
          </div>

          {/* List of Dispatches */}
          <div className="max-h-96 overflow-y-auto divide-y-2 divide-ink">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-cream/60 uppercase font-bold">
                NO PENDING TELEMETRY ALERTS
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkOneRead(notif.id)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                    notif.read ? 'bg-ink/50 opacity-80' : 'bg-ink font-bold'
                  } hover:bg-ink-border`}
                >
                  <div className="p-1.5 bg-ink-card border border-ink shrink-0 mt-0.5 shadow-[1px_1px_0px_#1A0B2E]">
                    {getTypeIcon(notif.type)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-orange font-black uppercase">{notif.title}</span>
                      <span className="text-cream/50">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-xs text-cream/90 font-body leading-snug">
                      {notif.message}
                    </p>

                    {notif.link && (
                      <Link
                        href={notif.link}
                        onClick={() => setIsOpen(false)}
                        className="inline-block text-[10px] font-mono text-teal hover:text-sun underline font-black uppercase pt-0.5"
                      >
                        VIEW INTEL RECORD →
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          <div className="bg-ink p-2.5 border-t-2 border-ink text-center">
            <Link
              href="/settings/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-mono text-cream/70 hover:text-sun uppercase font-bold"
            >
              Configure Notification Wire Preferences →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
