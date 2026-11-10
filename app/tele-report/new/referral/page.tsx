'use client';

import { Suspense } from 'react';
import '../new-request.css';
import './referral.css';
import { ReferralPathPage } from '@/components/referral-path-page';
import { fallbackData } from '@/lib/home-data';

export default function ReferralRoute() {
  return (
    <Suspense fallback={null}>
      <ReferralPathPage footer={fallbackData.footer} />
    </Suspense>
  );
}
