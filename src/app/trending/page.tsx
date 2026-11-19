import React from 'react';
import { store } from '@/lib/store';
import { TrendingClient } from './TrendingClient';

export const revalidate = 0;

export default async function TrendingPage() {
  const result = await store.getDiscoveries({ limit: 40 });

  return <TrendingClient initialDiscoveries={result.items} />;
}
