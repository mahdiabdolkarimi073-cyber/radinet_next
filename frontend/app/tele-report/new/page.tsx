'use client';

import './new-request.css';
import { TeleReportRequestPage } from '@/components/tele-report-request-page';
import { fallbackData } from '@/lib/home-data';

export default function NewRequestRoute() {
  return <TeleReportRequestPage footer={fallbackData.footer} />;
}
