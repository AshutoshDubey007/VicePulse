'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Compass, 
  MapPin, 
  Car, 
  Newspaper,
  User, 
  PlusCircle, 
  Flame, 
  Radio, 
  Bookmark, 
  Settings, 
  Sparkles,
  ChevronDown,
  LogOut,
  CreditCard
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { CommandPalette } from './vice/CommandPalette';
import { UserProfile } from '@/types';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);
  }, []);

  // 5 Essential Main Navigation Links as specified in Section 4
  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/feed', label: 'DISCOVER' },
    { href: '/map', label: 'MAP' },
    { href: '/vehicles', label: 'VEHICLES' },
    { href: '/news', label: 'NEWS' },
  ];

  // Mobile Bottom Navigation Bar Links
  const mobileBottomLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/feed', label: 'Discover', icon: Compass },
    { href: '/map', label: 'Map', icon: MapPin },
    { href: '/vehicles', label: 'Vehicles', icon: Car },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Top Desktop Navigation */}
      <header className="sticky top-0 z-40 bg-[#111114]/95 backdrop-blur-sm border-b border-[#28272F] select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-8 h-8 bg-orange text-ink flex items-center justify-center font-display text-xl font-black rounded-sm transition-transform group-hover:scale-105">
                  VP
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-2xl tracking-tight text-cream group-hover:text-orange transition-colors leading-none">
                    VICE<span className="text-orange">PULSE</span>
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted font-bold">
                    LEONIDA DISCOVERY
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: 5 Essential Links */}
            <nav className="hidden md:flex items-center space-x-1 font-mono text-xs uppercase font-bold tracking-wider">
              {navLinks.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1C1B20] text-cream border border-[#28272F]'
                        : 'text-muted hover:text-cream hover:bg-[#1C1B20]/60'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search, Notifications, Profile Dropdown */}
            <div className="flex items-center gap-2.5">
              
              {/* Command Palette / Search Trigger */}
              <CommandPalette />

              {/* Notification Center */}
              <NotificationCenter />

              {/* User Dropdown with Secondary Features */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-[#1C1B20] border border-[#28272F] rounded-sm text-cream hover:border-orange/50 transition-colors font-mono text-xs"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-5 h-5 bg-orange text-ink rounded-xs flex items-center justify-center font-display text-xs font-bold">
                    {currentUser?.username?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <span className="hidden sm:inline font-medium text-cream max-w-[100px] truncate">
                    {currentUser?.username || 'Scout'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-[#1C1B20] border border-[#28272F] rounded-sm shadow-xl z-50 p-1.5 space-y-0.5 font-mono text-xs uppercase"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-cream hover:bg-[#28272F] rounded-sm transition-colors"
                    >
                      <User className="w-4 h-4 text-orange" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/submit"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-cream hover:bg-[#28272F] rounded-sm transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-sun" />
                      <span>Submit Recon</span>
                    </Link>

                    <Link
                      href="/trending"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-cream hover:bg-[#28272F] rounded-sm transition-colors"
                    >
                      <Flame className="w-4 h-4 text-hot-pink" />
                      <span>Trending Intel</span>
                    </Link>

                    <Link
                      href="/sources"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-cream hover:bg-[#28272F] rounded-sm transition-colors"
                    >
                      <Radio className="w-4 h-4 text-teal" />
                      <span>Community Feeds</span>
                    </Link>

                    <Link
                      href="/billing"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-cream hover:bg-[#28272F] rounded-sm transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-orange" />
                      <span>Syndicate Pro</span>
                    </Link>

                    <Link
                      href="/settings/notifications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-cream hover:bg-[#28272F] rounded-sm transition-colors"
                    >
                      <Settings className="w-4 h-4 text-muted" />
                      <span>Notifications</span>
                    </Link>

                    <div className="border-t border-[#28272F] my-1" />

                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-hot-pink hover:bg-[#28272F] rounded-sm transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Admin Desk</span>
                    </Link>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Section 4) */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#111114]/98 backdrop-blur-md border-t border-[#28272F] px-2 py-1.5"
      >
        <div className="flex items-center justify-around">
          {mobileBottomLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-sm transition-colors ${
                  isActive ? 'text-orange font-bold' : 'text-muted hover:text-cream'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                <span className="text-[10px] font-mono tracking-wider mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
