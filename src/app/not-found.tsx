import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Compass, MapPin, ArrowRight, Home, Car } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found (404) – VicePulse',
  description: 'The requested reconnaissance target or coordinate sector does not exist in the VicePulse database.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center bg-[#111114] text-[#F4F0E8] font-body">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-full bg-orange/10 border-2 border-orange text-orange flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs text-orange uppercase font-bold tracking-widest">
            ERROR 404 // TARGET LOST
          </span>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#F4F0E8]">
            SECTOR NOT FOUND
          </h1>
          <p className="font-body text-xs sm:text-sm text-[#9B969F] leading-relaxed">
            The discovery or intelligence report you requested could not be located in the VicePulse database. It may have been relocated or updated.
          </p>
        </div>

        <div className="pt-4 grid grid-cols-2 gap-3 text-left font-mono text-xs">
          <Link
            href="/"
            className="p-3 bg-[#1C1B20] border border-[#28272F] hover:border-orange rounded-xs flex items-center gap-2 group transition-colors"
          >
            <Home className="w-4 h-4 text-orange" />
            <span className="text-[#F4F0E8] group-hover:text-orange font-bold uppercase">Home Base</span>
          </Link>
          <Link
            href="/map"
            className="p-3 bg-[#1C1B20] border border-[#28272F] hover:border-orange rounded-xs flex items-center gap-2 group transition-colors"
          >
            <MapPin className="w-4 h-4 text-orange" />
            <span className="text-[#F4F0E8] group-hover:text-orange font-bold uppercase">Leonida Map</span>
          </Link>
          <Link
            href="/discoveries"
            className="p-3 bg-[#1C1B20] border border-[#28272F] hover:border-orange rounded-xs flex items-center gap-2 group transition-colors"
          >
            <Compass className="w-4 h-4 text-orange" />
            <span className="text-[#F4F0E8] group-hover:text-orange font-bold uppercase">Discoveries</span>
          </Link>
          <Link
            href="/vehicles"
            className="p-3 bg-[#1C1B20] border border-[#28272F] hover:border-orange rounded-xs flex items-center gap-2 group transition-colors"
          >
            <Car className="w-4 h-4 text-orange" />
            <span className="text-[#F4F0E8] group-hover:text-orange font-bold uppercase">Rare Vehicles</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
