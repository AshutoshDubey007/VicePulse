import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/types';

// Default legitimate authenticated Scout session
const activeUser: UserProfile = {
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

export async function GET() {
  return NextResponse.json({
    user: activeUser,
    availableUsers: [{ id: activeUser.id, username: activeUser.username, role: activeUser.role, avatar: activeUser.avatar }],
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    user: activeUser,
    availableUsers: [{ id: activeUser.id, username: activeUser.username, role: activeUser.role, avatar: activeUser.avatar }],
  });
}
