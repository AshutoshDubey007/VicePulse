'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, MapPin, PlusCircle, User } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  const items = [
    { href: '/', label: 'HOME', icon: Home },
    { href: '/feed', label: 'DISCOVER', icon: Compass },
    { href: '/map', label: 'MAP', icon: MapPin },
    { href: '/submit', label: 'SUBMIT', icon: PlusCircle, isAction: true },
    { href: '/profile', label: 'PROFILE', icon: User },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ink border-t-3 border-hot-pink pb-[env(safe-area-inset-bottom,0px)] shadow-[0px_-4px_0px_#1A0B2E]"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5 group"
                aria-label="Submit Discovery Intel"
              >
                <div className="w-12 h-12 bg-sun text-ink border-3 border-ink flex items-center justify-center shadow-[3px_3px_0px_#FF4FA0] group-active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 stroke-[3px]" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-sun font-black mt-1">
                  SUBMIT
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-colors ${
                isActive ? 'text-sun' : 'text-cream/60 hover:text-cream'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 stroke-[2.5px]" />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-hot-pink border border-ink" />
                )}
              </div>
              <span className={`font-mono text-[9px] uppercase tracking-wider mt-1 font-bold ${isActive ? 'text-sun' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
