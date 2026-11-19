'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserProfile, Discovery } from '@/types';
import { DiscoveryCard } from '@/components/DiscoveryCard';
import { EmptyState } from '@/components/vice/EmptyState';
import { 
  User, 
  PlusCircle, 
  Calendar, 
  MapPin, 
  CheckCircle2,
  FileText
} from 'lucide-react';

interface ProfileClientProps {
  initialUser: UserProfile;
  userDiscoveries: Discovery[];
}

export const ProfileClient: React.FC<ProfileClientProps> = ({ initialUser, userDiscoveries }) => {
  const [user] = useState<UserProfile>(initialUser);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 font-body text-[#F4F0E8] min-h-screen">
      
      {/* Profile Header Dossier */}
      <div className="bg-[#1C1B20] border border-[#28272F] rounded-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#111114] border border-[#28272F] flex items-center justify-center font-display text-2xl font-bold text-orange">
              {user.username?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl uppercase tracking-tight text-[#F4F0E8]">
                  {user.username}
                </h1>
                <span className="font-mono text-[10px] uppercase font-bold text-orange px-2 py-0.5 bg-[#111114] border border-[#28272F] rounded-xs">
                  {user.role}
                </span>
              </div>
              <p className="font-body text-xs text-[#9B969F] mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          <Link
            href="/submit"
            className="px-4 py-2 bg-orange text-ink font-mono text-xs uppercase font-bold rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Discovery</span>
          </Link>
        </div>

        {user.bio && (
          <p className="font-body text-xs sm:text-sm text-[#F4F0E8]/90 leading-relaxed border-t border-[#28272F] pt-4">
            {user.bio}
          </p>
        )}

        {/* Real Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs border-t border-[#28272F] pt-4">
          <div className="p-3 bg-[#111114] border border-[#28272F] rounded-xs">
            <span className="text-[#9B969F] block text-[10px] uppercase">Submissions</span>
            <span className="text-[#F4F0E8] text-base font-bold">{userDiscoveries.length}</span>
          </div>
          <div className="p-3 bg-[#111114] border border-[#28272F] rounded-xs">
            <span className="text-[#9B969F] block text-[10px] uppercase">Role Rank</span>
            <span className="text-orange text-base font-bold capitalize">{user.role}</span>
          </div>
          <div className="p-3 bg-[#111114] border border-[#28272F] rounded-xs col-span-2 sm:col-span-1">
            <span className="text-[#9B969F] block text-[10px] uppercase">Active Since</span>
            <span className="text-[#F4F0E8] text-base font-bold">{user.joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="space-y-4">
        <div className="border-b border-[#28272F] pb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl uppercase tracking-tight text-[#F4F0E8]">
            Your Submissions ({userDiscoveries.length})
          </h2>
        </div>

        {userDiscoveries.length === 0 ? (
          <EmptyState
            title="No submissions logged yet."
            description="When you submit new discoveries or field recon reports, they will be archived here."
            actionText="Submit Discovery"
            actionHref="/submit"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {userDiscoveries.map((discovery) => (
              <DiscoveryCard key={discovery.id || discovery.slug} discovery={discovery} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
