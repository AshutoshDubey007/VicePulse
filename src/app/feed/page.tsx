import React from 'react';
import { store } from '@/lib/store';
import { FeedClient } from './FeedClient';

export const revalidate = 0;

export default async function FeedPage() {
  const result = await store.getDiscoveries({ limit: 50 });

  return <FeedClient initialDiscoveries={result.items} />;
}
