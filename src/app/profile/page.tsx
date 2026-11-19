import React from 'react';
import { store } from '@/lib/store';
import { ProfileClient } from './ProfileClient';
import { UserProfile } from '@/types';

export const revalidate = 0;

export default async function ProfilePage() {
  const user: UserProfile = {
    id: 'usr_active_scout',
    username: 'FieldScout',
    email: 'scout@vicepulse.net',
    role: 'scout',
    avatar: '/images/hero/vice-city-hero.webp',
    bio: 'Leonida field scout documenting world discoveries and coordinates.',
    reputation: 10,
    badges: [],
    contributionsCount: 0,
    verifiedCount: 0,
    joinedDate: '2026-01-01',
    submittedDiscoveryIds: [],
    confirmedDiscoveryIds: [],
  };

  const discoveriesResult = await store.getDiscoveries({ limit: 50 });
  const userDiscoveries = discoveriesResult.items.filter(
    (d) => d.submittedBy?.username === user.username || d.submittedBy?.id === user.id
  );

  return <ProfileClient initialUser={user} userDiscoveries={userDiscoveries} />;
}
