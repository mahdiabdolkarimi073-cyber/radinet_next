import './tele-report.css';
import { TeleReportPage } from '@/components/tele-report-page';
import { fallbackData } from '@/lib/home-data';
import { getTeleReportData } from '@/lib/tele-report-data';

export const metadata = {
  title: 'تله‌ریپورت رادینت | گزارش هوشمند تصویربرداری پزشکی',
  description: 'گزارش هوشمند تصویربرداری پزشکی با هوش مصنوعی در رادینت',
};

export const revalidate = 30;

export default async function TeleReportRoute() {
  const data = await getTeleReportData();
  return <TeleReportPage footer={fallbackData.footer} data={data} />;
}
