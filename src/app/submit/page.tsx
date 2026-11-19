import React, { Suspense } from 'react';
import { SubmitClient } from './SubmitClient';

export default function SubmitPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink flex items-center justify-center font-mono text-xs text-orange">
          LOADING INTAKE INTERFACE...
        </div>
      }
    >
      <SubmitClient />
    </Suspense>
  );
}
