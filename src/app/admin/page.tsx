import React from 'react';
import { store } from '@/lib/store';
import { paymentService } from '@/lib/payments/service';
import { AdminClient } from './AdminClient';

export const revalidate = 0;

export default async function AdminPage() {
  const [discoveriesResult, sources, payments] = await Promise.all([
    store.getDiscoveries({ limit: 100 }),
    store.getSources(),
    paymentService.getAllPayments(),
  ]);

  return (
    <AdminClient
      initialDiscoveries={discoveriesResult.items}
      initialSources={sources}
      initialPayments={payments}
    />
  );
}
