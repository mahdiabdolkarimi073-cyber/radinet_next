import './tele-report.css';
import { TeleReportPage } from '@/components/tele-report-page';
import { fallbackData } from '@/lib/home-data';

export const metadata = {
  title: 'تله‌ریپورت رادینت | گزارش هوشمند تصویربرداری پزشکی',
  description: 'گزارش هوشمند تصویربرداری پزشکی با هوش مصنوعی در رادینت',
};

export default function TeleReportRoute() {
  return <TeleReportPage footer={fallbackData.footer} />;
}
